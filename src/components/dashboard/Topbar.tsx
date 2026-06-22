"use client";

import React, { useState, useEffect } from "react";
import { Menu, LogOut, Settings, Bell, HelpCircle, MessageCircle, Mail, X } from "lucide-react";
import Link from "next/link";
import { useSidebar } from '@/contexts/SidebarContext';
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import TrialBanner from '@/components/dashboard/trial/TrialBanner';
import { format } from "date-fns";

export default function Topbar() {
  const { isOpen, setIsOpen } = useSidebar();
  const { organization } = useOrganization();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (organization?.id && mounted) {
      fetchNotifications();

      // Subscribe to changes
      const channel = supabase
        .channel('notifications-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `organization_id=eq.${organization.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [organization?.id, mounted]);

  const fetchNotifications = async () => {
    if (!organization?.id) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    fetchNotifications();
  };

  const handleClearNotifications = async () => {
    if (!organization?.id) return;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('organization_id', organization.id);

    if (!error) {
      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);
    }
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showNotifications || showHelp) {
        const target = e.target as HTMLElement;
        if (!target.closest('.dropdown-trigger') && !target.closest('.dropdown-content')) {
          setShowNotifications(false);
          setShowHelp(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showHelp]);

  if (!mounted) return null;

  return (
    <header className="topbar-container h-16 md:h-16 lg:h-20 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-header)] flex items-center justify-between px-3 md:px-6 lg:px-8 sticky top-0 z-[100] gap-2 md:gap-4 transition-colors duration-300">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="topbar-icon md:hidden p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Trial Indicator - Expandido a lo largo de la barra */}
      <div className="flex items-center justify-center flex-1 min-w-0 px-1 md:px-4 lg:px-8">
        <TrialBanner variant="header" onActivate={() => {
          window.dispatchEvent(new CustomEvent('openUpgradeModal'));
        }} />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 md:gap-3 shrink-0 relative">
        {/* Notifications Icon */}
        <div className="relative dropdown-trigger">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowHelp(false);
            }}
            className={`topbar-icon p-2 transition-all h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-xl border border-transparent ${showNotifications ? 'bg-slate-50 dark:bg-white/5 text-[#0F172A] dark:text-white' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
            title="Notificaciones"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] font-black flex items-center justify-center px-1 border-2 border-[var(--bg-header)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="dropdown-content fixed md:absolute top-[64px] md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 w-auto md:w-80 max-w-[calc(100vw-32px)] bg-[#111F3A] border border-[#1E3A5F] rounded-2xl shadow-2xl overflow-hidden z-[200] animate-in fade-in slide-in-from-top-1">
              <div className="p-4 border-b border-[#1E3A5F] flex items-center justify-between">
                <span className="text-white text-sm font-bold">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-3 opacity-20">
                    <Bell className="w-10 h-10 text-white" />
                    <span className="text-white text-xs">Sin notificaciones</span>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1E3A5F]/50">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 hover:bg-white/5 cursor-pointer transition-colors relative ${!n.read ? 'bg-white/[0.02]' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.type === 'error' ? 'bg-red-500' :
                            n.type === 'warning' ? 'bg-yellow-500' :
                              n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-bold truncate">{n.title}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                            <p className="text-slate-500 text-[9px] mt-1.5 uppercase tracking-wider font-medium">
                              {format(new Date(n.created_at), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="pt-3 border-t border-[#1E3A5F] mb-4 px-4">
                  <button
                    onClick={handleClearNotifications}
                    className="w-full text-red-500 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                  >
                    Limpiar notificaciones
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Icon */}
        <div className="relative dropdown-trigger">
          <button
            onClick={() => {
              setShowHelp(!showHelp);
              setShowNotifications(false);
            }}
            className={`topbar-icon p-2 transition-all h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-xl border border-transparent ${showHelp ? 'bg-slate-50 dark:bg-white/5 text-[#0F172A] dark:text-white' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
            title="Ayuda"
          >
            <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Help Dropdown */}
          {showHelp && (
            <div className="dropdown-content fixed md:absolute top-[64px] md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 w-auto md:w-72 max-w-[calc(100vw-32px)] bg-[#111F3A] border border-[#1E3A5F] rounded-2xl shadow-2xl overflow-hidden z-[200] animate-in fade-in slide-in-from-top-1">
              <div className="p-4 border-b border-[#1E3A5F]">
                <span className="text-white text-sm font-bold block">¿Necesitas ayuda?</span>
                <p className="text-slate-400 text-xs mt-1">Contacta con soporte directamente:</p>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <a
                  href="https://wa.me/34651398878"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors group"
                >
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">+34 604 989 742</p>
                    <p className="text-green-500/60 text-[10px]">WhatsApp Soporte</p>
                  </div>
                </a>
                <a
                  href="mailto:admin@sffalcon.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
                >
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">soporte@sffalcon.com</p>
                    <p className="text-blue-500/60 text-[10px]">Correo Electrónico</p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/settings"
          className="topbar-icon p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all h-9 w-9 md:h-10 md:w-10 flex items-center justify-center border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          title="Ajustes"
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
        </Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="topbar-icon p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all h-9 w-9 md:h-10 md:w-10 flex items-center justify-center border border-transparent hover:border-red-500/20"
          title="Cerrar Sesión"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </header>
  );
}
