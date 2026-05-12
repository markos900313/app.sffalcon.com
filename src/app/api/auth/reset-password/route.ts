import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

// 1. Verificamos que las variables de entorno necesarias existan
const resendApiKey = process.env.RESEND_API_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

// Instanciamos Resend
const resend = new Resend(resendApiKey)

// Usamos el cliente de administrador (Service Role) para generar enlaces directos
const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceRole || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  console.log('--- PASSWORD RESET REQUEST START ---')

  try {
    // Verificación de variables de entorno en tiempo de ejecución
    if (!resendApiKey || !supabaseUrl || !supabaseServiceRole) {
      const missing = []
      if (!resendApiKey) missing.push('RESEND_API_KEY')
      if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
      if (!supabaseServiceRole) missing.push('SUPABASE_SERVICE_ROLE_KEY')

      console.error('CRITICAL ERROR: Missing environment variables:', missing.join(', '))
      return NextResponse.json(
        { error: `Missing configuration: ${missing.join(', ')}` },
        { status: 500 }
      )
    }

    let body;
    try {
      body = await request.json()
    } catch (e) {
      console.error('Error parsing request JSON:', e)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { email } = body

    if (!email) {
      console.warn('Warning: Email missing in request body')
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const origin = new URL(request.url).origin
    console.log(`Generating reset link for: ${email} at origin: ${origin}`)

    // 1. Generamos un enlace de recuperación desde el servidor (Modo Administrador)
    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${origin}/update-password`
      }
    })

    if (linkError) {
      console.error('Supabase generateLink error:', {
        message: linkError.message,
        status: linkError.status,
        code: linkError.code
      })
      return NextResponse.json(
        { error: `Link Generation Failed: ${linkError.message}` },
        { status: 500 }
      )
    }

    if (!data.properties?.action_link) {
      console.error('Supabase generated data without action_link:', data)
      return NextResponse.json(
        { error: 'Supabase did not return a valid recovery link' },
        { status: 500 }
      )
    }

    const resetLink = data.properties.action_link
    console.log('Reset link generated successfully')

    // 2. Enviamos el correo con Resend
    console.log('Sending email via Resend...')
    const { data: resendData, error: sendError } = await resend.emails.send({
      from: 'SF Gestor Empresarial <noreply@sffalcon.com>',
      to: email,
      subject: '🔑 Restablece tu contraseña - SF',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
             <h1 style="color: #1B4FD8; margin-bottom: 10px;">Recupera tu acceso</h1>
             <p style="font-size: 16px; color: #666;">Hemos recibido una solicitud para restablecer tu contraseña en SF.</p>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 12px; padding: 30px; text-align: center;">
            <p style="font-size: 15px; margin-bottom: 25px;">Pulsa el botón de abajo para establecer una nueva contraseña. Este enlace funcionará en cualquier dispositivo y navegador.</p>
            
            <a href="${resetLink}" 
               style="background-color: #1B4FD8; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              RESTABLECER CONTRASEÑA
            </a>
          </div>
          
          <p style="font-size: 13px; color: #999; margin-top: 30px; text-align: center;">
            Si no has solicitado este cambio, puedes ignorar este correo con total seguridad.
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 40px; padding-top: 20px; text-align: center; font-size: 12px; color: #bbb;">
            © 2026 SF Gestor Empresarial • Hecho con <span style="color: #1B4FD8;">♥</span> en España
          </div>
        </div>
      `
    })

    if (sendError) {
      console.error('Resend API Error:', sendError)
      return NextResponse.json(
        { error: `Email Delivery Failed: ${sendError.message}` },
        { status: 500 }
      )
    }

    console.log('Email sent successfully:', resendData?.id)
    console.log('--- PASSWORD RESET REQUEST SUCCESS ---')
    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('UNEXPECTED CRASH in reset-password route:', {
      error: err.message,
      stack: err.stack,
      name: err.name
    })
    return NextResponse.json(
      { error: `Internal Server Error: ${err.message}` },
      { status: 500 }
    )
  }
}

