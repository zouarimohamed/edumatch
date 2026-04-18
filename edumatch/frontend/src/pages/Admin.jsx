import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import api from '../services/api';
import FinancesTab from './FinancesTab';
import { exportAdminProfs, exportAdminAnalytiques } from '../services/exportPDF';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
.adm { font-family:'Instrument Sans',system-ui,sans-serif; color:#0F172A; background:#f8fafc; min-height:100vh; }
@keyframes adm-fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes adm-scaleIn  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
@keyframes adm-slideR   { from{transform:translateX(100%)} to{transform:translateX(0)} }
@keyframes adm-modalIn  { from{opacity:0;transform:scale(.95)translateY(8px)} to{opacity:1;transform:none} }
@keyframes adm-spin     { to{transform:rotate(360deg)} }
.adm-fadeUp  { animation:adm-fadeUp  .4s ease both }
.adm-scaleIn { animation:adm-scaleIn .35s cubic-bezier(.22,1,.36,1) both }
.adm-card { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; box-shadow:0 2px 12px rgba(0,0,0,.04); transition:box-shadow .2s,border-color .2s; }
.adm-card:hover { border-color:#e2e8f0; box-shadow:0 4px 20px rgba(0,0,0,.07); }
.adm-stat { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; padding:22px; transition:all .22s cubic-bezier(.22,1,.36,1); position:relative; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.adm-stat:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.08); border-color:#e2e8f0; }
.adm-stat-accent { position:absolute;top:0;left:0;right:0;height:3px;border-radius:20px 20px 0 0; }
.adm-tab-bar { display:flex; background:#fff; border:1.5px solid #f1f5f9; border-radius:16px; padding:5px; gap:3px; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.adm-tab { flex:1; padding:10px 14px; border:none; border-radius:12px; font-family:'Instrument Sans',sans-serif; font-size:13px; font-weight:500; cursor:pointer; transition:all .18s; background:transparent; color:#64748b; white-space:nowrap; position:relative; }
.adm-tab.active { background:#3b82f6; color:#fff; font-weight:700; box-shadow:0 2px 12px rgba(59,130,246,.3); }
.adm-tab:not(.active):hover { background:#f8fafc; color:#0F172A; }
.adm-tab-badge { display:inline-flex; align-items:center; justify-content:center; background:#ef4444; color:#fff; font-size:10px; font-weight:800; padding:1px 5px; border-radius:8px; margin-left:5px; min-width:16px; }
.adm-table { width:100%; border-collapse:collapse; font-size:13px; }
.adm-table th { padding:11px 16px; text-align:left; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#94a3b8; border-bottom:1.5px solid #f1f5f9; background:#fafbfc; }
.adm-table td { padding:14px 16px; border-bottom:1px solid #f8fafc; vertical-align:middle; }
.adm-table tr:last-child td { border-bottom:none; }
.adm-table tbody tr { transition:background .12s; }
.adm-table tbody tr:hover { background:#f8fafc; }
.adm-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; font-family:'Instrument Sans',sans-serif; border:1.5px solid; }
.adm-btn-primary { background:#3b82f6; color:#fff; border-color:#3b82f6; }
.adm-btn-primary:hover { background:#2563eb; border-color:#2563eb; box-shadow:0 4px 14px rgba(59,130,246,.3); }
.adm-btn-success { background:#ecfdf5; color:#065f46; border-color:#6ee7b7; }
.adm-btn-success:hover { background:#d1fae5; }
.adm-btn-danger { background:#fef2f2; color:#991b1b; border-color:#fca5a5; }
.adm-btn-danger:hover { background:#fee2e2; }
.adm-btn-ghost { background:transparent; color:#64748b; border-color:#e2e8f0; }
.adm-btn-ghost:hover { background:#f8fafc; color:#0F172A; border-color:#cbd5e1; }
.adm-btn-sm { padding:6px 12px; font-size:12px; border-radius:8px; }
.adm-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; border:1px solid; }
.adm-badge-green  { background:#ecfdf5; color:#065f46; border-color:#6ee7b7; }
.adm-badge-amber  { background:#fffbeb; color:#b45309; border-color:#fcd34d; }
.adm-badge-red    { background:#fef2f2; color:#991b1b; border-color:#fca5a5; }
.adm-badge-blue   { background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; }
.adm-badge-purple { background:#f5f3ff; color:#6d28d9; border-color:#ddd6fe; }
.adm-badge-navy   { background:rgba(59,130,246,.08); color:#1d4ed8; border-color:rgba(59,130,246,.2); }
.adm-input { background:#fff; border:1.5px solid #e2e8f0; border-radius:10px; color:#0F172A; padding:9px 14px; font-size:13px; outline:none; font-family:'Instrument Sans',sans-serif; transition:border-color .15s,box-shadow .15s; width:100%; box-sizing:border-box; }
.adm-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }
.adm-search-wrap { position:relative; }
.adm-search-icon { position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:12px;pointer-events:none; }
.adm-search-wrap .adm-input { padding-left:34px; }
.adm-bar-track { height:5px; background:#f1f5f9; border-radius:3px; overflow:hidden; }
.adm-bar-fill  { height:100%; border-radius:3px; transition:width .9s cubic-bezier(.22,1,.36,1); }
.adm-prof-card { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; overflow:visible; cursor:pointer; transition:all .22s cubic-bezier(.22,1,.36,1); position:relative; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.adm-prof-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,.1); border-color:rgba(59,130,246,.3); }
.adm-drawer-overlay { position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(5px);z-index:900; }
.adm-drawer { position:fixed;top:0;right:0;bottom:0;width:540px; background:#fff; border-left:1.5px solid #f1f5f9; z-index:901; overflow-y:auto; animation:adm-slideR .28s cubic-bezier(.22,1,.36,1); box-shadow:-24px 0 60px rgba(0,0,0,.08); }
.adm-drawer::-webkit-scrollbar { width:4px; }
.adm-drawer::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:2px; }
.adm-modal-overlay { position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(6px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px; }
.adm-modal { background:#fff;border-radius:24px;border:1.5px solid #f1f5f9;width:100%;max-width:440px;padding:28px;box-shadow:0 40px 100px rgba(0,0,0,.12);animation:adm-modalIn .25s ease; }
.adm-alert { display:flex;align-items:center;gap:14px; padding:14px 20px; border-radius:14px; cursor:pointer; transition:all .18s; border:1.5px solid; }
.adm-alert:hover { transform:translateX(3px); }
.adm-alert-amber { background:#fffbeb; border-color:#fcd34d; }
.adm-alert-red   { background:#fff1f2; border-color:#fca5a5; }
.adm-chart-card { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; padding:22px; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.adm-chip { display:inline-flex;align-items:center;gap:7px; padding:5px 11px; border-radius:20px; font-size:12px; font-weight:600; background:#fff; border:1.5px solid #e2e8f0; transition:all .15s; cursor:default; }
.adm-chip:hover { border-color:#3b82f6; background:#eff6ff; color:#1d4ed8; }
.adm-empty { padding:48px 20px; text-align:center; color:#94a3b8; }
.adm-loader { border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:adm-spin 1s linear infinite; }
.adm-pending-row { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:12px; border:1.5px solid #fcd34d; background:#fffbeb; transition:all .15s; }
.adm-pending-row:hover { background:#fef3c7; transform:translateX(2px); }
.adm-top-row { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; cursor:pointer; transition:background .15s; border:1.5px solid transparent; }
.adm-top-row:hover { background:#f8fafc; border-color:#e2e8f0; }
.adm-section-title { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
.adm-section-title-bar { width:3px; height:18px; border-radius:2px; background:linear-gradient(180deg,#3b82f6,#60a5fa); }
.adm-section-title h3 { font-family:'Cabinet Grotesk',sans-serif; font-weight:900; font-size:15px; color:#0F172A; margin:0; }
.adm-section-title span { font-size:12px; color:#94a3b8; }
.adm-dom { border:1.5px solid #e2e8f0; border-radius:16px; overflow:hidden; }
.adm-dom-header { display:flex;align-items:center;gap:12px;padding:14px 18px;cursor:pointer;transition:background .15s;border-bottom:1px solid transparent; }
.adm-dom-header:hover { background:#f8fafc; }
.adm-dom-header.open { border-bottom-color:#e2e8f0; }
.adm-dom-body { padding:16px 18px; }
.adm-niveau-block { background:#f8fafc; border-radius:12px; border:1.5px solid #f1f5f9; overflow:hidden; }
.adm-niveau-header { padding:10px 14px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; background:#fff; }
.adm-niveau-body { padding:12px 14px; }
.adm-canvas-wrap { position:relative; }
`;

function injectCSS() {
  if (!document.getElementById('adm-pro-css')) {
    const s = document.createElement('style');
    s.id = 'adm-pro-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
}

let _chartLoaded = false;
function loadChart() {
  return new Promise(resolve => {
    if (window.Chart) { resolve(window.Chart); return; }
    if (_chartLoaded) { const t=setInterval(()=>{if(window.Chart){clearInterval(t);resolve(window.Chart);}},50); return; }
    _chartLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    s.onload = () => resolve(window.Chart);
    document.head.appendChild(s);
  });
}

function getThemeVars() {
  return { text:'#0F172A', text2:'#64748b', text3:'#94a3b8', bg:'#f8fafc', border:'#e2e8f0', card:'#ffffff', blue:'#3b82f6', green:'#10b981', amber:'#f59e0b', red:'#ef4444', purple:'#8b5cf6' };
}

function useChart(canvasRef, configFn, deps=[]) {
  const inst = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    loadChart().then(Chart => {
      if (inst.current) inst.current.destroy();
      inst.current = new Chart(canvasRef.current.getContext('2d'), configFn(Chart, getThemeVars()));
    });
    return () => { if (inst.current) { inst.current.destroy(); inst.current = null; } };
  }, deps); // eslint-disable-line
}

function ChartLine({ data }) {
  const ref = useRef(null);
  useChart(ref, (C, c) => ({
    type: 'line',
    data: { labels: data.map(d=>d.mois), datasets: [{ label:'Reservations', data:data.map(d=>d.total), borderColor:c.blue, backgroundColor:'rgba(59,130,246,.07)', fill:true, tension:.4, pointBackgroundColor:c.blue, pointBorderColor:'#fff', pointBorderWidth:2, pointRadius:5, pointHoverRadius:7, borderWidth:2.5 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{backgroundColor:c.card,titleColor:c.text2,bodyColor:c.text,borderColor:c.border,borderWidth:1,callbacks:{label:ctx=>` ${ctx.raw} reservation${ctx.raw>1?'s':''}`}} }, scales:{ x:{grid:{color:c.border+'55'},ticks:{color:c.text2,font:{size:11}}}, y:{beginAtZero:true,grid:{color:c.border+'55'},ticks:{color:c.text2,font:{size:11},stepSize:1,callback:v=>Number.isInteger(v)?v:''}} } }
  }), [JSON.stringify(data)]);
  return <canvas ref={ref} style={{height:200}}/>;
}

function ChartBar({ data }) {
  const ref = useRef(null);
  const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const labels = data.map(d => d.jour || JOURS[(d.jour_semaine??1)-1] || String(d.jour_semaine));
  const vals   = data.map(d => d.total);
  const maxVal = Math.max(...vals, 1);
  useChart(ref, (C, c) => ({
    type:'bar',
    data:{ labels, datasets:[{ label:'Reservations', data:vals, backgroundColor:vals.map(v=>v===maxVal&&maxVal>0?c.blue:c.blue+'55'), borderColor:vals.map(v=>v===maxVal&&maxVal>0?c.blue:c.blue+'44'), borderWidth:1.5, borderRadius:7, borderSkipped:false }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{backgroundColor:c.card,titleColor:c.text2,bodyColor:c.text,borderColor:c.border,borderWidth:1}}, scales:{x:{grid:{display:false},ticks:{color:c.text,font:{size:12,weight:'600'}}},y:{beginAtZero:true,max:maxVal<3?3:undefined,grid:{color:c.border+'55'},ticks:{color:c.text2,font:{size:11},stepSize:1,callback:v=>Number.isInteger(v)?v:''}}} }
  }), [JSON.stringify(data)]);
  return <canvas ref={ref} style={{height:180}}/>;
}

function ChartHorizBar({ data, metric }) {
  const ref = useRef(null);
  const PAL = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#f97316','#ec4899'];
  const maxVal = Math.max(...data.map(d => d.val||0), 1);
  const isResa = metric === 'nb_resa';
  useChart(ref, (C, c) => ({
    type:'bar',
    data:{
      labels: data.map(d => (d.label||'').length>20?(d.label||'').slice(0,19)+'…':(d.label||'')),
      datasets:[{
        label: isResa ? 'Réservations' : 'Formateurs',
        data: data.map(d=>d.val||0),
        backgroundColor: data.map((_,i)=>PAL[i%PAL.length]+'cc'),
        borderColor:     data.map((_,i)=>PAL[i%PAL.length]),
        borderWidth:1.5, borderRadius:6, borderSkipped:false
      }]
    },
    options:{
      indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'#1e293b',titleColor:'#94a3b8',bodyColor:'#fff',
          borderColor:'#334155',borderWidth:1,padding:10,
          callbacks:{
            label: x => isResa
              ? ` ${x.parsed.x} réservation${x.parsed.x>1?'s':''}`
              : ` ${x.parsed.x} formateur${x.parsed.x>1?'s':''}`
          }
        }
      },
      scales:{
        x:{
          beginAtZero:true,
          max: maxVal<2 ? maxVal+1 : undefined,
          grid:{color:'rgba(0,0,0,.04)'},
          ticks:{color:c.text2,font:{size:10},stepSize:1,callback:v=>Number.isInteger(v)?v:''}
        },
        y:{
          grid:{display:false},
          ticks:{color:'#374151',font:{size:12,weight:'600'}}
        }
      }
    }
  }), [JSON.stringify(data), metric]);
  return <canvas ref={ref} style={{height:Math.max(160,data.length*44)}}/>;
}

function TableauBI({ data }) {
  // Dédupliquer les matières de même nom (fusionner profs et resas)
  const deduped = useMemo(() => {
    const map = {};
    data.forEach(m => {
      const key = (m.label||'').toLowerCase().trim();
      if (!map[key]) map[key] = { label: m.label, nb_profs: 0, nb_resa: 0 };
      map[key].nb_profs += (m.nb_profs||0);
      map[key].nb_resa  += (m.nb_resa||0);
    });
    return Object.values(map).sort((a,b) => {
      if (b.nb_profs !== a.nb_profs) return b.nb_profs - a.nb_profs;
      return b.nb_resa - a.nb_resa;
    });
  }, [data]);

  const maxResa = Math.max(...deduped.map(d=>d.nb_resa||0), 1);

  const getSat = (p, r) => {
    if (p===0)   return { l:'Sans prof',     c:'#94a3b8', bg:'#f1f5f9', dot:'#cbd5e1' };
    if (r===0)   return { l:'Peu demandée',  c:'#64748b', bg:'#f8fafc', dot:'#94a3b8' };
    if (r/p>1.5) return { l:'Forte demande', c:'#dc2626', bg:'#fef2f2', dot:'#ef4444' };
    if (r/p>0.5) return { l:'Bonne activité',c:'#059669', bg:'#ecfdf5', dot:'#10b981' };
    return             { l:'Démarrage',     c:'#d97706', bg:'#fffbeb', dot:'#f59e0b' };
  };

  return (
    <div style={{overflowX:'auto',borderRadius:16,border:'1.5px solid #f1f5f9'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{background:'#f8fafc'}}>
            {['#','Matière','Formateurs','Réservations','Taux','Statut'].map((h,i)=>(
              <th key={i} style={{
                padding:'10px 14px', textAlign:i>1?'center':'left',
                fontSize:10, fontWeight:800, color:'#94a3b8',
                textTransform:'uppercase', letterSpacing:'.08em',
                whiteSpace:'nowrap', borderBottom:'1.5px solid #f1f5f9'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deduped.map((m,i) => {
            const r=m.nb_resa||0, p=m.nb_profs||0, sat=getSat(p,r);
            const pct = maxResa>0 ? Math.round((r/maxResa)*100) : 0;
            const taux = p>0 ? (r/p).toFixed(1) : null;
            return (
              <tr key={i}
                style={{borderBottom:i<deduped.length-1?'1px solid #f1f5f9':'none',transition:'background .12s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                {/* # */}
                <td style={{padding:'12px 14px',color:'#cbd5e1',fontSize:12,fontWeight:700,fontFamily:'Cabinet Grotesk,sans-serif'}}>{i+1}</td>
                {/* Matière */}
                <td style={{padding:'12px 14px'}}>
                  <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:13,color:'#0F172A'}}>{m.label}</div>
                </td>
                {/* Formateurs */}
                <td style={{padding:'12px 14px',textAlign:'center'}}>
                  <span style={{
                    display:'inline-flex',alignItems:'center',justifyContent:'center',
                    width:32,height:32,borderRadius:10,
                    background: p>0?'#ecfdf5':'#f1f5f9',
                    color: p>0?'#059669':'#94a3b8',
                    fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:15
                  }}>{p}</span>
                </td>
                {/* Réservations */}
                <td style={{padding:'12px 14px',textAlign:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
                    <span style={{
                      display:'inline-flex',alignItems:'center',justifyContent:'center',
                      width:32,height:32,borderRadius:10,
                      background: r>0?'#eff6ff':'#f1f5f9',
                      color: r>0?'#3b82f6':'#94a3b8',
                      fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:15
                    }}>{r}</span>
                    <div style={{width:56,height:5,background:'#e2e8f0',borderRadius:3,overflow:'hidden'}}>
                      <div style={{width:pct+'%',height:'100%',background:'#3b82f6',borderRadius:3,transition:'width .6s ease'}}/>
                    </div>
                  </div>
                </td>
                {/* Taux */}
                <td style={{padding:'12px 14px',textAlign:'center'}}>
                  {taux ? (
                    <span style={{
                      fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:13,
                      color: parseFloat(taux)>1?'#059669':parseFloat(taux)>0.5?'#d97706':'#94a3b8'
                    }}>{taux}</span>
                  ) : <span style={{color:'#e2e8f0',fontSize:16}}>—</span>}
                </td>
                {/* Statut */}
                <td style={{padding:'12px 14px',textAlign:'center'}}>
                  <span style={{
                    display:'inline-flex',alignItems:'center',gap:5,
                    fontSize:11,fontWeight:700,
                    padding:'4px 10px',borderRadius:20,
                    background:sat.bg,color:sat.c,whiteSpace:'nowrap',
                    border:`1.5px solid ${sat.dot}44`
                  }}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:sat.dot,flexShrink:0}}/>
                    {sat.l}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ChartDoughnut({ data, colors }) {
  const ref = useRef(null);
  const tot = data.reduce((a,b)=>a+(b.val||0),0);
  useChart(ref, (C, c) => ({
    type:'doughnut',
    data:{ labels:data.map(d=>d.label), datasets:[{data:data.map(d=>d.val||0),backgroundColor:colors,borderWidth:0,hoverOffset:5}] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%', plugins:{ legend:{position:'bottom',labels:{color:c.text,font:{size:11,weight:'600'},padding:12,usePointStyle:true, generateLabels:chart=>chart.data.labels.map((lbl,i)=>({text:`${lbl}  ${chart.data.datasets[0].data[i]} (${tot>0?Math.round(chart.data.datasets[0].data[i]/tot*100):0}%)`,fillStyle:colors[i],strokeStyle:colors[i],fontColor:c.text,hidden:false,index:i})) }}, tooltip:{backgroundColor:c.card,titleColor:c.text2,bodyColor:c.text,borderColor:c.border,borderWidth:1,callbacks:{label:x=>` ${x.label} : ${x.parsed} (${tot>0?Math.round(x.parsed/tot*100):0}%)`}} } }
  }), [JSON.stringify(data)]);
  return <canvas ref={ref} style={{height:200}}/>;
}

function isTarif(v) { return v!==null&&v!==undefined&&v!==''&&parseFloat(v)>0; }

function ProfAvatar({ prof, size=40 }) {
  const nm   = `${prof?.user_prenom||''} ${prof?.user_nom||''}`.trim()||'P';
  const init = nm.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const pals = [['#1e40af','#3b82f6'],['#065f46','#10b981'],['#4c1d95','#8b5cf6'],['#7c2d12','#f59e0b'],['#1e3a8a','#60a5fa']];
  const [a,b] = pals[nm.charCodeAt(0)%pals.length];
  const radius = size/4;
  return (
    <div style={{width:size,height:size,borderRadius:radius,flexShrink:0,overflow:'hidden',background:`linear-gradient(135deg,${a},${b})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.34,fontWeight:800,color:'#fff',fontFamily:'Cabinet Grotesk,sans-serif',boxShadow:'0 2px 8px rgba(0,0,0,.12)',position:'relative'}}>
      {prof?.photo_url
        ? <img
            src={`http://localhost:8001${prof.photo_url}`}
            alt=""
            style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',display:'block',borderRadius:radius}}
          />
        : init}
    </div>
  );
}

function StatutBadge({ s }) {
  const m = {'valide':{c:'adm-badge-green',i:'✓',l:'Validé'},'en_attente':{c:'adm-badge-amber',i:'...',l:'En attente'},'refuse':{c:'adm-badge-red',i:'x',l:'Refusé'},'approuve':{c:'adm-badge-green',i:'✓',l:'Approuvé'}};
  const key = s==='validé'?'valide':s==='refusé'?'refuse':s==='approuvé'?'approuve':s==='en_attente'?'en_attente':s;
  const cfg = m[key]||{c:'adm-badge-blue',i:'?',l:s};
  return <span className={`adm-badge ${cfg.c}`}>{cfg.i} {cfg.l}</span>;
}

function ModeBadge({ m }) {
  const map = {en_ligne:{c:'adm-badge-blue',l:'En ligne'},presentiel:{c:'adm-badge-green',l:'Présentiel'},les_deux:{c:'adm-badge-purple',l:'Les deux'}};
  const cfg = map[m]||map.presentiel;
  return <span className={`adm-badge ${cfg.c}`}>{cfg.l}</span>;
}

function SectionTitle({ title, sub, action }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
      <div className="adm-section-title" style={{marginBottom:0}}>
        <div className="adm-section-title-bar"/>
        <h3>{title}</h3>
        {sub&&<span>{sub}</span>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="adm-empty">
      <div style={{fontSize:32,marginBottom:12,opacity:.6}}>{icon}</div>
      <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:15,color:'#64748b',marginBottom:5}}>{title}</div>
      {sub&&<div style={{fontSize:13,color:'#94a3b8'}}>{sub}</div>}
    </div>
  );
}

function ProfDrawer({ prof, onClose, onValider, onRefuser }) {
  const [tab, setTab] = useState('profil');
  if (!prof) return null;
  const nm     = `${prof.user_prenom||''} ${prof.user_nom||''}`.trim()||'Professeur';
  const mats   = prof.tarifs_matieres?[...new Set(prof.tarifs_matieres.map(t=>t.nom_matiere))]:[];
  const tarifs = prof.tarifs_matieres?prof.tarifs_matieres.filter(t=>parseFloat(t.tarif)>0):[];
  const TABS   = [['profil','Profil'],['enseign','Enseignements'],['docs','Documents'],['dispos','Disponibilités']];
  const InfoRow = ({icon,label,val,href}) => (
    <div style={{display:'flex',gap:10,padding:'10px 0',borderBottom:'1px solid #f8fafc',alignItems:'center'}}>
      <span style={{fontSize:14,width:20,textAlign:'center',flexShrink:0}}>{icon}</span>
      <span style={{fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.06em',width:72,flexShrink:0}}>{label}</span>
      {href?<a href={href} style={{fontSize:13,fontWeight:600,color:'#3b82f6',textDecoration:'none'}}>{val}</a>:<span style={{fontSize:13,fontWeight:500,color:'#0F172A'}}>{val||'—'}</span>}
    </div>
  );
  return (
    <>
      <div className="adm-drawer-overlay" onClick={onClose}/>
      <div className="adm-drawer">
        <div style={{height:70,background:'linear-gradient(135deg,#1e40af 0%,#3b82f6 60%,#60a5fa 100%)',position:'relative',overflow:'hidden',flexShrink:0}}>
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.07}} viewBox="0 0 540 110" preserveAspectRatio="xMidYMid slice">
            {Array.from({length:18},(_,i)=><circle key={i} cx={(i%6)*90+10} cy={Math.floor(i/6)*40+18} r="1.5" fill="#fff"/>)}
          </svg>
          <div style={{position:'absolute',top:12,left:16}}><StatutBadge s={prof.statut_validation}/></div>
          <button onClick={onClose} style={{position:'absolute',top:12,right:14,width:32,height:32,borderRadius:9,background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',cursor:'pointer',color:'#fff',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',transition:'background .12s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.22)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.12)'}>x</button>
        </div>
        <div style={{padding:'0 24px 20px',borderBottom:'1px solid #f1f5f9'}}>
          {/* Avatar + nom côte à côte, complètement sous le header */}
          <div style={{display:'flex',alignItems:'center',gap:16,paddingTop:16,marginBottom:16}}>
            <div style={{width:72,height:72,borderRadius:18,border:'3px solid #f1f5f9',overflow:'hidden',flexShrink:0,boxShadow:'0 2px 10px rgba(0,0,0,.10)'}}>
              <ProfAvatar prof={prof} size={66}/>
            </div>
            <div>
              <h2 style={{fontFamily:'Cabinet Grotesk,sans-serif',fontSize:17,fontWeight:900,color:'#0F172A',margin:'0 0 6px',letterSpacing:'-.02em'}}>{nm}</h2>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,alignItems:'center'}}>
                {prof.ville&&<span style={{fontSize:12,color:'#64748b',fontWeight:500}}>{prof.ville}</span>}
                <ModeBadge m={prof.mode_enseignement}/>
                <span style={{fontSize:12,color:'#64748b'}}><strong style={{color:'#0F172A'}}>{parseFloat(prof.note_moyenne||0).toFixed(1)}</strong> ({prof.nb_avis} avis)</span>
              </div>
            </div>
          </div>
          {prof.statut_validation==='validé'&&<div style={{padding:'9px 14px',background:'#ecfdf5',border:'1px solid #6ee7b7',borderRadius:10,fontSize:12,color:'#065f46',fontWeight:600}}>Professeur validé — visible sur la plateforme</div>}
          {prof.statut_validation==='en_attente'&&<div style={{display:'flex',gap:8}}><button className="adm-btn adm-btn-success" style={{flex:1,justifyContent:'center'}} onClick={()=>{onValider(prof.id);onClose();}}>Valider</button><button className="adm-btn adm-btn-danger" style={{flex:1,justifyContent:'center'}} onClick={()=>{onRefuser(prof.id);onClose();}}>Refuser</button></div>}
        </div>
        <div style={{display:'flex',borderBottom:'1px solid #f1f5f9',padding:'0 12px',background:'#fff'}}>
          {TABS.map(([k,l])=>(<button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:'13px 4px',background:'none',border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===k?700:400,color:tab===k?'#3b82f6':'#94a3b8',borderBottom:`2px solid ${tab===k?'#3b82f6':'transparent'}`,transition:'all .15s'}}>{l}</button>))}
        </div>
        <div style={{padding:24}}>
          {tab==='profil'&&(
            <div style={{display:'flex',flexDirection:'column',gap:18}}>
              <div className="adm-card" style={{padding:'4px 16px 12px'}}>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.08em',padding:'12px 0 4px'}}>Coordonnées</div>
                <InfoRow icon="@" label="Email" val={prof.email} href={prof.email?`mailto:${prof.email}`:null}/>
                <InfoRow icon="T" label="Téléphone" val={prof.telephone} href={prof.telephone?`tel:${prof.telephone}`:null}/>
                <InfoRow icon="V" label="Ville" val={prof.ville}/>
              </div>
              {prof.bio&&<div className="adm-card" style={{padding:'16px 18px'}}><div style={{fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Bio</div><p style={{fontSize:13,color:'#64748b',lineHeight:1.7,margin:0,paddingLeft:12,borderLeft:'2px solid #3b82f6'}}>{prof.bio}</p></div>}
              {(isTarif(prof.tarif_en_ligne)||isTarif(prof.tarif_presentiel))&&(
                <div style={{display:'flex',gap:10}}>
                  {isTarif(prof.tarif_en_ligne)&&<div style={{flex:1,padding:14,background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:14,textAlign:'center'}}><div style={{fontSize:11,color:'#1d4ed8',fontWeight:700,marginBottom:4}}>En ligne</div><div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:22,color:'#1d4ed8'}}>{prof.tarif_en_ligne} DT</div><div style={{fontSize:11,color:'#64748b',marginTop:2}}>/heure</div></div>}
                  {isTarif(prof.tarif_presentiel)&&<div style={{flex:1,padding:14,background:'#ecfdf5',border:'1px solid #6ee7b7',borderRadius:14,textAlign:'center'}}><div style={{fontSize:11,color:'#065f46',fontWeight:700,marginBottom:4}}>Présentiel</div><div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:22,color:'#065f46'}}>{prof.tarif_presentiel} DT</div><div style={{fontSize:11,color:'#64748b',marginTop:2}}>/heure</div></div>}
                </div>
              )}
            </div>
          )}
          {tab==='enseign'&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {mats.length>0?<div className="adm-card" style={{padding:16}}><div style={{fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Matières enseignées</div><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{mats.map(m=><span key={m} className="adm-badge adm-badge-blue">{m}</span>)}</div></div>:<EmptyState icon="B" title="Aucune matière renseignée"/>}
              {tarifs.length>0&&<div className="adm-card" style={{padding:16}}><div style={{fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Tarifs par matière</div><div style={{display:'flex',flexDirection:'column',gap:6}}>{tarifs.map((t,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'#f8fafc',borderRadius:10,border:'1px solid #f1f5f9'}}><div><span style={{fontWeight:700,fontSize:13}}>{t.nom_matiere}</span><span style={{fontSize:12,color:'#94a3b8',marginLeft:8}}>{t.nom_niveau}</span></div><span className="adm-badge adm-badge-green" style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800}}>{t.tarif} DT/h</span></div>)}</div></div>}
            </div>
          )}
          {tab==='docs'&&(prof.certificats?.length>0?<div style={{display:'flex',flexDirection:'column',gap:8}}>{prof.certificats.map(c=><a key={c.id} href={`http://localhost:8001${c.fichier_url}`} target="_blank" rel="noreferrer" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',background:'#f8fafc',border:'1.5px solid #f1f5f9',borderRadius:14,transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.background='#eff6ff';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#f1f5f9';e.currentTarget.style.background='#f8fafc';}}><div style={{width:40,height:40,borderRadius:10,background:'#eff6ff',border:'1px solid #bfdbfe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>D</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:'#0F172A',marginBottom:2}}>{c.titre}</div><div style={{fontSize:12,color:'#3b82f6'}}>Consulter</div></div></a>)}</div>:<EmptyState icon="D" title="Aucun document" sub="Ce professeur n'a pas encore ajouté de diplômes."/>)}
          {tab==='dispos'&&(prof.disponibilites?.length>0?<div style={{display:'flex',flexDirection:'column',gap:8}}>{prof.disponibilites.map(d=>{const full=d.nb_max_etudiants>0&&d.nb_inscrits>=d.nb_max_etudiants;return<div key={d.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'#f8fafc',border:`1.5px solid ${full?'#fca5a5':'#f1f5f9'}`,borderRadius:14}}><div><div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:700,fontSize:13,color:'#0F172A',marginBottom:3}}>{d.date_specifique}</div><div style={{fontSize:12,color:'#94a3b8'}}>{d.heure_debut} – {d.heure_fin}</div></div><span className={`adm-badge ${full?'adm-badge-red':'adm-badge-green'}`}>{full?'Complet':`${d.nb_inscrits}/${d.nb_max_etudiants}`}</span></div>;})}</div>:<EmptyState icon="C" title="Aucun créneau planifié"/>)}
        </div>
      </div>
    </>
  );
}

function OverviewTab({ stats, allProfs, demandes, counts, onTabChange, onViewProf, chartData }) {
  const pendingProfs    = allProfs.filter(p=>p.statut_validation==='en_attente');
  const demandesPending = demandes.filter(d=>d.statut==='en_attente').length;
  const valides         = allProfs.filter(p=>p.statut_validation==='validé');
  const topProfs        = [
    ...valides.filter(p=>parseFloat(p.note_moyenne||0)>0).sort((a,b)=>parseFloat(b.note_moyenne)-parseFloat(a.note_moyenne)),
    ...valides.filter(p=>!parseFloat(p.note_moyenne||0))
  ].slice(0,5);
  const { reservations_par_mois=[] } = chartData;
  const totalResa = reservations_par_mois.reduce((a,b)=>a+(b.total||0),0);
  const pctMois   = stats.total_reservations>0
    ? Math.min(100, Math.round(((stats.reservations_mois||0)/stats.total_reservations)*100))
    : 0;

  // Activité : 4 vrais KPIs avec emojis
  const activiteKpis = [
    { icon:'📅', val:stats.reservations_mois||0,      lbl:'Réservations ce mois', color:'#3b82f6', bg:'#eff6ff' },
    { icon:'👨‍🏫', val:valides.length,                   lbl:'Formateurs actifs',    color:'#10b981', bg:'#ecfdf5' },
    { icon:'👥', val:stats.total_users||0,             lbl:'Utilisateurs',         color:'#8b5cf6', bg:'#f5f3ff' },
    { icon:'📊', val:stats.total_reservations||0,      lbl:'Total réservations',   color:'#f59e0b', bg:'#fffbeb' },
  ];

  // Médailles top formateurs
  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>

      {/* ── Alertes urgentes ── */}
      {(pendingProfs.length>0||demandesPending>0)&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {pendingProfs.length>0&&(
            <div className="adm-alert adm-alert-amber" onClick={()=>onTabChange('profs')}>
              <div style={{width:38,height:38,borderRadius:10,background:'rgba(245,158,11,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🔔</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:13,color:'#b45309'}}>{pendingProfs.length} formateur{pendingProfs.length>1?'s':''} en attente de validation</div>
                <div style={{fontSize:12,color:'#92400e',marginTop:2}}>Répondez rapidement pour ne pas bloquer leur activité</div>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:'#b45309',whiteSpace:'nowrap'}}>Traiter →</span>
            </div>
          )}
          {demandesPending>0&&(
            <div className="adm-alert adm-alert-red" onClick={()=>onTabChange('demandes')}>
              <div style={{width:38,height:38,borderRadius:10,background:'rgba(239,68,68,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>💡</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:13,color:'#9f1239'}}>{demandesPending} demande{demandesPending>1?'s':''} de matière en attente</div>
                <div style={{fontSize:12,color:'#881337',marginTop:2}}>Des formateurs souhaitent enseigner de nouvelles matières</div>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:'#dc2626',whiteSpace:'nowrap'}}>Voir →</span>
            </div>
          )}
        </div>
      )}

      {/* ── Ligne 1 : Graphe réservations (pleine largeur) ── */}
      <div className="adm-chart-card adm-fadeUp" style={{animationDelay:'.05s'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
          <div>
            <div className="adm-section-title" style={{marginBottom:3}}>
              <div className="adm-section-title-bar"/>
              <h3>Évolution des réservations</h3>
            </div>
            <div style={{paddingLeft:11,fontSize:12,color:'#94a3b8'}}>{totalResa} réservation{totalResa!==1?'s':''} au total</div>
          </div>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={()=>onTabChange('analytiques')}>
            Voir l'analyse complète →
          </button>
        </div>
        {reservations_par_mois.length>0
          ?<div className="adm-canvas-wrap"><ChartLine data={reservations_par_mois}/></div>
          :<EmptyState icon="📈" title="Aucune réservation encore" sub="Les données apparaîtront dès les premières réservations"/>
        }
      </div>

      {/* ── Ligne 2 : Top formateurs + Activité ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>

        {/* Top formateurs */}
        <div className="adm-chart-card adm-fadeUp" style={{animationDelay:'.1s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div>
              <div className="adm-section-title" style={{marginBottom:3}}>
                <div className="adm-section-title-bar"/>
                <h3>Top Formateurs</h3>
              </div>
              <div style={{paddingLeft:11,fontSize:12,color:'#94a3b8'}}>{valides.length} formateur{valides.length!==1?'s':''} actif{valides.length!==1?'s':''}</div>
            </div>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={()=>onTabChange('profs')}>Voir tous</button>
          </div>

          {topProfs.length>0 ? (
            <div style={{display:'flex',flexDirection:'column',gap:3}}>
              {topProfs.map((p,i)=>{
                const nm   = `${p.user_prenom||''} ${p.user_nom||''}`.trim();
                const note = parseFloat(p.note_moyenne||0);
                const mats = p.tarifs_matieres ? [...new Set(p.tarifs_matieres.map(t=>t.nom_matiere))].slice(0,2) : [];
                const initials = nm.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
                const pals=[['#00153D','#1E3A8A'],['#065F46','#047857'],['#4C1D95','#6D28D9'],['#7C2D12','#B45309']];
                const [a,b]=pals[nm.charCodeAt(0)%pals.length];
                return (
                  <div key={p.id} className="adm-top-row" onClick={()=>onViewProf(p)}>
                    <span style={{fontSize:16,width:26,textAlign:'center',flexShrink:0}}>{medals[i]}</span>
                    <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${a},${b})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'#fff',flexShrink:0,fontFamily:'Cabinet Grotesk,sans-serif',overflow:'hidden'}}>
                      {p.photo_url?<img src={`http://localhost:8001${p.photo_url}`} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:initials}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:13,color:'#0F172A',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{nm}</div>
                      <div style={{fontSize:11,color:'#94a3b8',marginTop:1}}>{mats.length>0?mats.join(' · '):'Aucune matière'}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      {note>0
                        ?<><div style={{fontSize:13,fontWeight:800,color:'#f59e0b',fontFamily:'Cabinet Grotesk,sans-serif'}}>⭐ {note.toFixed(1)}</div><div style={{fontSize:10,color:'#94a3b8'}}>{p.nb_avis} avis</div></>
                        :<span className="adm-badge adm-badge-blue" style={{fontSize:10}}>Nouveau ✨</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon="👨‍🏫" title="Aucun formateur validé"/>
          )}
        </div>

        {/* Activité de la plateforme */}
        <div className="adm-chart-card adm-fadeUp" style={{animationDelay:'.15s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div>
              <div className="adm-section-title" style={{marginBottom:3}}>
                <div className="adm-section-title-bar"/>
                <h3>Activité de la plateforme</h3>
              </div>
              <div style={{paddingLeft:11,fontSize:12,color:'#94a3b8'}}>{new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            {activiteKpis.map(s=>(
              <div key={s.lbl} style={{background:s.bg,borderRadius:14,padding:'14px 16px',border:`1.5px solid ${s.color}22`}}>
                <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
                <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontSize:24,fontWeight:900,color:s.color,lineHeight:1,marginBottom:3}}>{s.val}</div>
                <div style={{fontSize:11,color:s.color,opacity:.75,fontWeight:600}}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {stats.total_reservations>0&&(
            <div style={{padding:'12px 14px',background:'#f8fafc',borderRadius:12,border:'1.5px solid #f1f5f9'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:600,color:'#0F172A'}}>Ce mois / total</span>
                <span style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:12,color:'#3b82f6'}}>{stats.reservations_mois||0} / {stats.total_reservations}</span>
              </div>
              <div className="adm-bar-track">
                <div className="adm-bar-fill" style={{width:`${pctMois}%`,background:'linear-gradient(90deg,#3b82f6,#60a5fa)'}}/>
              </div>
              <div style={{fontSize:11,color:'#94a3b8',marginTop:5}}>{pctMois}% de l'activité réalisée ce mois</div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function AnalytiquesTab({ stats, allProfs, chartData, onTabChange }) {
  const [domainIdx,  setDomainIdx]  = useState(0);
  const [metric,     setMetric]     = useState('nb_profs');
  const [viewMode,   setViewMode]   = useState('matiere'); // 'matiere' | 'niveau'
  const [expandedNiv,setExpandedNiv]= useState({});

  const {
    reservations_par_mois=[],
    reservations_par_jour=[],
    matieres_par_domaine=[],
    modes_enseignement=[],
    statut_profs=[],
    par_niveau=[],
    entonnoir={},
    performance_profs=[],
  } = chartData;

  const totalResa = reservations_par_mois.reduce((a,b)=>a+(b.total||0),0);
  const nbValides = statut_profs.find(s=>s.label==='Validés')?.val||0;
  const totalP    = statut_profs.reduce((a,b)=>a+(b.val||0),0);
  const tauxValid = totalP>0?Math.round((nbValides/totalP)*100):0;
  const modesF    = modes_enseignement.filter(m=>(m.val||0)>0);
  const domActif  = matieres_par_domaine[domainIdx]||null;
  const niveauxDomActif = par_niveau[domainIdx]||par_niveau.find(d=>d.domaine===domActif?.domaine)||null;

  const STATUT_FIXED  = [{label:'Validés',color:'#10b981'},{label:'En attente',color:'#f59e0b'},{label:'Refusés',color:'#ef4444'}];
  const statutData    = STATUT_FIXED.map(s=>({label:s.label,val:statut_profs.find(r=>r.label===s.label)?.val??0}));
  const hasStatut     = statutData.some(s=>s.val>0);
  const statutColors  = STATUT_FIXED.map(s=>s.color);

  // Données matières dédupliquées
  const matiereData = useMemo(() => {
    if (!domActif?.matieres?.length) return [];
    const map = {};
    domActif.matieres.forEach(m => {
      const key = (m.matiere||m.nom||'').toLowerCase().trim();
      if (!key) return;
      if (!map[key]) map[key] = { label: m.matiere||m.nom||'', nb_profs:0, nb_resa:0 };
      map[key].nb_profs = Math.max(map[key].nb_profs, m.nb_profs||0);
      map[key].nb_resa += (m.nb_resa||0);
    });
    return Object.values(map).map(m => ({
      ...m, val: metric==='nb_resa' ? m.nb_resa : m.nb_profs,
    })).sort((a,b) => b.val - a.val || b.nb_profs - a.nb_profs);
  }, [domActif, metric]);

  // KPIs globaux analytiques
  const kpis = [
    {icon:'📊', label:'Total réservations', val:totalResa||stats.total_reservations||0,                                              color:'#3b82f6', bg:'#eff6ff'},
    {icon:'📅', label:'Ce mois',            val:stats.reservations_mois||reservations_par_mois.at(-1)?.total||0,                     color:'#10b981', bg:'#ecfdf5'},
    {icon:'✅', label:'Taux validation',    val:tauxValid>0?`${tauxValid}%`:(stats.total_professeurs>0?`${Math.round(stats.total_professeurs/(stats.total_professeurs+(stats.en_attente||0)+(stats.refuses||0)||1)*100)}%`:'—'), color:'#8b5cf6', bg:'#f5f3ff'},
    {icon:'⏳', label:'En attente valid.',   val:statutData.find(s=>s.label==='En attente')?.val||stats.en_attente||0,                color:'#f59e0b', bg:'#fffbeb'},
  ];

  // Composant Vue Niveau
  const VueParNiveau = () => {
    if (!niveauxDomActif?.niveaux?.length) return (
      <div style={{padding:'48px 20px',textAlign:'center',color:'#94a3b8'}}>
        <div style={{fontSize:40,marginBottom:12}}>📂</div>
        <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:15,color:'#0F172A',marginBottom:5}}>Aucun niveau configuré</div>
        <div style={{fontSize:13}}>Ajoutez des niveaux dans le Référentiel</div>
      </div>
    );

    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {niveauxDomActif.niveaux.map((niv, ni) => {
          const isOpen = expandedNiv[ni] === true;  // fermé par défaut, ouvert si cliqué
          const totalR = niv.total_resa || niv.matieres.reduce((a,m)=>a+(m.nb_resa||0),0);
          const totalP2 = niv.total_profs || niv.matieres.reduce((a,m)=>a+(m.nb_profs||0),0);
          const hasActivity = totalR > 0 || totalP2 > 0;

          return (
            <div key={ni} style={{border:`1.5px solid ${hasActivity?'#bfdbfe':'#f1f5f9'}`,borderRadius:18,overflow:'hidden',transition:'all .2s'}}>
              {/* Header niveau */}
              <div
                onClick={()=>setExpandedNiv(p=>({...p,[ni]:!isOpen}))}
                style={{
                  display:'flex',alignItems:'center',gap:14,padding:'14px 20px',
                  background:hasActivity?'linear-gradient(135deg,#eff6ff,#f0fdf4)':'#fafbfc',
                  cursor:'pointer',transition:'background .18s',
                }}
              >
                <div style={{
                  width:42,height:42,borderRadius:13,flexShrink:0,
                  background:hasActivity?'linear-gradient(135deg,#3b82f6,#10b981)':'#e2e8f0',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:18,boxShadow:hasActivity?'0 3px 10px rgba(59,130,246,.2)':'none'
                }}>🎓</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:15,color:'#0F172A',letterSpacing:'-.01em'}}>{niv.niveau}</div>
                  <div style={{display:'flex',gap:14,marginTop:4,fontSize:12,color:'#64748b',fontWeight:500}}>
                    <span>📚 {niv.matieres.length} matière{niv.matieres.length>1?'s':''}</span>
                    <span style={{color:'#10b981',fontWeight:700}}>👨‍🏫 {totalP2} formateur{totalP2>1?'s':''}</span>
                    {totalR>0 && <span style={{color:'#3b82f6',fontWeight:700}}>📅 {totalR} réservation{totalR>1?'s':''}</span>}
                  </div>
                </div>
                {/* Mini barres de stats */}
                <div style={{display:'flex',gap:10,alignItems:'center',flexShrink:0}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:20,color:totalP2>0?'#10b981':'#cbd5e1'}}>{totalP2}</div>
                    <div style={{fontSize:9,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.06em'}}>profs</div>
                  </div>
                  <div style={{width:1,height:28,background:'#f1f5f9'}}/>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:20,color:totalR>0?'#3b82f6':'#cbd5e1'}}>{totalR}</div>
                    <div style={{fontSize:9,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.06em'}}>résa</div>
                  </div>
                  <div style={{
                    width:28,height:28,borderRadius:8,background:'#f1f5f9',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:12,color:'#94a3b8',marginLeft:4,transition:'transform .2s',
                    transform:isOpen?'rotate(180deg)':'rotate(0deg)'
                  }}>▾</div>
                </div>
              </div>

              {/* Matières du niveau */}
              {isOpen && (
                <div style={{padding:'12px 20px 16px',background:'#fff'}}>
                  {niv.matieres.length===0 ? (
                    <div style={{textAlign:'center',padding:'16px',color:'#94a3b8',fontSize:13,fontStyle:'italic'}}>
                      Aucune matière dans ce niveau
                    </div>
                  ) : (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
                      {niv.matieres.map((m,mi)=>{
                        const r = m.nb_resa||0;
                        const p = m.nb_profs||0;
                        const sat = p===0?{c:'#94a3b8',bg:'#f1f5f9',l:'Sans prof'}
                          : r===0?{c:'#64748b',bg:'#f8fafc',l:'Peu demandée'}
                          : r/p>1.5?{c:'#dc2626',bg:'#fef2f2',l:'Forte demande'}
                          : r/p>0.5?{c:'#059669',bg:'#ecfdf5',l:'Bonne activité'}
                          : {c:'#d97706',bg:'#fffbeb',l:'Démarrage'};

                        return (
                          <div key={mi} style={{
                            background:sat.bg,borderRadius:14,padding:'12px 14px',
                            border:`1.5px solid ${sat.c}22`,
                            display:'flex',flexDirection:'column',gap:7,
                            transition:'transform .15s',cursor:'default'
                          }}
                            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                            onMouseLeave={e=>e.currentTarget.style.transform='none'}
                          >
                            <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:13,color:'#0F172A'}}>{m.matiere}</div>
                            <div style={{display:'flex',gap:8,alignItems:'center'}}>
                              <span style={{fontSize:11,fontWeight:700,color:'#10b981'}}>👨‍🏫 {p}</span>
                              <span style={{color:'#e2e8f0'}}>·</span>
                              <span style={{fontSize:11,fontWeight:700,color:'#3b82f6'}}>📅 {r}</span>
                            </div>
                            <span style={{
                              fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,
                              background:'rgba(255,255,255,.6)',color:sat.c,
                              alignSelf:'flex-start',border:`1px solid ${sat.c}44`
                            }}>{sat.l}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>

      {/* Bouton export */}
      <div style={{display:'flex',justifyContent:'flex-end'}}>
        <button
          onClick={() => exportAdminAnalytiques(stats, chartData, allProfs)}
          style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',background:'#00153D',color:'#fff',border:'none',borderRadius:12,cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:800,fontSize:'.82rem',boxShadow:'0 4px 14px rgba(0,21,61,0.2)',transition:'all .18s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='#1E3A8A';e.currentTarget.style.transform='translateY(-1px)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='#00153D';e.currentTarget.style.transform='none';}}>
          📄 Exporter rapport PDF
        </button>
      </div>

      {/* KPIs globaux */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {kpis.map((k,i)=>(
          <div key={i} className="adm-stat adm-scaleIn" style={{animationDelay:`${i*60}ms`}}>
            <div className="adm-stat-accent" style={{background:k.color,animation:`adm-fadeUp .6s ${i*60}ms ease both`}}/>
            <div style={{width:40,height:40,borderRadius:12,background:k.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:14}}>{k.icon}</div>
            <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontSize:28,fontWeight:900,color:k.color,lineHeight:1,marginBottom:5}}>{k.val}</div>
            <div style={{fontSize:12,color:'#94a3b8',fontWeight:500}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Graphes temporels */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div className="adm-chart-card">
          <SectionTitle title="Réservations par mois" sub={totalResa>0?`${totalResa} au total`:'Aucune encore'}/>
          {reservations_par_mois.length>0?<div className="adm-canvas-wrap"><ChartLine data={reservations_par_mois}/></div>:<EmptyState icon="📈" title="Aucune donnée"/>}
        </div>
        <div className="adm-chart-card">
          <SectionTitle title="Activité par jour de semaine"/>
          {reservations_par_jour.length>0?<div className="adm-canvas-wrap"><ChartBar data={reservations_par_jour}/></div>:<EmptyState icon="📊" title="Aucune donnée"/>}
        </div>
      </div>

      {/* ═══ Section BI Matières ═══ */}
      <div style={{background:'#fff',border:'1.5px solid #f1f5f9',borderRadius:24,padding:28,boxShadow:'0 2px 12px rgba(0,0,0,.04)'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22,flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:5}}>
              <div style={{width:4,height:22,borderRadius:2,background:'linear-gradient(180deg,#3b82f6,#8b5cf6)'}}/>
              <h3 style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:17,color:'#0F172A',margin:0}}>
                Analyse par matière
                {domActif&&<span style={{fontSize:13,fontWeight:600,color:'#3b82f6',marginLeft:8}}>— {domActif.domaine}</span>}
              </h3>
            </div>
            <div style={{paddingLeft:13,fontSize:12,color:'#94a3b8'}}>
              {matiereData.length} matière{matiereData.length!==1?'s':''} uniques · données réelles
            </div>
          </div>

          <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
            {/* Sélecteur domaine */}
            <div style={{display:'flex',gap:4,padding:4,background:'#f8fafc',borderRadius:14,border:'1.5px solid #f1f5f9'}}>
              {matieres_par_domaine.map((d,i)=>(
                <button key={i} onClick={()=>setDomainIdx(i)} style={{
                  padding:'6px 14px',fontSize:12,fontWeight:700,borderRadius:10,border:'none',
                  cursor:'pointer',transition:'all .18s',
                  background:i===domainIdx?'#3b82f6':'transparent',
                  color:i===domainIdx?'#fff':'#64748b',
                  boxShadow:i===domainIdx?'0 2px 8px rgba(59,130,246,.3)':'none'
                }}>{d.domaine}</button>
              ))}
            </div>

            {/* Vue : Matière / Niveau */}
            <div style={{display:'flex',gap:4,padding:4,background:'#f8fafc',borderRadius:14,border:'1.5px solid #f1f5f9'}}>
              {[['matiere','📚 Par matière'],['niveau','🎓 Par niveau']].map(([v,l])=>(
                <button key={v} onClick={()=>setViewMode(v)} style={{
                  padding:'6px 12px',fontSize:12,fontWeight:700,borderRadius:10,border:'none',
                  cursor:'pointer',transition:'all .18s',
                  background:viewMode===v?'#8b5cf6':'transparent',
                  color:viewMode===v?'#fff':'#64748b',
                  boxShadow:viewMode===v?'0 2px 8px rgba(139,92,246,.3)':'none'
                }}>{l}</button>
              ))}
            </div>

            {/* Métrique (seulement en vue matière) */}
            {viewMode==='matiere'&&(
              <div style={{display:'flex',gap:4,padding:4,background:'#f8fafc',borderRadius:14,border:'1.5px solid #f1f5f9'}}>
                {[['nb_profs','👨‍🏫 Formateurs'],['nb_resa','📅 Réservations']].map(([k,l])=>(
                  <button key={k} onClick={()=>setMetric(k)} style={{
                    padding:'6px 12px',fontSize:11,fontWeight:700,borderRadius:10,border:'none',
                    cursor:'pointer',transition:'all .18s',
                    background:metric===k?'#0ea5e9':'transparent',
                    color:metric===k?'#fff':'#64748b',
                    boxShadow:metric===k?'0 2px 8px rgba(14,165,233,.3)':'none'
                  }}>{l}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vue PAR MATIÈRE */}
        {viewMode==='matiere'&&(
          matiereData.length>0?(
            <>
              {/* KPIs rapides matière */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:22}}>
                {[
                  {icon:'📚',label:'Matières uniques', val:matiereData.length,                                     color:'#3b82f6',bg:'#eff6ff'},
                  {icon:'👨‍🏫',label:'Formateurs actifs',val:matiereData.reduce((a,m)=>a+(m.nb_profs||0),0),       color:'#10b981',bg:'#ecfdf5'},
                  {icon:'📅',label:'Réservations',      val:matiereData.reduce((a,m)=>a+(m.nb_resa||0),0),         color:'#8b5cf6',bg:'#f5f3ff'},
                  {icon:'🎯',label:'Sans formateur',     val:matiereData.filter(m=>m.nb_profs===0).length,          color:'#ef4444',bg:'#fef2f2'},
                ].map((k,i)=>(
                  <div key={i} style={{background:k.bg,borderRadius:14,padding:'12px 14px',border:`1.5px solid ${k.color}22`,display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,.6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{k.icon}</div>
                    <div>
                      <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:20,color:k.color,lineHeight:1}}>{k.val}</div>
                      <div style={{fontSize:10,color:k.color,opacity:.7,marginTop:2,fontWeight:600}}>{k.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Graphe + Tableau */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:22,alignItems:'start'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:12}}>
                    <div style={{width:8,height:8,borderRadius:2,background:metric==='nb_resa'?'#8b5cf6':'#10b981'}}/>
                    <span style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.08em'}}>
                      {metric==='nb_resa'?'Réservations':'Formateurs'} par matière
                    </span>
                  </div>
                  <div style={{background:'#fafbfc',borderRadius:14,padding:'14px 10px',border:'1.5px solid #f1f5f9'}}>
                    <ChartHorizBar data={matiereData} metric={metric}/>
                  </div>
                </div>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:12}}>
                    <div style={{width:8,height:8,borderRadius:2,background:'#8b5cf6'}}/>
                    <span style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.08em'}}>Tableau de synthèse</span>
                  </div>
                  <TableauBI data={matiereData}/>
                </div>
              </div>

              {/* Légende */}
              <div style={{marginTop:18,paddingTop:14,borderTop:'1px solid #f1f5f9',display:'flex',gap:18,flexWrap:'wrap',alignItems:'center'}}>
                {[{c:'#10b981',l:'Formateurs = actifs sur la plateforme'},{c:'#8b5cf6',l:'Réservations = demandes confirmées'},{c:'#0ea5e9',l:'Taux = réservations ÷ formateurs'}].map((x,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#64748b'}}>
                    <div style={{width:10,height:10,borderRadius:3,background:x.c}}/>
                    {x.l}
                  </div>
                ))}
                <div style={{marginLeft:'auto',fontSize:11,color:'#cbd5e1',fontStyle:'italic'}}>Matières fusionnées par nom</div>
              </div>
            </>
          ):(
            <div style={{padding:'60px 20px',textAlign:'center',color:'#94a3b8'}}>
              <div style={{fontSize:44,marginBottom:14}}>📊</div>
              <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:15,color:'#0F172A',marginBottom:5}}>
                {domActif?'Aucune matière':'Sélectionnez un domaine'}
              </div>
              <div style={{fontSize:13,fontStyle:'italic'}}>
                {domActif?'Ajoutez des matières dans le Référentiel':'Cliquez sur un domaine ci-dessus'}
              </div>
            </div>
          )
        )}

        {/* Vue PAR NIVEAU */}
        {viewMode==='niveau'&&<VueParNiveau/>}
      </div>

      {/* Donuts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div className="adm-chart-card">
          <SectionTitle title="Modes d'enseignement" sub={`${allProfs.filter(p=>p.statut_validation==='validé').length} formateurs validés`}/>
          {modesF.length>0
            ?<div className="adm-canvas-wrap"><ChartDoughnut data={modesF} colors={['#3b82f6','#10b981','#8b5cf6']}/></div>
            :<EmptyState icon="🌐" title="Aucun formateur validé"/>
          }
        </div>
        <div className="adm-chart-card">
          <SectionTitle title="Statuts formateurs" sub="Validés · En attente · Refusés"/>
          {hasStatut?<div className="adm-canvas-wrap"><ChartDoughnut data={statutData} colors={statutColors}/></div>:<EmptyState icon="👨‍🏫" title="Aucun formateur enregistré"/>}
        </div>
      </div>

      {/* ═══ Performance des formateurs ═══ */}
      {performance_profs.length>0&&(()=>{
        const [showAll, setShowAll] = React.useState(false);
        const PREVIEW = 10;
        const displayed = showAll ? performance_profs : performance_profs.slice(0, PREVIEW);
        return (
        <div style={{background:'#fff',border:'1.5px solid #f1f5f9',borderRadius:24,padding:28,boxShadow:'0 2px 12px rgba(0,0,0,.04)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,flexWrap:'wrap',gap:10}}>
            <div style={{display:'flex',alignItems:'center',gap:9}}>
              <div style={{width:4,height:22,borderRadius:2,background:'linear-gradient(180deg,#f59e0b,#10b981)'}}/>
              <h3 style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:17,color:'#0F172A',margin:0}}>Performance des formateurs</h3>
            </div>
            <button
              onClick={()=>setShowAll(v=>!v)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',background:'linear-gradient(135deg,#f59e0b22,#10b98122)',color:'#b45309',border:'1.5px solid #fcd34d',borderRadius:10,cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:800,fontSize:12,transition:'all .18s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='linear-gradient(135deg,#f59e0b,#10b981)';e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='transparent';}}
              onMouseLeave={e=>{e.currentTarget.style.background='linear-gradient(135deg,#f59e0b22,#10b98122)';e.currentTarget.style.color='#b45309';e.currentTarget.style.borderColor='#fcd34d';}}>
              {showAll ? `▲ Réduire` : `👁 Voir tout (${performance_profs.length})`}
            </button>
          </div>
          <div style={{fontSize:13,color:'#94a3b8',paddingLeft:13,marginBottom:22}}>
            {showAll ? `${performance_profs.length} formateurs` : `Top ${PREVIEW} sur ${performance_profs.length}`} · classement par note et activité
          </div>

          <div style={{overflowX:'auto',borderRadius:16,border:'1.5px solid #f1f5f9'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr style={{background:'#f8fafc'}}>
                  {['#','Formateur','Matières','Note','Réservations','Confirmées','Refusées','Taux conf.'].map((h,i)=>(
                    <th key={i} style={{padding:'10px 14px',textAlign:i>2?'center':'left',fontSize:10,fontWeight:800,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.08em',whiteSpace:'nowrap',borderBottom:'1.5px solid #f1f5f9'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((p,i)=>{
                  const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':null;
                  const initials = p.nom.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
                  const pals=[['#00153D','#1E3A8A'],['#065F46','#047857'],['#4C1D95','#6D28D9'],['#7C2D12','#B45309']];
                  const [a,b]=pals[p.nom.charCodeAt(0)%pals.length];
                  const tauxColor = p.taux_confirmation>=70?'#059669':p.taux_confirmation>=40?'#d97706':'#dc2626';

                  return (
                    <tr key={p.id}
                      style={{borderBottom:i<displayed.length-1?'1px solid #f1f5f9':'none',transition:'background .12s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      {/* Rang */}
                      <td style={{padding:'12px 14px',fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:700,color:'#cbd5e1',fontSize:13}}>
                        {medal||`${i+1}`}
                      </td>
                      {/* Formateur */}
                      <td style={{padding:'12px 14px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${a},${b})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'#fff',flexShrink:0,fontFamily:'Cabinet Grotesk,sans-serif'}}>{initials}</div>
                          <div>
                            <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:13,color:'#0F172A'}}>{p.nom}</div>
                            <div style={{fontSize:11,color:'#94a3b8',marginTop:1}}>
                              {p.ville&&`📍 ${p.ville} · `}
                              {p.mode==='en_ligne'?'🌐 En ligne':p.mode==='presentiel'?'🏫 Présentiel':'🔀 Les deux'}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Matières */}
                      <td style={{padding:'12px 14px'}}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          {p.matieres.length>0
                            ?p.matieres.map((m,mi)=>(
                              <span key={mi} style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:'#eff6ff',color:'#1d4ed8',border:'1px solid #bfdbfe',whiteSpace:'nowrap'}}>{m}</span>
                            ))
                            :<span style={{color:'#cbd5e1',fontSize:11}}>—</span>
                          }
                        </div>
                      </td>
                      {/* Note */}
                      <td style={{padding:'12px 14px',textAlign:'center'}}>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                          <span style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:16,color:p.note>0?'#f59e0b':'#e2e8f0'}}>
                            {p.note>0?`⭐ ${p.note.toFixed(1)}`:'—'}
                          </span>
                          {p.nb_avis>0&&<span style={{fontSize:10,color:'#94a3b8'}}>{p.nb_avis} avis</span>}
                        </div>
                      </td>
                      {/* Réservations */}
                      <td style={{padding:'12px 14px',textAlign:'center'}}>
                        <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:32,height:32,borderRadius:10,background:p.nb_resa>0?'#eff6ff':'#f1f5f9',color:p.nb_resa>0?'#3b82f6':'#94a3b8',fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:15}}>{p.nb_resa}</span>
                      </td>
                      {/* Confirmées */}
                      <td style={{padding:'12px 14px',textAlign:'center'}}>
                        <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:32,height:32,borderRadius:10,background:p.nb_confirme>0?'#ecfdf5':'#f1f5f9',color:p.nb_confirme>0?'#059669':'#94a3b8',fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:15}}>{p.nb_confirme}</span>
                      </td>
                      {/* Refusées */}
                      <td style={{padding:'12px 14px',textAlign:'center'}}>
                        <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:32,height:32,borderRadius:10,background:p.nb_refuse>0?'#fef2f2':'#f1f5f9',color:p.nb_refuse>0?'#dc2626':'#94a3b8',fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:15}}>{p.nb_refuse}</span>
                      </td>
                      {/* Taux confirmation */}
                      <td style={{padding:'12px 14px',textAlign:'center'}}>
                        {p.nb_resa>0?(
                          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                            <span style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:14,color:tauxColor}}>{p.taux_confirmation}%</span>
                            <div style={{width:52,height:4,background:'#f1f5f9',borderRadius:2,overflow:'hidden'}}>
                              <div style={{width:`${p.taux_confirmation}%`,height:'100%',background:tauxColor,borderRadius:2,transition:'width .6s'}}/>
                            </div>
                          </div>
                        ):<span style={{color:'#e2e8f0',fontSize:16}}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Légende + bouton voir plus/moins */}
          <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid #f1f5f9',display:'flex',gap:14,flexWrap:'wrap',fontSize:12,color:'#64748b',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{color:'#059669',fontWeight:700}}>≥70%</span> Excellent</div>
            <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{color:'#d97706',fontWeight:700}}>40–70%</span> Moyen</div>
            <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{color:'#dc2626',fontWeight:700}}>&lt;40%</span> À améliorer</div>
            {performance_profs.length > PREVIEW && (
              <button
                onClick={()=>setShowAll(v=>!v)}
                style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,padding:'7px 16px',background:showAll?'#f8fafc':'linear-gradient(135deg,#f59e0b,#10b981)',color:showAll?'#64748b':'#fff',border:showAll?'1.5px solid #e2e8f0':'none',borderRadius:10,cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:800,fontSize:12,transition:'all .2s',boxShadow:showAll?'none':'0 3px 12px rgba(245,158,11,0.3)'}}>
                {showAll ? '▲ Réduire la liste' : `👁 Voir les ${performance_profs.length - PREVIEW} formateurs restants`}
              </button>
            )}
          </div>
        </div>
        );
      })()}

            {/* ═══ Top matières demandées par les profs ═══ */}
      {(()=>{
        const demandesStats = chartData.demandes_stats || [];
        if(!demandesStats.length) return null;
        const total = demandesStats.reduce((a,d)=>a+(d.nb||0),0);
        const approuvees = demandesStats.find(d=>d.statut==='approuvé')?.nb||0;
        const enAttente  = demandesStats.find(d=>d.statut==='en_attente')?.nb||0;
        const refusees   = demandesStats.find(d=>d.statut==='refusé')?.nb||0;
        const tauxAppro  = total>0?Math.round(approuvees/total*100):0;
        const COLORS = {'approuvé':'#10B981','en_attente':'#F59E0B','refusé':'#EF4444'};
        const LABELS = {'approuvé':'Approuvées','en_attente':'En attente','refusé':'Refusées'};
        const ICONS  = {'approuvé':'✅','en_attente':'⏳','refusé':'❌'};

        const DonutDemandes = () => {
          const [anim, setAnim] = React.useState(false);
          React.useEffect(()=>{ const t=setTimeout(()=>setAnim(true),400); return()=>clearTimeout(t); },[]);
          const r=54, cx=70, cy=70, circ=2*Math.PI*r;
          let cum=0;
          return (
            <div style={{position:'relative',width:140,height:140,flexShrink:0}}>
              <svg width={140} height={140} style={{transform:'rotate(-90deg)'}}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={14}/>
                {demandesStats.map((d,i)=>{
                  const pct=total>0?d.nb/total:0;
                  const color=COLORS[d.statut]||'#94A3B8';
                  const dash=anim?`${pct*circ} ${circ}`:`0 ${circ}`;
                  const rot=-90+(cum/Math.max(total,1))*360;
                  cum+=d.nb;
                  return <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                    stroke={color} strokeWidth={14} strokeLinecap="round"
                    strokeDasharray={dash}
                    style={{transformOrigin:`${cx}px ${cy}px`,transform:`rotate(${rot}deg)`,
                      transition:`stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1) ${i*0.15}s`}}/>;
                })}
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:'1.5rem',color:'#10B981',lineHeight:1}}>{tauxAppro}%</div>
                <div style={{fontSize:'.58rem',color:'#94A3B8',fontWeight:700,marginTop:2,textTransform:'uppercase',letterSpacing:'.05em'}}>approuvées</div>
              </div>
            </div>
          );
        };

        return (
          <div style={{background:'#fff',border:'1.5px solid #f1f5f9',borderRadius:24,padding:28,boxShadow:'0 2px 12px rgba(0,0,0,.04)'}}>
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:22}}>
              <div style={{width:4,height:22,borderRadius:2,background:'linear-gradient(180deg,#4F46E5,#818CF8)'}}/>
              <h3 style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:17,color:'#0F172A',margin:0}}>📚 Analyse des demandes de matières</h3>
              <span style={{fontSize:12,color:'#94a3b8',marginLeft:4}}>{total} demande{total!==1?'s':''} au total</span>
            </div>

            {/* KPIs */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:22}}>
              {[
                {icon:'⏳',label:'En attente', val:enAttente,  color:'#B45309',bg:'#FFFBEB',border:'#FCD34D'},
                {icon:'✅',label:'Approuvées', val:approuvees,  color:'#065F46',bg:'#ECFDF5',border:'#6EE7B7'},
                {icon:'❌',label:'Refusées',   val:refusees,    color:'#991B1B',bg:'#FEF2F2',border:'#FCA5A5'},
              ].map((k,i)=>(
                <div key={i} style={{background:k.bg,border:`1.5px solid ${k.border}`,borderRadius:16,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,
                  transition:'all .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 20px rgba(0,0,0,0.07)`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                  <div style={{width:40,height:40,borderRadius:12,background:'rgba(255,255,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>{k.icon}</div>
                  <div>
                    <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:'1.5rem',color:k.color,lineHeight:1}}>{k.val}</div>
                    <div style={{fontSize:'.68rem',color:k.color,opacity:.7,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',marginTop:2}}>{k.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Donut + barres */}
            <div style={{display:'grid',gridTemplateColumns:'140px 1fr',gap:28,alignItems:'center'}}>
              <DonutDemandes/>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {demandesStats.map((d,i)=>{
                  const color=COLORS[d.statut]||'#94A3B8';
                  return (
                    <div key={i}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:7,fontSize:'.83rem',fontWeight:700,color:'#0F172A'}}>
                          <span style={{width:10,height:10,borderRadius:'50%',background:color,display:'inline-block',flexShrink:0}}/>
                          {ICONS[d.statut]} {LABELS[d.statut]||d.statut}
                        </span>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <span style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:'.95rem',color}}>{d.pct}%</span>
                          <span style={{fontSize:'.72rem',color:'#94A3B8',fontWeight:600}}>{d.nb} demande{d.nb!==1?'s':''}</span>
                        </div>
                      </div>
                      <div style={{height:10,background:'#F1F5F9',borderRadius:6,overflow:'hidden'}}>
                        <div style={{height:'100%',borderRadius:6,background:color,width:`${d.pct}%`,transition:'width 1.3s cubic-bezier(.22,1,.36,1) .3s'}}/>
                      </div>
                    </div>
                  );
                })}
                <div style={{marginTop:4,padding:'11px 16px',background:'#ECFDF5',border:'1.5px solid #6EE7B7',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'.82rem',fontWeight:700,color:'#065F46'}}>🎯 Taux d'approbation global</span>
                  <span style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:'1.05rem',color:'#065F46'}}>{tauxAppro}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ Entonnoir de conversion ═══ */}
      {entonnoir.etudiants_inscrits>0&&(
        <EntonnierBlock entonnoir={entonnoir}/>
      )}
    </div>
  );
}

// Composant séparé pour déclencher les animations après montage
function EntonnierBlock({ entonnoir }) {
  const [animated, setAnimated] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
        <div style={{background:'#fff',border:'1.5px solid #f1f5f9',borderRadius:24,padding:28,boxShadow:'0 2px 12px rgba(0,0,0,.04)'}}>
          <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:6}}>
            <div style={{width:4,height:22,borderRadius:2,background:'linear-gradient(180deg,#f59e0b,#ef4444)'}}/>
            <h3 style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:17,color:'#0F172A',margin:0}}>Entonnoir de conversion</h3>
          </div>
          <div style={{fontSize:13,color:'#94a3b8',paddingLeft:13,marginBottom:24}}>
            De l'inscription à la séance terminée — taux de conversion de la plateforme
          </div>

          {/* Étapes de l'entonnoir */}
          <div style={{display:'flex',gap:0,alignItems:'stretch',marginBottom:24}}>
            {[
              {
                icon:'👥', label:'Étudiants inscrits',
                val: entonnoir.etudiants_inscrits,
                sub: '100% — base totale',
                color:'#6366f1', bg:'#eef2ff', border:'#c7d2fe',
                pct: 100,
              },
              {
                icon:'🎯', label:'Étudiants actifs',
                val: entonnoir.etudiants_actifs,
                sub: `${entonnoir.taux_activation}% ont réservé`,
                color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe',
                pct: entonnoir.taux_activation,
              },
              {
                icon:'📋', label:'Réservations envoyées',
                val: entonnoir.reservations_total,
                sub: `${entonnoir.etudiants_actifs>0?Math.round(entonnoir.reservations_total/entonnoir.etudiants_actifs*10)/10:0} par étudiant actif`,
                color:'#f59e0b', bg:'#fffbeb', border:'#fcd34d',
                pct: null,
              },
              {
                icon:'✅', label:'Confirmées',
                val: entonnoir.reservations_confirmees,
                sub: `${entonnoir.taux_confirmation}% de taux`,
                color:'#10b981', bg:'#ecfdf5', border:'#6ee7b7',
                pct: entonnoir.taux_confirmation,
              },
              {
                icon:'🏁', label:'Terminées',
                val: entonnoir.reservations_terminees,
                sub: `${entonnoir.reservations_confirmees>0?Math.round(entonnoir.reservations_terminees/entonnoir.reservations_confirmees*100):0}% des confirmées`,
                color:'#059669', bg:'#d1fae5', border:'#34d399',
                pct: entonnoir.reservations_confirmees>0?Math.round(entonnoir.reservations_terminees/entonnoir.reservations_confirmees*100):0,
              },
            ].map((step,i,arr)=>(
              <React.Fragment key={i}>
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                  {/* Carte étape */}
                  <div style={{
                    width:'100%',padding:'16px 12px',borderRadius:16,textAlign:'center',
                    background:step.bg,border:`1.5px solid ${step.border}`,
                    position:'relative',overflow:'hidden'
                  }}>
                    {/* Barre de progression en fond */}
                    {step.pct!==null&&(
                      <div style={{
                        position:'absolute',bottom:0,left:0,right:0,
                        height:animated?`${step.pct}%`:'0%',
                        background:`${step.color}12`,
                        transition:'height 1.2s cubic-bezier(.22,1,.36,1)',
                        maxHeight:'100%'
                      }}/>
                    )}
                    <div style={{position:'relative',zIndex:1}}>
                      <div style={{fontSize:22,marginBottom:6}}>{step.icon}</div>
                      <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:28,color:step.color,lineHeight:1,marginBottom:4}}>{step.val}</div>
                      <div style={{fontSize:11,fontWeight:700,color:step.color,marginBottom:4}}>{step.label}</div>
                      <div style={{fontSize:10,color:step.color,opacity:.65,fontStyle:'italic'}}>{step.sub}</div>
                    </div>
                  </div>
                </div>
                {/* Flèche entre étapes */}
                {i<arr.length-1&&(
                  <div style={{display:'flex',alignItems:'center',padding:'0 4px',flexShrink:0,paddingBottom:8}}>
                    <div style={{fontSize:18,color:'#cbd5e1'}}>›</div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Barre de santé globale */}
          <div style={{background:'#f8fafc',borderRadius:16,padding:'16px 20px',border:'1.5px solid #f1f5f9'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:13,color:'#0F172A'}}>Santé globale de la plateforme</span>
              <span style={{
                fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:14,
                color: entonnoir.taux_confirmation>=60?'#059669':entonnoir.taux_confirmation>=30?'#d97706':'#dc2626'
              }}>
                {entonnoir.taux_confirmation>=60?'🟢 Bonne':entonnoir.taux_confirmation>=30?'🟡 Moyenne':'🔴 À améliorer'}
              </span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
              {[
                {
                  label:'Taux d\'activation',
                  val:`${entonnoir.taux_activation}%`,
                  sub:'\u00c9tudiants qui r\u00e9servent',
                  good:entonnoir.taux_activation>=30,
                  color:'#6366f1'
                },
                {
                  label:'Taux de confirmation',
                  val:`${entonnoir.taux_confirmation}%`,
                  sub:'Réservations acceptées',
                  good:entonnoir.taux_confirmation>=60,
                  color:'#10b981'
                },
                {
                  label:'Taux de refus',
                  val:`${entonnoir.taux_refus}%`,
                  sub:'Réservations refusées',
                  good:entonnoir.taux_refus<=20,
                  color:'#ef4444'
                },
              ].map((m,i)=>(
                <div key={i} style={{background:'#fff',borderRadius:12,padding:'12px 14px',border:'1.5px solid #f1f5f9'}}>
                  <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:4}}>{m.label}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:20,color:m.color}}>{m.val}</span>
                    <span style={{fontSize:14}}>{m.good?'✅':'⚠️'}</span>
                  </div>
                  <div style={{height:6,background:'#f1f5f9',borderRadius:3,overflow:'hidden',marginTop:6}}>
                    <div style={{height:'100%',background:m.color,borderRadius:3,width:animated?m.val:'0%',transition:'width 1.4s cubic-bezier(.22,1,.36,1)'}}/>
                  </div>
                  <div style={{fontSize:10,color:'#94a3b8',marginTop:4,fontStyle:'italic'}}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
  );
}


function ProfsTab({ allProfs, structure=[], onView, onValider, onRefuser }) {
  const [filter,setFilter]       = useState('tous');
  const [search,setSearch]       = useState('');
  const [viewMode,setViewMode]   = useState('grid');
  const [filterDomaine,setFilterDomaine] = useState('');
  const [filterNiveau,setFilterNiveau]   = useState('');
  const [filterMatiere,setFilterMatiere] = useState('');

  const counts = useMemo(()=>({
    tous:      allProfs.length,
    'validé':  allProfs.filter(p=>p.statut_validation==='validé').length,
    en_attente:allProfs.filter(p=>p.statut_validation==='en_attente').length,
    'refusé':  allProfs.filter(p=>p.statut_validation==='refusé').length,
  }),[allProfs]);

  const referentiel = structure; // Utilise le référentiel déjà chargé par le parent

  const allDomaines = useMemo(()=>{
    if(referentiel.length>0) return referentiel.map(d=>d.nom);
    const s=new Set();
    allProfs.forEach(p=>p.tarifs_matieres?.forEach(t=>{if(t.nom_domaine&&t.nom_domaine!=='N/A')s.add(t.nom_domaine);}));
    return [...s].sort();
  },[referentiel,allProfs]);

  const allNiveaux = useMemo(()=>{
    if(referentiel.length>0){
      const dom=referentiel.find(d=>d.nom===filterDomaine);
      if(filterDomaine&&dom) return (dom.niveaux||[]).map(n=>n.nom);
      return referentiel.flatMap(d=>(d.niveaux||[]).map(n=>n.nom));
    }
    const s=new Set();
    allProfs.forEach(p=>p.tarifs_matieres?.forEach(t=>{
      if(t.nom_niveau&&t.nom_niveau!=='N/A'&&(!filterDomaine||t.nom_domaine===filterDomaine))s.add(t.nom_niveau);
    }));
    return [...s].sort();
  },[referentiel,allProfs,filterDomaine]);

  const allMatieres = useMemo(()=>{
    if(referentiel.length>0){
      const domaines=filterDomaine?referentiel.filter(d=>d.nom===filterDomaine):referentiel;
      const s=new Set();
      domaines.forEach(d=>(d.niveaux||[]).forEach(n=>{
        if(!filterNiveau||n.nom===filterNiveau)(n.matieres||[]).forEach(m=>s.add(m.nom));
      }));
      return [...s].sort();
    }
    const s=new Set();
    allProfs.forEach(p=>p.tarifs_matieres?.forEach(t=>{
      if(!filterDomaine||t.nom_domaine===filterDomaine)s.add(t.nom_matiere);
    }));
    return [...s].sort();
  },[referentiel,allProfs,filterDomaine,filterNiveau]);


  const filtered = useMemo(()=>allProfs.filter(p=>{
    const nm=`${p.user_prenom||''} ${p.user_nom||''}`.toLowerCase();
    if(filter!=='tous' && p.statut_validation!==filter) return false;
    if(search && !nm.includes(search.toLowerCase()) && !(p.ville||'').toLowerCase().includes(search.toLowerCase())) return false;
    if(filterDomaine && !p.tarifs_matieres?.some(t=>t.nom_domaine===filterDomaine)) return false;
    if(filterNiveau  && !p.tarifs_matieres?.some(t=>t.nom_niveau===filterNiveau))   return false;
    if(filterMatiere && !p.tarifs_matieres?.some(t=>t.nom_matiere===filterMatiere)) return false;
    return true;
  }),[allProfs,filter,search,filterDomaine,filterNiveau,filterMatiere]);
  const pending=allProfs.filter(p=>p.statut_validation==='en_attente');
  const FILTERS=[{k:'tous',l:'Tous',c:'#0F172A'},{k:'validé',l:'Validés',c:'#10b981'},{k:'en_attente',l:'En attente',c:'#f59e0b'},{k:'refusé',l:'Refusés',c:'#ef4444'}];
  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      {pending.length>0&&(
        <div className="adm-card" style={{padding:'18px 20px',borderColor:'#fcd34d',background:'#fffbeb'}}>
          <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:13,color:'#b45309',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
            <span style={{background:'#fef3c7',padding:'2px 8px',borderRadius:6,fontSize:11}}>! ACTION REQUISE</span>
            {pending.length} professeur{pending.length>1?'s':''} en attente
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {pending.map(p=>{const nm=`${p.user_prenom||''} ${p.user_nom||''}`.trim();const mts=p.tarifs_matieres?[...new Set(p.tarifs_matieres.map(t=>t.nom_matiere))].slice(0,2):[];return<div key={p.id} className="adm-pending-row"><ProfAvatar prof={p} size={38}/><div style={{flex:1,minWidth:0}}><div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:700,fontSize:13,color:'#0F172A'}}>{nm}</div><div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>{p.ville&&`${p.ville} / `}{mts.join(', ')||'Matieres non renseignees'}</div></div><div style={{display:'flex',gap:6}}><button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={()=>onView(p)}>Voir</button><button className="adm-btn adm-btn-success adm-btn-sm" onClick={()=>onValider(p.id)}>Valider</button><button className="adm-btn adm-btn-danger adm-btn-sm" onClick={()=>onRefuser(p.id)}>X</button></div></div>;})}
          </div>
        </div>
      )}
      <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div className="adm-search-wrap" style={{flex:1,minWidth:220}}><span className="adm-search-icon">?</span><input className="adm-input" placeholder="Rechercher par nom ou ville..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {FILTERS.map(f=><button key={f.k} onClick={()=>setFilter(f.k)} style={{padding:'7px 14px',borderRadius:22,border:`1.5px solid ${filter===f.k?f.c:'#e2e8f0'}`,background:filter===f.k?`${f.c}14`:'#fff',color:filter===f.k?f.c:'#64748b',fontSize:12,fontWeight:filter===f.k?700:500,cursor:'pointer',display:'flex',alignItems:'center',gap:6,transition:'all .15s'}}>{f.l}<span style={{fontSize:10,fontWeight:800,background:filter===f.k?`${f.c}20`:'#f8fafc',color:filter===f.k?f.c:'#94a3b8',padding:'1px 6px',borderRadius:8,minWidth:18,textAlign:'center'}}>{counts[f.k]||0}</span></button>)}
        </div>
        <div style={{display:'flex',gap:4}}>{[['grid','G'],['list','L']].map(([v,i])=><button key={v} onClick={()=>setViewMode(v)} style={{width:34,height:34,borderRadius:9,border:'1.5px solid #e2e8f0',background:viewMode===v?'#3b82f6':'#fff',color:viewMode===v?'#fff':'#94a3b8',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>{i}</button>)}</div>
        <span style={{fontSize:12,color:'#94a3b8',fontWeight:500}}><strong style={{color:'#0F172A'}}>{filtered.length}</strong> resultat{filtered.length>1?'s':''}</span>
        <button
          onClick={()=>exportAdminProfs(filtered)}
          style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#00153D',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:800,fontSize:'.78rem',boxShadow:'0 3px 10px rgba(0,21,61,0.18)',transition:'all .15s',whiteSpace:'nowrap'}}
          onMouseEnter={e=>{e.currentTarget.style.background='#1E3A8A';}}
          onMouseLeave={e=>{e.currentTarget.style.background='#00153D';}}>
          📄 PDF
        </button>
      </div>
      {/* Filtres domaine / niveau / matière */}
      <div style={{display:'flex',gap:10,flexWrap:'wrap',padding:'14px 18px',background:'#f8fafc',borderRadius:16,border:'1.5px solid #f1f5f9'}}>
        {[
          {label:'🗂 Domaine', val:filterDomaine, set:(v)=>{setFilterDomaine(v);setFilterNiveau('');setFilterMatiere('');}, opts:allDomaines, ph:'Tous les domaines'},
          {label:'🎓 Niveau',  val:filterNiveau,  set:(v)=>{setFilterNiveau(v);setFilterMatiere('');},  opts:allNiveaux,  ph:'Tous les niveaux'},
          {label:'📚 Matière', val:filterMatiere, set:setFilterMatiere, opts:allMatieres, ph:'Toutes les matières'},
        ].map(f=>(
          <div key={f.label} style={{display:'flex',flexDirection:'column',gap:4,minWidth:160}}>
            <span style={{fontSize:10,fontWeight:800,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.08em'}}>{f.label}</span>
            <div style={{position:'relative'}}>
              <select value={f.val} onChange={e=>f.set(e.target.value)}
                style={{background:'#fff',border:`1.5px solid ${f.val?'#3b82f6':'#e2e8f0'}`,borderRadius:10,color:'#0F172A',padding:'8px 28px 8px 12px',fontSize:12,fontWeight:600,outline:'none',cursor:'pointer',appearance:'none',WebkitAppearance:'none',width:'100%',transition:'border-color .15s'}}>
                <option value="">{f.ph}</option>
                {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <span style={{position:'absolute',right:9,top:'50%',transform:'translateY(-50%)',fontSize:10,color:'#94a3b8',pointerEvents:'none'}}>▾</span>
            </div>
          </div>
        ))}
        {(filterDomaine||filterNiveau||filterMatiere)&&(
          <div style={{display:'flex',alignItems:'flex-end'}}>
            <button onClick={()=>{setFilterDomaine('');setFilterNiveau('');setFilterMatiere('');}}
              style={{padding:'8px 14px',background:'#fef2f2',color:'#dc2626',border:'1.5px solid #fca5a5',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:12,display:'flex',alignItems:'center',gap:5}}>
              ✕ Réinitialiser
            </button>
          </div>
        )}
      </div>
      <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
      </div>
      {filtered.length===0?<EmptyState icon="?" title="Aucun formateur trouve" sub="Modifiez vos criteres"/>
      :viewMode==='grid'?<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>{filtered.map((p,i)=><ProfCardGrid key={p.id} prof={p} index={i} onView={onView} onValider={onValider} onRefuser={onRefuser}/>)}</div>
      :<div className="adm-card" style={{overflow:'hidden'}}><table className="adm-table"><thead><tr><th>Formateur</th><th>Matieres</th><th>Ville</th><th>Mode</th><th>Note</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{filtered.map(p=>{const nm=`${p.user_prenom||''} ${p.user_nom||''}`.trim();const mts=p.tarifs_matieres?[...new Set(p.tarifs_matieres.map(t=>t.nom_matiere))].slice(0,2):[];const note=parseFloat(p.note_moyenne||0);return<tr key={p.id}><td><div style={{display:'flex',alignItems:'center',gap:10}}><ProfAvatar prof={p} size={34}/><div><div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:700,fontSize:13,color:'#0F172A'}}>{nm}</div><div style={{fontSize:11,color:'#94a3b8'}}>{p.email}</div></div></div></td><td><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{mts.map(m=><span key={m} className="adm-badge adm-badge-blue" style={{fontSize:10}}>{m}</span>)}{mts.length===0&&<span style={{fontSize:12,color:'#94a3b8',fontStyle:'italic'}}>-</span>}</div></td><td style={{fontSize:12,color:'#64748b'}}>{p.ville||'-'}</td><td><ModeBadge m={p.mode_enseignement}/></td><td style={{fontSize:13,fontWeight:700}}>{note>0?`* ${note.toFixed(1)}`:'-'}</td><td><StatutBadge s={p.statut_validation}/></td><td><div style={{display:'flex',gap:5}}><button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={()=>onView(p)}>Voir</button>{p.statut_validation==='en_attente'&&<><button className="adm-btn adm-btn-success adm-btn-sm" onClick={()=>onValider(p.id)}>v</button><button className="adm-btn adm-btn-danger adm-btn-sm" onClick={()=>onRefuser(p.id)}>x</button></>}</div></td></tr>;})}</tbody></table></div>}
    </div>
  );
}

function ProfCardGrid({ prof, index, onView, onValider, onRefuser }) {
  const nm=`${prof.user_prenom||''} ${prof.user_nom||''}`.trim()||'Formateur';
  const mats=prof.tarifs_matieres?[...new Set(prof.tarifs_matieres.map(t=>t.nom_matiere))].slice(0,3):[];
  const tarifMin=[prof.tarif_en_ligne,prof.tarif_presentiel].filter(v=>isTarif(v)).map(Number);
  const minT=tarifMin.length?Math.min(...tarifMin):null;
  const note=parseFloat(prof.note_moyenne||0);
  return(
    <div className="adm-prof-card adm-scaleIn" style={{animationDelay:`${index*50}ms`}} onClick={()=>onView(prof)}>
      <div style={{height:80,background:'linear-gradient(135deg,#1e40af,#3b82f6,#60a5fa)',borderRadius:'20px 20px 0 0',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:8,right:10}}><StatutBadge s={prof.statut_validation}/></div>
        {minT&&<div style={{position:'absolute',bottom:7,left:10,fontSize:10,fontWeight:700,color:'rgba(255,255,255,.85)',background:'rgba(255,255,255,.12)',padding:'2px 8px',borderRadius:6}}>des {minT} DT/h</div>}
      </div>
      <div style={{marginTop:-36,padding:'0 16px'}}>
        <div style={{width:68,height:68,borderRadius:18,background:'#fff',border:'3px solid #fff',boxShadow:'0 4px 12px rgba(0,0,0,.12)',overflow:'hidden',flexShrink:0}}>
          <ProfAvatar prof={prof} size={62}/>
        </div>
      </div>
      <div style={{padding:'8px 16px 16px'}}>
        <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:14,color:'#0F172A',marginBottom:5}}>{nm}</div>
        <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:10,flexWrap:'wrap'}}>{prof.ville&&<span style={{fontSize:11,color:'#94a3b8'}}>{prof.ville}</span>}<ModeBadge m={prof.mode_enseignement}/></div>
        {mats.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:6}}>{mats.map(m=><span key={m} style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:12,background:'#eff6ff',color:'#1d4ed8',border:'1px solid #bfdbfe'}}>{m}</span>)}</div>}
        {(()=>{
          const niveaux=[...new Set((prof.tarifs_matieres||[]).map(t=>t.nom_niveau).filter(Boolean))].slice(0,3);
          return niveaux.length>0?(
            <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
              {niveaux.map(n=><span key={n} style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:12,background:'#fff7ed',color:'#c2410c',border:'1px solid #fed7aa'}}>🎓 {n}</span>)}
            </div>
          ):null;
        })()}
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12,fontSize:12}}><span style={{color:'#f59e0b'}}>*</span><span style={{fontWeight:700,color:'#0F172A'}}>{note>0?note.toFixed(1):'-'}</span><span style={{color:'#94a3b8'}}>{prof.nb_avis} avis</span></div>
        <div style={{borderTop:'1px solid #f1f5f9',paddingTop:12,display:'flex',gap:6}}>
          <button className="adm-btn adm-btn-primary adm-btn-sm" style={{flex:1,justifyContent:'center'}} onClick={e=>{e.stopPropagation();onView(prof);}}>Voir profil</button>
          {prof.statut_validation==='en_attente'&&<><button className="adm-btn adm-btn-success adm-btn-sm" onClick={e=>{e.stopPropagation();onValider(prof.id);}}>v</button><button className="adm-btn adm-btn-danger adm-btn-sm" onClick={e=>{e.stopPropagation();onRefuser(prof.id);}}>x</button></>}
        </div>
      </div>
    </div>
  );
}

function DemandesTab({ demandes, onApprouver, onRefuser }) {
  const pending=demandes.filter(d=>d.statut==='en_attente');
  const archived=demandes.filter(d=>d.statut!=='en_attente');
  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {[
          {label:'En attente', count:pending.length,                                      color:'#B45309',bg:'#FFFBEB',border:'#FCD34D',icon:'⏳',shadow:'rgba(245,158,11,0.2)'},
          {label:'Approuvées', count:demandes.filter(d=>d.statut==='approuvé').length,    color:'#065F46',bg:'#ECFDF5',border:'#6EE7B7',icon:'✅',shadow:'rgba(16,185,129,0.2)'},
          {label:'Refusées',   count:demandes.filter(d=>d.statut==='refusé').length,      color:'#991B1B',bg:'#FEF2F2',border:'#FCA5A5',icon:'❌',shadow:'rgba(239,68,68,0.2)'},
        ].map((s,i)=>(
          <div key={s.label} style={{
            background:s.bg, border:`1.5px solid ${s.border}`,
            borderRadius:20, padding:'22px 24px',
            display:'flex', alignItems:'center', gap:16,
            boxShadow:`0 2px 12px ${s.shadow}`,
            transition:'all .22s cubic-bezier(.22,1,.36,1)',
            animationDelay:`${i*60}ms`, animation:'adm-scaleIn .45s cubic-bezier(.22,1,.36,1) both',
            cursor:'default'
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=`0 12px 32px ${s.shadow}`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=`0 2px 12px ${s.shadow}`;}}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(255,255,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',flexShrink:0,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>{s.icon}</div>
            <div>
              <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontSize:'2.2rem',fontWeight:900,color:s.color,lineHeight:1,marginBottom:4}}>{s.count}</div>
              <div style={{fontSize:'.72rem',color:s.color,opacity:.7,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em'}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      {pending.length>0?(
        <div className="adm-card" style={{padding:22}}>
          <SectionTitle title="Demandes en attente" sub="A traiter en priorite"/>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {pending.map(d=>(
                <div key={d.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',background:'#fffbeb',border:'1.5px solid #fcd34d',borderRadius:16,transition:'all .2s',cursor:'default'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='#fef3c7';e.currentTarget.style.transform='translateX(3px)';e.currentTarget.style.boxShadow='0 4px 16px rgba(245,158,11,0.15)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#fffbeb';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:42,height:42,borderRadius:12,background:'#FEF3C7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>📚</div>
                    <div>
                      <div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:14,color:'#0F172A',marginBottom:4}}>{d.nom_matiere}</div>
                      <div style={{display:'flex',gap:12,fontSize:12,color:'#94a3b8',alignItems:'center',flexWrap:'wrap'}}>
                        <span style={{background:'#FEF3C7',color:'#B45309',padding:'2px 8px',borderRadius:8,fontWeight:700,fontSize:11}}>🎓 {d.nom_niveau}</span>
                        <span>👨‍🏫 {d.prof_nom}</span>
                        <span>📅 {new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,flexShrink:0}}>
                    <button
                      onClick={()=>onApprouver(d.id)}
                      style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',background:'#10B981',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:800,fontSize:13,boxShadow:'0 3px 10px rgba(16,185,129,0.25)',transition:'all .18s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='#059669';e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 6px 18px rgba(16,185,129,0.35)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='#10B981';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 3px 10px rgba(16,185,129,0.25)';}}>
                      ✅ Approuver
                    </button>
                    <button
                      onClick={()=>onRefuser(d.id)}
                      style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',background:'#FEF2F2',color:'#DC2626',border:'1.5px solid #FCA5A5',borderRadius:10,cursor:'pointer',fontFamily:"'Cabinet Grotesk',sans-serif",fontWeight:800,fontSize:13,transition:'all .18s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='#FEE2E2';e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 4px 12px rgba(220,38,38,0.15)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='#FEF2F2';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                      ❌ Refuser
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ):<div className="adm-card" style={{padding:32,textAlign:'center'}}><EmptyState icon="v" title="Aucune demande en attente" sub="Toutes les demandes ont ete traitees"/></div>}
      {archived.length>0&&<div className="adm-card" style={{overflow:'hidden'}}><div style={{padding:'18px 20px 4px'}}><SectionTitle title="Historique" sub={`${archived.length} demande${archived.length>1?'s':''} traitees`}/></div><table className="adm-table"><thead><tr><th>Matiere</th><th>Niveau</th><th>Professeur</th><th>Date</th><th>Statut</th></tr></thead><tbody>{archived.map(d=><tr key={d.id}><td style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:700}}>{d.nom_matiere}</td><td style={{fontSize:12,color:'#64748b'}}>{d.nom_niveau}</td><td style={{fontSize:13}}>{d.prof_nom}</td><td style={{fontSize:12,color:'#94a3b8'}}>{new Date(d.created_at).toLocaleDateString('fr-FR')}</td><td><StatutBadge s={d.statut}/></td></tr>)}</tbody></table></div>}
    </div>
  );
}

function ReferentielTab({ structure, villes, onReload }) {
  const [expanded,setExpanded]=useState({});
  const [modal,setModal]=useState(null);
  const [formVal,setFormVal]=useState('');
  const [saving,setSaving]=useState(false);
  const [delConf,setDelConf]=useState(null);
  const [search,setSearch]=useState('');
  const totalMats=structure.reduce((s,d)=>s+(d.niveaux?.reduce((s2,n)=>s2+(n.matieres?.length||0),0)||0),0);
  const totalNivs=structure.reduce((s,d)=>s+(d.niveaux?.length||0),0);
  const domCols=[{accent:'#3b82f6',bg:'rgba(59,130,246,.05)',border:'rgba(59,130,246,.2)',light:'rgba(59,130,246,.08)'},{accent:'#10b981',bg:'rgba(16,185,129,.05)',border:'rgba(16,185,129,.2)',light:'rgba(16,185,129,.1)'},{accent:'#8b5cf6',bg:'rgba(139,92,246,.05)',border:'rgba(139,92,246,.2)',light:'rgba(139,92,246,.1)'},{accent:'#f59e0b',bg:'rgba(245,158,11,.05)',border:'rgba(245,158,11,.2)',light:'rgba(245,158,11,.1)'},{accent:'#ef4444',bg:'rgba(239,68,68,.05)',border:'rgba(239,68,68,.2)',light:'rgba(239,68,68,.1)'}];
  const filteredStruct=useMemo(()=>{if(!search)return structure;const q=search.toLowerCase();return structure.map(d=>({...d,niveaux:d.niveaux?.map(n=>({...n,matieres:n.matieres?.filter(m=>m.nom.toLowerCase().includes(q))||[]})).filter(n=>n.matieres.length>0||n.nom.toLowerCase().includes(q))})).filter(d=>d.niveaux?.length>0||d.nom.toLowerCase().includes(q));},[structure,search]);
  const openModal=(type,payload={})=>{setFormVal('');setModal({type,payload});};
  const handleSave=async()=>{if(!formVal.trim())return;setSaving(true);try{const{type,payload}=modal;if(type==='ville')await api.post('/api/admin/referentiel/villes',{nom:formVal.trim()});if(type==='domaine')await api.post('/api/admin/referentiel/domaines',{nom:formVal.trim()});if(type==='niveau')await api.post('/api/admin/referentiel/niveaux',{nom:formVal.trim(),domaine_id:payload.domaineId});if(type==='matiere')await api.post('/api/admin/referentiel/matieres',{nom:formVal.trim(),niveau_id:payload.niveauId});setModal(null);onReload();}catch(e){alert(e.response?.data?.detail||'Erreur');}finally{setSaving(false);}};
  const handleDelete=async()=>{if(!delConf)return;try{if(delConf.type==='matiere')await api.delete(`/api/admin/referentiel/matieres/${delConf.id}`);if(delConf.type==='ville')await api.delete(`/api/admin/referentiel/villes/${delConf.id}`);if(delConf.type==='niveau')await api.delete(`/api/admin/referentiel/niveaux/${delConf.id}`);if(delConf.type==='domaine')await api.delete(`/api/admin/referentiel/domaines/${delConf.id}`);setDelConf(null);onReload();}catch(e){alert(e.response?.data?.detail||'Erreur suppression');}};
  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[{icon:'V',val:villes.length,label:'Villes',color:'#3b82f6'},{icon:'D',val:structure.length,label:'Domaines',color:'#8b5cf6'},{icon:'N',val:totalNivs,label:'Niveaux',color:'#f59e0b'},{icon:'M',val:totalMats,label:'Matieres',color:'#10b981'}].map((s,i)=><div key={s.label} className="adm-stat adm-scaleIn" style={{animationDelay:`${i*40}ms`}}><div className="adm-stat-accent" style={{background:s.color}}/><div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontSize:28,fontWeight:900,color:s.color,marginBottom:5,lineHeight:1}}>{s.val}</div><div style={{fontSize:12,color:'#94a3b8'}}>{s.icon} {s.label}</div></div>)}
      </div>
      <div className="adm-card" style={{padding:'18px 20px'}}>
        <SectionTitle title="Villes actives" sub={`${villes.length} configuree${villes.length>1?'s':''}`} action={<button className="adm-btn adm-btn-primary adm-btn-sm" onClick={()=>openModal('ville')}>+ Ajouter</button>}/>
        <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
          {villes.map(v=><div key={v.id} className="adm-chip" style={{color:'#1d4ed8',borderColor:'#bfdbfe'}}>P {v.nom}<span onClick={()=>setDelConf({type:'ville',id:v.id,nom:v.nom})} style={{width:14,height:14,borderRadius:'50%',background:'#fef2f2',border:'1px solid #fca5a5',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:9,color:'#dc2626',fontWeight:800,flexShrink:0}}>x</span></div>)}
          {villes.length===0&&<span style={{fontSize:13,color:'#94a3b8',fontStyle:'italic'}}>Aucune ville configuree</span>}
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
        <div className="adm-section-title" style={{marginBottom:0}}><div className="adm-section-title-bar"/><h3>Structure pedagogique</h3></div>
        <div style={{display:'flex',gap:8}}><div className="adm-search-wrap" style={{width:220}}><span className="adm-search-icon">?</span><input className="adm-input" style={{fontSize:12,padding:'7px 12px 7px 30px'}} placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="adm-btn adm-btn-primary adm-btn-sm" onClick={()=>openModal('domaine')}>+ Domaine</button></div>
      </div>
      {filteredStruct.map((dom,di)=>{
        const col=domCols[di%domCols.length];
        const open=expanded[dom.id]!==false;
        const nbM=dom.niveaux?.reduce((s,n)=>s+(n.matieres?.length||0),0)||0;
        return(
          <div key={dom.id} className="adm-dom" style={{borderColor:col.border}}>
            <div className={`adm-dom-header${open?' open':''}`} style={{background:open?col.bg:'#fff'}} onClick={()=>setExpanded(p=>({...p,[dom.id]:!open}))}>
              <div style={{width:36,height:36,borderRadius:10,background:col.light,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:16}}>D</div>
              <div style={{flex:1}}><div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:800,fontSize:14,color:col.accent}}>{dom.nom}</div><div style={{fontSize:11,color:'#94a3b8',marginTop:1}}>{dom.niveaux?.length||0} niveau{(dom.niveaux?.length||0)>1?'x':''} / {nbM} matiere{nbM>1?'s':''}</div></div>
              <div style={{display:'flex',gap:7}} onClick={e=>e.stopPropagation()}>
                <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{borderColor:col.border,color:col.accent,background:col.light}} onClick={()=>openModal('niveau',{domaineId:dom.id,domaineName:dom.nom})}>+ Niveau</button>
                <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={()=>setDelConf({type:'domaine',id:dom.id,nom:dom.nom})}>X</button>
              </div>
              <span style={{color:col.accent,fontSize:12,transition:'transform .2s',transform:open?'rotate(0)':'rotate(-90deg)',display:'inline-block',marginLeft:4}}>v</span>
            </div>
            {open&&(
              <div className="adm-dom-body" style={{background:`${col.bg}`}}>
                {(!dom.niveaux||dom.niveaux.length===0)&&<div style={{textAlign:'center',padding:16,color:'#94a3b8',fontSize:13,fontStyle:'italic'}}>Aucun niveau -- <span style={{color:col.accent,cursor:'pointer',fontWeight:600}} onClick={()=>openModal('niveau',{domaineId:dom.id,domaineName:dom.nom})}>Ajouter</span></div>}
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {dom.niveaux?.map(niv=>(
                    <div key={niv.id} className="adm-niveau-block">
                      <div className="adm-niveau-header">
                        <div style={{display:'flex',alignItems:'center',gap:9}}><span>N</span><span style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:700,fontSize:13,color:'#0F172A'}}>{niv.nom}</span><span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:12,background:col.light,color:col.accent,border:`1px solid ${col.border}`}}>{niv.matieres?.length||0}</span></div>
                        <div style={{display:'flex',gap:6}}><button className="adm-btn adm-btn-ghost adm-btn-sm" style={{borderColor:col.border,color:col.accent,background:col.light}} onClick={()=>openModal('matiere',{niveauId:niv.id,niveauName:niv.nom,domaineName:dom.nom})}>+ Matiere</button><button className="adm-btn adm-btn-danger adm-btn-sm" onClick={()=>setDelConf({type:'niveau',id:niv.id,nom:niv.nom})}>X</button></div>
                      </div>
                      <div className="adm-niveau-body">
                        {!niv.matieres?.length?<span style={{fontSize:12,color:'#94a3b8',fontStyle:'italic'}}>Aucune matiere</span>:(
                          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                            {niv.matieres.map(m=><div key={m.id} className="adm-chip" style={{color:col.accent,borderColor:col.border}}><span style={{width:6,height:6,borderRadius:'50%',background:col.accent,flexShrink:0}}/>{m.nom}<span onClick={()=>setDelConf({type:'matiere',id:m.id,nom:m.nom})} style={{width:14,height:14,borderRadius:'50%',background:'#fef2f2',border:'1px solid #fca5a5',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:9,color:'#dc2626',fontWeight:800,flexShrink:0}}>x</span></div>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {modal&&(
        <div className="adm-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
          <div className="adm-modal">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}><h3 style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:16,color:'#0F172A',margin:0}}>{modal.type==='ville'?'Nouvelle ville':modal.type==='domaine'?'Nouveau domaine':modal.type==='niveau'?'Nouveau niveau':'Nouvelle matiere'}</h3><button className="adm-btn adm-btn-ghost adm-btn-sm" style={{width:30,height:30,padding:0,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setModal(null)}>x</button></div>
            {(modal.payload?.domaineName||modal.payload?.niveauName)&&<div style={{fontSize:12,color:'#64748b',marginBottom:14,padding:'7px 12px',background:'#f8fafc',borderRadius:10,border:'1px solid #e2e8f0'}}>{modal.type==='niveau'&&`D ${modal.payload.domaineName}`}{modal.type==='matiere'&&`N ${modal.payload.niveauName} -- ${modal.payload.domaineName}`}</div>}
            <input autoFocus className="adm-input" style={{marginBottom:16}} placeholder={modal.type==='ville'?'Ex: Zaghouan...':modal.type==='domaine'?'Ex: Arts...':modal.type==='niveau'?'Ex: BTS...':'Ex: Algorithmes...'} value={formVal} onChange={e=>setFormVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSave()}/>
            <div style={{display:'flex',gap:9}}>
              <button className="adm-btn adm-btn-primary" style={{flex:2,justifyContent:'center',opacity:(!formVal.trim()||saving)?0.6:1}} disabled={!formVal.trim()||saving} onClick={handleSave}>{saving?'Enregistrement...':'Enregistrer'}</button>
              <button className="adm-btn adm-btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={()=>setModal(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      {delConf&&(
        <div className="adm-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setDelConf(null);}}>
          <div className="adm-modal" style={{textAlign:'center',maxWidth:360,borderColor:'#fca5a5'}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'#fef2f2',border:'1px solid #fca5a5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,margin:'0 auto 16px'}}>X</div>
            <h3 style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:16,color:'#0F172A',margin:'0 0 8px'}}>Confirmer la suppression</h3>
            <p style={{fontSize:13,color:'#64748b',margin:'0 0 20px',lineHeight:1.6}}>Supprimer <strong>"{delConf.nom}"</strong> ?<br/><span style={{color:'#ef4444',fontSize:12}}>Cette action est irreversible.</span></p>
            <div style={{display:'flex',gap:9}}><button className="adm-btn adm-btn-danger" style={{flex:1,justifyContent:'center'}} onClick={handleDelete}>Supprimer</button><button className="adm-btn adm-btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={()=>setDelConf(null)}>Annuler</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [{k:'overview',l:"Vue d'ensemble"},{k:'analytiques',l:'Analytiques'},{k:'profs',l:'Formateurs'},{k:'demandes',l:'Demandes'},{k:'referentiel',l:'Referentiel'},{k:'finances',l:'💳 Finances'}];

export default function Admin() {
  const [tab,setTab]=useState('overview');
  const [stats,setStats]=useState({});
  const [allProfs,setAllProfs]=useState([]);
  const [structure,setStructure]=useState([]);
  const [villes,setVilles]=useState([]);
  const [demandes,setDemandes]=useState([]);
  const [chartData,setChartData]=useState({});
  const [loading,setLoading]=useState(true);
  const [selectedProf,setSelectedProf]=useState(null);
  useEffect(()=>{injectCSS();loadAll();},[]);
  const loadAll=async()=>{
    setLoading(true);
    const safe = (promise, fallback) => promise.catch(err => {
      const status = err?.response?.status;
      console.warn('[Admin] API error:', status, err?.config?.url);
      // 401 = token expiré → recharger la page pour re-login
      if (status === 401) { window.location.reload(); }
      return { data: fallback };
    });
    try{
      const[s,allP,struct,v,dem,cd]=await Promise.all([
        safe(api.get('/api/admin/stats'),             {}),
        safe(api.get('/api/admin/professeurs/all'),   []),
        safe(api.get('/api/admin/referentiel/structure'), []),
        safe(api.get('/api/admin/referentiel/villes'), []),
        safe(api.get('/api/admin/demandes-matieres'), []),
        safe(api.get('/api/admin/stats/charts'),      {}),
      ]);
      setStats(s.data||{});
      setAllProfs(Array.isArray(allP.data)?allP.data:[]);
      setStructure(Array.isArray(struct.data)?struct.data:[]);
      setVilles(Array.isArray(v.data)?v.data:[]);
      setDemandes(Array.isArray(dem.data)?dem.data:[]);
      setChartData(cd.data||{});
    }catch(e){console.error('loadAll fatal error:',e);}finally{setLoading(false);}
  };
  const handleValider=async(id)=>{await api.put(`/api/admin/professeurs/${id}/valider`);alert('Professeur valide');loadAll();};
  const handleRefuser=async(id)=>{if(!window.confirm('Refuser ce professeur ?'))return;await api.put(`/api/admin/professeurs/${id}/refuser`);loadAll();};
  const handleApprouverDemande=async(id)=>{try{await api.put(`/api/admin/demandes-matieres/${id}/approuver`);loadAll();}catch(e){alert(e.response?.data?.detail||e.message);}};
  const handleRefuserDemande=async(id)=>{if(!window.confirm('Refuser ?'))return;try{await api.put(`/api/admin/demandes-matieres/${id}/refuser`);loadAll();}catch(e){alert(e.response?.data?.detail||e.message);}};
  const counts=useMemo(()=>({tous:allProfs.length,'validé':allProfs.filter(p=>p.statut_validation==='validé').length,en_attente:allProfs.filter(p=>p.statut_validation==='en_attente').length,'refusé':allProfs.filter(p=>p.statut_validation==='refusé').length}),[allProfs]);
  const demandesPending=demandes.filter(d=>d.statut==='en_attente').length;
  const STAT_CARDS=[{icon:'U',val:stats.total_users||0,label:'Utilisateurs',color:'#3b82f6',delay:0},{icon:'v',val:counts['validé']||0,label:'Profs valides',color:'#10b981',delay:50},{icon:'.',val:counts.en_attente||0,label:'En attente',color:'#f59e0b',delay:100},{icon:'C',val:stats.total_reservations||0,label:'Reservations',color:'#8b5cf6',delay:150},{icon:'!',val:stats.demandes_matieres_pending||0,label:'Demandes matieres',color:'#ef4444',delay:200}];
  if(loading)return<div className="adm" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',gap:16}}><div className="adm-loader" style={{width:36,height:36}}/><span style={{fontSize:13,color:'#94a3b8',fontWeight:600}}>Chargement...</span></div>;
  return(
    <div className="adm" style={{padding:'36px 40px'}}>
      <div style={{marginBottom:32}} className="adm-fadeUp">
        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}><span style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#94a3b8'}}>Dashboard</span><span style={{color:'#e2e8f0'}}>.</span><span style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#3b82f6'}}>Administration</span></div>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:16}}>
          <div><h1 style={{fontFamily:'Cabinet Grotesk,sans-serif',fontWeight:900,fontSize:28,color:'#0F172A',margin:'0 0 4px',letterSpacing:'-.03em'}}>EduMatch Admin</h1><p style={{color:'#94a3b8',margin:0,fontSize:13}}>Bienvenue -- etat de la plateforme en temps reel</p></div>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={loadAll} style={{flexShrink:0}}>Actualiser</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:28}}>
        {STAT_CARDS.map(s=><div key={s.label} className="adm-stat adm-scaleIn" style={{animationDelay:`${s.delay}ms`}}><div className="adm-stat-accent" style={{background:s.color}}/><div style={{width:42,height:42,borderRadius:12,background:`${s.color}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:14}}>{s.icon}</div><div style={{fontFamily:'Cabinet Grotesk,sans-serif',fontSize:32,fontWeight:900,color:s.color,lineHeight:1,marginBottom:5}}>{s.val}</div><div style={{fontSize:11,color:'#94a3b8',fontWeight:500}}>{s.label}</div></div>)}
      </div>
      <div className="adm-tab-bar" style={{marginBottom:28}}>
        {TABS.map(({k,l})=><button key={k} className={`adm-tab${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}{k==='demandes'&&demandesPending>0&&<span className="adm-tab-badge">{demandesPending}</span>}{k==='profs'&&counts.en_attente>0&&<span className="adm-tab-badge" style={{background:'#f59e0b'}}>{counts.en_attente}</span>}</button>)}
      </div>
      {tab==='overview'    &&<OverviewTab    stats={stats} allProfs={allProfs} demandes={demandes} counts={counts} onTabChange={setTab} onViewProf={p=>{setSelectedProf(p);}} chartData={chartData}/>}
      {tab==='analytiques' &&<AnalytiquesTab stats={stats} allProfs={allProfs} chartData={chartData} onTabChange={setTab}/>}
      {tab==='profs'       &&<ProfsTab       allProfs={allProfs} structure={structure} onView={setSelectedProf} onValider={handleValider} onRefuser={handleRefuser}/>}
      {tab==='demandes'    &&<DemandesTab    demandes={demandes} onApprouver={handleApprouverDemande} onRefuser={handleRefuserDemande}/>}
      {tab==='referentiel' &&<ReferentielTab structure={structure} villes={villes} onReload={loadAll}/>}
      {tab==='finances'    &&<FinancesTab/>}
      <ProfDrawer prof={selectedProf} onClose={()=>setSelectedProf(null)} onValider={handleValider} onRefuser={handleRefuser}/>
    </div>
  );
}