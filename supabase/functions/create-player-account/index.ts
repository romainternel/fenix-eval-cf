import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    // 1. Vérifier que l'appelant est un coach
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Non autorisé' }, 401)

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return json({ error: 'Non autorisé' }, 401)

    const { data: profile } = await supabaseUser
      .from('user_profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'coach') return json({ error: 'Accès refusé' }, 403)

    // 2. Lire les paramètres
    const { email, password, player_id } = await req.json()
    if (!email || !password || !player_id) {
      return json({ error: 'email, password et player_id sont requis' }, 400)
    }

    // 3. Créer le compte auth avec la clé admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,   // compte actif immédiatement, pas besoin de confirmer l'email
    })

    if (createError) return json({ error: createError.message }, 400)

    // 4. Lier le player_id dans user_profiles
    // (le trigger handle_new_user a déjà créé la ligne avec role='joueur')
    const { error: linkError } = await supabaseAdmin
      .from('user_profiles')
      .update({ player_id })
      .eq('id', newUser.user.id)

    if (linkError) return json({ error: linkError.message }, 500)

    return json({ success: true })

  } catch (err) {
    return json({ error: err.message ?? 'Erreur interne' }, 500)
  }
})
