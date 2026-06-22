"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, Smartphone, Mail, Bot, Inbox, X, MoreHorizontal, Trash2, Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/app/(dashboard)/dashboard/communications/page";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/LanguageContext";

const tabs = [
  { id: "todos", labelKey: "communications.tabs.all" },
  { id: "correos", labelKey: "communications.tabs.emails" },
  { id: "whatsapp", labelKey: "communications.tabs.whatsapp" },
  { id: "respondidos", labelKey: "communications.tabs.responded" },
  { id: "pendientes", labelKey: "communications.tabs.pending" },
];

export default function ConversationList({
  conversations,
  onSelect,
  selectedId,
  loading,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  userId,
  onRefresh,
  onOpenSettings
}: {
  conversations: Conversation[],
  onSelect: (c: Conversation) => void,
  selectedId?: string,
  loading?: boolean,
  filter: string,
  setFilter: (f: string) => void,
  searchTerm: string,
  setSearchTerm: (s: string) => void,
  userId: string | null,
  onRefresh: () => void,
  onOpenSettings?: () => void
}) {
  const { t } = useLanguage();

  const parsePreview = (content: string): string => {
    if (!content) return ''
    try {
      const parsed = JSON.parse(content)
      if (parsed?.text) return parsed.text
    } catch { }
    return content
  }

  const filteredConversations = useMemo(() => {
    let result = conversations;

    if (filter === "correos") result = result.filter(c => c.channel === 'email');
    if (filter === "whatsapp") result = result.filter(c => c.channel === 'whatsapp');
    if (filter === "respondidos") result = result.filter(c => c.status === 'responded' || c.status === 'resolved');
    if (filter === "pendientes") result = result.filter(c => c.status === 'pending' || c.status === 'urgent' || c.status === 'seen');

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.contact_name.toLowerCase().includes(lowSearch) ||
        parsePreview(c.last_message || '').toLowerCase().includes(lowSearch)
      );
    }

    return result;
  }, [conversations, filter, searchTerm]);

  const formatWhatsAppIdentifier = (id: string | undefined) => {
    if (!id) return 'WhatsApp'
    const clean = id.split('@')[0].replace(/\D/g, '')
    if (clean.length > 11) return 'Cliente WhatsApp'
    if (clean.length >= 9) return `+${clean}`
    return 'Cliente WhatsApp'
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A1628] transition-colors duration-150">
      <div className="p-4 md:p-5 lg:p-6 border-b border-slate-100 dark:border-[#111F3A]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl lg:text-[24px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-[-0.02em]">
            {t('communications.title')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSettings?.()}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              title={t('communications.info')}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
          {tabs.map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition-all duration-150 whitespace-nowrap shrink-0",
                  tab.id === filter
                    ? "bg-[#EFF6FF] dark:bg-[#1B4FD8] text-[#1B4FD8] dark:text-white rounded-lg dark:rounded-full"
                    : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#162040] rounded-lg dark:rounded-full"
                )}
              >
                {t(tab.labelKey as any)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-b border-slate-100 dark:border-[#111F3A]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] dark:text-[#475569]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('communications.searchPlaceholder')}
            className="w-full bg-[#F1F5F9] dark:bg-[#0D1B35] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl py-2 pl-10 pr-4 text-[14px] outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:border-[#1B4FD8] transition-all duration-150 font-normal text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-[#475569] min-h-[40px]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin dark:scrollbar-thumb-[#1E3A5F] dark:scrollbar-track-transparent">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-5 border-b border-slate-50 dark:border-[#111F3A] animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#162040]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 dark:bg-[#162040] rounded w-1/3" />
                  <div className="h-3 bg-slate-50 dark:bg-[#162040]/50 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center opacity-60">
            <Inbox className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">{t('communications.noConversations')}</p>
            <p className="text-[11px] text-[#94A3B8] dark:text-[#475569]">{t('communications.messagesAppearHere')}</p>
          </div>
        ) : (
          <ConversationListContent
            conversations={filteredConversations}
            selectedId={selectedId}
            onSelect={onSelect}
            parsePreview={parsePreview}
            onRefresh={onRefresh}
          />
        )}
      </div>


    </div>
  );
}

function ConversationListContent({
  conversations,
  selectedId,
  onSelect,
  parsePreview,
  onRefresh
}: {
  conversations: Conversation[],
  selectedId?: string,
  onSelect: (c: Conversation) => void,
  parsePreview: (c: string) => string,
  onRefresh: () => void
}) {
  const supabase = createClient();
  const { t } = useLanguage();
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({});
  const [chatToDelete, setChatToDelete] = useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!chatToDelete) return;
    setIsDeleting(true);
    try {
      // 1. Borrar mensajes
      const { error: msgErr } = await supabase
        .from('messages')
        .delete()
        .eq('communication_id', chatToDelete.id);

      if (msgErr) throw msgErr;

      // 2. Borrar la comunicación
      const { error: commErr } = await supabase
        .from('communications')
        .delete()
        .eq('id', chatToDelete.id);

      if (commErr) throw commErr;

      toast.success(t('communications.toast.deleted'));
      setChatToDelete(null);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      toast.error(t('communications.toast.deleteError') + ": " + (err.message || "Desconocido"));
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const resolveNames = async () => {
      // 1. Filtrar identificadores que parecen emails
      const emailsToResolve = conversations
        .map(c => c.contact_email || c.contact_identifier || c.contact_name)
        .filter(id => id?.includes('@'));

      if (emailsToResolve.length === 0) return;

      try {
        const { data: clients } = await supabase
          .from('clients')
          .select('name, email')
          .in('email', emailsToResolve);

        if (clients) {
          const mapping = clients.reduce((acc: Record<string, string>, curr: { email: string; name: string }) => ({
            ...acc,
            [curr.email.toLowerCase()]: curr.name
          }), {});
          setResolvedNames(prev => ({ ...prev, ...mapping }));
        }
      } catch (e) {
        console.error("Error resolving names in list:", e);
      }
    };

    resolveNames();
  }, [conversations, supabase]);

  return (
    <>
      {conversations.map((chat) => {
        const displayName = chat.contact_name
          || chat.contact_identifier?.split('@')[0]
          || t('communications.contactFallback');

        return (
          <div
            key={chat.id}
            onClick={() => onSelect(chat)}
            className={cn(
              "p-3 md:p-4 lg:p-5 border-b border-slate-50 dark:border-[#111F3A] cursor-pointer transition-all duration-150 relative group",
              selectedId === chat.id
                ? "bg-[#EFF6FF] dark:bg-[#111F3A] border-l-2 border-l-[#1B4FD8]"
                : "bg-transparent hover:bg-slate-50 dark:hover:bg-[#111F3A] mx-0 dark:mx-1 dark:rounded-xl"
            )}
            onMouseLeave={() => setMenuOpenId(null)}
          >
            <div className="flex items-start gap-2.5 md:gap-3 lg:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-slate-100 dark:bg-[#162040] flex items-center justify-center relative shrink-0 transition-transform duration-150 group-hover:scale-105">
                {chat.channel === "whatsapp" ? (
                  <Smartphone className="w-3.5 h-3.5 text-[#25D366] absolute -bottom-1 -right-1 bg-white dark:bg-[#162040] rounded-full p-0.5" />
                ) : (
                  <Mail className="w-3.5 h-3.5 text-[#1B4FD8] absolute -bottom-1 -right-1 bg-white dark:bg-[#162040] rounded-full p-0.5" />
                )}
                <span className="font-semibold text-[10px] md:text-[11px] lg:text-[13px] text-[#64748B] dark:text-blue-400">
                  {displayName ? displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() : '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start md:items-center gap-1 mb-0.5 md:mb-1">
                  <p className="text-[12px] md:text-[13px] lg:text-[14px] font-medium text-[#0F172A] dark:text-[#F1F5F9] truncate tracking-tight">
                    {displayName}
                  </p>
                  <div className="flex items-center gap-1.5 relative">
                    <span className="text-[8px] md:text-[9px] lg:text-[11px] font-normal text-[#64748B] dark:text-[#475569] whitespace-nowrap ml-1">
                      {(() => {
                        try {
                          return new Date(chat.updated_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                          });
                        } catch (e) {
                          return '--:--';
                        }
                      })()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E3A5F] transition-all text-[#64748B] dark:text-[#94A3B8]"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {menuOpenId === chat.id && (
                      <div className="absolute right-0 top-6 z-30 w-48 bg-white dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setChatToDelete(chat);
                            setMenuOpenId(null);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[12px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t('communications.deleteConversation')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] md:text-[11px] lg:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate mb-2 lg:mb-3">
                  {parsePreview(chat.last_message || '')}
                </p>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] md:text-[9px] lg:text-[11px] font-semibold tracking-[0.05em] uppercase border whitespace-nowrap transition-colors duration-150",
                    chat.status === "pending" || chat.status === "seen" ? "bg-[#FEF3C7] dark:bg-[#F59E0B]/15 text-[#D97706] dark:text-[#F59E0B] border-transparent dark:border-[#F59E0B]/30" :
                      chat.status === "resolved" ? "bg-[#D1FAE5] dark:bg-[#10B981]/15 text-[#059669] dark:text-[#10B981] border-transparent dark:border-[#10B981]/30" :
                        "bg-blue-100 dark:bg-blue-900/15 text-blue-600 dark:text-blue-400 border-transparent dark:border-blue-500/30"
                  )}>
                    {chat.status === 'pending' || chat.status === 'seen' ? t('communications.status.pending') :
                      chat.status === 'responded' ? t('communications.status.responded') : t('communications.status.resolved')}
                  </span>
                  {chat.responded_by === 'ai' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-[#6366F1]/15 rounded-full text-[8px] md:text-[9px] lg:text-[11px] font-medium text-[#64748B] dark:text-[#818CF8] tracking-[0.05em] uppercase whitespace-nowrap border border-slate-200 dark:border-[#6366F1]/30 transition-colors duration-150">
                      <Bot className="w-2.5 h-2.5" />
                      {t('communications.status.auto')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <DeleteConfirmationModal
        isOpen={!!chatToDelete}
        onClose={() => setChatToDelete(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}


function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  loading
}: {
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  loading: boolean
}) {
  const { t } = useLanguage();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111F3A] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-[#1E3A5F] animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 text-red-500">
          <Trash2 className="w-6 h-6" />
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">{t('communications.deleteModal.title')}</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t('communications.deleteModal.desc')}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors uppercase tracking-tight"
          >
            {t('common.cancel')}
          </button>
          <button
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-tight"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
