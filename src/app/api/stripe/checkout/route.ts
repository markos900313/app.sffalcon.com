import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { organizationId, userId } = await request.json()

    if (!organizationId) {
      return NextResponse.json({ error: 'Faltan parámetros: organizationId' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || 'https://app.sffalcon.com'

    // Buscar o crear customer en Stripe
    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_customer_id, name, email, country')
      .eq('id', organizationId)
      .single()

    const country = org?.country?.toUpperCase() || 'ES'
    const isUSD = ['US','CA','PR','DO'].includes(country)
    const priceId = isUSD
      ? process.env.STRIPE_PRICE_PRO_USD
      : process.env.STRIPE_PRICE_PRO

    if (!priceId) {
      console.error('ERROR: priceId no está definido en las variables de entorno para el país:', country)
      return NextResponse.json({ error: 'Configuración del servidor incompleta (Stripe Price ID)' }, { status: 500 })
    }

    let customerId = org?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: org?.name,
        email: org?.email,
        metadata: { organizationId, userId }
      })
      customerId = customer.id

      await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', organizationId)
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/dashboard?cancelled=true`,
      metadata: { organizationId, userId }
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ 
      error: 'Error creando checkout',
      details: error.message,
      env_check: {
        has_url: !!process.env.NEXT_PUBLIC_APP_URL,
        has_stripe: !!process.env.STRIPE_SECRET_KEY,
        has_supabase: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    }, { status: 500 })
  }
}
