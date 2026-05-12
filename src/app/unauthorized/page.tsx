'use client'

import Link from 'next/link'
import { ShieldAlert, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Icono */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-400" />
          </div>
        </div>

        {/* Mensaje */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Acceso no autorizado
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Tu cuenta no tiene acceso a este espacio de trabajo.<br />
            Comprueba que estás usando la cuenta correcta o contacta con el administrador.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-semibold rounded-xl transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión e ir al login
          </button>

          <p className="text-[11px] text-slate-600">
            Si crees que esto es un error, contacta con{' '}
            <a href="mailto:admin@sffalcon.com" className="text-blue-500 hover:underline">
              admin@sffalcon.com
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
