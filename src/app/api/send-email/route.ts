import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { organization_id, to, subject, text } = await req.json()

    if (!organization_id || !to || !text) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Obtener email y nombre del negocio desde settings
    const { data: settings } = await supabase
      .from('settings')
      .select('email_inbound, email_display_name, email_signature')
      .eq('organization_id', organization_id)
      .maybeSingle()

    const fromEmail = settings?.email_inbound || 'noreply@sffalcon.com'
    const fromName = settings?.email_display_name || 'SF Gestor'
    const signature = settings?.email_signature || ''

    const fullText = signature
      ? `${text}\n\n${signature}`
      : text

    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: subject?.startsWith('Re:') ? subject : `Re: ${subject || 'Consulta'}`,
      text: fullText,
      replyTo: fromEmail
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Error Resend' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('send-email error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
