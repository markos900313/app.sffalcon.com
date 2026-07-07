"use client";

import React from "react";
import {
  Home,
  Clock,
  CalendarDays,
  Palmtree,
  ChevronRight,
  X,
  LayoutDashboard,
  Languages
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/LanguageContext";

import { useSidebar } from "@/app/panel-empleado/SidebarContext";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const supabase = createClient();
  const { isOpen, setIsOpen } = useSidebar();

  const menuItems = [
    { id: "fichaje", label: t("employeePanel.menu.fichaje"), icon: Clock, section: "PANEL" },
    { id: "inicio", label: t("employeePanel.menu.inicio"), icon: Home, section: "PANEL" },
    { id: "turnos", label: t("employeePanel.menu.turnos"), icon: CalendarDays, section: "PANEL" },
    { id: "vacaciones", label: t("employeePanel.menu.vacaciones"), icon: Palmtree, section: "PANEL" },
  ];

  const sections = ["PANEL"];

  // Redirigir a fichaje por defecto al entrar
  React.useEffect(() => {
    if (activeSection === "inicio") {
      setActiveSection("fichaje");
    }
  }, []);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const activeItemClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400";
  const inactiveItemClass = "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5";

  return (
    <div className={cn(
      "w-64 h-[100dvh] border-r border-[var(--border-sidebar)] flex flex-col bg-[var(--bg-sidebar)] fixed left-0 top-0 z-[100] transition-all duration-300 sidebar-responsive",
      isOpen ? "open" : ""
    )}>
      {/* CABECERA - LOGO SF */}
      <div className="h-16 lg:h-20 px-4 flex items-center justify-between border-b border-[var(--border-sidebar)]">
        <div className="flex items-center justify-start">
          <div className="flex items-center gap-4">
            <img src="/icon.svg" alt="SF Logo" className="w-10 h-10 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="text-white text-xl font-bold italic tracking-tight leading-none" style={{ letterSpacing: '0.05em', fontFamily: 'Arial, sans-serif' }}>SF</span>
              <span className="text-[10px] font-medium" style={{ textTransform: 'none', color: '#A3B3D9', letterSpacing: '0' }}>Gestor Empresarial</span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-200">
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 px-2 lg:px-4 flex flex-col gap-6 py-6 overflow-y-auto scrollbar-hide">
        {sections.map((sectionName) => (
          <div key={sectionName} className="flex flex-col gap-1">
            <div className="px-4 flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-bold text-slate-500/70 uppercase tracking-[0.15em]">
                {sectionName === "PANEL" ? t("employeePanel.menu.section") : sectionName}
              </h3>
            </div>

            {menuItems
              .filter((item) => item.section === sectionName)
              .map((item) => {
                const Icon = item.icon || LayoutDashboard;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 transition-all rounded-xl group h-11 text-left",
                      isActive ? activeItemClass : inactiveItemClass
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-transform group-hover:scale-110 shrink-0",
                      isActive ? "text-[#1B4FD8]" : "text-[#64748B] dark:text-[#94A3B8]"
                    )} />
                    <span className={cn(
                      "text-[13px] font-medium tracking-tight truncate",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-[#64748B] dark:text-[#94A3B8]"
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
          </div>
        ))}
      </nav>

      {/* PIE DE PÁGINA FIJO - AJUSTES */}
      <div className="p-4 border-t border-[var(--border-sidebar)]">
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className={cn(
            "flex items-center gap-3 px-3 py-3 transition-all rounded-xl group h-11 w-full mb-1",
            "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
          )}
          title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        >
          <Languages className="w-5 h-5 transition-transform group-hover:scale-110 shrink-0" />
          <span className="text-[13px] font-medium tracking-tight truncate">
            {language === 'es' ? 'EN' : 'ES'}
          </span>
        </button>
      </div>
    </div>
  );
}
