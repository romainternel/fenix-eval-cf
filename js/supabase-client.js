/* ─── FENIX Eval CF — Supabase Client ───────────────────────────────────────
   Remplace SUPABASE_URL et SUPABASE_ANON_KEY par tes valeurs
   (Settings → API dans le dashboard Supabase)
──────────────────────────────────────────────────────────────────────────── */

const SUPABASE_URL      = 'REMPLACER_PAR_TON_URL';
const SUPABASE_ANON_KEY = 'REMPLACER_PAR_TA_ANON_KEY';

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
