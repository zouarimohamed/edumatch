import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

@keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes scaleIn  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
@keyframes slideIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes spinD    { to{transform:rotate(360deg)} }
@keyframes modalIn  { from{opacity:0;transform:scale(.93) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes confirmIn{ from{opacity:0;transform:scale(.86) translateY(22px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.6} }

.dp-root { font-family:'Instrument Sans',sans-serif; background:#F7F9FC; min-height:100vh; }

.dp-kpi {
  background:#fff; border-radius:22px; padding:20px 24px;
  display:flex; align-items:center; gap:16px;
  border:1.5px solid #EEF2F8;
  box-shadow:0 2px 12px rgba(0,21,61,.04);
  transition:all .24s cubic-bezier(.22,1,.36,1);
}
.dp-kpi:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,21,61,.09); }

.dp-card {
  background:#fff; border-radius:18px; padding:18px 20px;
  border:1.5px solid #EEF2F8;
  box-shadow:0 1px 8px rgba(0,0,0,.03);
  transition:all .22s cubic-bezier(.22,1,.36,1);
  margin-bottom:10px; position:relative; overflow:hidden;
}
.dp-card:hover { border-color:#C7D2FE; box-shadow:0 6px 22px rgba(0,21,61,.08); transform:translateX(3px); }
.dp-card.past { opacity:.58; filter:grayscale(.4); }
.dp-card.past:hover { transform:none; border-color:#EEF2F8; box-shadow:0 1px 8px rgba(0,0,0,.03); }

.dp-new-btn {
  padding:11px 22px; background:linear-gradient(135deg,#00153D,#1E3A8A);
  color:#fff; border:none; border-radius:14px;
  font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:.88rem;
  box-shadow:0 4px 18px rgba(0,21,61,.28);
  display:flex; align-items:center; gap:8px; cursor:pointer; transition:all .2s;
}
.dp-new-btn:hover { transform:translateY(-1px); box-shadow:0 8px 26px rgba(0,21,61,.32); }

.dp-edit-btn {
  width:34px; height:34px; border-radius:10px;
  background:#EFF6FF; border:1.5px solid #BFDBFE;
  color:#1D4ED8; cursor:pointer; font-size:.88rem;
  display:flex; align-items:center; justify-content:center;
  transition:all .16s; flex-shrink:0;
}
.dp-edit-btn:hover { background:#DBEAFE; transform:scale(1.1); }

.dp-del-btn {
  width:34px; height:34px; border-radius:10px;
  background:#FEF2F2; border:1.5px solid #FCA5A5;
  color:#DC2626; cursor:pointer; font-size:.88rem;
  display:flex; align-items:center; justify-content:center;
  transition:all .16s; flex-shrink:0;
}
.dp-del-btn:hover { background:#FEE2E2; transform:scale(1.1); }

.dp-inp {
  background:#F8FAFC; border:1.5px solid #E2E8F0;
  border-radius:12px; color:#0F172A; padding:11px 14px;
  font-size:.88rem; outline:none; width:100%; box-sizing:border-box;
  font-family:'Instrument Sans',sans-serif; transition:border-color .15s;
}
.dp-inp:focus { border-color:#3B82F6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }

.dp-cap-btn {
  flex:1; padding:10px 0; border-radius:11px; cursor:pointer;
  font-weight:800; font-size:.86rem; transition:all .15s;
  border:1.5px solid #E2E8F0; background:#F8FAFC; color:#64748B;
  font-family:'Cabinet Grotesk',sans-serif;
}
.dp-cap-btn.on { border-color:#00153D; background:#EEF2FF; color:#1E40AF; }

.dp-submit {
  flex:2; padding:13px; border-radius:13px; border:none;
  font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:.9rem;
  cursor:pointer; color:#fff; transition:all .2s;
  background:linear-gradient(135deg,#00153D,#1E3A8A);
  box-shadow:0 4px 16px rgba(0,21,61,.22);
}
.dp-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,21,61,.3); }
.dp-submit:disabled { background:#E2E8F0; color:#94A3B8; cursor:not-allowed; box-shadow:none; }

.dp-cal-day {
  aspect-ratio:1; display:flex; align-items:center; justify-content:center;
  border-radius:10px; font-size:.77rem; border:1.5px solid transparent;
  transition:all .15s; position:relative; cursor:default;
  font-family:'Cabinet Grotesk',sans-serif; font-weight:700; user-select:none;
}
.dp-cal-day.clickable { cursor:pointer; }
.dp-cal-day.clickable:hover {
  transform:scale(1.18);
  z-index:10;
  box-shadow:0 4px 18px rgba(0,21,61,.22);
  filter:brightness(1.08);
  outline:2px solid rgba(99,102,241,.45);
  outline-offset:1px;
}
.dp-cal-day.past-day { opacity:.38; cursor:default !important; }
.dp-cal-day.past-day:hover { transform:none !important; }

.dp-nav-btn {
  width:36px; height:36px; border-radius:10px;
  background:#fff; border:1.5px solid #E2E8F0;
  color:#64748B; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:1.1rem; transition:all .15s;
}
.dp-nav-btn:hover { border-color:#C7D2FE; color:#1E40AF; background:#F0F4FF; }

.dp-pbar { height:5px; background:#EEF2F8; border-radius:3px; overflow:hidden; }
.dp-pfill { height:100%; border-radius:3px; transition:width .5s cubic-bezier(.22,1,.36,1); }
`;

function injectCSS() {
  if (typeof document !== 'undefined' && !document.getElementById('dp-css2')) {
    const s = document.createElement('style'); s.id='dp-css2'; s.textContent=CSS;
    document.head.appendChild(s);
  }
}

const EMPTY = { date_specifique:'', heure_debut:'09:00', heure_fin:'10:00', nb_max_etudiants:1, mode_seance:'presentiel', description:'', niveau_id:'' };

function dur(h1, h2) {
  if(!h1||!h2) return null;
  const [a,b]=[h1,h2].map(h=>{ const[x,y]=h.split(':').map(Number); return x*60+y; });
  const d=b-a; if(d<=0) return null;
  const hh=Math.floor(d/60),mm=d%60;
  return hh>0?`${hh}h${mm>0?String(mm).padStart(2,'0'):''}`:null;
}

function fmtDate(s, opts={weekday:'long',day:'numeric',month:'long',year:'numeric'}) {
  if(!s) return '';
  return new Date(s+'T00:00:00').toLocaleDateString('fr-FR', opts);
}

function isPast(dateStr, heureFinStr) {
  if(!dateStr) return false;
  const now = new Date();
  const [y,m,d] = dateStr.split('-').map(Number);
  const [hh,mm] = (heureFinStr||'23:59').slice(0,5).split(':').map(Number);
  return new Date(y, m-1, d, hh, mm) < now;
}

function isDatePast(dateStr) {
  if(!dateStr) return false;
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(dateStr+'T00:00:00'); d.setHours(0,0,0,0);
  return d < now;
}

function isToday(dateStr) {
  if(!dateStr) return false;
  const now = new Date();
  const d = new Date(dateStr+'T00:00:00');
  return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
}

function occ(d) {
  const nb=d.nb_inscrits||0, max=d.nb_max_etudiants||0;
  if(max===0) return { cls:'libre', col:'#10B981', bg:'#ECFDF5', border:'#6EE7B7', label:'Disponible', pct:0 };
  const pct=Math.round(nb/max*100);
  if(pct>=100) return { cls:'full', col:'#EF4444', bg:'#FEF2F2', border:'#FCA5A5', label:'Complet', pct:100 };
  if(pct>=70)  return { cls:'warn', col:'#F97316', bg:'#FFF7ED', border:'#FED7AA', label:'Presque plein', pct };
  return              { cls:'libre',col:'#10B981', bg:'#ECFDF5', border:'#6EE7B7', label:'Disponible', pct };
}

/* ─────────────────────────────────────────────────────────────
   CalTooltip
   Rendu dans Disponibilites (hors position:sticky) pour que
   position:fixed fonctionne correctement par rapport au viewport.
───────────────────────────────────────────────────────────── */
const CALT_W   = 272;
const CALT_GAP = 8;

function calcTTPos(rect, ttH) {
  const vp = { w: window.innerWidth, h: window.innerHeight };
  const cx = rect.left + rect.width / 2;
  let top;
  if (rect.top - CALT_GAP >= ttH) {
    top = rect.top - ttH - CALT_GAP;
  } else if (vp.h - rect.bottom - CALT_GAP >= ttH) {
    top = rect.bottom + CALT_GAP;
  } else {
    top = Math.max(8, Math.round((vp.h - ttH) / 2));
  }
  let left = Math.round(cx - CALT_W / 2);
  left = Math.max(8, Math.min(left, vp.w - CALT_W - 8));
  return { left, top };
}

function CalTooltip({ seances, niveaux, rect }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: -9999, top: -9999 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || !rect) return;
    const raf = requestAnimationFrame(() => {
      const h = ref.current ? ref.current.offsetHeight : 180;
      setPos(calcTTPos(rect, h || 180));
      setVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [rect, seances]);

  if (!seances?.length || !rect) return null;

  const sorted = [...seances].sort((a, b) => {
    const pa = isPast(a.date_specifique, a.heure_fin);
    const pb = isPast(b.date_specifique, b.heure_fin);
    if (pa !== pb) return pa ? 1 : -1;
    return (a.heure_debut||'').localeCompare(b.heure_debut||'');
  });

  return (
    <div ref={ref} style={{
      position: 'fixed',
      left: pos.left,
      top: pos.top,
      width: CALT_W,
      zIndex: 99999,
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: 'opacity .12s ease',
      background: '#0F172A',
      border: '1.5px solid #1E293B',
      borderRadius: 16,
      boxShadow: '0 20px 60px rgba(0,0,0,.55)',
      overflow: 'hidden',
      fontFamily: "'Instrument Sans', sans-serif",
    }}>
      {/* En-tête */}
      <div style={{ padding:'10px 14px', borderBottom:'1px solid #1E293B', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:900, fontSize:'.72rem', color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.08em' }}>
          {sorted.length} séance{sorted.length > 1 ? 's' : ''}
        </span>
        <span style={{ fontSize:'.68rem', color:'#64748B', fontWeight:700, background:'#1E293B', padding:'2px 9px', borderRadius:20 }}>
          {fmtDate(seances[0]?.date_specifique, { day:'numeric', month:'short' })}
        </span>
      </div>
      {/* Séances */}
      <div style={{ padding:'8px 10px', display:'flex', flexDirection:'column', gap:6, maxHeight:260, overflowY:'auto' }}>
        {sorted.map((d, i) => {
          const o    = occ(d);
          const past = isPast(d.date_specifique, d.heure_fin);
          const niv  = niveaux.find(n => n.id === d.niveau_id);
          return (
            <div key={i} style={{ padding:'9px 11px', borderRadius:11, background:'#1E293B', border:`1.5px solid ${past?'#2D3E55':o.col+'44'}`, opacity:past?.6:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:(niv||(!past&&d.nb_max_etudiants>0))?5:0 }}>
                <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, fontSize:'.8rem', color:past?'#64748B':'#E2E8F0' }}>
                  🕒 {d.heure_debut?.slice(0,5)} – {d.heure_fin?.slice(0,5)}
                </span>
                {past
                  ? <span style={{ fontSize:'.6rem', fontWeight:800, color:'#475569', background:'#2D3E55', padding:'1px 7px', borderRadius:20 }}>Passé</span>
                  : <span style={{ fontSize:'.6rem', fontWeight:800, padding:'1px 7px', borderRadius:20, background:`${o.col}22`, color:o.col }}>
                      {o.cls==='full'?'🔴':o.cls==='warn'?'🟠':'🟢'} {o.label}
                    </span>
                }
              </div>
              {niv && <div style={{ fontSize:'.68rem', color:'#64748B', marginBottom:(!past&&d.nb_max_etudiants>0)?5:0, fontWeight:600 }}>🎓 {niv.nom}</div>}
              {!past && d.nb_max_etudiants > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ flex:1, height:4, background:'#334155', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:2, width:`${Math.min(o.pct,100)}%`, background:o.col }}/>
                  </div>
                  <span style={{ fontSize:'.65rem', fontWeight:800, color:o.col, whiteSpace:'nowrap' }}>
                    {d.nb_inscrits}/{d.nb_max_etudiants}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Calendrier ─────────────────────────────────────────────
   Reçoit onTooltip en prop pour remonter l'état vers Disponibilites
───────────────────────────────────────────────────────────── */
function SmartCalendar({ dispos, niveaux, onTooltip }) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const initMonth = () => {
    if(!dispos?.length) return { y:today.getFullYear(), m:today.getMonth() };
    const futures = dispos
      .filter(d=>d.date_specifique && !isDatePast(d.date_specifique))
      .map(d=>new Date(d.date_specifique+'T00:00:00'))
      .sort((a,b)=>a-b);
    if(futures.length>0) return { y:futures[0].getFullYear(), m:futures[0].getMonth() };
    return { y:today.getFullYear(), m:today.getMonth() };
  };

  const init = initMonth();
  const [year,  setYear]  = useState(init.y);
  const [month, setMonth] = useState(init.m);

  useEffect(()=>{ const i=initMonth(); setYear(i.y); setMonth(i.m); },[dispos.length]);

  const firstDay    = new Date(year,month,1).getDay();
  const offset      = (firstDay+6)%7;
  const daysInMonth = new Date(year,month+1,0).getDate();
  const cells       = Array.from({length:42},(_,i)=>i-offset+1);

  const dayMap = {};
  dispos.forEach(d=>{
    if(!d.date_specifique) return;
    const dt = new Date(d.date_specifique+'T00:00:00');
    if(dt.getFullYear()!==year || dt.getMonth()!==month) return;
    const day = dt.getDate();
    if(!dayMap[day]) dayMap[day]=[];
    dayMap[day].push(d);
  });

  function dayStatus(list) {
    if(!list?.length) return null;
    const future = list.filter(d=>!isPast(d.date_specifique, d.heure_fin));
    if(!future.length) return 'past';
    if(future.every(d=>occ(d).cls==='full')) return 'full';
    if(future.some(d=>occ(d).cls==='full') || future.some(d=>occ(d).cls==='warn')) return 'warn';
    return 'libre';
  }

  const isTodayDay  = d => d===today.getDate() && month===today.getMonth() && year===today.getFullYear();
  const isPastMonth = () => { const m=new Date(year,month,1); m.setHours(0,0,0,0); const t=new Date(today.getFullYear(),today.getMonth(),1); return m<t; };

  function prev(){ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }
  function next(){ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }

  const STYLES = {
    libre:{ bg:'#ECFDF5', color:'#065F46', border:'1.5px solid #6EE7B7', shadow:'0 2px 8px rgba(16,185,129,.2)' },
    warn: { bg:'#FFF7ED', color:'#C2410C', border:'1.5px solid #FED7AA', shadow:'0 2px 8px rgba(249,115,22,.2)' },
    full: { bg:'#FEF2F2', color:'#991B1B', border:'1.5px solid #FCA5A5', shadow:'0 2px 8px rgba(239,68,68,.2)' },
    past: { bg:'#F1F5F9', color:'#94A3B8', border:'1.5px solid #E2E8F0', shadow:'none' },
  };

  const libreN = Object.values(dayMap).filter(l=>dayStatus(l)==='libre').length;
  const warnN  = Object.values(dayMap).filter(l=>dayStatus(l)==='warn').length;
  const fullN  = Object.values(dayMap).filter(l=>dayStatus(l)==='full').length;
  const pastN  = Object.values(dayMap).filter(l=>dayStatus(l)==='past').length;

  const handleEnter = useCallback((e, list) => {
    if (!list?.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onTooltip({ seances: list, rect });
  }, [onTooltip]);

  const handleLeave = useCallback(() => onTooltip(null), [onTooltip]);

  return (
    <div>
      {/* Nav */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <button className="dp-nav-btn" onClick={prev}>‹</button>
        <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:900, fontSize:'.96rem', color:'#0F172A' }}>
          {MONTHS[month]} {year}
          {isPastMonth() && <span style={{ marginLeft:6, fontSize:'.6rem', color:'#94A3B8', fontWeight:600, verticalAlign:'middle' }}>ARCHIVÉ</span>}
        </div>
        <button className="dp-nav-btn" onClick={next}>›</button>
      </div>

      {/* Légende */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 10px', fontSize:'.65rem', marginBottom:12, justifyContent:'center' }}>
        {[['#10B981','Disponible'],['#F97316','Presque plein'],['#EF4444','Complet'],['#94A3B8','Passé']].map(([c,l])=>(
          <span key={l} style={{ display:'flex', alignItems:'center', gap:4, fontWeight:700, color:c }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:c, display:'inline-block' }}/>{l}
          </span>
        ))}
      </div>

      {/* En-têtes jours */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:4 }}>
        {DAYS.map(d=>(
          <div key={d} style={{ textAlign:'center', fontSize:'.58rem', fontWeight:900, color:'#CBD5E1', textTransform:'uppercase', padding:'3px 0', letterSpacing:'.06em' }}>{d}</div>
        ))}
      </div>

      {/* Grille */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
        {cells.map((d,i)=>{
          const valid = d>=1 && d<=daysInMonth;
          if(!valid) return <div key={i} className="dp-cal-day" style={{ background:'transparent', border:'1.5px solid transparent', color:'transparent' }}/>;

          const list    = dayMap[d]||[];
          const st      = dayStatus(list);
          const tod     = isTodayDay(d);
          const sty     = st ? STYLES[st] : {};
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const dayPast = isDatePast(dateStr) && !tod;

          return (
            <div key={i}
              className={`dp-cal-day${list.length>0?' clickable':''}${dayPast&&!st?' past-day':''}`}
              style={{
                background: st ? sty.bg    : 'transparent',
                color:       st ? sty.color : tod ? '#00153D' : dayPast ? '#CBD5E1' : '#64748B',
                border:      st ? sty.border: tod ? '2px solid #00153D' : '1.5px solid transparent',
                fontWeight:  st ? 900 : tod ? 900 : dayPast ? 400 : 500,
                boxShadow:   st ? sty.shadow : 'none',
                opacity:     dayPast && !st ? .35 : 1,
              }}
              onMouseEnter={list.length>0 ? e=>handleEnter(e,list) : undefined}
              onMouseLeave={list.length>0 ? handleLeave : undefined}
            >
              {d}
              {list.length>1 && (
                <span style={{ position:'absolute', top:1, right:2, fontSize:'.48rem', fontWeight:900, color:'inherit', opacity:.75, lineHeight:1 }}>
                  {list.length}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bilan du mois */}
      <div style={{ marginTop:14, padding:'11px 13px', background:'linear-gradient(135deg,#F8FAFC,#F0F4FF)', borderRadius:13, border:'1.5px solid #EEF2F8' }}>
        {(libreN+warnN+fullN+pastN)>0 ? (
          <div style={{ fontSize:'.7rem', color:'#64748B', fontWeight:600, display:'flex', flexWrap:'wrap', gap:'3px 10px', lineHeight:1.8 }}>
            {libreN>0 && <span>🟢 <b style={{ color:'#065F46' }}>{libreN}</b> libre{libreN>1?'s':''}</span>}
            {warnN>0  && <span>🟠 <b style={{ color:'#C2410C' }}>{warnN}</b> presque plein{warnN>1?'s':''}</span>}
            {fullN>0  && <span>🔴 <b style={{ color:'#991B1B' }}>{fullN}</b> complet{fullN>1?'s':''}</span>}
            {pastN>0  && <span style={{ color:'#94A3B8' }}>⬜ <b>{pastN}</b> passé{pastN>1?'s':''}</span>}
          </div>
        ) : (
          <div style={{ fontSize:'.7rem', color:'#CBD5E1', textAlign:'center', fontStyle:'italic' }}>Aucune séance ce mois-ci</div>
        )}
      </div>
    </div>
  );
}

/* ─── Formulaire séance (ajout + édition) ─────────────────── */
function SeanceForm({ initial, profMode, niveaux, onSubmit, onClose, submitting, title, submitLabel }) {
  const [data, setData] = useState({...initial});
  const showMode = profMode==='les_deux';
  const set = (k,v) => setData(p=>({...p,[k]:v}));
  const durLabel = dur(data.heure_debut, data.heure_fin);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.68)', backdropFilter:'blur(10px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:26, border:'1.5px solid #F1F5F9', width:'100%', maxWidth:500, maxHeight:'92vh', overflowY:'auto', padding:32, boxShadow:'0 48px 120px rgba(0,0,0,.22)', animation:'modalIn .28s cubic-bezier(.34,1.56,.64,1)', fontFamily:'Instrument Sans,sans-serif' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, paddingBottom:16, borderBottom:'1.5px solid #F1F5F9' }}>
          <div>
            <h3 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", margin:0, fontSize:'1.15rem', fontWeight:900, color:'#0F172A' }}>{title}</h3>
            {data.date_specifique && <div style={{ fontSize:'.74rem', color:'#94A3B8', marginTop:3, fontWeight:500 }}>{fmtDate(data.date_specifique)}</div>}
          </div>
          <button onClick={onClose} style={{ width:34,height:34,borderRadius:9,background:'#F8FAFC',border:'1.5px solid #E2E8F0',cursor:'pointer',color:'#64748B',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',transition:'all .15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#FEE2E2';e.currentTarget.style.color='#DC2626';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#F8FAFC';e.currentTarget.style.color='#64748B';}}>✕</button>
        </div>

        <form onSubmit={e=>{e.preventDefault();onSubmit(data);}} style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Date */}
          <div>
            <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, fontFamily:"'Cabinet Grotesk',sans-serif" }}>📆 Date</div>
            <input type="date" className="dp-inp" required
              min={new Date().toISOString().split('T')[0]}
              value={data.date_specifique}
              onChange={e=>set('date_specifique',e.target.value)}/>
            {data.date_specifique && (
              <div style={{ marginTop:6, fontSize:'.8rem', color:'#1D4ED8', fontWeight:700, fontFamily:"'Cabinet Grotesk',sans-serif" }}>📍 {fmtDate(data.date_specifique)}</div>
            )}
          </div>

          {/* Horaires */}
          <div>
            <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, fontFamily:"'Cabinet Grotesk',sans-serif" }}>🕒 Horaires</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['Début','heure_debut'],['Fin','heure_fin']].map(([lbl,k])=>(
                <div key={k}>
                  <div style={{ fontSize:'.74rem', color:'#94A3B8', marginBottom:6, fontWeight:600 }}>{lbl}</div>
                  <input type="time" className="dp-inp" required value={data[k]} onChange={e=>set(k,e.target.value)}/>
                </div>
              ))}
            </div>
            <div style={{ marginTop:8 }}>
              {durLabel
                ? <span style={{ fontSize:'.8rem', background:'#EEF2FF', color:'#4F46E5', padding:'4px 14px', borderRadius:20, fontWeight:800, border:'1.5px solid #C7D2FE', fontFamily:"'Cabinet Grotesk',sans-serif" }}>⏱ {durLabel}</span>
                : data.heure_debut&&data.heure_fin
                  ? <span style={{ fontSize:'.8rem', color:'#DC2626', fontWeight:600 }}>⚠️ Heure de fin invalide</span>
                  : null}
            </div>
          </div>

          {/* Mode */}
          <div>
            <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10, fontFamily:"'Cabinet Grotesk',sans-serif" }}>📡 Mode</div>
            {showMode ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[{value:'en_ligne',icon:'🌐',label:'En ligne',color:'#1D4ED8',bg:'#EFF6FF',border:'#BFDBFE'},{value:'presentiel',icon:'🏫',label:'Présentiel',color:'#065F46',bg:'#ECFDF5',border:'#6EE7B7'}].map(m=>{
                  const active=data.mode_seance===m.value;
                  return (
                    <div key={m.value} onClick={()=>set('mode_seance',m.value)}
                      style={{ padding:16,borderRadius:14,cursor:'pointer',textAlign:'center',border:`1.5px solid ${active?m.border:'#E2E8F0'}`,background:active?m.bg:'#F8FAFC',transition:'all .18s',boxShadow:active?'0 4px 14px rgba(0,0,0,.07)':'none' }}>
                      <div style={{ fontSize:'1.4rem', marginBottom:5 }}>{m.icon}</div>
                      <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, fontSize:'.88rem', color:active?m.color:'#0F172A' }}>{m.label}</div>
                      {active && <div style={{ fontSize:'.66rem', color:m.color, marginTop:3, fontWeight:700 }}>✓ Sélectionné</div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding:'14px 18px', borderRadius:13, background:profMode==='en_ligne'?'#EFF6FF':'#ECFDF5', border:`1.5px solid ${profMode==='en_ligne'?'#BFDBFE':'#6EE7B7'}` }}>
                <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:800, color:profMode==='en_ligne'?'#1D4ED8':'#065F46' }}>
                  {profMode==='en_ligne'?'🌐 En ligne':'🏫 Présentiel'}
                </span>
              </div>
            )}
          </div>

          {/* Niveau */}
          {niveaux.length>0 && (
            <div>
              <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, fontFamily:"'Cabinet Grotesk',sans-serif" }}>🎓 Niveau</div>
              <select className="dp-inp" value={data.niveau_id} onChange={e=>set('niveau_id',e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {niveaux.map(n=><option key={n.id} value={String(n.id)}>{n.domaine} — {n.nom}</option>)}
              </select>
              {data.niveau_id && (
                <div style={{ marginTop:5, fontSize:'.74rem', color:'#065F46', fontWeight:700, background:'#ECFDF5', padding:'4px 11px', borderRadius:8, border:'1px solid #6EE7B7', display:'inline-flex', alignItems:'center', gap:5 }}>
                  ✓ Les étudiants de ce niveau verront cette séance en priorité
                </div>
              )}
            </div>
          )}

          {/* Capacité */}
          <div>
            <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10, fontFamily:"'Cabinet Grotesk',sans-serif" }}>👥 Capacité max</div>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              {[1,2,3,5,10].map(n=>(
                <button key={n} type="button" className={`dp-cap-btn${data.nb_max_etudiants===n?' on':''}`} onClick={()=>set('nb_max_etudiants',n)}>
                  {n===1?'👤 1':n}
                </button>
              ))}
            </div>
            <input type="number" min="1" max="50" className="dp-inp"
              placeholder="Ou saisir un nombre..."
              value={data.nb_max_etudiants}
              onChange={e=>set('nb_max_etudiants',parseInt(e.target.value)||1)}/>
            {data.nb_max_etudiants>1 && (
              <div style={{ marginTop:6, fontSize:'.76rem', color:'#B45309', fontWeight:600, background:'#FFFBEB', padding:'5px 11px', borderRadius:8, border:'1px solid #FDE68A' }}>
                ℹ️ Séance de groupe ({data.nb_max_etudiants} étudiants max)
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize:'.68rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, fontFamily:"'Cabinet Grotesk',sans-serif" }}>
              📝 Description <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0, fontSize:'.65rem', color:'#CBD5E1' }}>(optionnel)</span>
            </div>
            <textarea className="dp-inp" rows={3}
              placeholder="Ex: Révision fractions, préparation examen trimestriel..."
              value={data.description}
              onChange={e=>set('description',e.target.value)}
              style={{ resize:'vertical', minHeight:80, lineHeight:1.6 }}/>
            {data.description && <div style={{ marginTop:4, fontSize:'.7rem', color:'#94A3B8' }}>{data.description.length}/500</div>}
          </div>

          {/* Récap */}
          {data.date_specifique && durLabel && (
            <div style={{ background:'#F0F4FF', border:'1.5px solid #C7D2FE', borderRadius:14, padding:14 }}>
              <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:900, fontSize:'.68rem', color:'#1E40AF', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10 }}>📋 Récapitulatif</div>
              <div style={{ display:'flex', flexDirection:'column', gap:5, fontSize:'.84rem', color:'#374151' }}>
                {[
                  ['📆', fmtDate(data.date_specifique)],
                  ['🕒', `${data.heure_debut} → ${data.heure_fin} (${durLabel})`],
                  [data.mode_seance==='en_ligne'?'🌐':'🏫', data.mode_seance==='en_ligne'?'En ligne':'Présentiel'],
                  ['👥', `${data.nb_max_etudiants} étudiant${data.nb_max_etudiants>1?'s':''} max`],
                  ...(data.niveau_id && niveaux.find(n=>String(n.id)===String(data.niveau_id))?[['🎓', niveaux.find(n=>String(n.id)===String(data.niveau_id))?.nom]]:[] ),
                  ...(data.description?[['📝', data.description.slice(0,55)+(data.description.length>55?'…':'')]]:[] ),
                ].map(([ic,val])=>(
                  <div key={ic} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span>{ic}</span>
                    <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:700, fontSize:'.82rem' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display:'flex', gap:12 }}>
            <button type="submit" className="dp-submit" disabled={submitting||!durLabel}>
              {submitting
                ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    <span style={{ width:18,height:18,border:'2.5px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spinD .8s linear infinite',display:'inline-block' }}/> En cours...
                  </span>
                : submitLabel}
            </button>
            <button type="button" onClick={onClose}
              style={{ flex:1,padding:13,borderRadius:13,border:'1.5px solid #E2E8F0',background:'#F8FAFC',color:'#64748B',fontWeight:700,cursor:'pointer',fontFamily:'Instrument Sans,sans-serif',transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#F1F5F9';}} onMouseLeave={e=>{e.currentTarget.style.background='#F8FAFC';}}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Modal confirmation ──────────────────────────────────── */
function ConfirmModal({ config, onConfirm, onCancel }) {
  if(!config) return null;
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,.72)',backdropFilter:'blur(8px)',zIndex:3000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div style={{ background:'#fff',borderRadius:24,width:'100%',maxWidth:400,padding:28,boxShadow:'0 40px 100px rgba(0,0,0,.22)',animation:'confirmIn .28s cubic-bezier(.34,1.56,.64,1)',border:'1.5px solid #F1F5F9' }}>
        <div style={{ width:56,height:56,borderRadius:18,background:config.iconBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem',margin:'0 auto 16px' }}>{config.icon}</div>
        <div style={{ textAlign:'center',marginBottom:6 }}>
          <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:900,fontSize:'1.1rem',color:'#0F172A' }}>{config.title}</div>
        </div>
        <div style={{ textAlign:'center',marginBottom:24 }}>
          <div style={{ fontSize:'.84rem',color:'#64748B',lineHeight:1.6 }}>{config.subtitle}</div>
          {config.detail && (
            <div style={{ marginTop:10,padding:'10px 14px',background:config.detailBg,border:`1.5px solid ${config.detailBorder}`,borderRadius:12,fontSize:'.82rem',color:config.detailColor,fontWeight:600 }}>{config.detail}</div>
          )}
        </div>
        <div style={{ display:'flex',gap:10 }}>
          <button onClick={onCancel} style={{ flex:1,padding:'11px',borderRadius:12,border:'1.5px solid #E2E8F0',background:'#F8FAFC',color:'#64748B',fontWeight:700,cursor:'pointer',fontFamily:'Instrument Sans,sans-serif',fontSize:'.88rem',transition:'all .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#F1F5F9'} onMouseLeave={e=>e.currentTarget.style.background='#F8FAFC'}>Annuler</button>
          <button onClick={onConfirm} style={{ flex:1,padding:'11px',borderRadius:12,border:'none',background:config.confirmBg,color:'#fff',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:800,cursor:'pointer',fontSize:'.88rem',boxShadow:`0 4px 14px ${config.confirmShadow}`,transition:'all .15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>{config.confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════════════════════════ */
export default function Disponibilites() {
  const [dispos,    setDispos]    = useState([]);
  const [profile,   setProfile]   = useState(null);
  const [niveaux,   setNiveaux]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [editD,     setEditD]     = useState(null);
  const [adding,    setAdding]    = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [confirm,   setConfirm]   = useState(null);
  const [confirmCb, setConfirmCb] = useState(null);
  const [filter,    setFilter]    = useState('upcoming');
  const [calTT,     setCalTT]     = useState(null);

  useEffect(()=>{ injectCSS(); fetchAll(); },[]);

  const fetchAll = async () => {
    try {
      const [r1,r2,r3] = await Promise.all([
        api.get('/api/professeurs/me/disponibilites'),
        api.get('/api/professeurs/me'),
        api.get('/api/professeurs/me/niveaux').catch(()=>({data:[]})),
      ]);
      setDispos(r1.data??[]);
      setProfile(r2.data??null);
      setNiveaux(r3.data??[]);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDispos = async () => {
    try { const r=await api.get('/api/professeurs/me/disponibilites'); setDispos(r.data??[]); } catch{}
  };

  const handleAdd = async (data) => {
    setAdding(true);
    try {
      await api.post('/api/professeurs/me/disponibilites', { ...data, nb_max_etudiants:parseInt(data.nb_max_etudiants,10), niveau_id:data.niveau_id?parseInt(data.niveau_id):null });
      setShowAdd(false); await fetchDispos();
    } catch(e){ alert('Erreur : '+(e.response?.data?.detail||e.message)); }
    finally { setAdding(false); }
  };

  const handleEdit = async (data) => {
    setEditing(true);
    try {
      await api.put(`/api/professeurs/me/disponibilites/${editD.id}`, { ...data, nb_max_etudiants:parseInt(data.nb_max_etudiants,10), niveau_id:data.niveau_id?parseInt(data.niveau_id):null });
      setEditD(null); await fetchDispos();
    } catch(e){ alert('Erreur : '+(e.response?.data?.detail||e.message)); }
    finally { setEditing(false); }
  };

  const handleDelete = (d) => {
    const inscrits=d.nb_inscrits||0;
    setConfirm({
      icon:'🗑️', iconBg:'#FEF2F2',
      title:'Supprimer ce créneau ?',
      subtitle:'Cette action est irréversible.',
      detail: inscrits>0
        ? `⚠️ ${inscrits} étudiant${inscrits>1?'s':''} inscrit${inscrits>1?'s':''}. Les réservations seront annulées.`
        : `📅 ${fmtDate(d.date_specifique)} · ${d.heure_debut?.slice(0,5)} – ${d.heure_fin?.slice(0,5)}`,
      detailBg:inscrits>0?'#FFF7ED':'#F8FAFC', detailBorder:inscrits>0?'#FED7AA':'#E2E8F0', detailColor:inscrits>0?'#C2410C':'#64748B',
      confirmBg:'#DC2626', confirmShadow:'rgba(220,38,38,.3)', confirmLabel:'🗑 Supprimer',
    });
    setConfirmCb(()=>async()=>{
      try {
        await api.delete(`/api/professeurs/me/disponibilites/${d.id}`);
        setDispos(p=>p.filter(x=>x.id!==d.id));
      } catch(e){ alert('Erreur : '+(e.response?.data?.detail||e.message)); await fetchDispos(); }
    });
  };

  const profMode  = profile?.mode_enseignement;
  const emptyForm = { ...EMPTY, mode_seance: profMode==='les_deux'?'presentiel':(profMode||'presentiel') };

  const upcoming  = dispos.filter(d=>!isPast(d.date_specifique, d.heure_fin));
  const past      = dispos.filter(d=>isPast(d.date_specifique, d.heure_fin));
  const displayed = filter==='upcoming' ? upcoming : filter==='past' ? past : dispos;

  const grouped = displayed.reduce((acc,d)=>{
    const k=d.date_specifique||'Sans date';
    if(!acc[k]) acc[k]=[];
    acc[k].push(d);
    return acc;
  },{});

  const totalPlaces   = upcoming.reduce((s,d)=>s+(d.nb_max_etudiants||0),0);
  const totalInscrits = upcoming.reduce((s,d)=>s+(d.nb_inscrits||0),0);
  const nbFull        = upcoming.filter(d=>occ(d).cls==='full').length;

  const MODES = {
    en_ligne:  {icon:'🌐',label:'En ligne',  color:'#1D4ED8',bg:'#EFF6FF',border:'#BFDBFE'},
    presentiel:{icon:'🏫',label:'Présentiel',color:'#065F46',bg:'#ECFDF5',border:'#6EE7B7'},
    les_deux:  {icon:'🔀',label:'Les deux',  color:'#4F46E5',bg:'#EEF2FF',border:'#C7D2FE'},
  };

  if(loading) return (
    <div className="dp-root" style={{ padding:80, textAlign:'center' }}>
      <div style={{ width:40,height:40,border:'3px solid #E2E8F0',borderTopColor:'#00153D',borderRadius:'50%',animation:'spinD 1s linear infinite',margin:'0 auto 20px' }}/>
      <div style={{ color:'#94A3B8',fontWeight:600,fontSize:'.88rem' }}>Chargement...</div>
    </div>
  );

  return (
    <>
      <ConfirmModal config={confirm}
        onConfirm={async()=>{ setConfirm(null); if(confirmCb) await confirmCb(); setConfirmCb(null); }}
        onCancel={()=>{ setConfirm(null); setConfirmCb(null); }}/>

      {showAdd && (
        <SeanceForm initial={emptyForm} profMode={profMode} niveaux={niveaux}
          onSubmit={handleAdd} onClose={()=>setShowAdd(false)}
          submitting={adding} title="✨ Nouvelle séance" submitLabel="✅ Créer la séance"/>
      )}

      {editD && (
        <SeanceForm
          initial={{ date_specifique:editD.date_specifique||'', heure_debut:editD.heure_debut?.slice(0,5)||'09:00', heure_fin:editD.heure_fin?.slice(0,5)||'10:00', nb_max_etudiants:editD.nb_max_etudiants||1, mode_seance:editD.mode_seance||'presentiel', description:editD.description||'', niveau_id:editD.niveau_id?String(editD.niveau_id):'' }}
          profMode={profMode} niveaux={niveaux}
          onSubmit={handleEdit} onClose={()=>setEditD(null)}
          submitting={editing} title="✏️ Modifier la séance" submitLabel="💾 Enregistrer"/>
      )}

      <div className="dp-root" style={{ padding:'32px 36px', maxWidth:1180, margin:'0 auto' }}>

        {/* ── HEADER ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:26, animation:'fadeUp .5s ease both' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:4, height:28, background:'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius:2 }}/>
              <span style={{ fontSize:'.65rem', fontWeight:900, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.14em', fontFamily:"'Cabinet Grotesk',sans-serif" }}>Mes créneaux</span>
            </div>
            <h1 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:900, fontSize:'2.1rem', color:'#0F172A', margin:'0 0 6px', letterSpacing:'-.035em', lineHeight:1 }}>
              Mes Disponibilités
            </h1>
            <p style={{ color:'#94A3B8', margin:0, fontSize:'.85rem', fontWeight:500 }}>
              <span style={{ fontStyle:'italic' }}>{upcoming.length} à venir</span>
              {past.length>0 && <span style={{ color:'#CBD5E1', marginLeft:8 }}>· {past.length} passée{past.length>1?'s':''}</span>}
              {nbFull>0 && <span style={{ color:'#EF4444', fontWeight:700, marginLeft:8 }}>· {nbFull} complète{nbFull>1?'s':''}</span>}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {profMode && MODES[profMode] && (() => {
              const cfg=MODES[profMode];
              return <div style={{ padding:'8px 16px', borderRadius:20, background:cfg.bg, border:`1.5px solid ${cfg.border}`, fontSize:'.8rem', fontWeight:700, color:cfg.color, fontFamily:"'Cabinet Grotesk',sans-serif" }}>{cfg.icon} {cfg.label}</div>;
            })()}
            <button className="dp-new-btn" onClick={()=>setShowAdd(true)}>
              <span style={{ fontSize:'1.1rem' }}>+</span> Nouvelle séance
            </button>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:26 }}>
          {[
            { icon:'📅', val:upcoming.length, lbl:'Séances à venir',   numC:'#1E40AF', iconBg:'linear-gradient(135deg,#DBEAFE,#BFDBFE)', delay:0   },
            { icon:'👥', val:totalPlaces,      lbl:'Places disponibles', numC:'#065F46', iconBg:'linear-gradient(135deg,#DCFCE7,#A7F3D0)', delay:60  },
            { icon:'📊', val:totalInscrits,    lbl:'Inscrits total',     numC:'#92400E', iconBg:'linear-gradient(135deg,#FEF3C7,#FDE68A)', delay:120 },
          ].map(s=>(
            <div key={s.lbl} className="dp-kpi" style={{ animation:`scaleIn .45s cubic-bezier(.22,1,.36,1) ${s.delay}ms both` }}>
              <div style={{ width:50,height:50,borderRadius:16,background:s.iconBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0,boxShadow:'0 4px 12px rgba(0,0,0,.07)' }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:'2rem', fontWeight:900, color:s.numC, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:'.7rem', color:'#94A3B8', marginTop:4, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em' }}>{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── GRILLE ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1.45fr .55fr', gap:22 }}>

          {/* ── LISTE ── */}
          <div style={{ animation:'fadeUp .5s .1s ease both', background:'#fff', border:'1.5px solid #EEF2F8', borderRadius:24, padding:26, boxShadow:'0 2px 16px rgba(0,0,0,.04)' }}>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, paddingBottom:14, borderBottom:'1.5px solid #F1F5F9', gap:12, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:4, height:18, background:'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius:2 }}/>
                <h3 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", margin:0, fontSize:'1rem', fontWeight:900, color:'#0F172A' }}>📋 Séances planifiées</h3>
              </div>
              <div style={{ display:'flex', gap:4, background:'#F8FAFC', borderRadius:12, padding:4, border:'1.5px solid #EEF2F8' }}>
                {[
                  {k:'upcoming',l:`À venir (${upcoming.length})`},
                  {k:'past',    l:`Passées (${past.length})`},
                  {k:'all',     l:'Toutes'},
                ].map(f=>(
                  <button key={f.k} onClick={()=>setFilter(f.k)}
                    style={{ padding:'6px 12px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:700, fontSize:'.74rem', transition:'all .15s',
                      background:filter===f.k?'#fff':'transparent',
                      color:filter===f.k?'#1E40AF':'#64748B',
                      boxShadow:filter===f.k?'0 2px 8px rgba(0,0,0,.08)':'none',
                    }}>
                    {f.l}
                  </button>
                ))}
              </div>
            </div>

            {displayed.length===0 ? (
              <div style={{ textAlign:'center', padding:'50px 20px' }}>
                <div style={{ fontSize:'3rem', marginBottom:14 }}>{filter==='past'?'🗂️':'📭'}</div>
                <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:900, fontSize:'1.05rem', color:'#0F172A', marginBottom:7 }}>
                  {filter==='past'?'Aucune séance passée':'Aucune séance à venir'}
                </div>
                <div style={{ fontSize:'.82rem', color:'#94A3B8', fontStyle:'italic', marginBottom:filter==='past'?0:20 }}>
                  {filter==='past'?'Vos séances passées apparaîtront ici':'Ajoutez votre première disponibilité'}
                </div>
                {filter!=='past' && <button className="dp-new-btn" onClick={()=>setShowAdd(true)} style={{ margin:'0 auto' }}>+ Nouvelle séance</button>}
              </div>
            ) : (
              Object.entries(grouped)
                .sort(([a],[b]) => filter==='past' ? b.localeCompare(a) : a.localeCompare(b))
                .map(([dateKey,seances])=>(
                  <div key={dateKey} style={{ marginBottom:20 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                      <div style={{ width:3, height:14, background:isDatePast(dateKey)?'#CBD5E1':'#00153D', borderRadius:2 }}/>
                      <div style={{ fontSize:'.7rem', fontWeight:900, color:isDatePast(dateKey)?'#94A3B8':'#00153D', textTransform:'uppercase', letterSpacing:'.1em', fontFamily:"'Cabinet Grotesk',sans-serif" }}>
                        {dateKey!=='Sans date' ? fmtDate(dateKey) : 'Sans date'}
                      </div>
                      {isToday(dateKey) && (
                        <span style={{ fontSize:'.62rem', fontWeight:800, padding:'1px 8px', borderRadius:20, background:'#00153D', color:'#fff', fontFamily:"'Cabinet Grotesk',sans-serif" }}>Aujourd'hui</span>
                      )}
                      {isDatePast(dateKey) && !isToday(dateKey) && (
                        <span style={{ fontSize:'.62rem', fontWeight:600, color:'#94A3B8', fontStyle:'italic' }}>Passé</span>
                      )}
                    </div>

                    {seances.map((d,idx)=>{
                      const mi   = MODES[d.mode_seance||profMode]||MODES.presentiel;
                      const durL = dur(d.heure_debut?.slice(0,5), d.heure_fin?.slice(0,5));
                      const o    = occ(d);
                      const niv  = niveaux.find(n=>n.id===d.niveau_id);
                      const isPastSeance = isPast(d.date_specifique, d.heure_fin);

                      return (
                        <div key={d.id} className={`dp-card${isPastSeance?' past':''}`}
                          style={{ animationDelay:`${idx*40}ms`, animation:'slideIn .35s cubic-bezier(.22,1,.36,1) both' }}>
                          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, borderRadius:'4px 0 0 4px', background:isPastSeance?'#CBD5E1':o.col }}/>

                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', paddingLeft:8 }}>
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                                <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:900, color:isPastSeance?'#64748B':'#0F172A', fontSize:'1rem' }}>
                                  🕒 {d.heure_debut?.slice(0,5)} – {d.heure_fin?.slice(0,5)}
                                </span>
                                {durL && (
                                  <span style={{ fontSize:'.65rem', background:'#EEF2FF', color:'#4F46E5', padding:'2px 8px', borderRadius:20, fontWeight:800, border:'1.5px solid #C7D2FE', fontFamily:"'Cabinet Grotesk',sans-serif" }}>⏱ {durL}</span>
                                )}
                                {isPastSeance ? (
                                  <span style={{ marginLeft:'auto', fontSize:'.65rem', fontWeight:800, padding:'2px 9px', borderRadius:20, background:'#F1F5F9', color:'#94A3B8', border:'1.5px solid #E2E8F0' }}>✓ Terminée</span>
                                ) : (
                                  <span style={{ marginLeft:'auto', fontSize:'.65rem', fontWeight:800, padding:'2px 9px', borderRadius:20, background:o.bg, color:o.col, border:`1.5px solid ${o.border}`, fontFamily:"'Cabinet Grotesk',sans-serif" }}>
                                    {o.cls==='full'?'🔴':o.cls==='warn'?'🟠':'🟢'} {o.label}
                                  </span>
                                )}
                              </div>

                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:isPastSeance||!d.description?6:8, flexWrap:'wrap' }}>
                                <span style={{ fontSize:'.7rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:mi.bg, color:mi.color, border:`1.5px solid ${mi.border}` }}>
                                  {mi.icon} {mi.label}
                                </span>
                                {niv && (
                                  <span style={{ fontSize:'.7rem', fontWeight:700, padding:'3px 10px', borderRadius:20, background:'#F5F3FF', color:'#6D28D9', border:'1.5px solid #DDD6FE' }}>
                                    🎓 {niv.nom}
                                  </span>
                                )}
                              </div>

                              {d.description && !isPastSeance && (
                                <div style={{ display:'flex', alignItems:'flex-start', gap:7, marginBottom:8, padding:'8px 11px', background:'linear-gradient(135deg,#F0F4FF,#EEF2FF)', borderRadius:11, border:'1.5px solid #C7D2FE' }}>
                                  <span style={{ fontSize:'.82rem', flexShrink:0, marginTop:1 }}>📝</span>
                                  <div style={{ fontSize:'.76rem', color:'#1E40AF', lineHeight:1.55, fontStyle:'italic', fontWeight:500 }}>{d.description}</div>
                                </div>
                              )}

                              {!isPastSeance && (
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <span style={{ fontSize:'.73rem', color:'#64748B', fontWeight:700, whiteSpace:'nowrap' }}>👥 {d.nb_inscrits}/{d.nb_max_etudiants}</span>
                                  <div className="dp-pbar" style={{ flex:1 }}>
                                    <div className="dp-pfill" style={{ width:`${Math.min(o.pct,100)}%`, background:o.col }}/>
                                  </div>
                                  <span style={{ fontSize:'.68rem', color:o.col, fontWeight:800, whiteSpace:'nowrap', fontFamily:"'Cabinet Grotesk',sans-serif" }}>{o.pct}%</span>
                                </div>
                              )}

                              {isPastSeance && (
                                <div style={{ fontSize:'.72rem', color:'#94A3B8', fontWeight:600 }}>
                                  {d.nb_inscrits>0 ? `✓ ${d.nb_inscrits} étudiant${d.nb_inscrits>1?'s':''} avaient participé` : 'Aucun inscrit'}
                                </div>
                              )}
                            </div>

                            <div style={{ display:'flex', flexDirection:'column', gap:6, marginLeft:12, flexShrink:0 }}>
                              {!isPastSeance && <button className="dp-edit-btn" onClick={()=>setEditD(d)} title="Modifier">✏️</button>}
                              <button className="dp-del-btn" onClick={()=>handleDelete(d)} title="Supprimer">🗑</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
            )}
          </div>

          {/* ── CALENDRIER ── */}
          <div style={{ position:'sticky', top:80, alignSelf:'start', display:'flex', flexDirection:'column', gap:16, animation:'fadeUp .5s .2s ease both' }}>

            <div style={{ background:'#fff', border:'1.5px solid #EEF2F8', borderRadius:24, padding:22, boxShadow:'0 2px 16px rgba(0,0,0,.04)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18, paddingBottom:14, borderBottom:'1.5px solid #F1F5F9' }}>
                <div style={{ width:4, height:18, background:'linear-gradient(180deg,#F59E0B,#EF4444)', borderRadius:2 }}/>
                <h3 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", margin:0, fontSize:'1rem', fontWeight:900, color:'#0F172A' }}>📅 Calendrier</h3>
              </div>
              <SmartCalendar dispos={dispos} niveaux={niveaux} onTooltip={setCalTT}/>
            </div>

            {/* Widget occupation */}
            <div style={{ background:'#fff', border:'1.5px solid #EEF2F8', borderRadius:20, padding:18, boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
              <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:900, fontSize:'.68rem', color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Occupation (séances à venir)</div>
              {[
                { l:'Disponibles',    n:upcoming.filter(d=>occ(d).cls==='libre').length, c:'#10B981' },
                { l:'Presque pleins', n:upcoming.filter(d=>occ(d).cls==='warn').length,  c:'#F97316' },
                { l:'Complets',       n:upcoming.filter(d=>occ(d).cls==='full').length,  c:'#EF4444' },
              ].map(s=>(
                <div key={s.l} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:9 }}>
                  <div style={{ width:9,height:9,borderRadius:'50%',background:s.c,flexShrink:0,boxShadow:`0 0 5px ${s.c}55` }}/>
                  <div style={{ flex:1, fontSize:'.78rem', color:'#64748B', fontWeight:600 }}>{s.l}</div>
                  <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:900, fontSize:'.88rem', color:s.c }}>{s.n}</span>
                </div>
              ))}
              {totalPlaces>0 && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1.5px solid #F1F5F9' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', color:'#94A3B8', marginBottom:6, fontWeight:600 }}>
                    <span>Taux de remplissage</span>
                    <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:900, color:'#1E40AF' }}>{Math.round(totalInscrits/totalPlaces*100)}%</span>
                  </div>
                  <div className="dp-pbar" style={{ height:8 }}>
                    <div className="dp-pfill" style={{ width:`${Math.round(totalInscrits/totalPlaces*100)}%`, background:'linear-gradient(90deg,#10B981,#3B82F6)' }}/>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Tooltip calendrier — rendu hors position:sticky pour que fixed fonctionne */}
      {calTT && (
        <CalTooltip seances={calTT.seances} niveaux={niveaux} rect={calTT.rect}/>
      )}
    </>
  );
}