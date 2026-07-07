"use client";

import React, { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from '@/lib/ThemeContext';
import { updateProfile } from "@/lib/supabase/queries/profile";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/LanguageContext";

const accentColors = [
  { hex: "#1B4FD8", name: "colorAzul" },
  { hex: "#10B981", name: "colorVerde" },
  { hex: "#EF4444", name: "colorRojo" },
  { hex: "#F59E0B", name: "colorAmbar" },
  { hex: "#8B5CF6", name: "colorVioleta" },
];

export default function AppearanceSection({ profile, user }: { profile: any, user: any }) {
  const { t } = useLanguage();
  return null;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accent, setAccent] = useState(profile?.accent_color || "#1B4FD8");

  useEffect(() => {
    setMounted(true);
    if (profile?.accent_color) setAccent(profile.accent_color);
  }, [profile]);

  const handleSetTheme = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    try {
      await updateProfile(user.id, { theme: newTheme });
      localStorage.setItem('asistente_theme', newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const handleSetAccent = async (color: string) => {
    setAccent(color);
    try {
      await updateProfile(user.id, { accent_color: color });
      localStorage.setItem('asistente_accent', color);
      toast.success(t('colorAcentoActualizado'));
    } catch (error) {
      toast.error(t('errorGuardarColorAcento'));
    }
  };

  if (!mounted) {
    return <div className="h-40 bg-white dark:bg-[#111F3A] rounded-lg animate-pulse" />;
  }

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] p-6 sm:p-8 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-8">
        <Palette className="w-5 h-5 text-[#1B4FD8]" />
        <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          {t('apariencia')}
        </h3>
      </div>

      <div className="space-y-10">
        {/* Theme Selector */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em] ml-1">
            {t('modoVisualizacion')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ThemeCard
              id="claro"
              label={t('claro')}
              active={theme === "light"}
              onClick={() => handleSetTheme("light")}
              previewClass="bg-white border-gray-100"
              barClass="bg-gray-200"
            />
            <ThemeCard
              id="oscuro"
              label={t('oscuro')}
              active={theme === "dark"}
              onClick={() => handleSetTheme("dark")}
              previewClass="bg-[#0F172A] border-slate-800"
              barClass="bg-slate-700"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function ThemeCard({ id, label, active, onClick, previewClass, barClass }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 group transition-all",
        active ? "cursor-default" : "opacity-80 hover:opacity-100"
      )}
    >
      <div className={cn(
        "w-full h-32 rounded-xl border-2 flex items-center justify-center p-4 overflow-hidden bg-[#F8FAFC] dark:bg-[#111F3A]",
        active ? "border-[#1B4FD8]" : "border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#CBD5E1] dark:hover:border-[#475569]"
      )}>
        <div className={cn("w-full h-full rounded-lg border shadow-sm p-3 space-y-2", previewClass)}>
          <div className={cn("h-2 w-3/4 rounded-full", barClass)} />
          <div className={cn("h-2 w-1/2 rounded-full opacity-50", barClass)} />
          <div className="pt-2 flex gap-1.5">
            <div className={cn("w-4 h-4 rounded-full", barClass)} />
            <div className={cn("w-4 h-4 rounded-full", barClass)} />
          </div>
        </div>
      </div>
      <p className={cn(
        "text-[12px] font-bold uppercase tracking-widest text-center",
        active ? "text-[#1B4FD8]" : "text-[#64748B] dark:text-[#94A3B8]"
      )}>
        {label}
      </p>
    </button>
  );
}
