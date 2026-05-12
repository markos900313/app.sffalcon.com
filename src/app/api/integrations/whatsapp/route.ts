import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationId } from '@/lib/getOrganization'

// Priorizamos localhost para el servidor backend-to-backend si estamos en la misma máquina
const BAILEYS_SERVER = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'https://wa.soportefacil.com'
const API_KEY = process.env.WHATSAPP_API_KEY || 'sf_whatsapp_2026_secret'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ connected: false, error: 'No autorizado' })

    const orgId = await getOrganizationId(user.id)
    if (!orgId) return NextResponse.json({ connected: false, error: 'No se encontró tu organización' })

    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    // Consultamos el servidor Baileys local
    // Aumentamos el timeout para el caso de pairing code a 35s
    const controller = new AbortController()
    const isPairing = !!phone
    const timeout = setTimeout(() => controller.abort(), isPairing ? 40000 : 8000)

    // Si viene un teléfono, solicitamos el código de vinculación (Pair Code)
    if (phone) {
      try {
        const pairRes = await fetch(`${BAILEYS_SERVER}/api/pair/${orgId}?phone=${phone}`, {
          headers: { 'x-api-key': API_KEY },
          signal: controller.signal
        })
        clearTimeout(timeout)
        const pairData = await pairRes.json()
        return NextResponse.json({
          connected: false,
          code: pairData.code,
          error: pairData.error,
          orgId
        })
      } catch (e: any) {
        clearTimeout(timeout)
        return NextResponse.json({ connected: false, error: 'Timeout o error al generar código. Intenta de nuevo.' })
      }
    }

    const response = await fetch(
      `${BAILEYS_SERVER}/status/${orgId}`,
      {
        headers: { 'x-api-key': API_KEY },
        signal: controller.signal
      }
    )
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json({ connected: false, error: 'Servidor Baileys no disponible' })
    }

    const data = await response.json()

    // Si no está conectado, podemos intentar obtener el QR para devolverlo al front
    let qr = null;
    if (data.status !== 'connected') {
      const qrRes = await fetch(`${BAILEYS_SERVER}/qr/${orgId}`, {
        headers: { 'x-api-key': API_KEY }
      });
      if (qrRes.ok) {
        const qrData = await qrRes.json();
        qr = qrData.qr;
      }
    }

    return NextResponse.json({
      connected: data.status === 'connected',
      state: data.status,
      qr: qr,
      orgId: orgId
    })

  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      error: error.message
    })
  }
}

export async function POST() {
  // En Baileys el POST no es necesario para webhook (ya está integrado en el servidor nativo)
  return NextResponse.json({
    success: true,
    message: 'Servidor Baileys gestiona sus propios webhooks.'
  })
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })

    const orgId = await getOrganizationId(user.id)
    if (!orgId) return NextResponse.json({ success: false, error: 'No se encontró tu organización' })

    const res = await fetch(`${BAILEYS_SERVER}/session/${orgId}`, {
      method: 'DELETE',
      headers: { 'x-api-key': API_KEY }
    })

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Error al desconectar del servidor físico' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Sesión desconectada y borrada' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
