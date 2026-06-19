import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ──────────────────────────────────────────────────────────
//  Extrae el slug del subdominio a partir del host:
//  "admin.sffalcon.com"  → "admin"
//  "localhost:3000"      → valor de NEXT_PUBLIC_SUBDOMAIN_SLUG (fallback dev)
// ──────────────────────────────────────────────────────────
function getSubdomainSlug(host: string): string {
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return process.env.NEXT_PUBLIC_SUBDOMAIN_SLUG ?? 'admin'
  }
  // "admin.sffalcon.com" → partes[0] = "admin"
  const parts = host.split('.')
  return parts[0]
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // No tocar la sesión si hay un código OAuth en curso
  const hasCode = request.nextUrl.searchParams.has('code')
  if (hasCode) return response

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // ── Rutas protegidas sin sesión → login ───────────────────
  if (
    (pathname.startsWith('/dashboard') || pathname.startsWith('/panel-empleado')) &&
    !user
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Usuario autenticado: validar pertenencia al subdominio ─
  if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/panel-empleado'))) {
    const host = request.headers.get('host') || ''
    const slug = getSubdomainSlug(host)
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1')

    let org: { id: string; slug: string; allowed_subdomain: string } | null = null

    if (!isLocal) {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, slug, allowed_subdomain')
        .eq('allowed_subdomain', slug)
        .single()

      if (orgError || !orgData) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      org = orgData
    }

    // ── Comprobar primero si es un empleado (tabla staff) ───
    const { data: staffCheck } = await supabase
      .from('staff')
      .select('id, organization_id')
      .eq('id', user.id)
      .maybeSingle()

    const isStaffOfThisOrg = !!staffCheck && (isLocal || staffCheck.organization_id === org?.id)

    // ── Ruta de empleado: solo exige pertenencia a staff ────
    if (pathname.startsWith('/panel-empleado')) {
      if (!isStaffOfThisOrg) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      return response
    }

    // ── Ruta de dueno (/dashboard) ───────────────────────────
    if (pathname.startsWith('/dashboard')) {
      // Si es empleado, redirigir a su panel sin pedir organization_members
      if (isStaffOfThisOrg) {
        return NextResponse.redirect(new URL('/panel-empleado', request.url))
      }

      if (!isLocal) {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('id, role')
          .eq('user_id', user.id)
          .eq('organization_id', org!.id)
          .eq('status', 'active')
          .maybeSingle()

        if (!membership) {
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
      }

      // ── Onboarding pendiente ─────────────────────────────
      const { data: profileData } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (!profileData?.onboarding_completed && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  // ── Login con sesión activa → redirigir al destino correcto ─
  if (pathname === '/login' && user) {
    const { data: staffRecord } = await supabase
      .from('staff')
      .select('id')
      .eq('id', user.id)
      .single()

    if (staffRecord) {
      return NextResponse.redirect(new URL('/panel-empleado', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/login',
    '/recover',
    '/reset',
    '/auth/callback',
    '/panel-empleado',
    '/panel-empleado/:path*',
  ],
}
