"use client";

import React, { useState, useEffect } from "react";
import { Menu, LogOut, Settings, Bell, HelpCircle, MessageCircle, Mail, X } from "lucide-react";
import Link from "next/link";
import { useSidebar } from '@/contexts/SidebarContext';
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import TrialBanner from '@/components/dashboard/trial/TrialBanner';
import { format, formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const { isOpen, setIsOpen } = useSidebar();
  const { organization } = useOrganization();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!organization?.id || !mounted) return;

    const generateSystemTasks = async () => {
      try {
        const sessionKey = `tasks_gen_${organization.id}`;
        if (sessionStorage.getItem(sessionKey)) return;
        sessionStorage.setItem(sessionKey, 'true');

        const { data, error } = await supabase.rpc('create_followup_tasks', {
          p_org_id: organization.id
        });

        if (!error && data && Number(data) > 0) {
          const count = Number(data);
          await supabase.from('notifications').insert({
            organization_id: organization.id,
            title: 'Nuevas tareas generadas por el sistema',
            message: `${count} tareas de seguimiento creadas automáticamente`,
            type: 'info',
            link: '/dashboard/tareas',
            read: false
          });
        }
      } catch (err) {
        console.error("Error generating system tasks on mount:", err);
      }
    };

    generateSystemTasks();
  }, [organization?.id, mounted, supabase]);

  // Fetch notifications
  useEffect(() => {
    if (organization?.id && mounted) {
      fetchNotifications();

      // Subscribe to changes
      const channel = supabase.channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `organization_id=eq.${organization.id}`
        }, (payload: any) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);
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
      .select('id, title, message, type, read, link, created_at, metadata')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }
  };

  const getTypeDetails = (type: string) => {
    switch (type) {
      case 'success':
        return { emoji: '✅', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)' };
      case 'warning':
        return { emoji: '⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' };
      case 'message':
        return { emoji: '💬', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' };
      case 'appointment':
        return { emoji: '📅', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)' };
      case 'info':
      default:
        return { emoji: 'ℹ️', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: language === 'en' ? enUS : es
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.read) {
      setNotifications(prev =>
        prev.map(item => (item.id === n.id ? { ...item, read: true } : item))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', n.id);
    }

    if (n.link) {
      router.push(n.link);
      setShowNotifications(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!organization?.id) return;
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('organization_id', organization.id)
      .eq('read', false);
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
            title={t('notificaciones')}
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
                <span className="text-white text-sm font-bold">{t('notificaciones')}</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-3 opacity-20">
                    <Bell className="w-10 h-10 text-white" />
                    <span className="text-white text-xs">{t('sinNotificaciones')}</span>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1E3A5F]/50">
                    {notifications.map((n) => {
                      const details = getTypeDetails(n.type);
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-4 hover:bg-white/5 cursor-pointer transition-all duration-200 relative border-l-2 ${
                            !n.read 
                              ? 'bg-white/[0.04]' 
                              : 'bg-transparent'
                          }`}
                          style={{
                            borderLeftColor: !n.read ? details.color : 'transparent'
                          }}
                        >
                          <div className="flex gap-3 items-start">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base shadow-sm"
                              style={{
                                backgroundColor: details.bg,
                                border: `1px solid ${details.border}`,
                              }}
                            >
                              {details.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-bold leading-normal break-words">{n.title}</p>
                              <p className="text-slate-400 text-[11px] mt-1 line-clamp-2 leading-relaxed break-words">{n.message}</p>
                              <p className="text-slate-500 text-[9px] mt-1.5 font-medium">
                                {getRelativeTime(n.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="pt-3 border-t border-[#1E3A5F] mb-4 px-4 flex flex-col gap-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="w-full text-[#3b82f6] text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity py-1.5 text-center"
                  >
                    {language === 'es' ? 'Marcar todas como leídas' : 'Mark all as read'}
                  </button>
                  <button
                    onClick={handleClearNotifications}
                    className="w-full text-red-500/80 text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors py-1 text-center"
                  >
                    {t('limpiarNotificaciones')}
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
            title={t('ayuda')}
          >
            <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Help Dropdown */}
          {showHelp && (
            <div className="dropdown-content fixed md:absolute top-[64px] md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 w-auto md:w-72 max-w-[calc(100vw-32px)] bg-[#111F3A] border border-[#1E3A5F] rounded-2xl shadow-2xl overflow-hidden z-[200] animate-in fade-in slide-in-from-top-1">
              <div className="p-4 border-b border-[#1E3A5F]">
                <span className="text-white text-sm font-bold block">{t('necesitasAyuda')}</span>
                <p className="text-slate-400 text-xs mt-1">{t('contactaSoporte')}</p>
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
                    <p className="text-green-500/60 text-[10px]">{t('whatsappSoporte')}</p>
                  </div>
                </a>
                <a
                  href="mailto:admin@sffalcon.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
                >
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">soporte@sffalcon.com</p>
                    <p className="text-blue-500/60 text-[10px]">{t('correoElectronico')}</p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/settings"
          className="topbar-icon p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all h-9 w-9 md:h-10 md:w-10 flex items-center justify-center border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          title={t('ajustes')}
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
