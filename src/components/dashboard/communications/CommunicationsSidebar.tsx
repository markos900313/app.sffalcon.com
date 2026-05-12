"use client";

import React, { useMemo } from "react";
import { Mail, Smartphone, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/app/(dashboard)/dashboard/communications/page";
import { useOrganization } from "@/context/OrganizationContext";

export default function CommunicationsSidebar({
  conversations = [],
  aiEnabled = false,
  togglingAi = false,
  onToggleAI,
  emailAiEnabled = false,
  togglingEmailAi = false,
  onToggleEmailAI,
}: {
  conversations?: Conversation[];
  aiEnabled?: boolean;
  togglingAi?: boolean;
  onToggleAI?: () => void;
  emailAiEnabled?: boolean;
  togglingEmailAi?: boolean;
  onToggleEmailAI?: () => void;
  // onQuickReply kept for API compatibility but no longer used
  onQuickReply?: (text: string) => void;
}) {
  const { organization } = useOrganization();

  // --- ESTADÍSTICAS ---
  const stats = useMemo(() => {
    const total = conversations.length;
    const respondidos = conversations.filter(c => c.status === 'responded' || c.status === 'resolved').length;
    const porIA = conversations.filter(c => c.responded_by === 'ai').length;
    const pendientes = conversations.filter(c => c.status === 'pending' || c.status === 'seen').length;
    const porcentajeIA = total > 0 ? Math.round((porIA / total) * 100) : 0;
    return { total, respondidos, porcentajeIA, pendientes };
  }, [conversations]);

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 space-y-8 overflow-y-auto scrollbar-thin dark:scrollbar-thumb-[#1E3A5F] dark:scrollbar-track-transparent bg-[#0A1628] transition-colors duration-150">

      {/* Connected Channels */}
      <div className="space-y-4">
        <h3 className="text-[#475569] text-[11px] font-medium uppercase tracking-wider ml-1">
          CANALES CONECTADOS
        </h3>
        <div className="space-y-3">
          <ChannelItem
            icon={<Mail className="w-5 h-5 text-[#1B4FD8]" />}
            label="Email Corporativo"
            sub="Asistente IA Activo"
          />
          <ChannelItem
            icon={<Smartphone className="w-5 h-5 text-[#25D366]" />}
            label="WhatsApp Business"
            sub="Conectado"
          />
        </div>
      </div>

      {/* AI Status — Toggle Control */}
      <div className="bg-[#080F1E] border border-[#1E3A5F] rounded-xl p-4 space-y-4 transition-colors duration-150 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1B4FD8]/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-[#1B4FD8]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#F1F5F9]">
                Automatización IA
              </h4>
              <p className="text-[10px] text-[#475569] leading-tight mt-0.5">
                Asistente gestiona todas las respuestas
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              aiEnabled ? 'text-emerald-500' : 'text-slate-500'
            }`}>
              {aiEnabled ? '● ACTIVA' : '● DESACTIVADA'}
            </span>
            {onToggleAI && (
              <button
                onClick={onToggleAI}
                disabled={togglingAi}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  aiEnabled ? 'bg-blue-600' : 'bg-slate-600'
                } disabled:opacity-50`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  aiEnabled ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            )}
          </div>
        </div>

        {onToggleEmailAI && (
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#1E3A5F]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-[#1B4FD8]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#F1F5F9]">IA Email</h4>
                <p className="text-[10px] text-[#475569] leading-tight mt-0.5">
                  Respuesta automática email
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                emailAiEnabled ? 'text-emerald-500' : 'text-slate-500'
              }`}>
                {emailAiEnabled ? '● ACTIVA' : '● DESACTIVADA'}
              </span>
              <button
                onClick={onToggleEmailAI}
                disabled={togglingEmailAi}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  emailAiEnabled ? 'bg-blue-600' : 'bg-slate-600'
                } disabled:opacity-50`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  emailAiEnabled ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Performance Stats */}
      <div className="space-y-4">
        <h3 className="text-[#64748B] dark:text-[#475569] text-[11px] font-medium uppercase tracking-wider ml-1">
          RENDIMIENTO GLOBAL
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="RECIBIDOS" value={stats.total.toString()} />
          <StatCard label="RESPONDIDOS" value={stats.respondidos.toString()} />
          <StatCard label="POR IA" value={`${stats.porcentajeIA}%`} color="dark:text-[#10B981]" />
          <StatCard label="PENDIENTES" value={stats.pendientes.toString()} color="text-amber-500" />
        </div>
      </div>

    </div>
  );
}

function ChannelItem({ icon, label, sub }: { icon: React.ReactNode, label: string, sub: string }) {
  return (
    <div className="p-3 bg-white dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-xl flex items-center justify-between group transition-all duration-150 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#0D1B35] flex items-center justify-center flex-shrink-0 transition-colors duration-150">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] truncate">{label}</p>
          <p className="text-xs text-[#64748B] dark:text-[#475569] font-normal truncate mt-0.5">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div className="p-4 bg-white dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-xl flex flex-col items-center justify-center text-center shadow-sm transition-all duration-150">
      <span className={cn("text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] tabular-nums mb-1", color)}>
        {value}
      </span>
      <span className="text-[10px] md:text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
