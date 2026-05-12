import { createClient } from '@supabase/supabase-js'

export const getOrganizationId = async (userId: string, allowedSubdomain?: string): Promise<string | null> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)

  if (allowedSubdomain) {
    // Si hay subdominio, filtramos las orgs que pertenecen a ese subdominio
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id')
      .eq('allowed_subdomain', allowedSubdomain)
    
    if (orgs && orgs.length > 0) {
      query = query.in('organization_id', orgs.map(o => o.id))
    }
  }

  const { data } = await query.maybeSingle()
  return data?.organization_id || null
}

export const getOrganization = async (userId: string, allowedSubdomain?: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)

  if (allowedSubdomain) {
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id')
      .eq('allowed_subdomain', allowedSubdomain)
    
    if (orgs && orgs.length > 0) {
      query = query.in('organization_id', orgs.map(o => o.id))
    }
  }

  const { data: member } = await query.maybeSingle()

  if (!member) return null

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', member.organization_id)
    .single()

  return { ...org, role: member.role }
}
