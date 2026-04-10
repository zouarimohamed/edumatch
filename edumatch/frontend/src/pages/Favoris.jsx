import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProfModal from './ProfModal';

/* ─── CSS injecté ──────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  .fav-root { font-family: 'Instrument Sans', sans-serif; background: #FDFEFF; min-height: 100vh; }

  @keyframes fadeUp2   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cardIn2   { from { opacity:0; transform:translateY(28px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes spin2fav  { to { transform:rotate(360deg); } }
  @keyframes heartPop  { 0%{transform:scale(1)} 40%{transform:scale(1.45)} 70%{transform:scale(.9)} 100%{transform:scale(1)} }

  .fav-card {
    background:#fff; border:1.5px solid #F1F5F9;
    border-radius:24px; overflow:visible; cursor:default;
    box-shadow:0 2px 14px rgba(0,0,0,0.04);
    transition:transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s, border-color .2s;
    display:flex; flex-direction:column;
  }
  .fav-card:hover {
    transform:translateY(-6px);
    box-shadow:0 22px 50px rgba(0,21,61,0.10);
    border-color:#C7D2FE;
  }
  .fav-card-inner { border-radius:24px; overflow:hidden; display:flex; flex-direction:column; flex:1; }

  .fav-remove-btn {
    width:34px; height:34px; border-radius:50%;
    background:#FEF2F2; border:1.5px solid #FCA5A5;
    cursor:pointer; display:flex; align-items:center;
    justify-content:center; font-size:.9rem;
    transition:all .22s cubic-bezier(.34,1.56,.64,1);
  }
  .fav-remove-btn:hover { transform:scale(1.18); background:#FEE2E2; }

  .see-prof-btn {
    width:100%; padding:10px; background:#00153D; border:none;
    border-radius:12px; cursor:pointer;
    font-family:'Cabinet Grotesk',sans-serif; font-weight:800;
    color:#fff; font-size:.82rem;
    box-shadow:0 4px 14px rgba(0,21,61,0.2);
    transition:all .18s; display:flex; align-items:center; justify-content:center; gap:6px;
  }
  .see-prof-btn:hover { background:#1E3A8A; transform:translateY(-1px); box-shadow:0 6px 20px rgba(0,21,61,0.28); }

  .discover-btn {
    padding:11px 24px; background:#00153D; border:none; border-radius:14px;
    cursor:pointer; font-family:'Cabinet Grotesk',sans-serif; font-weight:800;
    color:#fff; font-size:.88rem;
    box-shadow:0 4px 16px rgba(0,21,61,0.22);
    display:flex; align-items:center; gap:8px;
    transition:all .2s;
  }
  .discover-btn:hover { background:#1E3A8A; transform:translateY(-1px); }
`;

function injectCSS() {
  if (typeof document !== 'undefined' && !document.getElementById('fav-css')) {
    const s = document.createElement('style'); s.id = 'fav-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
}

/* ════════════════════════════════════════════════
   HOOK FAVORIS
════════════════════════════════════════════════ */
export function useFavoris() {
  const [favoris, setFavoris] = useState(() => {
    try { return JSON.parse(localStorage.getItem('edumatch_favoris') || '[]'); }
    catch { return []; }
  });

  const saveFavoris = useCallback((list) => {
    setFavoris(list);
    localStorage.setItem('edumatch_favoris', JSON.stringify(list));
  }, []);

  const toggleFavori = useCallback((prof) => {
    setFavoris(prev => {
      const exists = prev.some(f => f.id === prof.id);
      const next   = exists ? prev.filter(f => f.id !== prof.id) : [...prev, prof];
      localStorage.setItem('edumatch_favoris', JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavori = useCallback((profId) => favoris.some(f => f.id === profId), [favoris]);
  return { favoris, toggleFavori, isFavori, saveFavoris };
}

/* ════════════════════════════════════════════════
   BOUTON FAVORI
════════════════════════════════════════════════ */
export function FavoriButton({ prof, size = 32 }) {
  const { toggleFavori, isFavori } = useFavoris();
  const [anim, setAnim] = useState(false);
  const fav = isFavori(prof?.id);
  const handle = (e) => {
    e.stopPropagation();
    toggleFavori(prof);
    setAnim(true);
    setTimeout(() => setAnim(false), 500);
  };
  return (
    <button onClick={handle} title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      style={{ width: size, height: size, borderRadius: '50%', background: fav ? '#FEF2F2' : '#F8FAFC', border: `1.5px solid ${fav ? '#FCA5A5' : '#E2E8F0'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size > 28 ? '.9rem' : '.75rem', transition: 'all .2s', animation: anim ? 'heartPop .5s ease' : 'none' }}>
      {fav ? '❤️' : '🤍'}
    </button>
  );
}

/* ─── Helpers ─────────────────────────────── */
function Stars({ n }) {
  const v = parseFloat(n) || 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(v) ? '#F59E0B' : '#E2E8F0', fontSize: '.78rem' }}>★</span>)}
      <span style={{ fontSize: '.7rem', color: '#94A3B8', marginLeft: 3, fontWeight: 700 }}>{v.toFixed(1)}</span>
    </span>
  );
}

function ProfAvatar({ prof, nom, size = 68 }) {
  const initials = (nom || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [['#00153D','#1E3A8A'],['#065F46','#047857'],['#4C1D95','#6D28D9'],['#7C2D12','#B45309'],['#1E3A8A','#0F172A']];
  const [a, b] = palettes[(nom||'P').charCodeAt(0) % palettes.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 4px 14px rgba(0,0,0,0.12)', flexShrink: 0, background: `linear-gradient(135deg,${a},${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.3, fontWeight: 900, color: '#fff', fontFamily: 'Cabinet Grotesk, sans-serif' }}>
      {prof?.photo_url ? <img src={`http://localhost:8001${prof.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : initials}
    </div>
  );
}

const MODE_CFG = {
  en_ligne:   { icon: '🌐', label: 'En ligne',   color: '#1D4ED8', bg: '#EFF6FF',  border: '#BFDBFE' },
  presentiel: { icon: '🏫', label: 'Présentiel', color: '#065F46', bg: '#ECFDF5',  border: '#6EE7B7' },
  les_deux:   { icon: '🔀', label: 'Les deux',   color: '#4F46E5', bg: '#EEF2FF',  border: '#C7D2FE' },
};

function ModeBadge({ mode }) {
  const cfg = MODE_CFG[mode] || MODE_CFG.presentiel;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.65rem', fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

/* ════════════════════════════════════════════════
   PAGE MES FAVORIS
════════════════════════════════════════════════ */
export default function Favoris() {
  const navigate = useNavigate();
  const { favoris, toggleFavori, isFavori } = useFavoris();
  const [selectedProf, setSelectedProf] = useState(null);
  const [profsData, setProfsData]       = useState({});
  const [removing, setRemoving]         = useState(null);

  useEffect(() => { injectCSS(); }, []);

  useEffect(() => {
    if (favoris.length === 0) return;
    Promise.all(
      favoris.map(f => api.get(`/api/professeurs/${f.id || f.prof_id}`).catch(() => null))
    ).then(results => {
      const map = {};
      results.forEach((r, i) => { if (r?.data) map[favoris[i].id] = r.data; });
      setProfsData(map);
    });
  }, [favoris.length]);

  const getProf = (f) => profsData[f.id] || f;

  const handleRemove = (e, prof) => {
    e.stopPropagation();
    setRemoving(prof.id);
    setTimeout(() => { toggleFavori(prof); setRemoving(null); }, 300);
  };

  return (
    <div className="fav-root" style={{ padding: '36px 40px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, animation: 'fadeUp2 .45s ease both' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 4, height: 28, background: 'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius: 2 }}/>
            <span style={{ fontSize: '.68rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.14em', fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              ❤️ Mes favoris
            </span>
          </div>
          <h1 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '2.2rem', color: '#0F172A', margin: '0 0 6px', letterSpacing: '-.035em', lineHeight: 1 }}>
            Mes formateurs favoris
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '.88rem', fontWeight: 500, fontStyle: 'italic' }}>
            {favoris.length} formateur{favoris.length !== 1 ? 's' : ''} sauvegardé{favoris.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="discover-btn" onClick={() => navigate('/profs')}>
          ✨ Découvrir des formateurs
        </button>
      </div>

      {favoris.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '90px 20px', background: '#fff', borderRadius: 28, border: '1.5px solid #F1F5F9', boxShadow: '0 2px 16px rgba(0,0,0,0.03)', animation: 'fadeUp2 .4s ease both' }}>
          <div style={{ fontSize: '4rem', marginBottom: 18 }}>🤍</div>
          <h3 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.4rem', margin: '0 0 10px', color: '#0F172A', letterSpacing: '-.02em' }}>Aucun favori pour l'instant</h3>
          <p style={{ color: '#94A3B8', marginBottom: 28, fontStyle: 'italic', fontSize: '.9rem' }}>
            Cliquez sur le 🤍 d'un formateur pour le retrouver ici facilement.
          </p>
          <button className="discover-btn" onClick={() => navigate('/profs')} style={{ margin: '0 auto' }}>
            ✨ Parcourir les formateurs
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {favoris.map((f, idx) => {
            const p    = getProf(f);
            const nom  = `${p.user_prenom || ''} ${p.user_nom || ''}`.trim() || 'Formateur';
            const mats = p.tarifs_matieres ? [...new Set(p.tarifs_matieres.map(t => t.nom_matiere))].slice(0, 3) : [];
            const tarifMin = [p.tarif_en_ligne, p.tarif_presentiel].filter(v => v && parseFloat(v) > 0).map(Number);
            const minTarif = tarifMin.length ? Math.min(...tarifMin) : null;

            return (
              <div key={f.id} className="fav-card"
                style={{ animationDelay: `${idx * 65}ms`, animation: 'cardIn2 .48s cubic-bezier(.22,1,.36,1) both', opacity: removing === (p.id || f.id) ? 0 : 1, transform: removing === (p.id || f.id) ? 'scale(.9)' : undefined, transition: 'opacity .3s, transform .3s, box-shadow .28s, border-color .2s, translateY .28s' }}>
                <div className="fav-card-inner">

                  {/* Bandeau */}
                  <div style={{ height: 96, background: 'linear-gradient(135deg,#00153D 0%,#1E3A8A 55%,#0F172A 100%)', position: 'relative', overflow: 'hidden', borderRadius: '22px 22px 0 0', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: -24, right: -24, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
                    <div style={{ position: 'absolute', bottom: -30, right: 16, width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .07 }} viewBox="0 0 280 96" preserveAspectRatio="xMidYMid slice">
                      {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={(i%6)*52+10} cy={Math.floor(i/6)*34+14} r="1.5" fill="#fff"/>)}
                    </svg>

                    {/* Mode badge */}
                    {p.mode_enseignement && (
                      <div style={{ position: 'absolute', top: 11, right: 11 }}>
                        <ModeBadge mode={p.mode_enseignement}/>
                      </div>
                    )}

                    {/* Tarif min */}
                    {minTarif && (
                      <div style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '3px 10px', borderRadius: 20, fontSize: '.67rem', fontWeight: 800, color: '#fff', border: '1px solid rgba(255,255,255,0.22)', fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                        dès {minTarif} DT/h
                      </div>
                    )}
                  </div>

                  {/* Avatar chevauchant */}
                  <div style={{ position: 'relative', background: '#fff' }}>
                    <div style={{ position: 'absolute', top: -36, left: 18, zIndex: 10 }}>
                      <ProfAvatar prof={p} nom={nom} size={70}/>
                    </div>
                    {/* Bouton retirer favori — côté droit du chevauchement */}
                    <div style={{ position: 'absolute', top: -18, right: 16, zIndex: 10 }}>
                      <button className="fav-remove-btn" onClick={e => handleRemove(e, p.id ? p : f)} title="Retirer des favoris">❤️</button>
                    </div>

                    {/* Corps */}
                    <div style={{ padding: '40px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }} onClick={() => setSelectedProf(p)}>
                      <div>
                        <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.05rem', color: '#0F172A', marginBottom: 3, letterSpacing: '-.02em' }}>{nom}</div>
                        {p.ville && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.74rem', color: '#94A3B8', fontWeight: 600 }}>
                            📍 {p.ville}
                          </div>
                        )}
                      </div>

                      <Stars n={p.note_moyenne}/>

                      {mats.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {mats.map(m => (
                            <span key={m} style={{ fontSize: '.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#F0F4FF', color: '#1E40AF', border: '1.5px solid #C7D2FE' }}>{m}</span>
                          ))}
                        </div>
                      )}

                      {/* Tarifs */}
                      {(p.tarif_en_ligne || p.tarif_presentiel) && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          {p.tarif_en_ligne && parseFloat(p.tarif_en_ligne) > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.72rem', color: '#1D4ED8', fontWeight: 700, background: '#EFF6FF', padding: '3px 10px', borderRadius: 20, border: '1.5px solid #BFDBFE' }}>
                              🌐 {p.tarif_en_ligne} DT
                            </div>
                          )}
                          {p.tarif_presentiel && parseFloat(p.tarif_presentiel) > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.72rem', color: '#065F46', fontWeight: 700, background: '#ECFDF5', padding: '3px 10px', borderRadius: 20, border: '1.5px solid #6EE7B7' }}>
                              🏫 {p.tarif_presentiel} DT
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ height: 1, background: '#F1F5F9' }}/>

                      <button className="see-prof-btn" onClick={e => { e.stopPropagation(); setSelectedProf(p); }}>
                        Voir le profil ↗
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedProf && <ProfModal prof={selectedProf} onClose={() => setSelectedProf(null)}/>}
    </div>
  );
}