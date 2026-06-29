/* ─── FENIX Eval CF — Core App (Auth + Utilitaires) ─────────────────────── */

const db = window.supabaseClient;

/* ── Auth : récupère le rôle de l'utilisateur connecté ─────────────────── */
async function getRole(userId) {
  const { data } = await db
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return data?.role ?? 'joueur';
}

/* ── Auth : récupère la session active et redirige si besoin ────────────── */
async function requireAuth(expectedRole) {
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    window.location.href = 'index.html';
    return null;
  }

  const role = await getRole(session.user.id);

  if (expectedRole && role !== expectedRole) {
    window.location.href = role === 'coach' ? 'coach.html' : 'player.html';
    return null;
  }

  return { user: session.user, role };
}

/* ── Auth : déconnexion ─────────────────────────────────────────────────── */
async function logout() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

/* ── Utilitaires ────────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function currentSaison() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

/* Calcule la moyenne d'un tableau de notes (ignore les nulls) */
function moyenne(notes) {
  const valides = notes.filter(n => n !== null && n !== undefined);
  if (!valides.length) return null;
  return valides.reduce((a, b) => a + b, 0) / valides.length;
}

/* Renvoie la classe CSS de niveau selon la note (arrondie) */
function niveauClass(note) {
  if (!note) return '';
  return `n${Math.round(note)}`;
}

function niveauLabel(note) {
  const labels = { 1: 'Fragile', 2: 'En travail', 3: 'Acquis', 4: 'Maîtrisé', 5: 'Référence' };
  return labels[Math.round(note)] ?? '';
}

/* Shorthand pour créer un élément HTML */
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  });
  children.forEach(c => {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  });
  return e;
}

/* ── Légende niveaux cliquable sur la vue résultats ─────────────────────── */
const _NOTE_DESCS = {
  1: { label: 'Fragile',    desc: 'Niveau non acquis — à travailler en priorité' },
  2: { label: 'En travail', desc: 'En cours d\'acquisition — des progrès sont visibles' },
  3: { label: 'Acquis',     desc: 'Maîtrisé dans les situations standard' },
  4: { label: 'Maîtrisé',   desc: 'Maîtrisé en situation de compétition' },
  5: { label: 'Référence',  desc: 'Niveau d\'excellence — exemple pour les autres joueurs' },
};

function noteLegendHTML() {
  const btns = [1,2,3,4,5].map(n =>
    `<button class="note-ref-btn n${n}" onclick="toggleNoteLegend(${n})">${_NOTE_DESCS[n].label}</button>`
  ).join('');
  return `<div style="margin-bottom:10px">
    <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">
      <span style="font-size:10px;color:var(--gray-400);margin-right:2px">Niveaux :</span>
      ${btns}
    </div>
    <div id="noteLegendInfo" style="display:none;margin-top:6px;padding:7px 10px;border-radius:8px;font-size:11px;border:1.5px solid transparent"></div>
  </div>`;
}

/* ── Tableau tendances par thème (STORY 16) ──────────────────────────────── */
function trendTableHTML(profilId, sessions, viewKey, title) {
  const profil = CRITERIA[profilId];
  if (!profil || sessions.length < 2) return '';

  const rows = Object.values(profil.axes).map(axe => {
    const avgs = sessions.map(s => {
      const ns = axe.criteres.map(c => s.evalMap[c.id]?.[viewKey] || 0).filter(n => n > 0);
      return ns.length ? +(ns.reduce((a,b)=>a+b,0)/ns.length).toFixed(1) : null;
    });
    const first = avgs.find(v => v !== null);
    const last  = [...avgs].reverse().find(v => v !== null);
    const delta = (first !== null && last !== null) ? +(last - first).toFixed(1) : null;
    const dir   = delta === null ? 'flat' : delta > 0.05 ? 'up' : delta < -0.05 ? 'down' : 'flat';
    const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';
    const cells = avgs.map(v => `<td class="trend-td">${v !== null ? v : '—'}</td>`).join('');
    const dBadge = delta !== null
      ? `<span class="trend-badge ${dir}">${delta > 0 ? '+' : ''}${delta}</span>`
      : '—';
    return `<tr>
      <td class="trend-td-label">${escHtml(axe.label)}</td>
      ${cells}
      <td class="trend-td"><span class="trend-arrow ${dir}">${arrow}</span></td>
      <td class="trend-td">${dBadge}</td>
    </tr>`;
  }).join('');

  const headers = sessions.map(s => `<th class="trend-th">${escHtml(s.label)}</th>`).join('');
  return `
    <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--gray-400);margin-top:14px;margin-bottom:2px">${title}</p>
    <table class="trend-table">
      <thead><tr>
        <th class="trend-th-label">Thème</th>${headers}
        <th class="trend-th">↕</th><th class="trend-th">Δ</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/* ── Badge écart joueur/staff ─────────────────────────────────────────────── */
function deltaHTML(nj, ns) {
  if (!nj || !ns) return '<span class="delta-badge empty">—</span>';
  const d = +(nj - ns).toFixed(1);
  const cls = d > 0.05 ? 'over' : d < -0.05 ? 'under' : 'even';
  const sign = d > 0 ? '+' : '';
  return `<span class="delta-badge ${cls}">${sign}${d}</span>`;
}

function toggleNoteLegend(n) {
  const el = document.getElementById('noteLegendInfo');
  if (!el) return;
  if (el.dataset.n === String(n) && el.style.display !== 'none') {
    el.style.display = 'none'; el.dataset.n = ''; return;
  }
  el.dataset.n = String(n);
  el.style.display = 'block';
  el.style.background    = `var(--n${n}-bg)`;
  el.style.borderColor   = `var(--n${n}-border)`;
  el.style.color         = `var(--n${n}-text)`;
  el.innerHTML = `<strong>${_NOTE_DESCS[n].label}</strong> — ${_NOTE_DESCS[n].desc}`;
}
