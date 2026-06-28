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
  // Si on vient de finir l'ATT et qu'il y a un DEF → passer au DEF
  if (_playerProfile && _playerProfile.profil_att === _swipeProfilId && _playerProfile.profil_def) {
    showToast('Attaque terminée ! Passe à la Défense.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => switchProfilTab('def'), 600);
    return;
  }
  // DEF ou GB → retour aux sessions
  showToast('Évaluation envoyée !');
  setTimeout(() => showSessionsList(), 1500);
}

/* ── STORY 09 — Radar joueur ──────────────────────────────────────────────── */
let _pEvalMap = {}, _pChartAtt = null, _pChartDef = null;
const _P_LABELS = { 1:'Fragile', 2:'En travail', 3:'Acquis', 4:'Maîtrisé', 5:'Référence' };

async function showPlayerRadar(sessionId) {
  if (_pChartAtt) { _pChartAtt.destroy(); _pChartAtt = null; }
  if (_pChartDef) { _pChartDef.destroy(); _pChartDef = null; }

  const mc = pgid('mainContent');
  mc.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;

  const [sessionRes, evalsRes] = await Promise.all([
    window.supabaseClient.from('sessions').select('label').eq('id', sessionId).single(),
    window.supabaseClient.from('evaluations').select('critere_id, note_joueur, note_staff')
      .eq('session_id', sessionId).eq('player_id', _playerId)
  ]);

  const label = sessionRes.data?.label || sessionId;
  _pEvalMap = {};
  (evalsRes.data || []).forEach(e => { _pEvalMap[e.critere_id] = e; });

  function pWrapLabel(s) {
    if (!s.includes(' & ')) return s;
    const [a, ...rest] = s.split(' & ');
    return [a, '& ' + rest.join(' & ')];
  }

  function pRadarData(profilId) {
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
    return { labels, joueur, staff };
  }

  function pBuildRadar(canvasId, rd, small) {
    const ctx = pgid(canvasId)?.getContext('2d');
    if (!ctx || !rd) return null;
    return new Chart(ctx, {
      type: 'radar',
      data: {
        labels: rd.labels,
        datasets: [
          { data:rd.joueur, backgroundColor:'rgba(59,130,246,0.15)', borderColor:'rgba(59,130,246,0.8)', pointBackgroundColor:'rgba(59,130,246,0.8)', borderWidth:1.5, pointRadius: small ? 2 : 4 },
          { data:rd.staff,  backgroundColor:'rgba(234,88,12,0.15)',  borderColor:'rgba(234,88,12,0.8)',  pointBackgroundColor:'rgba(234,88,12,0.8)',  borderWidth:1.5, pointRadius: small ? 2 : 4 }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:true, aspectRatio:1,
        plugins:{ legend:{ display:false } },
        scales:{ r:{ min:0, max:5,
          ticks:{ stepSize:1, font:{ size: small ? 7 : 10 }, display:!small },
          pointLabels:{ font:{ size: small ? 8 : 11, weight:'600' } },
          grid:{ color:'rgba(0,0,0,0.08)' }
        }}
      }
    });
  }

  function pAxesBtns(profilId) {
    const profil = CRITERIA[profilId];
    if (!profil) return '';
    return Object.entries(profil.axes).map(([axeId, axe]) =>
      `<button class="radar-axe-btn" id="praxe-${profilId}-${axeId}"
        onclick="showPlayerAxisDetail('${profilId}','${axeId}')">${escHtml(axe.label)}</button>`
    ).join('');
  }

  const isGb  = !!_playerProfile?.profil_gb;
  const attId = isGb ? _playerProfile.profil_gb : _playerProfile?.profil_att;
  const defId = isGb ? null : _playerProfile?.profil_def;

  const radarHTML = isGb
    ? `<div class="radar-col-full">
         <p class="radar-profil-title">🧤 Gardien</p>
         <canvas id="pRadarAtt" style="max-height:280px"></canvas>
         <div class="radar-axes-btns">${pAxesBtns(attId)}</div>
       </div>`
    : `<div class="radar-grid">
         ${attId ? `<div class="radar-col">
           <p class="radar-profil-title">⚡ Attaque</p>
           <canvas id="pRadarAtt" style="width:100%"></canvas>
           <div class="radar-axes-btns">${pAxesBtns(attId)}</div>
         </div>` : ''}
         ${defId ? `<div class="radar-col">
           <p class="radar-profil-title">🛡 Défense</p>
           <canvas id="pRadarDef" style="width:100%"></canvas>
           <div class="radar-axes-btns">${pAxesBtns(defId)}</div>
         </div>` : ''}
       </div>`;

  mc.innerHTML = `
    <div class="back-nav-inline" onclick="showSessionsList()">← Sessions</div>
    <div class="card">
      <div class="card-body">
        <p class="section-title" style="margin-bottom:4px">Mes résultats</p>
        <p style="font-size:12px;color:var(--gray-400);margin-bottom:10px">${escHtml(label)}</p>
        <div style="display:flex;gap:12px;margin-bottom:10px;font-size:11px">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:rgba(59,130,246,0.8)"></div>Moi</div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:rgba(234,88,12,0.8)"></div>Staff</div>
        </div>
        ${radarHTML}
        <p style="font-size:11px;color:var(--gray-400);text-align:center;margin-top:10px">Clique sur un thème pour voir le détail ↓</p>
      </div>
    </div>
    <div id="pAxisDetail" style="display:none"></div>`;

  if (attId) _pChartAtt = pBuildRadar('pRadarAtt', pRadarData(attId), !isGb);
  if (defId) _pChartDef = pBuildRadar('pRadarDef', pRadarData(defId), true);
}

function showPlayerAxisDetail(profilId, axeId) {
  const axe = CRITERIA[profilId]?.axes[axeId];
  if (!axe) return;

  document.querySelectorAll('.radar-axe-btn').forEach(b => b.classList.remove('active'));
  pgid(`praxe-${profilId}-${axeId}`)?.classList.add('active');

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
        </div>
      </div>`;
  }).join('');

  const detailEl = pgid('pAxisDetail');
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
