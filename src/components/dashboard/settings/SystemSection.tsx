"use client";

import React, { useState } from "react";
import { Cpu, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function SystemSection({ user }: { user: any }) {
  const orgId = user ? `SFF-${user.id.slice(0, 4).toUpperCase()}` : "SFF-0000";
  const environment = process.env.NODE_ENV === 'production' ? 'Producción' : 'Desarrollo';

  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleClearData = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro? Esto borrará:\n\n' +
      '• Configuración local del navegador\n' +
      '• Historial de conversaciones con la IA\n' +
      '• Todos los contactos y mensajes ' +
      'de Comunicaciones\n\n' +
      'Esta acción no se puede deshacer.'
    )

    if (!confirmed) return

    setLoading(true)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        // 1. Borrar historial IA
        const { error: aiError } = await supabase
          .from('ai_conversations')
          .delete()
          .eq('user_id', authUser.id)

        if (aiError) {
          console.error('Error borrando IA:', aiError)
        }

        // 2. Borrar mensajes de comunicaciones
        const { data: convs } = await supabase
          .from('communications')
          .select('id')
          .eq('user_id', authUser.id)

        if (convs && convs.length > 0) {
          const convIds = convs.map((c: any) => c.id)
          
          await supabase
            .from('messages')
            .delete()
            .in('communication_id', convIds)
        }

        // 3. Borrar conversaciones
        const { error: commsError } = await supabase
          .from('communications')
          .delete()
          .eq('user_id', authUser.id)

        if (commsError) {
          console.error('Error borrando comms:', commsError)
        }
      }

      // 4. Limpiar datos locales
      localStorage.clear()
      sessionStorage.clear()

      toast.success('Todos los datos han sido eliminados')

      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error('Error al borrar datos:', error)
      toast.error('Error al borrar los datos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-6 sm:p-8 shadow-sm transition-colors mb-20">
      <div className="flex items-center gap-3 mb-8">
        <Cpu className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          Sistema
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <SystemInfo label="Versión" value="v1.0.0 Beta" />
        <SystemInfo label="ID Organización" value={orgId} />
        <SystemInfo label="Entorno" value={environment} />
      </div>

      <div className="pt-8 border-t border-[#E2E8F0] dark:border-[#1E3A5F]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 bg-red-50/30 dark:bg-red-950/10 rounded-xl border border-red-100 dark:border-red-900/30 transition-all">
          <div className="text-center sm:text-left">
            <h4 className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1">
              Zona de peligro
            </h4>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-normal">
              Elimina la configuración local, el historial de chats con la IA y todos los contactos de Comunicaciones.
            </p>
          </div>
          <button
            onClick={handleClearData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#111F3A] border border-red-200 dark:border-red-900/50 text-[12px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all shadow-sm uppercase tracking-wider active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Borrando datos...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Borrar todos los datos
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SystemInfo({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-[#0D1B35] rounded-xl border border-[#E2E8F0] dark:border-[#1E3A5F] transition-all hover:bg-white dark:hover:bg-[#111F3A]">
      <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em]">
        {label}
      </p>
      <p className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
        {value}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-[#1E3A5F] last:border-0 last:py-0">
      <span className="text-[14px] font-normal text-[#64748B] dark:text-[#94A3B8] truncate max-w-[120px] md:max-w-none">
        {label}
      </span>
      <span className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] tabular-nums">
        {value}
      </span>
    </div>
  );
}
