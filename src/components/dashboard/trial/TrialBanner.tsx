import { useEffect, useState } from 'react'
import { useOrganization } from '@/context/OrganizationContext'

interface TrialStatus {
  status: 'trial' | 'active' | 'expired'
  plan: string
  daysLeft: number | null
  showWarning: boolean
  showUrgent: boolean
  message?: string
}

interface TrialBannerProps {
  variant?: 'sidebar' | 'header'
  onActivate?: () => void
}

export default function TrialBanner({ variant = 'sidebar', onActivate }: TrialBannerProps) {
  const { organization } = useOrganization()
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)

  useEffect(() => {
    if (!organization?.id) return
    fetch('/api/trial/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId: organization.id })
    })
    .then(r => r.json())
    .then(data => setTrialStatus(data))
    .catch(err => console.error('Error checking trial status:', err))
  }, [organization?.id])

  if (!trialStatus) return null
  if (trialStatus.status === 'active' && !trialStatus.daysLeft) return null

  const daysLeft = trialStatus.daysLeft ?? 0;

  const handleAction = () => {
    if (onActivate) {
      onActivate()
    } else {
      window.location.href = '/precios'
    }
  }

  // VARIANT: HEADER
  if (variant === 'header') {
    if (trialStatus.status === 'expired') {
      return (
        <div className="flex items-center justify-between w-full h-11 bg-red-500/10 border border-red-500/20 rounded-xl px-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse shrink-0" />
            <span className="text-xs font-bold text-red-400 truncate">
              <span className="md:hidden">Prueba expirada. Activa plan.</span>
              <span className="hidden md:inline">Tu periodo de prueba ha expirado. Activa tu plan para recuperar el acceso.</span>
            </span>
          </div>
          <button 
            onClick={handleAction}
            className="flex items-center gap-2 text-[11px] font-black text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-red-500/20 whitespace-nowrap ml-4"
          >
            ACTIVAR PLAN AHORA
          </button>
        </div>
      )
    }

    if (daysLeft <= 14) {
      return (
        <div className="flex items-center justify-between w-full h-11 bg-orange-600/10 border border-orange-500/20 rounded-xl px-4 animate-in fade-in slide-in-from-top-2 duration-500 backdrop-blur-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse shrink-0" />
            <span className="text-xs font-bold text-orange-400 truncate">
              <span className="md:hidden">Prueba: {daysLeft} días restantes</span>
              <span className="hidden md:inline">Tu periodo de prueba finaliza en <span className="text-orange-300 underline decoration-orange-500/50 underline-offset-2">{daysLeft} días</span>. ¡Activa tu cuenta ahora!</span>
            </span>
          </div>
          <button 
            onClick={handleAction}
            className="flex items-center gap-2 text-[11px] font-black text-white bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-orange-500/20 whitespace-nowrap ml-4"
          >
            ACTIVAR AHORA
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3 h-11 bg-blue-600/10 border border-blue-500/20 rounded-xl px-4 animate-in fade-in duration-500">
        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse shrink-0" />
        <span className="text-xs font-bold text-blue-400 truncate flex-1">
          <span className="md:hidden">Plan PRO: {daysLeft} días</span>
          <span className="hidden md:inline">Plan PRO Activo · Te quedan <span className="text-blue-300 underline decoration-blue-500/50 underline-offset-2">{daysLeft} días</span> de tu periodo actual.</span>
        </span>
      </div>
    )
  }

  // VARIANT: SIDEBAR (LOGIC DEFAULT)
  
  // 1. Si daysLeft > 14 -> no mostrar nada
  if (trialStatus.status === 'active' && daysLeft > 14) return null;

  // 2. Trial expirado
  if (trialStatus.status === 'expired') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-3">
        <p className="text-red-400 font-bold text-[10px] leading-tight mb-1">
          Tu prueba ha finalizado
        </p>
        <p className="text-red-300/60 text-[9px] leading-tight mb-2">
          Activa tu plan para seguir usando todas las funciones
        </p>
        <button 
          onClick={handleAction}
          className="w-full py-1.5 bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold rounded-lg transition-all"
        >
          ACTIVAR PLAN
        </button>
      </div>
    )
  }

  // 3. Si daysLeft entre 8 y 14 -> banner amarillo suave (sin botón)
  if (daysLeft >= 8 && daysLeft <= 14) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-3">
        <p className="text-yellow-400 font-bold text-[10px] leading-tight text-center">
          Tu prueba termina en {daysLeft} días
        </p>
      </div>
    )
  }

  // 4. Si daysLeft <= 7 -> banner naranja con botón
  if (daysLeft <= 7) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-3">
        <p className="text-orange-400 font-bold text-[10px] leading-tight mb-1">
          ⚠️ Trial termina en {daysLeft} días
        </p>
        <p className="text-orange-300/60 text-[9px] leading-tight mb-2">
          Activa tu plan ahora para no perder el acceso
        </p>
        <button 
          onClick={handleAction}
          className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-bold rounded-lg transition-all"
        >
          ACTIVAR AHORA
        </button>
      </div>
    )
  }

  return null;
}
