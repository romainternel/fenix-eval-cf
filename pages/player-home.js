/* ─── FENIX Eval CF — Player Home (STORY 06) ─────────────────────────────── */

function pgid(id) { return document.getElementById(id); }

let _playerUser    = null;
let _playerId      = null;
let _playerName    = '';
let _playerProfile = null;   // { profil_att, profil_def, profil_gb }
let _currentSession = null;
let _ratings       = {};     // { critere_id: note_joueur }
let _saving        = {};     // { critere_id: true }

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

/* ── Ouverture d'une session ──────────────────────────────────────────────── */
async function showEvaluation(sessionId) {
  _currentSession = sessionId;
  pgid('mainContent').innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  // Charger les notes déjà saisies
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
  const profil  = CRITERIA[profilId];
  if (!profil) return;

  const axeIds  = Object.keys(profil.axes);
  const firstAxe = axeIds[0];
  const type    = profil.type;

  pgid('evalContent').innerHTML = `
    <div class="axes-eval-nav">
      ${axeIds.map((axeId, i) => `
        <button class="btn-axe-eval ${type} ${i === 0 ? 'active' : ''}"
                id="axeBtn-${axeId}"
                onclick="showAxeCriteres('${profilId}', '${axeId}', '${sessionId}', this)">
          ${profil.axes[axeId].label}
        </button>`).join('')}
    </div>
    <div id="criteresContent"></div>`;

  showAxeCriteres(profilId, firstAxe, sessionId, pgid('axeBtn-' + firstAxe));
}

/* ── Critères d'un axe ────────────────────────────────────────────────────── */
function showAxeCriteres(profilId, axeId, sessionId, btnEl) {
  document.querySelectorAll('.btn-axe-eval').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

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
              <button class="rating-btn ${note === n ? 'selected' : ''}" data-n="${n}"
                onclick="saveRating('${sessionId}','${profilId}','${c.id}',${n},this)">
                ${n}
              </button>`).join('')}
          </div>
          <div class="rating-labels"><span>Fragile</span><span>Référence</span></div>
          <div class="save-status" id="status-${c.id}"></div>
        </div>
      </div>`;
  }).join('');
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

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
