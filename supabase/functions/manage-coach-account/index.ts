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

async function getCallerAndAdmin(req: Request) {
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
  return { admin: supabaseAdmin, callerId: user.id }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const result = await getCallerAndAdmin(req)
    if (!result) return json({ error: 'Non autorisé' }, 401)
    const { admin, callerId } = result

    /* ── POST : créer un compte coach ─────────────────────────────── */
    if (req.method === 'POST') {
      const { email, password, nom, prenom } = await req.json()
      if (!email || !password || !nom || !prenom) {
        return json({ error: 'email, password, nom et prenom sont requis' }, 400)
      }

      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (createError) return json({ error: createError.message }, 400)

      // Le trigger handle_new_user() crée une ligne role='joueur' au moment du createUser.
      // On écrase avec upsert pour définir role='coach' + nom/prenom/email.
      const { error: linkError } = await admin
        .from('user_profiles')
        .upsert({ id: newUser.user.id, role: 'coach', nom, prenom, email })
      if (linkError) {
        await admin.auth.admin.deleteUser(newUser.user.id)
        return json({ error: linkError.message }, 500)
      }

      return json({ success: true })
    }

    /* ── DELETE : supprimer un compte coach ───────────────────────── */
    if (req.method === 'DELETE') {
      const { coach_user_id } = await req.json()
      if (!coach_user_id) return json({ error: 'coach_user_id requis' }, 400)

      if (coach_user_id === callerId) {
        return json({ error: 'Impossible de supprimer votre propre compte' }, 403)
      }

      // Vérifier que la cible est bien un coach avant toute suppression.
      const { data: targetProfile } = await admin
        .from('user_profiles').select('role').eq('id', coach_user_id).maybeSingle()
      if (!targetProfile || targetProfile.role !== 'coach') {
        return json({ error: 'Utilisateur cible non trouvé ou non coach' }, 404)
      }

      // Suppression explicite de user_profiles avant deleteUser,
      // même si le ON DELETE CASCADE le ferait automatiquement.
      await admin.from('user_profiles').delete().eq('id', coach_user_id)

      const { error: deleteError } = await admin.auth.admin.deleteUser(coach_user_id)
      if (deleteError) return json({ error: deleteError.message }, 400)

      return json({ success: true })
    }

    return json({ error: 'Méthode non supportée' }, 405)

  } catch (err) {
    return json({ error: (err as Error).message ?? 'Erreur interne' }, 500)
  }
})
