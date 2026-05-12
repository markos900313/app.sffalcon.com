import React, { useState, useEffect } from "react";
import { Menu, LogOut, User, Bell, Home } from "lucide-react";
import { useSidebar } from "@/app/panel-empleado/SidebarContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TopbarProps {
  staff?: any;
  setActiveSection?: (section: string) => void;
}

export default function Topbar({ staff, setActiveSection }: TopbarProps) {
  const { isOpen, setIsOpen } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (staff?.id && mounted) {
      fetchNotifications();
      
      const channel = supabase
        .channel('employee-notifications')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications'
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [staff?.id, mounted]);

  const fetchNotifications = async () => {
    // Obtener user_id real de auth
    const { data: { user } } = await supabase.auth.getUser();
    const authUserId = user?.id;
    
    if (!authUserId && !staff?.organization_id) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(
        `target_user_id.eq.${authUserId},` +
        `and(target_user_id.is.null,organization_id.eq.${staff.organization_id})`
      )
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
    const { data: { user } } = await supabase.auth.getUser();
    const authUserId = user?.id;
    
    await supabase
      .from('notifications')
      .delete()
      .or(
        `target_user_id.eq.${authUserId},` +
        `and(target_user_id.is.null,organization_id.eq.${staff.organization_id})`
      );
    
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showNotifications) {
        const target = e.target as HTMLElement;
        if (!target.closest('.dropdown-trigger') && !target.closest('.dropdown-content')) {
          setShowNotifications(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!mounted) return null;

  return (
    <header className="h-16 md:h-16 lg:h-20 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-header)] flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-[50] transition-colors duration-300">
      {/* Izquierda: Hamburguesa (Mobile) y Título */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden shrink-0 p-2 text-white hover:bg-white/10 transition-colors rounded-lg flex items-center justify-center"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="md:hidden text-sm font-black uppercase tracking-widest text-white truncate">
          Panel
        </span>
      </div>

      {/* Derecha: Info Usuario & Logout */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notificaciones */}
        <div className="relative dropdown-trigger">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "p-2 rounded-xl transition-all h-10 w-10 flex items-center justify-center relative border border-transparent",
              showNotifications ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] font-black flex items-center justify-center px-1 border-2 border-[#0F172A]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-content fixed md:absolute top-[64px] md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 w-auto md:w-80 max-w-[calc(100vw-32px)] bg-[#111F3A] border border-[#1E3A5F] rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-1">
              <div className="p-4 border-b border-[#1E3A5F] flex items-center justify-between">
                <span className="text-white text-xs font-bold uppercase tracking-widest">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30 font-black">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center opacity-20">
                    <Bell className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-[10px] text-white uppercase font-black">Sin avisos</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1E3A5F]/50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${!n.read ? 'bg-white/[0.02]' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                            n.type === 'error' ? 'bg-red-500' : 
                            n.type === 'warning' ? 'bg-amber-500' : 
                            n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[11px] font-black leading-tight mb-1">{n.title}</p>
                            <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">{n.message}</p>
                            <p className="text-slate-500 text-[8px] mt-1.5 uppercase font-bold tracking-widest">
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
                    className="w-full text-red-500 text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                  >
                    Limpiar notificaciones
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveSection?.("inicio")}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center hover:bg-white/20 transition-all"
            title="Inicio"
          >
            <Home size={16} className="text-white" />
          </button>
        </div>

        <div className="w-px h-8 bg-white/10 mx-1"></div>

        <button 
          onClick={handleLogout}
          className="p-2 text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all h-10 w-10 flex items-center justify-center border border-transparent hover:border-red-500/20"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
