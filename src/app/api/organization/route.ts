import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrganization } from '@/lib/getOrganization'

function getSubdomainSlug(host: string): string {
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return process.env.NEXT_PUBLIC_SUBDOMAIN_SLUG ?? 'admin'
  }
  const parts = host.split('.')
  return parts[0]
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const host = request.headers.get('host') || ''
    const slug = getSubdomainSlug(host)

    const organization = await getOrganization(user.id, slug)
    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Error in /api/organization:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const host = request.headers.get('host') || ''
    const slug = getSubdomainSlug(host)

    const body = await request.json()
    const { name, sector, phone, email_channel } = body

    const organization = await getOrganization(user.id, slug)
    if (!organization) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    await supabase
      .from('organizations')
      .update({ name, sector, phone, email_channel, updated_at: new Date().toISOString() })
      .eq('id', organization.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/organization:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
