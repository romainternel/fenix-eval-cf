import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

async function getAdminAndCoach(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabaseUser
    .from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'coach') return null

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  return supabaseAdmin
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const admin = await getAdminAndCoach(req)
    if (!admin) return json({ error: 'Non autorisé' }, 401)

    /* ── POST : créer un compte joueur ───────────────────────────────── */
    if (req.method === 'POST') {
      const { email, password, player_id } = await req.json()
      if (!email || !password || !player_id) {
        return json({ error: 'email, password et player_id sont requis' }, 400)
      }

      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (createError) return json({ error: createError.message }, 400)

      const { error: linkError } = await admin
        .from('user_profiles')
        .upsert({ id: newUser.user.id, role: 'joueur', player_id })
      if (linkError) return json({ error: linkError.message }, 500)

      return json({ success: true })
    }

    /* ── DELETE : supprimer le compte auth lié à un joueur ───────────── */
    if (req.method === 'DELETE') {
      const { player_id } = await req.json()
      if (!player_id) return json({ error: 'player_id requis' }, 400)

      const { data: up } = await admin
        .from('user_profiles').select('id').eq('player_id', player_id).maybeSingle()

      if (up?.id) {
        await admin.auth.admin.deleteUser(up.id)
      }

      return json({ success: true })
    }

    return json({ error: 'Méthode non supportée' }, 405)

  } catch (err) {
    return json({ error: (err as Error).message ?? 'Erreur interne' }, 500)
  }
})
