import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';

// ── Charger Chart.js dynamiquement ──────────────────────────────
let _loaded = false;
function loadChart() {
  return new Promise(resolve => {
    if (window.Chart) { resolve(window.Chart); return; }
    if (_loaded) {
      const t = setInterval(() => { if (window.Chart) { clearInterval(t); resolve(window.Chart); }}, 50);
      return;
    }
    _loaded = true;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    s.onload = () => resolve(window.Chart);
    document.head.appendChild(s);
  });
}

// ── Lire les CSS vars selon le thème actif ──────────────────────
function theme() {
  const g = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  return {
    text:     g('--text')     || '#f0f0f8',
    text2:    g('--text2')    || '#9999bb',
    surface:  g('--surface')  || '#12121a',
    surface2: g('--surface2') || '#1a1a26',
    border:   g('--border')   || '#2a2a3a',
  };
}

// ── Hook Chart.js ────────────────────────────────────────────────
function useChart(ref, buildFn, deps) {
  const inst = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    loadChart().then(Chart => {
      if (inst.current) inst.current.destroy();
      inst.current = new Chart(ref.current.getContext('2d'), buildFn(Chart, theme()));
    });
    return () => { if (inst.current) { inst.current.destroy(); inst.current = null; }};
  }, deps); // eslint-disable-line
}

const PAL = ['#6c63ff','#ff6584','#43e97b','#38bdf8','#f59e0b','#a78bfa','#34d399','#fb923c'];

// ════════════════════════════════════════════
//  1. LINE — Réservations par mois
// ════════════════════════════════════════════
function LineResa({ data }) {
  const ref = useRef(null);
  useChart(ref, (C, c) => ({
    type: 'line',
    data: {
      labels: data.map(d => d.mois),
      datasets: [{
        label: 'Réservations',
        data: data.map(d => d.total),
        borderColor: '#6c63ff',
        backgroundColor: 'rgba(108,99,255,0.15)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6c63ff',
        pointBorderColor: c.surface,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.surface2, titleColor: c.text2,
          bodyColor: c.text, borderColor: c.border, borderWidth: 1,
          callbacks: { label: x => ` ${x.parsed.y} réservation${x.parsed.y > 1 ? 's' : ''}` },
        },
      },
      scales: {
        x: { grid: { color: c.border + '55' }, ticks: { color: c.text2, font: { size: 11 } } },
        y: { beginAtZero: true, grid: { color: c.border + '55' }, ticks: { color: c.text2, font: { size: 11 }, stepSize: 1, callback: v => Number.isInteger(v) ? v : '' } },
      },
    },
  }), [JSON.stringify(data)]);
  return <canvas ref={ref} />;
}

// ════════════════════════════════════════════
//  2. BAR VERTICAL — Réservations par jour
// ════════════════════════════════════════════
function BarJours({ data }) {
  const ref = useRef(null);
  const max = Math.max(...data.map(d => d.total), 1);

  useChart(ref, (C, c) => ({
    type: 'bar',
    data: {
      labels: data.map(d => d.jour),
      datasets: [{
        label: 'Réservations',
        data: data.map(d => d.total),
        backgroundColor: data.map((_, i) => {
          // Mettre en évidence le jour avec le plus de réservations
          const mx = Math.max(...data.map(d => d.total));
          return data[i].total === mx && mx > 0 ? '#6c63ff' : '#6c63ff66';
        }),
        borderColor: data.map((_, i) => {
          const mx = Math.max(...data.map(d => d.total));
          return data[i].total === mx && mx > 0 ? '#6c63ff' : '#6c63ff44';
        }),
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.surface2, titleColor: c.text2,
          bodyColor: c.text, borderColor: c.border, borderWidth: 1,
          callbacks: {
            title: ctx => `${ctx[0].label}`,
            label: x => ` ${x.parsed.y} réservation${x.parsed.y > 1 ? 's' : ''}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: c.text, font: { size: 12, weight: '600' } },
        },
        y: {
          beginAtZero: true,
          max: max < 3 ? 3 : undefined,
          grid: { color: c.border + '55' },
          ticks: { color: c.text2, font: { size: 11 }, stepSize: 1, callback: v => Number.isInteger(v) ? v : '' },
        },
      },
    },
  }), [JSON.stringify(data)]);
  return <canvas ref={ref} />;
}

// ════════════════════════════════════════════
//  3. BAR HORIZONTAL — Matières par domaine
//  Données réelles avec barres proportionnelles
// ════════════════════════════════════════════
function BarMatieres({ matieres, metric }) {
  const ref = useRef(null);
  const vals = matieres.map(m => m[metric] || 0);
  const maxVal = Math.max(...vals, 1);

  useChart(ref, (C, c) => ({
    type: 'bar',
    data: {
      labels: matieres.map(m => m.matiere.length > 16 ? m.matiere.slice(0, 15) + '…' : m.matiere),
      datasets: [{
        label: metric === 'nb_resa' ? 'Réservations' : 'Formateurs',
        // Utiliser les vraies valeurs — si tout est 0, afficher 0 (pas de triche)
        data: vals,
        backgroundColor: matieres.map((_, i) => PAL[i % PAL.length] + 'bb'),
        borderColor:     matieres.map((_, i) => PAL[i % PAL.length]),
        borderWidth: 1.5,
        borderRadius: 5,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.surface2, titleColor: c.text2,
          bodyColor: c.text, borderColor: c.border, borderWidth: 1,
          callbacks: {
            label: x => {
              const v = vals[x.dataIndex];
              const lbl = metric === 'nb_resa' ? 'réservation' : 'formateur';
              return ` ${v} ${lbl}${v > 1 ? 's' : ''}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          // Si toutes les valeurs sont 0, montrer quand même une échelle jusqu'à 1
          max: maxVal < 1 ? 1 : undefined,
          grid: { color: c.border + '55' },
          ticks: {
            color: c.text2, font: { size: 11 },
            stepSize: 1,
            callback: v => Number.isInteger(v) && v >= 0 ? v : '',
          },
        },
        y: {
          grid: { display: false },
          ticks: { color: c.text, font: { size: 12, weight: '600' } },
        },
      },
    },
  }), [JSON.stringify(matieres), metric, maxVal]);
  return <canvas ref={ref} />;
}

// ════════════════════════════════════════════
//  4. DONUT — Mode enseignement
// ════════════════════════════════════════════
function DonutModes({ data }) {
  const ref = useRef(null);
  const tot = data.reduce((a, b) => a + b.val, 0);
  useChart(ref, (C, c) => ({
    type: 'doughnut',
    data: {
      labels: data.map(d => d.label),
      datasets: [{ data: data.map(d => d.val), backgroundColor: ['#6c63ff','#43e97b'], borderColor: c.surface, borderWidth: 3, hoverOffset: 6 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: c.text, font: { size: 12, weight: '600' },
            padding: 14, usePointStyle: true, pointStyleWidth: 10,
            generateLabels: chart => chart.data.labels.map((lbl, i) => ({
              text: `${lbl}  ${chart.data.datasets[0].data[i]} (${tot > 0 ? Math.round(chart.data.datasets[0].data[i] / tot * 100) : 0}%)`,
              fillStyle: chart.data.datasets[0].backgroundColor[i],
              strokeStyle: chart.data.datasets[0].backgroundColor[i],
              fontColor: c.text, hidden: false, index: i,
            })),
          },
        },
        tooltip: {
          backgroundColor: c.surface2, titleColor: c.text2, bodyColor: c.text, borderColor: c.border, borderWidth: 1,
          callbacks: { label: x => ` ${x.label} : ${x.parsed} formateur${x.parsed > 1 ? 's' : ''} (${tot > 0 ? Math.round(x.parsed / tot * 100) : 0}%)` },
        },
      },
    },
  }), [JSON.stringify(data)]);
  return <canvas ref={ref} />;
}

// ════════════════════════════════════════════
//  5. DONUT — Statut des formateurs
// ════════════════════════════════════════════
function DonutStatut({ data }) {
  const ref = useRef(null);
  const tot = data.reduce((a, b) => a + b.val, 0);
  useChart(ref, (C, c) => ({
    type: 'doughnut',
    data: {
      labels: data.map(d => d.label),
      datasets: [{ data: data.map(d => d.val), backgroundColor: ['#43e97b','#f59e0b','#ef4444'], borderColor: c.surface, borderWidth: 3, hoverOffset: 6 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: c.text, font: { size: 12, weight: '600' },
            padding: 14, usePointStyle: true, pointStyleWidth: 10,
            generateLabels: chart => chart.data.labels.map((lbl, i) => ({
              text: `${lbl}  ${chart.data.datasets[0].data[i]} (${tot > 0 ? Math.round(chart.data.datasets[0].data[i] / tot * 100) : 0}%)`,
              fillStyle: chart.data.datasets[0].backgroundColor[i],
              strokeStyle: chart.data.datasets[0].backgroundColor[i],
              fontColor: c.text, hidden: false, index: i,
            })),
          },
        },
        tooltip: {
          backgroundColor: c.surface2, titleColor: c.text2, bodyColor: c.text, borderColor: c.border, borderWidth: 1,
          callbacks: { label: x => ` ${x.label} : ${x.parsed} (${tot > 0 ? Math.round(x.parsed / tot * 100) : 0}%)` },
        },
      },
    },
  }), [JSON.stringify(data)]);
  return <canvas ref={ref} />;
}

// ════════════════════════════════════════════
//  CARTE
// ════════════════════════════════════════════
function Card({ icon, title, subtitle, height = 240, children, headerRight }) {
  const ok   = subtitle?.startsWith('✅');
  const warn = subtitle?.startsWith('⚠️');
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: '1rem' }}>{icon}</span>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '.88rem', color: 'var(--text)' }}>{title}</span>
          </div>
          {subtitle && <div style={{ fontSize: '.7rem', fontWeight: 500, color: ok ? '#43e97b' : warn ? '#f59e0b' : 'var(--text2)' }}>{subtitle}</div>}
        </div>
        {headerRight && <div style={{ flexShrink: 0 }}>{headerRight}</div>}
      </div>
      <div style={{ height, position: 'relative', minHeight: height }}>{children}</div>
    </div>
  );
}

function Empty({ msg }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text2)', fontSize: '.8rem' }}>
      <span style={{ fontSize: '1.8rem', opacity: .4 }}>📭</span>{msg}
    </div>
  );
}

// ════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════
export default function AdminCharts({ stats = {} }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [domainIdx, setDomainIdx] = useState(0);
  const [metric, setMetric]       = useState('nb_profs'); // nb_profs fiable si peu de réservations

  useEffect(() => {
    api.get('/api/admin/stats/charts')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(e => { console.error('[AdminCharts]', e); setError('Erreur chargement. Voir console uvicorn.'); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text2)' }}>
      <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
      <div style={{ fontSize: '.88rem' }}>Chargement des statistiques…</div>
    </div>
  );

  if (error) return (
    <div style={{ padding: 20, textAlign: 'center', color: '#ef4444', fontSize: '.82rem', background: 'rgba(239,68,68,0.08)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)' }}>
      ❌ {error}
    </div>
  );

  const {
    reservations_par_mois = [],
    reservations_par_jour = [],
    matieres_par_domaine  = [],
    modes_enseignement    = [],
    statut_profs          = [],
  } = data;

  const totalResa   = reservations_par_mois.reduce((a, b) => a + b.total, 0);
  const totalJours  = reservations_par_jour.reduce((a, b) => a + b.total, 0);
  const domActif    = matieres_par_domaine[domainIdx] || null;
  const modesF      = modes_enseignement.filter(m => m.val > 0);
  const statutF     = statut_profs.filter(s => s.val > 0);
  const totalStatut = statutF.reduce((a, b) => a + b.val, 0);
  const nbValides   = statut_profs.find(s => s.label === 'Validés')?.val || 0;
  const tauxValid   = totalStatut > 0 ? Math.round((nbValides / totalStatut) * 100) : 0;

  // Déterminer la métrique optimale pour les matières
  // Si aucune réservation → nb_profs plus pertinent
  const metricAuto = totalResa === 0 && metric === 'nb_resa' ? 'nb_profs' : metric;
  const metricActuel = metricAuto;

  // Onglets domaines + toggle
  const domainHeader = matieres_par_domaine.length > 0 && (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
      {matieres_par_domaine.map((d, i) => (
        <button key={i} onClick={() => setDomainIdx(i)}
          style={{ padding: '3px 10px', fontSize: '.68rem', fontWeight: 700, borderRadius: 20, border: 'none', cursor: 'pointer', transition: 'all .15s', background: i === domainIdx ? '#6c63ff' : 'var(--surface2)', color: i === domainIdx ? '#fff' : 'var(--text2)' }}>
          {d.domaine}
        </button>
      ))}
      <div style={{ display: 'flex', gap: 3 }}>
        {[['nb_profs','👨‍🏫 Profs'],['nb_resa','📅 Résa']].map(([k,l]) => (
          <button key={k} onClick={() => setMetric(k)}
            style={{ padding: '3px 9px', fontSize: '.65rem', fontWeight: 700, borderRadius: 20, border: 'none', cursor: 'pointer', transition: 'all .15s', background: metricActuel === k ? '#ff6584' : 'var(--surface2)', color: metricActuel === k ? '#fff' : 'var(--text2)' }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Titre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 22, background: 'linear-gradient(180deg,#6c63ff,#ff6584)', borderRadius: 2 }} />
        <div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1rem', margin: 0, color: 'var(--text)' }}>Statistiques & Analyses</h2>
          <p style={{ fontSize: '.7rem', color: 'var(--text2)', margin: 0 }}>Données en temps réel — EduMatch</p>
        </div>
      </div>

      {/* LIGNE 1 : Réservations/mois + Réservations/jour */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <Card icon="📈" title="Réservations par mois"
          subtitle={totalResa > 0 ? `✅ Données réelles — ${totalResa} réservation${totalResa > 1 ? 's' : ''} au total` : '⚠️ Aucune réservation enregistrée'}
          height={230}
        >
          {reservations_par_mois.length > 0 ? <LineResa data={reservations_par_mois} /> : <Empty msg="Aucune réservation" />}
        </Card>

        <Card icon="📊" title="Réservations par jour de la semaine"
          subtitle={totalJours > 0 ? `✅ Données réelles — Activité hebdomadaire` : '⚠️ Aucune réservation encore'}
          height={230}
        >
          {reservations_par_jour.length > 0 ? <BarJours data={reservations_par_jour} /> : <Empty msg="Aucune réservation" />}
        </Card>
      </div>

      {/* LIGNE 2 : Matières + donuts + KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        <Card icon="📚" title="Formateurs par matière"
          subtitle={domActif
            ? (domActif.matieres.some(m => m[metricActuel] > 0)
                ? `✅ ${domActif.domaine} — données réelles`
                : `⚠️ ${domActif.domaine} — aucun formateur actif`)
            : '⚠️ Configurez le référentiel'}
          height={280}
          headerRight={domainHeader}
        >
          {domActif && domActif.matieres.length > 0
            ? <BarMatieres matieres={domActif.matieres} metric={metricActuel} />
            : <Empty msg="Ajoutez des matières dans le référentiel" />}
        </Card>

        {/* Donuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card icon="🌐" title="Mode d'enseignement"
            subtitle={modesF.length > 0 ? `✅ ${modesF.reduce((a,b)=>a+b.val,0)} formateurs validés` : '⚠️ Aucun formateur validé'}
            height={180}
          >
            {modesF.length > 0 ? <DonutModes data={modesF} /> : <Empty msg="Aucun formateur" />}
          </Card>

          <Card icon="👨‍🏫" title="Statut des formateurs"
            subtitle={totalStatut > 0 ? `✅ ${totalStatut} profil${totalStatut > 1 ? 's' : ''} enregistrés` : '⚠️ Aucun profil'}
            height={180}
          >
            {statutF.length > 0 ? <DonutStatut data={statutF} /> : <Empty msg="Aucun profil" />}
          </Card>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon:'🏆', label:'Taux de validation',    val:`${tauxValid}%`,                                                                        color:'#43e97b' },
            { icon:'📅', label:'Réservations ce mois',  val: stats.reservations_mois ?? reservations_par_mois.at(-1)?.total ?? 0,                  color:'#6c63ff' },
            { icon:'📊', label:'Total réservations',     val: totalResa,                                                                             color:'#38bdf8' },
            { icon:'⏳', label:'Profils en attente',     val: stats.en_attente ?? statut_profs.find(s=>s.label==='En attente')?.val ?? 0,           color:'#f59e0b' },
            { icon:'📋', label:'Demandes matières',      val: stats.demandes_matieres_pending ?? 0,                                                  color:'#ff6584' },
          ].map((k, i) => (
            <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:13, padding:'11px 15px', display:'flex', alignItems:'center', gap:12, flex:1 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:`${k.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.95rem', flexShrink:0 }}>
                {k.icon}
              </div>
              <div>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.1rem', color:k.color, lineHeight:1 }}>{k.val}</div>
                <div style={{ fontSize:'.65rem', color:'var(--text2)', marginTop:3 }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}