import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import ProfModal from './ProfModal';
import { useFavoris } from './Favoris';

const VILLES = ['Tunis','Sfax','Sousse','Monastir','Nabeul','Bizerte','Kairouan','Ariana','Ben Arous','Mahdia'];

/* ─── CSS injecté ──────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  .profs-root { font-family: 'Instrument Sans', sans-serif; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideX   { from { opacity:0; transform:translateX(-14px); } to { opacity:1; transform:translateX(0); } }
  @keyframes spin2    { to { transform:rotate(360deg); } }
  @keyframes shimmer  { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes floatUp  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
  @keyframes cardEntrance { from { opacity:0; transform:translateY(32px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }

  .prof-card {
    background:#fff; border:1.5px solid #F1F5F9;
    border-radius:24px; overflow:visible; cursor:pointer;
    box-shadow:0 2px 14px rgba(0,0,0,0.05);
    transition:transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease, border-color .2s;
    display:flex; flex-direction:column; position:relative;
  }
  .prof-card:hover {
    transform:translateY(-7px) scale(1.012);
    box-shadow:0 28px 56px rgba(0,21,61,0.13);
    border-color:#C7D2FE;
  }

  .prof-row {
    display:flex; align-items:center; gap:16px;
    padding:16px 22px; background:#fff; border:1.5px solid #F1F5F9;
    border-radius:18px; box-shadow:0 1px 6px rgba(0,0,0,0.04);
    transition:all .2s ease; cursor:default; position:relative;
  }
  .prof-row:hover {
    transform:translateX(4px);
    box-shadow:0 8px 30px rgba(0,21,61,0.08);
    border-color:#C7D2FE;
  }

  .fav-btn {
    width:34px; height:34px; border-radius:50%;
    border:1.5px solid #E2E8F0; background:#F8FAFC;
    cursor:pointer; display:flex; align-items:center;
    justify-content:center; font-size:.9rem;
    transition:all .22s cubic-bezier(.34,1.56,.64,1);
    flex-shrink:0;
  }
  .fav-btn.active { background:#FEF2F2; border-color:#FCA5A5; }
  .fav-btn:hover  { transform:scale(1.18); }

  .vue-btn { padding:10px 14px; border:none; cursor:pointer; display:flex; align-items:center; transition:all .15s; }

  .search-inp {
    width:100%; padding:11px 14px 11px 42px;
    background:#fff; border:1.5px solid #E2E8F0; border-radius:14px;
    color:#0F172A; font-size:.85rem; outline:none;
    font-family:'Instrument Sans',sans-serif; font-weight:500;
    box-sizing:border-box; transition:border-color .15s, box-shadow .15s;
  }
  .search-inp:focus { border-color:#3B82F6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }

  .filter-sel {
    background:#fff; border:1.5px solid #E2E8F0; border-radius:12px;
    color:#0F172A; padding:10px 32px 10px 14px; font-size:.84rem;
    outline:none; cursor:pointer; font-family:'Instrument Sans',sans-serif;
    font-weight:600; appearance:none; -webkit-appearance:none;
    width:100%; transition:border-color .15s;
  }
  .filter-sel:focus { border-color:#3B82F6; }

  .sort-sel {
    background:#fff; border:1.5px solid #E2E8F0; border-radius:14px;
    color:#0F172A; padding:10px 34px 10px 14px; font-size:.84rem;
    outline:none; cursor:pointer; font-family:'Instrument Sans',sans-serif;
    font-weight:600; appearance:none; -webkit-appearance:none; min-width:180px;
    transition:border-color .15s;
  }
  .sort-sel:focus { border-color:#3B82F6; }

  .see-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 16px; border-radius:20px; background:#00153D;
    color:#fff; font-size:.74rem; font-weight:800;
    font-family:'Cabinet Grotesk',sans-serif; letter-spacing:-.01em;
    cursor:pointer; border:none;
    transition:background .18s, transform .15s, box-shadow .18s;
  }
  .see-btn:hover { background:#1E3A8A; transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,21,61,0.22); }

  .reset-btn {
    width:100%; padding:10px; background:#FEF2F2; color:#DC2626;
    border:1.5px solid #FCA5A5; border-radius:12px; cursor:pointer;
    font-weight:700; font-size:.82rem; font-family:'Cabinet Grotesk',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:6px;
    transition:background .15s;
  }
  .reset-btn:hover { background:#FEE2E2; }

  .filter-toggle {
    display:flex; align-items:center; gap:8px; padding:10px 18px;
    border-radius:14px; cursor:pointer; font-weight:700; font-size:.84rem;
    font-family:'Cabinet Grotesk',sans-serif; transition:all .15s;
  }
`;

function injectCSS() {
  if (typeof document !== 'undefined' && !document.getElementById('profs-css')) {
    const s = document.createElement('style'); s.id = 'profs-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
}

/* ─── Helpers ─────────────────────────────── */
function getTarifMin(prof) {
  const tarifs = [prof.tarif_en_ligne, prof.tarif_presentiel]
    .filter(v => v !== null && v !== undefined && v !== '' && parseFloat(v) > 0)
    .map(Number);
  return tarifs.length ? Math.min(...tarifs) : null;
}

function Stars({ n }) {
  const v = parseFloat(n) || 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(v) ? '#F59E0B' : '#E2E8F0', fontSize: '.78rem', lineHeight: 1 }}>★</span>
      ))}
      <span style={{ color: '#94A3B8', fontSize: '.72rem', marginLeft: 4, fontWeight: 700 }}>{v.toFixed(1)}</span>
    </span>
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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.67rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}`, flexShrink: 0 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

/* ─── Avatar ───────────────────────────────── */
function ProfAvatar({ prof, size = 72 }) {
  const nom = `${prof.user_prenom || ''} ${prof.user_nom || ''}`.trim() || 'P';
  const initials = nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const palettes = [
    ['#00153D','#1E3A8A'], ['#065F46','#047857'],
    ['#4C1D95','#6D28D9'], ['#7C2D12','#B45309'], ['#1E3A8A','#2563EB'],
  ];
  const [a, b] = palettes[nom.charCodeAt(0) % palettes.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden',
      border: '3px solid #fff', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      flexShrink: 0, background: `linear-gradient(135deg,${a},${b})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 900, color: '#fff',
      fontFamily: 'Cabinet Grotesk, sans-serif', letterSpacing: '-.01em',
    }}>
      {prof.photo_url
        ? <img src={`http://localhost:8001${prof.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        : initials}
    </div>
  );
}

/* ─── Bouton Favori ────────────────────────── */
function FavoriBtn({ prof, small = false }) {
  const { toggleFavori, isFavori } = useFavoris();
  const [anim, setAnim] = useState(false);
  const fav = isFavori(prof.id);

  const handle = (e) => {
    e.stopPropagation();
    toggleFavori(prof);
    setAnim(true);
    setTimeout(() => setAnim(false), 400);
  };

  return (
    <button
      onClick={handle}
      title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`fav-btn${fav ? ' active' : ''}`}
      style={{
        width: small ? 30 : 34, height: small ? 30 : 34,
        transform: anim ? 'scale(1.4)' : 'scale(1)',
      }}
    >
      {fav ? '❤️' : '🤍'}
    </button>
  );
}

/* ════════════════════════════════════════════════
   CARTE GRILLE
════════════════════════════════════════════════ */
function ProfCard({ prof, onView, index }) {
  const nom = `${prof.user_prenom || ''} ${prof.user_nom || ''}`.trim() || 'Professeur';
  const allMats = prof.tarifs_matieres ? [...new Set(prof.tarifs_matieres.map(t => t.nom_matiere))] : [];
  const matieres = allMats.slice(0, 3);
  const hasMore = allMats.length > 3;
  const tarifMin = getTarifMin(prof);

  return (
    <div
      className="prof-card"
      onClick={() => onView(prof)}
      style={{ animationDelay: `${index * 60}ms`, animation: 'cardEntrance .48s cubic-bezier(.22,1,.36,1) both' }}
    >
      {/* Bandeau — overflow:hidden sur CE div uniquement, pas sur la carte */}
      <div style={{ height: 100, background: 'linear-gradient(135deg,#00153D 0%,#1E3A8A 55%,#2563EB 100%)', position: 'relative', overflow: 'hidden', borderRadius: '22px 22px 0 0', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: -28, right: -28, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}/>
        <div style={{ position: 'absolute', bottom: -36, right: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .07 }} viewBox="0 0 300 100" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 21 }, (_, i) => <circle key={i} cx={(i % 7) * 52 + 10} cy={Math.floor(i / 7) * 38 + 16} r="1.5" fill="#fff"/>)}
        </svg>
        <div style={{ position: 'absolute', top: 11, left: 11, zIndex: 3 }}>
          <FavoriBtn prof={prof} small/>
        </div>
        <div style={{ position: 'absolute', top: 11, right: 11 }}>
          <ModeBadge mode={prof.mode_enseignement}/>
        </div>
        {tarifMin && (
          <div style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)', padding: '3px 11px', borderRadius: 20, fontSize: '.68rem', fontWeight: 800, color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            dès {tarifMin} DT/h
          </div>
        )}
      </div>

      {/* Zone avatar chevauchante — position relative, NO overflow hidden */}
      <div style={{ position: 'relative', background: '#fff' }}>
        <div style={{ position: 'absolute', top: -40, left: 18, zIndex: 10 }}>
          <ProfAvatar prof={prof} size={78}/>
        </div>

        {/* Corps de la carte */}
        <div style={{ padding: '44px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.05rem', color: '#0F172A', marginBottom: 4, letterSpacing: '-.02em' }}>{nom}</div>
            {prof.ville && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.74rem', color: '#94A3B8', fontWeight: 600 }}>
                <span style={{ fontSize: '.7rem' }}>📍</span> {prof.ville}
              </div>
            )}
          </div>

          <Stars n={prof.note_moyenne}/>

          {/* Niveaux enseignés */}
          {(() => {
            const niveaux = prof.tarifs_matieres ? [...new Set(prof.tarifs_matieres.map(t => t.nom_niveau).filter(Boolean))].slice(0,3) : [];
            return niveaux.length > 0 ? (
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {niveaux.map(n => (
                  <span key={n} style={{ fontSize:'.62rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#FFF7ED', color:'#C2410C', border:'1.5px solid #FED7AA' }}>🎓 {n}</span>
                ))}
              </div>
            ) : null;
          })()}

          {matieres.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {matieres.map(m => (
                <span key={m} style={{ fontSize: '.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#F0F4FF', color: '#1E40AF', border: '1.5px solid #C7D2FE' }}>{m}</span>
              ))}
              {hasMore && <span style={{ fontSize: '.65rem', color: '#94A3B8', padding: '3px 6px', fontWeight: 600 }}>+{allMats.length - 3}</span>}
            </div>
          )}

          <div style={{ flex: 1, minHeight: 8 }}/>
          <div style={{ height: 1, background: '#F1F5F9' }}/>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {prof.tarif_en_ligne && parseFloat(prof.tarif_en_ligne) > 0 && (
                <div style={{ fontSize: '.7rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                  🌐 {prof.tarif_en_ligne} DT
                </div>
              )}
              {prof.tarif_presentiel && parseFloat(prof.tarif_presentiel) > 0 && (
                <div style={{ fontSize: '.7rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                  🏫 {prof.tarif_presentiel} DT
                </div>
              )}
            </div>
            <button className="see-btn">
              Voir profil <span style={{ fontSize: '.85rem' }}>↗</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   CARTE VUE LISTE
════════════════════════════════════════════════ */
function ProfRow({ prof, onView, index }) {
  const nom = `${prof.user_prenom || ''} ${prof.user_nom || ''}`.trim() || 'Professeur';
  const matieres = prof.tarifs_matieres ? [...new Set(prof.tarifs_matieres.map(t => t.nom_matiere))].slice(0, 4) : [];
  const tarifMin = getTarifMin(prof);
  const { toggleFavori, isFavori } = useFavoris();
  const fav = isFavori(prof.id);

  return (
    <div
      className="prof-row"
      style={{ animationDelay: `${index * 40}ms`, animation: 'slideX .38s ease both' }}
    >
      <ProfAvatar prof={prof} size={52}/>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '.98rem', color: '#0F172A', letterSpacing: '-.01em' }}>{nom}</span>
          {prof.ville && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '.72rem', color: '#94A3B8', fontWeight: 600 }}>
              📍 {prof.ville}
            </span>
          )}
          <ModeBadge mode={prof.mode_enseignement}/>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 4 }}>
          {(() => {
            const niveaux = prof.tarifs_matieres ? [...new Set(prof.tarifs_matieres.map(t => t.nom_niveau).filter(Boolean))].slice(0,2) : [];
            return niveaux.map(n => (
              <span key={n} style={{ fontSize:'.62rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#FFF7ED', color:'#C2410C', border:'1.5px solid #FED7AA' }}>🎓 {n}</span>
            ));
          })()}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {matieres.map(m => (
            <span key={m} style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#F0F4FF', color: '#1E40AF', border: '1.5px solid #C7D2FE' }}>{m}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <Stars n={prof.note_moyenne}/>
        {tarifMin && (
          <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '.88rem', color: '#065F46', background: '#ECFDF5', padding: '5px 13px', borderRadius: 20, border: '1.5px solid #6EE7B7', whiteSpace: 'nowrap' }}>
            dès {tarifMin} DT/h
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); toggleFavori(prof); }}
          title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`fav-btn${fav ? ' active' : ''}`}
        >
          {fav ? '❤️' : '🤍'}
        </button>
        <button className="see-btn" onClick={() => onView(prof)}>
          Voir ↗
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════════ */
export default function Profs() {
  const [profs, setProfs]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedProf, setSelectedProf]     = useState(null);
  const [vue, setVue]                       = useState('grille');
  const [search, setSearch]                 = useState('');
  const [filterVille, setFilterVille]       = useState('');
  const [filterMode, setFilterMode]         = useState('');
  const [filterDomaine, setFilterDomaine]   = useState('');
  const [filterNiveau, setFilterNiveau]     = useState('');
  const [filterMatiere, setFilterMatiere]   = useState('');
  const [filterBudget, setFilterBudget]     = useState('');
  const [sortBy, setSortBy]                 = useState('note');
  const [showFilters, setShowFilters]       = useState(false);

  useEffect(() => { injectCSS(); }, []);

  const [referentiel, setReferentiel] = useState([]);

  useEffect(() => {
    api.get('/api/professeurs/')
      .then(r => setProfs(r.data || []))
      .catch(() => setProfs([]))
      .finally(() => setLoading(false));
    // Charger le référentiel pour les filtres domaine/niveau/matière
    api.get('/api/admin/referentiel/structure')
      .then(r => setReferentiel(r.data || []))
      .catch(() => {});
  }, []);

  // Filtres depuis le référentiel (tous les niveaux/matières, pas seulement ceux avec des profs)
  const allDomaines = useMemo(() => {
    if (referentiel.length > 0) return referentiel.map(d => d.nom);
    const set = new Set();
    profs.forEach(p => p.tarifs_matieres?.forEach(t => { if(t.nom_domaine && t.nom_domaine!=='N/A') set.add(t.nom_domaine); }));
    return [...set].sort();
  }, [referentiel, profs]);

  const allNiveaux = useMemo(() => {
    if (referentiel.length > 0) {
      const dom = referentiel.find(d => d.nom === filterDomaine);
      if (filterDomaine && dom) return (dom.niveaux || []).map(n => n.nom);
      return referentiel.flatMap(d => (d.niveaux || []).map(n => n.nom));
    }
    const set = new Set();
    profs.forEach(p => p.tarifs_matieres?.forEach(t => {
      if(t.nom_niveau && t.nom_niveau!=='N/A' && (!filterDomaine || t.nom_domaine === filterDomaine)) set.add(t.nom_niveau);
    }));
    return [...set].sort();
  }, [referentiel, profs, filterDomaine]);

  const allMatieres = useMemo(() => {
    if (referentiel.length > 0) {
      const domaines = filterDomaine ? referentiel.filter(d => d.nom === filterDomaine) : referentiel;
      const set = new Set();
      domaines.forEach(d => (d.niveaux || []).forEach(n => {
        if (!filterNiveau || n.nom === filterNiveau)
          (n.matieres || []).forEach(m => set.add(m.nom));
      }));
      return [...set].sort();
    }
    const set = new Set();
    profs.forEach(p => p.tarifs_matieres?.forEach(t => {
      if (!filterDomaine || t.nom_domaine === filterDomaine) set.add(t.nom_matiere);
    }));
    return [...set].sort();
  }, [referentiel, profs, filterDomaine, filterNiveau]);


  const filtered = useMemo(() => {
    let list = [...profs];
    const q = search.toLowerCase().trim();
    if (q) list = list.filter(p => {
      const nom = `${p.user_prenom || ''} ${p.user_nom || ''}`.toLowerCase();
      const mats = (p.tarifs_matieres || []).map(t => t.nom_matiere.toLowerCase()).join(' ');
      return nom.includes(q) || mats.includes(q) || (p.ville || '').toLowerCase().includes(q);
    });
    if (filterVille)   list = list.filter(p => p.ville === filterVille);
    if (filterMode)    list = list.filter(p => p.mode_enseignement === filterMode || p.mode_enseignement === 'les_deux');
    if (filterDomaine) list = list.filter(p => p.tarifs_matieres?.some(t => t.nom_domaine === filterDomaine));
    if (filterNiveau)  list = list.filter(p => p.tarifs_matieres?.some(t => t.nom_niveau === filterNiveau));
    if (filterMatiere) list = list.filter(p => p.tarifs_matieres?.some(t => t.nom_matiere === filterMatiere));
    if (filterBudget) {
      const max = parseInt(filterBudget);
      list = list.filter(p => { const min = getTarifMin(p); return min !== null && min <= max; });
    }
    if (sortBy === 'note')       list.sort((a, b) => (parseFloat(b.note_moyenne) || 0) - (parseFloat(a.note_moyenne) || 0));
    if (sortBy === 'tarif_asc')  list.sort((a, b) => (getTarifMin(a) || 999) - (getTarifMin(b) || 999));
    if (sortBy === 'tarif_desc') list.sort((a, b) => (getTarifMin(b) || 0) - (getTarifMin(a) || 0));
    return list;
  }, [profs, search, filterVille, filterMode, filterDomaine, filterNiveau, filterMatiere, filterBudget, sortBy]);

  const hasFilters = filterVille || filterMode || filterMatiere || filterBudget;
  const resetFilters = () => { setFilterVille(''); setFilterMode(''); setFilterMatiere(''); setFilterBudget(''); setSearch(''); };

  const nbFiltersActive = [filterVille, filterMode, filterMatiere, filterBudget].filter(Boolean).length;

  if (loading) return (
    <div className="profs-root" style={{ padding: 80, textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#00153D', borderRadius: '50%', animation: 'spin2 1s linear infinite', margin: '0 auto 20px' }}/>
      <div style={{ color: '#94A3B8', fontWeight: 600, fontSize: '.88rem' }}>Recherche des formateurs...</div>
    </div>
  );

  return (
    <div className="profs-root" style={{ padding: '36px 40px', maxWidth: 1320, margin: '0 auto', background: '#FDFEFF', minHeight: '100vh' }}>

      {/* ── HEADER ─────────────────────────────── */}
      <div style={{ marginBottom: 32, animation: 'fadeUp .45s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 4, height: 28, background: 'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius: 2 }}/>
          <span style={{ fontSize: '.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.14em', fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            ✦ Espace Étudiant
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '2.4rem', color: '#0F172A', margin: '0 0 7px', letterSpacing: '-.035em', lineHeight: 1 }}>
              Trouver un formateur
            </h1>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '.88rem', fontWeight: 500, fontStyle: 'italic' }}>
              {profs.length} formateur{profs.length !== 1 ? 's' : ''} disponible{profs.length !== 1 ? 's' : ''} · Cliquez sur 🤍 pour sauvegarder vos favoris
            </p>
          </div>
          {/* Pills stats */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { icon: '👨‍🏫', val: profs.length, lbl: 'Formateurs', bg: '#C7D2FE', col: '#1E40AF' },
              { icon: '📚', val: allMatieres.length, lbl: 'Matières', bg: '#A7F3D0', col: '#065F46' },
            ].map(s => (
              <div key={s.lbl} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', background: '#fff', border: '1.5px solid #F1F5F9', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem' }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.05rem', color: s.col, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 2 }}>{s.lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BARRE RECHERCHE + CONTRÔLES ────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center', animation: 'fadeUp .45s .06s ease both', opacity: 0, animationFillMode: 'forwards' }}>

        {/* Recherche */}
        <div style={{ position: 'relative', flex: 1, minWidth: 230 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: '.9rem', pointerEvents: 'none' }}>🔍</span>
          <input
            className="search-inp"
            placeholder="Nom, matière, ville..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '.85rem', padding: 4 }}>
              ✕
            </button>
          )}
        </div>

        {/* Tri */}
        <div style={{ position: 'relative' }}>
          <select className="sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="note">⭐ Mieux notés</option>
            <option value="tarif_asc">💰 Tarif croissant</option>
            <option value="tarif_desc">💰 Tarif décroissant</option>
          </select>
          <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', fontSize: '.7rem', color: '#64748B', pointerEvents: 'none' }}>▾</span>
        </div>

        {/* Filtres toggle */}
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          style={{ background: hasFilters ? '#EEF2FF' : '#fff', border: `1.5px solid ${hasFilters ? '#C7D2FE' : '#E2E8F0'}`, color: hasFilters ? '#4F46E5' : '#64748B' }}
        >
          🔧 Filtres
          {nbFiltersActive > 0 && (
            <span style={{ background: '#4F46E5', color: '#fff', fontSize: '.6rem', fontWeight: 900, padding: '2px 7px', borderRadius: 20, fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              {nbFiltersActive}
            </span>
          )}
        </button>

        {/* Vue grille / liste */}
        <div style={{ display: 'flex', background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
          {[['grille', '⊞'], ['liste', '≡']].map(([v, icon]) => (
            <button key={v} onClick={() => setVue(v)} className="vue-btn"
              style={{ background: vue === v ? '#00153D' : 'transparent', color: vue === v ? '#fff' : '#94A3B8', fontSize: '1.1rem' }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── FILTRES AVANCÉS ─────────────────────── */}
      {showFilters && (
        <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: '20px 24px', marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, animation: 'fadeUp .25s ease both', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {[
            { label: '📍 Ville',     value: filterVille,   onChange: setFilterVille,   opts: VILLES.map(v => ({ v, l: v })),                                                                          ph: 'Toutes les villes'   },
            { label: '📡 Mode',      value: filterMode,    onChange: setFilterMode,    opts: [{ v: 'en_ligne', l: '🌐 En ligne' }, { v: 'presentiel', l: '🏫 Présentiel' }],                                      ph: 'Tous les modes'      },
            { label: '🗂 Domaine',   value: filterDomaine, onChange: (v) => { setFilterDomaine(v); setFilterNiveau(''); setFilterMatiere(''); }, opts: allDomaines.map(d => ({ v: d, l: d })),                      ph: 'Tous les domaines'   },
            { label: '🎓 Niveau',    value: filterNiveau,  onChange: setFilterNiveau,  opts: allNiveaux.map(n => ({ v: n, l: n })),                                                                                ph: 'Tous les niveaux'    },
            { label: '📚 Matière',   value: filterMatiere, onChange: setFilterMatiere, opts: allMatieres.map(m => ({ v: m, l: m })),                                                                               ph: 'Toutes les matières' },
            { label: '💰 Budget max',value: filterBudget,  onChange: setFilterBudget,  opts: [20,30,40,50,75,100].map(b => ({ v: b, l: `≤ ${b} DT/h` })),                                                        ph: 'Sans limite'         },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: '.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 7, fontFamily: 'Cabinet Grotesk, sans-serif' }}>{f.label}</div>
              <div style={{ position: 'relative' }}>
                <select className="filter-sel" value={f.value} onChange={e => f.onChange(e.target.value)}>
                  <option value="">{f.ph}</option>
                  {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '.7rem', color: '#64748B', pointerEvents: 'none' }}>▾</span>
              </div>
            </div>
          ))}
          {hasFilters && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="reset-btn" onClick={resetFilters}>✕ Réinitialiser</button>
            </div>
          )}
        </div>
      )}

      {/* ── COMPTEUR ────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div style={{ width: 4, height: 14, background: '#00153D', borderRadius: 2 }}/>
        <span style={{ fontSize: '.82rem', color: '#94A3B8', fontWeight: 600 }}>
          <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, color: '#0F172A', fontSize: '.9rem' }}>{filtered.length}</span>
          {' '}résultat{filtered.length !== 1 ? 's' : ''}
          {(search || hasFilters) && ' pour votre recherche'}
        </span>
        {(search || hasFilters) && (
          <button onClick={resetFilters}
            style={{ marginLeft: 6, fontSize: '.75rem', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            ✕ Effacer
          </button>
        )}
      </div>

      {/* ── RÉSULTATS ───────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 28, border: '1.5px solid #F1F5F9', boxShadow: '0 2px 16px rgba(0,0,0,0.03)', animation: 'fadeIn .3s ease' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '1.3rem', color: '#0F172A', margin: '0 0 8px', letterSpacing: '-.02em' }}>Aucun formateur trouvé</h3>
          <p style={{ color: '#94A3B8', margin: '0 0 24px', fontStyle: 'italic', fontSize: '.88rem' }}>Essayez de modifier vos critères de recherche.</p>
          <button onClick={resetFilters}
            style={{ padding: '12px 28px', background: '#00153D', border: 'none', borderRadius: 14, fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, cursor: 'pointer', color: '#fff', boxShadow: '0 4px 16px rgba(0,21,61,0.22)', fontSize: '.88rem', transition: 'all .18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1E3A8A'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#00153D'; e.currentTarget.style.transform = 'none'; }}>
            Voir tous les formateurs
          </button>
        </div>
      ) : vue === 'grille' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map((p, i) => <ProfCard key={p.id} prof={p} onView={setSelectedProf} index={i}/>)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((p, i) => <ProfRow key={p.id} prof={p} onView={setSelectedProf} index={i}/>)}
        </div>
      )}

      {selectedProf && <ProfModal prof={selectedProf} onClose={() => setSelectedProf(null)}/>}
    </div>
  );
}