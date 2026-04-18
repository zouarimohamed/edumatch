/**
 * EduMatch — Utilitaire export PDF côté frontend
 * Utilise l'API natif window.print() avec une feuille CSS dédiée
 */

export function exportToPDF(html, title = 'EduMatch') {
  const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Inter',sans-serif; color:#0F172A; background:#fff; font-size:12px; line-height:1.5; }
    .pdf-page { max-width:820px; margin:0 auto; padding:32px 40px; }

    /* Header */
    .pdf-header { display:flex; justify-content:space-between; align-items:center; padding-bottom:18px; border-bottom:2.5px solid #00153D; margin-bottom:24px; }
    .pdf-logo { display:flex; align-items:center; gap:10px; }
    .pdf-logo-icon { width:38px; height:38px; background:linear-gradient(135deg,#00153D,#1E3A8A); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:17px; }
    .pdf-logo-text { font-size:19px; font-weight:800; color:#00153D; letter-spacing:-.02em; }
    .pdf-logo-sub  { font-size:10px; color:#94A3B8; font-weight:500; text-transform:uppercase; letter-spacing:.08em; }
    .pdf-meta      { text-align:right; font-size:11px; color:#64748B; line-height:1.7; }
    .pdf-meta strong { color:#0F172A; font-size:12px; }

    /* Title */
    .pdf-title    { font-size:21px; font-weight:800; color:#0F172A; margin-bottom:4px; letter-spacing:-.02em; }
    .pdf-subtitle { font-size:12px; color:#64748B; margin-bottom:24px; }

    /* Section */
    .pdf-section { margin-bottom:26px; }
    .pdf-section-title {
      font-size:10px; font-weight:700; color:#64748B;
      text-transform:uppercase; letter-spacing:.12em;
      margin-bottom:12px; padding-bottom:6px;
      border-bottom:1.5px solid #E2E8F0;
      display:flex; align-items:center; gap:6px;
    }

    /* KPIs */
    .pdf-kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:26px; }
    .pdf-kpi  { border-radius:12px; padding:16px 14px; text-align:center; border:1px solid #E2E8F0; }
    .pdf-kpi-val { font-size:26px; font-weight:800; line-height:1; margin-bottom:5px; }
    .pdf-kpi-lbl { font-size:10px; color:#94A3B8; font-weight:600; text-transform:uppercase; letter-spacing:.07em; }

    /* Table */
    table { width:100%; border-collapse:collapse; font-size:11px; table-layout:fixed; }
    thead tr { background:#F0F4FF; }
    th { padding:8px 10px; text-align:left; font-size:9px; font-weight:700; color:#1E40AF; text-transform:uppercase; letter-spacing:.06em; border-bottom:2px solid #C7D2FE; white-space:nowrap; overflow:hidden; }
    td { padding:8px 10px; border-bottom:1px solid #F1F5F9; vertical-align:middle; word-break:normal; white-space:normal; overflow:hidden; }
    tr:last-child td { border-bottom:none; }
    tbody tr:nth-child(even) { background:#FAFBFF; }

    /* Badges statut */
    .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; white-space:nowrap; }
    .badge::before { content:''; width:5px; height:5px; border-radius:50%; display:inline-block; }
    .badge-green  { background:#ECFDF5; color:#065F46; border:1px solid #6EE7B7; }
    .badge-green::before  { background:#10B981; }
    .badge-amber  { background:#FFFBEB; color:#92400E; border:1px solid #FCD34D; }
    .badge-amber::before  { background:#F59E0B; }
    .badge-red    { background:#FEF2F2; color:#991B1B; border:1px solid #FCA5A5; }
    .badge-red::before    { background:#EF4444; }
    .badge-blue   { background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; }
    .badge-blue::before   { background:#3B82F6; }
    .badge-gray   { background:#F9FAFB; color:#374151; border:1px solid #D1D5DB; }
    .badge-gray::before   { background:#9CA3AF; }

    /* Mode badge */
    .mode-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:10px; font-weight:600; }
    .mode-online   { background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; }
    .mode-present  { background:#ECFDF5; color:#065F46; border:1px solid #6EE7B7; }
    .mode-both     { background:#EEF2FF; color:#4338CA; border:1px solid #C7D2FE; }

    /* Highlight row en attente */
    .row-pending td { background:#FFFBEB !important; }

    /* Divider */
    .pdf-divider { height:1px; background:#F1F5F9; margin:20px 0; }

    /* Info prof card */
    .prof-info { display:flex; gap:20px; padding:16px; background:#F8FAFC; border-radius:12px; border:1px solid #E2E8F0; margin-bottom:24px; }
    .prof-info-block { flex:1; }
    .prof-info-label { font-size:9px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.1em; margin-bottom:3px; }
    .prof-info-value { font-size:13px; font-weight:700; color:#0F172A; }

    /* Footer */
    .pdf-footer { margin-top:36px; padding-top:14px; border-top:1.5px solid #F1F5F9; display:flex; justify-content:space-between; font-size:10px; color:#CBD5E1; }

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
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 400);
  });
</script>
</body>
</html>`;

  // Blob URL — contourne les restrictions Trusted Types CSP
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (!win) {
    // Fallback : télécharger en HTML si popup bloqué
    const a = document.createElement('a');
    a.href = url;
    a.download = title.replace(/[^a-z0-9]/gi, '_') + '.html';
    a.click();
  }
  // Libérer l'URL après usage
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/* ─── Helpers ── */
function badge(statut) {
  const map = {
    'confirmé':   ['badge-green',  'Confirmé'],
    'en_attente': ['badge-amber',  'En attente'],
    'refusé':     ['badge-red',    'Refusé'],
    'annulé':     ['badge-gray',   'Annulé'],
    'terminé':    ['badge-blue',   'Terminé'],
    'validé':     ['badge-green',  'Validé'],
    'incomplet':  ['badge-gray',   'Incomplet'],
  };
  const [cls, lbl] = map[statut] || ['badge-gray', statut];
  return `<span class="badge ${cls}">${lbl}</span>`;
}

function modeBadge(mode) {
  if (mode === 'en_ligne')   return `<span class="mode-badge mode-online">🌐 En ligne</span>`;
  if (mode === 'les_deux')   return `<span class="mode-badge mode-both">🔀 Les deux</span>`;
  return `<span class="mode-badge mode-present">🏫 Présentiel</span>`;
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

function fmtTarif(r) {
  if (r.tarif_applique && parseFloat(r.tarif_applique) > 0) return `${r.tarif_applique} DT/h`;
  if (r.mode_seance === 'en_ligne'   && r.tarif_en_ligne)   return `${r.tarif_en_ligne} DT/h`;
  if (r.mode_seance === 'presentiel' && r.tarif_presentiel) return `${r.tarif_presentiel} DT/h`;
  return '—';
}

function header(title, subtitle, rightInfo = '') {
  const now = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
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
        ${rightInfo ? `<div style="margin-top:3px;color:#94A3B8;">${rightInfo}</div>` : ''}
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
  // Normaliser les statuts — robuste aux problèmes d'encodage et d'accents
  function normStatut(s) {
    return (s||'').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'') // supprimer accents
      .replace(/\_/g,'_');
  }
  // Map normalisé → valeur affichable
  const STATUT_MAP = {
    'confirme':   'confirmé',
    'en_attente': 'en_attente',
    'refuse':     'refusé',
    'termine':    'terminé',
    'annule':     'annulé',
  };
  const rNorm = reservations.map(r => {
    const n = normStatut(r.statut);
    return { ...r, statut: STATUT_MAP[n] || r.statut || '' };
  });
  const total     = rNorm.length;
  const confirmes = rNorm.filter(r => r.statut === 'confirmé').length;
  const attente   = rNorm.filter(r => r.statut === 'en_attente').length;
  const refuses   = rNorm.filter(r => r.statut === 'refusé').length;
  const termines  = rNorm.filter(r => r.statut === 'terminé').length;

  // Revenu estimé (réservations confirmées + terminées)
  const revenu = rNorm
    .filter(r => ['confirmé','terminé'].includes(r.statut))
    .reduce((sum, r) => sum + (parseFloat(fmtTarif(r)) || 0), 0);

  // Toutes les réservations — tri intelligent
  // Ordre priorité : en_attente → confirmé → terminé → refusé → annulé
  const ORDRE_STATUT = { 'en_attente': 0, 'confirmé': 1, 'terminé': 2, 'refusé': 3, 'annulé': 4 };
  const STATUTS_ARCHIVES = ['refusé', 'annulé'];

  // Normaliser les statuts (trim + lowercase pour éviter les bugs d'encodage)
  // Réutiliser rNorm déjà normalisé
  const reservationsNorm = rNorm;

  const actives  = reservationsNorm.filter(r => !STATUTS_ARCHIVES.includes(r.statut));
  const archives = reservationsNorm.filter(r => STATUTS_ARCHIVES.includes(r.statut));

  const sorted = [...actives].sort((a, b) => {
    const oA = ORDRE_STATUT[a.statut] ?? 99;
    const oB = ORDRE_STATUT[b.statut] ?? 99;
    if (oA !== oB) return oA - oB;
    return new Date(b.date_cours || 0) - new Date(a.date_cours || 0);
  });

  const rows = sorted.map(r => {
    const isPending = r.statut === 'en_attente';
    const tarif     = fmtTarif(r);
    const note      = r.notes_etudiant
      ? r.notes_etudiant.slice(0, 55) + (r.notes_etudiant.length > 55 ? '…' : '')
      : (r.description_seance ? r.description_seance.slice(0, 55) + '…' : '—');

    return `
      <tr class="${isPending ? 'row-pending' : ''}">
        <td>
          <strong style="font-size:11px;">${r.etudiant_nom || '—'}</strong>
          ${r.etudiant_email    ? `<br/><span style="color:#1D4ED8;font-size:9px;">✉️ ${r.etudiant_email}</span>` : ''}
          ${r.etudiant_telephone ? `<br/><span style="color:#065F46;font-size:9px;">📞 ${r.etudiant_telephone}</span>` : ''}
        </td>
        <td style="white-space:nowrap;">${fmtDate(r.date_cours)}</td>
        <td style="white-space:nowrap;font-weight:600;">${String(r.heure_debut||'').slice(0,5)} – ${String(r.heure_fin||'').slice(0,5)}</td>
        <td>${modeBadge(r.mode_seance)}</td>
        <td>${badge(r.statut)}</td>
        <td style="font-weight:700;color:#065F46;">${tarif}</td>
        <td style="font-style:italic;color:#64748B;font-size:10px;max-width:140px;">${note}</td>
      </tr>
    `;
  }).join('');

  // Résumé par mois
  const parMois = {};
  reservationsNorm.forEach(r => {
    if (!r.date_cours) return;
    const mois = r.date_cours.slice(0, 7);
    if (!parMois[mois]) parMois[mois] = { total: 0, confirmes: 0 };
    parMois[mois].total++;
    if (r.statut === 'confirmé' || r.statut === 'terminé') parMois[mois].confirmes++;
  });
  const moisRows = Object.entries(parMois).sort().reverse().map(([mois, d]) => {
    const [y, m] = mois.split('-');
    const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return `<tr>
      <td style="font-weight:600;">${label}</td>
      <td style="text-align:center;">${d.total}</td>
      <td style="text-align:center;color:#065F46;font-weight:700;">${d.confirmes}</td>
    </tr>`;
  }).join('');

  const html = `
    ${header(`Mes réservations — ${profNom}`, `${total} réservation${total > 1 ? 's' : ''} au total`)}

    <div class="pdf-kpis">
      <div class="pdf-kpi" style="background:#EFF6FF;">
        <div class="pdf-kpi-val" style="color:#1E40AF;">${total}</div>
        <div class="pdf-kpi-lbl">Total</div>
      </div>
      <div class="pdf-kpi" style="background:#ECFDF5;">
        <div class="pdf-kpi-val" style="color:#065F46;">${confirmes}</div>
        <div class="pdf-kpi-lbl">Confirmées</div>
      </div>
      <div class="pdf-kpi" style="background:#FFFBEB;">
        <div class="pdf-kpi-val" style="color:#B45309;">${attente}</div>
        <div class="pdf-kpi-lbl">En attente</div>
      </div>
      <div class="pdf-kpi" style="background:#FEF2F2;">
        <div class="pdf-kpi-val" style="color:#DC2626;">${refuses}</div>
        <div class="pdf-kpi-lbl">Refusées</div>
      </div>
    </div>

    <div class="pdf-section">
      <div class="pdf-section-title">📋 Liste des réservations</div>
      <table>
        <thead>
          <tr>
            <th>Étudiant</th>
            <th>Date</th>
            <th>Horaire</th>
            <th>Mode</th>
            <th>Statut</th>
            <th>Tarif</th>
            <th>Message / Note</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94A3B8;">Aucune réservation active</td></tr>'}
        </tbody>
      </table>
      ${attente > 0 ? `<div style="margin-top:8px;font-size:10px;color:#B45309;font-weight:600;">⚠️ ${attente} demande${attente>1?'s':''} en attente de réponse (surlignée${attente>1?'s':''})</div>` : ''}
    </div>

    ${archives.length > 0 ? `
    <div class="pdf-section">
      <div class="pdf-section-title">🗄️ Réservations annulées / refusées (${archives.length})</div>
      <table>
        <thead>
          <tr><th>Étudiant</th><th>Date</th><th>Horaire</th><th>Mode</th><th>Statut</th><th>Tarif</th></tr>
        </thead>
        <tbody>
          ${archives.sort((a,b) => new Date(b.date_cours||0) - new Date(a.date_cours||0)).map(r => `
            <tr style="opacity:0.65;">
              <td><strong>${r.etudiant_nom || '—'}</strong></td>
              <td style="white-space:nowrap;">${fmtDate(r.date_cours)}</td>
              <td>${String(r.heure_debut||'').slice(0,5)} – ${String(r.heure_fin||'').slice(0,5)}</td>
              <td>${modeBadge(r.mode_seance)}</td>
              <td>${badge(r.statut)}</td>
              <td>${fmtTarif(r)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>` : ''}

    ${Object.keys(parMois).length > 1 ? `
    <div class="pdf-section">
      <div class="pdf-section-title">📅 Activité par mois</div>
      <table>
        <thead><tr><th>Mois</th><th style="text-align:center;">Total</th><th style="text-align:center;">Confirmées</th></tr></thead>
        <tbody>${moisRows}</tbody>
      </table>
    </div>` : ''}
  `;

  exportToPDF(html, `Réservations — ${profNom}`);
}

/* ═══════════════════════════════════════
   EXPORT ADMIN — Liste formateurs
═══════════════════════════════════════ */
export function exportAdminProfs(profs) {
  const valides = profs.filter(p => p.statut_validation === 'validé').length;
  const attente = profs.filter(p => p.statut_validation === 'en_attente').length;
  const refuses = profs.filter(p => p.statut_validation === 'refusé').length;

  const rows = profs.map(p => {
    const nm   = `${p.user_prenom || ''} ${p.user_nom || ''}`.trim() || '—';
    const mats = p.tarifs_matieres
      ? [...new Set(p.tarifs_matieres.map(t => t.nom_matiere))].slice(0, 3).join(', ')
      : '—';
    const note = parseFloat(p.note_moyenne || 0);
    const tarif = p.tarif_en_ligne
      ? `${p.tarif_en_ligne} DT/h`
      : p.tarif_presentiel ? `${p.tarif_presentiel} DT/h` : '—';
    return `
      <tr>
        <td>
          <strong>${nm}</strong>
          ${p.email ? `<br/><span style="color:#1D4ED8;font-size:9px;">✉️ ${p.email}</span>` : ''}
          ${p.telephone ? `<br/><span style="color:#065F46;font-size:9px;">📞 ${p.telephone}</span>` : ''}
        </td>
        <td>${p.ville || '—'}</td>
        <td style="font-size:10px;">${mats}</td>
        <td>${modeBadge(p.mode_enseignement)}</td>
        <td style="font-weight:700;">${tarif}</td>
        <td>${note > 0 ? `⭐ ${note.toFixed(1)} <span style="color:#94A3B8;font-size:9px;">(${p.nb_avis} avis)</span>` : '—'}</td>
        <td>${badge(p.statut_validation)}</td>
      </tr>
    `;
  }).join('');

  const html = `
    ${header('Liste des Formateurs', `${profs.length} formateur${profs.length > 1 ? 's' : ''} enregistré${profs.length > 1 ? 's' : ''}`)}

    <div class="pdf-kpis">
      <div class="pdf-kpi" style="background:#EFF6FF;">
        <div class="pdf-kpi-val" style="color:#1E40AF;">${profs.length}</div>
        <div class="pdf-kpi-lbl">Total</div>
      </div>
      <div class="pdf-kpi" style="background:#ECFDF5;">
        <div class="pdf-kpi-val" style="color:#065F46;">${valides}</div>
        <div class="pdf-kpi-lbl">Validés</div>
      </div>
      <div class="pdf-kpi" style="background:#FFFBEB;">
        <div class="pdf-kpi-val" style="color:#B45309;">${attente}</div>
        <div class="pdf-kpi-lbl">En attente</div>
      </div>
      <div class="pdf-kpi" style="background:#FEF2F2;">
        <div class="pdf-kpi-val" style="color:#DC2626;">${refuses}</div>
        <div class="pdf-kpi-lbl">Refusés</div>
      </div>
    </div>

    <div class="pdf-section">
      <div class="pdf-section-title">👨‍🏫 Liste complète des formateurs</div>
      <table>
        <thead>
          <tr><th>Formateur</th><th>Ville</th><th>Matières</th><th>Mode</th><th>Tarif</th><th>Note</th><th>Statut</th></tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94A3B8;">Aucun formateur</td></tr>'}
        </tbody>
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
  const valides    = allProfs.filter(p => p.statut_validation === 'validé').length;
  const totalResa  = reservations_par_mois.reduce((a, b) => a + (b.total || 0), 0);

  // Dédupliquer performance_profs par id (évite les doublons)
  const perfProfsUniq = performance_profs.filter(
    (p, i, arr) => arr.findIndex(x => x.id === p.id) === i
  );

  const perfRows = perfProfsUniq.map((p, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
    const matieres = (p.matieres || []).slice(0, 2).join(', ') || '—';
    const tauxColor = p.taux_confirmation >= 70 ? '#059669' : p.taux_confirmation >= 40 ? '#D97706' : '#DC2626';
    return `
      <tr>
        <td style="text-align:center;font-weight:700;font-size:12px;">${medal}</td>
        <td style="max-width:200px;overflow:hidden;">
          <strong style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.nom}</strong>
          ${p.ville ? `<span style="color:#94A3B8;font-size:9px;">📍 ${p.ville}</span>` : ''}
        </td>
        <td style="font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;">${matieres}</td>
        <td style="font-weight:700;white-space:nowrap;">${p.note > 0 ? `⭐ ${p.note.toFixed(1)}` : '—'}</td>
        <td style="text-align:center;font-weight:700;">${p.nb_resa}</td>
        <td style="text-align:center;color:#065F46;font-weight:700;">${p.nb_confirme}</td>
        <td style="text-align:center;font-weight:700;color:${tauxColor};">
          ${p.nb_resa > 0 ? `${p.taux_confirmation}%` : '—'}
        </td>
      </tr>
    `;
  }).join('');

  const moisRows = reservations_par_mois.map(m => `
    <tr>
      <td style="font-weight:600;">${m.mois}</td>
      <td style="text-align:center;font-weight:700;">${m.total}</td>
    </tr>
  `).join('');

  const html = `
    ${header('Rapport Analytiques', `Tableau de bord — EduMatch`)}

    <div class="pdf-kpis">
      <div class="pdf-kpi" style="background:#EFF6FF;">
        <div class="pdf-kpi-val" style="color:#1E40AF;">${stats.total_users || 0}</div>
        <div class="pdf-kpi-lbl">Utilisateurs</div>
      </div>
      <div class="pdf-kpi" style="background:#ECFDF5;">
        <div class="pdf-kpi-val" style="color:#065F46;">${valides}</div>
        <div class="pdf-kpi-lbl">Formateurs actifs</div>
      </div>
      <div class="pdf-kpi" style="background:#EEF2FF;">
        <div class="pdf-kpi-val" style="color:#4338CA;">${totalResa}</div>
        <div class="pdf-kpi-lbl">Total réservations</div>
      </div>
      <div class="pdf-kpi" style="background:#FFFBEB;">
        <div class="pdf-kpi-val" style="color:#B45309;">${stats.reservations_mois || 0}</div>
        <div class="pdf-kpi-lbl">Ce mois-ci</div>
      </div>
    </div>

    ${reservations_par_mois.length > 0 ? `
    <div class="pdf-section">
      <div class="pdf-section-title">📅 Réservations par mois</div>
      <table>
        <thead><tr><th>Mois</th><th style="text-align:center;">Réservations</th></tr></thead>
        <tbody>${moisRows}</tbody>
      </table>
    </div>` : ''}

    ${performance_profs.length > 0 ? `
    <div class="pdf-section">
      <div class="pdf-section-title">🏆 Performance des formateurs</div>
      <table style="table-layout:fixed;">
        <colgroup>
          <col style="width:30px;"/>
          <col style="width:200px;"/>
          <col style="width:140px;"/>
          <col style="width:70px;"/>
          <col style="width:45px;"/>
          <col style="width:45px;"/>
          <col style="width:50px;"/>
        </colgroup>
        <thead>
          <tr>
            <th style="text-align:center;">#</th>
            <th>Formateur</th>
            <th>Matières</th>
            <th>Note</th>
            <th style="text-align:center;">Rés.</th>
            <th style="text-align:center;">Conf.</th>
            <th style="text-align:center;">Taux</th>
          </tr>
        </thead>
        <tbody>${perfRows}</tbody>
      </table>
    </div>` : ''}
  `;

  exportToPDF(html, 'Rapport Analytiques — EduMatch');
}