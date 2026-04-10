import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProfModal from './ProfModal';

/* ════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════ */
function Stars({ n }) {
  const v = parseFloat(n) || 0;
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(v) ? '#f59e0b' : 'var(--border)', fontSize: 12 }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 3 }}>{v.toFixed(1)}</span>
    </span>
  );
}

function ScorePill({ score }) {
  const cfg = score >= 80
    ? { color: '#16a34a', bg: 'rgba(22,163,74,0.1)',  border: 'rgba(22,163,74,0.25)',  label: 'Excellent' }
    : score >= 65
    ? { color: '#6c63ff', bg: 'rgba(108,99,255,0.1)', border: 'rgba(108,99,255,0.25)', label: 'Très bon' }
    : score >= 50
    ? { color: '#d97706', bg: 'rgba(217,119,6,0.1)',  border: 'rgba(217,119,6,0.25)',  label: 'Bon' }
    : { color: '#dc2626', bg: 'rgba(220,38,38,0.1)',  border: 'rgba(220,38,38,0.25)',  label: 'Possible' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 11, fontWeight: 700, color: cfg.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {score}/100 · {cfg.label}
    </span>
  );
}

/* ════════════════════════════════════════════════
   BARRE DE PROGRESSION COLLECTE
════════════════════════════════════════════════ */
const ETAPES = [
  { key: 'matiere',    label: 'Matière',  icon: '📚' },
  { key: 'niveau',     label: 'Niveau',   icon: '🎓' },
  { key: 'mode',       label: 'Mode',     icon: '📡' },
  { key: 'budget_max', label: 'Budget',   icon: '💰' },
];

function ProgressBar({ prochain }) {
  const idx = ETAPES.findIndex(e => e.key === prochain);
  return (
    <div style={{ padding: '10px 14px', background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 12, marginTop: 2 }}>
      <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, marginBottom: 8 }}>
        Profil en cours — étape {idx + 1}/{ETAPES.length}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {ETAPES.map((e, i) => {
          const done    = i < idx;
          const current = i === idx;
          return (
            <React.Fragment key={e.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                  background: done ? '#6c63ff' : current ? 'rgba(108,99,255,0.15)' : 'var(--surface2)',
                  border: done ? '2px solid #6c63ff' : current ? '2px solid #6c63ff' : '2px solid var(--border)',
                  color: done ? '#fff' : current ? '#6c63ff' : 'var(--text2)',
                  fontWeight: 700,
                }}>
                  {done ? '✓' : e.icon}
                </div>
                <div style={{ fontSize: 10, color: done ? '#6c63ff' : current ? '#6c63ff' : 'var(--text2)', fontWeight: current ? 700 : 400 }}>
                  {e.label}
                </div>
              </div>
              {i < ETAPES.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < idx ? '#6c63ff' : 'var(--border)', borderRadius: 1, marginBottom: 14 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   CARTE PROF — dans la discussion
════════════════════════════════════════════════ */
function ProfCard({ prof, rank, onView }) {
  const [hov, setHov] = useState(false);
  const nom    = prof.nom || `${prof.user_prenom || ''} ${prof.user_nom || ''}`.trim();
  const score  = prof.score?.total || 0;
  const medals = ['🥇', '🥈', '🥉'];

  const tarifs = [prof.tarif_en_ligne, prof.tarif_presentiel].filter(v => v && parseFloat(v) > 0).map(Number);
  const tarifMin = tarifs.length ? Math.min(...tarifs) : null;

  const modeInfo = {
    en_ligne:   { label: '🌐 En ligne',    color: '#0ea5e9' },
    presentiel: { label: '🏫 Présentiel',  color: '#16a34a' },
    les_deux:   { label: '🔀 Les deux',    color: '#6c63ff' },
  }[prof.mode_enseignement] || { label: '🏫 Présentiel', color: '#16a34a' };

  const barColor = score >= 80 ? '#16a34a' : score >= 65 ? '#6c63ff' : score >= 50 ? '#d97706' : '#dc2626';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--card)',
        border: hov ? '1.5px solid #6c63ff' : '1.5px solid var(--border)',
        borderRadius: 16,
        padding: '14px 16px',
        transition: 'all .2s',
        boxShadow: hov ? '0 6px 20px rgba(108,99,255,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{medals[rank - 1] || `#${rank}`}</span>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#ff6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, overflow: 'hidden', flexShrink: 0 }}>
          {prof.photo_url
            ? <img src={`http://localhost:8001${prof.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '👨‍🏫'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nom}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Stars n={prof.note_moyenne} />
            {prof.ville && <span style={{ fontSize: 11, color: 'var(--text2)' }}>📍 {prof.ville}</span>}
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          {tarifMin && <div style={{ fontWeight: 800, fontSize: 14, color: '#16a34a' }}>{tarifMin} DT/h</div>}
          <div style={{ fontSize: 11, color: modeInfo.color, fontWeight: 600 }}>{modeInfo.label}</div>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>Score de matching</span>
          <ScorePill score={score} />
        </div>
        <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: barColor, borderRadius: 3, transition: 'width .8s ease' }} />
        </div>
        {/* Détail critères — poids réels backend */}
        <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
          {prof.score?.details && [
            { icon: '📚', key: 'matiere',    max: 25, label: 'Matière'  },
            { icon: '🎓', key: 'niveau',     max: 40, label: 'Niveau'   },
            { icon: '📍', key: 'ville',      max: 15, label: 'Ville'    },
            { icon: '💰', key: 'budget',     max: 10, label: 'Budget'   },
            { icon: '📡', key: 'mode',       max:  5, label: 'Mode'     },
            { icon: '⭐', key: 'reputation', max:  5, label: 'Note'     },
          ].map(c => {
            const val = prof.score.details[c.key] ?? 0;
            const full = val >= c.max;
            const partial = val > 0 && !full;
            const color = full ? '#16a34a' : partial ? '#d97706' : '#dc2626';
            const bg    = full ? 'rgba(22,163,74,0.09)' : partial ? 'rgba(217,119,6,0.09)' : 'rgba(220,38,38,0.06)';
            return (
              <span key={c.key} title={`${c.label} : ${val}/${c.max} pts`}
                style={{ fontSize: 10, color, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: bg, border: `1px solid ${color}30`, display:'inline-flex', alignItems:'center', gap:3 }}>
                {c.icon} {val}/{c.max}
              </span>
            );
          })}
        </div>
      </div>

      {/* Matières */}
      {prof.matieres && prof.matieres.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {prof.matieres.slice(0, 4).map(m => (
            <span key={m} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(108,99,255,0.1)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.2)' }}>{m}</span>
          ))}
        </div>
      )}

      {/* Prochain créneau */}
      {prof.disponibilites && prof.disponibilites.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text)', marginBottom: 8, padding: '5px 9px', background: 'rgba(22,163,74,0.08)', borderRadius: 8, border: '1px solid rgba(22,163,74,0.2)' }}>
          📅 <strong>{prof.disponibilites[0].date}</strong> · {prof.disponibilites[0].heure_debut} – {prof.disponibilites[0].heure_fin}
          <span style={{ marginLeft: 6, color: modeInfo.color }}>{prof.disponibilites[0].mode === 'en_ligne' ? '🌐' : '🏫'}</span>
        </div>
      )}

      {/* Bio */}
      {prof.bio && (
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, margin: '0 0 10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {prof.bio}
        </p>
      )}

      {/* Boutons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onView(prof)}
          style={{ flex: 1, padding: '8px 0', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--text)', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.color = '#6c63ff'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
        >
          👤 Voir profil
        </button>
        <button
          onClick={() => onView(prof)}
          style={{ flex: 2, padding: '8px 0', background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#fff', boxShadow: '0 2px 8px rgba(108,99,255,0.3)', transition: 'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          📅 Réserver un cours
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   BULLE MESSAGE
════════════════════════════════════════════════ */
function Message({ msg, onViewProf }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: 20, gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '80%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
        {/* Avatar */}
        <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: isUser ? 'linear-gradient(135deg,#6c63ff,#8b5cf6)' : 'linear-gradient(135deg,#f59e0b,#ef4444)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
          {isUser ? '👤' : '🤖'}
        </div>
        <div>
          <div style={{
            padding: '11px 15px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser ? 'linear-gradient(135deg,#6c63ff,#8b5cf6)' : 'var(--surface)',
            color: isUser ? '#fff' : 'var(--text)',
            fontSize: 14, lineHeight: 1.65,
            border: isUser ? 'none' : '1px solid var(--border)',
            boxShadow: isUser ? '0 2px 8px rgba(108,99,255,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {msg.content}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3, textAlign: isUser ? 'right' : 'left' }}>
            {msg.time}
          </div>
        </div>
      </div>

      {/* Indicateur de progression — seulement si pas encore de résultats */}
      {!isUser && msg.prochain_critere && !msg.besoin_complet && (!msg.profs || msg.profs.length === 0) && (
        <div style={{ paddingLeft: 40, maxWidth: 460 }}>
          <ProgressBar prochain={msg.prochain_critere} />
        </div>
      )}

      {/* Cartes profs sous le message assistant */}
      {!isUser && msg.profs && msg.profs.length > 0 && (
        <div style={{ paddingLeft: 40, width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 2 }}>
            🎯 {msg.profs.length} professeur{msg.profs.length > 1 ? 's' : ''} trouvé{msg.profs.length > 1 ? 's' : ''} — profil complet
          </div>
          {msg.profs.map((prof, i) => (
            <ProfCard key={prof.id} prof={prof} rank={i + 1} onView={onViewProf} />
          ))}
        </div>
      )}

      {/* Aucun prof trouvé */}
      {!isUser && msg.noProfs && (
        <div style={{ paddingLeft: 40, maxWidth: 420 }}>
          <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, fontSize: 13, color: 'var(--text)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span>Aucun prof trouvé avec ces critères. Essayez d'élargir (autre ville, autre mode).</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Typing indicator ── */
function Typing() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>🤖</div>
      <div style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 5, alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <style>{`@keyframes db{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}} .db{width:7px;height:7px;border-radius:50%;background:#6c63ff;animation:db 1.2s infinite;}`}</style>
        <div className="db" style={{ animationDelay: '0s' }} />
        <div className="db" style={{ animationDelay: '.15s' }} />
        <div className="db" style={{ animationDelay: '.3s' }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   SUGGESTIONS
════════════════════════════════════════════════ */
const SUGGESTIONS = [
  "Je cherche un prof de maths pour préparer le bac",
  "Prof de physique en ligne, budget 40 DT/h",
  "Cours d'anglais pour collège à Tunis",
  "Professeur d'informatique / programmation",
  "Cours de français à domicile niveau lycée",
];

/* ════════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════════ */
export default function Chatbot() {
  const { user }   = useAuth();
  const [msgs, setMsgs]             = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [welcome, setWelcome]       = useState(true);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const taRef      = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const now = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const handleView = async (prof) => {
    try {
      const res = await api.get(`/api/chatbot/prof-detail/${prof.id}`);
      setSelectedProf(res.data);
    } catch { setSelectedProf(prof); }
  };

  const send = useCallback(async (text) => {
    const txt = (text || input).trim();
    if (!txt || loading) return;

    setInput('');
    setWelcome(false);
    if (taRef.current) taRef.current.style.height = 'auto';

    const userMsg = { role: 'user', content: txt, time: now() };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    const history = [...msgs, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await api.post('/api/chatbot/chat', { messages: history });
      const { reply, top3_profs, besoin_complet, prochain_critere } = res.data;
      const hasProfs = top3_profs && top3_profs.length > 0;

      setMsgs(prev => [...prev, {
        role:             'assistant',
        content:          reply,
        time:             now(),
        profs:            hasProfs ? top3_profs : [],
        noProfs:          besoin_complet && !hasProfs,
        besoin_complet:   besoin_complet,
        prochain_critere: prochain_critere,
      }]);
    } catch (e) {
      const s = e?.response?.status;
      const d = e?.response?.data?.detail;
      const m = s === 503 ? '⏳ Modèle en démarrage, réessayez dans 30s.'
              : s === 429 ? '⚠️ Trop de requêtes. Patientez quelques secondes.'
              : s === 504 ? '⏱️ Délai dépassé. Réessayez.'
              : d ? `❌ ${d}` : '❌ Erreur. Réessayez.';
      setMsgs(prev => [...prev, { role: 'assistant', content: m, time: now(), profs: [] }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, msgs, loading]);

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--bg)' }}>
      <style>{`
        .chat-scroll::-webkit-scrollbar{width:4px}
        .chat-scroll::-webkit-scrollbar-track{background:transparent}
        .chat-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
        .chat-scroll::-webkit-scrollbar-thumb:hover{background:var(--text2)}
      `}</style>

      {/* ════ ZONE CHAT ════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <div style={{ padding: '14px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 12px rgba(108,99,255,0.35)', flexShrink: 0 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', fontFamily: 'Syne,sans-serif' }}>EduBot — Assistant intelligent</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 4px #22c55e' }} />
                En ligne · Matching IA · EduMatch Tunisie
              </div>
            </div>
          </div>
          <button
            onClick={() => { setMsgs([]); setWelcome(true); setInput(''); }}
            style={{ padding: '7px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.color = '#6c63ff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
          >
            🔄 Nouveau
          </button>
        </div>

        {/* Messages */}
        <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 16px' }}>

          {/* Welcome */}
          {welcome && (
            <div style={{ textAlign: 'center', paddingBottom: 32 }}>
              {/* Hero */}
              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(108,99,255,0.35)' }}>🤖</div>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text)' }}>
                Bonjour {user?.prenom} ! 👋
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, maxWidth: 460, margin: '0 auto 28px' }}>
                Je suis <strong style={{ color: 'var(--text)' }}>EduBot</strong>, votre assistant de matching EduMatch.
                Décrivez votre besoin en quelques mots, et je vous trouve les meilleurs professeurs adaptés à votre profil.
              </p>

              {/* Suggestions */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>
                  Exemples de recherche
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {SUGGESTIONS.map(q => (
                    <button key={q} onClick={() => send(q)}
                      style={{ padding: '8px 15px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 20, cursor: 'pointer', fontSize: 13, color: 'var(--text)', fontWeight: 500, transition: 'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.color = '#6c63ff'; e.currentTarget.style.background = 'rgba(108,99,255,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, maxWidth: 520, margin: '0 auto' }}>
                {[
                  { icon: '🧠', t: 'IA intelligente',  d: 'Comprend le langage naturel' },
                  { icon: '🎯', t: 'Matching précis',  d: 'Score sur 6 critères' },
                  { icon: '📅', t: 'Réservation directe', d: 'En un clic depuis le chat' },
                ].map(f => (
                  <div key={f.t} style={{ padding: '14px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)', marginBottom: 3 }}>{f.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{f.d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {msgs.map((msg, i) => <Message key={i} msg={msg} onViewProf={handleView} />)}
          {loading && <Typing />}
          <div ref={bottomRef} />
        </div>

        {/* Input zone */}
        <div style={{ padding: '12px 24px 18px', background: 'var(--surface)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div
            style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '8px 10px 8px 16px', transition: 'border-color .2s, box-shadow .2s' }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <textarea
              ref={el => { inputRef.current = el; taRef.current = el; }}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ex: Je cherche un prof de maths pour le bac, en ligne, budget 35 DT/h..."
              rows={1}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, lineHeight: 1.55, resize: 'none', maxHeight: 120, fontFamily: 'inherit', paddingTop: 5, paddingBottom: 5, overflowY: 'auto' }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 40, height: 40, borderRadius: 11, border: 'none', flexShrink: 0,
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                background: !input.trim() || loading ? 'var(--border)' : 'linear-gradient(135deg,#6c63ff,#8b5cf6)',
                color: '#fff', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s',
                boxShadow: input.trim() && !loading ? '0 3px 10px rgba(108,99,255,0.3)' : 'none',
              }}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 5, textAlign: 'center' }}>
            Entrée pour envoyer · Shift+Entrée pour saut de ligne
          </div>
        </div>
      </div>

      {/* ════ PANNEAU LATÉRAL ════ */}
      <div style={{ width: 280, background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', fontFamily: 'Syne,sans-serif', marginBottom: 3 }}>💡 Conseils de recherche</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>Pour des résultats optimaux</div>
        </div>
        <div style={{ padding: '14px 16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '📚', tip: 'Matière (25pts)',   ex: '"maths", "physique", "anglais"',  color: '#6c63ff' },
            { icon: '🎓', tip: 'Niveau (40pts)',    ex: '"lycée", "bac", "collège"',        color: '#f59e0b' },
            { icon: '📍', tip: 'Ville (15pts)',     ex: '"à Tunis", "Sfax"',                color: '#ff6584' },
            { icon: '💰', tip: 'Budget (10pts)',    ex: '"max 40 DT/h", "pas cher"',        color: '#43e97b' },
            { icon: '📡', tip: 'Mode (5pts)',       ex: '"en ligne", "à domicile"',         color: '#38bdf8' },
          ].map(t => (
            <div key={t.tip} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, border: `1px solid ${t.color}30` }}>{t.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)', marginBottom: 2 }}>{t.tip}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', fontStyle: 'italic' }}>{t.ex}</div>
              </div>
            </div>
          ))}

          {/* Score legend */}
          <div style={{ marginTop: 4, padding: '12px 14px', background: 'rgba(108,99,255,0.06)', borderRadius: 12, border: '1px solid rgba(108,99,255,0.15)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6c63ff', marginBottom: 8, fontFamily: 'Syne,sans-serif' }}>📊 Score de matching</div>
            {[
              ['#22c55e', '80-100', 'Excellent'],
              ['#6c63ff', '65-79',  'Très bon'],
              ['#d97706', '50-64',  'Bon'],
              ['#dc2626', '< 50',   'Possible'],
            ].map(([color, range, label]) => (
              <div key={range} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: 12, color: 'var(--text2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontWeight: 700, minWidth: 42, color: 'var(--text)' }}>{range}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Info sur les profs dans le chat */}
          <div style={{ padding: '10px 12px', background: 'rgba(67,233,123,0.06)', borderRadius: 12, border: '1px solid rgba(67,233,123,0.2)' }}>
            <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.6 }}>
              <span style={{ fontWeight: 700, color: '#43e97b' }}>✅ Les résultats</span> apparaissent directement dans la conversation sous forme de cartes interactives.
            </div>
          </div>
        </div>
      </div>

      {selectedProf && <ProfModal prof={selectedProf} onClose={() => setSelectedProf(null)} />}
    </div>
  );
}