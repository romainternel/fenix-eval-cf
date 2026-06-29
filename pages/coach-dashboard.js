/* ─── FENIX Eval CF — Coach Dashboard ────────────────────────────────────────
   STORY 04 : Gestion des joueurs (liste, création, édition)
   STORY 05 : Sessions d'évaluation (liste, création, fermeture)
──────────────────────────────────────────────────────────────────────────── */

const PROFIL_LABELS = {
  'ailier-att': 'Ailier',
  'arr-att':    'Arrière',
  'dc-att':     'DC',
  'pvt-att':    'Pivot',
  'n1-def':     'N°1',
  'n2-def':     'N°2',
  'n3-def':     'N°3',
  'gb':         'GB'
};

function gid(id) { return document.getElementById(id); }

let _coachUser = null;

async function initCoachDashboard(user) {
  _coachUser = user;
  await renderSessions();
}

/* ═══════════════════════════════════════════════════════ SESSIONS — STORY 05 */
async function renderSessions() {
  gid('mainContent').innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const { data: sessions, error } = await window.supabaseClient
    .from('sessions')
    .select('*')
    .order('date_session', { ascending: false });

  if (error) {
    gid('mainContent').innerHTML = `<p class="form-error" style="margin:20px">Erreur : ${escHtml(error.message)}</p>`;
    return;
  }

  const liste    = sessions || [];
  const ouvertes = liste.filter(s => s.statut === 'ouvert');
  const fermees  = liste.filter(s => s.statut === 'ferme');

  gid('mainContent').innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Sessions d'évaluation</h2>
      <button class="btn btn-primary btn-sm" onclick="showCreateSessionModal()">+ Nouvelle</button>
    </div>
    <p class="section-saison">Saison ${currentSaison()}</p>
    ${liste.length === 0
      ? `<div class="empty-state">
           <div class="empty-state-icon">📅</div>
           <p>Aucune session.<br>Créez la première session pour démarrer les évaluations.</p>
         </div>`
      : `${ouvertes.map(renderSessionCard).join('')}
         ${fermees.length > 0
           ? `<p class="section-title" style="margin:20px 0 10px">Sessions fermées</p>
              ${fermees.map(renderSessionCard).join('')}`
           : ''}`
    }`;
}

function renderSessionCard(s) {
  const isOpen = s.statut === 'ouvert';
  return `
    <div class="session-card ${isOpen ? 'open' : 'closed'}" onclick="showSessionDetail('${s.id}')">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span class="${isOpen ? 'session-badge-open' : 'session-badge-closed'}">${isOpen ? 'OUVERT' : 'FERMÉ'}</span>
        <span style="font-size:12px;color:var(--gray-400)">${formatDateShort(s.date_session)}</span>
      </div>
      <div style="font-size:16px;font-weight:700;color:var(--gray-800);margin-bottom:4px">${escHtml(s.label)}</div>
      <div style="font-size:11px;color:var(--gray-400);letter-spacing:1px;font-family:monospace">${s.id}</div>
    </div>`;
}

async function showSessionDetail(sessionId) {
  gid('mainContent').innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const { data: s, error } = await window.supabaseClient
    .from('sessions').select('*').eq('id', sessionId).single();

  if (error) {
    gid('mainContent').innerHTML = `<p class="form-error">Session introuvable.</p>`;
    return;
  }

  const isOpen = s.statut === 'ouvert';

  gid('mainContent').innerHTML = `
    <div class="section-header" style="margin-bottom:16px">
      <button class="btn btn-secondary btn-sm" onclick="renderSessions()">← Retour</button>
      <span class="${isOpen ? 'session-badge-open' : 'session-badge-closed'}">${isOpen ? 'OUVERT' : 'FERMÉ'}</span>
    </div>
    <div class="card">
      <div class="card-body">
        <div style="font-size:18px;font-weight:800;color:var(--fenix-navy);margin-bottom:14px">${escHtml(s.label)}</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="info-row"><span class="info-label">ID</span><code class="info-value-code">${s.id}</code></div>
          <div class="info-row"><span class="info-label">Date</span><span class="info-value">${formatDate(s.date_session)}</span></div>
          <div class="info-row"><span class="info-label">Saison</span><span class="info-value">${s.saison}</span></div>
          ${!isOpen && s.closed_at ? `<div class="info-row"><span class="info-label">Fermée le</span><span class="info-value">${formatDate(s.closed_at)}</span></div>` : ''}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <p class="section-title" style="margin-bottom:12px">Joueurs</p>
        <div id="sessionPlayerList"><div class="spinner" style="margin:16px auto"></div></div>
      </div>
    </div>
    ${isOpen ? `
    <div class="card" style="border-left:4px solid var(--def-light)">
      <div class="card-body">
        <p style="font-size:14px;color:var(--gray-600);margin-bottom:14px">
          Une fois toutes les évaluations validées, fermez la session. Les joueurs ne pourront plus modifier leurs notes.
        </p>
        <button class="btn btn-danger btn-full" onclick="confirmCloseSession('${s.id}')">Fermer cette session</button>
      </div>
    </div>` : `
    <div class="card" style="border-left:4px solid var(--gray-400)">
      <div class="card-body">
        <p style="font-size:14px;color:var(--gray-600);margin-bottom:14px">
          Session fermée. Vous pouvez la rouvrir si une correction est nécessaire.
        </p>
        <button class="btn btn-ghost btn-full" onclick="confirmReopenSession('${s.id}')">Rouvrir cette session</button>
      </div>
    </div>`}`;

  loadSessionPlayerList(sessionId);
}

async function loadSessionPlayerList(sessionId) {
  const saison = currentSaison();
  const [playersRes, profilesRes, evalsRes, statutsRes] = await Promise.all([
    window.supabaseClient.from('players').select('*').order('nom'),
    window.supabaseClient.from('player_profiles').select('*').eq('saison', saison).eq('actif', true),
    window.supabaseClient.from('evaluations').select('player_id, critere_id, note_joueur, note_staff').eq('session_id', sessionId),
    window.supabaseClient.from('session_player_statut').select('player_id, statut, resultats_visibles').eq('session_id', sessionId)
  ]);

  const players  = playersRes.data  || [];
  const profiles = profilesRes.data || [];
  const evals    = evalsRes.data    || [];
  const statuts  = statutsRes.data  || [];

  const profileMap = {};
  profiles.forEach(p => { profileMap[p.player_id] = p; });

  const countMap = {};
  evals.forEach(e => {
    if (!countMap[e.player_id]) countMap[e.player_id] = { joueur: 0, staff: 0 };
    if (e.note_joueur) countMap[e.player_id].joueur++;
    if (e.note_staff)  countMap[e.player_id].staff++;
  });

  const statutMap = {};
  statuts.forEach(s => { statutMap[s.player_id] = s; });

  const el = gid('sessionPlayerList');
  if (!el) return;

  if (players.length === 0) {
    el.innerHTML = `<p class="form-hint">Aucun joueur créé.</p>`;
    return;
  }

  function getPlayerStatus(playerId) {
    const prof  = profileMap[playerId];
    const count = countMap[playerId] || { joueur: 0, staff: 0 };
    if (!prof) return { key: 'no-profile', label: 'Aucun profil', total: 0, count };
    const total = prof.profil_gb
      ? getAllCriteres('gb').length
      : (getAllCriteres(prof.profil_att || '').length + getAllCriteres(prof.profil_def || '').length);
    if (count.joueur === 0)      return { key: 'non_commence', label: 'Non commencé', total, count };
    if (count.joueur < total)    return { key: 'en_cours',     label: 'En cours',      total, count };
    if (count.staff  < total)    return { key: 'joueur_ok',    label: 'Joueur terminé',total, count };
    return                              { key: 'complet',       label: 'Complet ✓',    total, count };
  }

  const avecProfil  = players.filter(p => profileMap[p.id]);
  const nbComplet   = avecProfil.filter(p => getPlayerStatus(p.id).key === 'complet').length;
  const nbJoueurOk  = avecProfil.filter(p => getPlayerStatus(p.id).key === 'joueur_ok').length;

  const rows = players.map(p => {
    const st     = getPlayerStatus(p.id);
    const locked   = statutMap[p.id]?.statut === 'fermé';
    const visibles = statutMap[p.id]?.resultats_visibles || false;
    const initials = (p.prenom[0] + p.nom[0]).toUpperCase();
    const pctJ   = st.total > 0 ? Math.round(st.count.joueur / st.total * 100) : 0;
    const pctS   = st.total > 0 ? Math.round(st.count.staff  / st.total * 100) : 0;
    return `
      <div class="session-player-row" style="flex-direction:column;align-items:stretch;gap:8px">
        <div style="display:flex;align-items:center;gap:12px;cursor:pointer" onclick="showCoachEval('${sessionId}','${p.id}')">
          <div class="player-card-avatar" style="width:36px;height:36px;font-size:13px;flex-shrink:0">${initials}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="font-size:14px;font-weight:700;color:var(--gray-800)">${escHtml(p.prenom)} ${escHtml(p.nom)}</span>
              ${locked ? '<span class="sps-badge locked">🔒 Fermé</span>' : `<span class="sps-badge ${st.key}">${st.label}</span>`}
              ${visibles ? '<span class="sps-badge complet">Partagé ✓</span>' : ''}
            </div>
            ${st.total > 0 ? `
              <div class="sps-progress-row" style="margin-top:6px">
                <span class="sps-progress-label">Joueur</span>
                <div class="sps-bar"><div class="sps-bar-fill joueur" style="width:${pctJ}%"></div></div>
                <span class="sps-progress-count">${st.count.joueur}/${st.total}</span>
              </div>
              <div class="sps-progress-row">
                <span class="sps-progress-label">Staff</span>
                <div class="sps-bar"><div class="sps-bar-fill staff" style="width:${pctS}%"></div></div>
                <span class="sps-progress-count">${st.count.staff}/${st.total}</span>
              </div>` : '<div style="font-size:11px;color:var(--gray-400);margin-top:2px">Aucun profil attribué</div>'}
          </div>
          <span style="color:var(--gray-400);font-size:18px;flex-shrink:0">›</span>
        </div>
        ${st.total > 0 ? `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <button class="btn btn-sm btn-secondary" style="font-size:11px;padding:4px 10px;flex:1"
              onclick="showCoachRadar('${sessionId}','${p.id}')">
              ${visibles ? '📊 Résultats ✓' : '📊 Résultats'}
            </button>
            <button class="btn btn-sm ${locked ? 'btn-ghost' : 'btn-secondary'}" style="font-size:11px;padding:4px 10px"
              onclick="${locked
                ? `coachReopenPlayerSession('${sessionId}','${p.id}')`
                : `coachClosePlayerSession('${sessionId}','${p.id}')`}">
              ${locked ? 'Rouvrir' : 'Fermer'}
            </button>
          </div>` : ''}
      </div>`;
  }).join('<hr style="border:none;border-top:1px solid var(--gray-100);margin:4px 0">');

  el.innerHTML = `
    <div class="sps-header">
      <span style="font-weight:700">${avecProfil.length > 0 ? `${nbComplet} / ${avecProfil.length} complets` : 'Aucun profil attribué'}</span>
      ${nbJoueurOk > 0 ? `<span style="color:var(--fenix-blue);font-size:12px">${nbJoueurOk} en attente notation staff</span>` : ''}
    </div>
    ${rows}`;
}

async function coachClosePlayerSession(sessionId, playerId) {
  await window.supabaseClient.from('session_player_statut')
    .upsert({ session_id: sessionId, player_id: playerId, statut: 'fermé', closed_at: new Date().toISOString() },
            { onConflict: 'session_id,player_id' });
  loadSessionPlayerList(sessionId);
}

async function coachReopenPlayerSession(sessionId, playerId) {
  await window.supabaseClient.from('session_player_statut')
    .upsert({ session_id: sessionId, player_id: playerId, statut: 'ouvert', closed_at: null },
            { onConflict: 'session_id,player_id' });
  loadSessionPlayerList(sessionId);
}

/* ─── STORY 09 — Radar chart + détail par axe ────────────────────────────── */
let _coachEvalMap = {}, _chartAtt = null, _chartDef = null;
let _cBilanAtt = null, _cBilanDef = null, _cBarChart = null;
let _cAllSessions = [], _cViewMode = 'staff', _cAttId = null, _cDefId = null;
let _cSelectedSessions = new Set(), _cShowBar = false;
let _cPdfNom = '', _cPdfSession = '', _cPdfIsGb = false;
const _CC_LABELS = { 1:'Fragile', 2:'En travail', 3:'Acquis', 4:'Maîtrisé', 5:'Référence' };
const _C_SESSION_COLORS = [
  { bg:'rgba(139,92,246,0.12)', border:'rgba(139,92,246,0.7)' },
  { bg:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.7)' },
  { bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.7)' },
  { bg:'rgba(59,130,246,0.15)', border:'rgba(59,130,246,0.8)' },
];

function _wrapLabel(s) {
  if (!s.includes(' & ')) return s;
  const [a, ...rest] = s.split(' & ');
  return [a, '& ' + rest.join(' & ')];
}

function _axesData(profilId, evalMap, viewKey) {
  const profil = CRITERIA[profilId];
  if (!profil) return null;
  const labels = [], values = [];
  Object.entries(profil.axes).forEach(([, axe]) => {
    labels.push(_wrapLabel(axe.label));
    const ns = axe.criteres.map(c => evalMap[c.id]?.[viewKey] || 0).filter(n => n > 0);
    values.push(ns.length ? +(ns.reduce((a,b) => a+b,0) / ns.length).toFixed(1) : 0);
  });
  return { labels, values };
}

function cRenderBilan() {
  if (_cBilanAtt) { _cBilanAtt.destroy(); _cBilanAtt = null; }
  if (_cBilanDef) { _cBilanDef.destroy(); _cBilanDef = null; }
  const viewKey = _cViewMode === 'joueur' ? 'note_joueur' : 'note_staff';
  const selected = _cAllSessions.filter(s => _cSelectedSessions.has(s.id));
  function buildMulti(canvasId, profilId) {
    const ctx = gid(canvasId)?.getContext('2d');
    if (!ctx || !profilId || !selected.length) return null;
    const firstRd = _axesData(profilId, selected[0].evalMap, viewKey);
    if (!firstRd) return null;
    const datasets = selected.map(s => {
      const i = _cAllSessions.indexOf(s);
      const rd = _axesData(profilId, s.evalMap, viewKey);
      const c = _C_SESSION_COLORS[i];
      return { label:s.label, data:rd.values, backgroundColor:c.bg, borderColor:c.border, pointBackgroundColor:c.border, borderWidth:1.5, pointRadius:3 };
    });
    return new Chart(ctx, {
      type:'radar',
      data:{ labels:firstRd.labels, datasets },
      options:{
        responsive:true, maintainAspectRatio:true, aspectRatio:1,
        plugins:{ legend:{ display:false } },
        scales:{ r:{ min:0, max:5,
          ticks:{ stepSize:1, display:false },
          pointLabels:{ font:{ size:9, weight:'600' } },
          grid:{ color:'rgba(0,0,0,0.08)' }
        }}
      }
    });
  }
  if (_cAttId) _cBilanAtt = buildMulti('cBilanAtt', _cAttId);
  if (_cDefId) _cBilanDef = buildMulti('cBilanDef', _cDefId);
}

function cToggleSession(sid) {
  if (_cSelectedSessions.has(sid)) {
    if (_cSelectedSessions.size <= 1) return;
    _cSelectedSessions.delete(sid);
  } else {
    _cSelectedSessions.add(sid);
  }
  document.querySelectorAll('.bilan-chip[data-sid]').forEach(chip => {
    chip.classList.toggle('active', _cSelectedSessions.has(chip.dataset.sid));
  });
  cRenderBilan();
  if (_cShowBar) cRenderBarChart();
}

function cToggleBarChart() {
  _cShowBar = !_cShowBar;
  const el = gid('cBarSection');
  const btn = gid('cBarBtn');
  if (el)  el.style.display = _cShowBar ? 'block' : 'none';
  if (btn) btn.textContent  = _cShowBar ? '📊 Masquer la progression' : '📊 Progression par thème';
  if (_cShowBar) cRenderBarChart();
  else if (_cBarChart) { _cBarChart.destroy(); _cBarChart = null; }
}

function cRenderBarChart() {
  if (_cBarChart) { _cBarChart.destroy(); _cBarChart = null; }
  const ctx = gid('cBarCanvas')?.getContext('2d');
  if (!ctx) return;
  const viewKey = _cViewMode === 'joueur' ? 'note_joueur' : 'note_staff';
  const allAxes = [];
  [_cAttId, _cDefId].filter(Boolean).forEach(pid => {
    const p = CRITERIA[pid];
    if (p) Object.values(p.axes).forEach(axe => allAxes.push({ label: axe.label, criteres: axe.criteres }));
  });
  const selected = _cAllSessions.filter(s => _cSelectedSessions.has(s.id));
  const datasets = selected.map(s => {
    const i = _cAllSessions.indexOf(s);
    const c = _C_SESSION_COLORS[i];
    const bg = c.border.replace('0.7)', '0.55)').replace('0.8)', '0.55)');
    return {
      label: s.label,
      data: allAxes.map(axe => {
        const ns = axe.criteres.map(cr => s.evalMap[cr.id]?.[viewKey] || 0).filter(n => n > 0);
        return ns.length ? +(ns.reduce((a,b) => a+b,0) / ns.length).toFixed(1) : 0;
      }),
      backgroundColor: bg, borderColor: c.border, borderWidth: 1.5, borderRadius: 4,
    };
  });
  _cBarChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: allAxes.map(a => a.label), datasets },
    options: {
      responsive: true,
      plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 11 }, boxWidth: 10 } } },
      scales: {
        y: { min: 0, max: 5, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
        x: { ticks: { font: { size: 9 }, maxRotation: 40, minRotation: 40 } }
      }
    }
  });
}

function cSetViewMode(mode) {
  _cViewMode = mode;
  gid('cToggleJoueur')?.classList.toggle('active', mode === 'joueur');
  gid('cToggleStaff')?.classList.toggle('active', mode === 'staff');
  cRenderBilan();
  if (_cShowBar) cRenderBarChart();
}

/* ─── STORY 10 — Compte-rendu ────────────────────────────────────────────── */
function coachToggleCRVis() {
  const hidden  = gid('crVisible');
  const toggle  = gid('crVisibilityToggle');
  const icon    = gid('crVisibleIcon');
  const text    = gid('crVisibleText');
  if (!hidden || !toggle) return;
  const nowActive = hidden.value !== 'true';
  hidden.value = nowActive ? 'true' : 'false';
  toggle.classList.toggle('active', nowActive);
  icon.textContent = nowActive ? '👁' : '🔒';
  text.textContent = nowActive ? 'Partagé avec le joueur — cliquer pour masquer' : 'Masqué au joueur — cliquer pour partager';
}

async function saveCoachCR(sessionId, playerId) {
  const axesAtt = gid('crAxesAtt')?.value.trim() || '';
  const axesDef = gid('crAxesDef')?.value.trim() || '';
  const ct      = gid('crCT')?.value.trim()      || '';
  const mt      = gid('crMT')?.value.trim()      || '';
  const notes   = gid('crNotes')?.value.trim()   || '';
  const visible = gid('crVisible')?.value === 'true';
  const { error } = await window.supabaseClient.from('comptes_rendus').upsert({
    session_id:sessionId, player_id:playerId,
    axes_att:axesAtt, axes_def:axesDef,
    objectifs_ct:ct, objectifs_mt:mt, notes,
    visible_joueur:visible, updated_at:new Date().toISOString()
  }, { onConflict:'session_id,player_id' });
  if (error) { showToast('Erreur lors de la sauvegarde'); return; }
  showToast('Compte-rendu enregistré ✓');
}

/* ─── STORY 11 — Export PDF ──────────────────────────────────────────────── */
async function exportCoachPDF() {
  if (!window.jspdf) { showToast('Librairie PDF non chargée'); return; }
  showToast('Génération du PDF…');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210, PH = 297, M = 14, CW = PW - 2 * M;

  function st(size, bold, rgb) {
    pdf.setFontSize(size);
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    if (rgb) pdf.setTextColor(...rgb);
  }
  function newPageIfNeeded(y, need = 25) {
    if (y + need > PH - M) { pdf.addPage(); return M + 6; }
    return y;
  }

  // ── Bande header ─────────────────────────────────────────────────────────
  pdf.setFillColor(10, 36, 99);
  pdf.rect(0, 0, PW, 22, 'F');
  pdf.setFillColor(200, 168, 75);
  pdf.rect(0, 0, 4, 22, 'F');
  st(14, true, [255, 255, 255]);
  pdf.text('FENIX Eval CF', 8, 10);
  st(9, false, [200, 168, 75]);
  pdf.text(_cPdfNom + '  ·  ' + _cPdfSession, 8, 18);

  let y = 28;

  // ── Radars ───────────────────────────────────────────────────────────────
  st(7, true, [148, 163, 184]);
  pdf.text('RÉSULTATS — COMPARAISON JOUEUR / STAFF', M, y);
  pdf.setFillColor(59, 130, 246);
  pdf.circle(PW - M - 30, y - 0.5, 1.2, 'F');
  st(7, false, [71, 85, 105]);
  pdf.text('Joueur', PW - M - 27, y);
  pdf.setFillColor(234, 88, 12);
  pdf.circle(PW - M - 14, y - 0.5, 1.2, 'F');
  pdf.text('Staff', PW - M - 11, y);
  y += 4;

  const att = gid('radarAtt'), def = gid('radarDef');
  if (att && def && !_cPdfIsGb) {
    const rW = (CW - 4) / 2;
    pdf.addImage(att.toDataURL('image/png'), 'PNG', M, y, rW, rW);
    pdf.addImage(def.toDataURL('image/png'), 'PNG', M + rW + 4, y, rW, rW);
    y += rW + 5;
  } else if (att) {
    const rW = CW * 0.65;
    pdf.addImage(att.toDataURL('image/png'), 'PNG', M + (CW - rW) / 2, y, rW, rW);
    y += rW + 5;
  }

  // ── Séparateur ───────────────────────────────────────────────────────────
  y = newPageIfNeeded(y, 15);
  pdf.setDrawColor(226, 232, 240); pdf.setLineWidth(0.3);
  pdf.line(M, y, PW - M, y);
  y += 5;

  // ── CR ───────────────────────────────────────────────────────────────────
  st(7, true, [148, 163, 184]);
  pdf.text('COMPTE-RENDU D\'ENTRETIEN', M, y);
  y += 6;

  const crSecs = [
    { label:'Axes prioritaires — Attaque', id:'crAxesAtt', c:[230,57,70]  },
    { label:'Axes prioritaires — Défense', id:'crAxesDef', c:[42,157,143] },
    { label:'Objectif court terme',        id:'crCT',      c:[200,130,40] },
    { label:'Objectif moyen terme',        id:'crMT',      c:[10,36,99]   },
    { label:'Compte-rendu d\'entretien',   id:'crNotes',   c:[147,51,234] },
  ];
  for (const s of crSecs) {
    const val = (gid(s.id)?.value || '').trim();
    if (!val) continue;
    y = newPageIfNeeded(y, 20);
    st(8, true, s.c);
    pdf.text(s.label.toUpperCase(), M + 4, y);
    y += 5;
    st(10, false, [30, 41, 59]);
    const lines = pdf.splitTextToSize(val, CW - 8);
    const boxH  = Math.max(8, lines.length * 4.4 + 4);
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(...s.c); pdf.setLineWidth(0.8);
    pdf.line(M, y - 1.5, M, y - 1.5 + boxH);
    pdf.setLineWidth(0.2); pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(M + 2, y - 1.5, CW - 2, boxH, 1.5, 1.5, 'FD');
    pdf.setTextColor(30, 41, 59);
    pdf.text(lines, M + 5, y + 2.5);
    y += boxH + 5;
  }

  // ── Pied de page ─────────────────────────────────────────────────────────
  const np = pdf.getNumberOfPages();
  for (let p = 1; p <= np; p++) {
    pdf.setPage(p);
    st(7, false, [148, 163, 184]);
    pdf.text(`FENIX Eval CF — ${new Date().toLocaleDateString('fr-FR')} — ${p}/${np}`, M, PH - 5);
  }

  const safe = (_cPdfNom + '_' + _cPdfSession).replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`FENIX_${safe}.pdf`);
}

function _axesBtns(profilId) {
  const profil = CRITERIA[profilId];
  if (!profil) return '';
  return Object.entries(profil.axes).map(([axeId, axe]) =>
    `<button class="radar-axe-btn" id="raxe-${profilId}-${axeId}"
      onclick="showAxisDetail('${profilId}','${axeId}')">${escHtml(axe.label)}</button>`
  ).join('');
}

function showAxisDetail(profilId, axeId) {
  const axe = CRITERIA[profilId]?.axes[axeId];
  if (!axe) return;

  document.querySelectorAll('.radar-axe-btn').forEach(b => b.classList.remove('active'));
  gid(`raxe-${profilId}-${axeId}`)?.classList.add('active');

  const rows = axe.criteres.map(c => {
    const nj = _coachEvalMap[c.id]?.note_joueur || 0;
    const ns = _coachEvalMap[c.id]?.note_staff  || 0;
    return `
      <div class="cc-row">
        <div class="cc-info">
          <div class="cc-label">${escHtml(c.label)}</div>
          <div class="cc-texte">${escHtml(c.texte)}</div>
        </div>
        <div class="cc-scores">
          <div class="cc-score-col">
            <span class="cc-who">Joueur</span>
            <div class="cc-pastille ${nj ? 'n'+nj : 'empty'}"></div>
            <span class="cc-score-name" style="color:${nj ? 'var(--n'+nj+'-text)' : 'var(--gray-400)'}">
              ${nj ? _CC_LABELS[nj] : '—'}
            </span>
          </div>
          <div class="cc-score-col">
            <span class="cc-who">Staff</span>
            <div class="cc-pastille ${ns ? 'n'+ns : 'empty'}"></div>
            <span class="cc-score-name" style="color:${ns ? 'var(--n'+ns+'-text)' : 'var(--gray-400)'}">
              ${ns ? _CC_LABELS[ns] : '—'}
            </span>
          </div>
        </div>
      </div>`;
  }).join('');

  const detailEl = gid('axisDetail');
  detailEl.style.display = 'block';
  detailEl.innerHTML = `
    <div class="card" style="margin-top:12px">
      <div class="card-body">
        <p class="section-title" style="margin-bottom:12px">${escHtml(axe.label)}</p>
        ${rows}
      </div>
    </div>`;
  detailEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

async function showCoachRadar(sessionId, playerId) {
  if (_chartAtt)  { _chartAtt.destroy();  _chartAtt  = null; }
  if (_chartDef)  { _chartDef.destroy();  _chartDef  = null; }
  if (_cBilanAtt) { _cBilanAtt.destroy(); _cBilanAtt = null; }
  if (_cBilanDef) { _cBilanDef.destroy(); _cBilanDef = null; }

  gid('mainContent').innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const saison = currentSaison();
  const [playerRes, profileRes, statutRes, distinctEvalsRes, crRes] = await Promise.all([
    window.supabaseClient.from('players').select('*').eq('id', playerId).single(),
    window.supabaseClient.from('player_profiles').select('*').eq('player_id', playerId).eq('saison', saison).eq('actif', true).maybeSingle(),
    window.supabaseClient.from('session_player_statut').select('resultats_visibles').eq('session_id', sessionId).eq('player_id', playerId).maybeSingle(),
    window.supabaseClient.from('evaluations').select('session_id').eq('player_id', playerId),
    window.supabaseClient.from('comptes_rendus').select('*').eq('session_id', sessionId).eq('player_id', playerId).maybeSingle()
  ]);
  const cr = crRes.data;

  const player  = playerRes.data;
  const profile = profileRes.data;
  const shared  = statutRes.data?.resultats_visibles || false;
  const nom     = player ? `${escHtml(player.prenom)} ${escHtml(player.nom)}` : playerId;

  const allSessionIds = [...new Set([...(distinctEvalsRes.data || []).map(e => e.session_id), sessionId])];

  const [sessionsRes, allEvalsRes] = await Promise.all([
    window.supabaseClient.from('sessions').select('id, label').in('id', allSessionIds).order('created_at', { ascending:true }),
    window.supabaseClient.from('evaluations').select('session_id, critere_id, note_joueur, note_staff')
      .eq('player_id', playerId).in('session_id', allSessionIds)
  ]);

  const evalsBySession = {};
  (allEvalsRes.data || []).forEach(e => {
    if (!evalsBySession[e.session_id]) evalsBySession[e.session_id] = {};
    evalsBySession[e.session_id][e.critere_id] = e;
  });

  _coachEvalMap = evalsBySession[sessionId] || {};
  _cViewMode    = 'staff';

  const sessions = (sessionsRes.data || []).slice(-4);
  _cAllSessions = sessions.map(s => ({ id:s.id, label:s.label, evalMap:evalsBySession[s.id] || {} }));
  _cSelectedSessions = new Set(_cAllSessions.slice(-2).map(s => s.id));
  _cShowBar = false;

  const isGb  = !!profile?.profil_gb;
  _cAttId = isGb ? profile.profil_gb : profile?.profil_att;
  _cDefId = isGb ? null : profile?.profil_def;
  const attLbl = PROFIL_LABELS[_cAttId] || _cAttId || '—';
  const defLbl = PROFIL_LABELS[_cDefId] || _cDefId || '—';
  const curSes = (sessionsRes.data || []).find(s => s.id === sessionId);
  _cPdfNom = nom; _cPdfSession = curSes?.label || ''; _cPdfIsGb = isGb;

  // ── Card 1 : session actuelle Joueur vs Staff ────────────────────────────
  function buildSessionRadar(canvasId, profilId) {
    const ctx = gid(canvasId)?.getContext('2d');
    if (!ctx || !profilId) return null;
    const profil = CRITERIA[profilId];
    if (!profil) return null;
    const labels = [], joueur = [], staff = [];
    Object.entries(profil.axes).forEach(([, axe]) => {
      labels.push(_wrapLabel(axe.label));
      const jN = axe.criteres.map(c => _coachEvalMap[c.id]?.note_joueur || 0).filter(n => n > 0);
      const sN = axe.criteres.map(c => _coachEvalMap[c.id]?.note_staff  || 0).filter(n => n > 0);
      joueur.push(jN.length ? +(jN.reduce((a,b) => a+b,0) / jN.length).toFixed(1) : 0);
      staff.push(sN.length  ? +(sN.reduce((a,b) => a+b,0)  / sN.length).toFixed(1) : 0);
    });
    return new Chart(ctx, {
      type:'radar',
      data:{ labels, datasets:[
        { data:joueur, backgroundColor:'rgba(59,130,246,0.15)', borderColor:'rgba(59,130,246,0.8)', pointBackgroundColor:'rgba(59,130,246,0.8)', borderWidth:1.5, pointRadius:3 },
        { data:staff,  backgroundColor:'rgba(234,88,12,0.15)',  borderColor:'rgba(234,88,12,0.8)',  pointBackgroundColor:'rgba(234,88,12,0.8)',  borderWidth:1.5, pointRadius:3 }
      ]},
      options:{
        responsive:true, maintainAspectRatio:true, aspectRatio:1,
        plugins:{ legend:{ display:false } },
        scales:{ r:{ min:0, max:5,
          ticks:{ stepSize:1, display:false },
          pointLabels:{ font:{ size:9, weight:'600' } },
          grid:{ color:'rgba(0,0,0,0.08)' }
        }}
      }
    });
  }

  const sessionRadarHTML = isGb
    ? `<div class="radar-col-full">
         <p class="radar-profil-title">🧤 Gardien — ${escHtml(attLbl)}</p>
         <canvas id="radarAtt" style="max-height:280px"></canvas>
         <div class="radar-axes-btns">${_axesBtns(_cAttId)}</div>
       </div>`
    : `<div class="radar-grid">
         ${_cAttId ? `<div class="radar-col">
           <p class="radar-profil-title">⚡ ${escHtml(attLbl)}</p>
           <canvas id="radarAtt" style="width:100%"></canvas>
           <div class="radar-axes-btns">${_axesBtns(_cAttId)}</div>
         </div>` : ''}
         ${_cDefId ? `<div class="radar-col">
           <p class="radar-profil-title">🛡 ${escHtml(defLbl)}</p>
           <canvas id="radarDef" style="width:100%"></canvas>
           <div class="radar-axes-btns">${_axesBtns(_cDefId)}</div>
         </div>` : ''}
       </div>`;

  // ── Card 2 : bilan multi-sessions (si > 1 session évaluée) ──────────────
  const showBilan = _cAllSessions.length > 1;

  const bilanChips = _cAllSessions.map((s, i) => {
    const c = _C_SESSION_COLORS[i];
    const sel = _cSelectedSessions.has(s.id);
    return `<button class="bilan-chip${sel ? ' active' : ''}" data-sid="${s.id}" onclick="cToggleSession('${s.id}')">
      <span style="width:8px;height:8px;border-radius:50%;background:${c.border};display:inline-block;flex-shrink:0"></span>
      ${escHtml(s.label)}
    </button>`;
  }).join('');

  const bilanRadarHTML = isGb
    ? `<div class="radar-col-full"><canvas id="cBilanAtt" style="max-height:280px"></canvas></div>`
    : `<div class="radar-grid">
         ${_cAttId ? `<div class="radar-col"><p class="radar-profil-title">⚡ ${escHtml(attLbl)}</p><canvas id="cBilanAtt" style="width:100%"></canvas></div>` : ''}
         ${_cDefId ? `<div class="radar-col"><p class="radar-profil-title">🛡 ${escHtml(defLbl)}</p><canvas id="cBilanDef" style="width:100%"></canvas></div>` : ''}
       </div>`;

  const bilanCard = showBilan ? `
    <div class="card" style="margin-top:12px">
      <div class="card-body">
        <p class="section-title" style="margin-bottom:10px">Bilan — Progression</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">${bilanChips}</div>
        <div class="radar-toggle-row" style="margin-bottom:8px">
          <div></div>
          <div class="radar-view-toggle">
            <button class="radar-view-btn" id="cToggleJoueur" onclick="cSetViewMode('joueur')">Joueur</button>
            <button class="radar-view-btn active" id="cToggleStaff" onclick="cSetViewMode('staff')">Staff</button>
          </div>
        </div>
        ${bilanRadarHTML}
        <button id="cBarBtn" class="btn btn-ghost btn-sm" style="width:100%;margin-top:10px" onclick="cToggleBarChart()">📊 Progression par thème</button>
        <div id="cBarSection" style="display:none;margin-top:12px"><canvas id="cBarCanvas"></canvas></div>
      </div>
    </div>` : '';

  gid('mainContent').innerHTML = `
    <div class="section-header" style="margin-bottom:16px">
      <button class="btn btn-secondary btn-sm" onclick="showSessionDetail('${sessionId}')">← Retour</button>
      <span style="font-weight:700">${nom}</span>
      <button class="btn btn-ghost btn-sm" onclick="exportCoachPDF()">📄 PDF</button>
    </div>
    <div class="card">
      <div class="card-body">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">
          <p class="section-title" style="margin:0">Résultats — ${escHtml(nom)}</p>
          <button class="btn btn-sm ${shared ? 'btn-ghost' : 'btn-primary'}"
            onclick="${shared ? `coachUnshareResults('${sessionId}','${playerId}')` : `coachShareResults('${sessionId}','${playerId}')`}">
            ${shared ? 'Retirer le partage' : 'Partager avec le joueur'}
          </button>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:10px;font-size:11px">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:rgba(59,130,246,0.8)"></div>Joueur</div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:rgba(234,88,12,0.8)"></div>Staff</div>
        </div>
        ${sessionRadarHTML}
        <p style="font-size:11px;color:var(--gray-400);text-align:center;margin-top:10px">Clique sur un thème pour voir le détail ↓</p>
        ${shared ? '<p style="text-align:center;font-size:12px;color:var(--att);margin-top:4px">✓ Résultats partagés avec le joueur</p>' : ''}
      </div>
    </div>
    <div id="axisDetail" style="display:none"></div>
    ${bilanCard}
    <div class="card" style="margin-top:12px">
      <div class="card-body">
        <p class="section-title" style="margin-bottom:12px">Compte-rendu d'entretien ${cr?.updated_at ? `<span style="font-weight:400;font-size:11px;color:var(--gray-400);text-transform:none;letter-spacing:0">(${new Date(cr.updated_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})})</span>` : ''}</p>
        <div class="cr-field-group cr-att">
          <p class="cr-section-label">⚔️ Axes prioritaires — Attaque</p>
          <textarea id="crAxesAtt" class="cr-textarea" placeholder="Ex: Lecture & Orga, Finition...">${escHtml(cr?.axes_att || '')}</textarea>
        </div>
        <div class="cr-field-group cr-def">
          <p class="cr-section-label">🛡 Axes prioritaires — Défense</p>
          <textarea id="crAxesDef" class="cr-textarea" placeholder="Ex: Action, Mentalité...">${escHtml(cr?.axes_def || '')}</textarea>
        </div>
        <div class="cr-field-group cr-ct">
          <p class="cr-section-label">🎯 Objectif court terme du joueur</p>
          <textarea id="crCT" class="cr-textarea" placeholder="Travail prioritaire sur les prochaines semaines...">${escHtml(cr?.objectifs_ct || '')}</textarea>
        </div>
        <div class="cr-field-group cr-mt">
          <p class="cr-section-label">🚀 Objectif moyen terme du joueur</p>
          <textarea id="crMT" class="cr-textarea" placeholder="Objectifs sur la saison...">${escHtml(cr?.objectifs_mt || '')}</textarea>
        </div>
        <div class="cr-field-group cr-notes">
          <p class="cr-section-label">📝 Compte-rendu d'entretien</p>
          <textarea id="crNotes" class="cr-textarea" placeholder="Points forts, observations, ressenti...">${escHtml(cr?.notes || '')}</textarea>
        </div>
        <div id="crVisibilityToggle" class="cr-visibility-toggle${cr?.visible_joueur ? ' active' : ''}" onclick="coachToggleCRVis()">
          <span id="crVisibleIcon">${cr?.visible_joueur ? '👁' : '🔒'}</span>
          <span id="crVisibleText">${cr?.visible_joueur ? 'Partagé avec le joueur — cliquer pour masquer' : 'Masqué au joueur — cliquer pour partager'}</span>
        </div>
        <input type="hidden" id="crVisible" value="${cr?.visible_joueur ? 'true' : 'false'}">
        <div style="text-align:right;margin-top:10px">
          <button class="btn btn-primary btn-sm" onclick="saveCoachCR('${sessionId}','${playerId}')">Enregistrer</button>
        </div>
      </div>
    </div>`;

  if (_cAttId) _chartAtt = buildSessionRadar('radarAtt', _cAttId);
  if (_cDefId) _chartDef = buildSessionRadar('radarDef', _cDefId);
  if (showBilan) cRenderBilan();
}

async function coachShareResults(sessionId, playerId) {
  await window.supabaseClient.from('session_player_statut')
    .upsert({ session_id:sessionId, player_id:playerId, resultats_visibles:true }, { onConflict:'session_id,player_id' });
  showCoachRadar(sessionId, playerId);
}

async function coachUnshareResults(sessionId, playerId) {
  await window.supabaseClient.from('session_player_statut')
    .upsert({ session_id:sessionId, player_id:playerId, resultats_visibles:false }, { onConflict:'session_id,player_id' });
  showCoachRadar(sessionId, playerId);
}

/* ─── STORY 07 — Interface notation coach ─────────────────────────────────── */
let _cSession = null, _cPlayerId = null, _cProfile = null;
let _cRatings = {}, _jRatings = {}, _cSaving = {};
let _cAxeIds = [], _cAxeIdx = 0, _cProfilId = null;

const RATING_DESC_COACH = {
  1: { label: 'Fragile',    desc: 'Ce critère est encore instable ou non maîtrisé.' },
  2: { label: 'En travail', desc: 'Le joueur progresse mais ce n\'est pas encore stable.' },
  3: { label: 'Acquis',     desc: 'Le joueur maîtrise ce critère à l\'entraînement.' },
  4: { label: 'Maîtrisé',   desc: 'Le joueur est constant et fiable sur ce critère en match.' },
  5: { label: 'Référence',  desc: 'Le joueur est un exemple sur ce critère pour l\'équipe.' },
};

async function showCoachEval(sessionId, playerId) {
  _cSession = sessionId; _cPlayerId = playerId;
  _cRatings = {}; _jRatings = {};
  gid('mainContent').innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const saison = currentSaison();
  const [playerRes, profileRes, evalsRes] = await Promise.all([
    window.supabaseClient.from('players').select('*').eq('id', playerId).single(),
    window.supabaseClient.from('player_profiles').select('*')
      .eq('player_id', playerId).eq('saison', saison).eq('actif', true).maybeSingle(),
    window.supabaseClient.from('evaluations').select('critere_id, note_joueur, note_staff')
      .eq('session_id', sessionId).eq('player_id', playerId)
  ]);

  const player  = playerRes.data;
  _cProfile = profileRes.data;
  (evalsRes.data || []).forEach(e => {
    if (e.note_joueur) _jRatings[e.critere_id] = e.note_joueur;
    if (e.note_staff)  _cRatings[e.critere_id] = e.note_staff;
  });

  const nom = player ? `${escHtml(player.prenom)} ${escHtml(player.nom)}` : playerId;

  if (!_cProfile) {
    gid('mainContent').innerHTML = `
      <div class="section-header" style="margin-bottom:16px">
        <button class="btn btn-secondary btn-sm" onclick="showSessionDetail('${sessionId}')">← Retour</button>
        <span style="font-weight:700">${nom}</span>
      </div>
      <div class="empty-state"><p>Aucun profil assigné pour cette saison.</p></div>`;
    return;
  }

  gid('mainContent').innerHTML = `
    <div class="section-header" style="margin-bottom:16px">
      <button class="btn btn-secondary btn-sm" onclick="showSessionDetail('${sessionId}')">← Retour</button>
      <span style="font-weight:700">${nom}</span>
    </div>
    ${_cProfile.profil_gb ? '' : `
    <div class="profil-tabs" id="coachProfilTabs">
      <button class="profil-tab att active" id="cTabAtt" onclick="coachSwitchProfil('att')">
        <span>⚡ Attaque</span>
      </button>
      <button class="profil-tab def" id="cTabDef" onclick="coachSwitchProfil('def')">
        <span>🛡 Défense</span>
      </button>
    </div>`}
    <div id="coachEvalContent"></div>`;

  coachRenderAxes(_cProfile.profil_gb ? 'gb' : _cProfile.profil_att, sessionId);
}

function coachSwitchProfil(type) {
  document.querySelectorAll('.profil-tab').forEach(b => b.classList.remove('active'));
  gid('cTab' + (type === 'att' ? 'Att' : 'Def')).classList.add('active');
  coachRenderAxes(type === 'att' ? _cProfile.profil_att : _cProfile.profil_def, _cSession);
}

function coachRenderAxes(profilId, sessionId) {
  _cProfilId = profilId;
  const profil = CRITERIA[profilId];
  if (!profil) return;
  _cAxeIds = Object.keys(profil.axes);
  _cAxeIdx = 0;
  const type = profil.type;

  gid('coachEvalContent').innerHTML = `
    <div class="axes-nav-wrapper">
      <div class="axes-eval-nav" id="coachAxesNav">
        ${_cAxeIds.map((axeId, i) => `
          <button class="btn-axe-eval ${type} ${i === 0 ? 'active' : ''}"
                  id="cAxeBtn-${axeId}"
                  onclick="coachSelectAxe('${profilId}','${axeId}',this)">
            ${profil.axes[axeId].label}
          </button>`).join('')}
      </div>
    </div>
    <div id="coachCriteresContent"></div>
    <div class="axe-arrows" id="coachAxeArrows"></div>`;

  coachShowCriteres(profilId, _cAxeIds[0], gid('cAxeBtn-' + _cAxeIds[0]));
}

function coachSelectAxe(profilId, axeId, btnEl) {
  _cAxeIdx = _cAxeIds.indexOf(axeId);
  coachShowCriteres(profilId, axeId, btnEl);
}

function coachNavAxe(dir) {
  const next = _cAxeIdx + dir;
  if (next < 0 || next >= _cAxeIds.length) return;
  _cAxeIdx = next;
  const axeId = _cAxeIds[_cAxeIdx];
  const btn = gid('cAxeBtn-' + axeId);
  coachShowCriteres(_cProfilId, axeId, btn);
  if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function coachShowCriteres(profilId, axeId, btnEl) {
  document.querySelectorAll('.btn-axe-eval').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const axe  = CRITERIA[profilId]?.axes[axeId];
  if (!axe) return;
  const type = CRITERIA[profilId].type;

  // Flèches navigation
  const arrowEl = gid('coachAxeArrows');
  if (arrowEl && _cAxeIds.length > 1) {
    const profil = CRITERIA[profilId];
    arrowEl.innerHTML = `
      <button class="btn-axe-arrow ${_cAxeIdx === 0 ? 'disabled' : ''}"
              onclick="coachNavAxe(-1)" ${_cAxeIdx === 0 ? 'disabled' : ''}>← Précédent</button>
      <span class="axe-counter">${_cAxeIdx + 1} / ${_cAxeIds.length}</span>
      ${_cAxeIdx < _cAxeIds.length - 1
        ? `<button class="btn-axe-arrow" onclick="coachNavAxe(1)">${profil.axes[_cAxeIds[_cAxeIdx + 1]].label} →</button>`
        : `<button class="btn-axe-arrow done" onclick="coachTerminer()">Terminé ✓</button>`}`;
  }

  gid('coachCriteresContent').innerHTML = axe.criteres.map((c, i) => {
    const nj = _jRatings[c.id] || 0;
    const ns = _cRatings[c.id] || 0;
    return `
      <div class="critere-eval-card" id="ccard-${c.id}">
        <div class="critere-eval-num">${i + 1}</div>
        <div class="critere-eval-body">
          <div class="critere-eval-label ${type}">${escHtml(c.label)}</div>
          <div class="critere-eval-texte">${escHtml(c.texte)}</div>
          <div class="coach-rating-block">
            <div class="coach-rating-row">
              <span class="coach-rating-who">Joueur</span>
              <div class="rating-group" style="pointer-events:none;opacity:${nj ? 1 : 0.3}">
                ${[1,2,3,4,5].map(n => `<div class="rating-btn n${n} ${nj === n ? 'selected' : ''}" style="cursor:default"></div>`).join('')}
              </div>
            </div>
            <div class="coach-rating-row">
              <span class="coach-rating-who">Staff</span>
              <div class="rating-group">
                ${[1,2,3,4,5].map(n => `
                  <button class="rating-btn n${n} ${ns === n ? 'selected' : ''}" data-n="${n}"
                    id="crbtn-${c.id}-${n}"
                    onclick="saveCoachRating('${_cSession}','${profilId}','${c.id}',${n},this)"
                    aria-label="${RATING_DESC_COACH[n].label}">
                  </button>`).join('')}
              </div>
            </div>
          </div>
          <div class="rating-preview${ns ? ' active' : ''}" id="cpreview-${c.id}">${ns ? `<span class="preview-num n${ns}">${RATING_DESC_COACH[ns].label}</span><span class="preview-desc">${RATING_DESC_COACH[ns].desc}</span>` : ''}</div>
          <div class="save-status" id="cstatus-${c.id}"></div>
        </div>
      </div>`;
  }).join('');
}

async function saveCoachRating(sessionId, profilId, critereId, note, btnEl) {
  if (_cSaving[critereId]) return;
  _cSaving[critereId] = true;

  const card = gid('ccard-' + critereId);
  card.querySelectorAll('#crbtn-' + critereId + '-1, #crbtn-' + critereId + '-2, #crbtn-' + critereId + '-3, #crbtn-' + critereId + '-4, #crbtn-' + critereId + '-5')
    .forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
  _cRatings[critereId] = note;

  const rd = RATING_DESC_COACH[note];
  const prev = gid('cpreview-' + critereId);
  if (prev) {
    prev.innerHTML = `<span class="preview-num n${note}">${rd.label}</span><span class="preview-desc">${rd.desc}</span>`;
    prev.className = 'rating-preview active';
  }

  const st = gid('cstatus-' + critereId);
  st.textContent = '…'; st.className = 'save-status saving';

  try {
    const { error } = await window.supabaseClient
      .from('evaluations')
      .upsert({
        session_id:  sessionId,
        player_id:   _cPlayerId,
        profil_id:   profilId,
        critere_id:  critereId,
        note_staff:  note
      }, { onConflict: 'session_id,player_id,critere_id' });
    if (error) throw error;
    st.textContent = '✓'; st.className = 'save-status saved';
    setTimeout(() => { st.textContent = ''; st.className = 'save-status'; }, 1200);
  } catch (err) {
    st.textContent = '✗'; st.className = 'save-status error';
    _cRatings[critereId] = 0;
    btnEl.classList.remove('selected');
  } finally {
    _cSaving[critereId] = false;
  }
}

function coachTerminer() {
  if (_cProfile && _cProfile.profil_att === _cProfilId && _cProfile.profil_def) {
    showToast('Attaque notée ! Passe à la Défense.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => coachSwitchProfil('def'), 600);
    return;
  }
  showToast('Notation enregistrée !');
  setTimeout(() => showSessionDetail(_cSession), 1200);
}

async function confirmCloseSession(sessionId) {
  if (!confirm('Fermer la session "' + sessionId + '" ?\n\nLes joueurs ne pourront plus modifier leurs notes.')) return;

  const { error } = await window.supabaseClient
    .from('sessions')
    .update({ statut: 'ferme', closed_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) { showToast('Erreur : ' + error.message); return; }
  showToast('Session fermée');
  await renderSessions();
}

async function confirmReopenSession(sessionId) {
  if (!confirm('Rouvrir la session "' + sessionId + '" ?\n\nLes joueurs pourront à nouveau modifier leurs notes.')) return;

  const { error } = await window.supabaseClient
    .from('sessions')
    .update({ statut: 'ouvert', closed_at: null })
    .eq('id', sessionId);

  if (error) { showToast('Erreur : ' + error.message); return; }
  showToast('Session réouverte');
  await renderSessions();
}

function showCreateSessionModal() {
  const now    = new Date();
  const mois   = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const defLabel = `Évaluation — ${mois[now.getMonth()]} ${now.getFullYear()}`;
  const defDate  = now.toISOString().split('T')[0];
  const saison   = currentSaison();

  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'createSessionModal';
  overlay.innerHTML = `
    <div class="modal-panel">
      <div class="modal-header">
        <h3 class="modal-title">Nouvelle session</h3>
        <button class="modal-close" onclick="closeModal('createSessionModal')">✕</button>
      </div>
      <form id="createSessionForm" onsubmit="submitCreateSession(event)">
        <div class="form-group">
          <label class="form-label">Nom de la session <span class="required">*</span></label>
          <input class="form-input" name="label" required value="${defLabel}">
        </div>
        <div class="form-group">
          <label class="form-label">Date <span class="required">*</span></label>
          <input class="form-input" name="date_session" type="date" required value="${defDate}">
        </div>
        <div class="form-group">
          <label class="form-label">Saison</label>
          <input class="form-input" value="${saison}" disabled style="color:var(--gray-400)">
        </div>
        <p class="form-hint">Un identifiant unique sera généré automatiquement (ex : EVAL-2026-JAN-01)</p>
        <p class="form-error" id="createSessionError" style="display:none"></p>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal('createSessionModal')">Annuler</button>
          <button type="submit" class="btn btn-primary" id="createSessionBtn">Créer</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal('createSessionModal'); });
  overlay.querySelector('[name="label"]').focus();
}

async function submitCreateSession(e) {
  e.preventDefault();
  const btn   = gid('createSessionBtn');
  const errEl = gid('createSessionError');
  const fd    = new FormData(e.target);
  const saison = currentSaison();

  btn.disabled = true;
  btn.textContent = 'Création…';
  errEl.style.display = 'none';

  try {
    const date = fd.get('date_session');
    const d    = new Date(date);
    const moisCode = ['JAN','FEV','MAR','AVR','MAI','JUN','JUL','AOU','SEP','OCT','NOV','DEC'];
    const baseId   = `EVAL-${d.getFullYear()}-${moisCode[d.getMonth()]}`;

    const { data: existing } = await window.supabaseClient
      .from('sessions').select('id').ilike('id', baseId + '-%');
    const num = String((existing || []).length + 1).padStart(2, '0');
    const sessionId = `${baseId}-${num}`;

    const { error } = await window.supabaseClient.from('sessions').insert({
      id:           sessionId,
      label:        fd.get('label').trim(),
      saison,
      date_session: date,
      statut:       'ouvert',
      created_by:   _coachUser.id
    });
    if (error) throw error;

    closeModal('createSessionModal');
    showToast('Session ' + sessionId + ' créée');
    await renderSessions();

  } catch (err) {
    errEl.textContent = err.message || 'Erreur lors de la création';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Créer';
  }
}

/* ═══════════════════════════════════════════════════════ JOUEURS — STORY 04 */
async function renderPlayers() {
  gid('mainContent').innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const saison = currentSaison();
  const [playersRes, profilesRes] = await Promise.all([
    window.supabaseClient.from('players').select('*').eq('actif', true).order('nom'),
    window.supabaseClient.from('player_profiles').select('*').eq('saison', saison).eq('actif', true)
  ]);

  if (playersRes.error) {
    gid('mainContent').innerHTML = `<p class="form-error">Erreur : ${playersRes.error.message}</p>`;
    return;
  }

  const players  = playersRes.data  || [];
  const profiles = profilesRes.data || [];
  const profileMap = {};
  profiles.forEach(p => { profileMap[p.player_id] = p; });
  const combined = players.map(p => ({ ...p, profile: profileMap[p.id] || null }));

  gid('mainContent').innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Joueurs <span class="badge-count">${combined.length}</span></h2>
      <button class="btn btn-primary btn-sm" onclick="showCreatePlayerModal()">+ Ajouter</button>
    </div>
    <p class="section-saison">Saison ${saison}</p>
    <div class="players-list">
      ${combined.length === 0
        ? `<div class="empty-state">
             <div class="empty-state-icon">👥</div>
             <p>Aucun joueur.<br>Ajoutez le premier joueur pour démarrer.</p>
           </div>`
        : combined.map(renderPlayerCard).join('')
      }
    </div>`;
}

function renderPlayerCard(p) {
  const prof = p.profile;
  let badges = '';
  if (!prof) {
    badges = `<span class="badge-profil no-profile">Profil manquant</span>`;
  } else if (prof.profil_gb) {
    badges = `<span class="badge-profil gb">GB</span>`;
  } else {
    const att = PROFIL_LABELS[prof.profil_att] || prof.profil_att || '?';
    const def = PROFIL_LABELS[prof.profil_def] || prof.profil_def || '?';
    badges = `<span class="badge-profil att">${att}</span><span class="badge-profil def">${def}</span>`;
  }
  const initials = (p.prenom[0] + p.nom[0]).toUpperCase();
  return `
    <div class="player-card" onclick="showPlayerDetail('${p.id}')">
      <div class="player-card-avatar">${initials}</div>
      <div class="player-card-body">
        <div class="player-card-name">${p.prenom} ${p.nom}</div>
        ${p.email ? `<div class="player-card-email">${p.email}</div>` : ''}
        <div class="player-card-profils">${badges}</div>
      </div>
      <div class="player-card-arrow">›</div>
    </div>`;
}

/* ─── Détail / édition d'un joueur ───────────────────────────────────────── */
async function showPlayerDetail(playerId) {
  gid('mainContent').innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const saison = currentSaison();
  const [playerRes, profileRes] = await Promise.all([
    window.supabaseClient.from('players').select('*').eq('id', playerId).single(),
    window.supabaseClient.from('player_profiles').select('*')
      .eq('player_id', playerId).eq('saison', saison).eq('actif', true).maybeSingle()
  ]);

  if (playerRes.error) {
    gid('mainContent').innerHTML = `<p class="form-error">Joueur introuvable.</p>`;
    return;
  }

  const p    = playerRes.data;
  const prof = profileRes.data;
  const typeProfile = prof && prof.profil_gb ? 'gb' : 'champ';
  const currentAtt  = prof ? (prof.profil_att || '') : '';
  const currentDef  = prof ? (prof.profil_def || '') : '';
  const profId = prof ? prof.id : '';

  gid('mainContent').innerHTML = `
    <div class="section-header" style="margin-bottom:16px">
      <button class="btn btn-secondary btn-sm" onclick="renderPlayers()">← Retour</button>
      <h2 class="section-title" style="margin-bottom:0">${escHtml(p.prenom)} ${escHtml(p.nom)}</h2>
    </div>
    <div class="card">
      <div class="card-body">
        <form id="editPlayerForm" onsubmit="submitEditPlayer(event, '${p.id}', '${profId}')">
          <div class="form-group">
            <label class="form-label">Prénom</label>
            <input class="form-input" name="prenom" value="${escHtml(p.prenom)}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Nom</label>
            <input class="form-input" name="nom" value="${escHtml(p.nom)}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email <span class="form-sub">(connexion joueur)</span></label>
            <input class="form-input" name="email" type="email" value="${escHtml(p.email || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Profil — Saison ${saison}</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="typeProfile" value="champ" ${typeProfile === 'champ' ? 'checked' : ''} onchange="toggleProfileType(this.value)">
                Joueur de champ (ATT + DEF)
              </label>
              <label class="radio-label">
                <input type="radio" name="typeProfile" value="gb" ${typeProfile === 'gb' ? 'checked' : ''} onchange="toggleProfileType(this.value)">
                Gardien de but
              </label>
            </div>
          </div>
          <div id="champProfiles" ${typeProfile === 'gb' ? 'style="display:none"' : ''}>
            <div class="form-group">
              <label class="form-label">Profil Attaque</label>
              <select class="form-select" name="profil_att" ${typeProfile === 'champ' ? 'required' : ''}>
                <option value="">— choisir —</option>
                <option value="ailier-att" ${currentAtt === 'ailier-att' ? 'selected' : ''}>Ailier</option>
                <option value="arr-att"    ${currentAtt === 'arr-att'    ? 'selected' : ''}>Arrière</option>
                <option value="dc-att"     ${currentAtt === 'dc-att'     ? 'selected' : ''}>Demi-Centre</option>
                <option value="pvt-att"    ${currentAtt === 'pvt-att'    ? 'selected' : ''}>Pivot</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Profil Défense</label>
              <select class="form-select" name="profil_def" ${typeProfile === 'champ' ? 'required' : ''}>
                <option value="">— choisir —</option>
                <option value="n1-def" ${currentDef === 'n1-def' ? 'selected' : ''}>Profil N°1</option>
                <option value="n2-def" ${currentDef === 'n2-def' ? 'selected' : ''}>Profil N°2</option>
                <option value="n3-def" ${currentDef === 'n3-def' ? 'selected' : ''}>Profil N°3</option>
              </select>
            </div>
          </div>
          <div id="gbProfile" ${typeProfile === 'champ' ? 'style="display:none"' : ''}>
            <p class="form-hint">Profil Gardien de But automatiquement assigné.</p>
          </div>
          <p class="form-error" id="editPlayerError" style="display:none"></p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="renderPlayers()">Annuler</button>
            <button type="submit" class="btn btn-primary" id="editPlayerBtn">Enregistrer</button>
          </div>
        </form>
        <hr style="margin:20px 0;border:none;border-top:1px solid var(--gray-200)">
        <button class="btn btn-danger" onclick="confirmDeletePlayer('${p.id}', '${escHtml(p.prenom)} ${escHtml(p.nom)}')">
          Supprimer ce joueur
        </button>
      </div>
    </div>`;
}

async function submitEditPlayer(e, playerId, profileId) {
  e.preventDefault();
  const btn   = gid('editPlayerBtn');
  const errEl = gid('editPlayerError');
  const fd    = new FormData(e.target);
  const saison = currentSaison();
  const typeProfile = fd.get('typeProfile');

  btn.disabled = true;
  btn.textContent = 'Enregistrement…';
  errEl.style.display = 'none';

  try {
    const { error: pErr } = await window.supabaseClient
      .from('players')
      .update({
        prenom: fd.get('prenom').trim(),
        nom:    fd.get('nom').trim(),
        email:  fd.get('email').trim() || null
      })
      .eq('id', playerId);
    if (pErr) throw pErr;

    const profData = { player_id: playerId, saison, actif: true };
    if (typeProfile === 'gb') {
      profData.profil_gb = 'gb'; profData.profil_att = null; profData.profil_def = null;
    } else {
      profData.profil_gb = null;
      profData.profil_att = fd.get('profil_att');
      profData.profil_def = fd.get('profil_def');
    }

    if (profileId) {
      const { error: ppErr } = await window.supabaseClient
        .from('player_profiles').update(profData).eq('id', profileId);
      if (ppErr) throw ppErr;
    } else {
      const { error: ppErr } = await window.supabaseClient
        .from('player_profiles').insert(profData);
      if (ppErr) throw ppErr;
    }

    showToast('Joueur enregistré');
    await renderPlayers();

  } catch (err) {
    errEl.textContent = err.message || 'Erreur lors de la sauvegarde';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Enregistrer';
  }
}

/* ─── Suppression joueur ──────────────────────────────────────────────────── */
async function confirmDeletePlayer(playerId, nomComplet) {
  if (!window.confirm(`Supprimer ${nomComplet} ?\n\nCela supprimera aussi son compte, ses évaluations et profils.\nCette action est irréversible.`)) return;

  try {
    // Tenter de supprimer le compte auth via Edge Function (non-bloquant)
    try {
      const session = (await window.supabaseClient.auth.getSession()).data.session;
      await fetch(
        'https://wyiylqvreuippmcrzwat.supabase.co/functions/v1/create-player-account',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + session.access_token
          },
          body: JSON.stringify({ player_id: playerId })
        }
      );
    } catch (_) { /* Edge Function optionnelle — on continue */ }

    // Supprimer les données dans l'ordre
    await window.supabaseClient.from('comptes_rendus').delete().eq('player_id', playerId);
    await window.supabaseClient.from('evaluations').delete().eq('player_id', playerId);
    await window.supabaseClient.from('entretiens').delete().eq('player_id', playerId);
    await window.supabaseClient.from('session_player_statut').delete().eq('player_id', playerId);
    await window.supabaseClient.from('player_profiles').delete().eq('player_id', playerId);
    const { error } = await window.supabaseClient.from('players').delete().eq('id', playerId);
    if (error) throw error;
    showToast('Joueur supprimé');
    await renderPlayers();
  } catch (err) {
    alert('Erreur lors de la suppression : ' + (err.message || err));
  }
}

/* ─── Modal création joueur ───────────────────────────────────────────────── */
function showCreatePlayerModal() {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'createPlayerModal';
  overlay.innerHTML = `
    <div class="modal-panel">
      <div class="modal-header">
        <h3 class="modal-title">Nouveau joueur</h3>
        <button class="modal-close" onclick="closeModal('createPlayerModal')">✕</button>
      </div>
      <form id="createPlayerForm" onsubmit="submitCreatePlayer(event)">
        <div class="form-group">
          <label class="form-label">Prénom <span class="required">*</span></label>
          <input class="form-input" name="prenom" required autocomplete="given-name">
        </div>
        <div class="form-group">
          <label class="form-label">Nom <span class="required">*</span></label>
          <input class="form-input" name="nom" required autocomplete="family-name">
        </div>
        <div class="form-group">
          <label class="form-label">Email <span class="required">*</span></label>
          <input class="form-input" name="email" type="email" autocomplete="email" required>
        </div>
        <div class="form-group">
          <label class="form-label">Mot de passe temporaire <span class="required">*</span></label>
          <input class="form-input" name="password" type="password" autocomplete="new-password" required minlength="8" placeholder="8 caractères minimum">
          <p class="form-hint">Le joueur pourra se connecter avec ce mot de passe.</p>
        </div>
        <div class="form-group">
          <label class="form-label">Type de profil <span class="required">*</span></label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" name="typeProfile" value="champ" checked onchange="toggleProfileType(this.value)">
              Joueur de champ (ATT + DEF)
            </label>
            <label class="radio-label">
              <input type="radio" name="typeProfile" value="gb" onchange="toggleProfileType(this.value)">
              Gardien de but
            </label>
          </div>
        </div>
        <div id="champProfiles">
          <div class="form-group">
            <label class="form-label">Profil Attaque <span class="required">*</span></label>
            <select class="form-select" name="profil_att" required>
              <option value="">— choisir —</option>
              <option value="ailier-att">Ailier</option>
              <option value="arr-att">Arrière</option>
              <option value="dc-att">Demi-Centre</option>
              <option value="pvt-att">Pivot</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Profil Défense <span class="required">*</span></label>
            <select class="form-select" name="profil_def" required>
              <option value="">— choisir —</option>
              <option value="n1-def">Profil N°1</option>
              <option value="n2-def">Profil N°2</option>
              <option value="n3-def">Profil N°3</option>
            </select>
          </div>
        </div>
        <div id="gbProfile" style="display:none">
          <p class="form-hint">Profil Gardien de But automatiquement assigné.</p>
        </div>
        <p class="form-error" id="createPlayerError" style="display:none"></p>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal('createPlayerModal')">Annuler</button>
          <button type="submit" class="btn btn-primary" id="createPlayerBtn">Créer</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal('createPlayerModal');
  });
  overlay.querySelector('[name="prenom"]').focus();
}

function toggleProfileType(val) {
  var champDiv = gid('champProfiles');
  var gbDiv    = gid('gbProfile');
  if (champDiv) champDiv.style.display = val === 'champ' ? '' : 'none';
  if (gbDiv)    gbDiv.style.display    = val === 'gb'    ? '' : 'none';
  var attSel = document.querySelector('[name="profil_att"]');
  var defSel = document.querySelector('[name="profil_def"]');
  if (attSel) attSel.required = val === 'champ';
  if (defSel) defSel.required = val === 'champ';
}

async function submitCreatePlayer(e) {
  e.preventDefault();
  const btn    = gid('createPlayerBtn');
  const errEl  = gid('createPlayerError');
  const fd     = new FormData(e.target);
  const saison = currentSaison();
  const typeProfile = fd.get('typeProfile');

  btn.disabled = true;
  btn.textContent = 'Création…';
  errEl.style.display = 'none';

  try {
    const { data: player, error: pErr } = await window.supabaseClient
      .from('players')
      .insert({
        nom:    fd.get('nom').trim(),
        prenom: fd.get('prenom').trim(),
        email:  fd.get('email').trim() || null
      })
      .select()
      .single();
    if (pErr) throw pErr;

    const profData = { player_id: player.id, saison, actif: true };
    if (typeProfile === 'gb') {
      profData.profil_gb = 'gb';
    } else {
      profData.profil_att = fd.get('profil_att');
      profData.profil_def = fd.get('profil_def');
    }
    const { error: ppErr } = await window.supabaseClient.from('player_profiles').insert(profData);
    if (ppErr) throw ppErr;

    // Créer le compte auth via Edge Function
    const email    = fd.get('email').trim();
    const password = fd.get('password');
    if (email && password) {
      const session = (await window.supabaseClient.auth.getSession()).data.session;
      const res = await fetch(
        'https://wyiylqvreuippmcrzwat.supabase.co/functions/v1/create-player-account',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + session.access_token
          },
          body: JSON.stringify({ email, password, player_id: player.id })
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur création compte');
    }

    closeModal('createPlayerModal');
    showToast('Joueur ajouté');
    await renderPlayers();

  } catch (err) {
    errEl.textContent = err.message || 'Erreur lors de la création';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Créer';
  }
}

/* ─── Utilitaires ─────────────────────────────────────────────────────────── */
function closeModal(id) {
  var m = document.getElementById(id);
  if (m) m.remove();
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:calc(20px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);background:var(--gray-800);color:var(--white);padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;z-index:999;white-space:nowrap;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.2)';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 2500);
}
