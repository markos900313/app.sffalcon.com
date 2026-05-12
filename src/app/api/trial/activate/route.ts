import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { organizationId, plan } = await request.json()

    // 1. Obtener organización y email del dueño
    const { data: org } = await supabase
      .from('organizations')
      .select('id, plan, trial_used, trial_ends_at')
      .eq('id', organizationId)
      .single()

    if (!org) return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 })

    // 2. Verificar que no ha usado trial antes
    if (org.trial_used) {
      return NextResponse.json({ error: 'Ya has utilizado tu período de prueba gratuito.' }, { status: 403 })
    }

    // 3. Obtener email del dueño
    const { data: member } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', organizationId)
      .eq('role', 'owner')
      .single()

    const { data: { user } } = await supabase.auth.admin.getUserById(member!.user_id)
    const email = user?.email

    // 4. Verificar blacklist por email
    const { data: blacklisted } = await supabase
      .from('trial_blacklist')
      .select('id')
      .eq('email', email!)
      .maybeSingle()

    if (blacklisted) {
      return NextResponse.json({ error: 'Este email ya ha utilizado un período de prueba.' }, { status: 403 })
    }

    // 5. Calcular días del trial
    const trialDays = plan === 'ultra' ? 30 : 90
    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)

    // 6. Activar trial en organizations
    await supabase
      .from('organizations')
      .update({
        plan,
        trial_used: true,
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        trial_plan: plan
      })
      .eq('id', organizationId)

    // 7. Registrar en blacklist
    await supabase
      .from('trial_blacklist')
      .insert({
        email: email!,
        plan,
        trial_started_at: now.toISOString()
      })

    return NextResponse.json({ 
      success: true, 
      trial_ends_at: trialEndsAt.toISOString(),
      days: trialDays
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
