'use client'

import Link from 'next/link'
import { ShieldAlert, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const errorNotice = t('unauthorized.errorNotice')
  const parts = errorNotice.split('{email}')

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
            {t('unauthorized.title')}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
            {t('unauthorized.desc')}
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
            {t('unauthorized.logoutBtn')}
          </button>

          <p className="text-[11px] text-slate-600">
            {parts[0]}
            <a href="mailto:admin@sffalcon.com" className="text-blue-500 hover:underline">
              admin@sffalcon.com
            </a>
            {parts[1]}
          </p>
        </div>
      </div>
    </div>
  )
}
