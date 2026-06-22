"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Topbar from "@/components/panel-empleado/Topbar";
import Sidebar from "@/components/panel-empleado/Sidebar";
import Dashboard from "@/components/panel-empleado/Dashboard";
import Fichaje from "@/components/panel-empleado/Fichaje";
import Turnos from "@/components/panel-empleado/Turnos";
import Vacaciones from "@/components/panel-empleado/Vacaciones";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function PanelEmpleadoPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();
  const [activeSection, setActiveSection] = useState("inicio");
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from('staff')
      .select('*, organizations(name)')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      // Si no es staff, no debería estar aquí (el middleware ya lo maneja pero por seguridad)
      router.replace("/dashboard");
      return;
    }

    setStaff(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#1B4FD8] animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('employeePanel.loading')}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "inicio":
        return <Dashboard staff={staff} />;
      case "fichaje":
        return <Fichaje staff={staff} />;
      case "turnos":
        return <Turnos staff={staff} />;
      case "vacaciones":
        return <Vacaciones staff={staff} />;
      default:
        return <Dashboard staff={staff} />;
    }
  };

  return (
    <>
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      <div className="flex flex-col min-h-screen">
        <Topbar staff={staff} setActiveSection={setActiveSection} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-16">
          <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
}
