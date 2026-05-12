"use client";

import React from "react";
import { useSidebar } from "./SidebarContext";

export default function PanelEmpleadoClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden relative">
      
      {/* Overlay móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-black/50 md:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contenido principal con shell responsivo */}
      <div className="md:ml-60 min-h-screen flex flex-col overflow-x-hidden">
        {/* Página actual */}
        <div className="flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Forzamos el ancho y comportamiento del Sidebar que viene dentro de {children} */
        .sidebar-responsive {
          width: 15rem !important; /* w-60 */
          z-index: 100 !important;
          transition: transform 0.3s ease-in-out !important;
          box-shadow: 10px 0 30px -15px rgba(0,0,0,0.1) !important;
        }

        @media (max-width: 767px) {
          .sidebar-responsive {
            transform: translateX(-100%) !important;
          }
          .sidebar-responsive.open {
            transform: translateX(0) !important;
          }
        }

        @media (min-width: 768px) {
          .sidebar-responsive {
            transform: translateX(0) !important;
            left: 0 !important;
          }
        }

        /* Desactivamos el scroll horizontal global */
        body, html {
          overflow-x: hidden !important;
          position: relative;
          width: 100%;
        }
      `}} />
    </div>
  );
}
