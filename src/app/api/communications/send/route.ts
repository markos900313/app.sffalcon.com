import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/sendEmail'
import { sendWhatsApp } from '@/lib/sendWhatsApp'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('[API Send] Request body:', JSON.stringify(body))

    let { type, to, subject = 'Nueva consulta', message, attachments = [], organizationId } = body

    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'ID de organización requerido para el envío multi-tenant'
      }, { status: 400 })
    }

    if (!type || !to || !message) {
      return NextResponse.json({
        success: false,
        error: `Faltan parámetros requeridos: ${!type ? 'type' : !to ? 'to' : 'message'}`
      }, { status: 400 })
    }

    if (type === 'whatsapp') {
      const result = await sendWhatsApp({
        to: String(to),
        message,
        orgId: organizationId,
        attachments
      })

      if (!result.success) {
        return NextResponse.json(result, { status: 500 })
      }

      return NextResponse.json(result)
    }

    if (type === 'email') {
      const result = await sendEmail({ to, subject, text: message, attachments })
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: 'Invalid message type' }, { status: 400 })
  } catch (error: any) {
    console.error('[API Send] Fatal Error:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 })
  }
}
