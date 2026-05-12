import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json()

    // 1. Obtener organización completa
    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_customer_id, plan, trial_ends_at, trial_used')
      .eq('id', organizationId)
      .single()

    // 2. Si es trial activo → cancelar trial directamente
    const now = new Date()
    const trialActive = org?.trial_ends_at && new Date(org.trial_ends_at) > now

    if (trialActive) {
      await supabase
        .from('organizations')
        .update({ 
          plan: 'gratis',
          trial_ends_at: null
        })
        .eq('id', organizationId)

      return NextResponse.json({ 
        success: true, 
        message: 'Tu período de prueba ha sido cancelado.' 
      })
    }

    // 3. Si no tiene Stripe ni trial → error claro
    if (!org?.stripe_customer_id) {
      return NextResponse.json({ 
        error: 'No tienes ninguna suscripción activa que cancelar.' 
      }, { status: 404 })
    }

    // 4. Si tiene Stripe → continuar con lógica existente de Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: org.stripe_customer_id,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No hay suscripciones de Stripe activas por cancelar' }, { status: 404 })
    }

    // 5. Programar cancelación para el final del periodo
    await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true
    })

    console.log(`Cancelación programada para org: ${organizationId}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Tu suscripción se ha cancelado correctamente y seguirá activa hasta el final del periodo de facturación actual.' 
    })
  } catch (error) {
    console.error('Stripe cancel error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: 'Error al procesar la cancelación: ' + errorMessage }, { status: 500 })
  }
}
