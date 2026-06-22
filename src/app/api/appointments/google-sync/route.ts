import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { appointment } = await req.json()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const finalUser = user;

    // Obtener configuración del calendario
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', finalUser.id)
      .maybeSingle()

    if (!settings?.google_calendar_connected) {
      return NextResponse.json({ success: false, message: 'Calendar not connected' })
    }

    let token = settings.google_calendar_token

    // Intentar crear el evento en Google Calendar
    const event = {
      summary: appointment.title,
      description: appointment.notes || 'Cita creada desde SF',
      start: {
        dateTime: `${appointment.date}T${appointment.time}:00`,
        timeZone: 'Europe/Madrid',
      },
      end: {
        // Asignar 1 hora de duración por defecto
        dateTime: `${appointment.date}T${String(parseInt(appointment.time.split(':')[0]) + 1).padStart(2, '0')}:${appointment.time.split(':')[1]}:00`,
        timeZone: 'Europe/Madrid',
      },
    }

    let res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    // Si el token ha expirado (401), intentar refrescarlo
    if (res.status === 401 && settings.google_calendar_refresh_token) {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          refresh_token: settings.google_calendar_refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      const refreshData = await refreshRes.json()

      if (refreshData.access_token) {
        token = refreshData.access_token
        // Guardar nuevo token
        await supabase
          .from('settings')
          .update({ google_calendar_token: token })
          .eq('user_id', finalUser.id)

        // Re-intentar crear el evento
        res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        })
      }
    }

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Google Sync Error:', errorData)
      return NextResponse.json({ success: false, error: errorData }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server Sync Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
