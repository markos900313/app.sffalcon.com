import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { userId, newPassword } = await req.json()
  const { error } = await supabaseAdmin.auth.admin
    .updateUserById(userId, { password: newPassword })
  if (error) return Response.json(
    { error: error.message }, { status: 400 }
  )
  return Response.json({ success: true })
}
