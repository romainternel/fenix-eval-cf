/* ─── FENIX Socio-Pro — Dashboard Cellule ────────────────────────────────── */

const sgid = id => document.getElementById(id);
const spDB = () => window.supabaseClient;

// ── State ─────────────────────────────────────────────────────────────────
let _spUser          = null;
let _spRole          = 'referent_sociopro';
let _spJoueurs       = [];
let _spCurrent       = null;
let _spProfil        = null;
let _spOrients       = [];
let _spEntretiens    = [];
let _spColor         = null;
let _spFilterRef     = 'tous';
let _spReunionIdx    = 0;
let _spReunionJoueurs = [];
let _spActions       = [];
let _spBandeauHTML   = '';

// ── Entry point ───────────────────────────────────────────────────────────
async function initSocioPro(user) {
  _spUser = user;
  _spRole = window._spRole || 'referent_sociopro';

  if (_spRole === 'coach') {
    const nav = document.querySelector('nav');
    if (nav) {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.style.cssText = 'margin-left:auto;color:#9E9A90;font-size:12px';
      btn.textContent = '← Dashboard coach';
      btn.onclick = () => window.location.href = 'coach.html';
      nav.appendChild(btn);
    }
  }

  spNavActive('liste');
  await spLoadJoueurs();
  spRenderListe();
}

// ── Navigation ────────────────────────────────────────────────────────────
function spNavActive(tab) {
  document.querySelectorAll('.sp-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

function spShowTab(tab) {
  spNavActive(tab);
  if (tab === 'liste')   { spRenderListe(); }
  if (tab === 'reunion') { spRenderReunion(); }
}

function spMain() { return sgid('spMain'); }

// ── Data loading ──────────────────────────────────────────────────────────
async function spLoadJoueurs() {
  const db = spDB();
  const [{ data: players }, { data: upProfiles }] = await Promise.all([
    db.from('players').select('id, nom, prenom, email').eq('actif', true).order('nom'),
    db.from('user_profiles').select('id, player_id').eq('role', 'joueur')
  ]);

  const authIdMap = {};
  (upProfiles || []).forEach(up => { if (up.player_id) authIdMap[up.player_id] = up.id; });
  const authIds = Object.values(authIdMap).filter(Boolean);

  if (!authIds.length) { _spJoueurs = []; return; }

  const [{ data: profils }, { data: entretiens }, { data: orients }] = await Promise.all([
    db.from('ssp_profils').select('*').in('joueur_id', authIds),
    db.from('ssp_entretiens').select('joueur_id, id, date, couleur, couleur_justification, actions_suivant').in('joueur_id', authIds).order('date', { ascending: false }),
    db.from('ssp_orientations').select('joueur_id').in('joueur_id', authIds)
  ]);

  const profilMap = {}, lastMap = {}, orientCount = {};
  (profils    || []).forEach(p => { profilMap[p.joueur_id] = p; });
  (entretiens || []).forEach(e => { if (!lastMap[e.joueur_id]) lastMap[e.joueur_id] = e; });
  (orients    || []).forEach(o => { orientCount[o.joueur_id] = (orientCount[o.joueur_id] || 0) + 1; });

  _spJoueurs = (players || []).map(p => ({
    ...p,
    authId:          authIdMap[p.id],
    profil:          authIdMap[p.id] ? (profilMap[authIdMap[p.id]] || null)  : null,
    lastEntretien:   authIdMap[p.id] ? (lastMap[authIdMap[p.id]]   || null)  : null,
    orientationCount: authIdMap[p.id] ? (orientCount[authIdMap[p.id]] || 0)  : 0,
  }));
}

async function spLoadJoueurDetail(joueur) {
  if (!joueur.authId) return;
  const db = spDB();
  const [{ data: profil }, { data: orients }, { data: entretiens }] = await Promise.all([
    db.from('ssp_profils').select('*').eq('joueur_id', joueur.authId).maybeSingle(),
    db.from('ssp_orientations').select('*').eq('joueur_id', joueur.authId).order('date_changement', { ascending: false }),
    db.from('ssp_entretiens').select('*').eq('joueur_id', joueur.authId).order('date', { ascending: false })
  ]);
  _spProfil     = profil;
  _spOrients    = orients    || [];
  _spEntretiens = entretiens || [];
}

// ── VUE 1 — Liste joueurs ─────────────────────────────────────────────────
function spRenderListe() {
  const filtered = _spFilterRef === 'tous'
    ? _spJoueurs
    : _spJoueurs.filter(j => j.profil?.referent === _spFilterRef);

  const rows = filtered.map(j => {
    const profil = j.profil;
    const last   = j.lastEntretien;
    const dot    = last?.couleur ? SP_COULEURS[last.couleur].dot : '#9E9A90';
    const retard = !last && true || spWeeksAgo(last?.date) > 5;
    const badges = [
      j.orientationCount > 0 ? `<span class="sp-badge sp-badge-amber">Orientation modifiée</span>` : '',
      !last           ? `<span class="sp-badge sp-badge-gray">Pas encore d'entretien</span>` : '',
      last && retard  ? `<span class="sp-badge sp-badge-red">Entretien en retard</span>` : ''
    ].filter(Boolean).join('');

    const sub = [
      profil?.formation || '—',
      profil?.referent  || 'Sans référent',
      last ? spDateShort(last.date) : 'Aucun entretien'
    ].join(' · ');

    return `
    <div class="sp-joueur-row">
      <div style="position:relative;flex-shrink:0">
        <div class="sp-avatar">${spInitials(j.nom, j.prenom)}</div>
        <span class="sp-dot" style="background:${dot};position:absolute;bottom:0;right:0;border:2px solid white;width:12px;height:12px;border-radius:50%"></span>
      </div>
      <div class="sp-joueur-info">
        <div class="sp-joueur-name">${spEsc(j.prenom)} ${spEsc(j.nom)}</div>
        <div class="sp-joueur-sub">${spEsc(sub)}</div>
        ${badges ? `<div class="sp-joueur-badges">${badges}</div>` : ''}
      </div>
      <div class="sp-btn-actions">
        <button class="sp-btn" onclick="spOpenFiche('${j.id}')">Voir</button>
        <button class="sp-btn sp-btn-primary" onclick="spOpenEntretien('${j.id}')">Entretien</button>
      </div>
    </div>`;
  }).join('');

  spMain().innerHTML = `
    <div class="sp-topbar">
      <select class="sp-select" onchange="spSetFilter(this.value)">
        <option value="tous">Tous les référents</option>
        ${SP_REFERENTS.map(r => `<option value="${spEsc(r)}" ${_spFilterRef===r?'selected':''}>${spEsc(r)}</option>`).join('')}
      </select>
    </div>
    <div class="sp-card">${rows || '<p style="padding:16px;color:#9E9A90;font-size:13px">Aucun joueur</p>'}</div>`;
}

function spSetFilter(val) { _spFilterRef = val; spRenderListe(); }

// ── VUE 2 — Fiche profil ─────────────────────────────────────────────────
function spEntretienItemHTML(e, i) {
  const ci      = e.couleur ? SP_COULEURS[e.couleur] : null;
  const actions = Array.isArray(e.actions_suivant) ? e.actions_suivant : JSON.parse(e.actions_suivant||'[]');
  const examens = Array.isArray(e.examens)          ? e.examens          : JSON.parse(e.examens||'[]');
  const detailId = `ent-detail-${i}`;
  const bg = i % 2 === 0 ? '#F7F5F0' : 'transparent';

  const summaryLines = [
    e.mot_du_joueur    ? `<div style="font-style:italic;color:#633806;margin-bottom:2px">"${spEsc(e.mot_du_joueur)}"</div>` : '',
    e.ce_qui_va        ? `<div><span style="color:#27500A">(+) </span>${spEsc(e.ce_qui_va)}</div>` : '',
    e.ce_qui_ne_va_pas ? `<div><span style="color:#791F1F">(!) </span>${spEsc(e.ce_qui_ne_va_pas)}</div>` : '',
  ].filter(Boolean).join('');

  const detailLines = [
    ci ? `<div class="sp-couleur-recap" style="background:${ci.bg};border:.5px solid ${ci.border};margin-bottom:8px">
            <span style="background:${ci.dot};width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0;margin-top:3px"></span>
            <div><div style="font-size:11px;font-weight:600;color:${ci.text}">${ci.label}</div>
            <div style="font-size:12px;color:${ci.text}">${spEsc(e.couleur_justification||'')}</div></div>
          </div>` : '',
    e.mot_du_joueur    ? `<div class="sp-detail-lbl">Mot du joueur</div><div class="sp-detail-val" style="font-style:italic">"${spEsc(e.mot_du_joueur)}"</div>` : '',
    e.ce_qui_va        ? `<div class="sp-detail-lbl">(+) Ce qui va</div><div class="sp-detail-val">${spEsc(e.ce_qui_va)}</div>` : '',
    e.ce_qui_ne_va_pas ? `<div class="sp-detail-lbl">(!) Ce qui ne va pas</div><div class="sp-detail-val">${spEsc(e.ce_qui_ne_va_pas)}</div>` : '',
    e.echeances        ? `<div class="sp-detail-lbl">Echéances</div><div class="sp-detail-val">${spEsc(e.echeances)}</div>` : '',
    e.comment_aider    ? `<div class="sp-detail-lbl">Comment l'aider</div><div class="sp-detail-val">${spEsc(e.comment_aider)}</div>` : '',
    actions.length     ? `<div class="sp-detail-lbl">Actions suivantes</div><div class="sp-detail-val">${actions.map(a => '• ' + spEsc(a)).join('<br>')}</div>` : '',
    examens.length     ? `<div class="sp-detail-lbl">Examens</div><div class="sp-detail-val">${examens.map(ex => spEsc(ex.matiere) + ' : ' + spEsc(ex.note) + (ex.tendance ? ' (' + spEsc(ex.tendance) + ')' : '')).join('<br>')}${e.commentaire_examens ? '<br><em>' + spEsc(e.commentaire_examens) + '</em>' : ''}</div>` : '',
    e.notes_cellule    ? `<div class="sp-detail-lbl">[Conf.] Notes cellule</div><div class="sp-detail-val" style="background:#F7F5F0;padding:6px 8px;border-radius:6px;font-style:italic">${spEsc(e.notes_cellule)}</div>` : '',
  ].filter(Boolean).join('');

  return `
    <div style="border-bottom:.5px solid #E0DDD6;background:${bg}">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 6px;cursor:pointer" onclick="spToggle('${detailId}');this.querySelector('.sp-chev').classList.toggle('open')">
        <span style="background:${ci?.dot||'#9E9A90'};width:10px;height:10px;border-radius:50%;flex-shrink:0;display:inline-block"></span>
        <div style="flex:1;min-width:0">
          <div><strong style="font-size:12px">${spDateFR(e.date)}</strong><span style="font-size:12px;color:#9E9A90"> — ${spEsc(e.mene_par||'—')}</span></div>
          <div style="font-size:11px;color:#9E9A90;margin-top:2px">${summaryLines}</div>
        </div>
        <span class="sp-chev" style="font-size:11px;flex-shrink:0">▼</span>
      </div>
      <div id="${detailId}" style="display:none;padding:0 6px 10px 24px">
        ${detailLines || '<div style="font-size:12px;color:#9E9A90;padding:4px 0">Aucun détail renseigné.</div>'}
        <button class="sp-delete-btn" onclick="spDeleteEntretien('${e.id}','${spDateFR(e.date)}')">Supprimer cet entretien ×</button>
      </div>
    </div>`;
}

async function spOpenFiche(playerId) {
  const joueur = _spJoueurs.find(j => j.id === playerId);
  if (!joueur) return;
  _spCurrent = joueur;
  spMain().innerHTML = `<div class="sp-loading"><div class="spinner"></div></div>`;
  await spLoadJoueurDetail(joueur);
  spRenderFiche();
}

function spRenderFiche() {
  const j = _spCurrent;
  const p = _spProfil || {};
  const c = p.contrat_scolarite || 'a_jour';
  const contratInfo = SP_CONTRATS[c] || SP_CONTRATS.a_jour;

  const orientBox = _spOrients.length
    ? `<div class="sp-orient-box">
        🕐 <strong>Orientation d'entrée au CF</strong> — ${spEsc(_spOrients[_spOrients.length-1]?.formation || '—')}
        (${spDateShort(_spOrients[_spOrients.length-1]?.date_changement)})<br>
        <span style="opacity:.8">${_spOrients.length} changement${_spOrients.length>1?'s':''} depuis l'arrivée</span>
       </div>` : '';

  const histOrients = _spOrients.length ? `
    <div class="sp-accordion" onclick="spToggle('acc-orients')">
      <span>📂 Orientations précédentes (${_spOrients.length})</span><span class="sp-chev">▼</span>
    </div>
    <div id="acc-orients" style="display:none;padding:10px 0 4px">
      ${_spOrients.map(o => `<div style="font-size:12px;padding:5px 0;border-bottom:.5px solid #E0DDD6">
        <strong>${spEsc(o.formation||'—')}</strong> — ${spEsc(o.projet_pro||'—')} · ${spDateFR(o.date_changement)}
        ${o.note ? `<div style="color:#9E9A90;margin-top:2px">${spEsc(o.note)}</div>` : ''}
      </div>`).join('')}
    </div>` : '';

  const histEntretiens = _spEntretiens.length ? `
    <div class="sp-accordion" onclick="spToggle('acc-entretiens')">
      <span>Historique entretiens (${_spEntretiens.length})</span><span class="sp-chev">▼</span>
    </div>
    <div id="acc-entretiens" style="display:none;padding:8px 0">
      ${_spEntretiens.map((e, i) => spEntretienItemHTML(e, i)).join('')}
    </div>` : '';

  spMain().innerHTML = `
    <button class="sp-back" onclick="spRetourListe()">← Retour</button>
    <div class="sp-card">
      <div class="sp-hdr">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="sp-avatar">${spInitials(j.nom, j.prenom)}</div>
          <div>
            <div style="font-size:15px;font-weight:500;color:white">${spEsc(j.prenom)} ${spEsc(j.nom)}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.55)">${spEsc(j.email||'')}</div>
          </div>
        </div>
        <button class="sp-btn sp-btn-primary" onclick="spOpenEntretien('${j.id}')">+ Entretien</button>
      </div>

      <div class="sp-sec">
        <div class="sp-sec-lbl">✏️ Profil socio-professionnel</div>
        <div class="sp-field"><label>Formation suivie</label>
          <input id="fp-formation" type="text" value="${spEsc(p.formation||'')}" placeholder="Ex : BTS Management..."></div>
        <div class="sp-field"><label>Projet professionnel</label>
          <input id="fp-projet" type="text" value="${spEsc(p.projet_pro||'')}" placeholder="Ex : Management sportif..."></div>
        <div class="sp-row2">
          <div class="sp-field"><label>Référent SHN</label>
            <select id="fp-referent">
              <option value="">—</option>
              ${SP_REFERENTS.map(r => `<option value="${spEsc(r)}" ${p.referent===r?'selected':''}>${spEsc(r)}</option>`).join('')}
            </select></div>
          <div class="sp-field"><label>Contrat scolarité</label>
            <select id="fp-contrat">
              <option value="a_jour"    ${c==='a_jour'   ?'selected':''}>À jour</option>
              <option value="en_cours"  ${c==='en_cours' ?'selected':''}>En cours</option>
              <option value="non_signe" ${c==='non_signe'?'selected':''}>Non signé</option>
            </select></div>
        </div>
        <div class="sp-field"><label>Tuteur (nom + structure)</label>
          <input id="fp-tuteur" type="text" value="${spEsc(p.tuteur||'')}" placeholder="Ex : M. Bertrand — Lycée Ozenne"></div>
        <div class="sp-field"><label>Lien dossier Google Drive</label>
          <input id="fp-drive" type="url" value="${spEsc(p.lien_drive||'')}" placeholder="https://drive.google.com/..."></div>
        <div class="sp-field"><label>Notes profil</label>
          <textarea id="fp-notes" rows="3">${spEsc(p.notes_profil||'')}</textarea></div>
        ${orientBox}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          ${p.lien_drive ? `<button class="sp-drive-btn" onclick="window.open('${spEsc(p.lien_drive)}','_blank')">🗂 Ouvrir le dossier Drive ↗</button>` : ''}
          <button class="sp-btn sp-btn-primary" onclick="spSaveProfil()">Enregistrer le profil</button>
          <button class="sp-btn" onclick="spExportEntretiensMd()">⬇ Export .md</button>
          <button class="sp-btn" onclick="spExportEntretiensPdf()">⬇ Export PDF</button>
        </div>
        <div id="fp-msg" style="font-size:12px;color:#27500A;margin-top:6px;display:none">✓ Profil enregistré</div>
      </div>

      ${histOrients ? `<div class="sp-sec">${histOrients}</div>` : ''}
      ${histEntretiens ? `<div class="sp-sec">${histEntretiens}</div>` : ''}
    </div>`;
}

async function spSaveProfil() {
  const j = _spCurrent;
  if (!j?.authId) return;
  const db = spDB();
  const newFormation = sgid('fp-formation')?.value || '';
  const newProjet    = sgid('fp-projet')?.value    || '';

  // Règle orientation : si formation ou projet_pro change → insérer l'ancienne valeur dans ssp_orientations
  const oldFormation = _spProfil?.formation || '';
  const oldProjet    = _spProfil?.projet_pro || '';
  if (_spProfil && (newFormation !== oldFormation || newProjet !== oldProjet)) {
    await db.from('ssp_orientations').insert({
      joueur_id:       j.authId,
      date_changement: spTodayISO(),
      formation:       oldFormation || null,
      projet_pro:      oldProjet    || null,
    });
  }

  const payload = {
    joueur_id:         j.authId,
    formation:         newFormation         || null,
    projet_pro:        newProjet            || null,
    referent:          sgid('fp-referent')?.value || null,
    contrat_scolarite: sgid('fp-contrat')?.value  || 'a_jour',
    tuteur:            sgid('fp-tuteur')?.value   || null,
    lien_drive:        sgid('fp-drive')?.value    || null,
    notes_profil:      sgid('fp-notes')?.value    || null,
    updated_at:        new Date().toISOString(),
  };

  const { error } = _spProfil
    ? await db.from('ssp_profils').update(payload).eq('joueur_id', j.authId)
    : await db.from('ssp_profils').insert(payload);

  if (!error) {
    const msg = sgid('fp-msg');
    if (msg) { msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 2500); }
    await spLoadJoueurDetail(j);
    await spLoadJoueurs();
  }
}

async function spDeleteEntretien(entretienId, dateLabel) {
  if (!_spCurrent) return;
  if (!confirm(`Supprimer l'entretien du ${dateLabel} ? Cette action est irréversible.`)) return;
  const { error } = await spDB().from('ssp_entretiens').delete().eq('id', entretienId);
  if (error) { alert('Erreur : ' + error.message); return; }
  await spLoadJoueurDetail(_spCurrent);
  spRenderFiche();
}

// ── VUE 3 — Fiche entretien ───────────────────────────────────────────────
async function spOpenEntretien(playerId) {
  const joueur = _spJoueurs.find(j => j.id === playerId);
  if (!joueur) return;
  _spCurrent = joueur;
  _spColor   = null;
  spMain().innerHTML = `<div class="sp-loading"><div class="spinner"></div></div>`;
  await spLoadJoueurDetail(joueur);
  spRenderEntretien();
}

function spRenderEntretien() {
  const j    = _spCurrent;
  const p    = _spProfil || {};
  const prev = _spEntretiens[0] || null;
  const c    = p.contrat_scolarite || 'a_jour';
  const ci   = SP_CONTRATS[c] || SP_CONTRATS.a_jour;

  // Section A — Profil lecture seule
  const orientBox = _spOrients.length
    ? `<div class="sp-orient-box">🕐 <strong>Orientation d'entrée au CF</strong> — ${spEsc(_spOrients[_spOrients.length-1]?.formation||'—')} · ${spDateShort(_spOrients[_spOrients.length-1]?.date_changement)}<br>
       <span style="opacity:.8">${_spOrients.length} changement${_spOrients.length>1?'s':''}</span></div>` : '';

  const sectionA = `
    <div class="sp-sec">
      <div class="sp-sec-lbl">📋 Profil — lecture seule</div>
      <div class="sp-grid2">
        <span>Formation</span><strong>${spEsc(p.formation||'—')}</strong>
        <span>Projet pro</span><strong>${spEsc(p.projet_pro||'—')}</strong>
        <span>Référent SHN</span><strong>${spEsc(p.referent||'—')}</strong>
        <span>Tuteur</span><strong>${spEsc(p.tuteur||'—')}</strong>
        <span>Contrat</span><strong><span class="sp-badge-sm" style="background:${ci.bg};color:${ci.color}">${ci.label}</span></strong>
      </div>
      ${orientBox}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        ${p.lien_drive ? `<button class="sp-drive-btn" onclick="window.open('${spEsc(p.lien_drive)}','_blank')">🗂 Drive ↗</button>` : ''}
        <button class="sp-btn" onclick="spOpenFiche('${j.id}')">✏️ Modifier le profil</button>
      </div>
    </div>`;

  // Section B — Reprise
  let sectionB;
  if (!prev) {
    sectionB = `<div class="sp-sec sp-sec-alt">
      <div class="sp-sec-lbl">↩ Reprise</div>
      <p style="font-size:13px;color:#9E9A90">Premier entretien — pas de reprise.</p>
    </div>`;
  } else {
    const prevCouleur = prev.couleur ? SP_COULEURS[prev.couleur] : null;
    const prevActions = Array.isArray(prev.actions_suivant) ? prev.actions_suivant : (typeof prev.actions_suivant === 'string' ? JSON.parse(prev.actions_suivant||'[]') : []);
    const repriseItems = prevActions.map((a, i) => `
      <div class="sp-reprise-item">
        <select class="sp-status-sel" id="reprise-status-${i}">
          <option value="fait">✓ Fait</option>
          <option value="en_cours">~ En cours</option>
          <option value="non_fait">✗ Non fait</option>
        </select>
        <div style="flex:1;font-size:13px;padding:6px 8px;background:#F7F5F0;border-radius:6px">${spEsc(a)}</div>
      </div>`).join('');

    sectionB = `<div class="sp-sec sp-sec-alt" data-prev-id="${prev.id}">
      <div class="sp-sec-lbl">↩ Reprise — entretien du ${spDateFR(prev.date)}</div>
      ${prevCouleur ? `<div class="sp-couleur-recap" style="background:${prevCouleur.bg};border:.5px solid ${prevCouleur.border}">
        <span class="sp-dot" style="background:${prevCouleur.dot};width:10px;height:10px;border-radius:50%;margin-top:3px;flex-shrink:0"></span>
        <div><div style="font-size:11px;font-weight:600;color:${prevCouleur.text};margin-bottom:3px">${prevCouleur.label} le mois dernier</div>
        <div style="font-size:12px;color:${prevCouleur.text}">${spEsc(prev.couleur_justification||'')}</div></div>
      </div>` : ''}
      ${prevActions.length ? `<div class="sp-actions-lbl">Ce qu'il devait faire</div>${repriseItems}` : '<p style="font-size:13px;color:#9E9A90">Aucune action définie ce mois-là.</p>'}
    </div>`;
  }

  // Section C — Entretien du jour
  const membreOptions = SP_MEMBRES.map(m => `<option value="${spEsc(m)}">${spEsc(m)}</option>`).join('');

  const sectionC = `
    <div class="sp-sec">
      <div class="sp-sec-lbl">✏️ Entretien du jour</div>
      <div class="sp-row2">
        <div class="sp-field"><label>Date</label><input id="ej-date" type="date" value="${spTodayISO()}"></div>
        <div class="sp-field"><label>Mené par</label><select id="ej-menePar">${membreOptions}</select></div>
      </div>
      <div class="sp-mot-box">
        <label>💬 Mot du joueur — avant de commencer, comment il se sent ?</label>
        <textarea id="ej-mot" rows="2" placeholder="Note ce que dit le joueur en une phrase..."></textarea>
      </div>
      <div class="sp-field"><label>✅ Ce qui va bien ce mois-ci</label>
        <textarea id="ej-va" rows="2" placeholder="Points positifs..."></textarea></div>
      <div class="sp-field"><label>⚠️ Ce qui ne va pas / points d'attention</label>
        <textarea id="ej-nva" rows="2" placeholder="Difficultés, blocages..."></textarea></div>
      <div class="sp-field"><label>📅 Échéances à venir</label>
        <textarea id="ej-ech" rows="2" placeholder="Examens, dossiers, RDV..."></textarea></div>
      <div class="sp-field"><label>🤝 Comment on peut l'aider</label>
        <textarea id="ej-aide" rows="2" placeholder="Démarches cellule..."></textarea></div>
      <div class="sp-field"><label>☑️ Ce qu'il doit faire avant le prochain entretien</label>
        <div id="ej-actions"></div>
        <button class="sp-add-btn" onclick="spAddAction()">+ Ajouter une action</button>
      </div>
      <div class="sp-field"><label>🔒 Notes cellule <span style="font-size:10px;opacity:.6">(non visible du joueur)</span></label>
        <textarea id="ej-notes" rows="2" placeholder="Non visible du joueur..."></textarea></div>
    </div>`;

  // Section Examens (optionnel)
  const sectionExam = `
    <div>
      <div class="sp-sec-toggle" onclick="spToggle('exam-body');this.querySelector('.sp-chev').classList.toggle('open')">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="sp-sec-icon">🎓</div>
          <div>
            <div style="font-size:13px;font-weight:500;color:#3D3B36">Résultats examens</div>
            <div style="font-size:12px;color:#9E9A90" id="exam-hint">Optionnel — cliquer pour renseigner</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span id="exam-badge" style="display:none;font-size:11px;font-weight:500;padding:2px 8px;border-radius:20px;background:#E6F1FB;color:#0C447C"></span>
          <span class="sp-chev">▼</span>
        </div>
      </div>
      <div id="exam-body" style="display:none;padding:1rem 1.25rem;border-bottom:.5px solid #E0DDD6">
        <div style="display:grid;grid-template-columns:1fr 72px 110px 26px;gap:7px;margin-bottom:6px">
          <div style="font-size:11px;color:#9E9A90">Matière</div>
          <div style="font-size:11px;color:#9E9A90">Note</div>
          <div style="font-size:11px;color:#9E9A90">Tendance</div>
          <div></div>
        </div>
        <div id="exam-list"></div>
        <button class="sp-add-btn" onclick="spAddExam()">+ Ajouter une matière</button>
        <div class="sp-field" style="margin-top:10px"><label>Commentaire global</label>
          <textarea id="exam-comment" rows="2" placeholder="Session difficile mais en progression..."></textarea></div>
      </div>
    </div>`;

  // Section couleur
  const sectionCouleur = `
    <div class="sp-sec">
      <div class="sp-sec-lbl">🚦 État général ce mois</div>
      <div class="sp-color-row">
        <button class="sp-color-btn" id="cbtn-vert"   onclick="spSetColor('vert')">
          <div style="font-size:18px;margin-bottom:3px">🟢</div>Vert
          <div style="font-size:10px;opacity:.7;margin-top:2px">Suivi normal</div>
        </button>
        <button class="sp-color-btn" id="cbtn-orange" onclick="spSetColor('orange')">
          <div style="font-size:18px;margin-bottom:3px">🟠</div>Orange
          <div style="font-size:10px;opacity:.7;margin-top:2px">À surveiller</div>
        </button>
        <button class="sp-color-btn" id="cbtn-rouge"  onclick="spSetColor('rouge')">
          <div style="font-size:18px;margin-bottom:3px">🔴</div>Rouge
          <div style="font-size:10px;opacity:.7;margin-top:2px">Action urgente</div>
        </button>
      </div>
      <div id="color-def" class="sp-color-def">Sélectionne une couleur pour définir l'état du joueur.</div>
      <div id="color-comment-wrap" style="display:none">
        <label class="sp-color-qlbl" id="color-qlbl"></label>
        <textarea class="sp-color-comment" id="color-comment" rows="2" placeholder="Justification..."></textarea>
      </div>
    </div>`;

  spMain().innerHTML = `
    <button class="sp-back" onclick="spRetourListe()">← Retour</button>
    <div class="sp-card">
      <div class="sp-hdr">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="sp-avatar">${spInitials(j.nom, j.prenom)}</div>
          <div>
            <div style="font-size:15px;font-weight:500;color:white">${spEsc(j.prenom)} ${spEsc(j.nom)}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.55)">${spEsc(p.formation||'')}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:7px">
          <span class="sp-dot" id="hdr-dot" style="background:#9E9A90;width:10px;height:10px;border-radius:50%"></span>
          <span style="font-size:12px;color:rgba(255,255,255,.7)" id="hdr-status">—</span>
        </div>
      </div>
      ${sectionA}
      ${sectionB}
      ${sectionC}
      ${sectionExam}
      ${sectionCouleur}
      <div class="sp-foot">
        <span id="ej-msg" style="font-size:12px;color:#27500A;display:none">✓ Entretien enregistré</span>
        <span style="font-size:12px;color:#9E9A90">💾 Sauvegarde Supabase</span>
        <button class="sp-save-btn" onclick="spSaveEntretien()">Enregistrer l'entretien</button>
      </div>
    </div>`;

  spAddAction();
}

function spSetColor(couleur) {
  _spColor = couleur;
  const cfg = SP_COULEURS[couleur];
  document.querySelectorAll('.sp-color-btn').forEach(b => {
    b.style.border = '0.5px solid #E0DDD6';
    b.style.background = 'white';
    b.style.color = '#9E9A90';
    b.style.fontWeight = '';
  });
  const btn = sgid('cbtn-' + couleur);
  if (btn) { btn.style.border = `2px solid ${cfg.dot}`; btn.style.background = cfg.bg; btn.style.color = cfg.text; btn.style.fontWeight = '500'; }
  const dot = sgid('hdr-dot'); if (dot) dot.style.background = cfg.dot;
  const status = sgid('hdr-status'); if (status) status.textContent = cfg.label;
  const def = sgid('color-def'); if (def) def.textContent = cfg.def;
  const wrap = sgid('color-comment-wrap'); if (wrap) wrap.style.display = 'block';
  const qlbl = sgid('color-qlbl'); if (qlbl) qlbl.textContent = cfg.q;
  const comment = sgid('color-comment'); if (comment) { comment.placeholder = 'Ex : ' + cfg.q; comment.focus(); }
}

function spAddAction() {
  const list = sgid('ej-actions');
  if (!list) return;
  const row = document.createElement('div');
  row.className = 'sp-action-row';
  row.innerHTML = '<input type="text" placeholder="Action à réaliser..."><button onclick="this.closest(\'.sp-action-row\').remove()">🗑</button>';
  list.appendChild(row);
  row.querySelector('input').focus();
}

function spAddExam() {
  const list = sgid('exam-list');
  if (!list) return;
  const row = document.createElement('div');
  row.style.cssText = 'display:grid;grid-template-columns:1fr 72px 110px 26px;gap:7px;align-items:center;margin-bottom:7px';
  row.innerHTML = '<input type="text" style="font-size:13px;border:1px solid #E0DDD6;border-radius:6px;padding:6px 8px" placeholder="Matière...">' +
    '<input type="text" style="font-size:13px;border:1px solid #E0DDD6;border-radius:6px;padding:6px 8px" placeholder="Note">' +
    '<select style="font-size:12px;border:1px solid #E0DDD6;border-radius:6px;padding:5px 6px"><option value="">—</option><option>En hausse</option><option>Stable</option><option>En baisse</option></select>' +
    '<button style="background:none;border:none;cursor:pointer;color:#9E9A90" onclick="this.closest(\'div\').remove()">🗑</button>';
  list.appendChild(row);
  spUpdateExamBadge();
}

function spUpdateExamBadge() {
  const count = sgid('exam-list')?.children.length || 0;
  const badge = sgid('exam-badge');
  if (badge) { badge.style.display = count ? 'inline' : 'none'; badge.textContent = count + ' matière' + (count>1?'s':''); }
}

function spToggle(id) {
  const el = sgid(id);
  if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
}

// ── Save entretien ────────────────────────────────────────────────────────
async function spSaveEntretien() {
  if (!_spColor) { alert('Sélectionne une couleur (Vert / Orange / Rouge) avant d\'enregistrer.'); return; }
  const justif = sgid('color-comment')?.value?.trim() || '';
  if (!justif) { alert(SP_COULEURS[_spColor].q + '\nLa justification est obligatoire.'); sgid('color-comment')?.focus(); return; }

  const db = spDB();
  const j  = _spCurrent;

  // Collect actions
  const actions = Array.from(sgid('ej-actions')?.querySelectorAll('.sp-action-row input') || [])
    .map(i => i.value.trim()).filter(Boolean);

  // Collect examens
  const examRows = sgid('exam-list')?.children || [];
  const examens  = Array.from(examRows).map(row => {
    const inputs  = row.querySelectorAll('input');
    const sel     = row.querySelector('select');
    return { matiere: inputs[0]?.value||'', note: inputs[1]?.value||'', tendance: sel?.value||'' };
  }).filter(r => r.matiere);

  // Collect reprise statuses from Section B
  const repriseStatuts = [];
  const prevEntretien  = _spEntretiens[0];
  if (prevEntretien) {
    const prevActions = Array.isArray(prevEntretien.actions_suivant)
      ? prevEntretien.actions_suivant
      : JSON.parse(prevEntretien.actions_suivant || '[]');
    prevActions.forEach((a, i) => {
      const sel = sgid(`reprise-status-${i}`);
      if (sel) repriseStatuts.push({ action: a, statut: sel.value });
    });
  }

  const payload = {
    joueur_id:            j.authId,
    date:                 sgid('ej-date')?.value   || spTodayISO(),
    mene_par:             sgid('ej-menePar')?.value || null,
    mot_du_joueur:        sgid('ej-mot')?.value     || null,
    ce_qui_va:            sgid('ej-va')?.value      || null,
    ce_qui_ne_va_pas:     sgid('ej-nva')?.value     || null,
    echeances:            sgid('ej-ech')?.value     || null,
    comment_aider:        sgid('ej-aide')?.value    || null,
    actions_suivant:      actions,
    examens:              examens,
    commentaire_examens:  sgid('exam-comment')?.value || null,
    notes_cellule:        sgid('ej-notes')?.value   || null,
    couleur:              _spColor,
    couleur_justification: justif,
    created_by:           _spUser.id,
  };

  const { data: newEntretien, error } = await db.from('ssp_entretiens').insert(payload).select().single();
  if (error) { alert('Erreur : ' + error.message); return; }

  // Save reprises
  if (repriseStatuts.length && newEntretien?.id) {
    await db.from('ssp_reprises').insert(
      repriseStatuts.map(r => ({ entretien_id: newEntretien.id, action: r.action, statut: r.statut }))
    );
  }

  const msg = sgid('ej-msg');
  if (msg) { msg.style.display = 'inline'; setTimeout(() => msg.style.display = 'none', 3000); }
  await spLoadJoueurs();
  await spLoadJoueurDetail(_spCurrent);
}

// ── VUE 4 — Mode réunion ──────────────────────────────────────────────────
function spReunionBandeauHTML(counts) {
  const total = _spJoueurs.length;
  const chips = [
    counts.rouge  ? `<span style="background:#FDEAEA;color:#791F1F;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600">${counts.rouge} Rouge</span>` : '',
    counts.orange ? `<span style="background:#FEF3E6;color:#803A00;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600">${counts.orange} Orange</span>` : '',
    counts.vert   ? `<span style="background:#EBF7ED;color:#27500A;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600">${counts.vert} Vert</span>` : '',
  ].filter(Boolean).join('');

  return `
    <div style="background:#F7F5F0;border:.5px solid #E0DDD6;border-radius:8px;padding:10px 14px;margin-bottom:14px">
      <div style="font-size:13px;font-weight:500;color:#3D3B36;margin-bottom:4px">Mode Réunion socio-pro</div>
      <div style="font-size:12px;color:#9E9A90;margin-bottom:8px">Faites défiler les joueurs triés par priorité (rouge en premier).<br>Ajoutez les actions décidées en réunion dans la section ci-dessous.</div>
      ${chips ? `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">${chips}<span style="font-size:11px;color:#9E9A90;margin-left:4px">· ${total} joueur${total>1?'s':''} au total</span></div>` : ''}
    </div>`;
}

async function spRenderReunion() {
  spNavActive('reunion');
  spMain().innerHTML = `
    <div id="sp-reunion-cards"></div>
    <div id="sp-reunion-actions" style="margin-top:16px"></div>`;

  await spLoadJoueurs();
  await spLoadActions();

  _spReunionJoueurs = _spJoueurs
    .filter(j => j.lastEntretien)
    .sort((a, b) => {
      const order = { rouge: 0, orange: 1, vert: 2 };
      return (order[a.lastEntretien.couleur] ?? 3) - (order[b.lastEntretien.couleur] ?? 3);
    });

  const counts = { rouge: 0, orange: 0, vert: 0 };
  _spReunionJoueurs.forEach(j => {
    const c = j.lastEntretien?.couleur;
    if (c && counts[c] !== undefined) counts[c]++;
  });
  _spBandeauHTML = spReunionBandeauHTML(counts);

  if (_spReunionJoueurs.length) {
    _spReunionIdx = 0;
    spRenderReunionCard();
  } else {
    sgid('sp-reunion-cards').innerHTML = _spBandeauHTML +
      `<p style="padding:20px;text-align:center;color:#9E9A90;font-size:13px">Aucun entretien enregistré pour le moment.</p>`;
  }

  spRenderActionsSection();
}

function spRenderReunionCard() {
  const container = sgid('sp-reunion-cards');
  if (!container) return;
  const joueurs = _spReunionJoueurs;
  const j       = joueurs[_spReunionIdx];
  const last    = j.lastEntretien;
  const ci      = last.couleur ? SP_COULEURS[last.couleur] : null;
  const p       = j.profil;
  const total   = joueurs.length;
  const actionsData = Array.isArray(last.actions_suivant) ? last.actions_suivant : [];

  container.innerHTML = _spBandeauHTML + `
    <div style="font-size:12px;color:#9E9A90;margin-bottom:12px">
      Joueur ${_spReunionIdx+1} / ${total}
    </div>
    <div class="sp-card">
      <div class="sp-hdr">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="sp-avatar">${spInitials(j.nom, j.prenom)}</div>
          <div>
            <div style="font-size:15px;font-weight:500;color:white">${spEsc(j.prenom)} ${spEsc(j.nom)}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.55)">${spEsc(p?.formation||'')} · ${spEsc(p?.referent||'')}</div>
          </div>
        </div>
        ${ci ? `<span style="background:${ci.dot};width:14px;height:14px;border-radius:50%;display:inline-block"></span>` : ''}
      </div>
      <div class="sp-sec">
        <div class="sp-sec-lbl">État ce mois — ${spDateFR(last.date)}</div>
        ${ci ? `<div class="sp-couleur-recap" style="background:${ci.bg};border:.5px solid ${ci.border}">
          <span style="background:${ci.dot};width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:3px;display:inline-block"></span>
          <div><div style="font-size:11px;font-weight:600;color:${ci.text};margin-bottom:3px">${ci.label}</div>
          <div style="font-size:12px;color:${ci.text}">${spEsc(last.couleur_justification||'')}</div></div>
        </div>` : ''}
      </div>
      ${actionsData.length ? `<div class="sp-sec">
        <div class="sp-sec-lbl">Ce qu'il doit faire</div>
        <div style="font-size:13px;color:#3D3B36;line-height:1.9">${actionsData.map(a => '• ' + spEsc(a)).join('<br>')}</div>
      </div>` : ''}
      <div class="sp-foot" style="flex-wrap:wrap;gap:6px">
        <button class="sp-btn" onclick="spReunionNav(${_spReunionIdx-1})" ${_spReunionIdx===0?'disabled':''}>← Précédent</button>
        <button class="sp-btn" onclick="spOpenFiche('${j.id}')">Fiche</button>
        <button class="sp-btn" onclick="spShowAddAction('${j.authId||''}')">+ Action</button>
        <button class="sp-btn sp-btn-primary" onclick="spReunionNav(${_spReunionIdx+1})" ${_spReunionIdx===total-1?'disabled':''}>Suivant →</button>
      </div>
    </div>`;
}

function spReunionNav(idx) {
  if (idx < 0 || idx >= _spReunionJoueurs.length) return;
  _spReunionIdx = idx;
  spRenderReunionCard();
}

// ── Actions de réunion ────────────────────────────────────────────────────
async function spLoadActions() {
  const { data } = await spDB().from('ssp_actions_reunion')
    .select('*')
    .eq('date_reunion', spTodayISO())
    .order('created_at');
  _spActions = data || [];
}

function spJoueurNameById(authId) {
  if (!authId) return 'Collectif';
  const j = _spJoueurs.find(j => j.authId === authId);
  return j ? `${j.prenom} ${j.nom}` : '—';
}

function spRenderActionsSection() {
  const el = sgid('sp-reunion-actions');
  if (!el) return;

  const joueurOptions = _spJoueurs.map(j =>
    `<option value="${j.authId}">${spEsc(j.prenom)} ${spEsc(j.nom)}</option>`
  ).join('');

  const membreOptions = SP_MEMBRES.map(m =>
    `<option value="${spEsc(m)}">${spEsc(m)}</option>`
  ).join('');

  const actionsHTML = _spActions.map(a => {
    const st   = SP_STATUTS[a.statut] || SP_STATUTS.a_faire;
    const name = spJoueurNameById(a.joueur_id);
    const opts = ['a_faire','en_cours','fait'].map(s =>
      `<option value="${s}" ${a.statut===s?'selected':''}>${SP_STATUTS[s].label}</option>`
    ).join('');
    return `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:.5px solid #E0DDD6">
        <span style="width:10px;height:10px;border-radius:50%;background:${st.dot};flex-shrink:0;margin-top:4px;display:inline-block"></span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;color:#3D3B36">${spEsc(a.action)}</div>
          <div style="font-size:11px;color:#9E9A90;margin-top:2px">${spEsc(name)} · ${spEsc(a.responsable||'—')}</div>
        </div>
        <select onchange="spUpdateReunionStatut('${a.id}',this.value)" style="font-size:11px;padding:3px 5px;border:1px solid #E0DDD6;border-radius:6px;flex-shrink:0;background:white;color:#3D3B36">
          ${opts}
        </select>
        <button onclick="spDeleteReunionAction('${a.id}')" style="background:none;border:none;cursor:pointer;color:#9E9A90;padding:2px 4px;flex-shrink:0;font-size:14px">🗑</button>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="sp-card">
      <div class="sp-sec" style="border-bottom:none">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <div class="sp-sec-lbl" style="margin-bottom:0">Actions de la réunion</div>
            <div style="font-size:11px;color:#9E9A90;margin-top:3px">Réunion du ${spDateFR(spTodayISO())}</div>
          </div>
          <button class="sp-btn sp-btn-primary" onclick="spShowAddAction()">+ Action</button>
        </div>
        <div id="sp-actions-add" style="display:none;background:#F7F5F0;border-radius:8px;padding:12px;margin-bottom:12px">
          <div class="sp-field">
            <label>Joueur concerné <span style="font-size:10px;opacity:.6">(optionnel)</span></label>
            <select id="sa-joueur">
              <option value="">— Collectif / général —</option>
              ${joueurOptions}
            </select>
          </div>
          <div class="sp-field">
            <label>Action à mettre en place</label>
            <input id="sa-action" type="text" placeholder="Ex : Contacter le tuteur, relancer le lycée...">
          </div>
          <div class="sp-field" style="margin-bottom:0">
            <label>Responsable</label>
            <select id="sa-resp">
              <option value="">— Choisir —</option>
              ${membreOptions}
            </select>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button class="sp-btn sp-btn-primary" onclick="spSaveReunionAction()">Ajouter</button>
            <button class="sp-btn" onclick="spHideAddAction()">Annuler</button>
          </div>
        </div>
        <div id="sp-actions-list">
          ${actionsHTML || '<p style="font-size:13px;color:#9E9A90;text-align:center;padding:8px 0">Aucune action pour cette réunion.</p>'}
        </div>
      </div>
    </div>`;
}

function spShowAddAction(joueurAuthId) {
  const wrap = sgid('sp-actions-add');
  if (!wrap) return;
  wrap.style.display = 'block';
  if (joueurAuthId) {
    const sel = sgid('sa-joueur');
    if (sel) sel.value = joueurAuthId;
  }
  sgid('sp-reunion-actions')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => sgid('sa-action')?.focus(), 100);
}

function spHideAddAction() {
  const wrap = sgid('sp-actions-add');
  if (wrap) wrap.style.display = 'none';
}

async function spSaveReunionAction() {
  const action = sgid('sa-action')?.value?.trim();
  if (!action) { sgid('sa-action')?.focus(); return; }
  const { error } = await spDB().from('ssp_actions_reunion').insert({
    date_reunion: spTodayISO(),
    joueur_id:    sgid('sa-joueur')?.value || null,
    action,
    responsable:  sgid('sa-resp')?.value  || null,
  });
  if (!error) {
    await spLoadActions();
    spHideAddAction();
    spRenderActionsSection();
  }
}

async function spUpdateReunionStatut(id, statut) {
  await spDB().from('ssp_actions_reunion').update({ statut }).eq('id', id);
  await spLoadActions();
  spRenderActionsSection();
}

async function spDeleteReunionAction(id) {
  await spDB().from('ssp_actions_reunion').delete().eq('id', id);
  await spLoadActions();
  spRenderActionsSection();
}

// ── Retour liste ──────────────────────────────────────────────────────────
function spRetourListe() {
  _spCurrent = null;
  spNavActive('liste');
  spRenderListe();
}

// ── Export .md ───────────────────────────────────────────────────────────
function spExportEntretiensMd() {
  const j  = _spCurrent;
  const p  = _spProfil || {};
  const premOrient = _spOrients.length ? _spOrients[_spOrients.length-1] : null;

  let md = `# Suivi socio-professionnel — ${j.prenom} ${j.nom}\n`;
  md += `## Fenix Toulouse HB · Centre de Formation\n\n`;
  md += `### Profil\n`;
  md += `- Formation : ${p.formation||'—'}\n`;
  md += `- Projet pro : ${p.projet_pro||'—'}\n`;
  md += `- Référent : ${p.referent||'—'}\n`;
  md += `- Tuteur : ${p.tuteur||'—'}\n`;
  md += `- Contrat : ${SP_CONTRATS[p.contrat_scolarite||'a_jour']?.label}\n`;
  if (premOrient) md += `- Orientation d'entrée au CF : ${premOrient.formation||'—'} (${spDateFR(premOrient.date_changement)})\n`;
  md += `- Changements d'orientation : ${_spOrients.length}\n\n---\n\n`;

  _spEntretiens.slice().reverse().forEach(e => {
    const ci = e.couleur ? SP_COULEURS[e.couleur] : null;
    const actions = Array.isArray(e.actions_suivant) ? e.actions_suivant : JSON.parse(e.actions_suivant||'[]');
    const examens = Array.isArray(e.examens) ? e.examens : JSON.parse(e.examens||'[]');
    md += `### Entretien du ${spDateFR(e.date)} — ${e.mene_par||'—'}\n`;
    if (ci) md += `**État : ${ci.label}**\n**Justification :** ${e.couleur_justification||''}\n`;
    if (e.mot_du_joueur) md += `**Mot du joueur :** ${e.mot_du_joueur}\n`;
    md += `\n`;
    if (e.ce_qui_va)        md += `**Ce qui va :** ${e.ce_qui_va}\n`;
    if (e.ce_qui_ne_va_pas) md += `**Ce qui ne va pas :** ${e.ce_qui_ne_va_pas}\n`;
    if (e.echeances)        md += `**Échéances :** ${e.echeances}\n`;
    if (e.comment_aider)    md += `**Comment on peut l'aider :** ${e.comment_aider}\n`;
    if (actions.length)     md += `**Actions suivantes :**\n${actions.map(a=>'- '+a).join('\n')}\n`;
    if (examens.length) {
      md += `**Examens :**\n`;
      examens.forEach(ex => { md += `- ${ex.matiere} : ${ex.note} (${ex.tendance||'—'})\n`; });
      if (e.commentaire_examens) md += `Commentaire : ${e.commentaire_examens}\n`;
    }
    if (e.notes_cellule)    md += `**Notes cellule :** ${e.notes_cellule}\n`;
    md += `\n---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${j.nom}_${j.prenom}_suivi_sociopro_${spTodayISO()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Export PDF (jsPDF) ────────────────────────────────────────────────────
function spExportEntretiensPdf() {
  if (!window.jspdf) { alert('PDF non disponible — chargement jsPDF en cours, réessaye dans quelques secondes.'); return; }
  const { jsPDF } = window.jspdf;
  const j  = _spCurrent;
  const p  = _spProfil || {};
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const L   = 14;
  let   y   = 20;

  const line = (txt, indent = 0, size = 10, bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(txt, 182 - indent);
    lines.forEach(l => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(l, L + indent, y);
      y += size * 0.45;
    });
    y += 1;
  };

  // En-tête
  doc.setFillColor(10, 36, 99);
  doc.rect(0, 0, 210, 14, 'F');
  doc.setTextColor(255, 255, 255);
  line(`FENIX TOULOUSE HB · ${j.prenom} ${j.nom} · Export ${spTodayISO()}`, 0, 10, true);
  doc.setTextColor(0, 0, 0);
  y = 22;

  line(`Suivi socio-professionnel — ${j.prenom} ${j.nom}`, 0, 14, true);
  line(`Formation : ${p.formation||'—'} | Projet : ${p.projet_pro||'—'} | Référent : ${p.referent||'—'}`, 0, 9);
  y += 4;

  _spEntretiens.slice().reverse().forEach(e => {
    const ci      = e.couleur ? SP_COULEURS[e.couleur] : null;
    const actions = Array.isArray(e.actions_suivant) ? e.actions_suivant : JSON.parse(e.actions_suivant||'[]');
    const examens = Array.isArray(e.examens)          ? e.examens          : JSON.parse(e.examens||'[]');
    line(`Entretien du ${spDateFR(e.date)} — ${e.mene_par||'—'}`, 0, 11, true);
    if (ci) line(`Etat : ${ci.label} — ${e.couleur_justification||''}`, 2, 9);
    if (e.mot_du_joueur)    line(`Mot du joueur : ${e.mot_du_joueur}`, 2, 9);
    if (e.ce_qui_va)        line(`(+) Ce qui va : ${e.ce_qui_va}`, 2, 9);
    if (e.ce_qui_ne_va_pas) line(`(!) Ce qui ne va pas : ${e.ce_qui_ne_va_pas}`, 2, 9);
    if (e.echeances)        line(`Echeances : ${e.echeances}`, 2, 9);
    if (e.comment_aider)    line(`Comment l'aider : ${e.comment_aider}`, 2, 9);
    if (actions.length)     actions.forEach(a => line(`• ${a}`, 4, 9));
    if (examens.length) {
      line(`Examens :`, 2, 9, true);
      examens.forEach(ex => line(`${ex.matiere} : ${ex.note}${ex.tendance ? ' ('+ex.tendance+')' : ''}`, 4, 9));
      if (e.commentaire_examens) line(`Commentaire : ${e.commentaire_examens}`, 4, 9);
    }
    if (e.notes_cellule)    line(`[Conf.] Notes cellule : ${e.notes_cellule}`, 2, 9);
    y += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(L, y, 196, y);
    y += 4;
  });

  // Pied de page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Cellule Socio-Pro · Confidentiel', L, 290);
    doc.text(`${i} / ${pages}`, 196, 290, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  doc.save(`${j.nom}_${j.prenom}_bilan_sociopro_${spTodayISO()}.pdf`);
}
