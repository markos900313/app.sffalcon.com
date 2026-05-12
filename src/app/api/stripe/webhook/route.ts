import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body, sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const { organizationId } = session.metadata

    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    const priceId = subscription.items.data[0].price.id

    // Determinar plan
    const planMap: Record<string, string> = {
      [process.env.STRIPE_PRICE_STARTER!]: 'starter',
      [process.env.STRIPE_PRICE_PRO!]: 'pro',
      [process.env.STRIPE_PRICE_ULTRA!]: 'ultra'
    }

    await supabase
      .from('organizations')
      .update({
        plan: planMap[priceId] || 'starter',
        stripe_subscription_id: session.subscription,
        stripe_price_id: priceId,
        plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('id', organizationId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (org) {
      await supabase
        .from('organizations')
        .update({ plan: 'starter', stripe_subscription_id: null })
        .eq('id', org.id)
    }
  }

  return NextResponse.json({ received: true })
}
