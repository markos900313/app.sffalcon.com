import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, email, phone, businessName, country, currency, currencySymbol, plan } = await request.json()

    if (!userId || !businessName) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Verificar que el usuario existe en auth.users con reintentos
    let userExists = false
    let attempts = 0
    while (!userExists && attempts < 10) {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId)
      if (authUser?.user?.id) {
        userExists = true
      } else {
        await new Promise(r => setTimeout(r, 500))
        attempts++
      }
    }

    if (!userExists) {
      return NextResponse.json({ error: 'Usuario no encontrado en Auth' }, { status: 400 })
    }

    // Crear perfil con service role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: '',
        email: email || '',
        onboarding_completed: false
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Continuar aunque falle — el trigger puede haberlo creado ya
    }

    const slug = businessName.toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')


    // 1. Verificar si el nombre ya existe
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', businessName)
      .maybeSingle()

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Ya hay un usuario registrado con este nombre' },
        { status: 400 }
      )
    }

    const isFree = !plan || plan === 'free' || plan === 'gratis'
    const trialEndsAt = !isFree 
      ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      : null

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ 
        name: businessName, 
        slug, 
        country: country || 'ES',
        currency: currency || 'EUR',
        currency_symbol: currencySymbol || '€',
        active: true,
        trial_ends_at: trialEndsAt,
        trial_started_at: new Date().toISOString(),
        trial_used: !isFree,
        onboarding_completed: false,
        working_hours_start: 540, // 09:00
        working_hours_end: 1080, // 18:00
        working_days: [1,2,3,4,5],
        auto_reply_enabled: false,
        plan: isFree ? 'free' : 'pro',
        email: email || null,
        phone: phone || null,
        whatsapp_number: phone || null,
        allowed_subdomain: 'app'
      })
      .select()
      .single()

    if (orgError) {
      console.error("Error org:", orgError);
      throw orgError;
    }

    // 3. Crear Miembro (Dueño)
    const { error: memberError } = await supabase.from('organization_members').insert({
      organization_id: org.id,
      user_id: userId,
      role: 'owner',
    })

    if (memberError) {
      console.error("Error member:", memberError);
      throw memberError;
    }

    // 4. Settings ya inicializados en paso 1 (organizations)

    return NextResponse.json({ success: true, orgId: org.id })
  } catch (error: any) {
    console.error("Error en API create-org:", error);
    return NextResponse.json({ error: error.message || 'Error creando organización' }, { status: 500 })
  }
}
