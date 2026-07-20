/* ─── FENIX Eval CF — Player Home (STORY 06) ─────────────────────────────── */

function pgid(id) { return document.getElementById(id); }

let _playerUser    = null;
let _playerId      = null;
let _playerName    = '';
let _playerProfile = null;   // { profil_att, profil_def, profil_gb }
let _currentSession = null;
let _ratings       = {};     // { critere_id: note_joueur }
let _saving        = {};     // { critere_id: true }
let _pending       = {};     // { critere_id: note } — 1er tap en attente de confirmation
let _axeIds        = [];     // liste ordonnée des axes du profil courant
let _axeIdx        = 0;      // index de l'axe affiché
let _swipeProfilId = null;
let _swipeSession  = null;

const RATING_DESC = {
  1: { label: 'Fragile',    desc: 'Ce critère est encore instable ou non maîtrisé.' },
  2: { label: 'En travail', desc: 'Tu progresses mais ce n\'est pas encore stable.' },
  3: { label: 'Acquis',     desc: 'Tu maîtrises ce critère à l\'entraînement.' },
  4: { label: 'Maîtrisé',   desc: 'Tu es constant et fiable sur ce critère en match.' },
  5: { label: 'Référence',  desc: 'Tu es un exemple sur ce critère pour l\'équipe.' },
};

/* ── Init ─────────────────────────────────────────────────────────────────── */
async function initPlayerHome(user) {
  _playerUser = user;
  pgid('mainContent').innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const { data: up } = await window.supabaseClient
    .from('user_profiles').select('player_id').eq('id', user.id).single();
  _playerId = up?.player_id || null;

  if (!_playerId) {
    pgid('playerName').textContent = user.email;
    pgid('mainContent').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⏳</div>
        <p>Compte non encore associé à un joueur.<br>Contactez votre coach.</p>
      </div>`;
    return;
  }

  const [playerRes, profileRes] = await Promise.all([
    window.supabaseClient.from('players').select('*').eq('id', _playerId).single(),
    window.supabaseClient.from('player_profiles').select('*')
      .eq('player_id', _playerId).eq('saison', currentSaison()).eq('actif', true).maybeSingle()
  ]);

  const player   = playerRes.data;
  _playerProfile = profileRes.data;
  _playerName    = player ? player.prenom : user.email;
  pgid('playerName').textContent = player ? player.prenom + ' ' + player.nom : user.email;

  await showSessionsList();
}

/* ── Tableau de bord joueur ───────────────────────────────────────────────── */
async function showSessionsList() {
  _currentSession = null;
  const mc = pgid('mainContent');
  mc.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const [sessionsRes, evalsRes, statutsRes] = await Promise.all([
    window.supabaseClient.from('sessions').select('*')
      .order('date_session', { ascending: false }),
    window.supabaseClient.from('evaluations')
      .select('critere_id, note_joueur, session_id')
      .eq('player_id', _playerId),
    window.supabaseClient.from('session_player_statut')
      .select('session_id, statut, resultats_visibles')
      .eq('player_id', _playerId)
  ]);

  const sessions = sessionsRes.data || [];
  const evals    = evalsRes.data || [];

  const playerStatutMap = {};
  (statutsRes.data || []).forEach(s => { playerStatutMap[s.session_id] = s; });

  // Compter les notes par session
  const notesBySession = {};
  evals.forEach(e => {
    if (!notesBySession[e.session_id]) notesBySession[e.session_id] = 0;
    if (e.note_joueur) notesBySession[e.session_id]++;
  });

  // Total de critères pour ce joueur
  const totalCriteres = _playerProfile
    ? ((_playerProfile.profil_gb
        ? getAllCriteres('gb')
        : [...getAllCriteres(_playerProfile.profil_att || ''), ...getAllCriteres(_playerProfile.profil_def || '')]
      ).length)
    : 0;

  const ouvertes = sessions.filter(s => s.statut === 'ouvert');
  const fermees  = sessions.filter(s => s.statut === 'ferme');

  function sessionCard(s) {
    const filled       = notesBySession[s.id] || 0;
    const sessionOpen  = s.statut === 'ouvert';
    const playerLocked = playerStatutMap[s.id]?.statut === 'fermé';
    const resultatsOk  = playerStatutMap[s.id]?.resultats_visibles || false;
    const canEdit      = sessionOpen && !playerLocked;
    const pct          = totalCriteres > 0 ? Math.round(filled / totalCriteres * 100) : 0;
    const done         = totalCriteres > 0 && filled >= totalCriteres;

    return `
      <div class="session-card ${sessionOpen ? 'open' : 'closed'}" ${canEdit ? `onclick="showEvaluation('${s.id}')"` : ''} style="${canEdit ? 'cursor:pointer' : 'opacity:0.75'}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span class="${sessionOpen ? 'session-badge-open' : 'session-badge-closed'}">
            ${playerLocked ? '🔒 ACCÈS FERMÉ' : (sessionOpen ? 'OUVERT' : 'FERMÉ')}
          </span>
          <span style="font-size:12px;color:var(--gray-400)">${formatDateShort(s.date_session)}</span>
        </div>
        <div style="font-size:16px;font-weight:700;color:var(--gray-800);margin-bottom:8px">${escHtml(s.label)}</div>
        ${totalCriteres > 0 ? `
          <div class="eval-progress-bar">
            <div class="eval-progress-fill ${done ? 'done' : ''}" style="width:${pct}%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
            <span style="font-size:12px;color:var(--gray-600)">${filled} / ${totalCriteres} critères</span>
            <div style="display:flex;gap:8px;align-items:center">
              ${canEdit ? `<span style="font-size:12px;font-weight:700;color:var(--fenix-navy)">${done ? '✓ Complet' : 'Modifier →'}</span>` : ''}
              ${resultatsOk ? `<button class="btn btn-sm btn-primary" style="font-size:11px;padding:4px 10px" onclick="event.stopPropagation();showPlayerRadar('${s.id}')">📊 Mes résultats</button>` : ''}
            </div>
          </div>` : ''}
      </div>`;
  }

  mc.innerHTML = `
    <p class="player-greeting">Bonjour ${escHtml(_playerName)} 👋</p>
    <p class="section-saison">Saison ${currentSaison()}</p>
    ${ouvertes.length > 0 ? `
      <h2 class="section-title" style="margin-bottom:12px">Évaluations en cours</h2>
      ${ouvertes.map(sessionCard).join('')}` : `
      <div class="empty-state">
        <div class="empty-state-icon">✓</div>
        <p>Aucune session ouverte pour le moment.<br>Ton coach te préviendra pour la prochaine évaluation.</p>
      </div>`}
    ${fermees.length > 0 ? `
      <h2 class="section-title" style="margin:20px 0 12px">Évaluations passées</h2>
      ${fermees.map(sessionCard).join('')}` : ''}
    `;
}

/* ── Ouverture d'une session : écran intro ────────────────────────────────── */
async function showEvaluation(sessionId) {
  _currentSession = sessionId;
  _pending = {};
  pgid('mainContent').innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const { data: evals } = await window.supabaseClient
    .from('evaluations')
    .select('critere_id, note_joueur')
    .eq('session_id', sessionId)
    .eq('player_id', _playerId);

  _ratings = {};
  (evals || []).forEach(e => { if (e.note_joueur) _ratings[e.critere_id] = e.note_joueur; });

  if (!_playerProfile) {
    pgid('mainContent').innerHTML = `
      <div class="back-nav-inline" onclick="showSessionsList()">← Sessions</div>
      <div class="empty-state">
        <div class="empty-state-icon">⚙️</div>
        <p>Aucun profil assigné pour cette saison.<br>Contactez votre coach.</p>
      </div>`;
    return;
  }

  // Écran d'intro avec la légende de notation
  pgid('mainContent').innerHTML = `
    <div class="back-nav-inline" onclick="showSessionsList()">← Sessions</div>
    <div class="intro-card">
      <div class="intro-card-title">Comment te noter ?</div>
      <div class="intro-card-subtitle">Appuie une fois pour voir la description, une deuxième fois pour valider.</div>
      <div class="rating-legend">
        ${[1,2,3,4,5].map(n => `
          <div class="legend-row">
            <div class="legend-dot n${n}"></div>
            <div class="legend-text">
              <span class="legend-label">${RATING_DESC[n].label}</span>
              <span class="legend-desc">${RATING_DESC[n].desc}</span>
            </div>
          </div>`).join('')}
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:8px"
              onclick="startEvaluation('${sessionId}')">
        Commencer l'évaluation →
      </button>
    </div>`;
}

function startEvaluation(sessionId) {
  if (_playerProfile.profil_gb) {
    renderGbEval(sessionId);
  } else {
    renderChampEval(sessionId);
  }
}

/* ── Joueur de champ : tabs ATT / DEF ─────────────────────────────────────── */
function renderChampEval(sessionId) {
  const attId = _playerProfile.profil_att;
  const defId = _playerProfile.profil_def;

  pgid('mainContent').innerHTML = `
    <div class="back-nav-inline" onclick="showSessionsList()">← Sessions</div>
    <div class="profil-tabs">
      <button class="profil-tab att active" id="tabAtt" onclick="switchProfilTab('att')">
        <span>⚡ Attaque</span>
        <span class="tab-progress att" id="progressAtt">${progressLabel(attId)}</span>
      </button>
      <button class="profil-tab def" id="tabDef" onclick="switchProfilTab('def')">
        <span>🛡 Défense</span>
        <span class="tab-progress def" id="progressDef">${progressLabel(defId)}</span>
      </button>
    </div>
    <div id="evalContent"></div>`;

  renderAxesTabs(attId, sessionId);
}

function switchProfilTab(type) {
  document.querySelectorAll('.profil-tab').forEach(b => b.classList.remove('active'));
  pgid('tab' + (type === 'att' ? 'Att' : 'Def')).classList.add('active');
  const profilId = type === 'att' ? _playerProfile.profil_att : _playerProfile.profil_def;
  renderAxesTabs(profilId, _currentSession);
}

/* ── Gardien : pas de tabs profil ────────────────────────────────────────── */
function renderGbEval(sessionId) {
  pgid('mainContent').innerHTML = `
    <div class="back-nav-inline" onclick="showSessionsList()">← Sessions</div>
    <div id="evalContent"></div>`;
  renderAxesTabs('gb', sessionId);
}

/* ── Axes tabs ────────────────────────────────────────────────────────────── */
function renderAxesTabs(profilId, sessionId) {
  const profil = CRITERIA[profilId];
  if (!profil) return;

  _axeIds       = Object.keys(profil.axes);
  _axeIdx       = 0;
  _swipeProfilId = profilId;
  _swipeSession  = sessionId;
  const type    = profil.type;

  pgid('evalContent').innerHTML = `
    <div class="axes-nav-wrapper">
      <div class="axes-eval-nav" id="axesNav">
        ${_axeIds.map((axeId, i) => `
          <button class="btn-axe-eval ${type} ${i === 0 ? 'active' : ''}"
                  id="axeBtn-${axeId}"
                  onclick="selectAxe('${profilId}','${axeId}','${sessionId}',this)">
            ${profil.axes[axeId].label}
          </button>`).join('')}
      </div>
    </div>
    <div id="criteresContent"></div>
    <div class="axe-arrows" id="axeArrows"></div>`;

  // Swipe gauche/droite sur les critères
  addSwipeListeners();

  showAxeCriteres(profilId, _axeIds[0], sessionId, pgid('axeBtn-' + _axeIds[0]));
}

function selectAxe(profilId, axeId, sessionId, btnEl) {
  _axeIdx = _axeIds.indexOf(axeId);
  showAxeCriteres(profilId, axeId, sessionId, btnEl);
}

function navAxe(dir) {
  const next = _axeIdx + dir;
  if (next < 0 || next >= _axeIds.length) return;
  _axeIdx = next;
  const axeId = _axeIds[_axeIdx];
  const btn = pgid('axeBtn-' + axeId);
  showAxeCriteres(_swipeProfilId, axeId, _swipeSession, btn);
  if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  // Remonter en haut du contenu
  const mc = pgid('mainContent');
  if (mc) mc.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addSwipeListeners() {
  let startX = 0;
  const zone = pgid('criteresContent');
  if (!zone) return;
  zone.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  zone.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 60) return;
    navAxe(dx < 0 ? 1 : -1);
  }, { passive: true });
}

function updateAxeArrows() {
  const el = pgid('axeArrows');
  if (!el || _axeIds.length <= 1) return;
  const profil = CRITERIA[_swipeProfilId];
  el.innerHTML = `
    <button class="btn-axe-arrow ${_axeIdx === 0 ? 'disabled' : ''}"
            onclick="navAxe(-1)" ${_axeIdx === 0 ? 'disabled' : ''}>← Précédent</button>
    <span class="axe-counter">${_axeIdx + 1} / ${_axeIds.length}</span>
    ${_axeIdx < _axeIds.length - 1
      ? `<button class="btn-axe-arrow" onclick="navAxe(1)">${profil.axes[_axeIds[_axeIdx + 1]].label} →</button>`
      : `<button class="btn-axe-arrow done" onclick="terminerProfil()">Terminé ✓</button>`
    }`;
}

/* ── Critères d'un axe ────────────────────────────────────────────────────── */
function showAxeCriteres(profilId, axeId, sessionId, btnEl) {
  document.querySelectorAll('.btn-axe-eval').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  updateAxeArrows();

  const axe  = CRITERIA[profilId]?.axes[axeId];
  if (!axe) return;
  const type = CRITERIA[profilId].type;

  pgid('criteresContent').innerHTML = axe.criteres.map((c, i) => {
    const note = _ratings[c.id] || 0;
    return `
      <div class="critere-eval-card" id="card-${c.id}">
        <div class="critere-eval-num">${i + 1}</div>
        <div class="critere-eval-body">
          <div class="critere-eval-label ${type}">${escHtml(c.label)}</div>
          <div class="critere-eval-texte">${escHtml(c.texte)}</div>
          <div class="rating-group">
            ${[1,2,3,4,5].map(n => `
              <button class="rating-btn n${n} ${note === n ? 'selected' : ''}" data-n="${n}"
                id="rbtn-${c.id}-${n}"
                onclick="tapRating('${sessionId}','${profilId}','${c.id}',${n},this)"
                aria-label="${RATING_DESC[n].label}">
              </button>`).join('')}
          </div>
          <div class="rating-preview" id="preview-${c.id}"></div>
          <div class="save-status" id="status-${c.id}"></div>
        </div>
      </div>`;
  }).join('');
}

/* ── Double-tap : 1er tap = aperçu, 2ème tap = sauvegarde ────────────────── */
function tapRating(sessionId, profilId, critereId, note, btnEl) {
  // Valider immédiatement + afficher la description (reste visible)
  const rd   = RATING_DESC[note];
  const prev = pgid('preview-' + critereId);
  prev.innerHTML = `
    <span class="preview-num n${note}">${rd.label}</span>
    <span class="preview-desc">${rd.desc}</span>`;
  prev.className = 'rating-preview active';
  saveRating(sessionId, profilId, critereId, note, btnEl);
}

/* ── Sauvegarde d'une note ────────────────────────────────────────────────── */
async function saveRating(sessionId, profilId, critereId, note, btnEl) {
  if (_saving[critereId]) return;
  _saving[critereId] = true;

  // UI immédiate
  const card = pgid('card-' + critereId);
  card.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
  _ratings[critereId] = note;

  const st = pgid('status-' + critereId);
  st.textContent = '…';
  st.className = 'save-status saving';

  try {
    const { error } = await window.supabaseClient
      .from('evaluations')
      .upsert({
        session_id:  sessionId,
        player_id:   _playerId,
        profil_id:   profilId,
        critere_id:  critereId,
        note_joueur: note,
        date_joueur: new Date().toISOString()
      }, { onConflict: 'session_id,player_id,critere_id' });

    if (error) throw error;

    st.textContent = '✓';
    st.className = 'save-status saved';
    setTimeout(() => { st.textContent = ''; st.className = 'save-status'; }, 1500);
    updateProgressBadges();

  } catch (err) {
    st.textContent = '✗';
    st.className = 'save-status error';
    _ratings[critereId] = 0;
    btnEl.classList.remove('selected');
  } finally {
    _saving[critereId] = false;
  }
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function progressLabel(profilId) {
  if (!profilId || !CRITERIA[profilId]) return '';
  const criteres = getAllCriteres(profilId);
  const filled   = criteres.filter(c => _ratings[c.id]).length;
  return filled + '/' + criteres.length;
}

function updateProgressBadges() {
  var pAtt = pgid('progressAtt');
  var pDef = pgid('progressDef');
  if (pAtt && _playerProfile?.profil_att) pAtt.textContent = progressLabel(_playerProfile.profil_att);
  if (pDef && _playerProfile?.profil_def) pDef.textContent = progressLabel(_playerProfile.profil_def);
}

function terminerProfil() {
  // Vérifier les critères non notés du profil actuel
  const profil = CRITERIA[_swipeProfilId];
  if (profil) {
    const manques = [];
    Object.values(profil.axes).forEach(axe => {
      const nb = axe.criteres.filter(c => !_ratings[c.id]).length;
      if (nb) manques.push({ label: axe.label, nb });
    });
    if (manques.length > 0) {
      const total = manques.reduce((s, m) => s + m.nb, 0);
      const liste = manques.map(m =>
        `<li style="padding:4px 0">${m.label} — <strong>${m.nb} critère${m.nb > 1 ? 's' : ''} non noté${m.nb > 1 ? 's' : ''}</strong></li>`
      ).join('');
      const el = document.createElement('div');
      el.className = 'modal-overlay';
      el.innerHTML = `
        <div class="modal-panel">
          <div style="text-align:center;margin-bottom:16px">
            <div style="font-size:36px;margin-bottom:8px">⚠️</div>
            <p class="modal-title" style="color:#92400E">${total} critère${total > 1 ? 's' : ''} oublié${total > 1 ? 's' : ''}</p>
          </div>
          <ul style="font-size:14px;color:var(--gray-600);list-style:none;padding:0;margin-bottom:16px">
            ${liste}
          </ul>
          <p style="font-size:13px;color:var(--gray-400);text-align:center;margin-bottom:20px">
            Tu peux revenir les noter ou terminer quand même.
          </p>
          <div class="modal-actions">
            <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">← Revenir</button>
            <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove();_doTerminerProfil()">Terminer quand même</button>
          </div>
        </div>`;
      document.body.appendChild(el);
      return;
    }
  }
  _doTerminerProfil();
}

function _doTerminerProfil() {
  if (_playerProfile && _playerProfile.profil_att === _swipeProfilId && _playerProfile.profil_def) {
    showToast('Attaque terminée ! Passe à la Défense.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => switchProfilTab('def'), 600);
    return;
  }
  showToast('Évaluation envoyée !');
  setTimeout(() => showSessionsList(), 1500);
}

/* ── STORY 09 — Radar joueur ──────────────────────────────────────────────── */
let _pEvalMap = {}, _pChartAtt = null, _pChartDef = null;
let _pBilanAtt = null, _pBilanDef = null, _pBarAtt = null, _pBarDef = null;
let _pAllSessions = [], _pViewMode = 'joueur', _pAttId = null, _pDefId = null, _pIsGb = false;
let _pSelectedSessions = new Set(), _pShowBar = true;
let _pPdfSession = '', _pCrData = null;
const _P_LABELS = { 1:'Fragile', 2:'En travail', 3:'Acquis', 4:'Maîtrisé', 5:'Référence' };
const _P_SESSION_COLORS = [
  { bg:'rgba(139,92,246,0.12)', border:'rgba(139,92,246,0.7)' },
  { bg:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.7)' },
  { bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.7)' },
  { bg:'rgba(59,130,246,0.15)', border:'rgba(59,130,246,0.8)' },
];

function pWrapLabel(s) {
  if (!s.includes(' & ')) return s;
  const [a, ...rest] = s.split(' & ');
  return [a, '& ' + rest.join(' & ')];
}

function pAxesData(profilId, evalMap, viewKey) {
  const profil = CRITERIA[profilId];
  if (!profil) return null;
  const labels = [], values = [];
  Object.entries(profil.axes).forEach(([, axe]) => {
    labels.push(pWrapLabel(axe.label));
    const ns = axe.criteres.map(c => evalMap[c.id]?.[viewKey] || 0).filter(n => n > 0);
    values.push(ns.length ? +(ns.reduce((a,b) => a+b,0) / ns.length).toFixed(1) : 0);
  });
  return { labels, values };
}

function pAxesBtns(profilId) {
  const profil = CRITERIA[profilId];
  if (!profil) return '';
  return Object.entries(profil.axes).map(([axeId, axe]) =>
    `<button class="radar-axe-btn" id="praxe-${profilId}-${axeId}"
      onclick="showPlayerAxisDetail('${profilId}','${axeId}')">${escHtml(axe.label)}</button>`
  ).join('');
}

function pRenderBilan() {
  if (_pBilanAtt) { _pBilanAtt.destroy(); _pBilanAtt = null; }
  if (_pBilanDef) { _pBilanDef.destroy(); _pBilanDef = null; }
  const viewKey = _pViewMode === 'joueur' ? 'note_joueur' : 'note_staff';
  const selected = _pAllSessions.filter(s => _pSelectedSessions.has(s.id));
  function buildMulti(canvasId, profilId) {
    const ctx = pgid(canvasId)?.getContext('2d');
    if (!ctx || !profilId || !selected.length) return null;
    const firstRd = pAxesData(profilId, selected[0].evalMap, viewKey);
    if (!firstRd) return null;
    const datasets = selected.map(s => {
      const i = _pAllSessions.indexOf(s);
      const rd = pAxesData(profilId, s.evalMap, viewKey);
      const c = _P_SESSION_COLORS[i];
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
          pointLabels:{ font:{ size:12, weight:'600' } },
          grid:{ color:'rgba(0,0,0,0.08)' }
        }}
      }
    });
  }
  if (_pAttId) _pBilanAtt = buildMulti('pBilanAtt', _pAttId);
  if (_pDefId) _pBilanDef = buildMulti('pBilanDef', _pDefId);
}

function pToggleSession(sid) {
  if (_pSelectedSessions.has(sid)) {
    if (_pSelectedSessions.size <= 1) return;
    _pSelectedSessions.delete(sid);
  } else {
    _pSelectedSessions.add(sid);
  }
  document.querySelectorAll('.bilan-chip[data-sid]').forEach(chip => {
    chip.classList.toggle('active', _pSelectedSessions.has(chip.dataset.sid));
  });
  pRenderBilan();
  pRenderTrendTable();
  if (_pShowBar) pRenderBarChart();
}

function pToggleBarChart() {
  _pShowBar = !_pShowBar;
  const el  = pgid('pBarSection');
  const btn = pgid('pBarBtn');
  if (el)  el.style.display = _pShowBar ? 'block' : 'none';
  if (btn) btn.innerHTML = _pShowBar ? '📊 Masquer la progression' : '📊 Progression par thème <span style="font-size:10px;opacity:0.6;font-weight:400">(mode paysage conseillé)</span>';
  if (_pShowBar) pRenderBarChart();
  else {
    if (_pBarAtt) { _pBarAtt.destroy(); _pBarAtt = null; }
    if (_pBarDef) { _pBarDef.destroy(); _pBarDef = null; }
  }
}

function pRenderBarChart() {
  if (_pBarAtt) { _pBarAtt.destroy(); _pBarAtt = null; }
  if (_pBarDef) { _pBarDef.destroy(); _pBarDef = null; }
  const viewKey  = _pViewMode === 'joueur' ? 'note_joueur' : 'note_staff';
  const selected = _pAllSessions.filter(s => _pSelectedSessions.has(s.id));
  if (!selected.length) return;
  const n = selected.length;
  const barPct = Math.max(0.28, 0.6 - Math.max(0, n - 2) * 0.07);

  function buildProfilBar(canvasId, profilId, cTop, cBot, cLabel) {
    const ctx = pgid(canvasId)?.getContext('2d');
    if (!ctx || !profilId) return null;
    const profil = CRITERIA[profilId];
    if (!profil) return null;
    const axes = Object.values(profil.axes);
    const labels = [], data = [], groups = [];
    axes.forEach((axe, ai) => {
      const start = labels.length;
      selected.forEach(s => {
        labels.push(s.label);
        const ns = axe.criteres.map(cr => s.evalMap[cr.id]?.[viewKey] || 0).filter(v => v > 0);
        data.push(ns.length ? +(ns.reduce((a,b)=>a+b,0)/ns.length).toFixed(1) : null);
      });
      groups.push({ label: axe.label, start, count: n });
      if (ai < axes.length - 1) { labels.push(''); data.push(null); }
    });

    const gradBg = (ctx2) => {
      const { chart } = ctx2;
      const ca = chart.chartArea;
      if (!ca) return cTop;
      const g = chart.ctx.createLinearGradient(0, ca.top, 0, ca.bottom);
      g.addColorStop(0, cTop); g.addColorStop(1, cBot);
      return g;
    };

    const plugins = [
      {
        id: 'grp_' + canvasId,
        afterDraw(chart) {
          const { ctx: c, chartArea: ca, scales: { x } } = chart;
          groups.forEach((g, gi) => {
            const x1 = x.getPixelForValue(g.start), x2 = x.getPixelForValue(g.start + g.count - 1);
            const mid = (x1 + x2) / 2;
            c.save();
            c.font = '600 10px system-ui,sans-serif';
            c.fillStyle = '#64748b';
            c.textAlign = 'center';
            c.fillText(g.label, mid, ca.top - 7);
            if (gi > 0) {
              const gapX = x.getPixelForValue(g.start - 1);
              c.strokeStyle = 'rgba(0,0,0,0.07)';
              c.lineWidth = 1; c.setLineDash([]);
              c.beginPath(); c.moveTo(gapX, ca.top - 20); c.lineTo(gapX, ca.bottom); c.stroke();
            }
            c.restore();
          });
        }
      },
      {
        id: 'vals_' + canvasId,
        afterDatasetsDraw(chart) {
          const { ctx: c } = chart;
          chart.getDatasetMeta(0).data.forEach((bar, i) => {
            const v = data[i];
            if (v === null || v === 0) return;
            c.save();
            c.font = '700 10px system-ui,sans-serif';
            c.fillStyle = cLabel;
            c.textAlign = 'center';
            c.fillText(v.toFixed(1), bar.x, bar.y - 5);
            c.restore();
          });
        }
      }
    ];

    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{
        data,
        backgroundColor: gradBg,
        borderRadius: 5,
        borderSkipped: 'start',
        barPercentage: barPct,
        categoryPercentage: 0.9,
      }]},
      plugins,
      options: {
        responsive: true,
        layout: { padding: { top: 28 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.92)',
            titleColor: '#f1f5f9', bodyColor: '#cbd5e1',
            titleFont: { size: 11, weight: '700' }, bodyFont: { size: 11 },
            cornerRadius: 8, padding: 10,
            callbacks: {
              title(items) {
                const i = items[0].dataIndex;
                const g = groups.find(g => i >= g.start && i < g.start + g.count);
                return g ? g.label : '';
              },
              label(item) {
                const v = item.raw;
                return v !== null ? ` ${labels[item.dataIndex]} : ${Number(v).toFixed(1)} / 5` : '';
              }
            }
          }
        },
        scales: {
          y: { min:0, max:5, ticks:{ stepSize:1, font:{ size:10 }, color:'#94a3b8' }, grid:{ color:'rgba(0,0,0,0.05)' }, border:{ display:false } },
          x: { ticks:{ font:{ size:9 }, color:'#64748b', maxRotation:35, minRotation:35 }, grid:{ display:false }, border:{ display:false } }
        }
      }
    });
  }

  _pBarAtt = buildProfilBar('pBarAtt', _pAttId, 'rgba(59,130,246,0.88)', 'rgba(59,130,246,0.04)', 'rgba(37,99,235,0.95)');
  _pBarDef = buildProfilBar('pBarDef', _pDefId, 'rgba(234,88,12,0.88)',  'rgba(234,88,12,0.04)',  'rgba(194,65,12,0.95)');
}

function pLevelFromAvg(avg) {
  return avg !== null && avg !== undefined ? Math.min(5, Math.max(1, Math.round(avg))) : null;
}

function pBilanEntretienHTML(attId, defId, evalMap, cr) {
  if (!cr) return '';
  const LVL = {
    1:{bg:'#FEE2E2',col:'#991B1B',lbl:'Fragile'},
    2:{bg:'#FEF3C7',col:'#92400E',lbl:'En travail'},
    3:{bg:'#D1FAE5',col:'#065F46',lbl:'Acquis'},
    4:{bg:'#DBEAFE',col:'#1E40AF',lbl:'Maîtrisé'},
    5:{bg:'#EDE9FE',col:'#5B21B6',lbl:'Référence'},
  };
  function pill(avg) {
    const n = pLevelFromAvg(avg);
    if (!n) return `<span class="bilan-level-pill" style="background:#F1F5F9;color:#94A3B8">—</span>`;
    return `<span class="bilan-level-pill" style="background:${LVL[n].bg};color:${LVL[n].col}">${LVL[n].lbl}</span>`;
  }
  function axeTable(profilId) {
    const profil = CRITERIA[profilId];
    if (!profil) return '';
    const rows = Object.entries(profil.axes).map(([, axe]) => {
      const jNs = axe.criteres.map(c => evalMap[c.id]?.note_joueur || 0).filter(n => n > 0);
      const sNs = axe.criteres.map(c => evalMap[c.id]?.note_staff  || 0).filter(n => n > 0);
      const avgJ = jNs.length ? jNs.reduce((a,b) => a+b,0) / jNs.length : null;
      const avgS = sNs.length ? sNs.reduce((a,b) => a+b,0) / sNs.length : null;
      return `<tr>
        <td class="bilan-entretien-table-label">${escHtml(axe.label)}</td>
        <td class="bilan-entretien-table-pill">${pill(avgJ)}</td>
        <td class="bilan-entretien-table-pill">${pill(avgS)}</td>
      </tr>`;
    }).join('');
    return `<table class="bilan-entretien-table">
      <thead><tr>
        <th class="bilan-entretien-table-th-label">Axe</th>
        <th class="bilan-entretien-table-th-pill">Mon niveau</th>
        <th class="bilan-entretien-table-th-pill">Coach</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }
  const dateStr = cr.updated_at
    ? new Date(cr.updated_at).toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'})
    : '';
  let sections = '';
  if (attId) {
    const lbl = defId ? '⚡ Attaque' : '🧤 Gardien';
    sections += `<div class="bilan-entretien-section">
      <p class="bilan-entretien-section-label">${lbl}</p>
      ${axeTable(attId)}
      ${cr.axes_att ? `<p class="bilan-axes-prioritaires-label">Axes prioritaires</p><p class="bilan-axes-prioritaires">${escHtml(cr.axes_att)}</p>` : ''}
    </div>`;
  }
  if (defId) {
    sections += `<div class="bilan-entretien-section">
      <p class="bilan-entretien-section-label">🛡 Défense</p>
      ${axeTable(defId)}
      ${cr.axes_def ? `<p class="bilan-axes-prioritaires-label">Axes prioritaires</p><p class="bilan-axes-prioritaires">${escHtml(cr.axes_def)}</p>` : ''}
    </div>`;
  }
  const objBlock = (cr.objectifs_ct || cr.objectifs_mt) ? `<div class="bilan-objectifs-section">
      ${cr.objectifs_ct ? `<p class="cr-section-label">🎯 Objectif court terme</p><p class="cr-text">${escHtml(cr.objectifs_ct)}</p>` : ''}
      ${cr.objectifs_mt ? `<p class="cr-section-label" style="margin-top:10px">🚀 Objectif moyen terme</p><p class="cr-text">${escHtml(cr.objectifs_mt)}</p>` : ''}
    </div>` : '';
  return `<div class="card" style="margin-top:12px">
    <div class="bilan-entretien-header">
      <span class="bilan-entretien-header-title">📋 Bilan d'entretien</span>
      ${dateStr ? `<span class="bilan-entretien-header-date">${dateStr}</span>` : ''}
    </div>
    <div class="card-body" style="padding:0">
      ${sections}
      ${objBlock}
    </div>
  </div>`;
}

function pRecapTableHTML(profilId, evalMap, title) {
  const profil = CRITERIA[profilId];
  if (!profil) return '';
  const rows = Object.entries(profil.axes).map(([axeId, axe]) => {
    const jNs = axe.criteres.map(c => evalMap[c.id]?.note_joueur || 0).filter(n => n > 0);
    const sNs = axe.criteres.map(c => evalMap[c.id]?.note_staff  || 0).filter(n => n > 0);
    const avgJ = jNs.length ? +(jNs.reduce((a,b)=>a+b,0)/jNs.length).toFixed(1) : null;
    const avgS = sNs.length ? +(sNs.reduce((a,b)=>a+b,0)/sNs.length).toFixed(1) : null;
    const subId = 'pr-' + profilId + '-' + axeId;
    const subRows = axe.criteres.map(c => {
      const nj = evalMap[c.id]?.note_joueur || 0;
      const ns = evalMap[c.id]?.note_staff  || 0;
      return `<tr>
        <td class="trend-sub-label">${escHtml(c.label)}</td>
        <td class="trend-sub-td">${nj ? `<span class="trend-sub-dot n${nj}"></span>` : '<span class="trend-sub-dot empty">—</span>'}</td>
        <td class="trend-sub-td">${ns ? `<span class="trend-sub-dot n${ns}"></span>` : '<span class="trend-sub-dot empty">—</span>'}</td>
        <td class="trend-sub-td">${deltaHTML(nj, ns)}</td>
      </tr>`;
    }).join('');
    return `<tr class="recap-row" data-recap="${profilId}-${axeId}">
      <td class="recap-td-label">
        <button class="recap-theme-btn" data-trend-toggle="${subId}" onclick="toggleTrendSub('${subId}')">${escHtml(axe.label)}</button>
      </td>
      <td class="recap-td">${avgJ !== null ? avgJ : '—'}</td>
      <td class="recap-td">${avgS !== null ? avgS : '—'}</td>
      <td class="recap-td">${deltaHTML(avgJ, avgS)}</td>
    </tr>
    <tr class="trend-sub-row" id="${subId}" style="display:none">
      <td colspan="4" style="padding:0 0 8px 0;background:var(--gray-50)">
        <table class="trend-sub-table">
          <thead><tr>
            <th class="trend-sub-th-label">Critère</th>
            <th class="trend-sub-th">Moi</th>
            <th class="trend-sub-th">Staff</th>
            <th class="trend-sub-th">Écart</th>
          </tr></thead>
          <tbody>${subRows}</tbody>
        </table>
      </td>
    </tr>`;
  }).join('');
  return `
    <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--gray-400);margin-top:14px;margin-bottom:2px">${title}</p>
    <div class="trend-table-wrap">
    <table class="recap-table">
      <thead><tr>
        <th class="recap-th-label">Thème <span style="font-weight:400;font-size:9px;color:var(--gray-300);text-transform:none;letter-spacing:0">— clique pour détail</span></th>
        <th class="recap-th">Moi</th>
        <th class="recap-th">Staff</th>
        <th class="recap-th">Écart</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </div>`;
}

function pRenderTrendTable() {
  const el = pgid('pTrendSection');
  if (!el) return;
  const viewKey  = _pViewMode === 'joueur' ? 'note_joueur' : 'note_staff';
  const selected = _pAllSessions.filter(s => _pSelectedSessions.has(s.id));
  if (selected.length < 2) { el.innerHTML = ''; return; }
  el.innerHTML =
    (_pAttId ? trendTableHTML(_pAttId, selected, viewKey, _pIsGb ? '🧤 Tendances Gardien' : '⚡ Tendances Attaque') : '') +
    (_pDefId ? trendTableHTML(_pDefId, selected, viewKey, '🛡 Tendances Défense') : '');
}

function pSetViewMode(mode) {
  _pViewMode = mode;
  pgid('pToggleMoi')?.classList.toggle('active', mode === 'joueur');
  pgid('pToggleStaff')?.classList.toggle('active', mode === 'staff');
  pRenderBilan();
  pRenderTrendTable();
  if (_pShowBar) pRenderBarChart();
}

async function showPlayerRadar(sessionId) {
  if (_pChartAtt) { _pChartAtt.destroy(); _pChartAtt = null; }
  if (_pChartDef) { _pChartDef.destroy(); _pChartDef = null; }
  if (_pBilanAtt) { _pBilanAtt.destroy(); _pBilanAtt = null; }
  if (_pBilanDef) { _pBilanDef.destroy(); _pBilanDef = null; }
  if (_pBarAtt)   { _pBarAtt.destroy();   _pBarAtt   = null; }
  if (_pBarDef)   { _pBarDef.destroy();   _pBarDef   = null; }

  const mc = pgid('mainContent');
  mc.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const spsRes = await window.supabaseClient.from('session_player_statut')
    .select('session_id').eq('player_id', _playerId).eq('resultats_visibles', true);

  const sharedIds = [...new Set([...(spsRes.data || []).map(s => s.session_id), sessionId])];
  const resultatsVisible = (spsRes.data || []).some(s => s.session_id === sessionId);

  const [sessionRes, sessionsRes, allEvalsRes, crRes] = await Promise.all([
    window.supabaseClient.from('sessions').select('label').eq('id', sessionId).single(),
    window.supabaseClient.from('sessions').select('id, label, date_session').in('id', sharedIds).order('created_at', { ascending:true }),
    window.supabaseClient.from('evaluations').select('session_id, critere_id, note_joueur, note_staff')
      .eq('player_id', _playerId).in('session_id', sharedIds),
    window.supabaseClient.from('comptes_rendus').select('*').eq('session_id', sessionId).eq('player_id', _playerId).eq('visible_joueur', true).maybeSingle()
  ]);
  const cr = crRes.data;

  const evalsBySession = {};
  (allEvalsRes.data || []).forEach(e => {
    if (!evalsBySession[e.session_id]) evalsBySession[e.session_id] = {};
    evalsBySession[e.session_id][e.critere_id] = e;
  });

  _pEvalMap  = evalsBySession[sessionId] || {};
  _pViewMode = 'joueur';
  _pIsGb  = !!_playerProfile?.profil_gb;
  _pAttId = _pIsGb ? _playerProfile.profil_gb : _playerProfile?.profil_att;
  _pDefId = _pIsGb ? null : _playerProfile?.profil_def;

  const sessions = (sessionsRes.data || []).slice(-4);
  _pAllSessions = sessions.map((s, i) => ({ id:s.id, label:s.label, date:s.date_session, idx:i, evalMap:evalsBySession[s.id] || {} }));
  _pSelectedSessions = new Set(_pAllSessions.slice(-2).map(s => s.id));
  _pShowBar = true;

  const label = sessionRes.data?.label || sessionId;
  _pPdfSession = label;
  _pCrData = cr;

  // ── Card 1 : session actuelle Moi vs Staff ───────────────────────────────
  function buildSessionRadar(canvasId, profilId) {
    const ctx = pgid(canvasId)?.getContext('2d');
    if (!ctx || !profilId) return null;
    const profil = CRITERIA[profilId];
    if (!profil) return null;
    const labels = [], joueur = [], staff = [];
    Object.entries(profil.axes).forEach(([, axe]) => {
      labels.push(pWrapLabel(axe.label));
      const jN = axe.criteres.map(c => _pEvalMap[c.id]?.note_joueur || 0).filter(n => n > 0);
      const sN = axe.criteres.map(c => _pEvalMap[c.id]?.note_staff  || 0).filter(n => n > 0);
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
          pointLabels:{ font:{ size:12, weight:'600' } },
          grid:{ color:'rgba(0,0,0,0.08)' }
        }}
      }
    });
  }

  const sessionRadarHTML = _pIsGb
    ? `<div class="radar-col-full">
         <p class="radar-profil-title">🧤 Gardien</p>
         <canvas id="pRadarAtt" style="max-height:280px"></canvas>
       </div>`
    : `<div class="radar-grid">
         ${_pAttId ? `<div class="radar-col">
           <p class="radar-profil-title">⚡ Attaque</p>
           <canvas id="pRadarAtt" style="width:100%"></canvas>
         </div>` : ''}
         ${_pDefId ? `<div class="radar-col">
           <p class="radar-profil-title">🛡 Défense</p>
           <canvas id="pRadarDef" style="width:100%"></canvas>
         </div>` : ''}
       </div>`;

  // ── Card 2 : bilan multi-sessions (affiché seulement si > 1 session) ─────
  const showBilan = _pAllSessions.length > 1;

  const bilanRadarHTML = _pIsGb
    ? `<div class="radar-col-full"><canvas id="pBilanAtt" style="max-height:280px"></canvas></div>`
    : `<div class="radar-grid">
         ${_pAttId ? `<div class="radar-col"><p class="radar-profil-title">⚡ Attaque</p><canvas id="pBilanAtt" style="width:100%"></canvas></div>` : ''}
         ${_pDefId ? `<div class="radar-col"><p class="radar-profil-title">🛡 Défense</p><canvas id="pBilanDef" style="width:100%"></canvas></div>` : ''}
       </div>`;

  const bilanChips = _pAllSessions.map((s, i) => {
    const c = _P_SESSION_COLORS[i];
    const sel = _pSelectedSessions.has(s.id);
    return `<button class="bilan-chip${sel ? ' active' : ''}" data-sid="${s.id}" onclick="pToggleSession('${s.id}')">
      <span style="width:8px;height:8px;border-radius:50%;background:${c.border};display:inline-block;flex-shrink:0"></span>
      ${escHtml(sessionShortLabel(s.idx, s.date))}
    </button>`;
  }).join('');

  const bilanCard = showBilan ? `
    <div class="card" style="margin-top:12px">
      <div class="card-body">
        <p class="section-title" style="margin-bottom:6px">Bilan — Progression</p>
        <p style="font-size:11px;color:var(--gray-400);margin-bottom:10px">👆 Sélectionne les sessions à comparer sur le radar</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">${bilanChips}</div>
        <div class="radar-toggle-row" style="margin-bottom:8px">
          <div></div>
          <div class="radar-view-toggle">
            <button class="radar-view-btn active" id="pToggleMoi" onclick="pSetViewMode('joueur')">Moi</button>
            <button class="radar-view-btn" id="pToggleStaff" onclick="pSetViewMode('staff')">Staff</button>
          </div>
        </div>
        ${bilanRadarHTML}
        <p style="font-size:11px;color:var(--gray-400);margin:8px 0 4px;text-align:center">📱 Passe en mode paysage pour une meilleure lisibilité des graphiques</p>
        <div id="pBarSection" style="margin-top:12px">
          ${_pAttId ? `<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:rgba(59,130,246,0.9);margin-bottom:4px">Progression Attaque</p><canvas id="pBarAtt"></canvas>` : ''}
          ${_pDefId ? `<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:rgba(234,88,12,0.9);margin-top:20px;margin-bottom:4px">Progression Défense</p><canvas id="pBarDef"></canvas>` : ''}
        </div>
        <div id="pTrendSection"></div>
      </div>
    </div>` : '';

  mc.innerHTML = `
    <div style="margin-bottom:16px">
      <div class="back-nav-inline" style="margin-bottom:0" onclick="showSessionsList()">← Sessions</div>
    </div>
    ${resultatsVisible ? `
    <div class="bandeau-entretien">
      <div class="bandeau-entretien-icon">📋</div>
      <div>
        <div class="bandeau-entretien-title">Prépare ton entretien</div>
        <div class="bandeau-entretien-desc">Tes résultats sont visibles. Analyse-les avant de rencontrer ton coach pour préparer au mieux votre discussion.</div>
      </div>
    </div>` : ''}
    <div class="card">
      <div class="card-body">
        <p class="section-title" style="margin-bottom:4px">Mes résultats</p>
        <p style="font-size:12px;color:var(--gray-400);margin-bottom:10px">${escHtml(label)}</p>
        <div style="display:flex;gap:12px;margin-bottom:10px;font-size:11px">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:rgba(59,130,246,0.8)"></div>Moi</div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:rgba(234,88,12,0.8)"></div>Staff</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">
          <span style="padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;background:#FEE2E2;color:#991B1B">1 · Fragile</span>
          <span style="padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;background:#FEF3C7;color:#92400E">2 · En travail</span>
          <span style="padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;background:#D1FAE5;color:#065F46">3 · Acquis</span>
          <span style="padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;background:#DBEAFE;color:#1E40AF">4 · Maîtrisé</span>
          <span style="padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;background:#EDE9FE;color:#5B21B6">5 · Référence</span>
        </div>
        ${sessionRadarHTML}
        ${pRecapTableHTML(_pAttId, _pEvalMap, _pIsGb ? '🧤 Gardien' : '⚡ Attaque')}
        ${_pDefId ? pRecapTableHTML(_pDefId, _pEvalMap, '🛡 Défense') : ''}
      </div>
    </div>
    <div id="pAxisDetail" style="display:none"></div>
    ${bilanCard}
    ${pBilanEntretienHTML(_pAttId, _pDefId, _pEvalMap, cr)}
    ${cr ? `
    <div class="card" style="margin-top:12px">
      <div class="card-body">
        <p class="section-title" style="margin-bottom:12px">Compte-rendu d'entretien ${cr.updated_at ? `<span style="font-weight:400;font-size:11px;color:var(--gray-400);text-transform:none;letter-spacing:0">(${new Date(cr.updated_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})})</span>` : ''}</p>
        ${cr.axes_att ? `
          <div class="cr-field-group cr-att">
            <p class="cr-section-label">⚔️ Axes prioritaires — Attaque</p>
            <p class="cr-text">${escHtml(cr.axes_att)}</p>
          </div>` : ''}
        ${cr.axes_def ? `
          <div class="cr-field-group cr-def">
            <p class="cr-section-label">🛡 Axes prioritaires — Défense</p>
            <p class="cr-text">${escHtml(cr.axes_def)}</p>
          </div>` : ''}
        ${cr.objectifs_ct ? `
          <div class="cr-field-group cr-ct">
            <p class="cr-section-label">🎯 Objectif court terme du joueur</p>
            <p class="cr-text">${escHtml(cr.objectifs_ct)}</p>
          </div>` : ''}
        ${cr.objectifs_mt ? `
          <div class="cr-field-group cr-mt">
            <p class="cr-section-label">🚀 Objectif moyen terme du joueur</p>
            <p class="cr-text">${escHtml(cr.objectifs_mt)}</p>
          </div>` : ''}
        ${cr.notes ? `
          <div class="cr-field-group cr-notes">
            <p class="cr-section-label">📝 Compte-rendu d'entretien</p>
            <p class="cr-text">${escHtml(cr.notes)}</p>
          </div>` : ''}
      </div>
    </div>` : ''}`;

  if (_pAttId) _pChartAtt = buildSessionRadar('pRadarAtt', _pAttId);
  if (_pDefId) _pChartDef = buildSessionRadar('pRadarDef', _pDefId);
  if (showBilan) { pRenderBilan(); pRenderTrendTable(); if (_pShowBar) pRenderBarChart(); }
}

function showPlayerAxisDetail(profilId, axeId) {
  const axe = CRITERIA[profilId]?.axes[axeId];
  if (!axe) return;

  document.querySelectorAll('.recap-row').forEach(r => r.classList.remove('active'));
  document.querySelectorAll('.recap-theme-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.recap-row[data-recap="${profilId}-${axeId}"]`).forEach(r => {
    r.classList.add('active');
    r.querySelector('.recap-theme-btn')?.classList.add('active');
  });

  const rows = axe.criteres.map(c => {
    const nj = _pEvalMap[c.id]?.note_joueur || 0;
    const ns = _pEvalMap[c.id]?.note_staff  || 0;
    return `
      <div class="cc-row">
        <div class="cc-info">
          <div class="cc-label">${escHtml(c.label)}</div>
          <div class="cc-texte">${escHtml(c.texte)}</div>
        </div>
        <div class="cc-scores">
          <div class="cc-score-col">
            <span class="cc-who">Moi</span>
            <div class="cc-pastille ${nj ? 'n'+nj : 'empty'}"></div>
            <span class="cc-score-name" style="color:${nj ? 'var(--n'+nj+'-text)' : 'var(--gray-400)'}">
              ${nj ? _P_LABELS[nj] : '—'}
            </span>
          </div>
          <div class="cc-score-col">
            <span class="cc-who">Staff</span>
            <div class="cc-pastille ${ns ? 'n'+ns : 'empty'}"></div>
            <span class="cc-score-name" style="color:${ns ? 'var(--n'+ns+'-text)' : 'var(--gray-400)'}">
              ${ns ? _P_LABELS[ns] : '—'}
            </span>
          </div>
          <div class="cc-score-col">
            <span class="cc-who">Écart</span>
            <div style="height:32px;display:flex;align-items:center;justify-content:center">${deltaHTML(nj, ns)}</div>
            <span class="cc-score-name" style="color:var(--gray-400)"> </span>
          </div>
        </div>
      </div>`;
  }).join('');

  const detailEl = pgid('pAxisDetail');
  detailEl.style.display = 'block';
  detailEl.innerHTML = `
    <div class="card" style="margin-top:12px">
      <div class="card-body">
        <p class="section-title" style="margin-bottom:10px">${escHtml(axe.label)}</p>
        ${noteLegendHTML()}
        ${rows}
      </div>
    </div>`;
  detailEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function showToast(msg) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:calc(24px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);background:var(--gray-800);color:var(--white);padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;z-index:999;white-space:nowrap;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.2)';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showPlayerTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab)?.classList.add('active');
  const mc = document.getElementById('mainContent');
  const sp = document.getElementById('spSuiviContent');
  if (tab === 'sessions') {
    if (mc) mc.style.display = '';
    if (sp) sp.style.display = 'none';
  } else if (tab === 'suivi') {
    if (mc) mc.style.display = 'none';
    if (sp) { sp.style.display = ''; renderSuiviSocioPro(window._spPlayerAuthId); }
  }
}
