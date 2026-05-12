import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, data } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'ID de organización requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('organizations')
      .update({
        ...data,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)

    if (error) throw error

    // 2. También marcar onboarding_completed en el perfil del dueño
    const { data: member } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', organizationId)
      .eq('role', 'owner')
      .single()

    if (member?.user_id) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', member.user_id)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Onboarding Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
