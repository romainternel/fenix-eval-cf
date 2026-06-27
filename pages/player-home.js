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

/* ── Liste des sessions ouvertes ──────────────────────────────────────────── */
async function showSessionsList() {
  _currentSession = null;
  const mc = pgid('mainContent');
  mc.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const { data: sessions } = await window.supabaseClient
    .from('sessions').select('*').eq('statut', 'ouvert')
    .order('date_session', { ascending: false });

  const liste = sessions || [];

  mc.innerHTML = `
    <p class="player-greeting">Bonjour ${escHtml(_playerName)} 👋</p>
    <p class="section-saison">Saison ${currentSaison()}</p>
    <h2 class="section-title" style="margin-bottom:12px">Sessions ouvertes</h2>
    ${liste.length === 0
      ? `<div class="empty-state">
           <div class="empty-state-icon">📋</div>
           <p>Aucune session ouverte.<br>Votre coach vous préviendra dès qu'une évaluation sera disponible.</p>
         </div>`
      : liste.map(s => `
          <div class="session-card open" onclick="showEvaluation('${s.id}')">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span class="session-badge-open">OUVERT</span>
              <span style="font-size:12px;color:var(--gray-400)">${formatDateShort(s.date_session)}</span>
            </div>
            <div style="font-size:16px;font-weight:700;color:var(--gray-800);margin-bottom:4px">${escHtml(s.label)}</div>
            <div style="font-size:11px;color:var(--gray-400);font-family:monospace">${s.id}</div>
          </div>`).join('')
    }`;
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
  showToast('Profil enregistré !');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
