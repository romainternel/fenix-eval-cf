/* ─── FENIX Eval CF — Coach Dashboard ────────────────────────────────────────
   STORY 04 : Gestion des joueurs (liste, création, édition)
   STORY 05 stub : Sessions
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

/* ═══════════════════════════════════════════════ SESSIONS — stub STORY 05 */
async function renderSessions() {
  gid('mainContent').innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Sessions d'évaluation</h2>
      <button class="btn btn-primary btn-sm" onclick="showCreateSessionModal()">+ Nouvelle</button>
    </div>
    <p class="section-saison">Saison ${currentSaison()}</p>
    <div class="empty-state">
      <div class="empty-state-icon">📅</div>
      <p>Aucune session pour le moment.<br>Story 05 à venir.</p>
    </div>`;
}

function showCreateSessionModal() {
  showToast('Création de sessions — Story 05 à venir');
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
          <label class="form-label">Email <span class="form-sub">(pour la connexion joueur)</span></label>
          <input class="form-input" name="email" type="email" autocomplete="email">
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
