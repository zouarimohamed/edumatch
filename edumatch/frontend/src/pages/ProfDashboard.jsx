import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { exportProfReservations } from '../services/exportPDF';

/* ─── CSS injecté ──────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  .pdb-root { font-family: 'Instrument Sans', sans-serif; background:#FDFEFF; min-height:100vh; }

  @keyframes fadeUp3   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeLeft3 { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn3  { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
  @keyframes slideCard3{ from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spin3     { to{transform:rotate(360deg)} }
  @keyframes blink3    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes meetPulse3{ 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.4)} 50%{box-shadow:0 0 0 10px rgba(16,185,129,0)} }
  @keyframes chatIn3   { from{opacity:0;transform:scale(.88) translateY(24px)} to{opacity:1;transform:scale(1) translateY(0)} }

  .pdb-stat-card {
    background:#fff; border:1.5px solid #F1F5F9;
    border-radius:20px; padding:18px 20px; cursor:pointer;
    box-shadow:0 2px 10px rgba(0,0,0,0.04);
    transition:all .25s cubic-bezier(.22,1,.36,1);
  }
  .pdb-stat-card:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(0,21,61,0.09); }

  .pdb-section {
    background:#fff; border:1.5px solid #F1F5F9;
    border-radius:22px; padding:26px;
    box-shadow:0 2px 14px rgba(0,0,0,0.04);
  }

  .pdb-resa-card {
    background:#fff; border:1.5px solid #F1F5F9;
    border-radius:18px; padding:16px 20px;
    box-shadow:0 1px 6px rgba(0,0,0,0.04);
    transition:all .22s ease;
  }
  .pdb-resa-card:hover { border-color:#C7D2FE; box-shadow:0 6px 22px rgba(0,21,61,0.08); }

  .pdb-tab-btn {
    padding:8px 16px; border-radius:22px; cursor:pointer;
    font-weight:700; font-size:.8rem; border:1.5px solid #E2E8F0;
    background:#fff; color:#94A3B8;
    transition:all .18s; display:flex; align-items:center; gap:6px;
    font-family:'Instrument Sans',sans-serif;
  }
  .pdb-tab-btn.active { font-family:'Cabinet Grotesk',sans-serif; }

  .pdb-filter-btn {
    padding:7px 13px; border-radius:20px; cursor:pointer;
    font-weight:700; font-size:.77rem; border:1.5px solid #E2E8F0;
    background:#fff; color:#94A3B8; transition:all .15s;
    font-family:'Instrument Sans',sans-serif;
  }
  .pdb-filter-btn.active { background:#EEF2FF; border-color:#C7D2FE; color:#4F46E5; }

  .pdb-action-btn {
    padding:7px 13px; border-radius:11px; cursor:pointer;
    font-weight:700; font-size:.76rem; border:1.5px solid #E2E8F0;
    background:#F8FAFC; color:#64748B; transition:all .15s;
    display:flex; align-items:center; gap:5px;
    font-family:'Instrument Sans',sans-serif;
  }
  .pdb-action-btn:hover { border-color:#C7D2FE; color:#00153D; background:#F0F4FF; }
  .pdb-action-btn.confirm { background:#ECFDF5; border-color:#6EE7B7; color:#065F46; }
  .pdb-action-btn.confirm:hover { background:#D1FAE5; }
  .pdb-action-btn.refuse  { background:#FEF2F2; border-color:#FCA5A5; color:#DC2626; }
  .pdb-action-btn.refuse:hover  { background:#FEE2E2; }
  .pdb-action-btn.chat    { background:#EFF6FF; border-color:#BFDBFE; color:#1D4ED8; position:relative; }
  .pdb-action-btn.chat:hover    { background:#DBEAFE; }
`;

function injectCSS() {
  if (typeof document !== 'undefined' && !document.getElementById('pdb-css')) {
    const s = document.createElement('style'); s.id = 'pdb-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
}

/* ─── Helpers ─────────────────────────────── */
function formatDate(str) {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateFull(str) {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatMsgTime(str) {
  if (!str) return '';
  const d = new Date(str), diff = Math.floor((new Date() - d) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/* ─── Status Badge ─────────────────────────── */
const STATUS_CFG = {
  en_attente: { label: 'En attente',  color: '#B45309', bg: '#FFFBEB', border: '#FCD34D' },
  confirmé:   { label: 'Confirmé',   color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7' },
  refusé:     { label: 'Refusé',     color: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5' },
  annulé:     { label: 'Annulé',     color: '#374151', bg: '#F9FAFB', border: '#D1D5DB' },
  terminé:    { label: 'Terminé',    color: '#1D4ED8', bg: '#EFF6FF', border: '#93C5FD' },
};
function StatutBadge({ statut }) {
  const cfg = STATUS_CFG[statut] || { label: statut, color: '#374151', bg: '#F9FAFB', border: '#D1D5DB' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'.7rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:cfg.bg, color:cfg.color, border:`1.5px solid ${cfg.border}` }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.color, flexShrink:0 }}/>
      {cfg.label}
    </span>
  );
}

/* ─── Mode Badge ───────────────────────────── */
function ModeBadge({ mode }) {
  const cfg = mode === 'en_ligne'
    ? { icon:'🌐', label:'En ligne',   color:'#1D4ED8', bg:'#EFF6FF',  border:'#BFDBFE' }
    : { icon:'🏫', label:'Présentiel', color:'#065F46', bg:'#ECFDF5',  border:'#6EE7B7' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:'.68rem', fontWeight:700, padding:'2px 9px', borderRadius:20, background:cfg.bg, color:cfg.color, border:`1.5px solid ${cfg.border}` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

/* ─── Avatar étudiant ──────────────────────── */
function Avatar({ nom, size = 42 }) {
  const initials = (nom || 'E').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [['#00153D','#1E3A8A'],['#065F46','#047857'],['#4C1D95','#6D28D9'],['#7C2D12','#B45309']];
  const [a, b] = palettes[(nom||'E').charCodeAt(0) % palettes.length];
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:`linear-gradient(135deg,${a},${b})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.33, fontWeight:900, color:'#fff', flexShrink:0, fontFamily:'Cabinet Grotesk,sans-serif', boxShadow:'0 2px 10px rgba(0,0,0,0.12)' }}>
      {initials}
    </div>
  );
}

/* ─── Meet Block Prof ──────────────────────── */
function ProfMeetBlock({ r }) {
  if (r.session_past) return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#F9FAFB', border:'1.5px solid #E5E7EB', borderRadius:12, marginBottom:14 }}>
      <span style={{ fontSize:'1rem' }}>🎥</span>
      <div style={{ flex:1 }}>
        <span style={{ fontSize:'.78rem', color:'#64748B' }}>Session terminée · </span>
        <a href={r.lien_meet} target="_blank" rel="noreferrer" style={{ fontSize:'.75rem', color:'#3B82F6', textDecoration:'none' }}>Accéder au lien ↗</a>
      </div>
    </div>
  );
  if (r.session_active) return (
    <a href={r.lien_meet} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 17px', background:'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border:'2px solid #10B981', borderRadius:14, animation:'meetPulse3 2s infinite', cursor:'pointer' }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'#10B981', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>🎥</div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, fontWeight:800, color:'#065F46', fontSize:'.88rem', fontFamily:'Cabinet Grotesk,sans-serif' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', display:'inline-block', animation:'blink3 1s infinite' }}/>
            Session en cours — Rejoindre
          </div>
          <div style={{ fontSize:'.7rem', color:'#065F46', opacity:.6, marginTop:2 }}>{r.lien_meet}</div>
        </div>
        <span style={{ color:'#10B981', fontWeight:800, fontSize:'1rem' }}>→</span>
      </div>
    </a>
  );
  if (r.session_imminent) return (
    <a href={r.lien_meet} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 15px', background:'#FFFBEB', border:'1.5px solid #F59E0B', borderRadius:13 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>🎥</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, color:'#B45309', fontSize:'.84rem' }}>Dans {r.minutes_until} min — Préparez votre session</div>
          <div style={{ fontSize:'.7rem', color:'#92400E', opacity:.6, marginTop:2 }}>{r.lien_meet}</div>
        </div>
        <span style={{ color:'#F59E0B', fontWeight:700 }}>→</span>
      </div>
    </a>
  );
  if (r.session_today) return (
    <a href={r.lien_meet} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 15px', background:'#EFF6FF', border:'1.5px solid #93C5FD', borderRadius:13 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'#DBEAFE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>🎥</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, color:'#1D4ED8', fontSize:'.83rem' }}>Cours aujourd'hui — Lien Meet actif</div>
          <div style={{ fontSize:'.7rem', color:'#1E40AF', opacity:.55, marginTop:2 }}>{r.lien_meet}</div>
        </div>
        <span style={{ color:'#3B82F6', fontWeight:700 }}>→</span>
      </div>
    </a>
  );
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:12, marginBottom:14 }}>
      <div style={{ width:32, height:32, borderRadius:9, background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>🎥</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'.78rem', fontWeight:600, color:'#64748B' }}>Lien Meet — Actif le jour de la session</div>
        <div style={{ fontSize:'.7rem', color:'#94A3B8', marginTop:1 }}>📅 {formatDateFull(r.date_cours)} à {r.heure_debut}</div>
      </div>
      <a href={r.lien_meet} target="_blank" rel="noreferrer" style={{ fontSize:'.7rem', color:'#1D4ED8', fontWeight:700, textDecoration:'none', background:'#EFF6FF', padding:'3px 10px', borderRadius:20 }}>
        Accéder ↗
      </a>
    </div>
  );
}

/* ─── Chat Window ──────────────────────────── */
function ChatWindow({ reservation, currentUser, onClose }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);
  const pollRef   = useRef(null);

  const etudiantNom = reservation.etudiant_nom || 'Étudiant';

  const loadMessages = useCallback(async () => {
    try { const res = await api.get(`/api/messages/reservation/${reservation.id}`); setMessages(res.data); } catch {}
  }, [reservation.id]);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const sendText = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/api/messages/reservation/${reservation.id}`, { contenu: input.trim() });
      setMessages(prev => [...prev, res.data]);
      setInput('');
    } catch (e) { alert('Erreur : ' + (e.response?.data?.detail || e.message)); }
    finally { setSending(false); }
  };

  const sendFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api.post(`/api/messages/reservation/${reservation.id}/fichier`, fd, { headers:{'Content-Type':'multipart/form-data'} });
      setMessages(prev => [...prev, res.data]);
    } catch (e) { alert('Erreur upload : ' + (e.response?.data?.detail || e.message)); }
    finally { setUploading(false); }
  };

  const isMine = (msg) => msg.expediteur_id === currentUser.id;

  const renderFile = (msg) => {
    const url = `http://localhost:8001${msg.fichier_url}`;
    if (msg.fichier_type === 'image') return (
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={msg.fichier_nom} style={{ maxWidth:200, maxHeight:160, borderRadius:8, display:'block', objectFit:'cover' }}/>
      </a>
    );
    return (
      <a href={url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px', background:'rgba(0,0,0,0.05)', borderRadius:9, textDecoration:'none', color:'inherit' }}>
        <span style={{ fontSize:'1.1rem' }}>{msg.fichier_type === 'pdf' ? '📄' : '📎'}</span>
        <div>
          <div style={{ fontWeight:600, fontSize:'.8rem' }}>{msg.fichier_nom}</div>
          <div style={{ fontSize:'.68rem', opacity:.55 }}>Ouvrir →</div>
        </div>
      </a>
    );
  };

  return (
    <div style={{ position:'fixed', bottom:24, right:24, width:390, height:570, background:'#fff', borderRadius:26, boxShadow:'0 40px 100px rgba(0,21,61,0.2), 0 0 0 1px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', zIndex:2000, overflow:'hidden', animation:'chatIn3 .32s cubic-bezier(.34,1.56,.64,1)', fontFamily:'Instrument Sans,sans-serif' }}>
      {/* Header */}
      <div style={{ padding:'16px 18px', background:'linear-gradient(135deg,#00153D,#1E3A8A)', display:'flex', alignItems:'center', gap:13 }}>
        <Avatar nom={etudiantNom} size={42}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'.95rem', color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{etudiantNom}</div>
          <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,0.55)', marginTop:1, display:'flex', alignItems:'center', gap:7 }}>
            <span>📅 {formatDate(reservation.date_cours)}</span>
            <ModeBadge mode={reservation.mode_seance}/>
          </div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:'rgba(255,255,255,0.12)', border:'none', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem' }}>✕</button>
      </div>
      {/* Info compacte */}
      {(reservation.etudiant_email || reservation.etudiant_telephone) && (
        <div style={{ padding:'8px 16px', background:'#F8FAFC', borderBottom:'1.5px solid #F1F5F9', display:'flex', gap:14, fontSize:'.73rem' }}>
          {reservation.etudiant_email && <a href={`mailto:${reservation.etudiant_email}`} style={{ color:'#1D4ED8', textDecoration:'none', fontWeight:600 }}>✉️ {reservation.etudiant_email}</a>}
          {reservation.etudiant_telephone && <a href={`tel:${reservation.etudiant_telephone}`} style={{ color:'#1D4ED8', textDecoration:'none', fontWeight:600 }}>📞 {reservation.etudiant_telephone}</a>}
          <span style={{ color:'#94A3B8' }}>🕒 {String(reservation.heure_debut||'').slice(0,5)}–{String(reservation.heure_fin||'').slice(0,5)}</span>
        </div>
      )}
      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 12px 4px', display:'flex', flexDirection:'column', gap:9, background:'#FAFAFA' }}>
        {messages.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 12px', color:'#94A3B8' }}>
            <div style={{ fontSize:'2.2rem', marginBottom:10 }}>💬</div>
            <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.88rem', color:'#0F172A', marginBottom:3 }}>Démarrez la conversation</div>
            <div style={{ fontSize:'.76rem' }}>Contactez votre étudiant</div>
          </div>
        )}
        {messages.map(msg => {
          const mine = isMine(msg);
          return (
            <div key={msg.id} style={{ display:'flex', flexDirection:mine?'row-reverse':'row', alignItems:'flex-end', gap:7 }}>
              {!mine && <Avatar nom={msg.expediteur_nom} size={26}/>}
              <div style={{ maxWidth:'74%' }}>
                <div style={{ padding:msg.fichier_url?'6px':'9px 13px', borderRadius:mine?'18px 18px 5px 18px':'18px 18px 18px 5px', background:mine?'linear-gradient(135deg,#00153D,#1E40AF)':'#fff', color:mine?'#fff':'#0F172A', fontSize:'.85rem', lineHeight:1.55, boxShadow:mine?'0 3px 14px rgba(0,21,61,0.22)':'0 1px 5px rgba(0,0,0,0.07)', border:mine?'none':'1.5px solid #F1F5F9' }}>
                  {msg.contenu && <span>{msg.contenu}</span>}
                  {msg.fichier_url && renderFile(msg)}
                </div>
                <div style={{ fontSize:'.63rem', color:'#94A3B8', marginTop:3, textAlign:mine?'right':'left' }}>
                  {formatMsgTime(msg.created_at)}{mine && <span style={{ marginLeft:4 }}>{msg.lu?'✓✓':'✓'}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>
      {/* Input */}
      <div style={{ padding:'10px 12px', borderTop:'1.5px solid #F1F5F9', display:'flex', alignItems:'flex-end', gap:8, background:'#fff' }}>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width:36, height:36, borderRadius:10, background:'#F8FAFC', border:'1.5px solid #E2E8F0', cursor:uploading?'not-allowed':'pointer', color:'#64748B', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {uploading ? <div style={{ width:14, height:14, border:'2px solid #E2E8F0', borderTopColor:'#94A3B8', borderRadius:'50%', animation:'spin3 .8s linear infinite' }}/> : '📎'}
        </button>
        <input ref={fileRef} type="file" hidden accept="image/*,.pdf,.doc,.docx,.txt" onChange={e => sendFile(e.target.files[0])}/>
        <textarea rows={1} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText();} }} placeholder="Votre message..."
          style={{ flex:1, background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:12, padding:'9px 12px', color:'#0F172A', fontSize:'.85rem', resize:'none', outline:'none', maxHeight:80, overflowY:'auto', fontFamily:'Instrument Sans,sans-serif' }}
          onFocus={e => e.target.style.borderColor='#3B82F6'}
          onBlur={e => e.target.style.borderColor='#E2E8F0'}/>
        <button onClick={sendText} disabled={!input.trim()||sending} style={{ width:36, height:36, borderRadius:10, border:'none', cursor:(!input.trim()||sending)?'not-allowed':'pointer', background:(!input.trim()||sending)?'#F1F5F9':'#00153D', color:(!input.trim()||sending)?'#CBD5E1':'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
          {sending ? <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin3 .8s linear infinite' }}/> : '➤'}
        </button>
      </div>
    </div>
  );
}

/* ─── Modal détail réservation ─────────────── */
function ReservationModal({ reservation, onClose, onAction, onChat }) {
  if (!reservation) return null;
  const r = reservation;
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:26, width:'100%', maxWidth:560, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 48px 120px rgba(0,0,0,0.2)', animation:'scaleIn3 .25s cubic-bezier(.34,1.56,.64,1)', fontFamily:'Instrument Sans,sans-serif', border:'1.5px solid #F1F5F9' }}>
        {/* Header */}
        <div style={{ padding:'22px 28px 18px', borderBottom:'1.5px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#FDFEFF' }}>
          <div>
            <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', margin:0, fontSize:'1.15rem', fontWeight:900, color:'#0F172A', letterSpacing:'-.02em' }}>Détails de la réservation</h3>
            <div style={{ fontSize:'.73rem', color:'#94A3B8', marginTop:3, fontWeight:600 }}>Réservation #{r.id}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <StatutBadge statut={r.statut}/>
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:9, background:'#F8FAFC', border:'1.5px solid #E2E8F0', cursor:'pointer', color:'#64748B', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#FEE2E2'; e.currentTarget.style.color='#DC2626'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#F8FAFC'; e.currentTarget.style.color='#64748B'; }}>✕</button>
          </div>
        </div>

        <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:18 }}>
          {/* Profil étudiant */}
          <div style={{ background:'#F8FAFC', border:'1.5px solid #F1F5F9', borderRadius:18, padding:18 }}>
            <div style={{ fontSize:'.65rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:14, fontFamily:'Cabinet Grotesk,sans-serif' }}>👨‍🎓 Étudiant</div>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <Avatar nom={r.etudiant_nom} size={52}/>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1rem', color:'#0F172A', marginBottom:7, letterSpacing:'-.01em' }}>{r.etudiant_nom || '—'}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {r.etudiant_email && <div style={{ fontSize:'.8rem', color:'#64748B' }}>✉️ <a href={`mailto:${r.etudiant_email}`} style={{ color:'#1D4ED8', textDecoration:'none', fontWeight:600 }}>{r.etudiant_email}</a></div>}
                  {r.etudiant_telephone && <div style={{ fontSize:'.8rem', color:'#64748B' }}>📞 <a href={`tel:${r.etudiant_telephone}`} style={{ color:'#1D4ED8', textDecoration:'none', fontWeight:600 }}>{r.etudiant_telephone}</a></div>}
                  {r.etudiant_niveau && <div style={{ fontSize:'.8rem', color:'#64748B' }}>🎓 {r.etudiant_niveau}</div>}
                  {r.etudiant_ville  && <div style={{ fontSize:'.8rem', color:'#64748B' }}>📍 {r.etudiant_ville}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Détails cours */}
          <div style={{ background:'#F8FAFC', border:'1.5px solid #F1F5F9', borderRadius:16, padding:16 }}>
            <div style={{ fontSize:'.65rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:14, fontFamily:'Cabinet Grotesk,sans-serif' }}>📚 Détails du cours</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                ['📅 Date',    r.date_cours ? new Date(r.date_cours+'T00:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : '—'],
                ['🕒 Horaire', r.heure_debut && r.heure_fin ? `${String(r.heure_debut).slice(0,5)} → ${String(r.heure_fin).slice(0,5)}` : '—'],
                ['💰 Tarif',   r.tarif_applique ? `${r.tarif_applique} DT/h` : 'Non renseigné'],
                ['🎓 Mode',    null],
              ].map(([label, value]) => (
                <div key={label} style={{ background:'#fff', padding:'10px 13px', borderRadius:12, border:'1.5px solid #F1F5F9' }}>
                  <div style={{ fontSize:'.65rem', color:'#94A3B8', marginBottom:5, fontWeight:800, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</div>
                  {label==='🎓 Mode' ? <ModeBadge mode={r.mode_seance}/> : <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.86rem', color:'#0F172A' }}>{value}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Meet */}
          {r.mode_seance==='en_ligne' && r.lien_meet && r.statut==='confirmé' && <ProfMeetBlock r={r}/>}

          {/* Description séance */}
          {r.description_seance && (
            <div style={{ background:'#F0F4FF', borderRadius:14, padding:16, border:'1.5px solid #C7D2FE' }}>
              <div style={{ fontSize:'.65rem', fontWeight:900, color:'#4F46E5', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:10, fontFamily:'Cabinet Grotesk,sans-serif' }}>📝 Description de la séance</div>
              <div style={{ fontSize:'.86rem', lineHeight:1.75, fontStyle:'italic', padding:'12px 14px', background:'#fff', borderRadius:10, borderLeft:'3px solid #4F46E5', color:'#374151' }}>
                {r.description_seance}
              </div>
            </div>
          )}

          {/* Message étudiant */}
          {r.notes_etudiant && (
            <div style={{ background:'#F8FAFC', borderRadius:14, padding:16, border:'1.5px solid #F1F5F9' }}>
              <div style={{ fontSize:'.65rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:10, fontFamily:'Cabinet Grotesk,sans-serif' }}>💬 Message de l'étudiant</div>
              <div style={{ fontSize:'.86rem', lineHeight:1.75, fontStyle:'italic', padding:'12px 14px', background:'#fff', borderRadius:10, borderLeft:'3px solid #00153D', color:'#374151' }}>
                "{r.notes_etudiant}"
              </div>
            </div>
          )}

          {/* Description séance par le prof — éditable si confirmé */}
          {r.statut==='confirmé' && (
            <div style={{ background:'#F0F4FF', borderRadius:14, padding:16, border:'1.5px solid #C7D2FE' }}>
              <div style={{ fontSize:'.65rem', fontWeight:900, color:'#4F46E5', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:10, fontFamily:'Cabinet Grotesk,sans-serif' }}>📝 Description de la séance (optionnel)</div>
              <textarea
                defaultValue={r.description_seance || ''}
                placeholder="Ex: Cours de révision sur les équations, apportez votre cahier..."
                rows={3}
                onBlur={async (e) => {
                  const val = e.target.value.trim();
                  if (val !== (r.description_seance || '').trim()) {
                    try { await api.put(`/api/reservations/${r.id}`, { description_seance: val }); }
                    catch {}
                  }
                }}
                style={{ width:'100%', background:'#fff', border:'1.5px solid #C7D2FE', borderRadius:10, padding:'9px 12px', fontSize:'.84rem', resize:'vertical', outline:'none', fontFamily:'Instrument Sans,sans-serif', color:'#374151', boxSizing:'border-box', transition:'border-color .15s' }}
                onFocus={e => e.target.style.borderColor='#4F46E5'}
              />
              <div style={{ fontSize:'.68rem', color:'#94A3B8', marginTop:5 }}>Sauvegardé automatiquement</div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', gap:10, flexDirection:'column' }}>
            {r.statut==='en_attente' && (
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => { onAction(r.id,'confirmé'); onClose(); }} style={{ flex:1, padding:'13px', background:'#10B981', color:'#fff', border:'none', borderRadius:12, fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, cursor:'pointer', fontSize:'.88rem', boxShadow:'0 4px 14px rgba(16,185,129,0.3)', transition:'all .18s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#059669'; e.currentTarget.style.transform='translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#10B981'; e.currentTarget.style.transform='none'; }}>
                  ✅ Accepter
                </button>
                <button onClick={() => { onAction(r.id,'refusé'); onClose(); }} style={{ flex:1, padding:'13px', background:'#FEF2F2', color:'#DC2626', border:'1.5px solid #FCA5A5', borderRadius:12, fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, cursor:'pointer', fontSize:'.88rem', transition:'all .18s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#FEE2E2'}
                  onMouseLeave={e => e.currentTarget.style.background='#FEF2F2'}>
                  ❌ Refuser
                </button>
              </div>
            )}
            {r.statut==='confirmé' && (
              <button onClick={() => { onClose(); onChat(r); }} style={{ padding:'13px', background:'#00153D', color:'#fff', border:'none', borderRadius:12, fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, cursor:'pointer', fontSize:'.88rem', display:'flex', alignItems:'center', justifyContent:'center', gap:9, boxShadow:'0 4px 16px rgba(0,21,61,0.22)', transition:'all .18s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#1E3A8A'; e.currentTarget.style.transform='translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#00153D'; e.currentTarget.style.transform='none'; }}>
                💬 Contacter l'étudiant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Carte réservation compacte ───────────── */
function ReservationCard({ r, onView, onAction, onChat, unreadCount, index }) {
  const dateStr = r.date_cours ? new Date(r.date_cours+'T00:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : '—';
  const topColor = r.statut==='confirmé' ? 'linear-gradient(90deg,#10B981,#34D399)' : r.statut==='en_attente' ? 'linear-gradient(90deg,#F59E0B,#FCD34D)' : r.statut==='refusé' ? 'linear-gradient(90deg,#EF4444,#F87171)' : 'linear-gradient(90deg,#3B82F6,#818CF8)';

  return (
    <div className="pdb-resa-card" style={{ animationDelay:`${index*55}ms`, animation:'slideCard3 .42s cubic-bezier(.22,1,.36,1) both', opacity:0, animationFillMode:'forwards' }}>
      <div style={{ height:3, background:topColor, margin:'-16px -20px 14px', borderRadius:'18px 18px 0 0' }}/>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <Avatar nom={r.etudiant_nom} size={46}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
            <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'.94rem', color:'#0F172A', letterSpacing:'-.01em' }}>{r.etudiant_nom || 'Étudiant'}</span>
            <StatutBadge statut={r.statut}/>
            <ModeBadge mode={r.mode_seance}/>
          </div>
          <div style={{ display:'flex', gap:14, fontSize:'.76rem', color:'#94A3B8', fontWeight:600, flexWrap:'wrap', alignItems:'center' }}>
            <span>📅 {dateStr}</span>
            <span>🕒 {String(r.heure_debut||'').slice(0,5)} – {String(r.heure_fin||'').slice(0,5)}</span>
            {r.etudiant_telephone && <span>📞 {r.etudiant_telephone}</span>}
            {(r.statut==='confirmé'||r.statut==='terminé') && (
              r.statut_paiement==='payé'
                ? <span style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:'.65rem',fontWeight:800,padding:'2px 8px',borderRadius:20,background:'#ECFDF5',color:'#065F46',border:'1.5px solid #6EE7B7' }}>💳 Payé</span>
                : <span style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:'.65rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#F8FAFC',color:'#94A3B8',border:'1.5px solid #E2E8F0' }}>⏳ Non payé</span>
            )}
          </div>
          {r.notes_etudiant && (
            <div style={{ marginTop:5, fontSize:'.74rem', color:'#94A3B8', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:260 }}>
              💬 "{r.notes_etudiant}"
            </div>
          )}
          {r.description_seance && (
            <div style={{ marginTop:4, fontSize:'.74rem', color:'#4F46E5', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:260 }}>
              📝 {r.description_seance}
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:7, flexShrink:0, alignItems:'center' }}>
          <button className="pdb-action-btn" onClick={() => onView(r)}>👁 Détails</button>
          {r.statut==='confirmé' && (
            <button className="pdb-action-btn chat" onClick={() => onChat(r)}>
              💬 Chat
              {unreadCount > 0 && (
                <span style={{ position:'absolute', top:-7, right:-7, background:'#EF4444', color:'#fff', fontSize:'.58rem', fontWeight:900, padding:'2px 5px', borderRadius:20, border:'2px solid #fff', fontFamily:'Cabinet Grotesk,sans-serif' }}>{unreadCount}</span>
              )}
            </button>
          )}
          {r.statut==='en_attente' && (
            <>
              <button className="pdb-action-btn confirm" onClick={() => onAction(r.id,'confirmé')}>✅ Accepter</button>
              <button className="pdb-action-btn refuse"  onClick={() => onAction(r.id,'refusé')}>❌</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════════ */

/* ─── Badge Paiement ───────────────────────── */
function PaiementBadge({ statut }) {
  if (statut === 'payé') return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:'.68rem', fontWeight:800, padding:'3px 10px', borderRadius:20, background:'#ECFDF5', color:'#065F46', border:'1.5px solid #6EE7B7' }}>
      💳 Payé
    </span>
  );
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:'.68rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:'#F8FAFC', color:'#94A3B8', border:'1.5px solid #E2E8F0' }}>
      ⏳ En attente
    </span>
  );
}

/* ─── Section Gestion des Gains ─────────────── */
function GainsSection({ reservations }) {
  // getDuree doit être défini AVANT calcTotal
  const getDuree = (r) => {
    if (!r.heure_debut || !r.heure_fin) return 1;
    const [hd, md] = String(r.heure_debut).slice(0,5).split(':').map(Number);
    const [hf, mf] = String(r.heure_fin).slice(0,5).split(':').map(Number);
    const diff = (hf * 60 + mf) - (hd * 60 + md);
    return diff > 0 ? (diff / 60).toFixed(1) : 1;
  };

  const seancesPayees    = reservations.filter(r => r.statut_paiement === 'payé');
  const seancesEnAttente = reservations.filter(r => (r.statut === 'confirmé' || r.statut === 'terminé') && r.statut_paiement !== 'payé');
  const calcTotal = (r) => {
    const duree = getDuree(r);
    return (parseFloat(r.tarif_applique) || 0) * parseFloat(duree);
  };
  const totalGains     = seancesPayees.reduce((acc, r) => acc + calcTotal(r), 0);
  const totalEnAttente = seancesEnAttente.reduce((acc, r) => acc + calcTotal(r), 0);
  const totalSeances   = reservations.filter(r => r.statut === 'confirmé' || r.statut === 'terminé').length;

  const seancesAll = reservations
    .filter(r => r.statut === 'confirmé' || r.statut === 'terminé')
    .sort((a, b) => new Date(b.date_cours || 0) - new Date(a.date_cours || 0));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {[
          { icon:'💰', label:'Gains totaux reçus',    val:`${totalGains.toFixed(2)} DT`,    color:'#065F46', bg:'#ECFDF5', border:'#6EE7B7', iconBg:'#A7F3D0' },
          { icon:'⏳', label:'En attente de paiement', val:`${totalEnAttente.toFixed(2)} DT`, color:'#B45309', bg:'#FFFBEB', border:'#FCD34D', iconBg:'#FDE68A' },
          { icon:'📅', label:'Séances effectuées',    val:`${totalSeances} séance${totalSeances!==1?'s':''}`, color:'#1E40AF', bg:'#EFF6FF', border:'#93C5FD', iconBg:'#BFDBFE' },
        ].map((k, i) => (
          <div key={i} style={{ background:k.bg, border:`1.5px solid ${k.border}`, borderRadius:20, padding:'20px 22px', display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ width:46, height:46, borderRadius:13, background:k.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>{k.icon}</div>
            <div>
              <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1.4rem', color:k.color, lineHeight:1, marginBottom:4 }}>{k.val}</div>
              <div style={{ fontSize:'.7rem', color:k.color, opacity:.7, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:'linear-gradient(135deg,#00153D,#1E3A8A)', borderRadius:22, padding:'28px 32px', color:'#fff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-20, right:-20, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'.7rem', fontWeight:900, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'.14em', marginBottom:8 }}>Votre solde actuel</div>
          <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'2.8rem', letterSpacing:'-.03em', marginBottom:6 }}>
            {totalGains.toFixed(2)} <span style={{ fontSize:'1.4rem', opacity:.7 }}>DT</span>
          </div>
          <div style={{ fontSize:'.82rem', color:'rgba(255,255,255,0.55)', marginBottom:16 }}>
            {seancesPayees.length} paiement{seancesPayees.length!==1?'s':''} reçu{seancesPayees.length!==1?'s':''}
          </div>
          {totalEnAttente > 0 && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'7px 14px', background:'rgba(255,255,255,0.1)', borderRadius:20, border:'1.5px solid rgba(255,255,255,0.15)', fontSize:'.78rem', fontWeight:700 }}>
              ⏳ {totalEnAttente.toFixed(2)} DT en attente de paiement
            </div>
          )}
        </div>
      </div>

      <div style={{ background:'#fff', border:'1.5px solid #F1F5F9', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.04)' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1.5px solid #F1F5F9', display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:4, height:20, background:'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius:2 }}/>
          <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1rem', color:'#0F172A', margin:0 }}>Historique des séances</h3>
          <span style={{ fontSize:'.72rem', color:'#94A3B8', marginLeft:4 }}>Confirmées et terminées</span>
        </div>
        {seancesAll.length === 0 ? (
          <div style={{ textAlign:'center', padding:'52px 20px', color:'#94A3B8' }}>
            <div style={{ fontSize:'2.8rem', marginBottom:12 }}>💼</div>
            <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'1rem', color:'#0F172A', marginBottom:5 }}>Aucune séance encore</div>
            <div style={{ fontSize:'.83rem', fontStyle:'italic' }}>Vos séances confirmées apparaîtront ici</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.83rem' }}>
              <thead>
                <tr style={{ background:'#F8FAFC' }}>
                  {['Étudiant','Date','Horaire','Durée','Tarif/h','Total','Mode','Paiement'].map((h, i) => (
                    <th key={i} style={{ padding:'10px 16px', textAlign:'left', fontSize:'.66rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.08em', borderBottom:'1.5px solid #F1F5F9', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seancesAll.map((r, i) => {
                  const duree = getDuree(r);
                  const total = (parseFloat(r.tarif_applique) || 0) * parseFloat(duree);
                  return (
                    <tr key={r.id}
                      style={{ borderBottom: i < seancesAll.length-1 ? '1px solid #F8FAFC' : 'none', transition:'background .12s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                          <Avatar nom={r.etudiant_nom} size={32}/>
                          <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:700, color:'#0F172A' }}>{r.etudiant_nom || '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#64748B', fontWeight:600, whiteSpace:'nowrap' }}>
                        {r.date_cours ? new Date(r.date_cours+'T00:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                      </td>
                      <td style={{ padding:'12px 16px', color:'#64748B', fontWeight:600, whiteSpace:'nowrap' }}>
                        {String(r.heure_debut||'').slice(0,5)} → {String(r.heure_fin||'').slice(0,5)}
                      </td>
                      <td style={{ padding:'12px 16px', textAlign:'center' }}>
                        <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, color:'#1E40AF' }}>{duree}h</span>
                      </td>
                      <td style={{ padding:'12px 16px', textAlign:'center', color:'#64748B', fontWeight:600 }}>
                        {r.tarif_applique ? `${parseFloat(r.tarif_applique).toFixed(0)} DT` : '—'}
                      </td>
                      <td style={{ padding:'12px 16px', textAlign:'center' }}>
                        <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, color: r.statut_paiement==='payé'?'#065F46':'#94A3B8' }}>
                          {r.tarif_applique ? `${total.toFixed(2)} DT` : '—'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px' }}><ModeBadge mode={r.mode_seance}/></td>
                      <td style={{ padding:'12px 16px' }}><PaiementBadge statut={r.statut_paiement}/></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background:'#F8FAFC', borderTop:'2px solid #F1F5F9' }}>
                  <td colSpan={5} style={{ padding:'12px 16px', fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'.88rem', color:'#0F172A' }}>
                    Total ({seancesAll.length} séance{seancesAll.length!==1?'s':''})
                  </td>
                  <td style={{ padding:'12px 16px', textAlign:'center' }}>
                    <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1rem', color:'#065F46' }}>
                      {seancesAll.reduce((acc, r) => {
                        const d = (() => {
                          if (!r.heure_debut || !r.heure_fin) return 1;
                          const [hd,md]=String(r.heure_debut).slice(0,5).split(':').map(Number);
                          const [hf,mf]=String(r.heure_fin).slice(0,5).split(':').map(Number);
                          const diff=(hf*60+mf)-(hd*60+md);
                          return diff>0?diff/60:1;
                        })();
                        return acc + (parseFloat(r.tarif_applique)||0) * d;
                      }, 0).toFixed(2)} DT
                    </span>
                  </td>
                  <td colSpan={2} style={{ padding:'12px 16px', textAlign:'right' }}>
                    <span style={{ fontSize:'.72rem', color:'#94A3B8', fontWeight:600 }}>
                      dont <span style={{ color:'#065F46', fontWeight:800 }}>{totalGains.toFixed(2)} DT payés</span>
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfDashboard() {
  const { user }  = useAuth();
  const outletCtx = useOutletContext?.() || {};
  const { chatResaId, setChatResaId, openResaId, setOpenResaId } = outletCtx;

  const [reservations, setReservations] = useState([]);
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [selectedResa, setSelectedResa] = useState(null);
  const [chatResa, setChatResa]         = useState(null);
  const [activeTab, setActiveTab]       = useState('en_attente');
  const [unreadMap, setUnreadMap]       = useState({});
  const [filterMode, setFilterMode]     = useState('');
  const [filterMonth, setFilterMonth]   = useState('');

  useEffect(() => {
    injectCSS();
    Promise.all([
      api.get('/api/reservations/mes-reservations').catch(() => ({ data:[] })),
      api.get('/api/professeurs/me').catch(() => ({ data:null })),
    ]).then(([r, p]) => {
      setReservations(r.data ?? []);
      setProfile(p.data ?? null);
      setLoading(false);
    });
    loadUnread();
    const iv = setInterval(loadUnread, 10000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (chatResaId && reservations.length > 0) {
      const resa = reservations.find(r => r.id === chatResaId);
      if (resa) { setChatResa(resa); setChatResaId?.(null); }
    }
  }, [chatResaId, reservations]);

  // Ouvrir la modal de réservation depuis une notification (clic sur notif pending)
  useEffect(() => {
    if (openResaId && reservations.length > 0) {
      const resa = reservations.find(r => r.id === openResaId);
      if (resa) {
        setSelectedResa(resa);
        setActiveTab('en_attente');
        setOpenResaId?.(null);
      }
    }
  }, [openResaId, reservations]);

  const loadUnread = async () => {
    try {
      const res = await api.get('/api/messages/non-lus');
      const map = {};
      (res.data.messages||[]).forEach(m => { map[m.reservation_id] = (map[m.reservation_id]||0)+1; });
      setUnreadMap(map);
    } catch {}
  };

  async function updateReservation(id, statut) {
    try {
      await api.put(`/api/reservations/${id}`, { statut });
      setReservations(prev => prev.map(r => r.id===id ? {...r,statut} : r));
    } catch { alert('Erreur lors de la mise à jour'); }
  }

  const tabs = [
    { key:'en_attente', label:'En attente',  color:'#B45309', bg:'#FFFBEB', border:'#FCD34D' },
    { key:'confirmé',   label:'Confirmées',  color:'#065F46', bg:'#ECFDF5', border:'#6EE7B7' },
    { key:'refusé',     label:'Refusées',    color:'#991B1B', bg:'#FEF2F2', border:'#FCA5A5' },
    { key:'all',        label:'Toutes',      color:'#1E40AF', bg:'#EFF6FF', border:'#93C5FD' },
    { key:'gains',      label:'💰 Gains',    color:'#065F46', bg:'#ECFDF5', border:'#6EE7B7' },
  ];

  const MONTH_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const availableMonths = useMemo(() => {
    const months = new Set();
    reservations.forEach(r => { if (r.date_cours) months.add(r.date_cours.slice(0,7)); });
    return [...months].sort().reverse();
  }, [reservations]);

  const counts = {
    en_attente: reservations.filter(r => r.statut==='en_attente').length,
    confirmé:   reservations.filter(r => r.statut==='confirmé').length,
    refusé:     reservations.filter(r => r.statut==='refusé').length,
    all:        reservations.length,
    gains:      reservations.filter(r => r.statut_paiement==='payé').length,
  };

  const filtered = reservations.filter(r => {
    if (activeTab!=='all' && r.statut!==activeTab) return false;
    if (filterMode  && r.mode_seance!==filterMode) return false;
    if (filterMonth && r.date_cours && !r.date_cours.startsWith(filterMonth)) return false;
    return true;
  });

  const totalUnread = Object.values(unreadMap).reduce((a,b) => a+b, 0);
  const getHour = () => { const h=new Date().getHours(); return h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir'; };

  return (
    <div className="pdb-root" style={{ padding:'36px 40px', maxWidth:1160, margin:'0 auto' }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom:32, animation:'fadeUp3 .5s ease both' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:4, height:24, background:'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius:2 }}/>
              <span style={{ fontSize:'.65rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.14em', fontFamily:'Cabinet Grotesk,sans-serif' }}>Tableau de bord</span>
            </div>
            <h1 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontSize:'2.1rem', fontWeight:900, margin:'0 0 5px', color:'#0F172A', letterSpacing:'-.03em', lineHeight:1 }}>
              {getHour()}, {user?.prenom} 👨‍🏫
            </h1>
            <p style={{ color:'#94A3B8', margin:0, fontSize:'.88rem', fontWeight:500, fontStyle:'italic' }}>Voici un aperçu de votre activité</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {profile && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:'#fff', border:'1.5px solid #F1F5F9', borderRadius:16, boxShadow:'0 2px 10px rgba(0,0,0,0.04)' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>⭐</div>
                <div>
                  <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1.2rem', color:'#B45309', lineHeight:1 }}>{parseFloat(profile?.note_moyenne||0).toFixed(1)}</div>
                  <div style={{ fontSize:'.65rem', color:'#94A3B8', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Note moy.</div>
                </div>
              </div>
            )}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); exportProfReservations(reservations, `${user?.prenom || ''} ${user?.nom || ''}`.trim()); }}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', background:'#00153D', color:'#fff', border:'none', borderRadius:12, cursor:'pointer', fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, fontSize:'.8rem', boxShadow:'0 4px 14px rgba(0,21,61,0.2)', transition:'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#1E3A8A'; e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#00153D'; e.currentTarget.style.transform='none'; }}>
              📄 Exporter PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))', gap:14, marginBottom:28 }}>
        {[
          { icon:'📅', val:reservations.length, lbl:'Total réservations', numColor:'#1E40AF', iconBg:'#BFDBFE', border:'#93C5FD', delay:0   },
          { icon:'⏳', val:counts.en_attente,   lbl:'En attente',         numColor:'#B45309', iconBg:'#FDE68A', border:'#FCD34D', delay:55  },
          { icon:'✅', val:counts.confirmé,      lbl:'Confirmées',         numColor:'#065F46', iconBg:'#A7F3D0', border:'#6EE7B7', delay:110 },
          { icon:'💬', val:totalUnread,          lbl:'Msgs non lus',      numColor:'#9F1239', iconBg:'#FED7E2', border:'#FCA5A5', delay:165 },
        ].map(s => (
          <div key={s.lbl} className="pdb-stat-card"
            style={{ animationDelay:`${s.delay}ms`, animation:'scaleIn3 .45s cubic-bezier(.22,1,.36,1) both', opacity:0, animationFillMode:'forwards', borderColor:s.border }}>
            <div style={{ width:44, height:44, borderRadius:13, background:s.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.15rem', marginBottom:12 }}>{s.icon}</div>
            <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontSize:'2.1rem', fontWeight:900, color:s.numColor, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:'.72rem', color:'#94A3B8', marginTop:5, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── ALERTES ── */}
      {totalUnread > 0 && (
        <div style={{ marginBottom:16, padding:'14px 20px', background:'#EFF6FF', border:'1.5px solid #BFDBFE', borderRadius:16, display:'flex', alignItems:'center', gap:13, animation:'fadeUp3 .4s ease both' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'#DBEAFE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>💬</div>
          <div style={{ flex:1 }}>
            <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, color:'#1D4ED8' }}>{totalUnread} message{totalUnread>1?'s':''} non lu{totalUnread>1?'s':''}</span>
            <span style={{ color:'#64748B', fontSize:'.84rem' }}> de vos étudiants</span>
          </div>
          <button onClick={() => setActiveTab('confirmé')} style={{ padding:'7px 16px', background:'#00153D', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.78rem', transition:'all .18s' }}
            onMouseEnter={e => e.currentTarget.style.background='#1E3A8A'}
            onMouseLeave={e => e.currentTarget.style.background='#00153D'}>
            Voir les chats →
          </button>
        </div>
      )}

      {counts.en_attente > 0 && (
        <div style={{ marginBottom:24, padding:'14px 20px', background:'#FFFBEB', border:'1.5px solid #FCD34D', borderRadius:16, display:'flex', alignItems:'center', gap:13, animation:'fadeUp3 .4s .05s ease both', opacity:0, animationFillMode:'forwards' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>🔔</div>
          <div style={{ flex:1 }}>
            <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, color:'#B45309' }}>{counts.en_attente} demande{counts.en_attente>1?'s':''} en attente</span>
            <div style={{ fontSize:'.78rem', color:'#92400E', marginTop:2, fontStyle:'italic' }}>Répondez rapidement pour ne pas faire attendre vos étudiants.</div>
          </div>
          <button onClick={() => {
            setActiveTab('en_attente');
            // Scroll vers la section réservations
            setTimeout(() => {
              document.querySelector('.pdb-section')?.scrollIntoView({ behavior:'smooth', block:'start' });
            }, 100);
          }} style={{ padding:'7px 16px', background:'#F59E0B', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.78rem', transition:'all .18s' }}
            onMouseEnter={e => e.currentTarget.style.background='#D97706'}
            onMouseLeave={e => e.currentTarget.style.background='#F59E0B'}>
            Traiter →
          </button>
        </div>
      )}

      {/* ── SECTION RÉSERVATIONS ── */}
      {activeTab !== 'gains' && <div className="pdb-section" style={{ animation:'fadeUp3 .5s .1s ease both', opacity:0, animationFillMode:'forwards' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, paddingBottom:16, borderBottom:'1.5px solid #F1F5F9' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:4, height:20, background:'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius:2 }}/>
            <div>
              <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', margin:0, fontSize:'1.08rem', fontWeight:900, color:'#0F172A' }}>📩 Demandes de réservation</h3>
              <div style={{ fontSize:'.76rem', color:'#94A3B8', marginTop:2, fontWeight:500 }}>Gérez et répondez aux demandes de vos étudiants</div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} className={`pdb-tab-btn${activeTab===t.key?' active':''}`}
              onClick={() => setActiveTab(t.key)}
              style={{ borderColor: activeTab===t.key ? t.border : '#E2E8F0', background: activeTab===t.key ? t.bg : '#fff', color: activeTab===t.key ? t.color : '#94A3B8' }}>
              {t.label}
              <span style={{ fontSize:'.62rem', fontWeight:900, padding:'2px 7px', borderRadius:20, background: activeTab===t.key ? 'rgba(0,0,0,0.1)' : '#F1F5F9', color: activeTab===t.key ? t.color : '#94A3B8' }}>{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {/* Filtres */}
        <div style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center', flexWrap:'wrap', paddingBottom:16, borderBottom:'1.5px solid #F1F5F9' }}>
          {[{val:'',icon:'🔀',label:'Tous modes'},{val:'en_ligne',icon:'🌐',label:'En ligne'},{val:'presentiel',icon:'🏫',label:'Présentiel'}].map(m => (
            <button key={m.val} className={`pdb-filter-btn${filterMode===m.val?' active':''}`} onClick={() => setFilterMode(m.val)}>
              {m.icon} {m.label}
            </button>
          ))}
          <div style={{ width:1, height:20, background:'#F1F5F9' }}/>
          <button className={`pdb-filter-btn${filterMonth===''?' active':''}`} onClick={() => setFilterMonth('')}>📅 Tous</button>
          {availableMonths.map(m => {
            const [y,mo] = m.split('-');
            return <button key={m} className={`pdb-filter-btn${filterMonth===m?' active':''}`} onClick={() => setFilterMonth(m)}>{MONTH_LABELS[parseInt(mo)-1]} {y}</button>;
          })}
          {(filterMode||filterMonth) && (
            <button onClick={() => { setFilterMode(''); setFilterMonth(''); }} style={{ marginLeft:'auto', padding:'7px 13px', background:'#FEF2F2', color:'#DC2626', border:'1.5px solid #FCA5A5', borderRadius:20, cursor:'pointer', fontWeight:700, fontSize:'.75rem', fontFamily:'Cabinet Grotesk,sans-serif' }}>✕ Réinitialiser</button>
          )}
          <div style={{ fontSize:'.78rem', color:'#94A3B8', marginLeft:(filterMode||filterMonth)?0:'auto', fontWeight:600 }}>
            <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, color:'#0F172A' }}>{filtered.length}</span> réservation{filtered.length!==1?'s':''}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div style={{ padding:50, textAlign:'center' }}>
            <div style={{ width:36, height:36, border:'3px solid #E2E8F0', borderTopColor:'#00153D', borderRadius:'50%', animation:'spin3 1s linear infinite', margin:'0 auto 14px' }}/>
            <div style={{ color:'#94A3B8', fontWeight:600, fontSize:'.88rem' }}>Chargement...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#94A3B8' }}>
            <div style={{ fontSize:'3rem', marginBottom:14 }}>{activeTab==='en_attente'?'✅':'📭'}</div>
            <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'#0F172A', marginBottom:6 }}>
              {activeTab==='en_attente'?'Aucune demande en attente':'Aucune réservation'}
            </div>
            <div style={{ fontSize:'.85rem', fontStyle:'italic' }}>
              {activeTab==='en_attente'?'Toutes vos demandes ont été traitées 🎉':'Aucune réservation dans cette catégorie.'}
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered
              .sort((a,b) => {
                if (a.statut==='en_attente' && b.statut!=='en_attente') return -1;
                if (b.statut==='en_attente' && a.statut!=='en_attente') return 1;
                return new Date(b.created_at||0) - new Date(a.created_at||0);
              })
              .map((r, i) => (
                <ReservationCard key={r.id} r={r} index={i}
                  onView={setSelectedResa}
                  onAction={updateReservation}
                  onChat={resa => setChatResa(resa)}
                  unreadCount={unreadMap[r.id]||0}
                />
              ))}
          </div>
        )}
      </div>}

      {/* ── SECTION GAINS ── */}
      {activeTab === 'gains' && (
        <div style={{ animation:'fadeUp3 .5s .1s ease both', opacity:0, animationFillMode:'forwards' }}>
          {/* Barre de navigation avec bouton retour */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:12, cursor:'pointer', fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:700, fontSize:'.82rem', color:'#64748B', transition:'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#EFF6FF'; e.currentTarget.style.borderColor='#BFDBFE'; e.currentTarget.style.color='#1D4ED8'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#F8FAFC'; e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.color='#64748B'; }}>
              ← Retour aux réservations
            </button>
            <div style={{ width:4, height:22, background:'linear-gradient(180deg,#065F46,#10B981)', borderRadius:2 }}/>
            <h2 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1.2rem', color:'#0F172A', margin:0 }}>💰 Gestion des gains</h2>
          </div>
          <GainsSection reservations={reservations}/>
        </div>
      )}

      {selectedResa && (
        <ReservationModal reservation={selectedResa} onClose={() => setSelectedResa(null)}
          onAction={(id,statut) => { updateReservation(id,statut); setSelectedResa(prev => prev?{...prev,statut}:null); }}
          onChat={resa => { setSelectedResa(null); setChatResa(resa); }}
        />
      )}

      {chatResa && (
        <ChatWindow reservation={chatResa} currentUser={user} onClose={() => { setChatResa(null); loadUnread(); }}/>
      )}
    </div>
  );
}