import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  .dispo-root { font-family:'Instrument Sans',sans-serif; background:#FDFEFF; min-height:100vh; }

  @keyframes fadeUpD  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleInD { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
  @keyframes slideD   { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spinD    { to{transform:rotate(360deg)} }
  @keyframes modalInD { from{opacity:0;transform:scale(.94) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes confirmIn { from{opacity:0;transform:scale(.88) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }

  .dispo-stat {
    background:#fff; border:1.5px solid #F1F5F9;
    border-radius:20px; padding:18px 22px;
    box-shadow:0 2px 10px rgba(0,0,0,0.04);
    display:flex; align-items:center; gap:14px;
    transition:all .22s cubic-bezier(.22,1,.36,1);
  }
  .dispo-stat:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(0,21,61,0.08); }

  .dispo-card {
    background:#fff; border:1.5px solid #F1F5F9;
    border-radius:16px; padding:16px 18px;
    box-shadow:0 1px 6px rgba(0,0,0,0.03);
    transition:all .2s ease; margin-bottom:10px;
  }
  .dispo-card:hover { border-color:#C7D2FE; box-shadow:0 5px 18px rgba(0,21,61,0.07); }

  .new-seance-btn {
    padding:11px 24px; background:#00153D; color:#fff; border:none;
    border-radius:14px; cursor:pointer;
    font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:.88rem;
    box-shadow:0 4px 16px rgba(0,21,61,0.22);
    display:flex; align-items:center; gap:8px;
    transition:all .2s;
  }
  .new-seance-btn:hover { background:#1E3A8A; transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,21,61,0.28); }

  .del-btn {
    width:36px; height:36px; border-radius:10px;
    background:#FEF2F2; border:1.5px solid #FCA5A5;
    color:#DC2626; cursor:pointer; font-size:.95rem;
    display:flex; align-items:center; justify-content:center;
    transition:all .15s; flex-shrink:0;
  }
  .del-btn:hover { background:#FEE2E2; transform:scale(1.08); }

  .cap-btn {
    flex:1; padding:10px 0; border-radius:11px; cursor:pointer;
    font-weight:800; font-size:.86rem; transition:all .15s;
    border:1.5px solid #E2E8F0; background:#F8FAFC; color:#64748B;
    font-family:'Cabinet Grotesk',sans-serif;
  }
  .cap-btn.active { border-color:#00153D; background:#EEF2FF; color:#1E40AF; }

  .modal-inp {
    background:#F8FAFC; border:1.5px solid #E2E8F0;
    border-radius:12px; color:#0F172A; padding:11px 14px;
    font-size:.88rem; outline:none; width:100%; box-sizing:border-box;
    font-family:'Instrument Sans',sans-serif; transition:border-color .15s;
  }
  .modal-inp:focus { border-color:#3B82F6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }

  .submit-btn {
    flex:2; padding:13px; border-radius:13px; border:none;
    font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:.9rem;
    cursor:pointer; color:#fff; transition:all .2s;
    background:linear-gradient(135deg,#00153D,#1E3A8A);
    box-shadow:0 4px 16px rgba(0,21,61,0.22);
  }
  .submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,21,61,0.3); }
  .submit-btn:disabled { background:#E2E8F0; color:#94A3B8; cursor:not-allowed; box-shadow:none; }

  .cal-day {
    aspect-ratio:1; display:flex; align-items:center; justify-content:center;
    border-radius:9px; font-size:.79rem; border:1.5px solid transparent;
    transition:all .15s;
  }

  .cal-nav-btn {
    width:34px; height:34px; border-radius:10px;
    background:#fff; border:1.5px solid #E2E8F0;
    color:#64748B; cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:1rem; transition:all .15s;
  }
  .cal-nav-btn:hover { border-color:#C7D2FE; color:#1E40AF; background:#F0F4FF; }
`;

function injectCSS() {
  if (typeof document !== 'undefined' && !document.getElementById('dispo-css')) {
    const s = document.createElement('style'); s.id = 'dispo-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
}

const EMPTY_DISPO = { date_specifique:'', heure_debut:'09:00', heure_fin:'10:00', nb_max_etudiants:1, mode_seance:'presentiel', description:'', niveau_id:'' };

function getDuration(debut, fin) {
  if (!debut || !fin) return null;
  const [h1,m1] = debut.split(':').map(Number);
  const [h2,m2] = fin.split(':').map(Number);
  const diff = (h2*60+m2)-(h1*60+m1);
  if (diff <= 0) return null;
  const h = Math.floor(diff/60), m = diff%60;
  return h > 0 ? `${h}h${m>0?String(m).padStart(2,'0'):''}` : `${m}min`;
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str+'T00:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

const MODE_INFO = {
  en_ligne:   { icon:'🌐', label:'En ligne',   color:'#1D4ED8', bg:'#EFF6FF',  border:'#BFDBFE' },
  presentiel: { icon:'🏫', label:'Présentiel', color:'#065F46', bg:'#ECFDF5',  border:'#6EE7B7' },
};

/* ─── Modal de confirmation custom ─────────── */
function ConfirmModal({ config, onConfirm, onCancel }) {
  if (!config) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.7)', backdropFilter:'blur(8px)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:24, width:'100%', maxWidth:400, padding:28, boxShadow:'0 40px 100px rgba(0,0,0,0.2)', animation:'confirmIn .28s cubic-bezier(.34,1.56,.64,1)', border:'1.5px solid #F1F5F9' }}>
        {/* Icône */}
        <div style={{ width:56, height:56, borderRadius:18, background:config.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', margin:'0 auto 16px' }}>
          {config.icon}
        </div>
        {/* Titre */}
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1.1rem', color:'#0F172A', letterSpacing:'-.02em' }}>{config.title}</div>
        </div>
        {/* Sous-titre */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:'.84rem', color:'#64748B', lineHeight:1.6 }}>{config.subtitle}</div>
          {config.detail && (
            <div style={{ marginTop:10, padding:'10px 14px', background:config.detailBg, border:`1.5px solid ${config.detailBorder}`, borderRadius:12, fontSize:'.82rem', color:config.detailColor, fontWeight:600 }}>
              {config.detail}
            </div>
          )}
        </div>
        {/* Boutons */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel}
            style={{ flex:1, padding:'11px', borderRadius:12, border:'1.5px solid #E2E8F0', background:'#F8FAFC', color:'#64748B', fontWeight:700, cursor:'pointer', fontFamily:'Instrument Sans,sans-serif', fontSize:'.88rem', transition:'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.background='#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background='#F8FAFC'}>
            Annuler
          </button>
          <button onClick={onConfirm}
            style={{ flex:1, padding:'11px', borderRadius:12, border:'none', background:config.confirmBg, color:'#fff', fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, cursor:'pointer', fontSize:'.88rem', boxShadow:`0 4px 14px ${config.confirmShadow}`, transition:'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='.88'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Calendrier smart ─────────────────────── */
function SmartCalendar({ dispos }) {
  const today = new Date();

  const initialMonth = () => {
    if (!dispos?.length) return { y:today.getFullYear(), m:today.getMonth() };
    const futures = dispos.filter(d => d.date_specifique).map(d => new Date(d.date_specifique+'T00:00:00')).filter(d => d >= new Date(today.getFullYear(),today.getMonth(),1)).sort((a,b) => a-b);
    if (futures.length > 0) return { y:futures[0].getFullYear(), m:futures[0].getMonth() };
    return { y:today.getFullYear(), m:today.getMonth() };
  };

  const init = initialMonth();
  const [year, setYear]   = useState(init.y);
  const [month, setMonth] = useState(init.m);

  useEffect(() => {
    const i = initialMonth();
    setYear(i.y); setMonth(i.m);
  }, [dispos.length]);

  const firstDay    = new Date(year,month,1).getDay();
  const offset      = (firstDay+6)%7;
  const daysInMonth = new Date(year,month+1,0).getDate();
  const cells       = Array.from({length:42},(_,i) => i-offset+1);

  const dayMap = {};
  dispos.forEach(d => {
    if (!d.date_specifique) return;
    const dt = new Date(d.date_specifique+'T00:00:00');
    if (dt.getFullYear()!==year || dt.getMonth()!==month) return;
    const day = dt.getDate();
    const complet = d.nb_inscrits >= d.nb_max_etudiants;
    if (dayMap[day]===undefined) dayMap[day] = complet?'complet':'dispo';
    else if (dayMap[day]==='complet' && !complet) dayMap[day] = 'dispo';
  });

  const isToday = (d) => d===today.getDate() && month===today.getMonth() && year===today.getFullYear();

  function prev() { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }
  function next() { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }

  const dispoCount   = Object.values(dayMap).filter(v => v==='dispo').length;
  const completCount = Object.values(dayMap).filter(v => v==='complet').length;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <button className="cal-nav-btn" onClick={prev}>‹</button>
        <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.96rem', color:'#0F172A' }}>{MONTHS[month]} {year}</div>
        <button className="cal-nav-btn" onClick={next}>›</button>
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:18, fontSize:'.7rem', marginBottom:12 }}>
        {[['#10B981','#ECFDF5','Disponible'],['#EF4444','#FEF2F2','Complet']].map(([c,bg,l]) => (
          <span key={l} style={{ display:'flex', alignItems:'center', gap:5, fontWeight:700, color:c }}>
            <span style={{ width:9, height:9, borderRadius:'50%', background:bg, border:`1.5px solid ${c}`, display:'inline-block' }}/>
            {l}
          </span>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:5 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:'.62rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', padding:'4px 0', letterSpacing:'.06em' }}>{d}</div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
        {cells.map((d,i) => {
          const valid  = d>=1 && d<=daysInMonth;
          const statut = valid ? dayMap[d] : undefined;
          const td     = valid && isToday(d);
          let bg='transparent', color='#CBD5E1', border='1.5px solid transparent', fontWeight=400;
          if (!valid) { color='transparent'; }
          else if (statut==='dispo')   { bg='#ECFDF5'; color='#065F46'; border='1.5px solid #6EE7B7'; fontWeight=800; }
          else if (statut==='complet') { bg='#FEF2F2'; color='#DC2626'; border='1.5px solid #FCA5A5'; fontWeight=800; }
          else { color='#64748B'; }
          if (td) { border=`2px solid #00153D`; fontWeight=900; if(!statut) color='#00153D'; }
          return (
            <div key={i} className="cal-day" style={{ background:bg, color, border, fontWeight }}>
              {valid ? d : ''}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:16, padding:'12px 14px', background:'#F8FAFC', borderRadius:12, border:'1.5px solid #F1F5F9' }}>
        {dispoCount > 0 || completCount > 0 ? (
          <div style={{ fontSize:'.76rem', color:'#64748B', fontWeight:600, lineHeight:1.6 }}>
            {dispoCount > 0 && <span><span style={{ color:'#065F46', fontWeight:900, fontFamily:'Cabinet Grotesk,sans-serif' }}>{dispoCount}</span> jour{dispoCount>1?'s':''} avec places disponibles</span>}
            {dispoCount > 0 && completCount > 0 && <span> · </span>}
            {completCount > 0 && <span><span style={{ color:'#DC2626', fontWeight:900, fontFamily:'Cabinet Grotesk,sans-serif' }}>{completCount}</span> complet{completCount>1?'s':''}</span>}
          </div>
        ) : (
          <div style={{ fontSize:'.76rem', color:'#94A3B8', textAlign:'center', fontStyle:'italic' }}>Aucune séance ce mois-ci</div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE DISPONIBILITÉS
════════════════════════════════════════════════ */
export default function Disponibilites() {
  const [dispos, setDispos]         = useState([]);
  const [profile, setProfile]       = useState(null);
  const [niveaux, setNiveaux]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [newDispo, setNewDispo]     = useState({ ...EMPTY_DISPO });
  const [submitting, setSubmitting] = useState(false);

  // ── Modal de confirmation ──
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [confirmCallback, setConfirmCallback] = useState(null);

  const showConfirm = (config, callback) => {
    setConfirmConfig(config);
    setConfirmCallback(() => callback);
  };

  const handleConfirm = async () => {
    setConfirmConfig(null);
    if (confirmCallback) await confirmCallback();
    setConfirmCallback(null);
  };

  const handleCancelConfirm = () => {
    setConfirmConfig(null);
    setConfirmCallback(null);
  };

  useEffect(() => { injectCSS(); fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        api.get('/api/professeurs/me/disponibilites'),
        api.get('/api/professeurs/me'),
        api.get('/api/professeurs/me/niveaux').catch(() => ({ data: [] })),
      ]);
      const prof = r2.data ?? null;
      setDispos(r1.data ?? []);
      setProfile(prof);
      setNiveaux(r3.data ?? []);
      const mode = prof?.mode_enseignement;
      setNewDispo(prev => ({ ...prev, mode_seance: mode==='les_deux'?'presentiel':(mode||'presentiel') }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDispos = async () => {
    try { const r = await api.get('/api/professeurs/me/disponibilites'); setDispos(r.data ?? []); } catch {}
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!getDuration(newDispo.heure_debut, newDispo.heure_fin)) { alert("L'heure de fin doit être après l'heure de début."); return; }
    setSubmitting(true);
    try {
      await api.post('/api/professeurs/me/disponibilites', { ...newDispo, nb_max_etudiants:parseInt(newDispo.nb_max_etudiants,10) });
      setShowForm(false); resetForm(); await fetchDispos();
    } catch (e) { alert('Erreur : '+(e.response?.data?.detail||e.message)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = (dispo) => {
    const date = dispo.date_specifique ? formatDate(dispo.date_specifique) : 'Sans date';
    const heure = `${dispo.heure_debut?.slice(0,5)} – ${dispo.heure_fin?.slice(0,5)}`;
    const inscrits = dispo.nb_inscrits || 0;

    showConfirm({
      icon: '🗑️',
      iconBg: '#FEF2F2',
      title: 'Supprimer ce créneau ?',
      subtitle: 'Cette action est irréversible. Le créneau sera définitivement supprimé.',
      detail: inscrits > 0
        ? `⚠️ Attention : ${inscrits} étudiant${inscrits>1?'s':''} inscrit${inscrits>1?'s':''}. Les réservations associées seront annulées.`
        : `📅 ${date} · 🕒 ${heure}`,
      detailBg:     inscrits > 0 ? '#FFF7ED' : '#F8FAFC',
      detailBorder: inscrits > 0 ? '#FED7AA' : '#E2E8F0',
      detailColor:  inscrits > 0 ? '#C2410C' : '#64748B',
      confirmBg:     '#DC2626',
      confirmShadow: 'rgba(220,38,38,0.3)',
      confirmLabel:  '🗑 Supprimer',
    }, async () => {
      try {
        await api.delete(`/api/professeurs/me/disponibilites/${dispo.id}`);
        setDispos(prev => prev.filter(d => d.id !== dispo.id));
      } catch (e) {
        alert('Erreur : '+(e.response?.data?.detail||e.message));
        await fetchDispos();
      }
    });
  };

  const resetForm = () => {
    const mode = profile?.mode_enseignement;
    setNewDispo({ ...EMPTY_DISPO, mode_seance: mode==='les_deux'?'presentiel':(mode||'presentiel') });
  };

  const profMode       = profile?.mode_enseignement;
  const showModeChoice = profMode === 'les_deux';

  const grouped = dispos.reduce((acc, d) => {
    const key = d.date_specifique || 'Sans date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  if (loading) return (
    <div className="dispo-root" style={{ padding:80, textAlign:'center' }}>
      <div style={{ width:40, height:40, border:'3px solid #E2E8F0', borderTopColor:'#00153D', borderRadius:'50%', animation:'spinD 1s linear infinite', margin:'0 auto 20px' }}/>
      <div style={{ color:'#94A3B8', fontWeight:600, fontSize:'.88rem' }}>Chargement de vos disponibilités...</div>
    </div>
  );

  return (
    <div className="dispo-root" style={{ padding:'36px 40px', maxWidth:1160, margin:'0 auto' }}>

      {/* ── Modal confirmation ── */}
      <ConfirmModal config={confirmConfig} onConfirm={handleConfirm} onCancel={handleCancelConfirm}/>

      {/* ── HEADER ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:32, animation:'fadeUpD .5s ease both' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:4, height:28, background:'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius:2 }}/>
            <span style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.14em', fontFamily:'Cabinet Grotesk,sans-serif' }}>Mes créneaux</span>
          </div>
          <h1 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'2.2rem', color:'#0F172A', margin:'0 0 6px', letterSpacing:'-.035em', lineHeight:1 }}>
            Mes Disponibilités
          </h1>
          <p style={{ color:'#94A3B8', margin:0, fontSize:'.88rem', fontWeight:500, fontStyle:'italic' }}>
            {dispos.length} séance{dispos.length!==1?'s':''} planifiée{dispos.length!==1?'s':''}
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {profMode && (() => {
            const cfg = { en_ligne:{icon:'🌐',label:'En ligne',color:'#1D4ED8',bg:'#EFF6FF',border:'#BFDBFE'}, presentiel:{icon:'🏫',label:'Présentiel',color:'#065F46',bg:'#ECFDF5',border:'#6EE7B7'}, les_deux:{icon:'🔀',label:'Les deux',color:'#4F46E5',bg:'#EEF2FF',border:'#C7D2FE'} }[profMode];
            return <div style={{ padding:'8px 16px', borderRadius:20, background:cfg.bg, border:`1.5px solid ${cfg.border}`, fontSize:'.8rem', fontWeight:700, color:cfg.color, fontFamily:'Cabinet Grotesk,sans-serif' }}>{cfg.icon} {cfg.label}</div>;
          })()}
          <button className="new-seance-btn" onClick={() => setShowForm(true)}>+ Nouvelle séance</button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:32 }}>
        {[
          { icon:'📅', val:dispos.length,                                         lbl:'Séances planifiées', numColor:'#1E40AF', iconBg:'#BFDBFE', border:'#93C5FD', delay:0   },
          { icon:'👥', val:dispos.reduce((s,d) => s+(d.nb_max_etudiants||0),0),   lbl:'Places totales',     numColor:'#065F46', iconBg:'#A7F3D0', border:'#6EE7B7', delay:55  },
          { icon:'📊', val:dispos.reduce((s,d) => s+(d.nb_inscrits||0),0),        lbl:'Inscrits total',     numColor:'#B45309', iconBg:'#FDE68A', border:'#FCD34D', delay:110 },
        ].map(s => (
          <div key={s.lbl} className="dispo-stat"
            style={{ animationDelay:`${s.delay}ms`, animation:'scaleInD .45s cubic-bezier(.22,1,.36,1) both', opacity:0, animationFillMode:'forwards', borderColor:s.border }}>
            <div style={{ width:46, height:46, borderRadius:14, background:s.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontSize:'1.9rem', fontWeight:900, color:s.numColor, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:'.72rem', color:'#94A3B8', marginTop:4, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em' }}>{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── GRILLE PRINCIPALE ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 0.6fr', gap:24 }}>

        {/* LISTE */}
        <div style={{ animation:'fadeUpD .5s .1s ease both', opacity:0, animationFillMode:'forwards', background:'#fff', border:'1.5px solid #F1F5F9', borderRadius:22, padding:26, boxShadow:'0 2px 14px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22, paddingBottom:16, borderBottom:'1.5px solid #F1F5F9' }}>
            <div style={{ width:4, height:18, background:'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius:2 }}/>
            <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', margin:0, fontSize:'1rem', fontWeight:900, color:'#0F172A' }}>📋 Séances planifiées</h3>
          </div>

          {dispos.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'#94A3B8' }}>
              <div style={{ fontSize:'3rem', marginBottom:16 }}>📭</div>
              <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'#0F172A', marginBottom:8 }}>Aucune séance planifiée</div>
              <div style={{ fontSize:'.84rem', fontStyle:'italic', marginBottom:22 }}>Ajoutez votre première disponibilité</div>
              <button className="new-seance-btn" onClick={() => setShowForm(true)} style={{ margin:'0 auto' }}>+ Nouvelle séance</button>
            </div>
          ) : (
            <div>
              {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([dateKey, seances]) => (
                <div key={dateKey} style={{ marginBottom:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <div style={{ width:3, height:14, background:'#00153D', borderRadius:2 }}/>
                    <div style={{ fontSize:'.7rem', fontWeight:900, color:'#00153D', textTransform:'uppercase', letterSpacing:'.1em', fontFamily:'Cabinet Grotesk,sans-serif' }}>
                      {dateKey!=='Sans date' ? formatDate(dateKey) : 'Sans date'}
                    </div>
                  </div>

                  {seances.map((d, idx) => {
                    const mi  = MODE_INFO[d.mode_seance || profMode] || MODE_INFO.presentiel;
                    const dur = getDuration(d.heure_debut?.slice(0,5), d.heure_fin?.slice(0,5));
                    const pct = d.nb_max_etudiants > 0 ? Math.round((d.nb_inscrits/d.nb_max_etudiants)*100) : 0;
                    const full = pct >= 100;

                    return (
                      <div key={d.id} className="dispo-card"
                        style={{ animationDelay:`${idx*50}ms`, animation:'slideD .4s cubic-bezier(.22,1,.36,1) both', opacity:0, animationFillMode:'forwards', borderLeft:`3px solid ${full?'#EF4444':mi.color}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                              <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, color:'#0F172A', fontSize:'.98rem' }}>
                                🕒 {d.heure_debut?.slice(0,5)} – {d.heure_fin?.slice(0,5)}
                              </span>
                              {dur && (
                                <span style={{ fontSize:'.68rem', background:'#EEF2FF', color:'#4F46E5', padding:'2px 9px', borderRadius:20, fontWeight:800, border:'1.5px solid #C7D2FE', fontFamily:'Cabinet Grotesk,sans-serif' }}>
                                  ⏱ {dur}
                                </span>
                              )}
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                              <span style={{ fontSize:'.7rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:mi.bg, color:mi.color, border:`1.5px solid ${mi.border}` }}>
                                {mi.icon} {mi.label}
                              </span>
                              {full && (
                                <span style={{ fontSize:'.68rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:'#FEF2F2', color:'#DC2626', border:'1.5px solid #FCA5A5' }}>
                                  🔴 Complet
                                </span>
                              )}
                            </div>
                            {/* ── Niveau de la séance ── */}
                            {d.niveau_nom && (
                              <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginBottom:6, fontSize:'.68rem', fontWeight:700, padding:'2px 10px', borderRadius:20, background:'#EEF2FF', color:'#4F46E5', border:'1.5px solid #C7D2FE' }}>
                                🎓 {d.niveau_nom}
                              </div>
                            )}
                            {/* ── Description de la séance ── */}
                            {d.description && (
                              <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8, padding:'8px 12px', background:'#F0F4FF', borderRadius:10, border:'1.5px solid #C7D2FE' }}>
                                <span style={{ fontSize:'.85rem', flexShrink:0, marginTop:1 }}>📝</span>
                                <div style={{ fontSize:'.78rem', color:'#1E40AF', lineHeight:1.55, fontStyle:'italic', fontWeight:500 }}>{d.description}</div>
                              </div>
                            )}
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <span style={{ fontSize:'.75rem', color:'#64748B', fontWeight:700 }}>👥 {d.nb_inscrits}/{d.nb_max_etudiants}</span>
                              <div style={{ width:110, height:6, background:'#F1F5F9', borderRadius:4, overflow:'hidden' }}>
                                <div style={{ height:'100%', borderRadius:4, width:`${Math.min(pct,100)}%`, background:full?'#EF4444':pct>=70?'#F59E0B':'#10B981', transition:'width .5s ease' }}/>
                              </div>
                              <span style={{ fontSize:'.7rem', color:full?'#DC2626':'#94A3B8', fontWeight: full?800:600 }}>
                                {full ? 'Complet' : `${100-pct}% libre`}
                              </span>
                            </div>
                          </div>
                          <button className="del-btn" onClick={() => handleDelete(d)} title="Supprimer ce créneau">🗑</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CALENDRIER */}
        <div style={{ position:'sticky', top:80, alignSelf:'start', background:'#fff', border:'1.5px solid #F1F5F9', borderRadius:22, padding:24, boxShadow:'0 2px 14px rgba(0,0,0,0.04)', animation:'fadeUpD .5s .18s ease both', opacity:0, animationFillMode:'forwards' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, paddingBottom:16, borderBottom:'1.5px solid #F1F5F9' }}>
            <div style={{ width:4, height:18, background:'linear-gradient(180deg,#F59E0B,#EF4444)', borderRadius:2 }}/>
            <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', margin:0, fontSize:'1rem', fontWeight:900, color:'#0F172A' }}>📅 Calendrier</h3>
          </div>
          <SmartCalendar dispos={dispos}/>
        </div>
      </div>

      {/* ═══════════════ MODAL NOUVELLE SÉANCE ═══════════════ */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(10px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:26, border:'1.5px solid #F1F5F9', width:'100%', maxWidth:500, maxHeight:'92vh', overflowY:'auto', padding:32, boxShadow:'0 48px 120px rgba(0,0,0,0.2)', animation:'modalInD .28s cubic-bezier(.34,1.56,.64,1)', fontFamily:'Instrument Sans,sans-serif' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, paddingBottom:16, borderBottom:'1.5px solid #F1F5F9' }}>
              <div>
                <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', margin:0, fontSize:'1.15rem', fontWeight:900, color:'#0F172A', letterSpacing:'-.02em' }}>Nouvelle séance</h3>
                <div style={{ fontSize:'.74rem', color:'#94A3B8', marginTop:3, fontWeight:500 }}>Ajoutez un créneau de disponibilité</div>
              </div>
              <button onClick={() => { setShowForm(false); resetForm(); }}
                style={{ width:34, height:34, borderRadius:9, background:'#F8FAFC', border:'1.5px solid #E2E8F0', cursor:'pointer', color:'#64748B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#FEE2E2'; e.currentTarget.style.color='#DC2626'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#F8FAFC'; e.currentTarget.style.color='#64748B'; }}>✕</button>
            </div>

            <form onSubmit={handleAdd} style={{ display:'flex', flexDirection:'column', gap:22 }}>

              {/* Date */}
              <div>
                <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, fontFamily:'Cabinet Grotesk,sans-serif' }}>📆 Date de la séance</div>
                <input type="date" className="modal-inp" required
                  min={new Date().toISOString().split('T')[0]}
                  value={newDispo.date_specifique}
                  onChange={e => setNewDispo({...newDispo,date_specifique:e.target.value})}/>
                {newDispo.date_specifique && (
                  <div style={{ marginTop:7, fontSize:'.8rem', color:'#1D4ED8', fontWeight:700, fontFamily:'Cabinet Grotesk,sans-serif' }}>
                    📍 {formatDate(newDispo.date_specifique)}
                  </div>
                )}
              </div>

              {/* Horaires */}
              <div>
                <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, fontFamily:'Cabinet Grotesk,sans-serif' }}>🕒 Horaires</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[['Début','heure_debut'],['Fin','heure_fin']].map(([lbl,key]) => (
                    <div key={key}>
                      <div style={{ fontSize:'.74rem', color:'#94A3B8', marginBottom:6, fontWeight:600 }}>{lbl}</div>
                      <input type="time" className="modal-inp" required
                        value={newDispo[key]}
                        onChange={e => setNewDispo({...newDispo,[key]:e.target.value})}/>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:9 }}>
                  {getDuration(newDispo.heure_debut,newDispo.heure_fin) ? (
                    <span style={{ fontSize:'.8rem', background:'#EEF2FF', color:'#4F46E5', padding:'4px 14px', borderRadius:20, fontWeight:800, border:'1.5px solid #C7D2FE', fontFamily:'Cabinet Grotesk,sans-serif' }}>
                      ⏱ Durée : {getDuration(newDispo.heure_debut,newDispo.heure_fin)}
                    </span>
                  ) : newDispo.heure_debut && newDispo.heure_fin ? (
                    <span style={{ fontSize:'.8rem', color:'#DC2626', fontWeight:600 }}>⚠️ L'heure de fin doit être après l'heure de début</span>
                  ) : null}
                </div>
              </div>

              {/* Mode */}
              <div>
                <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10, fontFamily:'Cabinet Grotesk,sans-serif' }}>🎓 Mode d'enseignement</div>
                {showModeChoice ? (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { value:'en_ligne',   icon:'🌐', label:'En ligne',   color:'#1D4ED8', bg:'#EFF6FF',  border:'#BFDBFE' },
                      { value:'presentiel', icon:'🏫', label:'Présentiel', color:'#065F46', bg:'#ECFDF5',  border:'#6EE7B7' },
                    ].map(m => {
                      const active = newDispo.mode_seance===m.value;
                      return (
                        <div key={m.value} onClick={() => setNewDispo({...newDispo,mode_seance:m.value})}
                          style={{ padding:'16px', borderRadius:14, cursor:'pointer', textAlign:'center', border:`1.5px solid ${active?m.border:'#E2E8F0'}`, background:active?m.bg:'#F8FAFC', transition:'all .18s', boxShadow:active?`0 4px 14px rgba(0,0,0,0.07)`:'none' }}>
                          <div style={{ fontSize:'1.5rem', marginBottom:6 }}>{m.icon}</div>
                          <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.88rem', color:active?m.color:'#0F172A' }}>{m.label}</div>
                          {active && <div style={{ fontSize:'.68rem', color:m.color, marginTop:4, fontWeight:700 }}>✓ Sélectionné</div>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding:'14px 18px', borderRadius:13, background:profMode==='en_ligne'?'#EFF6FF':'#ECFDF5', border:`1.5px solid ${profMode==='en_ligne'?'#BFDBFE':'#6EE7B7'}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, color:profMode==='en_ligne'?'#1D4ED8':'#065F46', fontSize:'.9rem' }}>
                      {profMode==='en_ligne'?'🌐 En ligne':'🏫 Présentiel'}
                    </span>
                    {profMode==='en_ligne' && profile?.tarif_en_ligne && <span style={{ fontSize:'.8rem', color:'#64748B', fontWeight:600 }}>💰 {profile.tarif_en_ligne} DT/h</span>}
                    {profMode==='presentiel' && profile?.tarif_presentiel && <span style={{ fontSize:'.8rem', color:'#64748B', fontWeight:600 }}>💰 {profile.tarif_presentiel} DT/h</span>}
                  </div>
                )}
              </div>

              {/* Niveau */}
              <div>
                <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, fontFamily:'Cabinet Grotesk,sans-serif' }}>
                  🎓 Niveau de la séance <span style={{ fontWeight:500, textTransform:'none', letterSpacing:0, color:'#CBD5E1', fontSize:'.65rem' }}>(recommandé)</span>
                </div>
                {niveaux.length > 0 ? (
                  <select className="modal-inp"
                    value={newDispo.niveau_id}
                    onChange={e => setNewDispo({...newDispo, niveau_id: e.target.value})}>
                    <option value="">-- Sélectionner un niveau --</option>
                    {niveaux.map(n => (
                      <option key={n.id} value={n.id}>{n.domaine} — {n.nom}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding:'10px 14px', background:'#F8FAFC', borderRadius:12, border:'1.5px solid #E2E8F0', fontSize:'.84rem', color:'#94A3B8', fontStyle:'italic' }}>
                    Aucun niveau configuré — ajoutez des matières dans votre profil
                  </div>
                )}
                {newDispo.niveau_id && (
                  <div style={{ marginTop:6, fontSize:'.76rem', color:'#065F46', fontWeight:700, background:'#ECFDF5', padding:'5px 12px', borderRadius:9, border:'1px solid #6EE7B7', display:'inline-flex', alignItems:'center', gap:5 }}>
                    ✓ Niveau sélectionné — les étudiants de ce niveau verront cette séance en priorité
                  </div>
                )}
              </div>

              {/* Capacité */}
              <div>
                <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10, fontFamily:'Cabinet Grotesk,sans-serif' }}>👥 Capacité maximale</div>
                <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                  {[1,2,3,5,10].map(n => (
                    <button key={n} type="button" className={`cap-btn${newDispo.nb_max_etudiants===n?' active':''}`}
                      onClick={() => setNewDispo({...newDispo,nb_max_etudiants:n})}>
                      {n===1?'👤 1':n}
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <input type="number" min="1" max="50" className="modal-inp"
                    placeholder="Ou saisir un nombre..."
                    value={newDispo.nb_max_etudiants}
                    onChange={e => setNewDispo({...newDispo,nb_max_etudiants:parseInt(e.target.value)||1})}
                    style={{ flex:1 }}/>
                  <span style={{ whiteSpace:'nowrap', fontSize:'.84rem', color:'#94A3B8', fontWeight:600 }}>
                    étudiant{newDispo.nb_max_etudiants>1?'s':''}
                  </span>
                </div>
                {newDispo.nb_max_etudiants > 1 && (
                  <div style={{ marginTop:7, fontSize:'.78rem', color:'#B45309', fontWeight:600, background:'#FFFBEB', padding:'6px 12px', borderRadius:9, border:'1px solid #FDE68A' }}>
                    ℹ️ Séance de groupe ({newDispo.nb_max_etudiants} étudiants max)
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, fontFamily:'Cabinet Grotesk,sans-serif' }}>
                  📝 Description de la séance <span style={{ fontWeight:500, textTransform:'none', letterSpacing:0, color:'#CBD5E1', fontSize:'.65rem' }}>(optionnel)</span>
                </div>
                <textarea className="modal-inp" rows={3}
                  placeholder="Ex: Révision du chapitre sur les équations, introduction aux fractions..."
                  value={newDispo.description}
                  onChange={e => setNewDispo({...newDispo, description:e.target.value})}
                  style={{ resize:'vertical', minHeight:80, fontFamily:'Instrument Sans,sans-serif', fontSize:'.88rem', lineHeight:1.6 }}
                />
                {newDispo.description && (
                  <div style={{ marginTop:5, fontSize:'.73rem', color:'#64748B', fontWeight:500 }}>
                    {newDispo.description.length}/500 caractères
                  </div>
                )}
              </div>

              {/* Récap */}
              {newDispo.date_specifique && getDuration(newDispo.heure_debut,newDispo.heure_fin) && (
                <div style={{ background:'#F0F4FF', border:'1.5px solid #C7D2FE', borderRadius:16, padding:16 }}>
                  <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'.7rem', color:'#1E40AF', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:12 }}>📋 Récapitulatif</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:'.85rem', color:'#374151' }}>
                    {[
                      ['📆', formatDate(newDispo.date_specifique)],
                      ['🕒', `${newDispo.heure_debut} → ${newDispo.heure_fin} (${getDuration(newDispo.heure_debut,newDispo.heure_fin)})`],
                      [newDispo.mode_seance==='en_ligne'?'🌐':'🏫', newDispo.mode_seance==='en_ligne'?'En ligne':'Présentiel'],
                      ['👥', `${newDispo.nb_max_etudiants} étudiant${newDispo.nb_max_etudiants>1?'s':''} max`],
                      ...(newDispo.niveau_id && niveaux.find(n=>String(n.id)===String(newDispo.niveau_id)) ? [['🎓', niveaux.find(n=>String(n.id)===String(newDispo.niveau_id))?.nom || '']] : []),
                    ...(newDispo.description ? [['📝', newDispo.description.slice(0,60)+(newDispo.description.length>60?'…':'')]] : []),
                    ].map(([icon,val]) => (
                      <div key={icon} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span>{icon}</span>
                        <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:700 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div style={{ display:'flex', gap:12 }}>
                <button type="submit" className="submit-btn" disabled={submitting || !getDuration(newDispo.heure_debut,newDispo.heure_fin)}>
                  {submitting
                    ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                        <span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spinD .8s linear infinite', display:'inline-block' }}/> Création...
                      </span>
                    : '✅ Créer la séance'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                  style={{ flex:1, padding:13, borderRadius:13, border:'1.5px solid #E2E8F0', background:'#F8FAFC', color:'#64748B', fontWeight:700, cursor:'pointer', fontFamily:'Instrument Sans,sans-serif', transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#F1F5F9'; e.currentTarget.style.borderColor='#C7D2FE'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#F8FAFC'; e.currentTarget.style.borderColor='#E2E8F0'; }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}