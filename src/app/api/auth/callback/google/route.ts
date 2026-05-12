import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  
  // Guardamos el error de Google si existe
  const googleError = searchParams.get('error')
  if (googleError) {
    console.error('Google Auth Error:', googleError)
    return NextResponse.redirect(
      new URL(`/dashboard/appointments?error=google_auth_failed&details=${googleError}`, req.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/appointments?error=no_code', req.url)
    )
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Manejo de errores en contexto de Server Component
          }
        },
      },
    }
  )

  try {
    // 1. Intercambiar code por tokens de Google
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
        grant_type: 'authorization_code',
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error('Google Token Exchange Error:', data)
      return NextResponse.redirect(
        new URL(`/dashboard/appointments?error=token_exchange_failed&details=${data.error_description || data.error}`, req.url)
      )
    }

    // 2. Obtener usuario actual de Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Supabase Session Error:', userError)
      return NextResponse.redirect(
        new URL('/dashboard/appointments?error=session_lost', req.url)
      )
    }

    // 3. Guardar tokens en la tabla settings
    const { error: updateError } = await supabase
      .from('settings')
      .upsert({
        user_id: user.id,
        google_calendar_token: data.access_token,
        google_calendar_refresh_token: data.refresh_token,
        google_calendar_connected: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (updateError) {
      console.error('Database Update Error:', updateError)
      throw updateError
    }

    return NextResponse.redirect(
      new URL('/dashboard/appointments?calendar=connected', req.url)
    )
  } catch (error: any) {
    console.error('Callback Fatal Error:', error)
    return NextResponse.redirect(
      new URL(`/dashboard/appointments?error=server_error&details=${encodeURIComponent(error.message || 'Unknown error')}`, req.url)
    )
  }
}
