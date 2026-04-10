/**
 * EduMatch — Utilitaire export PDF côté frontend
 * Utilise l'API natif window.print() avec une feuille CSS dédiée
 * Compatible avec tous les navigateurs sans dépendance externe
 */

/**
 * Génère et télécharge un PDF à partir d'un contenu HTML
 * @param {string} html   - Contenu HTML à imprimer
 * @param {string} title  - Titre du document
 */
export function exportToPDF(html, title = 'EduMatch') {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) { alert('Autorisez les popups pour exporter en PDF'); return; }

  w.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Inter',sans-serif; color:#0F172A; background:#fff; font-size:12px; line-height:1.5; }
    .pdf-page { max-width:800px; margin:0 auto; padding:32px 40px; }

    /* Header */
    .pdf-header { display:flex; justify-content:space-between; align-items:center; padding-bottom:18px; border-bottom:2px solid #00153D; margin-bottom:24px; }
    .pdf-logo { display:flex; align-items:center; gap:10px; }
    .pdf-logo-icon { width:36px; height:36px; background:linear-gradient(135deg,#00153D,#1E3A8A); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px; }
    .pdf-logo-text { font-size:18px; font-weight:800; color:#00153D; letter-spacing:-.02em; }
    .pdf-logo-sub  { font-size:10px; color:#94A3B8; font-weight:500; text-transform:uppercase; letter-spacing:.08em; }
    .pdf-meta      { text-align:right; font-size:11px; color:#64748B; }
    .pdf-meta strong { color:#0F172A; }

    /* Title */
    .pdf-title { font-size:20px; font-weight:800; color:#0F172A; margin-bottom:4px; letter-spacing:-.02em; }
    .pdf-subtitle { font-size:12px; color:#64748B; margin-bottom:24px; }

    /* Section */
    .pdf-section { margin-bottom:24px; }
    .pdf-section-title { font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.1em; margin-bottom:12px; padding-bottom:6px; border-bottom:1px solid #F1F5F9; }

    /* Stats KPI */
    .pdf-kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
    .pdf-kpi  { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px; text-align:center; }
    .pdf-kpi-val { font-size:22px; font-weight:800; color:#00153D; line-height:1; margin-bottom:4px; }
    .pdf-kpi-lbl { font-size:10px; color:#94A3B8; font-weight:600; text-transform:uppercase; letter-spacing:.06em; }

    /* Table */
    table { width:100%; border-collapse:collapse; font-size:11px; margin-bottom:8px; }
    thead tr { background:#F8FAFC; }
    th { padding:9px 12px; text-align:left; font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.08em; border-bottom:1.5px solid #E2E8F0; white-space:nowrap; }
    td { padding:9px 12px; border-bottom:1px solid #F8FAFC; vertical-align:middle; }
    tr:last-child td { border-bottom:none; }
    tbody tr:nth-child(even) { background:#FAFBFC; }

    /* Badge */
    .badge { display:inline-block; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700; }
    .badge-green  { background:#ECFDF5; color:#065F46; }
    .badge-amber  { background:#FFFBEB; color:#B45309; }
    .badge-red    { background:#FEF2F2; color:#991B1B; }
    .badge-blue   { background:#EFF6FF; color:#1D4ED8; }
    .badge-gray   { background:#F9FAFB; color:#374151; }

    /* Footer */
    .pdf-footer { margin-top:32px; padding-top:14px; border-top:1px solid #F1F5F9; display:flex; justify-content:space-between; font-size:10px; color:#CBD5E1; }

    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .pdf-page { padding:20px; }
      .no-print { display:none !important; }
    }
  </style>
</head>
<body>
<div class="pdf-page">
  ${html}
  <div class="pdf-footer">
    <span>EduMatch — Projet PFE 2025/2026</span>
    <span>Généré le ${new Date().toLocaleString('fr-FR')}</span>
  </div>
</div>
<script>
  window.onload = function() {
    window.print();
    setTimeout(() => window.close(), 1000);
  };
</script>
</body>
</html>`);
  w.document.close();
}

/* ─── Helpers ── */
function badge(statut) {
  const map = {
    'confirmé':   'badge-green',
    'en_attente': 'badge-amber',
    'refusé':     'badge-red',
    'annulé':     'badge-gray',
    'terminé':    'badge-blue',
    'validé':     'badge-green',
  };
  return `<span class="badge ${map[statut]||'badge-gray'}">${statut}</span>`;
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' });
}

function header(title, subtitle) {
  const now = new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
  return `
    <div class="pdf-header">
      <div class="pdf-logo">
        <div class="pdf-logo-icon">🎓</div>
        <div>
          <div class="pdf-logo-text">EduMatch</div>
          <div class="pdf-logo-sub">Plateforme éducative</div>
        </div>
      </div>
      <div class="pdf-meta">
        <div><strong>${title}</strong></div>
        <div>Exporté le ${now}</div>
      </div>
    </div>
    <div class="pdf-title">${title}</div>
    ${subtitle ? `<div class="pdf-subtitle">${subtitle}</div>` : ''}
  `;
}

/* ═══════════════════════════════════════
   EXPORT PROF — Mes réservations
═══════════════════════════════════════ */
export function exportProfReservations(reservations, profNom) {
  const total     = reservations.length;
  const confirmes = reservations.filter(r => r.statut === 'confirmé').length;
  const attente   = reservations.filter(r => r.statut === 'en_attente').length;
  const refuses   = reservations.filter(r => r.statut === 'refusé').length;

  const rows = reservations
    .sort((a, b) => new Date(b.date_cours || 0) - new Date(a.date_cours || 0))
    .map(r => `
      <tr>
        <td><strong>${r.etudiant_nom || '—'}</strong>${r.etudiant_telephone ? `<br/><span style="color:#94A3B8;font-size:10px;">${r.etudiant_telephone}</span>` : ''}</td>
        <td>${fmtDate(r.date_cours)}</td>
        <td>${String(r.heure_debut || '').slice(0,5)} – ${String(r.heure_fin || '').slice(0,5)}</td>
        <td>${r.mode_seance === 'en_ligne' ? '🌐 En ligne' : '🏫 Présentiel'}</td>
        <td>${badge(r.statut)}</td>
        <td>${r.tarif_applique ? `${r.tarif_applique} DT/h` : '—'}</td>
        <td style="font-style:italic;color:#94A3B8;font-size:10px;">${r.notes_etudiant ? r.notes_etudiant.slice(0, 60) + (r.notes_etudiant.length > 60 ? '…' : '') : '—'}</td>
      </tr>
    `).join('');

  const html = `
    ${header(`Mes réservations — ${profNom}`, `${total} réservation${total > 1 ? 's' : ''} au total`)}

    <div class="pdf-kpis">
      <div class="pdf-kpi"><div class="pdf-kpi-val">${total}</div><div class="pdf-kpi-lbl">Total</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-val" style="color:#065F46">${confirmes}</div><div class="pdf-kpi-lbl">Confirmées</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-val" style="color:#B45309">${attente}</div><div class="pdf-kpi-lbl">En attente</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-val" style="color:#DC2626">${refuses}</div><div class="pdf-kpi-lbl">Refusées</div></div>
    </div>

    <div class="pdf-section">
      <div class="pdf-section-title">Liste des réservations</div>
      <table>
        <thead>
          <tr>
            <th>Étudiant</th>
            <th>Date</th>
            <th>Horaire</th>
            <th>Mode</th>
            <th>Statut</th>
            <th>Tarif</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:#94A3B8;">Aucune réservation</td></tr>'}</tbody>
      </table>
    </div>
  `;

  exportToPDF(html, `Réservations — ${profNom}`);
}

/* ═══════════════════════════════════════
   EXPORT ADMIN — Liste formateurs
═══════════════════════════════════════ */
export function exportAdminProfs(profs) {
  const valides   = profs.filter(p => p.statut_validation === 'validé').length;
  const attente   = profs.filter(p => p.statut_validation === 'en_attente').length;
  const refuses   = profs.filter(p => p.statut_validation === 'refusé').length;

  const rows = profs.map(p => {
    const nm   = `${p.user_prenom || ''} ${p.user_nom || ''}`.trim() || '—';
    const mats = p.tarifs_matieres ? [...new Set(p.tarifs_matieres.map(t => t.nom_matiere))].slice(0, 3).join(', ') : '—';
    const note = parseFloat(p.note_moyenne || 0);
    return `
      <tr>
        <td><strong>${nm}</strong>${p.email ? `<br/><span style="color:#94A3B8;font-size:10px;">${p.email}</span>` : ''}</td>
        <td>${p.ville || '—'}</td>
        <td>${mats}</td>
        <td>${p.mode_enseignement === 'en_ligne' ? '🌐 En ligne' : p.mode_enseignement === 'presentiel' ? '🏫 Présentiel' : '🔀 Les deux'}</td>
        <td>${note > 0 ? `⭐ ${note.toFixed(1)} (${p.nb_avis} avis)` : '—'}</td>
        <td>${badge(p.statut_validation)}</td>
      </tr>
    `;
  }).join('');

  const html = `
    ${header('Liste des Formateurs', `${profs.length} formateur${profs.length > 1 ? 's' : ''} enregistré${profs.length > 1 ? 's' : ''}`)}

    <div class="pdf-kpis">
      <div class="pdf-kpi"><div class="pdf-kpi-val">${profs.length}</div><div class="pdf-kpi-lbl">Total</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-val" style="color:#065F46">${valides}</div><div class="pdf-kpi-lbl">Validés</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-val" style="color:#B45309">${attente}</div><div class="pdf-kpi-lbl">En attente</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-val" style="color:#DC2626">${refuses}</div><div class="pdf-kpi-lbl">Refusés</div></div>
    </div>

    <div class="pdf-section">
      <div class="pdf-section-title">Liste complète</div>
      <table>
        <thead>
          <tr><th>Formateur</th><th>Ville</th><th>Matières</th><th>Mode</th><th>Note</th><th>Statut</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#94A3B8;">Aucun formateur</td></tr>'}</tbody>
      </table>
    </div>
  `;

  exportToPDF(html, 'Formateurs — EduMatch Admin');
}

/* ═══════════════════════════════════════
   EXPORT ADMIN — Rapport analytiques
═══════════════════════════════════════ */
export function exportAdminAnalytiques(stats, chartData, allProfs) {
  const { performance_profs = [], reservations_par_mois = [] } = chartData;
  const valides = allProfs.filter(p => p.statut_validation === 'validé').length;
  const totalResa = reservations_par_mois.reduce((a, b) => a + (b.total || 0), 0);

  const perfRows = performance_profs.map((p, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    return `
      <tr>
        <td style="font-size:14px;">${medal}</td>
        <td><strong>${p.nom}</strong>${p.ville ? `<br/><span style="color:#94A3B8;font-size:10px;">📍 ${p.ville}</span>` : ''}</td>
        <td>${p.matieres.slice(0, 2).join(', ') || '—'}</td>
        <td>${p.note > 0 ? `⭐ ${p.note.toFixed(1)}` : '—'}</td>
        <td style="text-align:center;">${p.nb_resa}</td>
        <td style="text-align:center;">${p.nb_confirme}</td>
        <td style="text-align:center;font-weight:700;color:${p.taux_confirmation >= 70 ? '#059669' : p.taux_confirmation >= 40 ? '#D97706' : '#DC2626'}">${p.nb_resa > 0 ? `${p.taux_confirmation}%` : '—'}</td>
      </tr>
    `;
  }).join('');

  const moisRows = reservations_par_mois.map(m => `
    <tr>
      <td>${m.mois}</td>
      <td style="text-align:center;font-weight:700;">${m.total}</td>
    </tr>
  `).join('');

  const html = `
    ${header('Rapport Analytiques', `Généré le ${new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}`)}

    <div class="pdf-kpis">
      <div class="pdf-kpi"><div class="pdf-kpi-val">${stats.total_users || 0}</div><div class="pdf-kpi-lbl">Utilisateurs</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-val" style="color:#065F46">${valides}</div><div class="pdf-kpi-lbl">Formateurs actifs</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-val" style="color:#1E40AF">${totalResa}</div><div class="pdf-kpi-lbl">Total réservations</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-val" style="color:#B45309">${stats.reservations_mois || 0}</div><div class="pdf-kpi-lbl">Ce mois-ci</div></div>
    </div>

    ${reservations_par_mois.length > 0 ? `
    <div class="pdf-section">
      <div class="pdf-section-title">Réservations par mois</div>
      <table>
        <thead><tr><th>Mois</th><th style="text-align:center;">Réservations</th></tr></thead>
        <tbody>${moisRows}</tbody>
      </table>
    </div>` : ''}

    ${performance_profs.length > 0 ? `
    <div class="pdf-section">
      <div class="pdf-section-title">Performance des formateurs</div>
      <table>
        <thead>
          <tr><th>#</th><th>Formateur</th><th>Matières</th><th>Note</th><th style="text-align:center;">Rés.</th><th style="text-align:center;">Conf.</th><th style="text-align:center;">Taux</th></tr>
        </thead>
        <tbody>${perfRows}</tbody>
      </table>
    </div>` : ''}
  `;

  exportToPDF(html, 'Rapport Analytiques — EduMatch');
}