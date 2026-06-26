/* ─── FENIX Eval CF — Supabase Client ───────────────────────────────────────
   Remplace SUPABASE_URL et SUPABASE_ANON_KEY par tes valeurs
   (Settings → API dans le dashboard Supabase)
──────────────────────────────────────────────────────────────────────────── */

const SUPABASE_URL      = 'https://wyiylqvreuippmcrzwat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aXlscXZyZXVpcHBtY3J6d2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzA5NjcsImV4cCI6MjA5ODA0Njk2N30.chUkE5yL22krXGIZnaLAxERFsCJn_H71VppOw2Tme2E';

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
