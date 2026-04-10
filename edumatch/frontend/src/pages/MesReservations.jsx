import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Calendar, Clock, CreditCard, Video,
  ChevronDown, ChevronUp, Mail, Phone, FileText,
  AlertCircle, CheckCircle2, XCircle, Loader2,
  Paperclip, Send, X, ArrowUpRight, Inbox, Filter, Sparkles
} from 'lucide-react';
import api from '../services/api';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}
function formatTime(str) {
  if (!str) return '';
  const d = new Date(str);
  const diff = Math.floor((new Date() - d) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const STATUS_CFG = {
  en_attente: { label: 'En attente',  color: '#B45309', bg: '#FFFBEB', border: '#FCD34D', icon: <Clock size={12}/> },
  confirmé:   { label: 'Confirmé',   color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7', icon: <CheckCircle2 size={12}/> },
  refusé:     { label: 'Refusé',     color: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5', icon: <XCircle size={12}/> },
  annulé:     { label: 'Annulé',     color: '#374151', bg: '#F9FAFB', border: '#D1D5DB', icon: <XCircle size={12}/> },
  terminé:    { label: 'Terminé',    color: '#1D4ED8', bg: '#EFF6FF', border: '#93C5FD', icon: <CheckCircle2 size={12}/> },
};

function Avatar({ nom, size = 40 }) {
  const initials = (nom || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [['#00153D','#1E3A8A'],['#065F46','#047857'],['#4C1D95','#6D28D9'],['#7C2D12','#9A3412'],['#1E3A8A','#2563EB']];
  const [a, b] = palettes[(nom||'P').charCodeAt(0) % palettes.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${a}, ${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 900, color: '#fff', flexShrink: 0, fontFamily: 'Cabinet Grotesk, sans-serif', letterSpacing: '-0.02em', boxShadow: '0 2px 10px rgba(0,0,0,0.14)' }}>
      {initials}
    </div>
  );
}

function StatusBadge({ statut }) {
  const cfg = STATUS_CFG[statut] || { label: statut, color: '#374151', bg: '#F9FAFB', border: '#D1D5DB', icon: null };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function MeetBlock({ r }) {
  if (r.session_past) return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#F9FAFB', border:'1.5px solid #E5E7EB', borderRadius:12, marginBottom:14 }}>
      <Video size={16} style={{ color:'#9CA3AF', flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'.78rem', fontWeight:700, color:'#6B7280' }}>Session terminée</div>
        <a href={r.lien_meet} target="_blank" rel="noreferrer" style={{ fontSize:'.7rem', color:'#3B82F6', textDecoration:'none' }}>Revoir le lien Meet →</a>
      </div>
    </div>
  );
  if (r.session_active) return (
    <a href={r.lien_meet} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block', marginBottom:14 }}>
      <motion.div animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.3)','0 0 0 10px rgba(16,185,129,0)'] }} transition={{ duration:1.8, repeat:Infinity }}
        style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', background:'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border:'2px solid #10B981', borderRadius:16, cursor:'pointer' }}>
        <div style={{ width:38, height:38, borderRadius:11, background:'#10B981', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Video size={18} style={{ color:'#fff' }}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, fontWeight:800, color:'#065F46', fontSize:'.88rem', fontFamily:'Cabinet Grotesk, sans-serif' }}>
            <motion.span animate={{ opacity:[1,0,1] }} transition={{ duration:1, repeat:Infinity }} style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', display:'inline-block' }}/>
            En cours — Rejoindre maintenant
          </div>
          <div style={{ fontSize:'.7rem', color:'#065F46', opacity:.6, marginTop:2 }}>{r.lien_meet}</div>
        </div>
        <ArrowUpRight size={18} style={{ color:'#10B981' }}/>
      </motion.div>
    </a>
  );
  if (r.session_imminent) return (
    <a href={r.lien_meet} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#FFFBEB', border:'1.5px solid #F59E0B', borderRadius:14, cursor:'pointer' }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Video size={16} style={{ color:'#F59E0B' }}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, color:'#B45309', fontSize:'.84rem' }}>Dans {r.minutes_until} min — Préparez-vous</div>
          <div style={{ fontSize:'.7rem', color:'#92400E', opacity:.6, marginTop:2 }}>{r.lien_meet}</div>
        </div>
        <ArrowUpRight size={16} style={{ color:'#F59E0B' }}/>
      </div>
    </a>
  );
  if (r.session_today) return (
    <a href={r.lien_meet} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 15px', background:'#EFF6FF', border:'1.5px solid #93C5FD', borderRadius:13, cursor:'pointer' }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'#DBEAFE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Video size={16} style={{ color:'#3B82F6' }}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, color:'#1D4ED8', fontSize:'.83rem' }}>Cours aujourd'hui — Lien disponible</div>
          <div style={{ fontSize:'.7rem', color:'#1E40AF', opacity:.55, marginTop:2 }}>{r.lien_meet}</div>
        </div>
        <ArrowUpRight size={15} style={{ color:'#3B82F6' }}/>
      </div>
    </a>
  );
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:12, marginBottom:14 }}>
      <Video size={15} style={{ color:'#94A3B8', flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'.78rem', fontWeight:600, color:'#64748B' }}>Lien Meet — disponible le jour J</div>
        <div style={{ fontSize:'.7rem', color:'#94A3B8', marginTop:1 }}>📅 Actif le {formatDate(r.date_cours)} à {r.heure_debut}</div>
      </div>
      <a href={r.lien_meet} target="_blank" rel="noreferrer" style={{ fontSize:'.7rem', color:'#1D4ED8', fontWeight:700, textDecoration:'none', background:'#EFF6FF', padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>
        Accéder ↗
      </a>
    </div>
  );
}

function ChatWindow({ reservation, currentUser, onClose, onNewMessage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const pollRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try { const res = await api.get(`/api/messages/reservation/${reservation.id}`); setMessages(res.data); } catch {}
  }, [reservation.id]);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendText = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/api/messages/reservation/${reservation.id}`, { contenu: input.trim() });
      setMessages(prev => [...prev, res.data]);
      setInput('');
      onNewMessage?.();
    } catch (e) { alert('Erreur : ' + (e.response?.data?.detail || e.message)); }
    finally { setSending(false); }
  };

  const sendFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api.post(`/api/messages/reservation/${reservation.id}/fichier`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessages(prev => [...prev, res.data]);
      onNewMessage?.();
    } catch (e) { alert('Erreur upload : ' + (e.response?.data?.detail || e.message)); }
    finally { setUploading(false); }
  };

  const isMine = (msg) => msg.expediteur_id === currentUser.id;

  const renderFile = (msg) => {
    const url = `http://localhost:8001${msg.fichier_url}`;
    if (msg.fichier_type === 'image') return (
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={msg.fichier_nom} style={{ maxWidth: 200, maxHeight: 160, borderRadius: 8, display: 'block', objectFit: 'cover' }}/>
      </a>
    );
    return (
      <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', background: 'rgba(0,0,0,0.05)', borderRadius: 9, textDecoration: 'none', color: 'inherit' }}>
        <FileText size={16} style={{ opacity: .5, flexShrink: 0 }}/>
        <div>
          <div style={{ fontWeight: 600, fontSize: '.8rem' }}>{msg.fichier_nom}</div>
          <div style={{ fontSize: '.68rem', opacity: .55 }}>Cliquer pour ouvrir</div>
        </div>
      </a>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: .88, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: .88, y: 24 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      style={{ position: 'fixed', bottom: 24, right: 24, width: 390, height: 580, background: '#fff', borderRadius: 26, boxShadow: '0 40px 100px rgba(0,21,61,0.2), 0 0 0 1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden', fontFamily: 'Instrument Sans, sans-serif' }}
    >
      <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg,#00153D 0%,#1E3A8A 100%)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar nom={reservation.prof_nom} size={44}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '.98rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reservation.prof_nom || 'Professeur'}</div>
          <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>📅 {reservation.date_cours ? formatDate(reservation.date_cours) : '—'}</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={15}/>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 6px', display: 'flex', flexDirection: 'column', gap: 9, background: '#F8FAFC' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '44px 16px', color: '#94A3B8' }}>
            <MessageCircle size={38} style={{ marginBottom: 12, opacity: .3 }}/>
            <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '.9rem', color: '#0F172A', marginBottom: 4 }}>Démarrez la conversation</div>
            <div style={{ fontSize: '.78rem', opacity: .7 }}>Posez vos questions au professeur</div>
          </div>
        )}
        {messages.map(msg => {
          const mine = isMine(msg);
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 7 }}>
              {!mine && <Avatar nom={msg.expediteur_nom} size={26}/>}
              <div style={{ maxWidth: '74%' }}>
                <div style={{ padding: msg.fichier_url ? '6px' : '10px 14px', borderRadius: mine ? '18px 18px 5px 18px' : '18px 18px 18px 5px', background: mine ? 'linear-gradient(135deg,#00153D,#1E40AF)' : '#fff', color: mine ? '#fff' : '#0F172A', fontSize: '.85rem', lineHeight: 1.55, boxShadow: mine ? '0 3px 14px rgba(0,21,61,0.22)' : '0 1px 5px rgba(0,0,0,0.07)', border: mine ? 'none' : '1.5px solid #F1F5F9' }}>
                  {msg.contenu && <span>{msg.contenu}</span>}
                  {msg.fichier_url && renderFile(msg)}
                </div>
                <div style={{ fontSize: '.63rem', color: '#94A3B8', marginTop: 3, textAlign: mine ? 'right' : 'left' }}>
                  {formatTime(msg.created_at)}{mine && <span style={{ marginLeft: 4 }}>{msg.lu ? '✓✓' : '✓'}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      <div style={{ padding: '11px 13px', borderTop: '1.5px solid #F1F5F9', display: 'flex', alignItems: 'flex-end', gap: 8, background: '#fff' }}>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1.5px solid #E2E8F0', cursor: uploading ? 'not-allowed' : 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {uploading ? <Loader2 size={15}/> : <Paperclip size={15}/>}
        </button>
        <input ref={fileRef} type="file" hidden accept="image/*,.pdf,.doc,.docx,.txt" onChange={e => sendFile(e.target.files[0])}/>
        <textarea rows={1} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); } }}
          placeholder="Votre message..."
          style={{ flex: 1, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '9px 12px', color: '#0F172A', fontSize: '.85rem', resize: 'none', outline: 'none', fontFamily: 'Instrument Sans, sans-serif', maxHeight: 80, overflowY: 'auto' }}/>
        <motion.button onClick={sendText} disabled={!input.trim() || sending} whileTap={{ scale: .93 }}
          style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: (!input.trim() || sending) ? 'not-allowed' : 'pointer', background: (!input.trim() || sending) ? '#F1F5F9' : '#00153D', color: (!input.trim() || sending) ? '#CBD5E1' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
          {sending ? <Loader2 size={15}/> : <Send size={15}/>}
        </motion.button>
      </div>
    </motion.div>
  );
}

function InfoBlock({ icon, label, value, accent }) {
  return (
    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 13, border: '1.5px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#94A3B8', marginBottom: 5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' }}>{icon} {label}</div>
      <div style={{ fontWeight: 900, fontSize: '.88rem', color: accent || '#0F172A', fontFamily: 'Cabinet Grotesk, sans-serif', letterSpacing: '-.01em' }}>{value || '—'}</div>
    </div>
  );
}

function ReservationCard({ r, onChat, unreadCount, index }) {
  const [expanded, setExpanded] = useState(false);
  const isFuture = r.date_cours && new Date(r.date_cours + 'T23:59:59') >= new Date();
  const topBarColor = r.statut === 'confirmé' ? 'linear-gradient(90deg,#10B981,#34D399)' : r.statut === 'en_attente' ? 'linear-gradient(90deg,#F59E0B,#FCD34D)' : r.statut === 'refusé' ? 'linear-gradient(90deg,#EF4444,#F87171)' : 'linear-gradient(90deg,#3B82F6,#818CF8)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: .45, ease: [.22, 1, .36, 1] }}
      whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0,21,61,0.09)' }}
      style={{ background: '#fff', borderRadius: 26, overflow: 'hidden', border: '1.5px solid #F1F5F9', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', transition: 'box-shadow .2s, transform .2s' }}
    >
      <div style={{ height: 4, background: topBarColor }}/>
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <Avatar nom={r.prof_nom} size={54}/>
            <div>
              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.08rem', color: '#0F172A', marginBottom: 7, letterSpacing: '-.02em' }}>{r.prof_nom || 'Professeur'}</div>
              <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
                <StatusBadge statut={r.statut}/>
                {r.mode_seance && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: r.mode_seance === 'en_ligne' ? '#EFF6FF' : '#ECFDF5', color: r.mode_seance === 'en_ligne' ? '#1D4ED8' : '#065F46', border: `1.5px solid ${r.mode_seance === 'en_ligne' ? '#BFDBFE' : '#6EE7B7'}` }}>
                    {r.mode_seance === 'en_ligne' ? '🌐' : '🏫'} {r.mode_seance === 'en_ligne' ? 'En ligne' : 'Présentiel'}
                  </span>
                )}
                {isFuture && r.statut === 'confirmé' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#EEF2FF', color: '#4F46E5', border: '1.5px solid #C7D2FE' }}>✨ À venir</span>
                )}
              </div>
            </div>
          </div>

          {r.statut === 'confirmé' && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .96 }} onClick={() => onChat(r)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#00153D', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, cursor: 'pointer', fontSize: '.82rem', flexShrink: 0, boxShadow: '0 5px 18px rgba(0,21,61,0.25)' }}>
              <MessageCircle size={15}/> Contacter
              {unreadCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: -8, right: -8, background: '#EF4444', color: '#fff', fontSize: '.6rem', fontWeight: 900, padding: '2px 6px', borderRadius: 20, minWidth: 18, textAlign: 'center', border: '2px solid #fff' }}>
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: r.description_seance ? 10 : 16 }}>
          <InfoBlock icon={<Calendar size={11}/>} label="Date" value={formatDate(r.date_cours)}/>
          <InfoBlock icon={<Clock size={11}/>} label="Horaire" value={`${String(r.heure_debut||'').slice(0,5)} → ${String(r.heure_fin||'').slice(0,5)}`}/>
          {r.tarif_applique && <InfoBlock icon={<CreditCard size={11}/>} label="Tarif" value={`${r.tarif_applique} DT/h`} accent="#065F46"/>}
        </div>
        {r.description_seance && (
          <div style={{ marginBottom:16, padding:'10px 14px', background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:12, display:'flex', alignItems:'flex-start', gap:9 }}>
            <FileText size={14} style={{ color:'#94A3B8', flexShrink:0, marginTop:2 }}/>
            <div>
              <div style={{ fontSize:'.66rem', fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>Description de la séance</div>
              <div style={{ fontSize:'.82rem', color:'#374151', lineHeight:1.6, fontStyle:'italic' }}>{r.description_seance}</div>
            </div>
          </div>
        )}

        {r.mode_seance === 'en_ligne' && r.lien_meet && r.statut === 'confirmé' && <MeetBlock r={r}/>}

        <button onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, padding: 0, transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#00153D'}
          onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
          {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          {expanded ? 'Moins de détails' : 'Plus de détails'}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }} style={{ overflow: 'hidden' }}>
              <div style={{ marginTop: 14, padding: '16px 18px', background: '#F8FAFC', borderRadius: 16, border: '1.5px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 11 }}>
                {r.prof_email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.83rem' }}>
                    <Mail size={14} style={{ color: '#94A3B8', flexShrink: 0 }}/>
                    <a href={`mailto:${r.prof_email}`} style={{ color: '#1D4ED8', textDecoration: 'none', fontWeight: 600 }}>{r.prof_email}</a>
                  </div>
                )}
                {r.prof_telephone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.83rem' }}>
                    <Phone size={14} style={{ color: '#94A3B8', flexShrink: 0 }}/>
                    <a href={`tel:${r.prof_telephone}`} style={{ color: '#1D4ED8', textDecoration: 'none', fontWeight: 600 }}>{r.prof_telephone}</a>
                  </div>
                )}
                {r.notes_etudiant && (
                  <div style={{ display: 'flex', gap: 10, fontSize: '.82rem' }}>
                    <FileText size={14} style={{ color: '#94A3B8', flexShrink: 0, marginTop: 2 }}/>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 700 }}>Votre message : </span>
                      <span style={{ color: '#374151', fontStyle: 'italic' }}>{r.notes_etudiant}</span>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.75rem', color: '#94A3B8', paddingTop: 8, borderTop: '1px solid #E2E8F0' }}>
                  <Clock size={12}/> Réservation créée le {r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 26, overflow: 'hidden' }}>
      <div style={{ height: 4, background: 'linear-gradient(90deg,#F8FAFC,#E2E8F0,#F8FAFC)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}/>
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', gap: 15, marginBottom: 22 }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#F1F5F9', animation: 'pulse 1.5s infinite', flexShrink: 0 }}/>
          <div style={{ flex: 1 }}>
            <div style={{ height: 15, background: '#F1F5F9', borderRadius: 7, marginBottom: 10, width: '52%', animation: 'pulse 1.5s infinite' }}/>
            <div style={{ height: 10, background: '#F1F5F9', borderRadius: 5, width: '36%', animation: 'pulse 1.5s infinite' }}/>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 58, background: '#F8FAFC', borderRadius: 13, animation: 'pulse 1.5s infinite' }}/>)}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  );
}

export default function MesReservations() {
  const { user } = useAuth();
  const outletCtx = useOutletContext?.() || {};
  const { chatResaId, setChatResaId } = outletCtx;

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('toutes');
  const [chatResa, setChatResa] = useState(null);
  const [unreadMap, setUnreadMap] = useState({});

  useEffect(() => {
    loadReservations();
    loadUnread();
    const interval = setInterval(loadUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatResaId && reservations.length > 0) {
      const resa = reservations.find(r => r.id === Number(chatResaId));
      if (resa) { setChatResa(resa); setChatResaId?.(null); }
    }
  }, [chatResaId, reservations]);

  const loadReservations = async () => {
    try { const res = await api.get('/api/reservations/mes-reservations'); setReservations(res.data); }
    catch {} finally { setLoading(false); }
  };

  const loadUnread = async () => {
    try {
      const res = await api.get('/api/messages/non-lus');
      const map = {};
      (res.data.messages || []).forEach(m => { map[m.reservation_id] = (map[m.reservation_id] || 0) + 1; });
      setUnreadMap(map);
    } catch {}
  };

  const counts = {
    toutes: reservations.length,
    en_attente: reservations.filter(r => r.statut === 'en_attente').length,
    confirmé: reservations.filter(r => r.statut === 'confirmé').length,
    a_venir: reservations.filter(r => r.statut === 'confirmé' && r.date_cours && new Date(r.date_cours + 'T23:59:59') >= new Date()).length,
    passées: reservations.filter(r => r.date_cours && new Date(r.date_cours + 'T23:59:59') < new Date()).length,
    refusé: reservations.filter(r => r.statut === 'refusé').length,
  };

  const filters = [
    { key: 'toutes',     label: 'Toutes',     activeBg: '#00153D',   activeText: '#fff',    activeBorder: '#00153D' },
    { key: 'en_attente', label: 'En attente', activeBg: '#FFFBEB',   activeText: '#92400E', activeBorder: '#FCD34D' },
    { key: 'confirmé',   label: 'Confirmées', activeBg: '#D1FAE5',   activeText: '#065F46', activeBorder: '#6EE7B7' },
    { key: 'a_venir',    label: 'À venir',    activeBg: '#DBEAFE',   activeText: '#1E40AF', activeBorder: '#93C5FD' },
    { key: 'passées',    label: 'Passées',    activeBg: '#F3F4F6',   activeText: '#374151', activeBorder: '#D1D5DB' },
    { key: 'refusé',     label: 'Refusées',   activeBg: '#FEE2E2',   activeText: '#991B1B', activeBorder: '#FCA5A5' },
  ];

  const filtered = reservations.filter(r => {
    if (activeFilter === 'toutes') return true;
    if (activeFilter === 'a_venir') return r.statut === 'confirmé' && r.date_cours && new Date(r.date_cours + 'T23:59:59') >= new Date();
    if (activeFilter === 'passées') return r.date_cours && new Date(r.date_cours + 'T23:59:59') < new Date();
    return r.statut === activeFilter;
  });

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: '36px 40px', maxWidth: 940, margin: '0 auto', background: '#FDFEFF', minHeight: '100vh', fontFamily: 'Instrument Sans, sans-serif' }}>

      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease: [.22, 1, .36, 1] }} style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 4, height: 28, background: 'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius: 2 }}/>
          <Sparkles size={15} style={{ color: '#F59E0B' }}/>
          <span style={{ fontSize: '.7rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.14em' }}>Espace Étudiant</span>
        </div>
        <h1 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '2.4rem', color: '#0F172A', margin: '0 0 8px', letterSpacing: '-.035em', lineHeight: 1 }}>
          Mes Réservations
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '.9rem', margin: 0, fontWeight: 500, fontStyle: 'italic' }}>
          Retrouvez l'historique complet de vos sessions passées et à venir
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 30 }}>
        {[
          { icon: '📅', val: counts.toutes,     lbl: 'Total',         iconBg: '#C7D2FE', numColor: '#1E40AF' },
          { icon: '⏳', val: counts.en_attente, lbl: 'En attente',    iconBg: '#FDE68A', numColor: '#B45309' },
          { icon: '✅', val: counts.confirmé,   lbl: 'Confirmées',    iconBg: '#A7F3D0', numColor: '#065F46' },
          { icon: '💬', val: totalUnread,        lbl: 'Msgs non lus', iconBg: '#FED7E2', numColor: '#9F1239' },
        ].map((s, i) => (
          <motion.div key={s.lbl} initial={{ opacity: 0, scale: .88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * .06 + .08 }}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}
            style={{ background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 20, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', cursor: 'default', transition: 'all .2s' }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: s.numColor, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '.68rem', color: '#94A3B8', marginTop: 3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.lbl}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {totalUnread > 0 && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}
            style={{ marginBottom: 20, padding: '14px 20px', background: '#FFF1F2', border: '1.5px solid #FED7E2', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={18} style={{ color: '#EF4444' }}/>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, color: '#DC2626' }}>{totalUnread} message{totalUnread > 1 ? 's' : ''} non lu{totalUnread > 1 ? 's' : ''}</span>
              <span style={{ color: '#64748B', fontSize: '.85rem' }}> — vos professeurs vous ont écrit</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .18 }}
        style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94A3B8', fontSize: '.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.12em', marginRight: 6 }}>
          <Filter size={12}/> Filtrer
        </div>
        {filters.map(f => {
          const isActive = activeFilter === f.key;
          return (
            <motion.button key={f.key} whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
              onClick={() => setActiveFilter(f.key)}
              style={{ padding: '8px 16px', borderRadius: 22, cursor: 'pointer', fontWeight: 700, fontSize: '.8rem', border: isActive ? `1.5px solid ${f.activeBorder}` : '1.5px solid #E2E8F0', background: isActive ? f.activeBg : '#fff', color: isActive ? f.activeText : '#94A3B8', boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.07)' : 'none', display: 'flex', alignItems: 'center', gap: 7, transition: 'all .18s', fontFamily: isActive ? 'Cabinet Grotesk, sans-serif' : 'inherit' }}>
              {f.label}
              <span style={{ background: isActive ? 'rgba(0,0,0,0.1)' : '#F1F5F9', color: isActive ? f.activeText : '#94A3B8', fontSize: '.62rem', fontWeight: 900, padding: '2px 7px', borderRadius: 20 }}>
                {counts[f.key]}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <SkeletonCard key={i}/>)}</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 28, border: '1.5px solid #F1F5F9', boxShadow: '0 2px 16px rgba(0,0,0,0.03)' }}>
          <Inbox size={52} style={{ color: '#E2E8F0', marginBottom: 18 }}/>
          <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.3rem', color: '#0F172A', marginBottom: 8, letterSpacing: '-.02em' }}>Aucune réservation</div>
          <div style={{ fontSize: '.9rem', color: '#94A3B8', fontWeight: 500, fontStyle: 'italic' }}>
            {activeFilter === 'toutes' ? "Vous n'avez pas encore de réservation." : 'Aucune réservation dans cette catégorie.'}
          </div>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).map((r, i) => (
            <ReservationCard key={r.id} r={r} onChat={resa => setChatResa(resa)} unreadCount={unreadMap[r.id] || 0} index={i}/>
          ))}
        </div>
      )}

      <AnimatePresence>
        {chatResa && (
          <ChatWindow reservation={chatResa} currentUser={user} onClose={() => { setChatResa(null); loadUnread(); }} onNewMessage={loadUnread}/>
        )}
      </AnimatePresence>
    </div>
  );
}