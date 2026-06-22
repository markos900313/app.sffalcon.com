'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  ai_enabled: boolean
  auto_reply_enabled: boolean
  working_hours_start: number
  working_hours_end: number
  working_days: number[]
  whatsapp_number: string | null
  email_channel: string | null
  currency: string
  currency_symbol: string
  country: string
  role: string
  onboarding_completed: boolean
  logo_url: string | null
  ai_personality: string | null
  trial_ends_at?: string | null
  trial_used?: boolean
  business_type: 'autonomo' | 'empresa'
  created_at?: string
  status: 'active' | 'trial' | 'expired'
  archetype?: string
  archetype_modules?: any
  sector_config?: any
  // Geo / location fields
  latitude?: number | null
  longitude?: number | null
  geo_radius?: number | null
  address_geocoded?: string | null
  // Contact / address fields
  address?: string | null
  city?: string | null
  email?: string | null
  phone?: string | null
  sector?: string | null
}

interface OrganizationContextType {
  organization: Organization | null
  loading: boolean
}

const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  loading: true
})

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      if (!user) { setLoading(false); return }

      try {
        const res = await fetch('/api/organization', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        const data = await res.json()
        const org = data?.organization || null

        // El proyecto es ahora universal. Todos los módulos están habilitados por defecto.
        const universalModules = {
          grupo: 'universal',
          tipo: org?.business_type || 'empresa',
          dashboard: { enabled: true },
          communications: { enabled: true, label: 'Mensajes' },
          clients: {
            enabled: true,
            label: 'Clientes',
            pipeline: true,
            campos: ['nombre', 'telefono', 'email', 'notas']
          },
          appointments: {
            enabled: true,
            label: 'Citas',
            modalidades: ['presencial'],
            campos_extra: []
          },
          projects: { enabled: true },
          pipeline: { enabled: true },
          inventory: { enabled: true },
          settings: { enabled: true }
        }
        
        setOrganization(org)
      } catch (e) {
        console.error('Error fetching organization:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <OrganizationContext.Provider value={{ organization, loading }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export const useOrganization = () => useContext(OrganizationContext)
