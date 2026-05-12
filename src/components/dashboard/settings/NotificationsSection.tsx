"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateNotificationSetting } from "@/lib/supabase/queries/profile";
import toast from "react-hot-toast";

export default function NotificationsSection({ initialSettings, user }: { initialSettings: any, user: any }) {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  const handleToggle = async (field: string, value: boolean) => {
    // Optimistic update
    setSettings({ ...settings, [field]: value });
    
    try {
      await updateNotificationSetting(user.id, field, value);
      toast.success("Preferencia actualizada");
    } catch (error) {
      toast.error("Error al guardar preferencia");
      // Rollback
      setSettings(settings);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-6 sm:p-8 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          Notificaciones
        </h3>
      </div>

      <div className="space-y-6 divide-y divide-gray-50 dark:divide-[#1E3A5F]">
        <ToggleItem 
          title="Alertas de sistema" 
          description="Notificaciones críticas sobre el estado del servidor." 
          enabled={settings?.system_alerts}
          onToggle={(val) => handleToggle('system_alerts', val)}
        />
        <ToggleItem 
          title="Nuevos Contactos" 
          description="Aviso inmediato cuando entra un nuevo contacto." 
          enabled={settings?.new_leads}
          onToggle={(val) => handleToggle('new_leads', val)}
        />
        <ToggleItem 
          title="Resumen Semanal" 
          description="Reporte de actividad enviado por email los lunes." 
          enabled={settings?.weekly_summary}
          onToggle={(val) => handleToggle('weekly_summary', val)}
        />
        <ToggleItem 
          title="Mensajes nuevos" 
          description="Notificaciones push al recibir comunicaciones." 
          enabled={settings?.new_messages}
          onToggle={(val) => handleToggle('new_messages', val)}
        />
      </div>
    </div>
  );
}

function ToggleItem({ title, description, enabled, onToggle }: { title: string, description: string, enabled: boolean, onToggle: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group">
      <div className="space-y-1">
        <p className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-[#1B4FD8] transition-colors">
          {title}
        </p>
        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-normal leading-tight">
          {description}
        </p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-4 focus:ring-blue-500/10",
          enabled ? "bg-[#1B4FD8]" : "bg-slate-200 dark:bg-[#1E3A5F]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            enabled ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
