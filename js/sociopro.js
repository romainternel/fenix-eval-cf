/* ─── FENIX Socio-Pro — Constantes & helpers partagés ───────────────────── */

const SP_MEMBRES = [
  'Marion Agostini', 'Mathilde Soulié', 'Alain Raynal', 'Romain', 'Max', 'Rémi'
];

const SP_REFERENTS = ['Marion Agostini', 'Mathilde Soulié', 'Alain Raynal'];

const SP_COULEURS = {
  vert:   { dot: '#22c55e', bg: '#EAF3DE', border: '#3B6D11', text: '#27500A', label: '🟢 Vert',   def: 'Suivi normal, pas d\'action urgente.',    q: 'Pourquoi Vert ?' },
  orange: { dot: '#f97316', bg: '#FAEEDA', border: '#854F0B', text: '#633806', label: '🟠 Orange', def: 'À surveiller, en parler en réunion.',        q: 'Quel est le point d\'attention ?' },
  rouge:  { dot: '#ef4444', bg: '#FCEBEB', border: '#A32D2D', text: '#791F1F', label: '🔴 Rouge',  def: 'Action cellule nécessaire cette semaine.',  q: 'Quelle action est nécessaire ?' }
};

const SP_CONTRATS = {
  a_jour:    { label: 'À jour',    bg: '#EAF3DE', color: '#27500A' },
  en_cours:  { label: 'En cours',  bg: '#FAEEDA', color: '#633806' },
  non_signe: { label: 'Non signé', bg: '#FCEBEB', color: '#791F1F' }
};

const SP_STATUTS = {
  a_faire:  { label: 'À faire',  dot: '#ef4444' },
  en_cours: { label: 'En cours', dot: '#f97316' },
  fait:     { label: 'Fait',     dot: '#22c55e' },
};

function spEsc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function spInitials(nom, prenom) {
  return ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase() || '?';
}

function spDateFR(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function spDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function spTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function spWeeksAgo(dateStr) {
  if (!dateStr) return Infinity;
  return (Date.now() - new Date(dateStr).getTime()) / (86400000 * 7);
}
