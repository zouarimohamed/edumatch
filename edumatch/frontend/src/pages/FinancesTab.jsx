import React, { useEffect, useState } from 'react';
import api from '../services/api';

const CSS = `
  @keyframes ft-fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes ft-scaleIn  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
  @keyframes ft-spin     { to{transform:rotate(360deg)} }
  @keyframes ft-bar      { from{width:0} to{width:var(--w)} }
  @keyframes ft-count    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes ft-pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }

  .ft-card {
    background:#fff; border:1.5px solid #F1F5F9;
    border-radius:22px; padding:24px 26px;
    box-shadow:0 2px 14px rgba(0,0,0,.04);
    transition:box-shadow .2s, transform .2s;
  }
  .ft-card:hover { box-shadow:0 8px 30px rgba(0,0,0,.08); transform:translateY(-2px); }

  .ft-kpi {
    border-radius:20px; padding:20px 22px;
    display:flex; align-items:center; gap:16px;
    transition:all .22s; cursor:default;
    position:relative; overflow:hidden;
  }
  .ft-kpi:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.1); }
  .ft-kpi-shine {
    position:absolute; top:-40px; right:-40px;
    width:120px; height:120px; border-radius:50%;
    background:rgba(255,255,255,0.12);
  }

  .ft-bar-track {
    height:10px; background:#F1F5F9; border-radius:6px;
    overflow:hidden; margin:8px 0 4px;
  }
  .ft-bar-fill {
    height:100%; border-radius:6px;
    transition:width 1.2s cubic-bezier(.22,1,.36,1);
  }

  .ft-donut-container { position:relative; display:flex; align-items:center; justify-content:center; }
  .ft-donut-label {
    position:absolute; display:flex; flex-direction:column;
    align-items:center; justify-content:center; text-align:center;
  }

  .ft-alert-row {
    padding:12px 16px; border-radius:14px;
    background:#FFF7ED; border:1.5px solid #FED7AA;
    transition:all .15s;
  }
  .ft-alert-row:hover { background:#FEF3C7; transform:translateX(3px); }

  .ft-top-row {
    display:flex; align-items:center; gap:12px;
    padding:12px 14px; border-radius:14px;
    transition:all .15s; border:1.5px solid transparent;
  }
  .ft-top-row:hover { background:#F8FAFC; border-color:#E2E8F0; }
`;

function injectCSS() {
  if (!document.getElementById('ft-css')) {
    const s = document.createElement('style'); s.id='ft-css'; s.textContent=CSS;
    document.head.appendChild(s);
  }
}

/* ── Donut SVG ────────────────────────────── */
function DonutChart({ segments, size=160 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  const total = segments.reduce((a,b) => a+(b.val||0), 0);
  const r = 54, cx = size/2, cy = size/2;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  const paths = segments.map((seg, i) => {
    const pct = total > 0 ? seg.val / total : 0;
    const dasharray = animated ? `${pct * circumference} ${circumference}` : `0 ${circumference}`;
    const rotation = -90 + (cumulative / total) * 360;
    cumulative += seg.val;
    return { ...seg, dasharray, rotation, pct: Math.round(pct * 100) };
  });

  return (
    <div className="ft-donut-container" style={{ width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={14}/>
        {paths.map((p, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={p.color} strokeWidth={14}
            strokeDasharray={p.dasharray}
            strokeDashoffset={0}
            strokeLinecap="round"
            style={{
              transformOrigin:`${cx}px ${cy}px`,
              transform:`rotate(${p.rotation}deg)`,
              transition:`stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1) ${i*0.15}s`
            }}
          />
        ))}
      </svg>
      <div className="ft-donut-label">
        <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1.4rem', color:'#0F172A', lineHeight:1 }}>{total}</div>
        <div style={{ fontSize:'.68rem', color:'#94A3B8', fontWeight:600, marginTop:2 }}>total</div>
      </div>
    </div>
  );
}

/* ── Mini bar animée ───────────────────────── */
function AnimatedBar({ pct, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 400); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="ft-bar-track">
      <div className="ft-bar-fill" style={{ width:`${width}%`, background:color }}/>
    </div>
  );
}

/* ── KPI Card ──────────────────────────────── */
function KpiCard({ icon, label, val, color, bg, border, delay=0 }) {
  return (
    <div className="ft-kpi" style={{ background:bg, border:`1.5px solid ${border}`, animationDelay:`${delay}ms`, animation:'ft-scaleIn .45s cubic-bezier(.22,1,.36,1) both', opacity:0, animationFillMode:'forwards' }}>
      <div className="ft-kpi-shine"/>
      <div style={{ width:52, height:52, borderRadius:16, background:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>{icon}</div>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1.6rem', color, lineHeight:1, marginBottom:4, animation:'ft-count .5s ease both', animationDelay:`${delay+200}ms` }}>{val}</div>
        <div style={{ fontSize:'.68rem', color, opacity:.7, fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em' }}>{label}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function FinancesTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    injectCSS();
    api.get('/api/admin/finances/stats')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ padding:80, textAlign:'center' }}>
      <div style={{ width:40, height:40, border:'3px solid #E2E8F0', borderTopColor:'#3B82F6', borderRadius:'50%', animation:'ft-spin 1s linear infinite', margin:'0 auto 16px' }}/>
      <div style={{ color:'#94A3B8', fontSize:'.88rem', fontWeight:600 }}>Chargement des données financières...</div>
    </div>
  );

  if (error || !data) return (
    <div style={{ padding:60, textAlign:'center', color:'#94A3B8' }}>
      <div style={{ fontSize:'3rem', marginBottom:12 }}>⚠️</div>
      <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'1rem', color:'#0F172A' }}>Données indisponibles</div>
      <div style={{ fontSize:'.84rem', marginTop:6 }}>Vérifiez la connexion au serveur</div>
    </div>
  );

  const tauxColor  = data.taux_paiement>=70?'#065F46':data.taux_paiement>=40?'#B45309':'#991B1B';
  const tauxBg     = data.taux_paiement>=70?'#ECFDF5':data.taux_paiement>=40?'#FFFBEB':'#FEF2F2';
  const tauxBorder = data.taux_paiement>=70?'#6EE7B7':data.taux_paiement>=40?'#FCD34D':'#FCA5A5';

  // Revenus max pour barres
  const maxRevenu = Math.max(...(data.revenus_mois.map(m => m.total)), 1);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', gap:10, animation:'ft-fadeUp .4s ease both' }}>
        <div style={{ width:4, height:26, background:'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius:2 }}/>
        <div>
          <h2 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1.3rem', color:'#0F172A', margin:0, letterSpacing:'-.02em' }}>💳 Tableau de bord financier</h2>
          <div style={{ fontSize:'.78rem', color:'#94A3B8', marginTop:2 }}>Vue d'ensemble des paiements et revenus de la plateforme</div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        <KpiCard icon="💰" label="Chiffre d'affaires" val={`${data.chiffre_affaires.toFixed(2)} DT`} color="#065F46" bg="#ECFDF5" border="#6EE7B7" delay={0}/>
        <KpiCard icon="📊" label="Taux de paiement"   val={`${data.taux_paiement}%`}                 color={tauxColor} bg={tauxBg} border={tauxBorder} delay={60}/>
        <KpiCard icon="✅" label="Séances payées"     val={`${data.total_payees} / ${data.total_confirmees}`} color="#1E40AF" bg="#EFF6FF" border="#93C5FD" delay={120}/>
        <KpiCard icon="⚠️" label="En attente"         val={`${data.en_attente_count} séance${data.en_attente_count!==1?'s':''}`} color="#991B1B" bg="#FEF2F2" border="#FCA5A5" delay={180}/>
      </div>

      {/* ── Santé financière ── */}
      <div className="ft-card" style={{ animation:'ft-fadeUp .4s .1s ease both', opacity:0, animationFillMode:'forwards' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
          <div style={{ width:4, height:18, background:'linear-gradient(180deg,#00153D,#3B82F6)', borderRadius:2 }}/>
          <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1rem', color:'#0F172A', margin:0 }}>🏥 Santé financière</h3>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[
            { label:'Taux de paiement', val:data.taux_paiement, max:100, color:'#3B82F6', good:data.taux_paiement>=60, icon:'💳' },
            { label:'Séances payées',   val:data.total_confirmees>0?Math.round(data.total_payees/data.total_confirmees*100):0, max:100, color:'#10B981', good:data.total_payees>0, icon:'✅' },
            { label:'Alertes actives',  val:data.alertes.length>0?100:0, max:100, color:'#EF4444', good:data.alertes.length===0, icon:'🔴', isAlert:true },
          ].map((m,i) => (
            <div key={i} style={{ background:'#F8FAFC', borderRadius:16, padding:'16px 18px', border:'1.5px solid #F1F5F9' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ fontSize:'.8rem', fontWeight:700, color:'#0F172A' }}>{m.icon} {m.label}</div>
                <span style={{ fontSize:'.72rem', padding:'3px 10px', borderRadius:20, fontWeight:800, background:m.good?'#ECFDF5':'#FEF2F2', color:m.good?'#065F46':'#DC2626', border:`1px solid ${m.good?'#6EE7B7':'#FCA5A5'}` }}>
                  {m.good ? '✅ OK' : '⚠️ Attention'}
                </span>
              </div>
              <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1.6rem', color:m.color, marginBottom:6 }}>
                {m.isAlert ? (data.alertes.length > 0 ? `${data.alertes.length} alerte${data.alertes.length>1?'s':''}` : 'Aucune') : `${m.val}%`}
              </div>
              {!m.isAlert && <AnimatedBar pct={m.val} color={m.color}/>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Revenus + Top profs ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:18 }}>

        {/* Revenus par mois */}
        <div className="ft-card" style={{ animation:'ft-fadeUp .4s .15s ease both', opacity:0, animationFillMode:'forwards' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
            <div style={{ width:4, height:18, background:'linear-gradient(180deg,#3B82F6,#60A5FA)', borderRadius:2 }}/>
            <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1rem', color:'#0F172A', margin:0 }}>📅 Revenus par mois</h3>
          </div>
          {data.revenus_mois.length === 0 ? (
            <div style={{ padding:'36px', textAlign:'center', color:'#94A3B8' }}>
              <div style={{ fontSize:'2.4rem', marginBottom:10 }}>📭</div>
              <div style={{ fontSize:'.84rem', fontStyle:'italic' }}>Aucun revenu enregistré</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {data.revenus_mois.map((m, i) => (
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:'.8rem', fontWeight:700, color:'#374151' }}>{m.mois_label}</span>
                    <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'.88rem', color:'#065F46' }}>{m.total.toFixed(2)} DT</span>
                  </div>
                  <div style={{ height:12, background:'#F1F5F9', borderRadius:8, overflow:'hidden', position:'relative' }}>
                    <div style={{
                      height:'100%', borderRadius:8,
                      background:'linear-gradient(90deg,#00153D,#3B82F6)',
                      width:`${Math.max((m.total/maxRevenu)*100, 2)}%`,
                      transition:'width 1.2s cubic-bezier(.22,1,.36,1)',
                      display:'flex', alignItems:'center', paddingLeft:8
                    }}>
                      {m.total > 0 && <span style={{ fontSize:'.65rem', color:'rgba(255,255,255,0.9)', fontWeight:800, whiteSpace:'nowrap' }}>{m.total.toFixed(0)} DT</span>}
                    </div>
                  </div>
                </div>
              ))}
              {/* Total */}
              <div style={{ paddingTop:12, borderTop:'1.5px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'.78rem', fontWeight:700, color:'#64748B' }}>Total période</span>
                <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1.1rem', color:'#00153D' }}>
                  {data.revenus_mois.reduce((a,m)=>a+m.total,0).toFixed(2)} DT
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top formateurs */}
        <div className="ft-card" style={{ animation:'ft-fadeUp .4s .2s ease both', opacity:0, animationFillMode:'forwards' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
            <div style={{ width:4, height:18, background:'linear-gradient(180deg,#F59E0B,#EF4444)', borderRadius:2 }}/>
            <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1rem', color:'#0F172A', margin:0 }}>👨‍🏫 Top formateurs</h3>
          </div>
          {data.top_profs.length === 0 ? (
            <div style={{ padding:'36px', textAlign:'center', color:'#94A3B8' }}>
              <div style={{ fontSize:'2.4rem', marginBottom:10 }}>💼</div>
              <div style={{ fontSize:'.84rem', fontStyle:'italic' }}>Aucun paiement reçu</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {data.top_profs.map((p, i) => {
                const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
                const palettes = [['#00153D','#1E3A8A'],['#065F46','#047857'],['#4C1D95','#6D28D9'],['#7C2D12','#B45309']];
                const [a,b] = palettes[p.prof.charCodeAt(0)%palettes.length];
                const initials = p.prof.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
                return (
                  <div key={i} className="ft-top-row">
                    <span style={{ fontSize:'1.1rem', width:24, flexShrink:0 }}>{medals[i]}</span>
                    <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${a},${b})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:900, color:'#fff', flexShrink:0, fontFamily:'Cabinet Grotesk,sans-serif' }}>{initials}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.86rem', color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.prof}</div>
                      <div style={{ fontSize:'.7rem', color:'#94A3B8', marginTop:1 }}>{p.nb_seances} séance{p.nb_seances!==1?'s':''}</div>
                    </div>
                    <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'.92rem', color:'#065F46', flexShrink:0 }}>{p.total_revenus.toFixed(2)} DT</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Alertes ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:18, maxWidth:760 }}>

        {/* Alertes paiements en retard */}
        <div className="ft-card" style={{ animation:'ft-fadeUp .4s .3s ease both', opacity:0, animationFillMode:'forwards' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
            <div style={{ width:4, height:18, background:'linear-gradient(180deg,#EF4444,#F87171)', borderRadius:2 }}/>
            <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:900, fontSize:'1rem', color:'#0F172A', margin:0 }}>🔴 Alertes paiements en retard</h3>
            {data.alertes.length > 0 && (
              <span style={{ fontSize:'.65rem', fontWeight:900, padding:'2px 8px', borderRadius:20, background:'#FEF2F2', color:'#DC2626', border:'1.5px solid #FCA5A5', animation:'ft-pulse 2s infinite' }}>{data.alertes.length}</span>
            )}
          </div>
          {data.alertes.length === 0 ? (
            <div style={{ padding:'36px', textAlign:'center' }}>
              <div style={{ width:60, height:60, borderRadius:'50%', background:'#ECFDF5', border:'2px solid #6EE7B7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 14px' }}>✅</div>
              <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.96rem', color:'#065F46' }}>Aucun retard de paiement</div>
              <div style={{ fontSize:'.78rem', color:'#94A3B8', marginTop:6 }}>Tous les paiements sont à jour</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {data.alertes.map((a, i) => (
                <div key={i} className="ft-alert-row">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                    <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'.86rem', color:'#0F172A' }}>{a.etudiant}</span>
                    <span style={{ fontSize:'.7rem', fontWeight:800, padding:'3px 10px', borderRadius:20, background:'#FEF2F2', color:'#DC2626', border:'1px solid #FCA5A5' }}>
                      {a.jours_retard}j de retard
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:14, fontSize:'.72rem', color:'#92400E', fontWeight:600, flexWrap:'wrap' }}>
                    <span>👨‍🏫 {a.prof}</span>
                    <span>📅 {new Date(a.date_cours+'T00:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</span>
                    <span>💰 {a.tarif} DT</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}