import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* ─── Design tokens ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  .profile-root { font-family: 'Instrument Sans', sans-serif; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(.97); }       to { opacity:1; transform:scale(1); }     }
  @keyframes shimmerX { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
  @keyframes fadeIn   { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes modalIn  { from { opacity:0; transform:scale(.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes spin2    { to { transform:rotate(360deg); } }

  .inp-field {
    width:100%; padding:11px 14px; border-radius:12px;
    background:#f8fafc; border:1.5px solid #e2e8f0;
    color:#0F172A; font-size:.88rem; outline:none;
    transition:border-color .2s, box-shadow .2s;
    font-family:'Instrument Sans',sans-serif; box-sizing:border-box;
  }
  .inp-field:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.12); }
  .inp-field:read-only { opacity:.55; cursor:not-allowed; background:#f1f5f9; }
  .inp-field::placeholder { color:#94a3b8; }

  .section-card {
    background:#fff; border:1.5px solid #f1f5f9;
    border-radius:22px; padding:26px;
    box-shadow:0 2px 12px rgba(0,0,0,.04);
    animation: fadeUp .4s ease both;
  }

  .mode-card { transition:all .18s; cursor:pointer; }
  .mode-card:hover { transform:translateY(-1px); }

  .mat-label { transition:all .15s; cursor:pointer; }
  .mat-label:hover { transform:translateX(2px); }

  .action-pill { transition:all .18s; }
  .action-pill:hover { transform:translateX(3px); }

  .save-btn { transition:all .25s; }
  .save-btn:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,21,61,.25) !important; }

  .cert-row { transition:background .15s; }
  .cert-row:hover { background:rgba(59,130,246,.04) !important; }

  .avatar-overlay { opacity:0; transition:opacity .2s; }
  .avatar-wrap:hover .avatar-overlay { opacity:1; }
`;

function injectCSS() {
  if (typeof document !== 'undefined' && !document.getElementById('profile-css')) {
    const s = document.createElement('style'); s.id='profile-css'; s.textContent=CSS;
    document.head.appendChild(s);
  }
}

const VILLES = ['Tunis','Sfax','Sousse','Monastir','Nabeul','Bizerte','Kairouan','Ariana','Ben Arous','Mahdia'];
const MODES = [
  { value:'en_ligne',   label:'En ligne',   emoji:'🌐', desc:'Via Google Meet, Zoom…',  color:'#3b82f6', bg:'rgba(59,130,246,.08)',  border:'rgba(59,130,246,.25)' },
  { value:'presentiel', label:'Présentiel', emoji:'🏫', desc:'Cours en face à face',     color:'#10b981', bg:'rgba(16,185,129,.08)',  border:'rgba(16,185,129,.25)' },
  { value:'les_deux',   label:'Les deux',   emoji:'🔀', desc:'En ligne & présentiel',    color:'#8b5cf6', bg:'rgba(139,92,246,.08)', border:'rgba(139,92,246,.25)' },
];
const NIVEAUX_ACADEMIQUES = [
  { key:'Primaire',   icon:'📚', desc:'École primaire (1ère–6ème)'  },
  { key:'Collège',    icon:'📖', desc:'7ème–9ème année de base'      },
  { key:'Lycée',      icon:'🎒', desc:'1ère, 2ème, 3ème secondaire'  },
  { key:'Université', icon:'🎓', desc:'Licence, Master, Doctorat'    },
];

// Hiérarchie fixe — noms EXACTS du référentiel (après migration)
const NIVEAUX_HIERARCHIE = {
  'Primaire': [
    '1ère année primaire',
    '2ème année primaire',
    '3ème année primaire',
    '4ème année primaire',
    '5ème année primaire',
    '6ème année primaire',
  ],
  'Collège': [
    '7ème année',
    '8ème année',
    '9ème année',
  ],
  'Lycée': [
    '1ère année Lycée',
    '2ème année Lycée',
    '3ème année Lycée',
    'Baccalauréat',
  ],
};

// Groupes visuels pour l'affichage dans Mes Enseignements
const GROUPES_NIVEAUX = [
  { key:'Primaire', icon:'📚', color:'#10b981', bg:'#ECFDF5', border:'#6EE7B7', desc:'1ère → 6ème année' },
  { key:'Collège',  icon:'📖', color:'#3b82f6', bg:'#EFF6FF', border:'#BFDBFE', desc:'7ème → 9ème année' },
  { key:'Lycée',    icon:'🎒', color:'#8b5cf6', bg:'#F5F3FF', border:'#DDD6FE', desc:'Secondaire & Bac'  },
];

function StatutBadge({ statut }) {
  const cfg = {
    en_attente: { bg:'rgba(245,158,11,.1)',  color:'#d97706', label:'⏳ En attente' },
    approuvé:   { bg:'rgba(16,185,129,.1)',  color:'#059669', label:'✅ Approuvée'  },
    refusé:     { bg:'rgba(239,68,68,.1)',   color:'#dc2626', label:'❌ Refusée'    },
  }[statut] || { bg:'#f8fafc', color:'#94a3b8', label: statut };
  return <span style={{ fontSize:'.7rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:cfg.bg, color:cfg.color }}>{cfg.label}</span>;
}

function Field({ label, icon, children, hint }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.72rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:7 }}>
        {icon && <span style={{ fontSize:'.85rem' }}>{icon}</span>}
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize:'.71rem', color:'#94a3b8', marginTop:5, display:'flex', alignItems:'center', gap:4 }}><span>ℹ️</span>{hint}</div>}
    </div>
  );
}

function Section({ title, children, action, delay = 0 }) {
  return (
    <div className="section-card" style={{ animationDelay:`${delay}ms` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, paddingBottom:14, borderBottom:'1px solid #f1f5f9' }}>
        <h3 style={{ fontFamily:'Cabinet Grotesk, sans-serif', margin:0, fontSize:'1rem', fontWeight:900, color:'#0F172A' }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.7)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:'#fff', padding:28, borderRadius:24, width:'100%', maxWidth:460, border:'1.5px solid #f1f5f9', boxShadow:'0 32px 80px rgba(0,0,0,.18)', animation:'modalIn .25s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ margin:0, fontFamily:'Cabinet Grotesk, sans-serif', fontSize:'1.05rem', fontWeight:900, color:'#0F172A' }}>{title}</h3>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:'#f8fafc', border:'1.5px solid #e2e8f0', cursor:'pointer', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', transition:'all .15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#fee2e2';e.currentTarget.style.color='#dc2626';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#f8fafc';e.currentTarget.style.color='#64748b';}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AvatarUpload({ photoUrl, nom, prenom, role, onUpload }) {
  const [preview, setPreview]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging]   = useState(false);
  const inputRef = useRef(null);

  const initials   = `${(prenom||'')[0]||''}${(nom||'')[0]||''}`.toUpperCase();
  const displaySrc = preview || (photoUrl ? `http://localhost:8001${photoUrl}` : null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const route = role==='professeur' ? '/api/professeurs/me/photo' : '/api/etudiants/me/photo';
      const res = await api.post(route, fd, { headers:{'Content-Type':'multipart/form-data'} });
      onUpload?.(res.data.url);
    } catch { setPreview(null); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
      <div className="avatar-wrap" style={{ position:'relative', cursor:'pointer' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}}>
        <div style={{ padding:2, borderRadius:'50%', background: dragging ? 'conic-gradient(from 0deg,#3b82f6,#8b5cf6,#06b6d4,#3b82f6)' : 'conic-gradient(from 0deg,#00153D,#3b82f6,#8b5cf6,#00153D)' }}>
          <div style={{ width:108, height:108, borderRadius:'50%', background:'linear-gradient(135deg,#00153D,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:800, color:'#fff', overflow:'hidden' }}>
            {displaySrc ? <img src={displaySrc} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (initials || '👤')}
          </div>
        </div>
        <div className="avatar-overlay" style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,21,61,.6)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:'1.3rem' }}>{uploading ? '' : '📷'}</span>
          {uploading
            ? <div style={{ width:20, height:20, border:'3px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin2 .8s linear infinite', marginTop:4 }} />
            : <span style={{ fontSize:'.58rem', color:'#fff', fontWeight:700, marginTop:3 }}>Modifier</span>}
        </div>
        <div style={{ position:'absolute', bottom:4, right:4, width:28, height:28, borderRadius:'50%', background:'#00153D', border:'2.5px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', boxShadow:'0 2px 8px rgba(0,21,61,.3)' }}>📷</div>
      </div>
      <input ref={inputRef} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={e=>handleFile(e.target.files[0])} />
      <div style={{ fontSize:'.68rem', color:'#94a3b8', textAlign:'center', lineHeight:1.5 }}>
        JPG, PNG · Max 5 MB<br/>Glisser-déposer accepté
      </div>
    </div>
  );
}

function NiveauSelector({ value, onChange }) {
  const [type, setType] = useState(() => {
    if (!value) return '';
    return value === 'Professionnel' ? 'professionnel' : 'academique';
  });

  useEffect(() => {
    if (!value) return;
    setType(value === 'Professionnel' ? 'professionnel' : 'academique');
  }, [value]);

  const handleType = (t) => {
    setType(t);
    if (t === 'professionnel') onChange('Professionnel');
    else if (value === 'Professionnel') onChange('');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[
          { key:'academique',    icon:'🎓', label:'Académique',    desc:'Primaire → Université', color:'#3b82f6', bg:'rgba(59,130,246,.08)',  border:'rgba(59,130,246,.3)'  },
          { key:'professionnel', icon:'💼', label:'Professionnel', desc:'Adulte / Reconversion',  color:'#f59e0b', bg:'rgba(245,158,11,.08)', border:'rgba(245,158,11,.3)' },
        ].map(t => {
          const active = type === t.key;
          return (
            <div key={t.key} onClick={() => handleType(t.key)} style={{ padding:'14px', borderRadius:14, cursor:'pointer', border: active ? `2px solid ${t.color}` : '1.5px solid #e2e8f0', background: active ? t.bg : '#f8fafc', transition:'all .18s', boxShadow: active ? `0 4px 14px ${t.border}` : 'none' }}>
              <div style={{ fontSize:'1.4rem', marginBottom:6 }}>{t.icon}</div>
              <div style={{ fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, fontSize:'.85rem', color: active ? t.color : '#0F172A', marginBottom:2 }}>{t.label}</div>
              <div style={{ fontSize:'.68rem', color:'#94a3b8' }}>{t.desc}</div>
              {active && <div style={{ marginTop:7, display:'inline-flex', alignItems:'center', gap:4, fontSize:'.65rem', fontWeight:800, color:t.color, background:`rgba(${t.color.includes('3b82')? '59,130,246':'245,158,11'},.12)`, padding:'2px 8px', borderRadius:20 }}>✓ Choisi</div>}
            </div>
          );
        })}
      </div>

      {type === 'academique' && (
        <div style={{ padding:14, background:'rgba(59,130,246,.04)', border:'1.5px solid rgba(59,130,246,.15)', borderRadius:14, animation:'fadeIn .2s ease' }}>
          <div style={{ fontSize:'.68rem', fontWeight:800, color:'#3b82f6', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>📌 Niveau précis</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {NIVEAUX_ACADEMIQUES.map(n => {
              const active = value === n.key;
              return (
                <button key={n.key} type="button" onClick={() => onChange(active ? '' : n.key)} style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 13px', borderRadius:12, cursor:'pointer', border: active ? '2px solid #3b82f6' : '1.5px solid #e2e8f0', background: active ? 'rgba(59,130,246,.12)' : '#fff', color: active ? '#3b82f6' : '#0F172A', fontWeight: active ? 700 : 500, fontSize:'.82rem', transition:'all .15s', textAlign:'left', boxShadow: active ? '0 2px 12px rgba(59,130,246,.2)' : 'none' }}>
                  <span style={{ fontSize:'1rem' }}>{n.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:active?800:600, fontSize:'.8rem' }}>{n.key}</div>
                    <div style={{ fontSize:'.62rem', color:'#94a3b8', marginTop:1 }}>{n.desc}</div>
                  </div>
                  {active && <div style={{ width:16, height:16, borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.55rem', color:'#fff', flexShrink:0 }}>✓</div>}
                </button>
              );
            })}
          </div>
          {value && value !== 'Professionnel' && (
            <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'rgba(59,130,246,.07)', border:'1px solid rgba(59,130,246,.15)', borderRadius:10 }}>
              <span style={{ fontSize:'.85rem' }}>🎓</span>
              <span style={{ fontSize:'.75rem', color:'#64748b' }}>Niveau :</span>
              <span style={{ fontSize:'.78rem', fontWeight:700, color:'#3b82f6', flex:1 }}>{value}</span>
              <button type="button" onClick={() => onChange('')} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'.75rem', lineHeight:1 }}>✕</button>
            </div>
          )}
        </div>
      )}

      {type === 'professionnel' && (
        <div style={{ padding:'12px 14px', background:'rgba(245,158,11,.06)', border:'1.5px solid rgba(245,158,11,.2)', borderRadius:12, display:'flex', alignItems:'center', gap:10, animation:'fadeIn .2s ease' }}>
          <span style={{ fontSize:'1.1rem' }}>💼</span>
          <div>
            <div style={{ fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, fontSize:'.82rem', color:'#d97706' }}>Profil professionnel</div>
            <div style={{ fontSize:'.72rem', color:'#92400e', marginTop:2, opacity:.8 }}>Contenus adaptés aux adultes en activité.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    user_prenom:'', user_nom:'', email:'', ville:'', bio:'', telephone:'',
    niveau:'', tarifs_matieres:[], certificats:[], photo_url:null,
    mode_enseignement:'presentiel', tarif_en_ligne:'', tarif_presentiel:'',
  });
  const [structure, setStructure]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [demandes, setDemandes]     = useState([]);

  const [openGroupe, setOpenGroupe]               = useState({});
  const [showCertModal, setShowCertModal]         = useState(false);
  const [newCert, setNewCert]                     = useState({ titre:'' });
  const [selectedFile, setSelectedFile]           = useState(null);
  const [showDemandeModal, setShowDemandeModal]   = useState(false);
  const [newDemande, setNewDemande]               = useState({ nom_matiere:'', niveau_id:'' });
  const [submittingDemande, setSubmittingDemande] = useState(false);

  // ── Modal confirmation custom ──
  const [confirmModal, setConfirmModal] = useState(null); // { title, subtitle, icon, onConfirm }
  const [soumettre, setSoumettre]       = useState(false);
  const [soumettreLoading, setSoumettreLoading] = useState(false);

  useEffect(() => { injectCSS(); }, []);
  useEffect(() => { fetchProfileData(); }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    try {
      const route = user.role==='professeur' ? '/api/professeurs/me' : user.role==='étudiant' ? '/api/etudiants/me' : '/api/auth/me';
      const reqs  = [api.get(route), api.get('/api/admin/referentiel/structure')];
      if (user.role==='professeur') reqs.push(api.get('/api/professeurs/me/demandes-matieres'));
      const results = await Promise.all(reqs);
      const data = results[0].data;
      let email = data.email || user?.email || '';
      if (!email) { try { const r=await api.get('/api/auth/me'); email=r.data?.email||''; } catch{} }
      setStructure(results[1].data);
      setForm(prev => ({
        ...prev, ...data,
        user_prenom: data.prenom||data.user_prenom||user?.prenom||'',
        user_nom:    data.nom||data.user_nom||user?.nom||'',
        email, ville:data.ville||'', telephone:data.telephone||'',
        bio:data.bio||'', niveau:data.niveau||'', photo_url:data.photo_url||null,
        certificats:data.certificats||[], tarifs_matieres:data.tarifs_matieres||[],
        mode_enseignement:data.mode_enseignement||'presentiel',
        tarif_en_ligne:   data.tarif_en_ligne  !=null ? data.tarif_en_ligne  : '',
        tarif_presentiel: data.tarif_presentiel!=null ? data.tarif_presentiel: '',
        statut_validation: data.statut_validation||'incomplet',
        raison_refus: data.raison_refus||null,
      }));
      if (user.role==='professeur' && results[2]) setDemandes(results[2].data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleInput = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const isSelected = (mId, nId) => form.tarifs_matieres?.some(t => t.matiere_id===mId && t.niveau_id===nId);
  const handleToggle = (mId, nId) => {
    let list = [...(form.tarifs_matieres||[])];
    list = isSelected(mId,nId) ? list.filter(t=>!(t.matiere_id===mId&&t.niveau_id===nId)) : [...list,{matiere_id:mId,niveau_id:nId,tarif:0}];
    setForm(f=>({...f,tarifs_matieres:list}));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const route = user.role==='professeur' ? '/api/professeurs/me' : user.role==='étudiant' ? '/api/etudiants/me' : '/api/auth/me';
      await api.put(route, {
        nom:form.user_nom, prenom:form.user_prenom,
        ville:form.ville, telephone:form.telephone, bio:form.bio,
        ...(user.role==='étudiant' && { niveau:form.niveau }),
        ...(user.role==='professeur' && {
          tarifs_complets:form.tarifs_matieres,
          mode_enseignement:form.mode_enseignement,
          tarif_en_ligne:   form.tarif_en_ligne!==''   ? parseFloat(form.tarif_en_ligne)   : null,
          tarif_presentiel: form.tarif_presentiel!=='' ? parseFloat(form.tarif_presentiel) : null,
        }),
      });
      setSaved(true); setTimeout(()=>setSaved(false), 3000);
    } catch { alert('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const handleCertUpload = async (e) => {
    e.preventDefault();
    const fd = new FormData(); fd.append('titre',newCert.titre); fd.append('file',selectedFile);
    try {
      await api.post('/api/professeurs/me/certificats', fd, { headers:{'Content-Type':'multipart/form-data'} });
      setShowCertModal(false); setNewCert({titre:''}); setSelectedFile(null); fetchProfileData();
    } catch { alert('Erreur certificat'); }
  };

  const handleSubmitDemande = async (e) => {
    e.preventDefault();
    if (!newDemande.nom_matiere.trim()||!newDemande.niveau_id) { alert('Remplissez tous les champs'); return; }
    setSubmittingDemande(true);
    try {
      await api.post('/api/professeurs/me/demandes-matieres', { nom_matiere:newDemande.nom_matiere.trim(), niveau_id:parseInt(newDemande.niveau_id) });
      setShowDemandeModal(false); setNewDemande({nom_matiere:'',niveau_id:''});
      const res = await api.get('/api/professeurs/me/demandes-matieres');
      setDemandes(res.data);
    } catch(e) { alert('Erreur : '+(e.response?.data?.detail||e.message)); }
    finally { setSubmittingDemande(false); }
  };

  // ── NOUVEAU : Ignorer/supprimer une demande ──
  const handleIgnorerDemande = (demande) => {
    setConfirmModal({
      icon: '🗑️',
      iconBg: '#FEF2F2',
      title: 'Ignorer cette demande ?',
      subtitle: `La demande "${demande.nom_matiere}" (${demande.nom_niveau}) sera définitivement supprimée.`,
      confirmLabel: '✕ Ignorer',
      confirmBg: '#DC2626',
      confirmShadow: 'rgba(220,38,38,0.3)',
      onConfirm: async () => {
        try {
          await api.delete(`/api/professeurs/me/demandes-matieres/${demande.id}`);
          setDemandes(prev => prev.filter(d => d.id !== demande.id));
        } catch { alert('Erreur lors de la suppression'); }
        setConfirmModal(null);
      },
    });
  };

  // ── Soumettre profil pour validation ──
  const handleSoumettre = () => {
    setConfirmModal({
      icon: '🚀',
      iconBg: '#EFF6FF',
      title: 'Soumettre pour validation ?',
      subtitle: "Votre profil sera envoyé à l'administrateur pour validation. Assurez-vous que toutes vos informations sont correctes.",
      confirmLabel: '🚀 Soumettre',
      confirmBg: '#00153D',
      confirmShadow: 'rgba(0,21,61,0.3)',
      onConfirm: async () => {
        setConfirmModal(null);
        setSoumettreLoading(true);
        try {
          await api.post('/api/professeurs/me/soumettre-profil');
          setForm(f => ({ ...f, statut_validation: 'en_attente' }));
          setSoumettre(true);
          setTimeout(() => setSoumettre(false), 4000);
        } catch(e) {
          const detail = e.response?.data?.detail;
          if (detail?.errors) {
            alert('Profil incomplet :\n\n' + detail.errors.map(err => '• ' + err).join('\n'));
          } else {
            alert(detail || 'Erreur lors de la soumission');
          }
        } finally { setSoumettreLoading(false); }
      },
    });
  };

  const isProfesseur = user?.role==='professeur';
  const isEtudiant   = user?.role==='étudiant';

  // ── Score de complétion du profil ──
  const getCompletionScore = () => {
    if (!isProfesseur) return 100;
    let score = 0, total = 5;
    if (form.telephone) score++;
    if (form.bio) score++;
    if (form.tarif_en_ligne || form.tarif_presentiel) score++;
    if (form.tarifs_matieres?.length > 0) score++;
    if (form.ville) score++;
    return Math.round((score / total) * 100);
  };

  const completionScore = getCompletionScore();
  const completionItems = isProfesseur ? [
    { label: 'Téléphone',       done: !!form.telephone,                                  icon: '📞' },
    { label: 'Bio',             done: !!form.bio,                                         icon: '📝' },
    { label: 'Tarif',           done: !!(form.tarif_en_ligne || form.tarif_presentiel),   icon: '💰' },
    { label: 'Matière',         done: form.tarifs_matieres?.length > 0,                   icon: '📚' },
    { label: 'Ville',           done: !!form.ville,                                       icon: '📍' },
  ] : [];

  if (loading) return (
    <div className="profile-root" style={{ padding:60, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:'#94a3b8', minHeight:'60vh' }}>
      <div style={{ width:40, height:40, border:'3px solid #e2e8f0', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin2 .8s linear infinite' }} />
      <div style={{ fontSize:'.85rem', fontWeight:600 }}>Chargement du profil…</div>
    </div>
  );

  const currentMode  = MODES.find(m=>m.value===form.mode_enseignement);

  // ── Composant modal confirm inline ──
  const ConfirmModalEl = confirmModal ? (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.7)', backdropFilter:'blur(8px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:24, width:'100%', maxWidth:380, padding:28, boxShadow:'0 40px 100px rgba(0,0,0,.2)', border:'1.5px solid #f1f5f9', animation:'modalIn .25s ease' }}>
        <div style={{ width:52, height:52, borderRadius:16, background:confirmModal.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', margin:'0 auto 16px' }}>
          {confirmModal.icon}
        </div>
        <div style={{ textAlign:'center', marginBottom:6 }}>
          <div style={{ fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:900, fontSize:'1.05rem', color:'#0F172A' }}>{confirmModal.title}</div>
        </div>
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ fontSize:'.83rem', color:'#64748b', lineHeight:1.6 }}>{confirmModal.subtitle}</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setConfirmModal(null)}
            style={{ flex:1, padding:'11px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:700, cursor:'pointer', fontFamily:'Instrument Sans,sans-serif', fontSize:'.88rem' }}>
            Annuler
          </button>
          <button onClick={confirmModal.onConfirm}
            style={{ flex:1, padding:'11px', borderRadius:12, border:'none', background:confirmModal.confirmBg, color:'#fff', fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, cursor:'pointer', fontSize:'.88rem', boxShadow:`0 4px 14px ${confirmModal.confirmShadow}` }}>
            {confirmModal.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="profile-root" style={{ padding:'32px 36px', maxWidth: isProfesseur ? 1280 : 780, margin:'0 auto', background:'#f8fafc', minHeight:'100vh' }}>

      {ConfirmModalEl}

      {/* ════ BANNIÈRE STATUT PROF ════ */}
      {isProfesseur && (
        <>
          {/* Statut incomplet */}
          {form.statut_validation === 'incomplet' && (
            <div style={{ marginBottom:20, padding:'18px 24px', background:'linear-gradient(135deg,#FFF7ED,#FFFBEB)', border:'1.5px solid #FCD34D', borderRadius:18, animation:'fadeUp .4s ease both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>⚠️</div>
                    <div>
                      <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, color:'#92400E', fontSize:'.95rem' }}>Profil en cours de complétion</div>
                      <div style={{ fontSize:'.75rem', color:'#B45309', marginTop:1 }}>Complétez votre profil puis soumettez-le pour validation</div>
                    </div>
                  </div>
                  {/* Barre de progression */}
                  <div style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:'.72rem', fontWeight:700, color:'#B45309' }}>Complétion du profil</span>
                      <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, color:'#92400E', fontSize:'.82rem' }}>{completionScore}%</span>
                    </div>
                    <div style={{ height:7, background:'#FDE68A', borderRadius:4, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${completionScore}%`, background:'linear-gradient(90deg,#F59E0B,#D97706)', borderRadius:4, transition:'width .8s ease' }}/>
                    </div>
                  </div>
                  {/* Checklist */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {completionItems.map(item => (
                      <span key={item.label} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:'.7rem', fontWeight:700, padding:'3px 9px', borderRadius:20, background:item.done?'#ECFDF5':'#FEF3C7', color:item.done?'#065F46':'#92400E', border:`1px solid ${item.done?'#6EE7B7':'#FCD34D'}` }}>
                        {item.done ? '✓' : '○'} {item.icon} {item.label}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleSoumettre}
                  disabled={completionScore < 100 || soumettreLoading}
                  style={{ padding:'11px 22px', background: completionScore >= 100 ? '#00153D' : '#E2E8F0', color: completionScore >= 100 ? '#fff' : '#94A3B8', border:'none', borderRadius:13, cursor: completionScore >= 100 ? 'pointer' : 'not-allowed', fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.85rem', boxShadow: completionScore >= 100 ? '0 4px 16px rgba(0,21,61,0.25)' : 'none', transition:'all .2s', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8 }}
                  title={completionScore < 100 ? "Complétez d'abord tous les champs requis" : "Soumettre votre profil pour validation"}>
                  {soumettreLoading ? <><div style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin2 .8s linear infinite' }}/>Envoi...</> : '🚀 Soumettre pour validation'}
                </button>
              </div>
            </div>
          )}

          {/* Statut en_attente */}
          {form.statut_validation === 'en_attente' && (
            <div style={{ marginBottom:20, padding:'16px 22px', background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border:'1.5px solid #FCD34D', borderRadius:18, display:'flex', alignItems:'center', gap:14, animation:'fadeUp .4s ease both' }}>
              <div style={{ width:38,height:38,borderRadius:11,background:'#FEF3C7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0 }}>⏳</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, color:'#B45309', fontSize:'.9rem' }}>Profil soumis — En attente de validation</div>
                <div style={{ fontSize:'.75rem', color:'#92400E', marginTop:2 }}>L'administrateur examinera votre profil sous peu. Vous serez notifié.</div>
              </div>
              {soumettre && <span style={{ fontSize:'.72rem', fontWeight:700, color:'#065F46', background:'#ECFDF5', padding:'4px 12px', borderRadius:20, border:'1px solid #6EE7B7' }}>✅ Envoyé !</span>}
            </div>
          )}

          {/* Statut validé */}
          {form.statut_validation === 'validé' && (
            <div style={{ marginBottom:20, padding:'14px 22px', background:'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border:'1.5px solid #6EE7B7', borderRadius:18, display:'flex', alignItems:'center', gap:12, animation:'fadeUp .4s ease both' }}>
              <div style={{ width:36,height:36,borderRadius:11,background:'#A7F3D0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0 }}>✅</div>
              <div>
                <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, color:'#065F46', fontSize:'.9rem' }}>Profil validé — Visible sur la plateforme</div>
                <div style={{ fontSize:'.75rem', color:'#047857', marginTop:2 }}>Votre profil est approuvé. Les étudiants peuvent vous contacter.</div>
              </div>
            </div>
          )}

          {/* Statut refusé */}
          {form.statut_validation === 'refusé' && (
            <div style={{ marginBottom:20, animation:'fadeUp .4s ease both' }}>
              <div style={{ padding:'18px 22px', background:'linear-gradient(135deg,#FEF2F2,#fff1f2)', border:'2px solid #FCA5A5', borderRadius:18 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom: form.raison_refus ? 14 : 12 }}>
                  <div style={{ width:40,height:40,borderRadius:12,background:'#FEE2E2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0 }}>❌</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, color:'#DC2626', fontSize:'.92rem', marginBottom:4 }}>
                      Candidature refusée
                    </div>
                    {form.raison_refus ? (
                      <div style={{ padding:'10px 14px', background:'rgba(255,255,255,.7)', border:'1.5px solid #FCA5A5', borderRadius:10, fontSize:'.8rem', color:'#7F1D1D', lineHeight:1.6 }}>
                        <strong>📋 Raison :</strong> {form.raison_refus}
                      </div>
                    ) : (
                      <div style={{ fontSize:'.75rem', color:'#991B1B' }}>Mettez à jour vos informations puis resoumettez votre profil.</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (soumettreLoading) return;
                    setSoumettreLoading(true);
                    try {
                      await api.put('/api/professeurs/resoumettre');
                      setForm(f => ({ ...f, statut_validation: 'en_attente', raison_refus: null }));
                    } catch(e) {
                      alert(e.response?.data?.detail || 'Erreur lors de la resoumission');
                    } finally { setSoumettreLoading(false); }
                  }}
                  disabled={soumettreLoading}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background: soumettreLoading ? '#e2e8f0' : '#DC2626', color: soumettreLoading ? '#94a3b8' : '#fff', border:'none', borderRadius:11, cursor: soumettreLoading ? 'not-allowed' : 'pointer', fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.82rem', boxShadow: soumettreLoading ? 'none' : '0 4px 12px rgba(220,38,38,0.3)', transition:'all .18s' }}>
                  {soumettreLoading
                    ? <><div style={{ width:13,height:13,border:'2px solid rgba(0,0,0,.2)',borderTopColor:'#94a3b8',borderRadius:'50%',animation:'spin2 .8s linear infinite' }}/>Resoumission...</>
                    : '🔄 Resoumettre ma candidature'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════ HERO HEADER ════ */}
      <div style={{ background:'#fff', borderRadius:24, overflow:'hidden', marginBottom:28, border:'1.5px solid #f1f5f9', boxShadow:'0 2px 16px rgba(0,0,0,.05)', animation:'fadeUp .4s ease both' }}>
        <div style={{ height:100, background:'linear-gradient(135deg,#00153D 0%,#1e3a8a 50%,#3b82f6 100%)', position:'relative', overflow:'hidden' }}>
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.15 }} viewBox="0 0 600 100" preserveAspectRatio="xMidYMid slice">
            {Array.from({length:40},(_,i)=>(
              <circle key={i} cx={(i%10)*70+15} cy={Math.floor(i/10)*28+14} r="1.5" fill="#fff" />
            ))}
          </svg>
          <div style={{ position:'absolute', bottom:-42, left:32 }}>
            <AvatarUpload photoUrl={form.photo_url} nom={form.user_nom} prenom={form.user_prenom} role={user?.role}
              onUpload={url=>setForm(f=>({...f,photo_url:url}))} />
          </div>
        </div>

        <div style={{ padding:'52px 32px 24px', display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:16 }}>
          <div>
            <h2 style={{ fontFamily:'Cabinet Grotesk, sans-serif', fontSize:'1.7rem', fontWeight:900, color:'#0F172A', margin:'0 0 6px', letterSpacing:'-.02em' }}>
              {form.user_prenom} {form.user_nom}
            </h2>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:'.78rem', color:'#64748b', display:'flex', alignItems:'center', gap:4 }}>
                {user?.role==='professeur'?'👨‍🏫':user?.role==='étudiant'?'👨‍🎓':'🛡️'}
                <span style={{ textTransform:'capitalize' }}>Compte {user?.role}</span>
              </span>
              {form.ville && (
                <span style={{ fontSize:'.75rem', color:'#64748b', display:'flex', alignItems:'center', gap:3 }}>
                  <span style={{ width:4, height:4, borderRadius:'50%', background:'#cbd5e1', display:'inline-block' }} />
                  📍 {form.ville}
                </span>
              )}
              {isEtudiant && form.niveau && (
                <span style={{ fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(59,130,246,.1)', color:'#3b82f6' }}>🎓 {form.niveau}</span>
              )}
              {isProfesseur && currentMode && (
                <span style={{ fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:currentMode.bg, color:currentMode.color }}>
                  {currentMode.emoji} {currentMode.label}
                </span>
              )}
            </div>
          </div>

          <button className="save-btn" onClick={handleSave} disabled={saving} style={{
            padding:'11px 26px', border:'none', borderRadius:14, cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, fontSize:'.9rem',
            background: saved ? '#10b981' : '#00153D',
            color:'#fff', boxShadow: saved ? '0 4px 16px rgba(16,185,129,.35)' : '0 4px 16px rgba(0,21,61,.25)',
            display:'flex', alignItems:'center', gap:8, opacity: saving ? .7:1,
          }}>
            {saving ? (
              <><div style={{ width:16,height:16,border:'2.5px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin2 .8s linear infinite'}} />Enregistrement…</>
            ) : saved ? <>✅ Enregistré !</> : <>💾 Enregistrer</>}
          </button>
        </div>
      </div>

      {/* ════ MAIN GRID ════ */}
      <div style={{ display:'grid', gridTemplateColumns: isProfesseur ? '420px 1fr' : '1fr', gap:24 }}>

        {/* ─── LEFT COLUMN ─── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          <Section title="👤 Mon Identité" delay={100}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:2 }}>
              <Field label="Prénom" icon="✏️">
                <input className="inp-field" value={form.user_prenom} onChange={e=>handleInput('user_prenom',e.target.value)} placeholder="Votre prénom" />
              </Field>
              <Field label="Nom" icon="✏️">
                <input className="inp-field" value={form.user_nom} onChange={e=>handleInput('user_nom',e.target.value)} placeholder="Votre nom" />
              </Field>
            </div>
            <Field label="Email" icon="✉️" hint="L'email ne peut pas être modifié">
              <div style={{ position:'relative' }}>
                <input className="inp-field" value={form.email} readOnly style={{ paddingRight:38 }} />
                <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:'.8rem' }}>🔒</span>
              </div>
            </Field>
            <Field label="Téléphone" icon="📞">
              <input className="inp-field" value={form.telephone} onChange={e=>handleInput('telephone',e.target.value)} placeholder="+216 XX XXX XXX" />
            </Field>
            <Field label="Ville" icon="📍">
              <select className="inp-field" value={form.ville} onChange={e=>handleInput('ville',e.target.value)}>
                <option value="">Sélectionner votre ville…</option>
                {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            {isEtudiant && (
              <Field label="Niveau scolaire" icon="🎓" hint="Choisissez votre niveau actuel">
                <NiveauSelector value={form.niveau} onChange={v=>handleInput('niveau',v)} />
              </Field>
            )}
          </Section>

          {(isEtudiant||isProfesseur) && (
            <Section title="📝 À propos de moi" delay={160}>
              <textarea className="inp-field" style={{ height:110, resize:'vertical' }}
                value={form.bio||''}
                placeholder={isEtudiant ? "Vos objectifs scolaires, centres d'intérêt…" : "Votre expérience, méthode d'enseignement, spécialités…"}
                onChange={e=>handleInput('bio',e.target.value)} />
            </Section>
          )}

          {isProfesseur && (
            <Section title="🎓 Mode d'enseignement" delay={220}>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                {MODES.map(m => {
                  const active = form.mode_enseignement===m.value;
                  return (
                    <div key={m.value} className="mode-card" onClick={()=>handleInput('mode_enseignement',m.value)}
                      style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', borderRadius:14, border: active ? `2px solid ${m.color}` : '1.5px solid #e2e8f0', background: active ? m.bg : '#f8fafc', boxShadow: active ? `0 3px 12px ${m.border}` : 'none' }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${active?m.color:'#cbd5e1'}`, background: active?m.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                        {active && <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />}
                      </div>
                      <span style={{ fontSize:'1.1rem' }}>{m.emoji}</span>
                      <div>
                        <div style={{ fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, fontSize:'.85rem', color: active?m.color:'#0F172A' }}>{m.label}</div>
                        <div style={{ fontSize:'.7rem', color:'#94a3b8', marginTop:1 }}>{m.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {['en_ligne','les_deux'].includes(form.mode_enseignement) && (
                  <div style={{ background:'rgba(59,130,246,.06)', border:'1.5px solid rgba(59,130,246,.2)', borderRadius:13, padding:'14px 16px' }}>
                    <div style={{ fontSize:'.72rem', fontWeight:800, color:'#3b82f6', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>🌐 Tarif en ligne</div>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <input type="number" min="0" step="0.5" className="inp-field" style={{ flex:1 }} placeholder="Ex : 30" value={form.tarif_en_ligne} onChange={e=>handleInput('tarif_en_ligne',e.target.value)} />
                      <span style={{ color:'#3b82f6', fontWeight:800, fontSize:'.9rem', whiteSpace:'nowrap' }}>DT/séance</span>
                    </div>
                  </div>
                )}
                {['presentiel','les_deux'].includes(form.mode_enseignement) && (
                  <div style={{ background:'rgba(16,185,129,.06)', border:'1.5px solid rgba(16,185,129,.2)', borderRadius:13, padding:'14px 16px' }}>
                    <div style={{ fontSize:'.72rem', fontWeight:800, color:'#10b981', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>🏫 Tarif présentiel</div>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <input type="number" min="0" step="0.5" className="inp-field" style={{ flex:1 }} placeholder="Ex : 40" value={form.tarif_presentiel} onChange={e=>handleInput('tarif_presentiel',e.target.value)} />
                      <span style={{ color:'#10b981', fontWeight:800, fontSize:'.9rem', whiteSpace:'nowrap' }}>DT/séance</span>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {isProfesseur && (
            <Section title="📜 Diplômes & Certificats" delay={280}>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                {form.certificats?.length===0 ? (
                  <div style={{ textAlign:'center', padding:'24px', color:'#94a3b8', fontSize:'.82rem', background:'#f8fafc', borderRadius:14 }}>
                    <div style={{ fontSize:'1.8rem', marginBottom:8 }}>📂</div>
                    Aucun diplôme ajouté
                  </div>
                ) : form.certificats?.map(c => (
                  <div key={c.id} className="cert-row" style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', background:'#f8fafc', borderRadius:12, border:'1.5px solid #f1f5f9' }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'rgba(59,130,246,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                      {c.fichier_url?.endsWith('.pdf') ? '📄' : '🖼️'}
                    </div>
                    <span style={{ fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:700, fontSize:'.83rem', color:'#0F172A', flex:1 }}>{c.titre}</span>
                    <a href={`http://localhost:8001${c.fichier_url}`} target="_blank" rel="noreferrer" style={{ color:'#3b82f6', fontSize:'.76rem', fontWeight:700, textDecoration:'none', padding:'4px 10px', borderRadius:8, background:'rgba(59,130,246,.08)', transition:'all .15s' }}>Voir ↗</a>
                  </div>
                ))}
              </div>
              <button onClick={()=>setShowCertModal(true)} style={{ width:'100%', border:'2px dashed rgba(59,130,246,.25)', background:'rgba(59,130,246,.04)', color:'#3b82f6', padding:'12px', borderRadius:14, cursor:'pointer', fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:700, fontSize:'.83rem', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(59,130,246,.08)';e.currentTarget.style.borderColor='rgba(59,130,246,.4)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(59,130,246,.04)';e.currentTarget.style.borderColor='rgba(59,130,246,.25)';}}>
                + Ajouter un diplôme ou certificat
              </button>
            </Section>
          )}

          {isEtudiant && (
            <button className="save-btn" onClick={handleSave} disabled={saving} style={{ padding:'14px', border:'none', borderRadius:16, fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:900, cursor: saving ? 'not-allowed':' pointer', fontSize:'.95rem', background: saved ? '#10b981' : '#00153D', color:'#fff', boxShadow: saved ? '0 4px 20px rgba(16,185,129,.35)' : '0 4px 20px rgba(0,21,61,.25)', opacity: saving?.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {saving ? <><div style={{ width:18,height:18,border:'2.5px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin2 .8s linear infinite'}}/>Enregistrement…</> : saved ? '✅ Profil enregistré !' : '💾 Enregistrer mon profil'}
            </button>
          )}
        </div>

        {/* ─── RIGHT COLUMN (prof only) ─── */}
        {isProfesseur && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            <Section title="📚 Mes Enseignements" delay={140}
              action={
                <button onClick={()=>setShowDemandeModal(true)} style={{ background:'rgba(59,130,246,.08)', color:'#3b82f6', border:'1.5px solid rgba(59,130,246,.2)', padding:'7px 14px', borderRadius:10, cursor:'pointer', fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:700, fontSize:'.78rem', transition:'all .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,.15)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(59,130,246,.08)'}>
                  + Proposer une matière
                </button>
              }
            >
              {/* ── Domaines du référentiel ── */}
              {(()=>{
                const toggleGroupe = (key) => setOpenGroupe(p => ({...p, [key]: !p[key]}));

                // Map niveauNom → {id, matieres}
                const niveauMap = {};
                structure.forEach(dom => {
                  dom.niveaux?.forEach(niv => {
                    niveauMap[niv.nom] = { id: niv.id, matieres: niv.matieres || [] };
                  });
                });

                // Niveaux du domaine Académique qui NE sont PAS dans GROUPES_NIVEAUX
                const domAcademique = structure.find(d => d.nom === 'Académique');
                const autresAcademiques = (domAcademique?.niveaux || []).filter(niv =>
                  !GROUPES_NIVEAUX.some(g => NIVEAUX_HIERARCHIE[g.key]?.includes(niv.nom))
                );

                // Tous les domaines sauf Académique → Professionnel etc.
                const autresDomaines = structure.filter(d => d.nom !== 'Académique');

                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

                    {/* Header Domaine Académique */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'rgba(59,130,246,.06)', borderRadius:10, borderLeft:'3px solid #3b82f6' }}>
                      <span style={{ fontSize:'.85rem' }}>🎓</span>
                      <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'.78rem', color:'#1D4ED8', textTransform:'uppercase', letterSpacing:'.06em' }}>Domaine Académique</span>
                    </div>

                    {/* Groupes Primaire / Collège / Lycée */}
                    {GROUPES_NIVEAUX.map(groupe => {
                      const isOpen = openGroupe[groupe.key] === true; // ouvert par défaut
                      const sousNiveaux = NIVEAUX_HIERARCHIE[groupe.key] || [];

                      // Compter les matières cochées dans ce groupe
                      let totalCochees = 0;
                      sousNiveaux.forEach(sousNom => {
                        const niv = niveauMap[sousNom];
                        if (niv) niv.matieres.forEach(mat => { if (isSelected(mat.id, niv.id)) totalCochees++; });
                      });

                      return (
                        <div key={groupe.key} style={{ border:`1.5px solid ${groupe.border}`, borderRadius:18, overflow:'hidden', transition:'all .2s' }}>
                          {/* Header groupe */}
                          <div onClick={() => toggleGroupe(groupe.key)}
                            style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', background:`linear-gradient(135deg,${groupe.bg},#fff)`, cursor:'pointer', transition:'background .18s' }}
                            onMouseEnter={e => e.currentTarget.style.background=groupe.bg}
                            onMouseLeave={e => e.currentTarget.style.background=`linear-gradient(135deg,${groupe.bg},#fff)`}>
                            <div style={{ width:40, height:40, borderRadius:12, background:groupe.bg, border:`1.5px solid ${groupe.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                              {groupe.icon}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1rem', color:groupe.color, letterSpacing:'-.01em' }}>{groupe.key}</div>
                              <div style={{ fontSize:'.7rem', color:'#94a3b8', marginTop:2 }}>{groupe.desc}</div>
                            </div>
                            {totalCochees > 0 && (
                              <div style={{ fontSize:'.68rem', fontWeight:800, padding:'3px 10px', borderRadius:20, background:groupe.bg, color:groupe.color, border:`1px solid ${groupe.border}` }}>
                                {totalCochees} matière{totalCochees>1?'s':''} choisie{totalCochees>1?'s':''}
                              </div>
                            )}
                            <div style={{ fontSize:12, color:'#94a3b8', transition:'transform .2s', transform:isOpen?'rotate(180deg)':'rotate(0deg)', marginLeft:4 }}>▾</div>
                          </div>

                          {/* Sous-niveaux */}
                          {isOpen && (
                            <div style={{ padding:'12px 16px 16px', background:'#fff', display:'flex', flexDirection:'column', gap:10 }}>
                              {sousNiveaux.map(sousNom => {
                                const niv = niveauMap[sousNom];
                                if (!niv) return null;
                                const nbCochees = niv.matieres.filter(mat => isSelected(mat.id, niv.id)).length;
                                return (
                                  <div key={sousNom} style={{ background:'#f8fafc', borderRadius:14, padding:'12px 14px', border:`1.5px solid ${nbCochees>0?groupe.border:'#f1f5f9'}` }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                        <div style={{ width:6, height:6, borderRadius:'50%', background:nbCochees>0?groupe.color:'#CBD5E1', flexShrink:0 }}/>
                                        <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.82rem', color:'#0F172A' }}>{sousNom}</span>
                                      </div>
                                      <button onClick={()=>{setNewDemande({nom_matiere:'',niveau_id:niv.id});setShowDemandeModal(true);}}
                                        style={{ background:'none', border:'1.5px dashed #cbd5e1', color:'#94a3b8', padding:'3px 9px', borderRadius:8, cursor:'pointer', fontSize:'.65rem', fontWeight:700, transition:'all .15s' }}
                                        onMouseEnter={e=>{e.currentTarget.style.borderColor=groupe.color;e.currentTarget.style.color=groupe.color;}}
                                        onMouseLeave={e=>{e.currentTarget.style.borderColor='#cbd5e1';e.currentTarget.style.color='#94a3b8';}}>
                                        + matière
                                      </button>
                                    </div>
                                    {niv.matieres.length === 0 ? (
                                      <div style={{ fontSize:'.72rem', color:'#94a3b8', fontStyle:'italic', padding:'4px 0' }}>Aucune matière dans ce niveau</div>
                                    ) : (
                                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:7 }}>
                                        {niv.matieres.map(mat => {
                                          const active = isSelected(mat.id, niv.id);
                                          return (
                                            <label key={mat.id} className="mat-label" style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 11px', borderRadius:10, cursor:'pointer', background: active ? `${groupe.bg}` : '#fff', border: active ? `1.5px solid ${groupe.border}` : '1.5px solid #e2e8f0', boxShadow: active ? `0 2px 8px ${groupe.border}44` : 'none' }}>
                                              <input type="checkbox" checked={active} onChange={()=>handleToggle(mat.id,niv.id)} style={{ accentColor:groupe.color, width:14, height:14, flexShrink:0 }} />
                                              <span style={{ fontSize:'.78rem', fontWeight: active?700:400, color: active?groupe.color:'#374151' }}>{mat.nom}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* ── Domaines Professionnels ── */}
                    {autresDomaines.map(dom => {
                      const domKey = `dom_${dom.id}`;
                      const isOpen = openGroupe[domKey] === true;
                      const PROF_CFG = {
                        color:'#B45309', bg:'#FFFBEB', border:'#FCD34D', icon:'💼'
                      };
                      // Compter matières cochées dans ce domaine
                      let cochees = 0;
                      dom.niveaux?.forEach(niv => niv.matieres?.forEach(mat => { if(isSelected(mat.id,niv.id)) cochees++; }));
                      return (
                        <div key={dom.id} style={{ marginTop:8 }}>
                          {/* Séparateur domaine */}
                          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'rgba(245,158,11,.06)', borderRadius:10, borderLeft:'3px solid #F59E0B', marginBottom:10 }}>
                            <span style={{ fontSize:'.85rem' }}>💼</span>
                            <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'.78rem', color:'#B45309', textTransform:'uppercase', letterSpacing:'.06em' }}>Domaine {dom.nom}</span>
                          </div>
                          <div style={{ border:`1.5px solid ${PROF_CFG.border}`, borderRadius:18, overflow:'hidden' }}>
                            <div onClick={() => toggleGroupe(domKey)}
                              style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', background:`linear-gradient(135deg,${PROF_CFG.bg},#fff)`, cursor:'pointer' }}
                              onMouseEnter={e=>e.currentTarget.style.background=PROF_CFG.bg}
                              onMouseLeave={e=>e.currentTarget.style.background=`linear-gradient(135deg,${PROF_CFG.bg},#fff)`}>
                              <div style={{ width:40, height:40, borderRadius:12, background:PROF_CFG.bg, border:`1.5px solid ${PROF_CFG.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>{PROF_CFG.icon}</div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1rem', color:PROF_CFG.color }}>{dom.nom}</div>
                                <div style={{ fontSize:'.7rem', color:'#94a3b8', marginTop:2 }}>{dom.niveaux?.length || 0} niveaux disponibles</div>
                              </div>
                              {cochees > 0 && (
                                <div style={{ fontSize:'.68rem', fontWeight:800, padding:'3px 10px', borderRadius:20, background:PROF_CFG.bg, color:PROF_CFG.color, border:`1px solid ${PROF_CFG.border}` }}>
                                  {cochees} matière{cochees>1?'s':''} choisie{cochees>1?'s':''}
                                </div>
                              )}
                              <div style={{ fontSize:12, color:'#94a3b8', transition:'transform .2s', transform:isOpen?'rotate(180deg)':'rotate(0deg)', marginLeft:4 }}>▾</div>
                            </div>
                            {isOpen && (
                              <div style={{ padding:'12px 16px 16px', background:'#fff', display:'flex', flexDirection:'column', gap:10 }}>
                                {dom.niveaux?.map(niv => {
                                  const nbC = niv.matieres?.filter(mat => isSelected(mat.id,niv.id)).length || 0;
                                  return (
                                    <div key={niv.id} style={{ background:'#f8fafc', borderRadius:14, padding:'12px 14px', border:`1.5px solid ${nbC>0?PROF_CFG.border:'#f1f5f9'}` }}>
                                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                          <div style={{ width:6, height:6, borderRadius:'50%', background:nbC>0?PROF_CFG.color:'#CBD5E1' }}/>
                                          <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.82rem', color:'#0F172A' }}>{niv.nom}</span>
                                        </div>
                                        <button onClick={()=>{setNewDemande({nom_matiere:'',niveau_id:niv.id});setShowDemandeModal(true);}}
                                          style={{ background:'none', border:'1.5px dashed #cbd5e1', color:'#94a3b8', padding:'3px 9px', borderRadius:8, cursor:'pointer', fontSize:'.65rem', fontWeight:700, transition:'all .15s' }}
                                          onMouseEnter={e=>{e.currentTarget.style.borderColor=PROF_CFG.color;e.currentTarget.style.color=PROF_CFG.color;}}
                                          onMouseLeave={e=>{e.currentTarget.style.borderColor='#cbd5e1';e.currentTarget.style.color='#94a3b8';}}>
                                          + matière
                                        </button>
                                      </div>
                                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:7 }}>
                                        {niv.matieres?.map(mat => {
                                          const active = isSelected(mat.id, niv.id);
                                          return (
                                            <label key={mat.id} className="mat-label" style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 11px', borderRadius:10, cursor:'pointer', background:active?PROF_CFG.bg:'#fff', border:active?`1.5px solid ${PROF_CFG.border}`:'1.5px solid #e2e8f0' }}>
                                              <input type="checkbox" checked={active} onChange={()=>handleToggle(mat.id,niv.id)} style={{ accentColor:PROF_CFG.color, width:14, height:14, flexShrink:0 }} />
                                              <span style={{ fontSize:'.78rem', fontWeight:active?700:400, color:active?PROF_CFG.color:'#374151' }}>{mat.nom}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <button className="save-btn" onClick={handleSave} disabled={saving} style={{ width:'100%', border:'none', padding:13, borderRadius:14, fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, cursor: saving?'not-allowed':'pointer', fontSize:'.88rem', background: saved ? '#10b981' : '#00153D', color:'#fff', boxShadow: saved ? '0 4px 16px rgba(16,185,129,.35)' : '0 4px 16px rgba(0,21,61,.2)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {saving ? <><div style={{ width:16,height:16,border:'2.5px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin2 .8s linear infinite'}}/>…</> : saved ? '✅ Enregistré !' : '💾 Sauvegarder mes enseignements'}
              </button>
            </Section>

            {/* ── Section demandes — MODIFIÉE : bouton Ignorer ajouté ── */}
            {demandes.length > 0 && (
              <Section title="📋 Mes demandes de matières" delay={200}>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {demandes.map(d => (
                    <div key={d.id} style={{ background:'#f8fafc', padding:'12px 14px', borderRadius:12, border:'1.5px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, fontSize:'.85rem', color:'#0F172A' }}>{d.nom_matiere}</div>
                        <div style={{ fontSize:'.72rem', color:'#94a3b8', marginTop:2 }}>Niveau : {d.nom_niveau}</div>
                      </div>
                      <StatutBadge statut={d.statut} />
                      {(d.statut === 'en_attente' || d.statut === 'refusé') && (
                        <button
                          onClick={() => handleIgnorerDemande(d)}
                          title="Ignorer et supprimer cette demande"
                          style={{ background:'#FEF2F2', border:'1.5px solid #FCA5A5', color:'#DC2626', borderRadius:8, padding:'4px 10px', cursor:'pointer', fontSize:'.72rem', fontWeight:700, flexShrink:0, transition:'background .15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                          onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                        >
                          ✕ Ignorer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>

      {/* ════ MODALS ════ */}
      {showCertModal && (
        <Modal title="📁 Nouveau Diplôme / Certificat" onClose={()=>setShowCertModal(false)}>
          <form onSubmit={handleCertUpload} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Field label="Titre du diplôme">
              <input className="inp-field" placeholder="Ex: Master en Informatique…" value={newCert.titre} onChange={e=>setNewCert({titre:e.target.value})} required />
            </Field>
            <Field label="Fichier (PDF ou image)">
              <div style={{ border:'2px dashed #e2e8f0', borderRadius:14, padding:'20px', textAlign:'center', cursor:'pointer', background:'#f8fafc', transition:'all .15s' }}
                onClick={()=>document.getElementById('cert-file').click()}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.background='rgba(59,130,246,.04)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.background='#f8fafc';}}>
                {selectedFile
                  ? <div style={{ fontSize:'.85rem', color:'#10b981', fontWeight:700 }}>✅ {selectedFile.name}</div>
                  : <>
                      <div style={{ fontSize:'1.6rem', marginBottom:6 }}>📎</div>
                      <div style={{ color:'#64748b', fontSize:'.82rem', fontWeight:600 }}>Cliquer pour choisir un fichier</div>
                      <div style={{ fontSize:'.7rem', color:'#94a3b8', marginTop:3 }}>PDF, JPG, PNG</div>
                    </>}
              </div>
              <input id="cert-file" type="file" hidden onChange={e=>setSelectedFile(e.target.files[0])} required />
            </Field>
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button type="submit" style={{ flex:2, background:'#00153D', color:'#fff', padding:'12px', borderRadius:12, border:'none', fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, cursor:'pointer', boxShadow:'0 4px 14px rgba(0,21,61,.2)' }}>Sauvegarder</button>
              <button type="button" onClick={()=>setShowCertModal(false)} style={{ flex:1, background:'#f8fafc', color:'#64748b', padding:'12px', borderRadius:12, border:'1.5px solid #e2e8f0', fontWeight:600, cursor:'pointer' }}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      {showDemandeModal && (
        <Modal title="💡 Proposer une nouvelle matière" onClose={()=>setShowDemandeModal(false)}>
          <p style={{ fontSize:'.82rem', color:'#64748b', marginBottom:18, marginTop:0, lineHeight:1.6 }}>
            Vous ne trouvez pas la matière que vous enseignez ? Proposez-la à l'administrateur.
          </p>
          <form onSubmit={handleSubmitDemande} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label="Nom de la matière">
              <input className="inp-field" placeholder="Ex: Robotique, Piano, Droit des affaires…" value={newDemande.nom_matiere} onChange={e=>setNewDemande(d=>({...d,nom_matiere:e.target.value}))} required />
            </Field>
            <Field label="Niveau associé">
              <select className="inp-field" value={newDemande.niveau_id} onChange={e=>setNewDemande(d=>({...d,niveau_id:e.target.value}))} required>
                <option value="">Sélectionner un niveau…</option>
                {structure.flatMap(dom=>dom.niveaux?.map(niv=>(
                  <option key={niv.id} value={niv.id}>[{dom.nom}] {niv.nom}</option>
                )))}
              </select>
            </Field>
            <div style={{ background:'rgba(245,158,11,.06)', border:'1.5px solid rgba(245,158,11,.2)', borderRadius:12, padding:'11px 14px', fontSize:'.78rem', color:'#d97706', display:'flex', gap:8, alignItems:'flex-start' }}>
              <span style={{ flexShrink:0 }}>⚠️</span>
              Votre demande sera examinée par l'administrateur avant d'être ajoutée au référentiel.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" disabled={submittingDemande} style={{ flex:2, background: submittingDemande?'#94a3b8':'#00153D', color:'#fff', padding:12, borderRadius:12, border:'none', fontFamily:'Cabinet Grotesk, sans-serif', fontWeight:800, cursor: submittingDemande?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {submittingDemande ? <><div style={{ width:16,height:16,border:'2.5px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin2 .8s linear infinite'}}/>Envoi…</> : '📤 Envoyer la demande'}
              </button>
              <button type="button" onClick={()=>setShowDemandeModal(false)} style={{ flex:1, background:'#f8fafc', color:'#64748b', padding:12, borderRadius:12, border:'1.5px solid #e2e8f0', fontWeight:600, cursor:'pointer' }}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}