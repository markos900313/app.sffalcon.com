import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verificar que es llamada legítima (Vercel Cron)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Obtener todas las organizaciones activas
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('active', true)

    if (!orgs) return NextResponse.json({ success: true })

    for (const org of orgs) {
      // Obtener owner de la organización
      const { data: owner } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', org.id)
        .eq('role', 'owner')
        .maybeSingle()

      if (!owner?.user_id) continue

      // Verificar si tiene weekly_summary activo
      const { data: prefs } = await supabase
        .from('notification_settings')
        .select('weekly_summary')
        .eq('user_id', owner.user_id)
        .single()

      if (!prefs?.weekly_summary) continue

      // Calcular estadísticas de la semana
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString()

      const [
        { count: newMessages },
        { count: newClients },
        { count: newAppointments }
      ] = await Promise.all([
        supabase.from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id)
          .eq('sender', 'client')
          .gte('created_at', weekAgoStr),
        supabase.from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id)
          .gte('created_at', weekAgoStr),
        supabase.from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id)
          .gte('created_at', weekAgoStr)
      ])

      await supabase.from('notifications').insert({
        organization_id: org.id,
        target_user_id: owner.user_id,
        title: 'Resumen semanal',
        message: `Esta semana: ${newMessages || 0} mensajes, ${newClients || 0} contactos nuevos, ${newAppointments || 0} citas`,
        type: 'info',
        read: false
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Cron weekly summary error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
