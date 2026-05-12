import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { organization_id, to, message } = await req.json()

    if (!organization_id || !to || !message) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Buscar config propio de la org
    let { data: cfg } = await supabase
      .from('whatsapp_configs')
      .select('phone_number_id, access_token')
      .eq('organization_id', organization_id)
      .eq('active', true)
      .maybeSingle()

    // 2. Si no tiene, usar centralita como fallback
    if (!cfg?.phone_number_id) {
      const { data: centralita } = await supabase
        .from('whatsapp_configs')
        .select('phone_number_id, access_token')
        .eq('is_centralita', true)
        .eq('active', true)
        .maybeSingle()
      cfg = centralita
    }

    if (!cfg?.phone_number_id) {
      return NextResponse.json({ error: 'Sin config WhatsApp' }, { status: 404 })
    }

    // Enviar por Meta API
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${cfg.phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cfg.access_token}`
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { body: message }
        })
      }
    )

    if (!res.ok) {
      const err = await res.json()
      console.error('Meta API error:', err)
      return NextResponse.json({ error: 'Error Meta API' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('send-whatsapp error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
