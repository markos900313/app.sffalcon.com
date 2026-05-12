"use client";

import React from "react";
import { Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleCalendarButtonProps {
  isConnected: boolean;
  isLoading: boolean;
}

export default function GoogleCalendarButton({ isConnected, isLoading }: GoogleCalendarButtonProps) {
  const handleConnect = () => {
    if (isConnected || isLoading) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    
    // Scopes necesarios para ver y editar eventos del calendario
    const scope = 'https://www.googleapis.com/auth/calendar.events';
    
    // Construir URL de autorización de Google
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri || '')}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  };

  return (
    <div className="relative group">
      <button 
        onClick={handleConnect}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-3 px-5 py-3 rounded-2xl transition-all shadow-sm border",
          isConnected 
            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default"
            : "bg-white dark:bg-[#111F3A] border-slate-200 dark:border-[#1E3A5F] text-slate-700 dark:text-blue-400 hover:border-[#1B4FD8]/50 shadow-sm",
          isLoading && "opacity-50 cursor-wait"
        )}
      >
        {isConnected ? (
          <>
            <CheckCircle size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Google Sync</span>
          </>
        ) : (
          <>
            <Calendar size={14} className="text-[#1B4FD8]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sync Calendar</span>
          </>
        )}
      </button>
      
      {!isConnected && !isLoading && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
          Sincroniza tus citas automáticamente
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
