"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { OrganizationProvider, useOrganization } from "@/context/OrganizationContext";
import { usePlan } from "@/hooks/usePlan";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import AIAssistant from '@/components/dashboard/AIAssistant';



export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] transition-colors duration-300">
      <OrganizationProvider>
        <SidebarProvider>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </SidebarProvider>
      </OrganizationProvider>
    </div>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { loading: orgLoading } = useOrganization();
  const { loading: planLoading } = usePlan();
  const [minLoadingDone, setMinLoadingDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingDone(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const showOverlay = !minLoadingDone || orgLoading || planLoading;

  return (
    <>
      <LoadingOverlay isVisible={showOverlay} />
      <Sidebar />
      <div className="flex flex-col min-h-screen md:ml-16 lg:ml-56 xl:ml-60">
        <Topbar />
        <main className="p-4 md:p-6 lg:p-8 pb-16 flex-1">
          <Toaster position="bottom-right" />
          {children}


        </main>
      </div>
      <AIAssistant />
    </>

  );
}

// ✅ app/dashboard/layout.tsx — responsive completado
