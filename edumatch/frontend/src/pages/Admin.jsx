import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import FinancesTab from './FinancesTab';
import { exportAdminProfs, exportAdminAnalytiques } from '../services/exportPDF';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
.adm { font-family:'Instrument Sans',system-ui,sans-serif; color:#0F172A; background:#f8fafc; min-height:100vh; }
@keyframes adm-fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes adm-scaleIn  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
@keyframes adm-slideR   { from{transform:translateX(100%)} to{transform:translateX(0)} }
@keyframes adm-modalIn  { from{opacity:0;transform:scale(.95) translateY(8px)} to{opacity:1;transform:none} }
@keyframes adm-spin     { to{transform:rotate(360deg)} }
.adm-fadeUp  { animation:adm-fadeUp  .4s ease both }
.adm-scaleIn { animation:adm-scaleIn .35s cubic-bezier(.22,1,.36,1) both }
.adm-card { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; box-shadow:0 2px 12px rgba(0,0,0,.04); transition:box-shadow .2s,border-color .2s; }
.adm-card:hover { border-color:#e2e8f0; box-shadow:0 4px 20px rgba(0,0,0,.07); }
.adm-stat { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; padding:22px; transition:all .22s cubic-bezier(.22,1,.36,1); position:relative; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.adm-stat:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.08); border-color:#e2e8f0; }
.adm-stat-accent { position:absolute;top:0;left:0;right:0;height:3px;border-radius:20px 20px 0 0; }
.adm-tab-bar { display:flex; background:rgba(255,255,255,0.97); border:1px solid #e2e8f0; border-radius:12px; padding:4px; gap:2px; box-shadow:0 2px 12px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04); overflow-x:auto; position:sticky; top:0; z-index:400; backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); margin-bottom:0; }
.adm-tab { flex:1; padding:8px 10px; border:none; border-radius:8px; font-family:'Instrument Sans',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:all .15s; background:transparent; color:#64748b; white-space:nowrap; display:inline-flex; align-items:center; justify-content:center; gap:4px; }
.adm-tab.active { background:#0F172A; color:#fff; font-weight:700; box-shadow:0 1px 8px rgba(15,23,42,.18); }
.adm-tab:not(.active):hover { background:#f1f5f9; color:#0F172A; }
.adm-tab-badge { display:inline-flex; align-items:center; justify-content:center; background:#ef4444; color:#fff; font-size:9px; font-weight:800; padding:1px 5px; border-radius:6px; min-width:15px; }
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
.adm-btn-warning { background:#fffbeb; color:#b45309; border-color:#fcd34d; }
.adm-btn-warning:hover { background:#fef3c7; }
.adm-btn-ghost { background:transparent; color:#64748b; border-color:#e2e8f0; }
.adm-btn-ghost:hover { background:#f8fafc; color:#0F172A; border-color:#cbd5e1; }
.adm-btn-sm { padding:6px 12px; font-size:12px; border-radius:8px; }
.adm-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; border:1px solid; }
.adm-badge-green  { background:#ecfdf5; color:#065f46; border-color:#6ee7b7; }
.adm-badge-amber  { background:#fffbeb; color:#b45309; border-color:#fcd34d; }
.adm-badge-red    { background:#fef2f2; color:#991b1b; border-color:#fca5a5; }
.adm-badge-blue   { background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; }
.adm-badge-purple { background:#f5f3ff; color:#6d28d9; border-color:#ddd6fe; }
.adm-badge-gray   { background:#f8fafc; color:#64748b; border-color:#e2e8f0; }
.adm-input { background:#fff; border:1.5px solid #e2e8f0; border-radius:10px; color:#0F172A; padding:9px 14px; font-size:13px; outline:none; font-family:'Instrument Sans',sans-serif; transition:border-color .15s,box-shadow .15s; width:100%; box-sizing:border-box; }
.adm-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }
.adm-textarea { resize:vertical; min-height:80px; }
.adm-search-wrap { position:relative; }
.adm-search-icon { position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:14px;pointer-events:none; }
.adm-search-wrap .adm-input { padding-left:36px; }
.adm-bar-track { height:5px; background:#f1f5f9; border-radius:3px; overflow:hidden; }
.adm-bar-fill  { height:100%; border-radius:3px; transition:width .9s cubic-bezier(.22,1,.36,1); }
.adm-prof-card { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; overflow:visible; cursor:pointer; transition:all .22s cubic-bezier(.22,1,.36,1); position:relative; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.adm-prof-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,.1); border-color:rgba(59,130,246,.3); }
.adm-drawer-overlay { position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(5px);z-index:900; }
.adm-drawer { position:fixed;top:0;right:0;bottom:0;width:540px;background:#fff;border-left:1.5px solid #f1f5f9;z-index:901;overflow-y:auto;animation:adm-slideR .28s cubic-bezier(.22,1,.36,1);box-shadow:-24px 0 60px rgba(0,0,0,.08); }
.adm-drawer::-webkit-scrollbar { width:4px; }
.adm-drawer::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:2px; }
.adm-modal-overlay { position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(6px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px; }
.adm-modal { background:#fff;border-radius:24px;border:1.5px solid #f1f5f9;width:100%;max-width:460px;padding:28px;box-shadow:0 40px 100px rgba(0,0,0,.15);animation:adm-modalIn .25s ease; }
.adm-alert { display:flex;align-items:center;gap:14px;padding:14px 20px;border-radius:14px;cursor:pointer;transition:all .18s;border:1.5px solid; }
.adm-alert:hover { transform:translateX(3px); }
.adm-alert-amber { background:#fffbeb; border-color:#fcd34d; }
.adm-alert-red   { background:#fff1f2; border-color:#fca5a5; }
.adm-chart-card { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; padding:22px; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.adm-empty { padding:48px 20px; text-align:center; color:#94a3b8; }
.adm-loader { border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:adm-spin 1s linear infinite; }
.adm-pending-row { display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;border:1.5px solid #fcd34d;background:#fffbeb;transition:all .15s; }
.adm-pending-row:hover { background:#fef3c7; transform:translateX(2px); }
.adm-top-row { display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;cursor:pointer;transition:background .15s;border:1.5px solid transparent; }
.adm-top-row:hover { background:#f8fafc; border-color:#e2e8f0; }
.adm-section-title { display:flex;align-items:center;gap:8px;margin-bottom:16px; }
.adm-section-title-bar { width:3px;height:18px;border-radius:2px;background:linear-gradient(180deg,#3b82f6,#60a5fa); }
.adm-section-title h3 { font-family:'Cabinet Grotesk',sans-serif;font-weight:900;font-size:15px;color:#0F172A;margin:0; }
.adm-section-title span { font-size:12px;color:#94a3b8; }
.adm-canvas-wrap { position:relative; }
.adm-label { font-size:12px;font-weight:700;color:#64748b;display:block;margin-bottom:6px; }
`;

function injectCSS() {
  if (!document.getElementById('adm-pro-css')) {
    const s = document.createElement('style');
    s.id = 'adm-pro-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
}

// ─── CHART.JS LAZY LOAD ───────────────────────────────────────────────────────
let _chartLoaded = false;
function loadChart() {
  return new Promise(resolve => {
    if (window.Chart) { resolve(window.Chart); return; }
    if (_chartLoaded) {
      const t = setInterval(() => { if (window.Chart) { clearInterval(t); resolve(window.Chart); } }, 50);
      return;
    }
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

function useChart(canvasRef, configFn, deps = []) {
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

// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────
function ChartLineSig({ data }) {
  const ref = useRef(null);
  useChart(ref, (C, c) => {
    const getGrad = (ctx) => {
      const canvas = ctx.chart.ctx;
      const { top, bottom } = ctx.chart.chartArea || {};
      if (!top && top !== 0) return 'rgba(99,102,241,0.08)';
      const grad = canvas.createLinearGradient(0, top, 0, bottom);
      grad.addColorStop(0, 'rgba(99,102,241,0.18)');
      grad.addColorStop(1, 'rgba(99,102,241,0.01)');
      return grad;
    };
    return {
      type: 'line',
      data: {
        labels: data.map(d => d.mois || d.label),
        datasets: [{
          label: 'Signalements',
          data: data.map(d => d.val),
          borderColor: '#6366f1',
          backgroundColor: (ctx) => getGrad(ctx),
          fill: true, tension: 0.45, cubicInterpolationMode: 'monotone',
          pointBackgroundColor: '#6366f1', pointBorderColor: '#fff', pointBorderWidth: 2.5,
          pointRadius: 6, pointHoverRadius: 9, pointHoverBackgroundColor: '#4f46e5',
          pointHoverBorderColor: '#fff', pointHoverBorderWidth: 3, borderWidth: 2.8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1e293b', titleColor: '#94a3b8', bodyColor: '#fff', borderColor: '#6366f1', borderWidth: 1, padding: 12, cornerRadius: 10,
            callbacks: { title: items => items[0].label, label: ctx => `  ${ctx.raw} signalement${ctx.raw > 1 ? 's' : ''}` }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 11, weight: '600' } }, border: { dash: [4, 4] } },
          y: { beginAtZero: true, grid: { color: 'rgba(99,102,241,0.07)', drawBorder: false }, ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 1, padding: 8, callback: v => Number.isInteger(v) ? v : '' }, border: { display: false } }
        }
      }
    };
  }, [JSON.stringify(data)]);
  return <canvas ref={ref} style={{ height: 220 }} />;
}

function ChartLine({ data }) {
  const ref = useRef(null);
  useChart(ref, (C, c) => ({
    type: 'line',
    data: { labels: data.map(d => d.mois), datasets: [{ label: 'Réservations', data: data.map(d => d.total), borderColor: c.blue, backgroundColor: 'rgba(59,130,246,.07)', fill: true, tension: .4, pointBackgroundColor: c.blue, pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7, borderWidth: 2.5 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: c.card, titleColor: c.text2, bodyColor: c.text, borderColor: c.border, borderWidth: 1, callbacks: { label: ctx => ` ${ctx.raw} réservation${ctx.raw > 1 ? 's' : ''}` } } }, scales: { x: { grid: { color: c.border + '55' }, ticks: { color: c.text2, font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: c.border + '55' }, ticks: { color: c.text2, font: { size: 11 }, stepSize: 1, callback: v => Number.isInteger(v) ? v : '' } } } }
  }), [JSON.stringify(data)]);
  return <canvas ref={ref} style={{ height: 200 }} />;
}

function ChartBar({ data }) {
  const ref = useRef(null);
  const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const labels = data.map(d => d.jour || JOURS[(d.jour_semaine ?? 1) - 1] || String(d.jour_semaine));
  const vals = data.map(d => d.total);
  const maxVal = Math.max(...vals, 1);
  useChart(ref, (C, c) => ({
    type: 'bar',
    data: { labels, datasets: [{ label: 'Réservations', data: vals, backgroundColor: vals.map(v => v === maxVal && maxVal > 0 ? c.blue : c.blue + '55'), borderWidth: 1.5, borderRadius: 7, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: c.text, font: { size: 12, weight: '600' } } }, y: { beginAtZero: true, grid: { color: c.border + '55' }, ticks: { color: c.text2, font: { size: 11 }, stepSize: 1, callback: v => Number.isInteger(v) ? v : '' } } } }
  }), [JSON.stringify(data)]);
  return <canvas ref={ref} style={{ height: 180 }} />;
}

function ChartDoughnut({ data, colors }) {
  const ref = useRef(null);
  const tot = data.reduce((a, b) => a + (b.val || 0), 0);
  useChart(ref, (C, c) => ({
    type: 'doughnut',
    data: { labels: data.map(d => d.label), datasets: [{ data: data.map(d => d.val || 0), backgroundColor: colors, borderWidth: 0, hoverOffset: 5 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { color: c.text, font: { size: 11, weight: '600' }, padding: 12, usePointStyle: true, generateLabels: chart => chart.data.labels.map((lbl, i) => ({ text: `${lbl}  ${chart.data.datasets[0].data[i]} (${tot > 0 ? Math.round(chart.data.datasets[0].data[i] / tot * 100) : 0}%)`, fillStyle: colors[i], strokeStyle: colors[i], fontColor: c.text, hidden: false, index: i })) } }, tooltip: { backgroundColor: c.card, titleColor: c.text2, bodyColor: c.text, borderColor: c.border, borderWidth: 1 } } }
  }), [JSON.stringify(data)]);
  return <canvas ref={ref} style={{ height: 200 }} />;
}

function ChartHorizBar({ data, metric }) {
  const ref = useRef(null);
  const PAL = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];
  const maxVal = Math.max(...data.map(d => d.val || 0), 1);
  const isResa = metric === 'nb_resa';
  useChart(ref, (C, c) => ({
    type: 'bar',
    data: { labels: data.map(d => (d.label || '').length > 20 ? (d.label || '').slice(0, 19) + '…' : (d.label || '')), datasets: [{ label: isResa ? 'Réservations' : 'Formateurs', data: data.map(d => d.val || 0), backgroundColor: data.map((_, i) => PAL[i % PAL.length] + 'cc'), borderColor: data.map((_, i) => PAL[i % PAL.length]), borderWidth: 1.5, borderRadius: 6, borderSkipped: false }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleColor: '#94a3b8', bodyColor: '#fff', borderColor: '#334155', borderWidth: 1, padding: 10, callbacks: { label: x => isResa ? ` ${x.parsed.x} réservation${x.parsed.x > 1 ? 's' : ''}` : ` ${x.parsed.x} formateur${x.parsed.x > 1 ? 's' : ''}` } } }, scales: { x: { beginAtZero: true, max: maxVal < 2 ? maxVal + 1 : undefined, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { color: c.text2, font: { size: 10 }, stepSize: 1, callback: v => Number.isInteger(v) ? v : '' } }, y: { grid: { display: false }, ticks: { color: '#374151', font: { size: 12, weight: '600' } } } } }
  }), [JSON.stringify(data), metric]);
  return <canvas ref={ref} style={{ height: Math.max(160, data.length * 44) }} />;
}

// ─── UTILITAIRES UI ───────────────────────────────────────────────────────────
function isTarif(v) { return v !== null && v !== undefined && v !== '' && parseFloat(v) > 0; }

function ProfAvatar({ prof, size = 40 }) {
  const nm = `${prof?.user_prenom || ''} ${prof?.user_nom || ''}`.trim() || 'P';
  const init = nm.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const pals = [['#1e40af', '#3b82f6'], ['#065f46', '#10b981'], ['#4c1d95', '#8b5cf6'], ['#7c2d12', '#f59e0b'], ['#1e3a8a', '#60a5fa']];
  const [a, b] = pals[nm.charCodeAt(0) % pals.length];
  const radius = size / 4;
  return (
    <div style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: 'hidden', background: `linear-gradient(135deg,${a},${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * .34, fontWeight: 800, color: '#fff', fontFamily: 'Cabinet Grotesk,sans-serif', boxShadow: '0 2px 8px rgba(0,0,0,.12)', position: 'relative' }}>
      {prof?.photo_url ? <img src={`http://localhost:8001${prof.photo_url}`} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: radius }} /> : init}
    </div>
  );
}

function StatutBadge({ s }) {
  const m = { 'valide': { c: 'adm-badge-green', i: '✓', l: 'Validé' }, 'en_attente': { c: 'adm-badge-amber', i: '⏳', l: 'En attente' }, 'refuse': { c: 'adm-badge-red', i: '✕', l: 'Refusé' }, 'approuve': { c: 'adm-badge-green', i: '✓', l: 'Approuvé' }, 'bloque': { c: 'adm-badge-red', i: '🚫', l: 'Bloqué' } };
  const key = s === 'validé' ? 'valide' : s === 'refusé' ? 'refuse' : s === 'approuvé' ? 'approuve' : s === 'en_attente' ? 'en_attente' : s === 'bloqué' ? 'bloque' : s;
  const cfg = m[key] || { c: 'adm-badge-blue', i: '?', l: s };
  return <span className={`adm-badge ${cfg.c}`}>{cfg.i} {cfg.l}</span>;
}

function ModeBadge({ m }) {
  const map = { en_ligne: { c: 'adm-badge-blue', l: 'En ligne' }, presentiel: { c: 'adm-badge-green', l: 'Présentiel' }, les_deux: { c: 'adm-badge-purple', l: 'Les deux' } };
  const cfg = map[m] || map.presentiel;
  return <span className={`adm-badge ${cfg.c}`}>{cfg.l}</span>;
}

function SectionTitle({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
      <div className="adm-section-title" style={{ marginBottom: 0 }}>
        <div className="adm-section-title-bar" />
        <h3>{title}</h3>
        {sub && <span>{sub}</span>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="adm-empty">
      <div style={{ fontSize: 32, marginBottom: 12, opacity: .6 }}>{icon}</div>
      <div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 15, color: '#64748b', marginBottom: 5 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: '#94a3b8' }}>{sub}</div>}
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmClass = 'adm-btn-danger', onConfirm, onCancel, children }) {
  return (
    <div className="adm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="adm-modal" style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 16, color: '#0F172A', margin: 0 }}>{title}</h3>
          <button onClick={onCancel} style={{ width: 32, height: 32, borderRadius: 9, background: '#f8fafc', border: '1.5px solid #e2e8f0', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginLeft: 12 }}>✕</button>
        </div>
        {message && <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>{message}</p>}
        {children}
        <div style={{ display: 'flex', gap: 10, marginTop: children ? 20 : 0 }}>
          <button className={`adm-btn ${confirmClass}`} style={{ flex: 2, justifyContent: 'center' }} onClick={onConfirm}>{confirmLabel}</button>
          <button className="adm-btn adm-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

function ProfDrawer({ prof, onClose, onValider, onRefuser }) {
  const [tab, setTab] = useState('profil');
  if (!prof) return null;
  const nm = `${prof.user_prenom || ''} ${prof.user_nom || ''}`.trim() || 'Professeur';
  const mats = prof.tarifs_matieres ? [...new Set(prof.tarifs_matieres.map(t => t.nom_matiere))] : [];
  const tarifs = prof.tarifs_matieres ? prof.tarifs_matieres.filter(t => parseFloat(t.tarif) > 0) : [];
  const TABS = [['profil', 'Profil'], ['enseign', 'Enseignements'], ['docs', 'Documents'], ['dispos', 'Disponibilités']];
  const InfoRow = ({ icon, label, val, href }) => (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
      <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', width: 72, flexShrink: 0 }}>{label}</span>
      {href ? <a href={href} style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>{val}</a> : <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{val || '—'}</span>}
    </div>
  );
  const isBloque = prof.user_statut === 'bloqué';
  return (
    <>
      <div className="adm-drawer-overlay" onClick={onClose} />
      <div className="adm-drawer">
        <div style={{ height: 70, background: isBloque ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'linear-gradient(135deg,#1e40af 0%,#3b82f6 60%,#60a5fa 100%)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 12, left: 16 }}><StatutBadge s={isBloque ? 'bloqué' : prof.statut_validation} /></div>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 14, width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '0 24px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 16, marginBottom: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, border: '3px solid #f1f5f9', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,.10)' }}><ProfAvatar prof={prof} size={66} /></div>
            <div>
              <h2 style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontSize: 17, fontWeight: 900, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-.02em' }}>{nm}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                {prof.ville && <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{prof.ville}</span>}
                <ModeBadge m={prof.mode_enseignement} />
                <span style={{ fontSize: 12, color: '#64748b' }}><strong style={{ color: '#0F172A' }}>{parseFloat(prof.note_moyenne || 0).toFixed(1)}</strong> ({prof.nb_avis} avis)</span>
              </div>
            </div>
          </div>
          {isBloque && (<div style={{ padding: '10px 14px', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, fontSize: 12, color: '#991b1b' }}><div style={{ fontWeight: 700, marginBottom: 4 }}>🚫 Compte bloqué</div>{prof.raison_blocage && <div style={{ color: '#7f1d1d' }}>Raison : {prof.raison_blocage}</div>}</div>)}
          {!isBloque && prof.statut_validation === 'validé' && (<div style={{ padding: '9px 14px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, fontSize: 12, color: '#065f46', fontWeight: 600 }}>✓ Professeur validé — visible sur la plateforme</div>)}
          {!isBloque && prof.statut_validation === 'en_attente' && (<div style={{ display: 'flex', gap: 8 }}><button className="adm-btn adm-btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onValider(prof.id); onClose(); }}>✓ Valider</button><button className="adm-btn adm-btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onRefuser(prof.id, nm); onClose(); }}>✕ Refuser</button></div>)}
          {!isBloque && prof.statut_validation === 'refusé' && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: prof.raison_refus ? 6 : 0 }}>✕ Professeur refusé</div>
              {prof.raison_refus && <div style={{ color: '#7f1d1d', lineHeight: 1.5 }}><strong>Raison :</strong> {prof.raison_refus}</div>}
              {!prof.raison_refus && <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucune raison fournie</div>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', padding: '0 12px', background: '#fff' }}>
          {TABS.map(([k, l]) => (<button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: '13px 4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: tab === k ? 700 : 400, color: tab === k ? '#3b82f6' : '#94a3b8', borderBottom: `2px solid ${tab === k ? '#3b82f6' : 'transparent'}`, transition: 'all .15s' }}>{l}</button>))}
        </div>
        <div style={{ padding: 24 }}>
          {tab === 'profil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="adm-card" style={{ padding: '4px 16px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', padding: '12px 0 4px' }}>Coordonnées</div>
                <InfoRow icon="@" label="Email" val={prof.email} href={prof.email ? `mailto:${prof.email}` : null} />
                <InfoRow icon="📞" label="Téléphone" val={prof.telephone} href={prof.telephone ? `tel:${prof.telephone}` : null} />
                <InfoRow icon="📍" label="Ville" val={prof.ville} />
              </div>
              {prof.bio && <div className="adm-card" style={{ padding: '16px 18px' }}><div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Bio</div><p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0, paddingLeft: 12, borderLeft: '2px solid #3b82f6' }}>{prof.bio}</p></div>}
              {(isTarif(prof.tarif_en_ligne) || isTarif(prof.tarif_presentiel)) && (
                <div style={{ display: 'flex', gap: 10 }}>
                  {isTarif(prof.tarif_en_ligne) && <div style={{ flex: 1, padding: 14, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, textAlign: 'center' }}><div style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 700, marginBottom: 4 }}>En ligne</div><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 22, color: '#1d4ed8' }}>{prof.tarif_en_ligne} DT</div><div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>/séance</div></div>}
                  {isTarif(prof.tarif_presentiel) && <div style={{ flex: 1, padding: 14, background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 14, textAlign: 'center' }}><div style={{ fontSize: 11, color: '#065f46', fontWeight: 700, marginBottom: 4 }}>Présentiel</div><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 22, color: '#065f46' }}>{prof.tarif_presentiel} DT</div><div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>/séance</div></div>}
                </div>
              )}
            </div>
          )}
          {tab === 'enseign' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {mats.length > 0 ? <div className="adm-card" style={{ padding: 16 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Matières enseignées</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{mats.map(m => <span key={m} className="adm-badge adm-badge-blue">{m}</span>)}</div></div> : <EmptyState icon="📚" title="Aucune matière renseignée" />}
              {tarifs.length > 0 && <div className="adm-card" style={{ padding: 16 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Tarifs par matière</div><div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{tarifs.map((t, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}><div><span style={{ fontWeight: 700, fontSize: 13 }}>{t.nom_matiere}</span><span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>{t.nom_niveau}</span></div><span className="adm-badge adm-badge-green" style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800 }}>{t.tarif} DT/séance</span></div>)}</div></div>}
            </div>
          )}
          {tab === 'docs' && (prof.certificats?.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{prof.certificats.map(c => <a key={c.id} href={`http://localhost:8001${c.fichier_url}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: '#f8fafc', border: '1.5px solid #f1f5f9', borderRadius: 14, transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#f8fafc'; }}><div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 2 }}>{c.titre}</div><div style={{ fontSize: 12, color: '#3b82f6' }}>Consulter →</div></div></a>)}</div> : <EmptyState icon="📄" title="Aucun document" sub="Ce professeur n'a pas encore ajouté de diplômes." />)}
          {tab === 'dispos' && (() => {
            const today = new Date(); today.setHours(0,0,0,0);
            const futures = (prof.disponibilites || []).filter(d => { if (!d.date_specifique) return false; const dd = new Date(d.date_specifique); dd.setHours(0,0,0,0); return dd >= today; });
            return futures.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {futures.map(d => { const full = d.nb_max_etudiants > 0 && d.nb_inscrits >= d.nb_max_etudiants; return (<div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', border: `1.5px solid ${full ? '#fca5a5' : '#f1f5f9'}`, borderRadius: 14 }}><div><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 3 }}>{new Date(d.date_specifique).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{d.heure_debut} – {d.heure_fin}</div></div><span className={`adm-badge ${full ? 'adm-badge-red' : 'adm-badge-green'}`}>{full ? 'Complet' : `${d.nb_inscrits}/${d.nb_max_etudiants}`}</span></div>); })}
              </div>
            ) : <EmptyState icon="📅" title="Aucun créneau à venir" sub="Toutes les disponibilités sont passées ou aucune n'est planifiée." />;
          })()}
        </div>
      </div>
    </>
  );
}

function SignalementsTab({ signalements, onReload }) {
  const [actionModal, setActionModal] = useState(null);
  const [raisonBlocage, setRaisonBlocage] = useState('');
  const [saving, setSaving] = useState(false);
  const [filtre, setFiltre] = useState('tous');
  const [recherche, setRecherche] = useState('');

  const STATUT_CFG = {
    'nouveau': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: '🆕 Nouveau', dot: '#3b82f6' },
    'ignoré':  { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: '🔕 Ignoré',  dot: '#94a3b8' },
    'traité':  { bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7', label: '✅ Traité',  dot: '#10b981' },
  };

  const sigParProf = useMemo(() => {
    const m = {};
    signalements.forEach(s => { m[s.prof_nom] = (m[s.prof_nom] || 0) + 1; });
    return m;
  }, [signalements]);

  const filtered = useMemo(() => signalements.filter(s => {
    const matchFiltre = filtre === 'tous' || s.statut === filtre;
    const matchRecherche = !recherche || s.prof_nom?.toLowerCase().includes(recherche.toLowerCase()) || s.etudiant_nom?.toLowerCase().includes(recherche.toLowerCase());
    return matchFiltre && matchRecherche;
  }), [signalements, filtre, recherche]);

  const nouveaux = filtered.filter(s => s.statut === 'nouveau');
  const archives = filtered.filter(s => s.statut !== 'nouveau');

  const handleAction = async (sig, action) => {
    if (action === 'bloquer') { setRaisonBlocage(''); setActionModal({ sig, action }); return; }
    setSaving(true);
    try { await api.put(`/api/admin/signalements/${sig.id}/action`, { action }); onReload(); }
    catch (e) { alert(e.response?.data?.detail || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleBloquerConfirm = async () => {
    if (!actionModal) return;
    setSaving(true);
    try { await api.put(`/api/admin/signalements/${actionModal.sig.id}/action`, { action: 'bloquer', raison: raisonBlocage || 'Signalement étudiant' }); setActionModal(null); onReload(); }
    catch (e) { alert(e.response?.data?.detail || 'Erreur'); }
    finally { setSaving(false); }
  };

  const FILTRES = [
    { key: 'tous', label: 'Tous', count: signalements.length },
    { key: 'nouveau', label: 'En attente', count: signalements.filter(s => s.statut === 'nouveau').length },
    { key: 'ignoré', label: 'Ignorés', count: signalements.filter(s => s.statut === 'ignoré').length },
    { key: 'traité', label: 'Traités', count: signalements.filter(s => s.statut === 'traité').length },
  ];

  const SigCard = ({ sig }) => {
    const cfg = STATUT_CFG[sig.statut] || STATUT_CFG['nouveau'];
    const nbSig = sigParProf[sig.prof_nom] || 1;
    const isNew = sig.statut === 'nouveau';
    return (
      <div style={{ padding: '18px 20px', background: isNew ? '#fffbff' : '#fff', border: `1.5px solid ${isNew ? '#e9d5ff' : '#f1f5f9'}`, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', boxShadow: isNew ? '0 2px 12px rgba(139,92,246,0.07)' : 'none', transition: 'all .2s' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#f1f5f9', borderRadius: 20 }}><span style={{ fontSize: 11 }}>👤</span><span style={{ fontWeight: 700, fontSize: 12, color: '#374151' }}>{sig.etudiant_nom}</span></div>
            <span style={{ color: '#c4b5fd', fontSize: 12, fontWeight: 700 }}>→ signale →</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 20 }}><span style={{ fontSize: 11 }}>👨‍🏫</span><span style={{ fontWeight: 800, fontSize: 12, color: '#1d4ed8' }}>{sig.prof_nom}</span></div>
            {nbSig > 1 && <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fca5a5' }}>⚠ {nbSig} signalements</span>}
          </div>
          <div style={{ fontSize: 13, color: '#374151', padding: '9px 13px', background: isNew ? 'rgba(233,213,255,.2)' : '#f8fafc', borderRadius: 10, fontStyle: 'italic', borderLeft: `3px solid ${cfg.border}`, lineHeight: 1.55, marginBottom: 8 }}>"{sig.raison}"</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>📅 {new Date(sig.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }}/>{cfg.label}</span>
          </div>
        </div>
        {isNew && (
          <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexDirection: 'column' }}>
            <button onClick={() => handleAction(sig, 'ignorer')} disabled={saving} className="adm-btn adm-btn-ghost adm-btn-sm" style={{ fontSize: 12, padding: '7px 13px' }}>🔕 Ignorer</button>
            <button onClick={() => handleAction(sig, 'avertir')} disabled={saving} className="adm-btn adm-btn-warning adm-btn-sm" style={{ fontSize: 12, padding: '7px 13px' }}>⚠️ Avertir le prof</button>
            <button onClick={() => handleAction(sig, 'bloquer')} disabled={saving} className="adm-btn adm-btn-danger adm-btn-sm" style={{ fontSize: 12, padding: '7px 13px' }}>🚫 Bloquer prof</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { label: 'Nouveaux', count: signalements.filter(s => s.statut === 'nouveau').length, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: '🚨' },
          { label: 'Ignorés',  count: signalements.filter(s => s.statut === 'ignoré').length,  color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: '🔕' },
          { label: 'Traités',  count: signalements.filter(s => s.statut === 'traité').length,   color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', icon: '✅' },
        ].map((s, i) => (
          <div key={i} onClick={() => setFiltre(i === 0 ? 'nouveau' : i === 1 ? 'ignoré' : 'traité')} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 20, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,.04)', cursor: 'pointer', transition: 'all .18s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{s.icon}</div>
            <div><div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.count}</div><div style={{ fontSize: '.72rem', color: s.color, opacity: .7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', background: '#fff', padding: '14px 18px', borderRadius: 16, border: '1.5px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,.04)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTRES.map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)} style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${filtre === f.key ? '#3b82f6' : '#e2e8f0'}`, background: filtre === f.key ? '#eff6ff' : '#f8fafc', color: filtre === f.key ? '#1d4ed8' : '#64748b', fontWeight: filtre === f.key ? 800 : 600, fontSize: 12, cursor: 'pointer', transition: 'all .15s', fontFamily: "'Instrument Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}>
              {f.label}<span style={{ fontSize: 10, fontWeight: 900, padding: '1px 6px', borderRadius: 10, background: filtre === f.key ? '#3b82f6' : '#e2e8f0', color: filtre === f.key ? '#fff' : '#64748b' }}>{f.count}</span>
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#94a3b8' }}>🔍</span>
          <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher par nom prof ou étudiant..." style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1.5px solid #e2e8f0', borderRadius: 20, fontSize: 12, outline: 'none', fontFamily: "'Instrument Sans',sans-serif", background: '#f8fafc', boxSizing: 'border-box', transition: 'border-color .15s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
        {(filtre !== 'tous' || recherche) && (<button onClick={() => { setFiltre('tous'); setRecherche(''); }} style={{ padding: '7px 13px', borderRadius: 20, border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .15s' }}>✕ Réinitialiser</button>)}
        {filtered.length !== signalements.length && (<span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{filtered.length}/{signalements.length} signalement{filtered.length > 1 ? 's' : ''}</span>)}
      </div>
      {nouveaux.length > 0 && (<div><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><span style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', padding: '3px 10px', borderRadius: 20, border: '1.5px solid #bfdbfe', textTransform: 'uppercase', letterSpacing: '.06em' }}>⚠ Action requise</span><span style={{ fontSize: 12, color: '#64748b' }}>{nouveaux.length} signalement{nouveaux.length > 1 ? 's' : ''} en attente</span></div><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{nouveaux.map(sig => <SigCard key={sig.id} sig={sig} />)}</div></div>)}
      {archives.length > 0 && (<div>{nouveaux.length > 0 && <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0 16px' }}/>}<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>Historique — {archives.length} entrée{archives.length > 1 ? 's' : ''}</span></div><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{archives.map(sig => <SigCard key={sig.id} sig={sig} />)}</div></div>)}
      {filtered.length === 0 && (<div className="adm-card" style={{ padding: 40, textAlign: 'center' }}><EmptyState icon={recherche ? '🔍' : '✅'} title={recherche ? 'Aucun résultat' : 'Aucun signalement'} sub={recherche ? `Aucun résultat pour "${recherche}"` : 'Tout est calme !'} /></div>)}
      {actionModal && (<ConfirmModal title={`🚫 Bloquer ${actionModal.sig.prof_nom}`} confirmLabel={saving ? 'Blocage...' : '🚫 Bloquer ce professeur'} confirmClass="adm-btn-danger" onConfirm={handleBloquerConfirm} onCancel={() => setActionModal(null)}><label className="adm-label">Raison du blocage <span style={{ color: '#94a3b8', fontWeight: 400 }}>(communiquée au prof)</span></label><textarea autoFocus className="adm-input adm-textarea" placeholder="Ex: Comportement inapproprié signalé par plusieurs étudiants..." value={raisonBlocage} onChange={e => setRaisonBlocage(e.target.value)} /></ConfirmModal>)}
    </div>
  );
}

function UsersTab({ onReload }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterRole, setFilterRole] = useState('tous');
  const [bloquerModal, setBloquerModal] = useState(null);
  const [raisonBlocage, setRaisonBlocage] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/api/admin/users/all').then(r => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => setUsers([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => users.filter(u => {
    const nm = `${u.prenom || ''} ${u.nom || ''} ${u.email || ''}`.toLowerCase();
    if (search && !nm.includes(search.toLowerCase())) return false;
    if (filterStatut !== 'tous' && u.statut !== filterStatut) return false;
    if (filterRole !== 'tous' && u.role !== filterRole) return false;
    return true;
  }), [users, search, filterStatut, filterRole]);

  const handleBloquer = async () => {
    if (!bloquerModal) return;
    setSaving(true);
    try { await api.put(`/api/admin/users/${bloquerModal.id}/bloquer`, { raison: raisonBlocage }); setBloquerModal(null); setRaisonBlocage(''); fetchUsers(); onReload(); }
    catch (e) { alert(e.response?.data?.detail || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDebloquer = async (id) => {
    try { await api.put(`/api/admin/users/${id}/debloquer`); fetchUsers(); onReload(); }
    catch (e) { alert(e.response?.data?.detail || 'Erreur'); }
  };

  const ROLE_CFG = { admin: { c: 'adm-badge-purple', l: 'Admin', icon: '🛡' }, professeur: { c: 'adm-badge-blue', l: 'Professeur', icon: '👨‍🏫' }, étudiant: { c: 'adm-badge-green', l: 'Étudiant', icon: '🎓' } };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="adm-loader" style={{ width: 32, height: 32 }} /></div>;

  const nbProfs   = users.filter(u => u.role === 'professeur').length;
  const nbEtuds   = users.filter(u => u.role === 'étudiant').length;
  const nbActifs  = users.filter(u => u.statut === 'actif').length;
  const nbBloques = users.filter(u => u.statut === 'bloqué').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {[
          { label: 'Total', count: users.length, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: '👥' },
          { label: 'Professeurs', count: nbProfs, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: '👨‍🏫' },
          { label: 'Étudiants', count: nbEtuds, color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', icon: '🎓' },
          { label: 'Actifs', count: nbActifs, color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', icon: '✅' },
          { label: 'Bloqués', count: nbBloques, color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', icon: '🚫' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,.04)', transition: 'all .18s', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.08)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'; }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</div>
            <div><div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1.6rem', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 2 }}>{s.count}</div><div style={{ fontSize: '.68rem', color: s.color, opacity: .7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em' }}>{s.label}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap', padding: '16px 20px', background: '#f8fafc', border: '1.5px solid #f1f5f9', borderRadius: 16 }}>
        <div className="adm-search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="adm-search-icon">🔍</span>
          <input className="adm-input" placeholder="Rechercher par nom ou email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Statut</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[{ k: 'tous', l: 'Tous', c: '#64748b' }, { k: 'actif', l: '✓ Actifs', c: '#10b981' }, { k: 'bloqué', l: '🚫 Bloqués', c: '#ef4444' }].map(f => (
              <button key={f.k} onClick={() => setFilterStatut(f.k)} style={{ padding: '6px 13px', borderRadius: 20, border: `1.5px solid ${filterStatut === f.k ? f.c : '#e2e8f0'}`, background: filterStatut === f.k ? `${f.c}15` : '#fff', color: filterStatut === f.k ? f.c : '#64748b', fontSize: 12, fontWeight: filterStatut === f.k ? 700 : 500, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>{f.l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Rôle</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[{ k: 'tous', l: 'Tous', c: '#64748b' }, { k: 'professeur', l: '👨‍🏫 Profs', c: '#8b5cf6' }, { k: 'étudiant', l: '🎓 Étudiants', c: '#f59e0b' }].map(f => (
              <button key={f.k} onClick={() => setFilterRole(f.k)} style={{ padding: '6px 13px', borderRadius: 20, border: `1.5px solid ${filterRole === f.k ? f.c : '#e2e8f0'}`, background: filterRole === f.k ? `${f.c}15` : '#fff', color: filterRole === f.k ? f.c : '#64748b', fontSize: 12, fontWeight: filterRole === f.k ? 700 : 500, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>{f.l}</button>
            ))}
          </div>
        </div>
        {(filterStatut !== 'tous' || filterRole !== 'tous') && (<button onClick={() => { setFilterStatut('tous'); setFilterRole('tous'); }} style={{ padding: '6px 12px', borderRadius: 10, border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>✕ Réinitialiser</button>)}
        <span style={{ fontSize: 12, color: '#94a3b8', alignSelf: 'flex-end', marginLeft: 'auto', whiteSpace: 'nowrap' }}><strong style={{ color: '#0F172A' }}>{filtered.length}</strong> utilisateur{filtered.length > 1 ? 's' : ''}</span>
      </div>
      <div className="adm-card" style={{ overflow: 'hidden' }}>
        <table className="adm-table">
          <thead><tr><th>Utilisateur</th><th>Rôle</th><th>Statut</th><th>Raison blocage</th><th>Inscrit le</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (<tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Aucun utilisateur trouvé</td></tr>) : filtered.map(u => {
              const estBloque = u.statut === 'bloqué';
              const roleCfg = ROLE_CFG[u.role] || { c: 'adm-badge-gray', l: u.role, icon: '?' };
              return (
                <tr key={u.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: estBloque ? '#fef2f2' : u.role === 'professeur' ? 'linear-gradient(135deg,#8b5cf6,#a78bfa)' : u.role === 'étudiant' ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : 'linear-gradient(135deg,#64748b,#94a3b8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: estBloque ? '#ef4444' : '#fff', flexShrink: 0 }}>{estBloque ? '🚫' : roleCfg.icon}</div><div><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{u.prenom} {u.nom}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{u.email}</div></div></div></td>
                  <td><span className={`adm-badge ${roleCfg.c}`}>{roleCfg.l}</span></td>
                  <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: estBloque ? '#fef2f2' : '#ecfdf5', color: estBloque ? '#991b1b' : '#065f46', border: `1px solid ${estBloque ? '#fca5a5' : '#6ee7b7'}` }}>{estBloque ? '🚫 Bloqué' : '✓ Actif'}</span></td>
                  <td style={{ fontSize: 12, color: '#64748b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.raison_blocage || <span style={{ color: '#e2e8f0' }}>—</span>}</td>
                  <td style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>{u.role !== 'admin' && (estBloque ? (<button className="adm-btn adm-btn-success adm-btn-sm" onClick={() => handleDebloquer(u.id)}>✓ Débloquer</button>) : (<button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => { setRaisonBlocage(''); setBloquerModal(u); }}>🚫 Bloquer</button>))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {bloquerModal && (
        <ConfirmModal title={`🚫 Bloquer ${bloquerModal.prenom} ${bloquerModal.nom}`} confirmLabel={saving ? 'Blocage...' : '🚫 Confirmer le blocage'} confirmClass="adm-btn-danger" onConfirm={handleBloquer} onCancel={() => setBloquerModal(null)}>
          <label className="adm-label">Raison du blocage <span style={{ color: '#94a3b8', fontWeight: 400 }}>(communiquée à l'utilisateur à sa prochaine connexion)</span></label>
          <textarea autoFocus className="adm-input adm-textarea" placeholder="Ex: Non-respect des CGU, comportement inapproprié..." value={raisonBlocage} onChange={e => setRaisonBlocage(e.target.value)} />
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>⚠️ L'utilisateur ne pourra plus se connecter et verra cette raison affichée.</div>
        </ConfirmModal>
      )}
    </div>
  );
}

function OverviewTab({ stats, allProfs, demandes, counts, onTabChange, onViewProf, chartData }) {
  const pendingProfs = allProfs.filter(p => p.statut_validation === 'en_attente');
  const demandesPending = demandes.filter(d => d.statut === 'en_attente').length;
  const valides = allProfs.filter(p => p.statut_validation === 'validé');
  const topProfs = [...valides.filter(p => parseFloat(p.note_moyenne || 0) > 0).sort((a, b) => parseFloat(b.note_moyenne) - parseFloat(a.note_moyenne)), ...valides.filter(p => !parseFloat(p.note_moyenne || 0))].slice(0, 5);
  const { reservations_par_mois = [] } = chartData;
  const totalResa = reservations_par_mois.reduce((a, b) => a + (b.total || 0), 0);
  const pctMois = stats.total_reservations > 0 ? Math.min(100, Math.round(((stats.reservations_mois || 0) / stats.total_reservations) * 100)) : 0;
  const activiteKpis = [
    { icon: '📅', val: stats.reservations_mois || 0, lbl: 'Réservations ce mois', color: '#3b82f6', bg: '#eff6ff' },
    { icon: '👨‍🏫', val: valides.length, lbl: 'Formateurs actifs', color: '#10b981', bg: '#ecfdf5' },
    { icon: '👥', val: stats.total_users || 0, lbl: 'Utilisateurs', color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: '📊', val: stats.total_reservations || 0, lbl: 'Total réservations', color: '#f59e0b', bg: '#fffbeb' },
  ];
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {(pendingProfs.length > 0 || demandesPending > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pendingProfs.length > 0 && (<div className="adm-alert adm-alert-amber" onClick={() => onTabChange('profs')}><div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245,158,11,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🔔</div><div style={{ flex: 1 }}><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 13, color: '#b45309' }}>{pendingProfs.length} formateur{pendingProfs.length > 1 ? 's' : ''} en attente de validation</div><div style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>Répondez rapidement pour ne pas bloquer leur activité</div></div><span style={{ fontSize: 12, fontWeight: 700, color: '#b45309', whiteSpace: 'nowrap' }}>Traiter →</span></div>)}
          {demandesPending > 0 && (<div className="adm-alert adm-alert-red" onClick={() => onTabChange('demandes')}><div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239,68,68,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💡</div><div style={{ flex: 1 }}><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 13, color: '#9f1239' }}>{demandesPending} demande{demandesPending > 1 ? 's' : ''} de matière en attente</div><div style={{ fontSize: 12, color: '#881337', marginTop: 2 }}>Des formateurs souhaitent enseigner de nouvelles matières</div></div><span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>Voir →</span></div>)}
        </div>
      )}
      <div className="adm-chart-card adm-fadeUp" style={{ animationDelay: '.05s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div><div className="adm-section-title" style={{ marginBottom: 3 }}><div className="adm-section-title-bar" /><h3>Évolution des réservations</h3></div><div style={{ paddingLeft: 11, fontSize: 12, color: '#94a3b8' }}>{totalResa} réservation{totalResa !== 1 ? 's' : ''} au total</div></div>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => onTabChange('analytiques')}>Voir l'analyse complète →</button>
        </div>
        {reservations_par_mois.length > 0 ? <div className="adm-canvas-wrap"><ChartLine data={reservations_par_mois} /></div> : <EmptyState icon="📈" title="Aucune réservation encore" sub="Les données apparaîtront dès les premières réservations" />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="adm-chart-card adm-fadeUp" style={{ animationDelay: '.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div><div className="adm-section-title" style={{ marginBottom: 3 }}><div className="adm-section-title-bar" /><h3>Top Formateurs</h3></div><div style={{ paddingLeft: 11, fontSize: 12, color: '#94a3b8' }}>{valides.length} formateur{valides.length !== 1 ? 's' : ''} actif{valides.length !== 1 ? 's' : ''}</div></div>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => onTabChange('profs')}>Voir tous</button>
          </div>
          {topProfs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {topProfs.map((p, i) => {
                const nm = `${p.user_prenom || ''} ${p.user_nom || ''}`.trim();
                const note = parseFloat(p.note_moyenne || 0);
                const mats = p.tarifs_matieres ? [...new Set(p.tarifs_matieres.map(t => t.nom_matiere))].slice(0, 2) : [];
                const pals = [['#00153D', '#1E3A8A'], ['#065F46', '#047857'], ['#4C1D95', '#6D28D9'], ['#7C2D12', '#B45309']];
                const [a, b] = pals[nm.charCodeAt(0) % pals.length];
                return (
                  <div key={p.id} className="adm-top-row" onClick={() => onViewProf(p)}>
                    <span style={{ fontSize: 16, width: 26, textAlign: 'center', flexShrink: 0 }}>{medals[i]}</span>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${a},${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0, fontFamily: 'Cabinet Grotesk,sans-serif', overflow: 'hidden' }}>
                      {p.photo_url ? <img src={`http://localhost:8001${p.photo_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : nm.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 13, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nm}</div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{mats.length > 0 ? mats.join(' · ') : 'Aucune matière'}</div></div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>{note > 0 ? <><div style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', fontFamily: 'Cabinet Grotesk,sans-serif' }}>⭐ {note.toFixed(1)}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>{p.nb_avis} avis</div></> : <span className="adm-badge adm-badge-blue" style={{ fontSize: 10 }}>Nouveau ✨</span>}</div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState icon="👨‍🏫" title="Aucun formateur validé" />}
        </div>
        <div className="adm-chart-card adm-fadeUp" style={{ animationDelay: '.15s' }}>
          <div style={{ marginBottom: 16 }}><div className="adm-section-title" style={{ marginBottom: 3 }}><div className="adm-section-title-bar" /><h3>Activité de la plateforme</h3></div><div style={{ paddingLeft: 11, fontSize: 12, color: '#94a3b8' }}>{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {activiteKpis.map(s => (<div key={s.lbl} style={{ background: s.bg, borderRadius: 14, padding: '14px 16px', border: `1.5px solid ${s.color}22` }}><div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.val}</div><div style={{ fontSize: 11, color: s.color, opacity: .75, fontWeight: 600 }}>{s.lbl}</div></div>))}
          </div>
          {stats.total_reservations > 0 && (<div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1.5px solid #f1f5f9' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>Ce mois / total</span><span style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 12, color: '#3b82f6' }}>{stats.reservations_mois || 0} / {stats.total_reservations}</span></div><div className="adm-bar-track"><div className="adm-bar-fill" style={{ width: `${pctMois}%`, background: 'linear-gradient(90deg,#3b82f6,#60a5fa)' }} /></div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>{pctMois}% de l'activité réalisée ce mois</div></div>)}
        </div>
      </div>
    </div>
  );
}

function TableauBI({ data }) {
  const deduped = useMemo(() => {
    const map = {};
    data.forEach(m => { const key = (m.label || '').toLowerCase().trim(); if (!map[key]) map[key] = { label: m.label, nb_profs: 0, nb_resa: 0 }; map[key].nb_profs += (m.nb_profs || 0); map[key].nb_resa += (m.nb_resa || 0); });
    return Object.values(map).sort((a, b) => b.nb_profs !== a.nb_profs ? b.nb_profs - a.nb_profs : b.nb_resa - a.nb_resa);
  }, [data]);
  const maxResa = Math.max(...deduped.map(d => d.nb_resa || 0), 1);
  const getSat = (p, r) => {
    if (p === 0) return { l: 'Sans prof', c: '#94a3b8', bg: '#f1f5f9', dot: '#cbd5e1' };
    if (r === 0) return { l: 'Peu demandée', c: '#64748b', bg: '#f8fafc', dot: '#94a3b8' };
    if (r / p > 1.5) return { l: 'Forte demande', c: '#dc2626', bg: '#fef2f2', dot: '#ef4444' };
    if (r / p > 0.5) return { l: 'Bonne activité', c: '#059669', bg: '#ecfdf5', dot: '#10b981' };
    return { l: 'Démarrage', c: '#d97706', bg: '#fffbeb', dot: '#f59e0b' };
  };
  return (
    <div style={{ overflowX: 'auto', borderRadius: 16, border: '1.5px solid #f1f5f9' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr style={{ background: '#f8fafc' }}>{['#', 'Matière', 'Formateurs', 'Réservations', 'Taux', 'Statut'].map((h, i) => (<th key={i} style={{ padding: '10px 14px', textAlign: i > 1 ? 'center' : 'left', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap', borderBottom: '1.5px solid #f1f5f9' }}>{h}</th>))}</tr></thead>
        <tbody>
          {deduped.map((m, i) => {
            const r = m.nb_resa || 0, p = m.nb_profs || 0, sat = getSat(p, r);
            const pct = maxResa > 0 ? Math.round((r / maxResa) * 100) : 0;
            const taux = p > 0 ? (r / p).toFixed(1) : null;
            return (
              <tr key={i} style={{ borderBottom: i < deduped.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background .12s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 14px', color: '#cbd5e1', fontSize: 12, fontWeight: 700 }}>{i + 1}</td>
                <td style={{ padding: '12px 14px' }}><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 13, color: '#0F172A' }}>{m.label}</div></td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 10, background: p > 0 ? '#ecfdf5' : '#f1f5f9', color: p > 0 ? '#059669' : '#94a3b8', fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 15 }}>{p}</span></td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 10, background: r > 0 ? '#eff6ff' : '#f1f5f9', color: r > 0 ? '#3b82f6' : '#94a3b8', fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 15 }}>{r}</span><div style={{ width: 56, height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: '#3b82f6', borderRadius: 3, transition: 'width .6s ease' }} /></div></div></td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>{taux ? <span style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 13, color: parseFloat(taux) > 1 ? '#059669' : parseFloat(taux) > 0.5 ? '#d97706' : '#94a3b8' }}>{taux}</span> : <span style={{ color: '#e2e8f0', fontSize: 16 }}>—</span>}</td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: sat.bg, color: sat.c, whiteSpace: 'nowrap', border: `1.5px solid ${sat.dot}44` }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: sat.dot, flexShrink: 0 }} />{sat.l}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PieChartSVG({ data, size = 180 }) {
  const total = data.reduce((s, d) => s + (d.val || 0), 0);
  if (total === 0) return <div style={{ textAlign:'center', color:'#94a3b8', fontSize:13, padding:24 }}>Aucune donnée</div>;
  const cx = size / 2, cy = size / 2, r = size / 2 - 12;
  let startAngle = -Math.PI / 2;
  const slices = data.map(d => {
    const angle = (d.val / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle); const y1 = cy + r * Math.sin(startAngle);
    startAngle += angle;
    const x2 = cx + r * Math.cos(startAngle); const y2 = cy + r * Math.sin(startAngle);
    return { ...d, x1, y1, x2, y2, large: angle > Math.PI ? 1 : 0 };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block', margin:'0 auto' }}>
      {slices.map((s, i) => (<path key={i} d={`M ${cx} ${cy} L ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.large} 1 ${s.x2} ${s.y2} Z`} fill={s.color} stroke="#fff" strokeWidth={2} style={{ transition:'opacity .2s' }} onMouseEnter={e => e.target.style.opacity='.8'} onMouseLeave={e => e.target.style.opacity='1'} />))}
      <circle cx={cx} cy={cy} r={r * 0.52} fill="#fff" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={20} fontWeight={900} fill="#0F172A">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fontWeight={600} fill="#94a3b8">TOTAL</text>
    </svg>
  );
}

function LineChartSVG({ data, color = '#3b82f6' }) {
  if (!data || data.length === 0) return <div style={{ textAlign:'center', color:'#94a3b8', fontSize:13, padding:24 }}>Aucune donnée</div>;
  const W = 420, H = 140, padL = 36, padR = 16, padT = 16, padB = 32;
  const maxVal = Math.max(...data.map(d => d.val || 0), 1);
  const pts = data.map((d, i) => ({ x: padL + (i / Math.max(data.length - 1, 1)) * (W - padL - padR), y: padT + (1 - (d.val || 0) / maxVal) * (H - padT - padB), ...d }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H-padB} L ${pts[0].x} ${H-padB} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible' }}>
      <defs><linearGradient id="lgSig" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.18} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      {[0,.25,.5,.75,1].map((t, i) => (<line key={i} x1={padL} x2={W-padR} y1={padT + t*(H-padT-padB)} y2={padT + t*(H-padT-padB)} stroke="#f1f5f9" strokeWidth={1} />))}
      <path d={areaD} fill="url(#lgSig)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (<circle key={i} cx={p.x} cy={p.y} r={4} fill="#fff" stroke={color} strokeWidth={2.5}><title>{p.label} : {p.val}</title></circle>))}
      {pts.filter((_, i) => data.length <= 8 || i % Math.ceil(data.length/8) === 0).map((p, i) => (<text key={i} x={p.x} y={H-padB+14} textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight={600}>{p.label}</text>))}
      <text x={padL-4} y={padT+4} textAnchor="end" fontSize={9} fill="#94a3b8">{maxVal}</text>
      <text x={padL-4} y={H-padB} textAnchor="end" fontSize={9} fill="#94a3b8">0</text>
    </svg>
  );
}

function AnalytiquesTab({ stats, allProfs, chartData, onTabChange, signalements = [], users = [] }) {
  const [domainIdx, setDomainIdx] = useState(0);
  const [metric, setMetric] = useState('nb_profs');
  const [viewMode, setViewMode] = useState('matiere');
  const setViewModeAndReset = (v) => { setViewMode(v); if (v === 'matiere') setMetric('nb_profs'); };
  const [expandedNiv, setExpandedNiv] = useState({});
  const { reservations_par_mois = [], reservations_par_jour = [], matieres_par_domaine = [], modes_enseignement = [], statut_profs = [], par_niveau = [], entonnoir = {}, performance_profs = [] } = chartData;
  const totalResa = reservations_par_mois.reduce((a, b) => a + (b.total || 0), 0);
  const nbValides = statut_profs.find(s => s.label === 'Validés')?.val || 0;
  const totalP = statut_profs.reduce((a, b) => a + (b.val || 0), 0);
  const tauxValid = totalP > 0 ? Math.round((nbValides / totalP) * 100) : 0;
  const modesF = modes_enseignement.filter(m => (m.val || 0) > 0);
  const domActif = matieres_par_domaine[domainIdx] || null;
  const niveauxDomActif = par_niveau[domainIdx] || par_niveau.find(d => d.domaine === domActif?.domaine) || null;
  const STATUT_FIXED = [{ label: 'Validés', color: '#10b981' }, { label: 'En attente', color: '#f59e0b' }, { label: 'Refusés', color: '#ef4444' }];
  const statutData = STATUT_FIXED.map(s => ({ label: s.label, val: statut_profs.find(r => r.label === s.label)?.val ?? 0 }));
  const hasStatut = statutData.some(s => s.val > 0);
  const statutColors = STATUT_FIXED.map(s => s.color);
  const matiereData = useMemo(() => {
    if (!domActif?.matieres?.length) return [];
    const map = {};
    domActif.matieres.forEach(m => {
      const key = (m.matiere || m.nom || '').toLowerCase().trim();
      if (!key) return;
      if (!map[key]) map[key] = { label: m.matiere || m.nom || '', nb_profs: 0, nb_resa: 0 };
      map[key].nb_profs = Math.max(map[key].nb_profs, m.nb_profs || 0);
      map[key].nb_resa += (m.nb_resa || 0);
    });
    return Object.values(map).map(m => ({ ...m, val: metric === 'nb_resa' ? m.nb_resa : m.nb_profs })).sort((a, b) => b.val - a.val || b.nb_profs - a.nb_profs);
  }, [domActif, metric]);
  const kpis = [
    { icon: '📊', label: 'Total réservations', val: totalResa || stats.total_reservations || 0, color: '#3b82f6', bg: '#eff6ff' },
    { icon: '📅', label: 'Ce mois', val: stats.reservations_mois || reservations_par_mois.at(-1)?.total || 0, color: '#10b981', bg: '#ecfdf5' },
    { icon: '✅', label: 'Taux validation', val: tauxValid > 0 ? `${tauxValid}%` : '—', color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: '⏳', label: 'En attente valid.', val: statutData.find(s => s.label === 'En attente')?.val || stats.en_attente || 0, color: '#f59e0b', bg: '#fffbeb' },
  ];

  const VueParNiveau = () => {
    if (!niveauxDomActif?.niveaux?.length) return <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}><div style={{ fontSize: 40, marginBottom: 12 }}>📂</div><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 5 }}>Aucun niveau configuré</div></div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {niveauxDomActif.niveaux.map((niv, ni) => {
          const isOpen = expandedNiv[ni] === true;
          const totalR = niv.total_resa || niv.matieres.reduce((a, m) => a + (m.nb_resa || 0), 0);
          const totalP2 = niv.total_profs || niv.matieres.reduce((a, m) => a + (m.nb_profs || 0), 0);
          const hasActivity = totalR > 0 || totalP2 > 0;
          return (
            <div key={ni} style={{ border: `1.5px solid ${hasActivity ? '#bfdbfe' : '#f1f5f9'}`, borderRadius: 18, overflow: 'hidden', transition: 'all .2s' }}>
              <div onClick={() => setExpandedNiv(p => ({ ...p, [ni]: !isOpen }))} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: hasActivity ? 'linear-gradient(135deg,#eff6ff,#f0fdf4)' : '#fafbfc', cursor: 'pointer' }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: hasActivity ? 'linear-gradient(135deg,#3b82f6,#10b981)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 15, color: '#0F172A' }}>{niv.niveau}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 4, fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                    <span>📚 {niv.matieres.length} matière{niv.matieres.length > 1 ? 's' : ''}</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>👨‍🏫 {totalP2}</span>
                    {totalR > 0 && <span style={{ color: '#3b82f6', fontWeight: 700 }}>📅 {totalR}</span>}
                  </div>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#94a3b8', transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
              </div>
              {isOpen && (
                <div style={{ padding: '12px 20px 16px', background: '#fff' }}>
                  {niv.matieres.length === 0 ? <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>Aucune matière dans ce niveau</div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
                      {niv.matieres.map((m, mi) => {
                        const r = m.nb_resa || 0, p = m.nb_profs || 0;
                        const sat = p === 0 ? { c: '#94a3b8', bg: '#f1f5f9', l: 'Sans prof' } : r === 0 ? { c: '#64748b', bg: '#f8fafc', l: 'Peu demandée' } : r / p > 1.5 ? { c: '#dc2626', bg: '#fef2f2', l: 'Forte demande' } : r / p > 0.5 ? { c: '#059669', bg: '#ecfdf5', l: 'Bonne activité' } : { c: '#d97706', bg: '#fffbeb', l: 'Démarrage' };
                        return (<div key={mi} style={{ background: sat.bg, borderRadius: 14, padding: '12px 14px', border: `1.5px solid ${sat.c}22`, display: 'flex', flexDirection: 'column', gap: 7 }}><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 13, color: '#0F172A' }}>{m.matiere}</div><div style={{ display: 'flex', gap: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>👨‍🏫 {p}</span><span style={{ color: '#e2e8f0' }}>·</span><span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>📅 {r}</span></div><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,.6)', color: sat.c, alignSelf: 'flex-start', border: `1px solid ${sat.c}44` }}>{sat.l}</span></div>);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => exportAdminAnalytiques(stats, chartData, allProfs)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#00153D', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: '.82rem', boxShadow: '0 4px 14px rgba(0,21,61,0.2)', transition: 'all .18s' }} onMouseEnter={e => { e.currentTarget.style.background = '#1E3A8A'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.background = '#00153D'; e.currentTarget.style.transform = 'none'; }}>📄 Exporter rapport PDF</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {kpis.map((k, i) => (
          <div key={i} className="adm-stat adm-scaleIn" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="adm-stat-accent" style={{ background: k.color }} />
            <div style={{ width: 40, height: 40, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 }}>{k.icon}</div>
            <div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontSize: 28, fontWeight: 900, color: k.color, lineHeight: 1, marginBottom: 5 }}>{k.val}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{k.label}</div>
          </div>
        ))}
      </div>
      {(() => {
        const sigNouveaux = signalements.filter(s => s.statut === 'nouveau').length;
        const sigIgnores  = signalements.filter(s => s.statut === 'ignoré').length;
        const sigTraites  = signalements.filter(s => s.statut === 'traité').length;
        const nbBloques   = (users || []).filter(u => u.statut === 'bloqué').length;
        const nbAvertis   = Math.max(0, sigTraites - nbBloques);
        const totalSig    = signalements.length;
        const doughnutData = [
          { label: 'En attente',     val: sigNouveaux, color: '#3b82f6' },
          { label: 'Ignorés',        val: sigIgnores,  color: '#94a3b8' },
          { label: 'Avertissements', val: nbAvertis,   color: '#f59e0b' },
          { label: 'Blocages',       val: nbBloques,   color: '#ef4444' },
        ].filter(d => d.val > 0);
        const doughnutColors = doughnutData.map(d => d.color);
        const MOIS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
        const sigParMois = {};
        signalements.forEach(s => {
          if (!s.created_at) return;
          const d = new Date(s.created_at);
          const key = `${MOIS_FR[d.getMonth()]} ${d.getFullYear()}`;
          sigParMois[key] = (sigParMois[key] || 0) + 1;
        });
        const MOIS_ORDER = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
        const moisKeys = Object.keys(sigParMois).sort((a, b) => {
          const [mA, yA] = a.split(' ');
          const [mB, yB] = b.split(' ');
          if (yA !== yB) return parseInt(yA) - parseInt(yB);
          return MOIS_ORDER.indexOf(mA) - MOIS_ORDER.indexOf(mB);
        });
        const nbMois   = moisKeys.length;
        let chartMode = 'mois';
        let lineData  = [];
        if (nbMois > 1) {
          chartMode = 'mois';
          lineData  = moisKeys.map(k => ({ label: k, val: sigParMois[k], mois: k })).slice(-8);
        } else if (nbMois === 1) {
          chartMode = 'semaine';
          const semaines = { 'S1': 0, 'S2': 0, 'S3': 0, 'S4': 0 };
          signalements.forEach(s => {
            if (!s.created_at) return;
            const jour = new Date(s.created_at).getDate();
            if      (jour <= 7)  semaines['S1']++;
            else if (jour <= 14) semaines['S2']++;
            else if (jour <= 21) semaines['S3']++;
            else                 semaines['S4']++;
          });
          lineData = Object.entries(semaines)
            .map(([label, val]) => ({ label, val, mois: label }))
            .filter((_, i) => {
              const now = new Date();
              const jourCourant = now.getDate();
              if (i === 0) return true;
              if (i === 1) return jourCourant > 7;
              if (i === 2) return jourCourant > 14;
              return jourCourant > 21;
            });
        }
        const hasMultiPts = lineData.length > 1;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, marginBottom: 4 }}>
            <div className="adm-chart-card">
              <SectionTitle title="Résultats des signalements" sub={totalSig > 0 ? `${totalSig} signalement${totalSig > 1 ? 's' : ''} au total` : 'Aucun signalement'} />
              {totalSig > 0 && doughnutData.length > 0 ? (
                <div className="adm-canvas-wrap"><ChartDoughnut data={doughnutData} colors={doughnutColors} /></div>
              ) : (
                <EmptyState icon="🚨" title="Aucun signalement" sub="Les données apparaîtront dès les premiers signalements" />
              )}
            </div>
            <div className="adm-chart-card">
              <SectionTitle title="Évolution des signalements" sub={chartMode === 'semaine' ? `Par semaine · ${moisKeys[0] || ''}` : 'Par mois · données réelles'} />
              {totalSig === 0 ? (
                <EmptyState icon="📈" title="Aucun signalement enregistré" sub="La courbe apparaîtra avec le temps" />
              ) : hasMultiPts ? (
                <div className="adm-canvas-wrap"><ChartLineSig data={lineData} /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
                  {lineData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 36, fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: 13, color: '#6366f1', textAlign: 'right', flexShrink: 0 }}>{d.label}</div>
                      <div style={{ flex: 1, height: 28, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg,#6366f1,#818cf8)', borderRadius: 8, transition: 'width 1.2s cubic-bezier(.22,1,.36,1)', display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{d.val} signalement{d.val > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 20, color: '#6366f1', width: 30, flexShrink: 0 }}>{d.val}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 4, padding: '10px 14px', background: '#f0f4ff', border: '1.5px solid #c7d2fe', borderRadius: 12, fontSize: 12, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📊</span>
                    <span>La courbe mensuelle apparaîtra le mois prochain avec plus de données.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, marginBottom: 4 }}>
        <button onClick={() => onTabChange('signalements')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 12, transition: 'all .18s' }} onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'none'; }}>
          🚨 Gérer les signalements →
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="adm-chart-card"><SectionTitle title="Réservations par mois" sub={totalResa > 0 ? `${totalResa} au total` : 'Aucune encore'} />{reservations_par_mois.length > 0 ? <div className="adm-canvas-wrap"><ChartLine data={reservations_par_mois} /></div> : <EmptyState icon="📈" title="Aucune donnée" />}</div>
        <div className="adm-chart-card"><SectionTitle title="Activité par jour de semaine" />{reservations_par_jour.length > 0 ? <div className="adm-canvas-wrap"><ChartBar data={reservations_par_jour} /></div> : <EmptyState icon="📊" title="Aucune donnée" />}</div>
      </div>
      <div style={{ background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 24, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(180deg,#3b82f6,#8b5cf6)' }} />
              <h3 style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 17, color: '#0F172A', margin: 0 }}>Analyse par matière{domActif && <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', marginLeft: 8 }}>— {domActif.domaine}</span>}</h3>
            </div>
            <div style={{ paddingLeft: 13, fontSize: 12, color: '#94a3b8' }}>{matiereData.length} matière{matiereData.length !== 1 ? 's' : ''} uniques · données réelles</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: '#f8fafc', borderRadius: 14, border: '1.5px solid #f1f5f9' }}>
              {matieres_par_domaine.map((d, i) => (<button key={i} onClick={() => setDomainIdx(i)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', background: i === domainIdx ? '#3b82f6' : 'transparent', color: i === domainIdx ? '#fff' : '#64748b', transition: 'all .18s' }}>{d.domaine}</button>))}
            </div>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: '#f8fafc', borderRadius: 14, border: '1.5px solid #f1f5f9' }}>
              {[['matiere', '📚 Par matière'], ['niveau', '🎓 Par niveau']].map(([v, l]) => (<button key={v} onClick={() => setViewModeAndReset(v)} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', background: viewMode === v ? '#8b5cf6' : 'transparent', color: viewMode === v ? '#fff' : '#64748b', transition: 'all .18s' }}>{l}</button>))}
            </div>
            {viewMode === 'matiere' && (
              <div style={{ display: 'flex', gap: 4, padding: 4, background: '#f8fafc', borderRadius: 14, border: '1.5px solid #f1f5f9' }}>
                {[['nb_profs', '👨‍🏫 Formateurs'], ['nb_resa', '📅 Réservations']].map(([k, l]) => (<button key={k} onClick={() => setMetric(k)} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', background: metric === k ? '#0ea5e9' : 'transparent', color: metric === k ? '#fff' : '#64748b', transition: 'all .18s' }}>{l}</button>))}
              </div>
            )}
          </div>
        </div>
        {viewMode === 'matiere' && (matiereData.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 22 }}>
              {[{ icon: '📚', label: 'Matières uniques', val: matiereData.length, color: '#3b82f6', bg: '#eff6ff' }, { icon: '👨‍🏫', label: 'Formateurs actifs', val: matiereData.reduce((a, m) => a + (m.nb_profs || 0), 0), color: '#10b981', bg: '#ecfdf5' }, { icon: '📅', label: 'Réservations', val: matiereData.reduce((a, m) => a + (m.nb_resa || 0), 0), color: '#8b5cf6', bg: '#f5f3ff' }, { icon: '🎯', label: 'Sans formateur', val: matiereData.filter(m => m.nb_profs === 0).length, color: '#ef4444', bg: '#fef2f2' }].map((k, i) => (<div key={i} style={{ background: k.bg, borderRadius: 14, padding: '12px 14px', border: `1.5px solid ${k.color}22`, display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{k.icon}</div><div><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 20, color: k.color, lineHeight: 1 }}>{k.val}</div><div style={{ fontSize: 10, color: k.color, opacity: .7, marginTop: 2, fontWeight: 600 }}>{k.label}</div></div></div>))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 22, alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: metric === 'nb_resa' ? '#8b5cf6' : '#10b981' }} /><span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>{metric === 'nb_resa' ? 'Réservations' : 'Formateurs'} par matière</span></div>
                <div style={{ background: '#fafbfc', borderRadius: 14, padding: '14px 10px', border: '1.5px solid #f1f5f9' }}>
                  {matiereData.filter(m => m.val > 0).length > 0
                    ? <ChartHorizBar key={`chart-${metric}-${domainIdx}-${viewMode}`} data={matiereData.filter(m => m.val > 0)} metric={metric} />
                    : <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8', fontSize: 13 }}>Aucune donnée à afficher pour ce critère</div>
                  }
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#8b5cf6' }} /><span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Tableau de synthèse</span></div>
                <TableauBI key={`tableau-${metric}-${domainIdx}-${viewMode}`} data={matiereData} />
              </div>
            </div>
          </>
        ) : <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}><div style={{ fontSize: 44, marginBottom: 14 }}>📊</div><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 5 }}>{domActif ? 'Aucune matière' : 'Sélectionnez un domaine'}</div></div>)}
        {viewMode === 'niveau' && <VueParNiveau />}
      </div>

      {entonnoir && entonnoir.etudiants_inscrits > 0 && (() => {
        const steps = [
          { icon: '👥', label: 'Étudiants inscrits',    val: entonnoir.etudiants_inscrits,    sub: '100% — base totale',                                                                                                                                                 color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
          { icon: '🎯', label: 'Étudiants actifs',      val: entonnoir.etudiants_actifs,      sub: `${entonnoir.taux_activation}% ont réservé`,                                                                                                                           color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
          { icon: '📋', label: 'Réservations envoyées', val: entonnoir.reservations_total,    sub: `${entonnoir.etudiants_actifs > 0 ? (entonnoir.reservations_total / entonnoir.etudiants_actifs).toFixed(1) : 0} par étudiant actif`,                                    color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d' },
          { icon: '✅', label: 'Confirmées',            val: entonnoir.reservations_confirmees, sub: `${entonnoir.taux_confirmation}% de taux`,                                                                                                                            color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7' },
          { icon: '🏁', label: 'Terminées',             val: entonnoir.reservations_terminees, sub: `${entonnoir.reservations_confirmees > 0 ? Math.round(entonnoir.reservations_terminees / entonnoir.reservations_confirmees * 100) : 0}% des confirmées`,               color: '#059669', bg: '#d1fae5', border: '#34d399' },
        ];
        return (
          <div style={{ background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 24, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(180deg,#f59e0b,#ef4444)' }} />
              <h3 style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 17, color: '#0F172A', margin: 0 }}>Entonnoir de conversion</h3>
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 13, marginBottom: 24 }}>De l'inscription à la séance terminée</div>
            <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', marginBottom: 22 }}>
              {steps.map((step, i) => (
                <React.Fragment key={i}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: '100%', padding: '16px 12px', borderRadius: 16, textAlign: 'center', background: step.bg, border: `1.5px solid ${step.border}` }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{step.icon}</div>
                      <div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 26, color: step.color, lineHeight: 1, marginBottom: 4 }}>{step.val}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: step.color, marginBottom: 4 }}>{step.label}</div>
                      <div style={{ fontSize: 10, color: step.color, opacity: .65, fontStyle: 'italic' }}>{step.sub}</div>
                    </div>
                  </div>
                  {i < steps.length - 1 && <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', paddingBottom: 8, flexShrink: 0 }}><div style={{ fontSize: 18, color: '#cbd5e1' }}>›</div></div>}
                </React.Fragment>
              ))}
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: '16px 20px', border: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 13, color: '#0F172A' }}>Santé globale</span>
                <span style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 14, color: entonnoir.taux_confirmation >= 60 ? '#059669' : entonnoir.taux_confirmation >= 30 ? '#d97706' : '#dc2626' }}>
                  {entonnoir.taux_confirmation >= 60 ? '🟢 Bonne' : entonnoir.taux_confirmation >= 30 ? '🟡 Moyenne' : '🔴 À améliorer'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[
                  { label: "Taux d'activation",    val: `${entonnoir.taux_activation}%`,   good: entonnoir.taux_activation >= 30,   color: '#6366f1' },
                  { label: 'Taux de confirmation', val: `${entonnoir.taux_confirmation}%`, good: entonnoir.taux_confirmation >= 60, color: '#10b981' },
                  { label: 'Taux de refus',        val: `${entonnoir.taux_refus}%`,        good: entonnoir.taux_refus <= 20,        color: '#ef4444' },
                ].map((m, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1.5px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 20, color: m.color }}>{m.val}</span>
                      <span style={{ fontSize: 14 }}>{m.good ? '✅' : '⚠️'}</span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: m.color, borderRadius: 3, width: m.val, transition: 'width 1.2s cubic-bezier(.22,1,.36,1)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {(() => {
        const demandesStats = chartData.demandes_stats || [];
        if (!demandesStats.length) return null;
        const total      = demandesStats.reduce((a, d) => a + (d.nb || 0), 0);
        const approuvees = demandesStats.find(d => d.statut === 'approuvé')?.nb || 0;
        const enAttente  = demandesStats.find(d => d.statut === 'en_attente')?.nb || 0;
        const refusees   = demandesStats.find(d => d.statut === 'refusé')?.nb || 0;
        const tauxAppro  = total > 0 ? Math.round(approuvees / total * 100) : 0;
        const COLORS  = { 'approuvé': '#10B981', 'en_attente': '#F59E0B', 'refusé': '#EF4444' };
        const LABELS  = { 'approuvé': 'Approuvées', 'en_attente': 'En attente', 'refusé': 'Refusées' };
        const ICONS   = { 'approuvé': '✅', 'en_attente': '⏳', 'refusé': '❌' };
        const DonutDemandes = () => {
          const [anim, setAnim] = useState(false);
          useEffect(() => { const t = setTimeout(() => setAnim(true), 400); return () => clearTimeout(t); }, []);
          const r = 54, cx = 70, cy = 70, circ = 2 * Math.PI * r;
          let cum = 0;
          return (
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={14} />
                {demandesStats.map((d, i) => {
                  const pct   = total > 0 ? d.nb / total : 0;
                  const color = COLORS[d.statut] || '#94A3B8';
                  const dash  = anim ? `${pct * circ} ${circ}` : `0 ${circ}`;
                  const rot   = -90 + (cum / Math.max(total, 1)) * 360;
                  cum += d.nb;
                  return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" strokeDasharray={dash} style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${rot}deg)`, transition: `stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1) ${i * 0.15}s` }} />;
                })}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: '1.5rem', color: '#10B981', lineHeight: 1 }}>{tauxAppro}%</div>
                <div style={{ fontSize: '.58rem', color: '#94A3B8', fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.05em' }}>approuvées</div>
              </div>
            </div>
          );
        };
        return (
          <div style={{ background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 24, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(180deg,#4F46E5,#818CF8)' }} />
              <h3 style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 17, color: '#0F172A', margin: 0 }}>📚 Analyse des demandes de matières</h3>
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>{total} demande{total !== 1 ? 's' : ''} au total</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 22 }}>
              {[
                { icon: '⏳', label: 'En attente', val: enAttente,  color: '#B45309', bg: '#FFFBEB', border: '#FCD34D' },
                { icon: '✅', label: 'Approuvées', val: approuvees, color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7' },
                { icon: '❌', label: 'Refusées',   val: refusees,   color: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5' },
              ].map((k, i) => (
                <div key={i} style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{k.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: '1.5rem', color: k.color, lineHeight: 1 }}>{k.val}</div>
                    <div style={{ fontSize: '.68rem', color: k.color, opacity: .7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>{k.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 28, alignItems: 'center' }}>
              <DonutDemandes />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {demandesStats.map((d, i) => {
                  const color = COLORS[d.statut] || '#94A3B8';
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '.83rem', fontWeight: 700, color: '#0F172A' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                          {ICONS[d.statut]} {LABELS[d.statut] || d.statut}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: '.95rem', color }}>{d.pct}%</span>
                          <span style={{ fontSize: '.72rem', color: '#94A3B8', fontWeight: 600 }}>{d.nb} demande{d.nb !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div style={{ height: 10, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 6, background: color, width: `${d.pct}%`, transition: 'width 1.3s cubic-bezier(.22,1,.36,1) .3s' }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 4, padding: '11px 16px', background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#065F46' }}>🎯 Taux d'approbation global</span>
                  <span style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: '1.05rem', color: '#065F46' }}>{tauxAppro}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="adm-chart-card"><SectionTitle title="Modes d'enseignement" sub={`${allProfs.filter(p => p.statut_validation === 'validé').length} formateurs validés`} />{modesF.length > 0 ? <div className="adm-canvas-wrap"><ChartDoughnut data={modesF} colors={['#3b82f6', '#10b981', '#8b5cf6']} /></div> : <EmptyState icon="🌐" title="Aucun formateur validé" />}</div>
        <div className="adm-chart-card"><SectionTitle title="Statuts formateurs" sub="Validés · En attente · Refusés" />{hasStatut ? <div className="adm-canvas-wrap"><ChartDoughnut data={statutData} colors={statutColors} /></div> : <EmptyState icon="👨‍🏫" title="Aucun formateur enregistré" />}</div>
      </div>
    </div>
  );
}


function ProfsTab({ allProfs, structure = [], onView, onValider, onRefuser }) {
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterDomaine, setFilterDomaine] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');
  const [filterMatiere, setFilterMatiere] = useState('');

  const counts = useMemo(() => ({
    tous:       allProfs.length,
    'validé':   allProfs.filter(p => p.statut_validation === 'validé').length,
    en_attente: allProfs.filter(p => p.statut_validation === 'en_attente').length,
    'refusé':   allProfs.filter(p => p.statut_validation === 'refusé').length,
    'bloqué':   allProfs.filter(p => p.user_statut === 'bloqué').length,
  }), [allProfs]);

  const referentiel = structure;
  const allDomaines = useMemo(() => {
    if (referentiel.length > 0) return referentiel.map(d => d.nom);
    const s = new Set(); allProfs.forEach(p => p.tarifs_matieres?.forEach(t => { if (t.nom_domaine && t.nom_domaine !== 'N/A') s.add(t.nom_domaine); })); return [...s].sort();
  }, [referentiel, allProfs]);
  const allNiveaux = useMemo(() => {
    if (referentiel.length > 0) { const dom = referentiel.find(d => d.nom === filterDomaine); if (filterDomaine && dom) return (dom.niveaux || []).map(n => n.nom); return referentiel.flatMap(d => (d.niveaux || []).map(n => n.nom)); }
    const s = new Set(); allProfs.forEach(p => p.tarifs_matieres?.forEach(t => { if (t.nom_niveau && t.nom_niveau !== 'N/A' && (!filterDomaine || t.nom_domaine === filterDomaine)) s.add(t.nom_niveau); })); return [...s].sort();
  }, [referentiel, allProfs, filterDomaine]);
  const allMatieres = useMemo(() => {
    if (referentiel.length > 0) { const domaines = filterDomaine ? referentiel.filter(d => d.nom === filterDomaine) : referentiel; const s = new Set(); domaines.forEach(d => (d.niveaux || []).forEach(n => { if (!filterNiveau || n.nom === filterNiveau) (n.matieres || []).forEach(m => s.add(m.nom)); })); return [...s].sort(); }
    const s = new Set(); allProfs.forEach(p => p.tarifs_matieres?.forEach(t => { if (!filterDomaine || t.nom_domaine === filterDomaine) s.add(t.nom_matiere); })); return [...s].sort();
  }, [referentiel, allProfs, filterDomaine, filterNiveau]);

  const filtered = useMemo(() => allProfs.filter(p => {
    const nm = `${p.user_prenom || ''} ${p.user_nom || ''}`.toLowerCase();
    if (filter === 'bloqué') { if (p.user_statut !== 'bloqué') return false; }
    else if (filter !== 'tous' && p.statut_validation !== filter) return false;
    if (search && !nm.includes(search.toLowerCase()) && !(p.ville || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDomaine && !p.tarifs_matieres?.some(t => t.nom_domaine === filterDomaine)) return false;
    if (filterNiveau && !p.tarifs_matieres?.some(t => t.nom_niveau === filterNiveau)) return false;
    if (filterMatiere && !p.tarifs_matieres?.some(t => t.nom_matiere === filterMatiere)) return false;
    return true;
  }), [allProfs, filter, search, filterDomaine, filterNiveau, filterMatiere]);

  const pending = allProfs.filter(p => p.statut_validation === 'en_attente');
  const FILTERS = [
    { k: 'tous',       l: 'Tous',       c: '#0F172A' },
    { k: 'validé',     l: 'Validés',    c: '#10b981' },
    { k: 'en_attente', l: 'En attente', c: '#f59e0b' },
    { k: 'refusé',     l: 'Refusés',    c: '#ef4444' },
    { k: 'bloqué',     l: '🚫 Bloqués', c: '#7c3aed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {pending.length > 0 && (
        <div className="adm-card" style={{ padding: '18px 20px', borderColor: '#fcd34d', background: '#fffbeb' }}>
          <div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 800, fontSize: 13, color: '#b45309', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>⚠ ACTION REQUISE</span>
            {pending.length} professeur{pending.length > 1 ? 's' : ''} en attente
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pending.map(p => {
              const nm = `${p.user_prenom || ''} ${p.user_nom || ''}`.trim();
              const mts = p.tarifs_matieres ? [...new Set(p.tarifs_matieres.map(t => t.nom_matiere))].slice(0, 2) : [];
              return (
                <div key={p.id} className="adm-pending-row">
                  <ProfAvatar prof={p} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{nm}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{p.ville && `${p.ville} / `}{mts.join(', ') || 'Matières non renseignées'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => onView(p)}>Voir</button>
                    <button className="adm-btn adm-btn-success adm-btn-sm" onClick={() => onValider(p.id)}>✓ Valider</button>
                    <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => onRefuser(p.id, nm)}>✕ Refuser</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="adm-search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <span className="adm-search-icon">🔍</span>
          <input className="adm-input" placeholder="Rechercher par nom ou ville..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: '7px 14px', borderRadius: 22, border: `1.5px solid ${filter === f.k ? f.c : '#e2e8f0'}`, background: filter === f.k ? `${f.c}14` : '#fff', color: filter === f.k ? f.c : '#64748b', fontSize: 12, fontWeight: filter === f.k ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}>
              {f.l}<span style={{ fontSize: 10, fontWeight: 800, background: filter === f.k ? `${f.c}20` : '#f8fafc', color: filter === f.k ? f.c : '#94a3b8', padding: '1px 6px', borderRadius: 8, minWidth: 18, textAlign: 'center' }}>{counts[f.k] || 0}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['grid', '⊞'], ['list', '≡']].map(([v, i]) => (
            <button key={v} onClick={() => setViewMode(v)} style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid #e2e8f0', background: viewMode === v ? '#3b82f6' : '#fff', color: viewMode === v ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>{i}</button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}><strong style={{ color: '#0F172A' }}>{filtered.length}</strong> résultat{filtered.length > 1 ? 's' : ''}</span>
        <button onClick={() => exportAdminProfs(filtered)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#00153D', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: '.78rem', boxShadow: '0 3px 10px rgba(0,21,61,0.18)', transition: 'all .15s', whiteSpace: 'nowrap' }} onMouseEnter={e => e.currentTarget.style.background = '#1E3A8A'} onMouseLeave={e => e.currentTarget.style.background = '#00153D'}>📄 PDF</button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '14px 18px', background: '#f8fafc', borderRadius: 16, border: '1.5px solid #f1f5f9' }}>
        {[
          { label: '🗂 Domaine', val: filterDomaine, set: (v) => { setFilterDomaine(v); setFilterNiveau(''); setFilterMatiere(''); }, opts: allDomaines, ph: 'Tous les domaines' },
          { label: '🎓 Niveau',  val: filterNiveau,  set: (v) => { setFilterNiveau(v); setFilterMatiere(''); },                   opts: allNiveaux,  ph: 'Tous les niveaux' },
          { label: '📚 Matière', val: filterMatiere, set: setFilterMatiere,                                                          opts: allMatieres, ph: 'Toutes les matières' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>{f.label}</span>
            <div style={{ position: 'relative' }}>
              <select value={f.val} onChange={e => f.set(e.target.value)} style={{ background: '#fff', border: `1.5px solid ${f.val ? '#3b82f6' : '#e2e8f0'}`, borderRadius: 10, color: '#0F172A', padding: '8px 28px 8px 12px', fontSize: 12, fontWeight: 600, outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', width: '100%', transition: 'border-color .15s' }}>
                <option value="">{f.ph}</option>
                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#94a3b8', pointerEvents: 'none' }}>▾</span>
            </div>
          </div>
        ))}
        {(filterDomaine || filterNiveau || filterMatiere) && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={() => { setFilterDomaine(''); setFilterNiveau(''); setFilterMatiere(''); }} style={{ padding: '8px 14px', background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>✕ Réinitialiser</button>
          </div>
        )}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="🔍" title="Aucun formateur trouvé" sub="Modifiez vos critères" />
        : viewMode === 'grid'
          ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>{filtered.map((p, i) => <ProfCardGrid key={p.id} prof={p} index={i} onView={onView} onValider={onValider} onRefuser={onRefuser} />)}</div>
          : (
            <div className="adm-card" style={{ overflow: 'hidden' }}>
              <table className="adm-table">
                <thead><tr><th>Formateur</th><th>Matières</th><th>Ville</th><th>Mode</th><th>Note</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(p => {
                    const nm = `${p.user_prenom || ''} ${p.user_nom || ''}`.trim();
                    const mts = p.tarifs_matieres ? [...new Set(p.tarifs_matieres.map(t => t.nom_matiere))].slice(0, 2) : [];
                    const note = parseFloat(p.note_moyenne || 0);
                    const estBloque = p.user_statut === 'bloqué';
                    return (
                      <tr key={p.id}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><ProfAvatar prof={p} size={34} /><div><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{nm}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{p.email}</div></div></div></td>
                        <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mts.map(m => <span key={m} className="adm-badge adm-badge-blue" style={{ fontSize: 10 }}>{m}</span>)}{mts.length === 0 && <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>-</span>}</div></td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{p.ville || '-'}</td>
                        <td><ModeBadge m={p.mode_enseignement} /></td>
                        <td style={{ fontSize: 13, fontWeight: 700 }}>{note > 0 ? `⭐ ${note.toFixed(1)}` : '-'}</td>
                        <td><StatutBadge s={estBloque ? 'bloqué' : p.statut_validation} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 5 }}>
                            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => onView(p)}>Voir</button>
                            {p.statut_validation === 'en_attente' && <>
                              <button className="adm-btn adm-btn-success adm-btn-sm" onClick={() => onValider(p.id)}>✓</button>
                              <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => onRefuser(p.id, nm)}>✕</button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
      }
    </div>
  );
}

function ProfCardGrid({ prof, index, onView, onValider, onRefuser }) {
  const nm = `${prof.user_prenom || ''} ${prof.user_nom || ''}`.trim() || 'Professeur';
  const mats = prof.tarifs_matieres ? [...new Set(prof.tarifs_matieres.map(t => t.nom_matiere))].slice(0, 3) : [];
  const niveaux = [...new Set((prof.tarifs_matieres || []).map(t => t.nom_niveau).filter(Boolean))].slice(0, 2);
  const tarifMin = [prof.tarif_en_ligne, prof.tarif_presentiel].filter(v => isTarif(v)).map(Number);
  const minT = tarifMin.length ? Math.min(...tarifMin) : null;
  const note = parseFloat(prof.note_moyenne || 0);
  const estBloque = prof.user_statut === 'bloqué';
  const statut = estBloque ? 'bloqué' : prof.statut_validation;
  const accentCfg = {
    'validé':     { color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7' },
    'en_attente': { color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d' },
    'refusé':     { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
    'bloqué':     { color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  }[statut] || { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' };

  return (
    <div
      className="adm-scaleIn"
      style={{
        animationDelay: `${index * 50}ms`,
        opacity: estBloque ? .75 : 1,
        background: '#fff',
        border: `1.5px solid ${accentCfg.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all .22s cubic-bezier(.22,1,.36,1)',
        boxShadow: '0 2px 8px rgba(0,0,0,.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => onView(prof)}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 28px ${accentCfg.color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.05)'; }}
    >
      <div style={{ height: 4, background: accentCfg.color, flexShrink: 0 }} />
      <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, border: `2px solid ${accentCfg.border}`, overflow: 'hidden', flexShrink: 0, background: accentCfg.bg }}>
          <ProfAvatar prof={prof} size={48} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
            <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 13, color: '#0F172A', lineHeight: 1.2 }}>{nm}</div>
            <StatutBadge s={statut} />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            {prof.ville && <span style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>📍 {prof.ville}</span>}
            <ModeBadge m={prof.mode_enseignement} />
            {minT && <span style={{ fontSize: 10, fontWeight: 800, color: accentCfg.color, background: accentCfg.bg, padding: '2px 7px', borderRadius: 8, border: `1px solid ${accentCfg.border}` }}>dès {minT} DT/séance</span>}
          </div>
          {mats.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 5 }}>
              {mats.map(m => <span key={m} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>{m}</span>)}
            </div>
          )}
          {niveaux.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
              {niveaux.map(n => <span key={n} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#fefce8', color: '#a16207', border: '1px solid #fef08a' }}>🎓 {n}</span>)}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <span style={{ color: '#f59e0b' }}>⭐</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>{note > 0 ? note.toFixed(1) : '—'}</span>
            <span>{prof.nb_avis || 0} avis</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${accentCfg.border}`, padding: '10px 14px', display: 'flex', gap: 7, background: accentCfg.bg }}>
        <button
          className="adm-btn adm-btn-primary adm-btn-sm"
          style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}
          onClick={e => { e.stopPropagation(); onView(prof); }}
        >Voir dossier</button>
        {statut === 'en_attente' && <>
          <button className="adm-btn adm-btn-success adm-btn-sm" onClick={e => { e.stopPropagation(); onValider(prof.id); }} title="Valider">✓</button>
          <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={e => { e.stopPropagation(); onRefuser(prof.id, nm); }} title="Refuser">✕</button>
        </>}
      </div>
    </div>
  );
}


function DemandesTab({ demandes, onApprouver, onRefuser }) {
  const pending = demandes.filter(d => d.statut === 'en_attente');
  const archived = demandes.filter(d => d.statut !== 'en_attente');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { label: 'En attente', count: pending.length, color: '#B45309', bg: '#FFFBEB', border: '#FCD34D', icon: '⏳', shadow: 'rgba(245,158,11,0.2)' },
          { label: 'Approuvées', count: demandes.filter(d => d.statut === 'approuvé').length, color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7', icon: '✅', shadow: 'rgba(16,185,129,0.2)' },
          { label: 'Refusées', count: demandes.filter(d => d.statut === 'refusé').length, color: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5', icon: '❌', shadow: 'rgba(239,68,68,0.2)' },
        ].map((s, i) => (
          <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 20, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: `0 2px 12px ${s.shadow}`, transition: 'all .22s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${s.shadow}`; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 2px 12px ${s.shadow}`; }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{s.icon}</div>
            <div><div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontSize: '2.2rem', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.count}</div><div style={{ fontSize: '.72rem', color: s.color, opacity: .7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</div></div>
          </div>
        ))}
      </div>
      {pending.length > 0 ? (
        <div className="adm-card" style={{ padding: 22 }}>
          <SectionTitle title="Demandes en attente" sub="À traiter en priorité" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {pending.map((d, i) => (
              <div key={d.id} className="adm-scaleIn" style={{ animationDelay: `${i * 60}ms`, background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)', border: '1.5px solid #c4b5fd', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 16px rgba(139,92,246,0.10)', transition: 'all .22s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.10)'; }}
              >
                <div style={{ height: 5, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa, #c4b5fd)' }} />
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}>📚</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 15, color: '#3b0764', marginBottom: 5, lineHeight: 1.2 }}>{d.nom_matiere}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'rgba(124,58,237,0.10)', color: '#7c3aed', border: '1px solid #c4b5fd' }}>🎓 {d.nom_niveau || 'Niveau non précisé'}</span>
                        {d.nom_domaine && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'rgba(139,92,246,0.08)', color: '#6d28d9', border: '1px solid #ddd6fe' }}>{d.nom_domaine}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.7)', borderRadius: 12, marginBottom: 14, border: '1px solid rgba(196,181,253,0.4)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>👨‍🏫</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: 12, color: '#1e1b4b' }}>{d.prof_nom}</div>
                      <div style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600, marginTop: 1 }}>Demande soumise le {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => onApprouver(d.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: 11, cursor: 'pointer', fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: 12, boxShadow: '0 3px 10px rgba(16,185,129,0.25)', transition: 'all .18s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(16,185,129,0.35)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(16,185,129,0.25)'; }}
                    >✅ Approuver</button>
                    <button onClick={() => onRefuser(d.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: '#fff', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: 11, cursor: 'pointer', fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: 12, transition: 'all .18s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}
                    >❌ Refuser</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : <div className="adm-card" style={{ padding: 32, textAlign: 'center' }}><EmptyState icon="✅" title="Aucune demande en attente" sub="Toutes les demandes ont été traitées" /></div>}
      {archived.length > 0 && <div className="adm-card" style={{ overflow: 'hidden' }}><div style={{ padding: '18px 20px 4px' }}><SectionTitle title="Historique" sub={`${archived.length} demande${archived.length > 1 ? 's' : ''} traitées`} /></div><table className="adm-table"><thead><tr><th>Matière</th><th>Niveau</th><th>Professeur</th><th>Date</th><th>Statut</th></tr></thead><tbody>{archived.map(d => <tr key={d.id}><td style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 700 }}>{d.nom_matiere}</td><td style={{ fontSize: 12, color: '#64748b' }}>{d.nom_niveau}</td><td style={{ fontSize: 13 }}>{d.prof_nom}</td><td style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(d.created_at).toLocaleDateString('fr-FR')}</td><td><StatutBadge s={d.statut} /></td></tr>)}</tbody></table></div>}
    </div>
  );
}


function ReferentielTab({ structure, villes, onReload }) {
  const [expanded, setExpanded] = useState({});
  const [openGroupe, setOpenGroupe] = useState({});
  const [modal, setModal] = useState(null);
  const [formVal, setFormVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [delConf, setDelConf] = useState(null);
  const [search, setSearch] = useState('');

  const DOMAINE_CFG = { 'Académique': { icon: '🎓', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' }, 'Professionnel': { icon: '💼', color: '#B45309', bg: '#FFFBEB', border: '#FCD34D' } };
  const DEFAULT_CFG = { icon: '📂', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' };
  const GROUPES_ACAD = {
    Primaire: { icon: '📚', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7', niveaux: ['1ère année primaire', '2ème année primaire', '3ème année primaire', '4ème année primaire', '5ème année primaire', '6ème année primaire'] },
    Collège:  { icon: '📖', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', niveaux: ['7ème année', '8ème année', '9ème année'] },
    Lycée:    { icon: '🎒', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', niveaux: ['1ère année Lycée', '2ème année Lycée', '3ème année Lycée', 'Baccalauréat'] },
  };

  const totalMats = structure.reduce((s, d) => s + (d.niveaux?.reduce((s2, n) => s2 + (n.matieres?.length || 0), 0) || 0), 0);
  const totalNivs = structure.reduce((s, d) => s + (d.niveaux?.length || 0), 0);
  const filteredStruct = useMemo(() => {
    if (!search) return structure;
    const q = search.toLowerCase();
    return structure.map(d => ({ ...d, niveaux: d.niveaux?.map(n => ({ ...n, matieres: n.matieres?.filter(m => m.nom.toLowerCase().includes(q)) || [] })).filter(n => n.matieres.length > 0 || n.nom.toLowerCase().includes(q)) })).filter(d => d.niveaux?.length > 0 || d.nom.toLowerCase().includes(q));
  }, [structure, search]);

  const openModal = (type, payload = {}) => { setFormVal(''); setModal({ type, payload }); };
  const handleSave = async () => {
    if (!formVal.trim()) return; setSaving(true);
    try {
      const { type, payload } = modal;
      if (type === 'ville') await api.post('/api/admin/referentiel/villes', { nom: formVal.trim() });
      if (type === 'domaine') await api.post('/api/admin/referentiel/domaines', { nom: formVal.trim() });
      if (type === 'niveau') await api.post('/api/admin/referentiel/niveaux', { nom: formVal.trim(), domaine_id: payload.domaineId });
      if (type === 'matiere') await api.post('/api/admin/referentiel/matieres', { nom: formVal.trim(), niveau_id: payload.niveauId });
      setModal(null); onReload();
    } catch (e) { alert(e.response?.data?.detail || 'Erreur'); }
    finally { setSaving(false); }
  };
  const handleDelete = async () => {
    if (!delConf) return;
    try {
      if (delConf.type === 'matiere') await api.delete(`/api/admin/referentiel/matieres/${delConf.id}`);
      if (delConf.type === 'ville') await api.delete(`/api/admin/referentiel/villes/${delConf.id}`);
      if (delConf.type === 'niveau') await api.delete(`/api/admin/referentiel/niveaux/${delConf.id}`);
      if (delConf.type === 'domaine') await api.delete(`/api/admin/referentiel/domaines/${delConf.id}`);
      setDelConf(null); onReload();
    } catch (e) { alert(e.response?.data?.detail || 'Erreur suppression'); }
  };

  const MatChip = ({ m, col }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px 5px 8px', borderRadius: 20, background: '#fff', border: `1.5px solid ${col.border}`, fontSize: 12, fontWeight: 600, color: col.color, transition: 'all .15s' }} onMouseEnter={e => e.currentTarget.style.background = col.bg} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
      {m.nom}
      <span onClick={() => setDelConf({ type: 'matiere', id: m.id, nom: m.nom })} style={{ width: 16, height: 16, borderRadius: '50%', background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 9, color: '#dc2626', fontWeight: 900, flexShrink: 0, marginLeft: 2 }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}>✕</span>
    </div>
  );

  const NiveauBloc = ({ niv, col, domNom }) => (
    <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${col.border}`, padding: '14px 16px', transition: 'box-shadow .15s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px ${col.border}66`} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
          <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: 13, color: '#0F172A' }}>{niv.nom}</span>
          <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: col.bg, color: col.color, border: `1px solid ${col.border}` }}>{niv.matieres?.length || 0} matière{(niv.matieres?.length || 0) !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => openModal('matiere', { niveauId: niv.id, niveauName: niv.nom, domaineName: domNom })} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: col.bg, color: col.color, border: `1.5px solid ${col.border}`, cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all .15s' }}>+ Matière</button>
          <button onClick={() => setDelConf({ type: 'niveau', id: niv.id, nom: niv.nom })} style={{ width: 28, height: 28, borderRadius: 8, background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🗑</button>
        </div>
      </div>
      {!niv.matieres?.length ? <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>Aucune matière — <span onClick={() => openModal('matiere', { niveauId: niv.id, niveauName: niv.nom, domaineName: domNom })} style={{ color: col.color, cursor: 'pointer', fontWeight: 600, marginLeft: 4 }}>Ajouter</span></div> : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{niv.matieres.map(m => <MatChip key={m.id} m={m} col={col} />)}</div>}
    </div>
  );

  const AcademiqueSection = ({ dom }) => {
    const cfg = DOMAINE_CFG['Académique'];
    const isOpen = expanded[dom.id] !== false;
    const nbM = dom.niveaux?.reduce((s, n) => s + (n.matieres?.length || 0), 0) || 0;
    const niveauMap = {};
    dom.niveaux?.forEach(niv => { niveauMap[niv.nom] = niv; });
    const autresNiveaux = dom.niveaux?.filter(niv => !Object.values(GROUPES_ACAD).some(g => g.niveaux.includes(niv.nom))) || [];
    return (
      <div style={{ background: '#fff', borderRadius: 22, border: `2px solid ${cfg.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(59,130,246,.08)' }}>
        <div onClick={() => setExpanded(p => ({ ...p, [dom.id]: !isOpen }))} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', cursor: 'pointer', background: isOpen ? 'linear-gradient(135deg,#1e40af,#3b82f6)' : '#fff', transition: 'all .2s' }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: isOpen ? 'rgba(255,255,255,.15)' : '#EFF6FF', border: isOpen ? '1.5px solid rgba(255,255,255,.25)' : '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{cfg.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 16, color: isOpen ? '#fff' : '#1D4ED8' }}>{dom.nom}</div>
            <div style={{ fontSize: 12, color: isOpen ? 'rgba(255,255,255,.7)' : '#94a3b8', marginTop: 3 }}>{dom.niveaux?.length || 0} niveaux · {nbM} matières</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => openModal('niveau', { domaineId: dom.id, domaineName: dom.nom })} style={{ padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: isOpen ? 'rgba(255,255,255,.15)' : '#EFF6FF', color: isOpen ? '#fff' : '#1D4ED8', border: isOpen ? '1.5px solid rgba(255,255,255,.3)' : '1.5px solid #BFDBFE', transition: 'all .15s' }}>+ Niveau</button>
            <button onClick={() => setDelConf({ type: 'domaine', id: dom.id, nom: dom.nom })} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(220,38,38,.15)', border: '1.5px solid rgba(220,38,38,.3)', color: isOpen ? '#fca5a5' : '#dc2626', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
          </div>
          <div style={{ fontSize: 14, color: isOpen ? 'rgba(255,255,255,.7)' : '#94a3b8', transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
        </div>
        {isOpen && (
          <div style={{ padding: '20px 22px', background: '#fafbff', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(GROUPES_ACAD).map(([groupeKey, groupe]) => {
              const gKey = `acad_${groupeKey}`;
              const gOpen = openGroupe[gKey] !== false;
              const niveauxDuGroupe = groupe.niveaux.map(nom => niveauMap[nom]).filter(Boolean);
              const totalCochees = niveauxDuGroupe.reduce((s, n) => s + (n.matieres?.length || 0), 0);
              return (
                <div key={groupeKey} style={{ border: `1.5px solid ${groupe.border}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div onClick={() => setOpenGroupe(p => ({ ...p, [gKey]: !gOpen }))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: gOpen ? groupe.bg : '#fff', cursor: 'pointer', transition: 'background .15s' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: groupe.bg, border: `1.5px solid ${groupe.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{groupe.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 14, color: groupe.color }}>{groupeKey}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{niveauxDuGroupe.length} niveau{niveauxDuGroupe.length !== 1 ? 'x' : ''} · {totalCochees} matière{totalCochees !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', transition: 'transform .2s', transform: gOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
                  </div>
                  {gOpen && (
                    <div style={{ padding: '12px 16px 16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {niveauxDuGroupe.length === 0 ? <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>Aucun niveau configuré pour {groupeKey}</div> : niveauxDuGroupe.map(niv => <NiveauBloc key={niv.id} niv={niv} col={groupe} domNom={dom.nom} />)}
                    </div>
                  )}
                </div>
              );
            })}
            {autresNiveaux.length > 0 && (
              <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}><span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Autres niveaux</span></div>
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>{autresNiveaux.map(niv => <NiveauBloc key={niv.id} niv={niv} col={{ color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' }} domNom={dom.nom} />)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const DomaineSection = ({ dom }) => {
    const cfg = DOMAINE_CFG[dom.nom] || DEFAULT_CFG;
    const isOpen = expanded[dom.id] !== false;
    const nbM = dom.niveaux?.reduce((s, n) => s + (n.matieres?.length || 0), 0) || 0;
    return (
      <div style={{ background: '#fff', borderRadius: 22, border: `2px solid ${cfg.border}`, overflow: 'hidden', boxShadow: `0 4px 20px ${cfg.border}44` }}>
        <div onClick={() => setExpanded(p => ({ ...p, [dom.id]: !isOpen }))} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', cursor: 'pointer', background: isOpen ? `linear-gradient(135deg,${cfg.color},${cfg.border})` : '#fff', transition: 'all .2s' }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: isOpen ? 'rgba(255,255,255,.15)' : cfg.bg, border: isOpen ? '1.5px solid rgba(255,255,255,.25)' : `1.5px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{cfg.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 16, color: isOpen ? '#fff' : cfg.color }}>{dom.nom}</div>
            <div style={{ fontSize: 12, color: isOpen ? 'rgba(255,255,255,.7)' : '#94a3b8', marginTop: 3 }}>{dom.niveaux?.length || 0} niveaux · {nbM} matières</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => openModal('niveau', { domaineId: dom.id, domaineName: dom.nom })} style={{ padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: isOpen ? 'rgba(255,255,255,.15)' : cfg.bg, color: isOpen ? '#fff' : cfg.color, border: isOpen ? `1.5px solid rgba(255,255,255,.3)` : `1.5px solid ${cfg.border}`, transition: 'all .15s' }}>+ Niveau</button>
            <button onClick={() => setDelConf({ type: 'domaine', id: dom.id, nom: dom.nom })} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(220,38,38,.15)', border: '1.5px solid rgba(220,38,38,.3)', color: isOpen ? '#fca5a5' : '#dc2626', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
          </div>
          <div style={{ fontSize: 14, color: isOpen ? 'rgba(255,255,255,.7)' : '#94a3b8', transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
        </div>
        {isOpen && (
          <div style={{ padding: '20px 22px', background: '#fffdf5', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(!dom.niveaux || dom.niveaux.length === 0) && <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: 13, fontStyle: 'italic', background: '#fff', borderRadius: 14, border: '1.5px dashed #e2e8f0' }}>Aucun niveau — <span onClick={() => openModal('niveau', { domaineId: dom.id, domaineName: dom.nom })} style={{ color: cfg.color, cursor: 'pointer', fontWeight: 700, marginLeft: 4 }}>Ajouter</span></div>}
            {dom.niveaux?.map(niv => <NiveauBloc key={niv.id} niv={niv} col={cfg} domNom={dom.nom} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[{ icon: '📍', val: villes.length, label: 'Villes', color: '#3b82f6', bg: '#EFF6FF', border: '#BFDBFE' }, { icon: '🗂', val: structure.length, label: 'Domaines', color: '#8b5cf6', bg: '#F5F3FF', border: '#DDD6FE' }, { icon: '🎓', val: totalNivs, label: 'Niveaux', color: '#f59e0b', bg: '#FFFBEB', border: '#FCD34D' }, { icon: '📚', val: totalMats, label: 'Matières', color: '#10b981', bg: '#ECFDF5', border: '#6EE7B7' }].map((s, i) => (
          <div key={s.label} className="adm-stat adm-scaleIn" style={{ animationDelay: `${i * 50}ms`, borderColor: s.border }}>
            <div className="adm-stat-accent" style={{ background: s.color }} />
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 14 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 30, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 5 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="adm-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 20, background: 'linear-gradient(180deg,#3b82f6,#60a5fa)', borderRadius: 2 }} />
            <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 15, color: '#0F172A' }}>📍 Villes actives</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{villes.length} configurée{villes.length > 1 ? 's' : ''}</span>
          </div>
          <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => openModal('ville')}>+ Ajouter une ville</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {villes.map(v => (
            <div key={v.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: '#EFF6FF', border: '1.5px solid #BFDBFE', fontSize: 13, fontWeight: 600, color: '#1D4ED8', transition: 'all .15s' }} onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'} onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}>
              📍 {v.nom}
              <span onClick={() => setDelConf({ type: 'ville', id: v.id, nom: v.nom })} style={{ width: 16, height: 16, borderRadius: '50%', background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 9, color: '#dc2626', fontWeight: 900, flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}>✕</span>
            </div>
          ))}
          {villes.length === 0 && <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Aucune ville configurée</span>}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 20, background: 'linear-gradient(180deg,#8b5cf6,#6d28d9)', borderRadius: 2 }} />
          <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 15, color: '#0F172A' }}>Structure pédagogique</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{structure.length} domaine{structure.length > 1 ? 's' : ''}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <input className="adm-input" style={{ width: 220, fontSize: 12, paddingLeft: 30 }} placeholder="Rechercher matière, niveau..." value={search} onChange={e => setSearch(e.target.value)} />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8' }}>🔍</span>
          </div>
          <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => openModal('domaine')}>+ Domaine</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredStruct.map((dom) => dom.nom === 'Académique' ? <AcademiqueSection key={dom.id} dom={dom} /> : <DomaineSection key={dom.id} dom={dom} />)}
        {filteredStruct.length === 0 && <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}><div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div><div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 5 }}>Aucun résultat</div><div style={{ fontSize: 13 }}>Modifiez votre recherche</div></div>}
      </div>

      {modal && (
        <div className="adm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal" style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 16, color: '#0F172A', margin: '0 0 4px' }}>{modal.type === 'ville' ? '📍 Nouvelle ville' : modal.type === 'domaine' ? '🗂 Nouveau domaine' : modal.type === 'niveau' ? '🎓 Nouveau niveau' : '📚 Nouvelle matière'}</h3>
                {(modal.payload?.domaineName || modal.payload?.niveauName) && <div style={{ fontSize: 12, color: '#94a3b8' }}>{modal.type === 'niveau' && `Dans : ${modal.payload.domaineName}`}{modal.type === 'matiere' && `${modal.payload.niveauName} · ${modal.payload.domaineName}`}</div>}
              </div>
              <button onClick={() => setModal(null)} style={{ width: 32, height: 32, borderRadius: 9, background: '#f8fafc', border: '1.5px solid #e2e8f0', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✕</button>
            </div>
            <input autoFocus className="adm-input" style={{ marginBottom: 16 }} placeholder={modal.type === 'ville' ? 'Ex: Zaghouan…' : modal.type === 'domaine' ? 'Ex: Arts…' : modal.type === 'niveau' ? 'Ex: BTS…' : 'Ex: Algorithmes…'} value={formVal} onChange={e => setFormVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="adm-btn adm-btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: (!formVal.trim() || saving) ? .6 : 1 }} disabled={!formVal.trim() || saving} onClick={handleSave}>{saving ? 'Enregistrement…' : '✓ Enregistrer'}</button>
              <button className="adm-btn adm-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setModal(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      {delConf && (
        <div className="adm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDelConf(null); }}>
          <div className="adm-modal" style={{ textAlign: 'center', maxWidth: 360, borderColor: '#fca5a5' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>🗑</div>
            <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 16, color: '#0F172A', margin: '0 0 8px' }}>Confirmer la suppression</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>Supprimer <strong>"{delConf.nom}"</strong> ?<br /><span style={{ color: '#ef4444', fontSize: 12 }}>Cette action est irréversible.</span></p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="adm-btn adm-btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={handleDelete}>🗑 Supprimer</button>
              <button className="adm-btn adm-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setDelConf(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const CAL_CSS3 = `
.c3 { display:flex; flex-direction:column; gap:20px; font-family:'Instrument Sans',system-ui,sans-serif; }
.c3-header { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; padding:22px 24px; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.c3-hicon { width:46px; height:46px; borderRadius:14px; background:linear-gradient(135deg,#1e40af,#3b82f6); display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0; border-radius:14px; }
.c3-htitle { font-family:'Cabinet Grotesk',sans-serif; font-weight:900; font-size:17px; color:#0F172A; margin-bottom:2px; }
.c3-hsub { font-size:12px; color:#94a3b8; }
.c3-toggle { display:flex; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:3px; gap:2px; }
.c3-tvbtn { padding:6px 14px; border-radius:8px; border:none; background:transparent; color:#64748b; font-size:12px; font-weight:600; cursor:pointer; transition:all .15s; font-family:'Instrument Sans',sans-serif; white-space:nowrap; }
.c3-tvbtn.on { background:#0F172A; color:#fff; font-weight:700; box-shadow:0 1px 6px rgba(15,23,42,.2); }
.c3-nav { display:flex; align-items:center; gap:8px; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:4px 8px; }
.c3-nbtn { width:28px; height:28px; border-radius:7px; border:1.5px solid #e2e8f0; background:#fff; color:#64748b; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; line-height:1; }
.c3-nbtn:hover { background:#0F172A; color:#fff; border-color:#0F172A; }
.c3-period { font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:13px; color:#0F172A; min-width:160px; text-align:center; }
.c3-today { padding:7px 14px; border-radius:9px; border:1.5px solid #e2e8f0; background:#fff; color:#0F172A; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; font-family:'Instrument Sans',sans-serif; }
.c3-today:hover { background:#0F172A; color:#fff; border-color:#0F172A; }
.c3-legend { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:14px; padding-top:14px; border-top:1px solid #f1f5f9; }
.c3-leg { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; border:1.5px solid; font-size:11px; font-weight:700; }
.c3-kpis { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; }
.c3-kpi { background:#fff; border:1.5px solid #f1f5f9; border-radius:16px; padding:16px 18px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,.03); transition:all .18s; }
.c3-kpi:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,.07); }
.c3-kico { font-size:1.4rem; margin-bottom:6px; }
.c3-kval { font-family:'Cabinet Grotesk',sans-serif; font-weight:900; font-size:1.8rem; color:var(--kc,#3b82f6); line-height:1; margin-bottom:3px; }
.c3-klbl { font-size:11px; color:#94a3b8; font-weight:600; }
.c3-grid { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.c3-wdays { display:grid; grid-template-columns:repeat(7,1fr); border-bottom:1.5px solid #f1f5f9; background:#fafbfc; }
.c3-wday { padding:10px 4px; text-align:center; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; }
.c3-days { display:grid; grid-template-columns:repeat(7,1fr); }
.c3-day { min-height:110px; padding:8px 6px 6px; border-right:1px solid #f8fafc; border-bottom:1px solid #f8fafc; transition:background .12s; cursor:default; box-sizing:border-box; }
.c3-day:hover { background:#f8fafc; }
.c3-day.other { background:#fafbfc; opacity:.5; }
.c3-day.today .c3-dnum { background:#3b82f6; color:#fff; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:900; }
.c3-dnum { font-family:'Cabinet Grotesk',sans-serif; font-weight:700; font-size:13px; color:#0F172A; width:24px; height:24px; display:flex; align-items:center; justify-content:center; }
.c3-dbadge { font-size:9px; font-weight:900; background:#3b82f6; color:#fff; padding:1px 5px; border-radius:6px; }
.c3-more { font-size:10px; font-weight:800; color:#3b82f6; cursor:pointer; padding:2px 4px; border-radius:4px; display:block; margin-top:2px; }
.c3-more:hover { background:#eff6ff; }
.c3-week { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.04); }
.c3-wk-head { display:grid; grid-template-columns:60px repeat(7,1fr); border-bottom:1.5px solid #f1f5f9; background:#fafbfc; }
.c3-wk-ch { padding:10px 6px; text-align:center; border-right:1px solid #f1f5f9; }
.c3-wk-ch .wd { font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; }
.c3-wk-ch .dm { font-family:'Cabinet Grotesk',sans-serif; font-weight:900; font-size:18px; color:#0F172A; line-height:1.1; margin-top:2px; }
.c3-wk-ch .wn { font-size:9px; font-weight:700; color:#3b82f6; margin-top:2px; }
.c3-wk-ch.tc { background:linear-gradient(135deg,#eff6ff,#f0fdf4); }
.c3-wk-ch.tc .dm { color:#3b82f6; }
.c3-wk-body { display:grid; grid-template-columns:60px repeat(7,1fr); }
.c3-tcol { display:flex; flex-direction:column; border-right:1px solid #f1f5f9; }
.c3-tcell { height:70px; display:flex; align-items:flex-start; justify-content:flex-end; padding:4px 8px 0 0; border-bottom:1px solid #f8fafc; }
.c3-tlbl { font-size:10px; font-weight:700; color:#94a3b8; }
.c3-wk-day { display:flex; flex-direction:column; border-right:1px solid #f8fafc; }
.c3-wk-slot { height:70px; border-bottom:1px solid #f8fafc; padding:2px 3px; overflow:hidden; position:relative; }
.c3-ev { border-radius:8px; border:1.5px solid; padding:3px 6px; margin-bottom:2px; font-size:10px; overflow:hidden; transition:all .15s; }
.c3-ev:hover { filter:brightness(.92); transform:scale(1.01); z-index:2; position:relative; }
.c3-ev-time { font-weight:800; font-size:9px; opacity:.8; margin-bottom:1px; }
.c3-ev-mat { font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.c3-ev-prof { font-size:9px; opacity:.7; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.c3-ev-bar { height:3px; background:rgba(0,0,0,.1); border-radius:2px; overflow:hidden; margin-top:3px; }
.c3-ev-fill { height:100%; border-radius:2px; }
.c3-mo { position:fixed; inset:0; background:rgba(15,23,42,.6); backdrop-filter:blur(8px); z-index:8000; display:flex; align-items:flex-end; justify-content:center; padding:0; }
@media (min-width:640px) { .c3-mo { align-items:center; padding:20px; } }
.c3-mbox { background:#fff; border-radius:24px 24px 0 0; width:100%; max-width:640px; max-height:88vh; display:flex; flex-direction:column; box-shadow:0 -8px 40px rgba(0,0,0,.15); animation:adm-modalIn .25s ease; }
@media (min-width:640px) { .c3-mbox { border-radius:24px; box-shadow:0 32px 80px rgba(0,0,0,.2); } }
.c3-mhead { display:flex; justify-content:space-between; align-items:center; padding:20px 22px 16px; border-bottom:1.5px solid #f1f5f9; flex-shrink:0; }
.c3-mhead h2 { font-family:'Cabinet Grotesk',sans-serif; font-weight:900; font-size:16px; color:#0F172A; margin:0; }
.c3-mbody { overflow-y:auto; flex:1; padding:16px; display:flex; flex-direction:column; gap:10px; }
.c3-mcard { border-radius:16px; border:1.5px solid; padding:14px 16px; display:flex; gap:14px; align-items:flex-start; cursor:pointer; transition:all .15s; }
.c3-mcard:hover { transform:translateX(3px); filter:brightness(.96); }
.c3-mc-time { display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:52px; padding:8px; background:rgba(255,255,255,.7); border-radius:10px; border:1px solid rgba(0,0,0,.06); flex-shrink:0; }
.c3-mc-start { font-family:'Cabinet Grotesk',sans-serif; font-weight:900; font-size:15px; color:#0F172A; line-height:1; }
.c3-mc-end { font-size:10px; color:#94a3b8; font-weight:600; margin-top:2px; }
.c3-mc-sep { width:1px; background:rgba(0,0,0,.08); align-self:stretch; flex-shrink:0; }
.c3-mc-data { flex:1; min-width:0; }
.c3-mc-mat { font-family:'Cabinet Grotesk',sans-serif; font-weight:900; font-size:14px; color:#0F172A; margin-bottom:4px; }
.c3-mc-prof { font-size:12px; color:#64748b; margin-bottom:6px; }
.c3-mc-tags { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
.c3-mc-tag { font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:rgba(255,255,255,.7); border:1px solid rgba(0,0,0,.08); color:#374151; }
.c3-mc-caprow { display:flex; flex-direction:column; gap:4px; }
.c3-mc-caplbl { display:flex; justify-content:space-between; font-size:11px; }
.c3-mc-capbar { height:5px; background:rgba(0,0,0,.08); border-radius:3px; overflow:hidden; }
.c3-mc-capfill { height:100%; border-radius:3px; transition:width .6s ease; }
.c3-empty { text-align:center; padding:60px 20px; background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; box-shadow:0 2px 8px rgba(0,0,0,.04); }
`;

function injectCalCSS3() {
  if (!document.getElementById('c3-css')) {
    const s = document.createElement('style'); s.id = 'c3-css'; s.textContent = CAL_CSS3;
    document.head.appendChild(s);
  }
}

function occClass(nb, max) { if (!max || max <= 0) return 'libre'; const r = nb / max; if (r >= 1) return 'full'; if (r >= 0.75) return 'warn'; return 'libre'; }
function occColor(cls) { if (cls === 'full') return '#ef4444'; if (cls === 'warn') return '#f97316'; return '#10b981'; }
function occBg(cls) { if (cls === 'full') return { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' }; if (cls === 'warn') return { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412' }; return { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46' }; }
function occLabel(cls) { if (cls === 'full') return '🔴 Complet'; if (cls === 'warn') return '🟠 Presque complet'; return '🟢 Disponible'; }

const DAYS_W  = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MOIS_S  = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const HOURS   = ['08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h'];
const HOUR_N  = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// ─── CalendrierTab ─────────────────────────────────────────────────────────────
// disponibilites : toutes les séances des profs (vient de /api/admin/disponibilites/all)
// reservations   : toutes les réservations (pour afficher les inscrits dans la modal)
function CalendrierTab({ disponibilites = [], reservations = [] }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView]   = useState('month');
  const [modal, setModal] = useState(null);
  const [seanceModal, setSeanceModal] = useState(null);
  const [ws, setWs] = useState(() => {
    const d = new Date(today);
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => { injectCalCSS3(); }, []);

  // ── Construire les événements depuis les DISPONIBILITÉS ──
  const events = useMemo(() => {
    if (!disponibilites || disponibilites.length === 0) return [];
    return disponibilites
      .filter(d => d.date_cours)
      .map(d => {
        const nb  = d.nb_inscrits        || 0;
        const max = d.nb_max_etudiants   || 0;
        const cls = occClass(nb, max);
        const pal = occBg(cls);
        // Inscrits confirmés pour cette dispo depuis reservations
        const inscritsConfirmes = (reservations || []).filter(r =>
          r.disponibilite_id === d.id && r.statut === 'confirmé'
        );
        return {
          id:          d.id,
          date:        d.date_cours,
          hDebut:      (d.heure_debut || '').slice(0, 5),
          hFin:        (d.heure_fin   || '').slice(0, 5),
          prof:        d.prof_nom    || '—',
          profEmail:   d.prof_email  || null,
          profVille:   d.prof_ville  || null,
          matieres:    d.matieres    || '—',
          niveau:      d.niveau_nom  || null,
          mode:        d.mode_seance || 'presentiel',
          tarif:       d.tarif_applique || 0,
          description: d.description || '',
          nb, max,
          nbConfirmes:  d.nb_confirmes || inscritsConfirmes.length,
          inscrits:     inscritsConfirmes,
          cls, pal,
        };
      })
      .sort((a, b) => a.hDebut.localeCompare(b.hDebut));
  }, [disponibilites, reservations]);

  // ── Filtrage par vue ──
  const evsMois = useMemo(() =>
    events.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    }), [events, year, month]);

  const weDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ws); d.setDate(d.getDate() + i); return d;
    }), [ws]);

  const evsSemaine = useMemo(() => {
    const end = new Date(ws); end.setDate(end.getDate() + 7);
    return events.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date + 'T00:00:00');
      return d >= ws && d < end;
    });
  }, [events, ws]);

  const src = view === 'week' ? evsSemaine : evsMois;

  // ── KPIs ──
  const kpis = useMemo(() => ({
    total:    src.length,
    sansResa: src.filter(e => e.nb === 0).length,
    libres:   src.filter(e => e.cls === 'libre' && e.nb > 0).length,
    warn:     src.filter(e => e.cls === 'warn').length,
    full:     src.filter(e => e.cls === 'full').length,
  }), [src]);

  // ── Navigation ──
  const prevM = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextM = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const prevW = () => { const d = new Date(ws); d.setDate(d.getDate() - 7); setWs(d); };
  const nextW = () => { const d = new Date(ws); d.setDate(d.getDate() + 7); setWs(d); };
  const goToday = () => {
    setYear(today.getFullYear()); setMonth(today.getMonth());
    const d = new Date(today); const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow); d.setHours(0, 0, 0, 0); setWs(d);
  };

  // ── Cellules du calendrier mensuel ──
  const firstDay = new Date(year, month, 1).getDay();
  const offset   = (firstDay + 6) % 7;
  const dim      = new Date(year, month + 1, 0).getDate();
  const prevDim  = new Date(year, month, 0).getDate();
  const cells    = [];
  for (let i = 0; i < 42; i++) {
    const d = i - offset + 1;
    if (d < 1)    cells.push({ day: prevDim + d, type: 'prev' });
    else if (d > dim) cells.push({ day: d - dim, type: 'next' });
    else          cells.push({ day: d, type: 'cur' });
  }
  const isToday = d => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const byDay = useMemo(() => {
    const m = {};
    evsMois.forEach(e => {
      const d = new Date(e.date + 'T00:00:00').getDate();
      if (!m[d]) m[d] = [];
      m[d].push(e);
    });
    return m;
  }, [evsMois]);

  const byWD = useMemo(() => {
    const m = {};
    weDays.forEach((wd, i) => {
      m[i] = evsSemaine.filter(e => e.date === wd.toISOString().slice(0, 10));
    });
    return m;
  }, [evsSemaine, weDays]);

  // ── Pill dans le calendrier ──
  const Pill = ({ ev }) => {
    const col = occColor(ev.cls);
    const { bg, border } = ev.pal;
    return (
      <div
        onClick={e => { e.stopPropagation(); setSeanceModal(ev); }}
        title={`${ev.hDebut} — ${ev.matieres} — ${ev.prof}${ev.nb > 0 ? ` (${ev.nb}/${ev.max || '?'})` : ' (libre)'}`}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 7px', borderRadius: 8, marginBottom: 2,
          background: bg, border: `1.5px solid ${border}`,
          cursor: 'pointer', transition: 'filter .12s, transform .12s',
          width: '100%', boxSizing: 'border-box',
        }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(.93)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0, display: 'inline-block' }} />
        <span style={{ fontSize: 9, fontWeight: 800, color: col, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
          {ev.hDebut}
          {' · '}
          {(ev.matieres || '').slice(0, 14)}
          {ev.nb === 0 && <span style={{ marginLeft: 3, opacity: .7 }}>✨</span>}
        </span>
      </div>
    );
  };

  // ── Modal détail séance ──
  const SeanceModal = () => {
    if (!seanceModal) return null;
    const ev  = seanceModal;
    const col = occColor(ev.cls);
    const { bg, border } = ev.pal;
    const pct = ev.max > 0 ? Math.min(100, Math.round(ev.nb / ev.max * 100)) : 0;
    const modeIcon  = ev.mode === 'en_ligne' ? '🌐' : '🏫';
    const modeLabel = ev.mode === 'en_ligne' ? 'En ligne' : 'Présentiel';
    const inscritsConfirmes = (reservations || []).filter(r =>
      r.disponibilite_id === ev.id && r.statut === 'confirmé'
    );
    return (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        onClick={e => e.target === e.currentTarget && setSeanceModal(null)}
      >
        <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 580, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden', animation: 'adm-modalIn .26s cubic-bezier(.34,1.56,.64,1)' }}>
          {/* Header */}
          <div style={{ background: bg, borderBottom: `2px solid ${border}`, padding: '20px 24px 16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {(ev.matieres || '').split('/').map((m, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 15, color: '#0F172A', background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 20, border: '1.5px solid rgba(0,0,0,0.08)' }}>
                      📚 {m.trim()}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {ev.niveau && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,.7)', color: '#4f46e5', border: '1.5px solid rgba(79,70,229,.25)' }}>
                      🎓 {ev.niveau}
                    </span>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,.75)', color: col, border: `1.5px solid ${border}` }}>
                    {occLabel(ev.cls)}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>🕐 {ev.hDebut} → {ev.hFin}</span>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    📅 {new Date((ev.date || '') + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <button onClick={() => setSeanceModal(null)} style={{ width: 34, height: 34, borderRadius: 10, border: '1.5px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#64748b', flexShrink: 0, marginLeft: 12 }}>✕</button>
            </div>
          </div>
          {/* Corps */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Mode + tarif */}
            <div style={{ padding: '12px 16px', background: ev.mode === 'en_ligne' ? '#eff6ff' : '#ecfdf5', border: `1.5px solid ${ev.mode === 'en_ligne' ? '#bfdbfe' : '#6ee7b7'}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{modeIcon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>Mode</div>
                <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: 14, color: ev.mode === 'en_ligne' ? '#1d4ed8' : '#065f46' }}>{modeLabel}</div>
              </div>
              {ev.tarif > 0 && (
                <span style={{ marginLeft: 'auto', fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, color: '#059669', fontSize: 15 }}>
                  💰 {ev.tarif} DT/séance
                </span>
              )}
            </div>
            {/* Description */}
            {ev.description && (
              <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>📝 Description</div>
                <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.65, borderLeft: '3px solid #3b82f6', paddingLeft: 12 }}>{ev.description}</p>
              </div>
            )}
            {/* Professeur */}
            <div style={{ padding: '14px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>👨‍🏫 Formateur</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#00153D,#1E3A8A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                  {(ev.prof || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 800, fontSize: 14, color: '#0F172A' }}>{ev.prof}</div>
                  {ev.profEmail && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>✉️ {ev.profEmail}</div>}
                  {ev.profVille && <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>📍 {ev.profVille}</div>}
                </div>
              </div>
            </div>
            {/* Occupation */}
            <div style={{ padding: '14px 16px', background: bg, border: `1.5px solid ${border}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>👥 Occupation</div>
                <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 14, color: col }}>
                  {ev.nb} {ev.max > 0 ? `/ ${ev.max} places · ${pct}%` : 'inscrit(s)'}
                </span>
              </div>
              {ev.max > 0 && (
                <div style={{ height: 8, background: 'rgba(0,0,0,.08)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 4, transition: 'width .5s ease' }} />
                </div>
              )}
              {ev.nb === 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                  ✨ Aucune réservation — créneau entièrement libre
                </div>
              )}
            </div>
            {/* Étudiants inscrits (confirmés) */}
            {inscritsConfirmes.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                  ✅ Étudiants confirmés ({inscritsConfirmes.length})
                </div>
                <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
                        <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Nom</th>
                        <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscritsConfirmes.map((r, i) => (
                        <tr key={r.id} style={{ borderBottom: i < inscritsConfirmes.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0F172A', fontFamily: "'Cabinet Grotesk',sans-serif" }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#4C1D95,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                                {(r.etudiant_nom || 'E')[0].toUpperCase()}
                              </div>
                              {r.etudiant_nom || '—'}
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748b' }}>{r.etudiant_email || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Modal liste du jour ──
  const ModalJour = () => {
    if (!modal) return null;
    const list = (byDay[modal.day] || []).slice().sort((a, b) => a.hDebut.localeCompare(b.hDebut));
    const lbl  = new Date(year, month, modal.day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return (
      <div className="c3-mo" onClick={e => e.target === e.currentTarget && setModal(null)}>
        <div className="c3-mbox">
          <div className="c3-mhead">
            <h2>{lbl}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{list.length} séance{list.length > 1 ? 's' : ''}</span>
              <button onClick={() => setModal(null)} style={{ width: 32, height: 32, borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#64748b' }}>✕</button>
            </div>
          </div>
          <div className="c3-mbody">
            {list.map(ev => {
              const col = occColor(ev.cls);
              const { bg, border } = ev.pal;
              const pct = ev.max > 0 ? Math.min(100, Math.round(ev.nb / ev.max * 100)) : 0;
              return (
                <div key={ev.id} className="c3-mcard" style={{ background: bg, borderColor: border }} onClick={() => { setModal(null); setSeanceModal(ev); }}>
                  <div className="c3-mc-time">
                    <span className="c3-mc-start">{ev.hDebut}</span>
                    <span className="c3-mc-end">→ {ev.hFin}</span>
                  </div>
                  <div className="c3-mc-sep" />
                  <div className="c3-mc-data">
                    <div className="c3-mc-mat">{ev.matieres}</div>
                    <div className="c3-mc-prof">👨‍🏫 {ev.prof}</div>
                    {ev.niveau && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>🎓 {ev.niveau}</div>}
                    <div className="c3-mc-tags">
                      <span className="c3-mc-tag">{ev.mode === 'en_ligne' ? '🌐 En ligne' : '🏫 Présentiel'}</span>
                      {ev.tarif > 0 && <span className="c3-mc-tag" style={{ color: '#059669', fontWeight: 800 }}>💰 {ev.tarif} DT</span>}
                      <span className="c3-mc-tag" style={{ color: col, fontWeight: 800 }}>
                        {ev.nb === 0 ? '✨ Libre' : `${ev.nb}${ev.max > 0 ? `/${ev.max}` : ''} inscrits`}
                      </span>
                    </div>
                    {ev.max > 0 && (
                      <div className="c3-mc-caprow">
                        <div className="c3-mc-caplbl">
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>Occupation</span>
                          <span style={{ fontSize: 11, fontWeight: 900, color: col }}>{ev.nb}/{ev.max} · {pct}%</span>
                        </div>
                        <div className="c3-mc-capbar">
                          <div className="c3-mc-capfill" style={{ width: `${pct}%`, background: col }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const weEnd = new Date(ws); weEnd.setDate(weEnd.getDate() + 6);
  const periodLabel = view === 'month'
    ? `${MOIS_FR[month]} ${year}`
    : `${ws.getDate()} ${MOIS_S[ws.getMonth()]} – ${weEnd.getDate()} ${MOIS_S[weEnd.getMonth()]} ${weEnd.getFullYear()}`;

  return (
    <div className="c3">
      {/* ── En-tête ── */}
      <div className="c3-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="c3-hicon">🗓</div>
            <div>
              <div className="c3-htitle">Calendrier de toutes les séances</div>
              <div className="c3-hsub">Toutes les disponibilités des formateurs validés — avec ou sans réservation</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="c3-toggle">
              <button className={`c3-tvbtn${view === 'month' ? ' on' : ''}`} onClick={() => setView('month')}>📅 Mensuel</button>
              <button className={`c3-tvbtn${view === 'week' ? ' on' : ''}`}  onClick={() => setView('week')}>📆 Semaine</button>
            </div>
            <div className="c3-nav">
              <button className="c3-nbtn" onClick={view === 'month' ? prevM : prevW}>‹</button>
              <span className="c3-period">{periodLabel}</span>
              <button className="c3-nbtn" onClick={view === 'month' ? nextM : nextW}>›</button>
            </div>
            <button className="c3-today" onClick={goToday}>Aujourd'hui</button>
          </div>
        </div>
        {/* Légende */}
        <div className="c3-legend">
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginRight: 4 }}>Occupation :</span>
          {[
            { col: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', l: '✨ Aucune réservation' },
            { col: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46', l: '🟢 Disponible (< 75%)' },
            { col: '#f97316', bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', l: '🟠 Presque complet (≥ 75%)' },
            { col: '#ef4444', bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', l: '🔴 Complet (100%)' },
          ].map(s => (
            <div key={s.l} className="c3-leg" style={{ background: s.bg, borderColor: s.border, color: s.text }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.col, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700 }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="c3-kpis">
        {[
          { ico: '📋', val: kpis.total,    lbl: 'Séances total',    c: '#3b82f6' },
          { ico: '✨', val: kpis.sansResa, lbl: 'Sans réservation', c: '#8b5cf6' },
          { ico: '🟢', val: kpis.libres,   lbl: 'Partiellement',    c: '#10b981' },
          { ico: '🟠', val: kpis.warn,     lbl: 'Presque complet',  c: '#f97316' },
          { ico: '🔴', val: kpis.full,     lbl: 'Complet',          c: '#ef4444' },
        ].map((k, i) => (
          <div key={i} className="c3-kpi" style={{ '--kc': k.c }}>
            <div className="c3-kico">{k.ico}</div>
            <div className="c3-kval">{k.val}</div>
            <div className="c3-klbl">{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Vue mensuelle ── */}
      {view === 'month' && (
        <div className="c3-grid">
          <div className="c3-wdays">
            {DAYS_W.map(d => <div key={d} className="c3-wday">{d}</div>)}
          </div>
          <div className="c3-days">
            {cells.map((cell, i) => {
              const isCur = cell.type === 'cur';
              const isTod = isCur && isToday(cell.day);
              const list  = isCur ? (byDay[cell.day] || []) : [];
              const MAX   = 3;
              const vis   = list.slice(0, MAX);
              const hid   = list.length - MAX;
              return (
                <div
                  key={i}
                  className={`c3-day${!isCur ? ' other' : ''}${isTod ? ' today' : ''}`}
                  onClick={() => isCur && list.length > 0 && setModal({ day: cell.day })}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div className="c3-dnum">{cell.day}</div>
                    {list.length > 0 && <span className="c3-dbadge">{list.length}</span>}
                  </div>
                  {vis.map((ev, idx) => <Pill key={idx} ev={ev} />)}
                  {hid > 0 && (
                    <span className="c3-more" onClick={e => { e.stopPropagation(); setModal({ day: cell.day }); }}>
                      +{hid} de plus
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Vue semaine ── */}
      {view === 'week' && (
        <div className="c3-week">
          <div className="c3-wk-head">
            <div style={{ padding: '12px 6px' }} />
            {weDays.map((wd, i) => {
              const isTodWd = wd.toDateString() === today.toDateString();
              const nb      = byWD[i]?.length || 0;
              return (
                <div key={i} className={`c3-wk-ch${isTodWd ? ' tc' : ''}`}>
                  <div className="wd">{DAYS_W[i]}</div>
                  <div className="dm">{wd.getDate()}</div>
                  {nb > 0 && <div className="wn">{nb} séance{nb > 1 ? 's' : ''}</div>}
                </div>
              );
            })}
          </div>
          <div className="c3-wk-body">
            <div className="c3-tcol">
              {HOURS.map(h => <div key={h} className="c3-tcell"><span className="c3-tlbl">{h}</span></div>)}
            </div>
            {weDays.map((wd, di) => (
              <div key={di} className="c3-wk-day">
                {HOUR_N.map(h => {
                  const inSlot = (byWD[di] || []).filter(ev => parseInt((ev.hDebut || '00').split(':')[0], 10) === h);
                  return (
                    <div key={h} className="c3-wk-slot">
                      {inSlot.map((ev, si) => {
                        const col = occColor(ev.cls);
                        const { bg, border, text } = ev.pal;
                        const pct = ev.max > 0 ? Math.min(100, Math.round(ev.nb / ev.max * 100)) : 0;
                        return (
                          <div
                            key={si}
                            className="c3-ev"
                            style={{ background: bg, borderColor: border, color: text, cursor: 'pointer' }}
                            onClick={e => { e.stopPropagation(); setSeanceModal(ev); }}
                          >
                            <div className="c3-ev-time">{ev.hDebut} – {ev.hFin}</div>
                            <div className="c3-ev-mat">{ev.matieres}</div>
                            <div className="c3-ev-prof">{ev.prof}</div>
                            {ev.nb === 0
                              ? <div style={{ fontSize: 8, fontWeight: 800, color: '#8b5cf6', marginTop: 2 }}>✨ libre</div>
                              : ev.max > 0 && (
                                <div className="c3-ev-bar">
                                  <div className="c3-ev-fill" style={{ width: `${pct}%`, background: col }} />
                                </div>
                              )
                            }
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── État vide ── */}
      {src.length === 0 && (
        <div className="c3-empty">
          <div style={{ width: 68, height: 68, borderRadius: 18, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 14px', border: '1.5px solid #e2e8f0' }}>📅</div>
          <div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 15, color: '#0f172a', marginBottom: 5 }}>Aucune séance pour cette période</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Les formateurs n'ont pas encore créé de disponibilités pour cette période.</div>
        </div>
      )}

      {/* ── Modals ── */}
      <ModalJour />
      <SeanceModal />
    </div>
  );
}
// ─── TABS CONFIGURATION ───────────────────────────────────────────────────────
const TABS = [
  { k: 'overview',     l: "Vue d'ensemble" },
  { k: 'analytiques',  l: 'Analytiques' },
  { k: 'profs',        l: 'Candidatures' },
  { k: 'demandes',     l: 'Demandes matières' },
  { k: 'signalements', l: '🚨 Signalements' },
  { k: 'users',        l: '👥 Utilisateurs' },
  { k: 'referentiel',  l: 'Référentiel' },
  { k: 'calendrier',   l: '📆 Calendrier' },
  { k: 'finances',     l: '💳 Finances' },
];

// ─── COMPOSANT CLOCHE NOTIFICATIONS ADMIN ────────────────────────────────────
function AdminNotifBell({ signalements, demandes, allProfs, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('adm_notif_read') || '[]')); } catch { return new Set(); }
  });
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifs = useMemo(() => {
    const list = [];
    (signalements || []).filter(s => s.statut === 'nouveau').forEach(s => {
      list.push({
        id: `sig-${s.id}`,
        icon: '🚨',
        type: 'Signalement',
        typeColor: '#dc2626',
        typeBg: '#fef2f2',
        typeBorder: '#fca5a5',
        title: `${s.etudiant_nom} a signalé ${s.prof_nom}`,
        detail: s.raison?.length > 60 ? s.raison.slice(0, 60) + '…' : s.raison,
        date: s.created_at,
        tab: 'signalements',
      });
    });
    (demandes || []).filter(d => d.statut === 'en_attente').forEach(d => {
      list.push({
        id: `dem-${d.id}`,
        icon: '💡',
        type: 'Demande matière',
        typeColor: '#d97706',
        typeBg: '#fffbeb',
        typeBorder: '#fcd34d',
        title: `${d.prof_nom} demande "${d.nom_matiere}"`,
        detail: `Niveau : ${d.nom_niveau || '—'}`,
        date: d.created_at,
        tab: 'demandes',
      });
    });
    (allProfs || []).filter(p => p.statut_validation === 'en_attente').slice(0, 5).forEach(p => {
      const nom = `${p.user_prenom || ''} ${p.user_nom || ''}`.trim();
      list.push({
        id: `prof-${p.id}`,
        icon: '👨‍🏫',
        type: 'Validation profil',
        typeColor: '#7c3aed',
        typeBg: '#f5f3ff',
        typeBorder: '#ddd6fe',
        title: `${nom} attend une validation`,
        detail: p.ville ? `Ville : ${p.ville}` : 'Profil soumis',
        date: null,
        tab: 'profs',
      });
    });
    return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [signalements, demandes, allProfs]);

  const unread = notifs.filter(n => !readIds.has(n.id));
  const unreadCount = unread.length;

  const markAllRead = () => {
    const newSet = new Set(notifs.map(n => n.id));
    setReadIds(newSet);
    try { localStorage.setItem('adm_notif_read', JSON.stringify([...newSet])); } catch {}
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(v => !v); if (!open) markAllRead(); }}
        style={{ width: 42, height: 42, borderRadius: 12, background: unreadCount > 0 ? '#fef2f2' : '#f8fafc', border: `1.5px solid ${unreadCount > 0 ? '#fca5a5' : '#e2e8f0'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', position: 'relative', transition: 'all .18s' }}
        title="Notifications"
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,.1)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: 9, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 50, right: 0, width: 380, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,.14)', zIndex: 9999, overflow: 'hidden', animation: 'adm-modalIn .22s ease both' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
            <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 14, color: '#0F172A' }}>
              🔔 Notifications
              {unreadCount > 0 && <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 10, background: '#ef4444', color: '#fff', marginLeft: 8 }}>{unreadCount} non lues</span>}
            </div>
            <button onClick={() => setOpen(false)} style={{ width: 26, height: 26, borderRadius: 7, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 11, color: '#64748b' }}>✕</button>
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '32px 18px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Aucune notification</div>
              </div>
            ) : notifs.map(n => {
              const isRead = readIds.has(n.id);
              return (
                <div key={n.id}
                  onClick={() => { onNavigate(n.tab); setOpen(false); }}
                  style={{ padding: '12px 18px', borderBottom: '1px solid #f8fafc', background: isRead ? '#fff' : '#fafbff', cursor: 'pointer', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                  onMouseLeave={e => e.currentTarget.style.background = isRead ? '#fff' : '#fafbff'}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: n.typeBg, border: `1.5px solid ${n.typeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{n.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 10, background: n.typeBg, color: n.typeColor, border: `1px solid ${n.typeBorder}` }}>{n.type}</span>
                        {n.date && <span style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(n.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>}
                        {!isRead && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginLeft: 'auto', flexShrink: 0 }}/>}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: isRead ? 500 : 700, color: '#0F172A', lineHeight: 1.4, marginBottom: 2 }}>{n.title}</div>
                      {n.detail && <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4, fontStyle: 'italic' }}>{n.detail}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {notifs.length > 0 && (
            <div style={{ padding: '10px 18px', borderTop: '1.5px solid #f1f5f9', background: '#fafbfc', textAlign: 'center' }}>
              <button onClick={() => { markAllRead(); setOpen(false); }}
                style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 12px', borderRadius: 8, transition: 'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                ✓ Tout marquer comme lu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const location = useLocation();

  const [tab, setTab] = useState(() => { const p = new URLSearchParams(window.location.search); return p.get('tab') || 'overview'; });
  const admRootRef    = React.useRef(null);
  const tabContentRef = React.useRef(null);
  const handleTabChange = React.useCallback((k) => {
    setTab(k);
    setTimeout(() => {
      if (admRootRef.current) {
        const rect = admRootRef.current.getBoundingClientRect();
        const absTop = rect.top + window.scrollY - 8;
        window.scrollTo({ top: absTop, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
  }, []);

  const [stats, setStats]             = useState({});
  const [allProfs, setAllProfs]       = useState([]);
  const [structure, setStructure]     = useState([]);
  const [villes, setVilles]           = useState([]);
  const [demandes, setDemandes]       = useState([]);
  const [chartData, setChartData]     = useState({});
  const [reservations, setReservations]   = useState([]);
  const [disponibilites, setDisponibilites] = useState([]);  // ← NOUVEAU : toutes les dispos
  const [signalements, setSignalements]   = useState([]);
  const [allUsers, setAllUsers]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedProf, setSelectedProf]   = useState(null);

  const [refusModal, setRefusModal]   = useState(null);
  const [refusRaison, setRefusRaison] = useState('');
  const [refusSaving, setRefusSaving] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const t = p.get('tab');
    if (t) setTab(t);
  }, [location.search]);

  useEffect(() => { injectCSS(); loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const safe = (promise, fallback) => promise.catch(err => {
      const status = err?.response?.status;
      if (status === 401) window.location.reload();
      return { data: fallback };
    });
    try {
      // ← MODIFICATION : ajout de l'appel /api/admin/disponibilites/all
      const [s, allP, struct, v, dem, cd, resa, sigs, usrs, dispos] = await Promise.all([
        safe(api.get('/api/admin/stats'), {}),
        safe(api.get('/api/admin/professeurs/all'), []),
        safe(api.get('/api/admin/referentiel/structure'), []),
        safe(api.get('/api/admin/referentiel/villes'), []),
        safe(api.get('/api/admin/demandes-matieres'), []),
        safe(api.get('/api/admin/stats/charts'), {}),
        safe(api.get('/api/admin/reservations/all'), []),
        safe(api.get('/api/admin/signalements'), []),
        safe(api.get('/api/admin/users/all'), []),
        safe(api.get('/api/admin/disponibilites/all'), []),  // ← NOUVEAU
      ]);
      setStats(s.data || {});
      setAllProfs(Array.isArray(allP.data) ? allP.data : []);
      setStructure(Array.isArray(struct.data) ? struct.data : []);
      setVilles(Array.isArray(v.data) ? v.data : []);
      setDemandes(Array.isArray(dem.data) ? dem.data : []);
      setChartData(cd.data || {});
      setReservations(Array.isArray(resa.data) ? resa.data : []);
      setSignalements(Array.isArray(sigs.data) ? sigs.data : []);
      setAllUsers(Array.isArray(usrs.data) ? usrs.data : []);
      setDisponibilites(Array.isArray(dispos.data) ? dispos.data : []);  // ← NOUVEAU
    } catch (e) { console.error('loadAll error:', e); }
    finally { setLoading(false); }
  };

  const handleValider = async (id) => {
    try { await api.put(`/api/admin/professeurs/${id}/valider`); loadAll(); }
    catch (e) { alert(e.response?.data?.detail || 'Erreur lors de la validation'); }
  };

  const handleRefuser = (id, nom) => {
    setRefusRaison('');
    setRefusModal({ profId: id, nom: nom || `Prof #${id}` });
  };

  const handleRefuserConfirm = async () => {
    if (!refusModal) return;
    setRefusSaving(true);
    try {
      await api.put(`/api/admin/professeurs/${refusModal.profId}/refuser`, { raison: refusRaison });
      setRefusModal(null); setRefusRaison(''); loadAll();
    } catch (e) { alert(e.response?.data?.detail || 'Erreur lors du refus'); }
    finally { setRefusSaving(false); }
  };

  const handleApprouverDemande = async (id) => {
    try { await api.put(`/api/admin/demandes-matieres/${id}/approuver`); loadAll(); }
    catch (e) { alert(e.response?.data?.detail || e.message); }
  };
  const handleRefuserDemande = async (id) => {
    if (!window.confirm('Refuser cette demande ?')) return;
    try { await api.put(`/api/admin/demandes-matieres/${id}/refuser`); loadAll(); }
    catch (e) { alert(e.response?.data?.detail || e.message); }
  };

  const counts = useMemo(() => ({
    tous:       allProfs.length,
    'validé':   allProfs.filter(p => p.statut_validation === 'validé').length,
    en_attente: allProfs.filter(p => p.statut_validation === 'en_attente').length,
    'refusé':   allProfs.filter(p => p.statut_validation === 'refusé').length,
    'bloqué':   allProfs.filter(p => p.user_statut === 'bloqué').length,
  }), [allProfs]);

  const demandesPending      = demandes.filter(d => d.statut === 'en_attente').length;
  const signalementsNouveaux = signalements.filter(s => s.statut === 'nouveau').length;

  const STAT_CARDS = [
    { icon: '👥', val: stats.total_users || 0,       label: 'Utilisateurs',  color: '#3b82f6', bg: '#eff6ff', delay: 0 },
    { icon: '✓',  val: counts['validé'] || 0,        label: 'Profs validés', color: '#10b981', bg: '#ecfdf5', delay: 50 },
    { icon: '⏳', val: counts.en_attente || 0,        label: 'En attente',    color: '#f59e0b', bg: '#fffbeb', delay: 100 },
    { icon: '📅', val: stats.total_reservations || 0, label: 'Réservations',  color: '#8b5cf6', bg: '#f5f3ff', delay: 150 },
    { icon: '🚨', val: signalementsNouveaux || 0,     label: 'Signalements',  color: '#ef4444', bg: '#fef2f2', delay: 200 },
  ];

  if (loading) return (
    <div className="adm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <div className="adm-loader" style={{ width: 36, height: 36 }} />
      <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Chargement du dashboard...</span>
    </div>
  );

  return (
    <div ref={admRootRef} className="adm" style={{ padding: '36px 40px' }}>
      {/* ── En-tête ── */}
      <div style={{ marginBottom: 32 }} className="adm-fadeUp">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#94a3b8' }}>Dashboard</span>
          <span style={{ color: '#e2e8f0' }}>·</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#3b82f6' }}>Administration</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontWeight: 900, fontSize: 28, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-.03em' }}>EduMatch Admin</h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: 13 }}>Bienvenue — état de la plateforme en temps réel</p>
          </div>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={loadAll} style={{ flexShrink: 0 }}>↻ Actualiser</button>
        </div>
      </div>

      {/* ── Barre de navigation ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 400, background: 'white', paddingTop: 10, paddingBottom: 10, marginBottom: 20, borderBottom: '1px solid #f1f5f9', marginLeft: -40, marginRight: -40, paddingLeft: 40, paddingRight: 40 }}>
        <div className="adm-tab-bar">
          {TABS.map(({ k, l }) => (
            <button key={k} className={`adm-tab${tab === k ? ' active' : ''}`} onClick={() => handleTabChange(k)}>
              {l}
              {k === 'demandes'     && demandesPending > 0      && <span className="adm-tab-badge">{demandesPending}</span>}
              {k === 'profs'        && counts.en_attente > 0    && <span className="adm-tab-badge" style={{ background: '#f59e0b' }}>{counts.en_attente}</span>}
              {k === 'signalements' && signalementsNouveaux > 0 && <span className="adm-tab-badge">{signalementsNouveaux}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPIs globaux ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 28 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} className="adm-stat adm-scaleIn" style={{ animationDelay: `${s.delay}ms` }}>
            <div className="adm-stat-accent" style={{ background: s.color }} />
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Cabinet Grotesk,sans-serif', fontSize: 32, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 5 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Contenu des onglets ── */}
      <div ref={tabContentRef} style={{ scrollMarginTop: 8 }} />
      {tab === 'overview'     && <OverviewTab stats={stats} allProfs={allProfs} demandes={demandes} counts={counts} onTabChange={handleTabChange} onViewProf={p => setSelectedProf(p)} chartData={chartData} />}
      {tab === 'analytiques'  && <AnalytiquesTab stats={stats} allProfs={allProfs} chartData={chartData} onTabChange={handleTabChange} signalements={signalements} users={allUsers} />}
      {tab === 'profs'        && <ProfsTab allProfs={allProfs} structure={structure} onView={setSelectedProf} onValider={handleValider} onRefuser={handleRefuser} />}
      {tab === 'demandes'     && <DemandesTab demandes={demandes} onApprouver={handleApprouverDemande} onRefuser={handleRefuserDemande} />}
      {tab === 'signalements' && <SignalementsTab signalements={signalements} onReload={loadAll} />}
      {tab === 'users'        && <UsersTab onReload={loadAll} />}
      {tab === 'referentiel'  && <ReferentielTab structure={structure} villes={villes} onReload={loadAll} />}
      {/* ← MODIFICATION : CalendrierTab reçoit disponibilites + reservations */}
      {tab === 'calendrier'   && <CalendrierTab disponibilites={disponibilites} reservations={reservations} />}
      {tab === 'finances'     && <FinancesTab />}

      {/* ── Drawer profil prof ── */}
      <ProfDrawer prof={selectedProf} onClose={() => setSelectedProf(null)} onValider={handleValider} onRefuser={handleRefuser} />

      {/* ── Modal refus ── */}
      {refusModal && (
        <div className="adm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setRefusModal(null); }}>
          <div className="adm-modal" style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 900, fontSize: 17, color: '#0F172A', margin: '0 0 5px' }}>❌ Refuser ce professeur</h3>
                <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: '#fef2f2', border: '1px solid #fca5a5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>👨‍🏫</span>
                  {refusModal.nom}
                </div>
              </div>
              <button onClick={() => setRefusModal(null)} style={{ width: 32, height: 32, borderRadius: 9, background: '#f8fafc', border: '1.5px solid #e2e8f0', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginLeft: 12 }}>✕</button>
            </div>
            <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 10, marginBottom: 18, fontSize: 12, color: '#b45309', lineHeight: 1.6 }}>
              ⚠️ La raison sera visible par le professeur dans son tableau de bord.
            </div>
            <label className="adm-label">Raison du refus <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optionnel mais recommandé)</span></label>
            <textarea autoFocus className="adm-input adm-textarea" placeholder="Ex: Documents manquants, profil incomplet..." value={refusRaison} onChange={e => setRefusRaison(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleRefuserConfirm(); }} rows={4} />
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, marginBottom: 20 }}>Ctrl+Entrée pour confirmer rapidement</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="adm-btn adm-btn-danger" style={{ flex: 2, justifyContent: 'center', opacity: refusSaving ? .6 : 1 }} disabled={refusSaving} onClick={handleRefuserConfirm}>
                {refusSaving ? '⏳ Refus en cours...' : '❌ Confirmer le refus'}
              </button>
              <button className="adm-btn adm-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRefusModal(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}