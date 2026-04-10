import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfCard from '../components/ProfCard';
import ProfModal from './ProfModal';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profs, setProfs] = useState([]);
  const [topMatches, setTopMatches] = useState([]);
  const [selectedProf, setSelectedProf] = useState(null);

  useEffect(() => {
    api.get('/api/professeurs/').then(r => setProfs(r.data)).catch(() => {});
    api.get('/api/matching/top?limit=3').then(r => setTopMatches(r.data)).catch(() => {});
  }, []);

  const stats = [
    { icon: '👨‍🏫', val: profs.length || '—', lbl: 'Profs disponibles', color: '#6c63ff', bg: 'rgba(108,99,255,.1)' },
    { icon: '🤖', val: 'IA', lbl: 'Matching intelligent', color: '#43e97b', bg: 'rgba(67,233,123,.1)' },
    { icon: '⭐', val: '4.8', lbl: 'Note moyenne', color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
    { icon: '🏙️', val: '10', lbl: 'Villes couvertes', color: '#38bdf8', bg: 'rgba(56,189,248,.1)' },
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6 }}>
          Bonjour, {user?.nom?.split(' ')[0]} 👋
        </div>
        <div style={{ color: 'var(--text2)', fontSize: '.9rem' }}>Prêt à apprendre aujourd'hui ? Votre assistant IA est là pour vous.</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.lbl} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'Syne', fontSize: '1.7rem', fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--text2)', marginTop: 2 }}>{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Chatbot */}
      <div style={{ background: 'linear-gradient(135deg,rgba(108,99,255,.15),rgba(255,101,132,.08))', border: '1px solid rgba(108,99,255,.3)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>🤖 Trouvez votre prof idéal avec l'IA</div>
          <div style={{ color: 'var(--text2)', fontSize: '.88rem', maxWidth: 400 }}>Notre chatbot analyse vos besoins et calcule un score de matching pour vous proposer les meilleurs professeurs.</div>
        </div>
        <button onClick={() => navigate('/chatbot')} style={{ background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Démarrer →
        </button>
      </div>

      {/* Recommended profs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontFamily: 'Syne', fontSize: '1.2rem', fontWeight: 700 }}>🌟 {topMatches.length > 0 ? 'Meilleurs matchs pour vous' : 'Professeurs recommandés'}</div>
        <button onClick={() => navigate('/profs')} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 14px', color: 'var(--text)', cursor: 'pointer', fontSize: '.8rem', fontWeight: 600 }}>Voir tous →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {(topMatches.length > 0 ? topMatches : profs.slice(0, 3)).map(p => (
          <ProfCard key={p.prof_id || p.id} prof={p} score={p.score} onView={setSelectedProf} />
        ))}
      </div>

      {selectedProf && <ProfModal prof={selectedProf} onClose={() => setSelectedProf(null)} />}
    </div>
  );
}
