import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProfModal from './ProfModal';

/* ─── Helpers ── */
function Stars({ n }) {
  const v = parseFloat(n) || 0;
  return (
    <span style={{ display:'inline-flex', gap:1 }}>
      {[1,2,3,4,5].map(i=>(
        <span key={i} style={{ color:i<=Math.round(v)?'#f59e0b':'var(--border)', fontSize:12 }}>★</span>
      ))}
      <span style={{ fontSize:11, color:'var(--text2)', marginLeft:3 }}>{v.toFixed(1)}</span>
    </span>
  );
}

function ScorePill({ score }) {
  const cfg = score>=80 ? {color:'#16a34a',bg:'rgba(22,163,74,0.1)',border:'rgba(22,163,74,0.25)',label:'Excellent'}
    : score>=65 ? {color:'#6c63ff',bg:'rgba(108,99,255,0.1)',border:'rgba(108,99,255,0.25)',label:'Très bon'}
    : score>=50 ? {color:'#d97706',bg:'rgba(217,119,6,0.1)',border:'rgba(217,119,6,0.25)',label:'Bon'}
    : {color:'#dc2626',bg:'rgba(220,38,38,0.1)',border:'rgba(220,38,38,0.25)',label:'Possible'};
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'2px 9px',borderRadius:20,background:cfg.bg,border:`1px solid ${cfg.border}`,fontSize:11,fontWeight:700,color:cfg.color }}>
      <span style={{ width:6,height:6,borderRadius:'50%',background:cfg.color,display:'inline-block' }}/>
      {score}/100 · {cfg.label}
    </span>
  );
}

/* ─── Carte Prof ── */
function ProfCard({ prof, rank, onView }) {
  const [hov, setHov] = useState(false);
  const nom   = prof.nom || `${prof.user_prenom||''} ${prof.user_nom||''}`.trim();
  const score = prof.score?.total || 0;
  const medals = ['🥇','🥈','🥉'];
  const tarifs = [prof.tarif_en_ligne, prof.tarif_presentiel].filter(v=>v&&parseFloat(v)>0).map(Number);
  const tarifMin = tarifs.length ? Math.min(...tarifs) : null;
  const modeInfo = {
    en_ligne:   {label:'🌐 En ligne',   color:'#0ea5e9'},
    presentiel: {label:'🏫 Présentiel', color:'#16a34a'},
    les_deux:   {label:'🔀 Les deux',   color:'#6c63ff'},
  }[prof.mode_enseignement] || {label:'🏫 Présentiel',color:'#16a34a'};
  const barColor = score>=80?'#16a34a':score>=65?'#6c63ff':score>=50?'#d97706':'#dc2626';

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'var(--card)', border:hov?'1.5px solid #6c63ff':'1.5px solid var(--border)', borderRadius:16, padding:'14px 16px', transition:'all .2s', boxShadow:hov?'0 6px 20px rgba(108,99,255,0.15)':'0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
        <span style={{ fontSize:18,flexShrink:0 }}>{medals[rank-1]||`#${rank}`}</span>
        <div style={{ width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff,#ff6584)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,overflow:'hidden',flexShrink:0 }}>
          {prof.photo_url ? <img src={`http://localhost:8001${prof.photo_url}`} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : '👨‍🏫'}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{nom}</div>
          <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
            <Stars n={prof.note_moyenne}/>
            {prof.ville&&<span style={{ fontSize:11,color:'var(--text2)' }}>📍 {prof.ville}</span>}
          </div>
          {/* Contact rapide */}
          {(prof.email||prof.user_email||prof.telephone)&&(
            <div style={{ display:'flex',gap:5,marginTop:6,flexWrap:'wrap' }}>
              {prof.telephone&&(
                <a href={`tel:${prof.telephone}`}
                  onClick={e=>e.stopPropagation()}
                  style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,background:'#ECFDF5',color:'#065F46',border:'1.5px solid #6EE7B7',textDecoration:'none',flexShrink:0 }}>
                  📞 {prof.telephone}
                </a>
              )}
              {(prof.email||prof.user_email)&&(
                <a href={`mailto:${prof.email||prof.user_email}`}
                  onClick={e=>e.stopPropagation()}
                  title={prof.email||prof.user_email}
                  style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,background:'#EFF6FF',color:'#1D4ED8',border:'1.5px solid #BFDBFE',textDecoration:'none',minWidth:0,overflow:'hidden' }}>
                  ✉️ <span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160 }}>{prof.email||prof.user_email}</span>
                </a>
              )}
            </div>
          )}
        </div>
        <div style={{ flexShrink:0,textAlign:'right' }}>
          {tarifMin&&<div style={{ fontWeight:800,fontSize:14,color:'#16a34a' }}>{tarifMin} DT/h</div>}
          <div style={{ fontSize:11,color:modeInfo.color,fontWeight:600 }}>{modeInfo.label}</div>
        </div>
      </div>
      <div style={{ marginBottom:10 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5 }}>
          <span style={{ fontSize:11,color:'var(--text2)',fontWeight:600 }}>Score de matching</span>
          <ScorePill score={score}/>
        </div>
        <div style={{ height:5,background:'var(--surface2)',borderRadius:3,overflow:'hidden' }}>
          <div style={{ height:'100%',width:`${score}%`,background:barColor,borderRadius:3,transition:'width .8s ease' }}/>
        </div>
        <div style={{ display:'flex',gap:5,marginTop:5,flexWrap:'wrap' }}>
          {prof.score?.details && [
            {icon:'📚',key:'matiere',    max:25},
            {icon:'🎓',key:'niveau',     max:40},
            {icon:'📍',key:'ville',      max:15},
            {icon:'💰',key:'budget',     max:10},
            {icon:'📡',key:'mode',       max: 5},
            {icon:'⭐',key:'reputation', max: 5},
          ].map(c=>{
            const val = prof.score.details[c.key]??0;
            const full = val>=c.max;
            const partial = val>0&&!full;
            const color = full?'#16a34a':partial?'#d97706':'#dc2626';
            return (
              <span key={c.key} title={`${c.key}: ${val}/${c.max}`}
                style={{ fontSize:10,color,fontWeight:700,padding:'2px 7px',borderRadius:20,background:full?'rgba(22,163,74,0.09)':partial?'rgba(217,119,6,0.09)':'rgba(220,38,38,0.06)',border:`1px solid ${color}30`,display:'inline-flex',alignItems:'center',gap:3 }}>
                {c.icon} {val}/{c.max}
              </span>
            );
          })}
        </div>
      </div>
      {/* Avertissements */}
      {prof.warnings && prof.warnings.length > 0 && (
        <div style={{ marginBottom:8 }}>
          {prof.warnings.map((w,i) => (
            <div key={i} style={{ fontSize:11,color:'#d97706',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:8,padding:'4px 9px',marginBottom:4,display:'flex',gap:5,alignItems:'center' }}>
              <span>⚠️</span> {w}
            </div>
          ))}
        </div>
      )}
      {prof.bio&&<p style={{ fontSize:12,color:'var(--text2)',lineHeight:1.5,margin:'0 0 10px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{prof.bio}</p>}
      {/* Créneaux disponibles */}
      {prof.disponibilites && prof.disponibilites.length > 0 ? (
        <div style={{ marginBottom:10 }}>
          {prof.disponibilites.slice(0,2).map((d,i) => (
            <div key={i} style={{ fontSize:11,color:'var(--text)',padding:'5px 9px',background:'rgba(22,163,74,0.07)',border:'1px solid rgba(22,163,74,0.2)',borderRadius:8,marginBottom:4,display:'flex',alignItems:'center',gap:6 }}>
              <span>📅</span>
              <span style={{ fontWeight:700 }}>{new Date(d.date).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}</span>
              <span style={{ color:'var(--text2)' }}>{d.heure_debut}–{d.heure_fin}</span>
              <span style={{ marginLeft:'auto',fontSize:10,color:d.mode==='en_ligne'?'#0ea5e9':'#16a34a',fontWeight:600 }}>{d.mode==='en_ligne'?'🌐':'🏫'}</span>
              {d.nb_places > 0 && <span style={{ fontSize:10,color:'#16a34a' }}>{d.nb_places} place{d.nb_places>1?'s':''}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize:11,color:'var(--text3)',padding:'5px 9px',background:'var(--surface2)',borderRadius:8,marginBottom:10,textAlign:'center' }}>
          📅 Aucun créneau — contacter directement
        </div>
      )}
      {/* Ligne contact bas de carte */}
      {(prof.email||prof.user_email||prof.telephone)&&(
        <div style={{ display:'flex',gap:6,marginBottom:8,padding:'8px 10px',background:'var(--surface2)',borderRadius:9,border:'1px solid var(--border)' }}>
          <span style={{ fontSize:10,color:'var(--text2)',fontWeight:600,alignSelf:'center',marginRight:2,flexShrink:0 }}>📬</span>
          {prof.telephone&&(
            <a href={`tel:${prof.telephone}`}
              onClick={e=>e.stopPropagation()}
              style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:8,background:'#ECFDF5',color:'#065F46',border:'1px solid #6EE7B7',textDecoration:'none',flexShrink:0 }}>
              📞 {prof.telephone}
            </a>
          )}
          {(prof.email||prof.user_email)&&(
            <a href={`mailto:${prof.email||prof.user_email}`}
              onClick={e=>e.stopPropagation()}
              title={prof.email||prof.user_email}
              style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:8,background:'#EFF6FF',color:'#1D4ED8',border:'1px solid #BFDBFE',textDecoration:'none',flex:1,minWidth:0 }}>
              ✉️ <span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{prof.email||prof.user_email}</span>
            </a>
          )}
        </div>
      )}
      <div style={{ display:'flex',gap:8 }}>
        <button onClick={()=>onView(prof)} style={{ flex:1,padding:'8px 0',background:'var(--surface2)',border:'1.5px solid var(--border)',borderRadius:9,fontSize:12,fontWeight:600,cursor:'pointer',color:'var(--text)',transition:'all .15s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#6c63ff';e.currentTarget.style.color='#6c63ff';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text)';}}>
          👤 Voir profil
        </button>
        <button onClick={()=>onView(prof)} style={{ flex:2,padding:'8px 0',background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',border:'none',borderRadius:9,fontSize:12,fontWeight:700,cursor:'pointer',color:'#fff',boxShadow:'0 2px 8px rgba(108,99,255,0.3)',transition:'all .2s' }}
          onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
          onMouseLeave={e=>e.currentTarget.style.transform='none'}>
          📅 Réserver un cours
        </button>
      </div>
    </div>
  );
}

/* ─── Bulle message ── */
function Message({ msg, onViewProf }) {
  const isUser = msg.role==='user';
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:isUser?'flex-end':'flex-start',marginBottom:20,gap:8 }}>
      <div style={{ display:'flex',alignItems:'flex-end',gap:8,maxWidth:'80%',flexDirection:isUser?'row-reverse':'row' }}>
        <div style={{ width:32,height:32,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,background:isUser?'linear-gradient(135deg,#6c63ff,#8b5cf6)':'linear-gradient(135deg,#f59e0b,#ef4444)',boxShadow:'0 2px 6px rgba(0,0,0,0.15)' }}>
          {isUser?'👤':'🤖'}
        </div>
        <div>
          <div style={{ padding:'11px 15px',borderRadius:isUser?'18px 18px 4px 18px':'18px 18px 18px 4px',background:isUser?'linear-gradient(135deg,#6c63ff,#8b5cf6)':'var(--surface)',color:isUser?'#fff':'var(--text)',fontSize:14,lineHeight:1.65,border:isUser?'none':'1px solid var(--border)',boxShadow:isUser?'0 2px 8px rgba(108,99,255,0.25)':'0 1px 4px rgba(0,0,0,0.06)',whiteSpace:'pre-wrap',wordBreak:'break-word' }}>
            {msg.content}
          </div>
          <div style={{ fontSize:11,color:'var(--text2)',marginTop:3,textAlign:isUser?'right':'left' }}>{msg.time}</div>
        </div>
      </div>
      {/* Barre de progression collecte critères */}
      {!isUser && msg.prochain_critere && (!msg.profs || msg.profs.length === 0) && (
        <div style={{ paddingLeft:40, maxWidth:460 }}>
          <ProgressBar prochain={msg.prochain_critere} criteres={msg.criteres || {}} />
        </div>
      )}

      {!isUser&&msg.profs&&msg.profs.length>0&&(
        <div style={{ paddingLeft:40,width:'100%',maxWidth:540,display:'flex',flexDirection:'column',gap:10 }}>
          <div style={{ fontSize:12,color:'var(--text2)',fontWeight:600,marginBottom:2 }}>
            {msg.alternative ? (
              <span style={{ color:'#d97706' }}>
                💡 Aucun prof en <strong>{msg.alternative.matiere_originale}</strong> — voici des alternatives en <strong>{msg.alternative.matiere_alternative}</strong>
              </span>
            ) : (
              <>🎯 {msg.profs.length} professeur{msg.profs.length>1?'s':''} trouvé{msg.profs.length>1?'s':''} — profil complet</>
            )}
          </div>
          {msg.profs.map((prof,i)=><ProfCard key={prof.id} prof={prof} rank={i+1} onView={onViewProf}/>)}
        </div>
      )}
      {!isUser && msg.noProfs && msg.besoin_complet && (!msg.profs || msg.profs.length === 0) && (
        <div style={{ paddingLeft:40,maxWidth:420 }}>
          <div style={{ padding:'10px 14px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:12,fontSize:13,color:'var(--text)',display:'flex',gap:8,alignItems:'flex-start' }}>
            <span style={{ fontSize:16 }}>💡</span>
            <span>Aucun professeur trouvé. Essayez un autre budget, mode ou ville.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Typing() {
  return (
    <div style={{ display:'flex',alignItems:'flex-end',gap:8,marginBottom:16 }}>
      <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🤖</div>
      <div style={{ padding:'12px 16px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'18px 18px 18px 4px',display:'flex',gap:5,alignItems:'center' }}>
        <style>{`@keyframes db{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}} .db{width:7px;height:7px;border-radius:50%;background:#6c63ff;animation:db 1.2s infinite;}`}</style>
        <div className="db" style={{ animationDelay:'0s' }}/><div className="db" style={{ animationDelay:'.15s' }}/><div className="db" style={{ animationDelay:'.3s' }}/>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Je cherche un prof de maths pour le bac",
  "Prof de physique en ligne, budget 40 DT/h",
  "Cours d'anglais pour collège à Tunis",
  "Professeur d'informatique / programmation",
];

// Étapes dynamiques selon domaine — calculées depuis criteres
function getEtapes(criteres) {
  const domaine = criteres?.domaine_type;
  if (!domaine) return [
    { key:'domaine_type', label:'Domaine', icon:'🏫' },
  ];
  if (domaine === 'academique') {
    const etapes = [
      { key:'domaine_type', label:'Domaine',     icon:'🏫' },
      { key:'matiere',      label:'Matière',     icon:'📚' },
      { key:'niveau',       label:'Niveau',      icon:'🎓' },
    ];
    // Ajouter sous_niveau seulement si niveau est défini
    if (criteres?.niveau) {
      etapes.push({ key:'sous_niveau', label:'Sous-niveau', icon:'📋' });
    }
    etapes.push(
      { key:'mode',         label:'Mode',        icon:'📡' },
    );
    if (criteres?.mode === 'presentiel') {
      etapes.push({ key:'ville', label:'Ville', icon:'📍' });
    }
    etapes.push({ key:'budget_max', label:'Budget', icon:'💰' });
    return etapes;
  }
  return [
    { key:'domaine_type', label:'Domaine',    icon:'💼' },
    { key:'matiere',      label:'Spécialité', icon:'🛠' },
    { key:'mode',         label:'Mode',       icon:'📡' },
    { key:'budget_max',   label:'Budget',     icon:'💰' },
  ];
}

function ProgressBar({ prochain, criteres }) {
  const ETAPES = getEtapes(criteres);
  const done = ETAPES.filter(e => criteres && criteres[e.key]).length;
  const idx  = ETAPES.findIndex(e => e.key === prochain);
  return (
    <div style={{ padding:'10px 14px',background:'rgba(108,99,255,0.06)',border:'1px solid rgba(108,99,255,0.15)',borderRadius:12,marginTop:4 }}>
      <div style={{ fontSize:11,color:'var(--text2)',fontWeight:600,marginBottom:8 }}>
        Collecte du profil — {done}/{ETAPES.length} critères
      </div>
      <div style={{ display:'flex',gap:5,alignItems:'center' }}>
        {ETAPES.map((e,i) => {
          const isDone    = i < done;
          const isCurrent = i === done;
          return (
            <React.Fragment key={e.key}>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
                <div style={{ width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,
                  background:isDone?'#6c63ff':isCurrent?'rgba(108,99,255,0.15)':'var(--surface2)',
                  border:isDone?'2px solid #6c63ff':isCurrent?'2px solid #6c63ff':'2px solid var(--border)',
                  color:isDone?'#fff':isCurrent?'#6c63ff':'var(--text2)',fontWeight:700 }}>
                  {isDone ? '✓' : e.icon}
                </div>
                <div style={{ fontSize:9,color:isDone||isCurrent?'#6c63ff':'var(--text3)',fontWeight:isCurrent?700:400 }}>{e.label}</div>
              </div>
              {i < ETAPES.length-1 && (
                <div style={{ flex:1,height:2,background:i<done?'#6c63ff':'var(--border)',borderRadius:1,marginBottom:14 }}/>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════════ */
export default function Chatbot() {
  const { user } = useAuth();

  // ── États sessions ──
  const [sessions, setSessions]         = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [editingId, setEditingId]       = useState(null);
  const [editTitle, setEditTitle]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── États chat ──
  const [msgs, setMsgs]               = useState([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [welcome, setWelcome]         = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const taRef     = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs,loading]);

  // ── Charger les sessions ──
  useEffect(()=>{
    loadSessions();
  },[]);

  const loadSessions = async () => {
    try {
      const r = await api.get('/api/chatbot/sessions');
      setSessions(r.data || []);
    } catch {}
    finally { setLoadingSessions(false); }
  };

  // ── Créer une nouvelle session ──
  const newSession = async () => {
    try {
      const r = await api.post('/api/chatbot/sessions', { titre: 'Nouvelle conversation' });
      const s = r.data;
      setSessions(prev => [s, ...prev]);
      setActiveSession(s);
      setMsgs([]);
      setWelcome(true);
      setInput('');
    } catch { alert('Erreur création session'); }
  };

  // ── Charger une session ──
  const openSession = async (session) => {
    setActiveSession(session);
    setWelcome(false);
    try {
      const r = await api.get(`/api/chatbot/sessions/${session.id}/messages`);
      const messages = (r.data || []).map(m => ({
        role:    m.role,
        content: m.content,
        time:    new Date(m.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
        profs:   [],
      }));
      setMsgs(messages);
    } catch { setMsgs([]); }
  };

  // ── Supprimer une session ──
  const deleteSession = async (id) => {
    try {
      await api.delete(`/api/chatbot/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
        setMsgs([]);
        setWelcome(true);
      }
    } catch { alert('Erreur suppression'); }
    setConfirmDelete(null);
  };

  // ── Renommer une session ──
  const renameSession = async (id, titre) => {
    try {
      await api.put(`/api/chatbot/sessions/${id}`, { titre });
      setSessions(prev => prev.map(s => s.id === id ? {...s, titre} : s));
      if (activeSession?.id === id) setActiveSession(prev => ({...prev, titre}));
    } catch {}
    setEditingId(null);
  };

  const now = () => new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});

  const handleView = async (prof) => {
    // Récupérer sous_niveau et mode depuis le dernier message assistant qui a des critères
    let sous_niveau = null;
    let mode = null;
    // Chercher dans les messages le dernier critère connu
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m.criteres) {
        sous_niveau = m.criteres.sous_niveau || null;
        mode        = m.criteres.mode        || null;
        break;
      }
    }
    // Construire les query params
    const params = new URLSearchParams();
    if (sous_niveau) params.append('sous_niveau', sous_niveau);
    if (mode)        params.append('mode', mode);
    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      const r = await api.get(`/api/chatbot/prof-detail/${prof.id}${qs}`);
      setSelectedProf(r.data);
    } catch {
      setSelectedProf(prof);
    }
  };

  // ── Envoyer un message ──
  const send = useCallback(async (text) => {
    const txt = (text || input).trim();
    if (!txt || loading) return;

    setInput('');
    setWelcome(false);
    if (taRef.current) taRef.current.style.height = 'auto';

    // Créer session si pas active
    let sessionId = activeSession?.id;
    if (!sessionId) {
      try {
        const r = await api.post('/api/chatbot/sessions', { titre: txt.slice(0,50) });
        const s = r.data;
        setSessions(prev => [s, ...prev]);
        setActiveSession(s);
        sessionId = s.id;
      } catch {}
    }

    const userMsg = { role:'user', content:txt, time:now(), profs:[] };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    // Sauvegarder message user en base
    if (sessionId) {
      try { await api.post(`/api/chatbot/sessions/${sessionId}/messages`, { role:'user', content:txt }); } catch {}
    }

    const history = [...msgs, userMsg].map(m=>({role:m.role,content:m.content}));

    try {
      const res = await api.post('/api/chatbot/chat', { messages: history });
      const { reply, top3_profs, besoin_complet, prochain_critere } = res.data;
      const hasProfs = top3_profs && top3_profs.length > 0;

      const assistantMsg = {
        role:           'assistant',
        content:        reply,
        time:           now(),
        profs:          hasProfs ? top3_profs : [],
        noProfs:        res.data.noProfs,
        besoin_complet,
        prochain_critere,
        alternative:    res.data.alternative || null,
        criteres:       res.data.criteres || null,
      };
      setMsgs(prev => [...prev, assistantMsg]);

      // Sauvegarder réponse assistant en base
      if (sessionId) {
        try { await api.post(`/api/chatbot/sessions/${sessionId}/messages`, { role:'assistant', content:reply }); } catch {}
      }

      // Mettre à jour le titre de la session avec le premier message
      const isFirst = msgs.length === 0;
      if (isFirst && sessionId) {
        const titre = txt.slice(0,50) + (txt.length>50?'…':'');
        setSessions(prev => prev.map(s => s.id===sessionId ? {...s,titre} : s));
        if (activeSession?.id === sessionId) setActiveSession(prev => ({...prev, titre}));
      }

    } catch(e) {
      const s = e?.response?.status;
      const m = s===503?'⏳ Modèle en démarrage, réessayez.':s===429?'⚠️ Trop de requêtes.':s===504?'⏱️ Délai dépassé.':'❌ Erreur. Réessayez.';
      setMsgs(prev => [...prev, {role:'assistant',content:m,time:now(),profs:[]}]);
    } finally {
      setLoading(false);
      setTimeout(()=>inputRef.current?.focus(),100);
    }
  },[input, msgs, loading, activeSession]);

  const onKey = (e) => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} };

  // ── Formatage date session ──
  const fmtDate = (str) => {
    if (!str) return '';
    const d = new Date(str);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Aujourd\'hui';
    if (diff === 1) return 'Hier';
    if (diff < 7)  return `Il y a ${diff} jours`;
    return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
  };

  return (
    <div style={{ display:'flex', height:'calc(100vh - 64px)', background:'var(--bg)' }}>
      <style>{`
        .chat-scroll::-webkit-scrollbar{width:4px}
        .chat-scroll::-webkit-scrollbar-track{background:transparent}
        .chat-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
        .session-item{padding:10px 12px;border-radius:11px;cursor:pointer;transition:all .15s;border:1.5px solid transparent;position:relative;}
        .session-item:hover{background:var(--surface2);border-color:var(--border);}
        .session-item.active{background:rgba(108,99,255,0.1);border-color:rgba(108,99,255,0.3);}
        .session-actions{display:none;position:absolute;right:8px;top:50%;transform:translateY(-50%);gap:4px;}
        .session-item:hover .session-actions{display:flex;}
        .session-act-btn{width:24px;height:24px;border-radius:6px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .15s;}
      `}</style>

      {/* ════ SIDEBAR SESSIONS ════ */}
      <div style={{ width:260,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',flexShrink:0 }}>

        {/* Header sidebar */}
        <div style={{ padding:'16px 14px 12px',borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
            <div style={{ width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>🤖</div>
            <div style={{ fontWeight:800,fontSize:14,color:'var(--text)' }}>EduBot</div>
          </div>
          <button onClick={newSession}
            style={{ width:'100%',padding:'9px',background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',border:'none',borderRadius:11,cursor:'pointer',color:'#fff',fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:7,boxShadow:'0 3px 10px rgba(108,99,255,0.3)',transition:'all .18s' }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
            onMouseLeave={e=>e.currentTarget.style.transform='none'}>
            ✏️ Nouvelle conversation
          </button>
        </div>

        {/* Liste sessions */}
        <div className="chat-scroll" style={{ flex:1,overflowY:'auto',padding:'10px 10px' }}>
          {loadingSessions ? (
            <div style={{ textAlign:'center',padding:20,color:'var(--text3)',fontSize:12 }}>Chargement...</div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign:'center',padding:20,color:'var(--text3)',fontSize:12,fontStyle:'italic' }}>
              Aucune conversation<br/>Commencez dès maintenant !
            </div>
          ) : (
            sessions.map(s => (
              <div key={s.id} className={`session-item${activeSession?.id===s.id?' active':''}`}
                onClick={()=>{ if(editingId!==s.id) openSession(s); }}>

                {editingId === s.id ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e=>setEditTitle(e.target.value)}
                    onBlur={()=>renameSession(s.id, editTitle||s.titre)}
                    onKeyDown={e=>{ if(e.key==='Enter') renameSession(s.id, editTitle||s.titre); if(e.key==='Escape') setEditingId(null); }}
                    onClick={e=>e.stopPropagation()}
                    style={{ width:'100%',background:'var(--surface)',border:'1.5px solid #6c63ff',borderRadius:7,padding:'4px 8px',fontSize:12,color:'var(--text)',outline:'none',boxSizing:'border-box' }}
                  />
                ) : (
                  <>
                    <div style={{ fontSize:13,fontWeight:activeSession?.id===s.id?700:500,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',paddingRight:52 }}>
                      {s.titre}
                    </div>
                    <div style={{ fontSize:11,color:'var(--text3)',marginTop:2 }}>
                      {fmtDate(s.updated_at || s.created_at)}
                      {s.nb_messages>0 && <span style={{ marginLeft:6 }}>· {s.nb_messages} msgs</span>}
                    </div>
                    <div className="session-actions">
                      {/* Renommer */}
                      <button className="session-act-btn"
                        onClick={e=>{ e.stopPropagation(); setEditingId(s.id); setEditTitle(s.titre); }}
                        style={{ background:'var(--surface2)',color:'var(--text2)' }}
                        title="Renommer"
                        onMouseEnter={e=>{e.currentTarget.style.background='#EFF6FF';e.currentTarget.style.color='#3b82f6';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='var(--surface2)';e.currentTarget.style.color='var(--text2)';}}>
                        ✏️
                      </button>
                      {/* Supprimer */}
                      <button className="session-act-btn"
                        onClick={e=>{ e.stopPropagation(); setConfirmDelete(s); }}
                        style={{ background:'var(--surface2)',color:'var(--text2)' }}
                        title="Supprimer"
                        onMouseEnter={e=>{e.currentTarget.style.background='#FEF2F2';e.currentTarget.style.color='#dc2626';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='var(--surface2)';e.currentTarget.style.color='var(--text2)';}}>
                        🗑
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer sidebar */}
        <div style={{ padding:'10px 14px',borderTop:'1px solid var(--border)',fontSize:11,color:'var(--text3)',textAlign:'center' }}>
          {sessions.length} conversation{sessions.length!==1?'s':''}
        </div>
      </div>

      {/* ════ ZONE CHAT ════ */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',minWidth:0 }}>

        {/* Header */}
        <div style={{ padding:'14px 24px',background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:44,height:44,borderRadius:13,background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:'0 4px 12px rgba(108,99,255,0.35)',flexShrink:0 }}>🤖</div>
            <div>
              <div style={{ fontWeight:800,fontSize:15,color:'var(--text)' }}>
                {activeSession ? activeSession.titre : 'EduBot — Assistant intelligent'}
              </div>
              <div style={{ fontSize:12,color:'var(--text2)',display:'flex',alignItems:'center',gap:5 }}>
                <span style={{ width:7,height:7,borderRadius:'50%',background:'#22c55e',display:'inline-block',boxShadow:'0 0 4px #22c55e' }}/>
                En ligne · Matching IA · EduMatch Tunisie
              </div>
            </div>
          </div>
          {activeSession && (
            <button onClick={newSession}
              style={{ padding:'7px 14px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:9,cursor:'pointer',fontSize:12,color:'var(--text2)',fontWeight:600,display:'flex',alignItems:'center',gap:5,transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#6c63ff';e.currentTarget.style.color='#6c63ff';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)';}}>
              ✏️ Nouveau
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="chat-scroll" style={{ flex:1,overflowY:'auto',padding:'28px 28px 16px' }}>
          {welcome && !activeSession && (
            <div style={{ textAlign:'center',paddingBottom:32 }}>
              <div style={{ width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,#6c63ff,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 20px',boxShadow:'0 8px 24px rgba(108,99,255,0.35)' }}>🤖</div>
              <h2 style={{ fontSize:'1.4rem',fontWeight:800,margin:'0 0 8px',color:'var(--text)' }}>Bonjour {user?.prenom} ! 👋</h2>
              <p style={{ color:'var(--text2)',fontSize:14,lineHeight:1.7,maxWidth:460,margin:'0 auto 28px' }}>
                Je suis <strong style={{ color:'var(--text)' }}>EduBot</strong>, votre assistant de matching EduMatch.
                Décrivez votre besoin et je trouve les meilleurs professeurs.
              </p>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:11,fontWeight:700,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12 }}>Exemples</div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center' }}>
                  {SUGGESTIONS.map(q=>(
                    <button key={q} onClick={()=>send(q)}
                      style={{ padding:'8px 15px',background:'var(--surface)',border:'1.5px solid var(--border)',borderRadius:20,cursor:'pointer',fontSize:13,color:'var(--text)',fontWeight:500,transition:'all .15s' }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='#6c63ff';e.currentTarget.style.color='#6c63ff';e.currentTarget.style.background='rgba(108,99,255,0.06)';}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text)';e.currentTarget.style.background='var(--surface)';}}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {msgs.map((msg,i)=><Message key={i} msg={msg} onViewProf={handleView}/>)}
          {loading&&<Typing/>}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{ padding:'12px 24px 18px',background:'var(--surface)',borderTop:'1px solid var(--border)',flexShrink:0 }}>
          <div style={{ display:'flex',gap:10,alignItems:'flex-end',background:'var(--surface2)',border:'1.5px solid var(--border)',borderRadius:16,padding:'8px 10px 8px 16px',transition:'border-color .2s,box-shadow .2s' }}
            onFocusCapture={e=>{e.currentTarget.style.borderColor='#6c63ff';e.currentTarget.style.boxShadow='0 0 0 3px rgba(108,99,255,0.1)';}}
            onBlurCapture={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';}}>
            <textarea ref={el=>{inputRef.current=el;taRef.current=el;}} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
              placeholder="Ex: Je cherche un prof de maths pour le bac, en ligne, budget 35 DT/h..."
              rows={1} style={{ flex:1,background:'none',border:'none',outline:'none',color:'var(--text)',fontSize:14,lineHeight:1.55,resize:'none',maxHeight:120,fontFamily:'inherit',paddingTop:5,paddingBottom:5,overflowY:'auto' }}
              onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';}}/>
            <button onClick={()=>send()} disabled={!input.trim()||loading}
              style={{ width:40,height:40,borderRadius:11,border:'none',flexShrink:0,cursor:!input.trim()||loading?'not-allowed':'pointer',background:!input.trim()||loading?'var(--border)':'linear-gradient(135deg,#6c63ff,#8b5cf6)',color:'#fff',fontSize:17,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',boxShadow:input.trim()&&!loading?'0 3px 10px rgba(108,99,255,0.3)':'none' }}>
              {loading?'⏳':'➤'}
            </button>
          </div>
          <div style={{ fontSize:11,color:'var(--text2)',marginTop:5,textAlign:'center' }}>Entrée pour envoyer · Shift+Entrée pour saut de ligne</div>
        </div>
      </div>

      {/* ════ PANNEAU LATÉRAL conseils ════ */}
      <div style={{ width:240,background:'var(--surface)',borderLeft:'1px solid var(--border)',display:'flex',flexDirection:'column',flexShrink:0 }}>
        <div style={{ padding:'18px 16px 14px',borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontWeight:800,fontSize:13,color:'var(--text)',marginBottom:3 }}>💡 Conseils</div>
          <div style={{ fontSize:11,color:'var(--text2)' }}>Pour des résultats optimaux</div>
        </div>
        <div style={{ padding:'12px 14px',flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:8 }}>
          {[
            {icon:'📚',tip:'Matière (25pts)',  ex:'"maths", "physique"',    color:'#6c63ff'},
            {icon:'🎓',tip:'Niveau (40pts)',   ex:'"lycée", "bac", "collège"', color:'#f59e0b'},
            {icon:'📍',tip:'Ville (15pts)',    ex:'"à Tunis", "Sfax"',      color:'#ff6584'},
            {icon:'💰',tip:'Budget (10pts)',   ex:'"max 40 DT/h"',          color:'#43e97b'},
            {icon:'📡',tip:'Mode (5pts)',      ex:'"en ligne", "domicile"', color:'#38bdf8'},
          ].map(t=>(
            <div key={t.tip} style={{ padding:'9px 11px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)',display:'flex',gap:9,alignItems:'flex-start' }}>
              <div style={{ width:28,height:28,borderRadius:8,background:`${t.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0,border:`1px solid ${t.color}30` }}>{t.icon}</div>
              <div>
                <div style={{ fontWeight:700,fontSize:11,color:'var(--text)',marginBottom:2 }}>{t.tip}</div>
                <div style={{ fontSize:10,color:'var(--text2)',fontStyle:'italic' }}>{t.ex}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop:4,padding:'10px 12px',background:'rgba(108,99,255,0.06)',borderRadius:10,border:'1px solid rgba(108,99,255,0.15)' }}>
            <div style={{ fontSize:11,fontWeight:700,color:'#6c63ff',marginBottom:6 }}>📊 Score matching</div>
            {[['#22c55e','80-100','Excellent'],['#6c63ff','65-79','Très bon'],['#d97706','50-64','Bon'],['#dc2626','<50','Possible']].map(([c,r,l])=>(
              <div key={r} style={{ display:'flex',alignItems:'center',gap:7,marginBottom:4,fontSize:11,color:'var(--text2)' }}>
                <span style={{ width:7,height:7,borderRadius:'50%',background:c,display:'inline-block',flexShrink:0 }}/>
                <span style={{ fontWeight:700,minWidth:38,color:'var(--text)' }}>{r}</span>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════ MODAL CONFIRM DELETE ════ */}
      {confirmDelete && (
        <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,.7)',backdropFilter:'blur(6px)',zIndex:3000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div style={{ background:'var(--surface)',borderRadius:22,width:'100%',maxWidth:360,padding:26,boxShadow:'0 40px 100px rgba(0,0,0,.2)',border:'1.5px solid var(--border)' }}>
            <div style={{ width:50,height:50,borderRadius:14,background:'#FEF2F2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',margin:'0 auto 14px' }}>🗑️</div>
            <div style={{ textAlign:'center',marginBottom:6 }}>
              <div style={{ fontWeight:900,fontSize:'1rem',color:'var(--text)' }}>Supprimer cette conversation ?</div>
            </div>
            <div style={{ textAlign:'center',marginBottom:20 }}>
              <div style={{ fontSize:'.83rem',color:'var(--text2)',lineHeight:1.6 }}>
                "<strong>{confirmDelete.titre}</strong>" sera définitivement supprimée.
              </div>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={()=>setConfirmDelete(null)}
                style={{ flex:1,padding:'11px',borderRadius:12,border:'1.5px solid var(--border)',background:'var(--surface2)',color:'var(--text2)',fontWeight:700,cursor:'pointer',fontSize:'.88rem' }}>
                Annuler
              </button>
              <button onClick={()=>deleteSession(confirmDelete.id)}
                style={{ flex:1,padding:'11px',borderRadius:12,border:'none',background:'#DC2626',color:'#fff',fontWeight:800,cursor:'pointer',fontSize:'.88rem',boxShadow:'0 4px 14px rgba(220,38,38,0.3)' }}>
                🗑 Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProf&&<ProfModal prof={selectedProf} onClose={()=>setSelectedProf(null)}/>}
    </div>
  );
}