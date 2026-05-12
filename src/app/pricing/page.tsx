'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PricingPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir al dashboard ya que ahora usamos un modal integrado en Ajustes
    router.replace('/dashboard/settings')
  }, [router])

  return (
    <div className="min-h-screen bg-[#0A0F1D] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest animate-pulse">
          Redirigiendo a gestión de plan...
        </p>
      </div>
    </div>
  )
}
