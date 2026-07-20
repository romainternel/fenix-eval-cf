/* ─── FENIX Socio-Pro — Vue joueur (lecture seule) ───────────────────────── */

async function renderSuiviSocioPro(authUserId) {
  const el = document.getElementById('spSuiviContent');
  if (!el) return;
  el.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';

  const db = window.supabaseClient;

  // Charger les entretiens du joueur (sans notes_cellule ni couleur_justification — filtrés côté JS)
  const { data: entretiens, error } = await db
    .from('ssp_entretiens')
    .select('id, date, mene_par, mot_du_joueur, ce_qui_va, ce_qui_ne_va_pas, echeances, comment_aider, actions_suivant, couleur')
    .eq('joueur_id', authUserId)
    .order('date', { ascending: false });

  if (error || !entretiens?.length) {
    el.innerHTML = `
      <div class="card" style="margin-top:16px">
        <div class="card-body" style="text-align:center;padding:32px 20px;color:var(--gray-400)">
          <div style="font-size:28px;margin-bottom:8px">📋</div>
          <p style="font-size:14px;font-weight:500;margin-bottom:4px">Pas encore d'entretien</p>
          <p style="font-size:12px">Ton premier entretien avec la cellule socio-pro apparaîtra ici.</p>
        </div>
      </div>`;
    return;
  }

  const last = entretiens[0];
  const prev = entretiens.slice(1);
  const ci   = last.couleur ? SP_COULEURS[last.couleur] : null;
  const actions = Array.isArray(last.actions_suivant)
    ? last.actions_suivant
    : JSON.parse(last.actions_suivant || '[]');

  // Encadré "Mon état ce mois"
  const etatCard = ci ? `
    <div class="card" style="margin-top:16px">
      <div class="card-body">
        <p class="section-title" style="margin-bottom:12px">Mon état ce mois</p>
        <div style="background:${ci.bg};border:.5px solid ${ci.border};border-radius:8px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;margin-bottom:14px">
          <span style="width:12px;height:12px;border-radius:50%;background:${ci.dot};flex-shrink:0;margin-top:3px;display:inline-block"></span>
          <div style="font-size:13px;font-weight:600;color:${ci.text}">${ci.label}</div>
        </div>
        <p style="font-size:11px;font-weight:600;color:var(--gray-400);letter-spacing:.8px;text-transform:uppercase;margin-bottom:6px">Entretien du ${spDateFR(last.date)}</p>
        ${last.ce_qui_va ? `<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:600;color:#27500A;letter-spacing:.6px;margin-bottom:4px">✅ CE QUI VA BIEN</div><p style="font-size:13px;color:#3D3B36;line-height:1.6">${spEsc(last.ce_qui_va)}</p></div>` : ''}
        ${last.ce_qui_ne_va_pas ? `<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:600;color:#791F1F;letter-spacing:.6px;margin-bottom:4px">⚠️ POINTS D'ATTENTION</div><p style="font-size:13px;color:#3D3B36;line-height:1.6">${spEsc(last.ce_qui_ne_va_pas)}</p></div>` : ''}
        ${last.echeances ? `<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:600;color:#0A2463;letter-spacing:.6px;margin-bottom:4px">📅 MES ÉCHÉANCES À VENIR</div><p style="font-size:13px;color:#3D3B36;line-height:1.6">${spEsc(last.echeances)}</p></div>` : ''}
        ${actions.length ? `<div><div style="font-size:11px;font-weight:600;color:#0A2463;letter-spacing:.6px;margin-bottom:6px">☑️ CE QUE JE DOIS FAIRE</div>
          ${actions.map(a => `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px"><span style="color:#C8A84B;font-weight:700;flex-shrink:0">•</span><span style="font-size:13px;color:#3D3B36;line-height:1.5">${spEsc(a)}</span></div>`).join('')}
        </div>` : ''}
      </div>
    </div>` : '';

  // Accordéon historique
  const histItems = prev.map(e => {
    const ec = e.couleur ? SP_COULEURS[e.couleur] : null;
    const ea = Array.isArray(e.actions_suivant) ? e.actions_suivant : JSON.parse(e.actions_suivant||'[]');
    return `
      <div style="padding:10px 0;border-bottom:.5px solid #E0DDD6">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          ${ec ? `<span style="width:10px;height:10px;border-radius:50%;background:${ec.dot};flex-shrink:0;display:inline-block"></span>` : ''}
          <strong style="font-size:13px">${spDateFR(e.date)}</strong>
          ${ec ? `<span style="font-size:11px;color:${ec.text};background:${ec.bg};padding:1px 7px;border-radius:10px">${ec.label}</span>` : ''}
        </div>
        ${e.ce_qui_va ? `<p style="font-size:12px;color:#3D3B36;margin-bottom:3px"><span style="color:#27500A">✅ </span>${spEsc(e.ce_qui_va)}</p>` : ''}
        ${e.ce_qui_ne_va_pas ? `<p style="font-size:12px;color:#3D3B36;margin-bottom:3px"><span style="color:#791F1F">⚠️ </span>${spEsc(e.ce_qui_ne_va_pas)}</p>` : ''}
        ${ea.length ? `<p style="font-size:12px;color:#9E9A90;margin-top:4px">${ea.map(a=>'• '+spEsc(a)).join(' · ')}</p>` : ''}
      </div>`;
  }).join('');

  const histCard = prev.length ? `
    <div class="card" style="margin-top:12px">
      <div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;margin-bottom:4px" onclick="spToggleHist()">
          <p class="section-title">Mes entretiens précédents</p>
          <span id="sp-hist-chev" style="font-size:14px;color:#9E9A90">▼</span>
        </div>
        <div id="sp-hist-body" style="display:none">${histItems}</div>
      </div>
    </div>` : '';

  el.innerHTML = etatCard + histCard;
}

function spToggleHist() {
  const body = document.getElementById('sp-hist-body');
  const chev = document.getElementById('sp-hist-chev');
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  if (chev) chev.style.transform = open ? '' : 'rotate(180deg)';
}
