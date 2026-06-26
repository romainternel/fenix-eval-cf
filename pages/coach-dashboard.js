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
        <p class="section-title" style="margin-bottom:10px">Résultats des évaluations</p>
        <div class="empty-state" style="padding:20px">
          <p>Tableau de bord joueurs — Story 08 à venir</p>
        </div>
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
  if (!window.confirm(`Supprimer ${nomComplet} ?\n\nCela supprimera aussi ses évaluations et profils.\nCette action est irréversible.`)) return;

  try {
    // Supprimer dans l'ordre pour respecter les FK
    await window.supabaseClient.from('evaluations').delete().eq('player_id', playerId);
    await window.supabaseClient.from('entretiens').delete().eq('player_id', playerId);
    await window.supabaseClient.from('player_profiles').delete().eq('player_id', playerId);
    await window.supabaseClient.from('user_profiles').update({ player_id: null }).eq('player_id', playerId);
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
