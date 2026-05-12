import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json()

    const { data: org } = await supabase
      .from('organizations')
      .select('id, plan, trial_ends_at, trial_used, trial_plan')
      .eq('id', organizationId)
      .single()

    if (!org) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

    const now = new Date()
    const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null
    const daysLeft = trialEndsAt 
      ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null

    // Si el trial venció → bajar a free
    if (trialEndsAt && now > trialEndsAt && org.plan !== 'gratis') {
      await supabase
        .from('organizations')
        .update({ plan: 'gratis' })
        .eq('id', organizationId)

      return NextResponse.json({
        status: 'expired',
        plan: 'gratis',
        daysLeft: 0,
        message: 'Tu período de prueba ha finalizado. Activa tu plan para continuar.'
      })
    }

    // Estado activo con días restantes
    return NextResponse.json({
      status: trialEndsAt ? 'trial' : 'active',
      plan: org.plan,
      daysLeft,
      trialEndsAt: org.trial_ends_at,
      showWarning: daysLeft !== null && daysLeft <= 14,
      showUrgent: daysLeft !== null && daysLeft <= 7
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
