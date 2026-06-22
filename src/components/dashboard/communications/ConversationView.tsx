import React, { useState, useEffect, useRef } from "react";
import { Phone, User, MessageCircle, CheckCircle, Sparkles, ArrowLeft, Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Conversation, SuggestedReply } from "@/app/(dashboard)/dashboard/communications/page";
import { useLanguage } from "@/lib/LanguageContext";

/**
 * ConversationView — Audit / Read-Only mode
 * The AI (Asistente) handles all responses autonomously via Supabase Edge Functions.
 * Users can only scroll and read the conversation history.
 */
export default function ConversationView({
  chat,
  onRefresh,
  onBack,
  // Legacy props kept for API compatibility, no longer used in UI
  initialMessage = "",
  onClearInitialMessage,
  suggestedReply = null,
  onClearSuggestion,
  financeData = null,
  businessData = null
}: {
  chat: Conversation | null,
  onRefresh: () => Promise<void>,
  onBack?: () => void,
  initialMessage?: string,
  onClearInitialMessage?: () => void,
  suggestedReply?: SuggestedReply | null,
  onClearSuggestion?: () => void,
  financeData?: any,
  businessData?: any
}) {
  const supabase = createClient();
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUpdatingStatus = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'instant' });
  };

  useEffect(() => {
    scrollToBottom();

    // Mark messages as read and update status when opening
    if (chat && (chat.status === 'pending' || chat.status === 'urgent') && !isUpdatingStatus.current) {
      const updateStatus = async () => {
        isUpdatingStatus.current = true;
        try {
          await supabase
            .from('messages')
            .update({ read: true })
            .eq('communication_id', chat.id)
            .eq('sender', 'client');

          await supabase
            .from('communications')
            .update({ status: 'seen' })
            .match({ id: chat.id, status: 'pending' });

          await supabase
            .from('communications')
            .update({ status: 'seen' })
            .match({ id: chat.id, status: 'urgent' });

          await onRefresh();
        } catch (e) {
          console.error("Error updating status:", e);
        } finally {
          isUpdatingStatus.current = false;
        }
      };
      updateStatus();
    }
  }, [chat?.id]);

  const [displayName, setDisplayName] = useState(
    chat?.contact_name ||
    chat?.contact_identifier?.split('@')[0] ||
    t('communications.contactFallback')
  );
  const [clientInfo, setClientInfo] = useState<{ id?: string, phone?: string } | null>(null);

  useEffect(() => {
    if (!chat) return;

    const resolve = async () => {
      const email = chat.contact_email || chat.contact_identifier || chat.contact_name;
      const isEmail = email?.includes('@');

      if (isEmail) {
        try {
          const { data: client } = await supabase
            .from('clients')
            .select('name, id, phone')
            .ilike('email', email)
            .maybeSingle();

          if (client) {
            setDisplayName(client.name);
            setClientInfo({ id: client.id, phone: client.phone });
            return;
          }
        } catch (e) {
          console.error("Error fetching client info:", e);
        }
      }

      const name = chat.contact_name
        || chat.contact_identifier?.split('@')[0]
        || t('communications.contactFallback');
      setDisplayName(name);
    };

    resolve();
  }, [chat?.id, chat?.contact_name, supabase]);

  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendReply = async () => {
    if (!chat || !replyText.trim() || sending) return;
    setSending(true);
    try {
      // 1. Guardar mensaje en Supabase
      const { error } = await supabase.from('messages').insert({
        communication_id: chat.id,
        organization_id: chat.organization_id,
        content: replyText.trim(),
        sender: 'human',
        sender_name: 'Equipo'
      });
      if (error) throw error;

      // 2. Si es WhatsApp, enviar por Meta API
      if (chat.channel === 'whatsapp') {
        const clientPhone = chat.contact_identifier;
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organization_id: chat.organization_id,
            to: clientPhone,
            message: replyText.trim()
          })
        });
      }

      // 3. Si es email, enviar por API
      if (chat.channel === 'email') {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organization_id: chat.organization_id,
            to: chat.contact_identifier,
            subject: 'Re: Consulta',
            text: replyText.trim()
          })
        });
      }

      // 4. Actualizar estado conversación
      await supabase.from('communications').update({
        status: 'responded',
        responded_by: 'human',
        updated_at: new Date().toISOString()
      }).eq('id', chat.id);

      setReplyText('');
      await onRefresh();
      toast.success(t('communications.toast.sent'));
    } catch (e) {
      console.error(e);
      toast.error(t('communications.toast.sendError'));
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chat) return;
    if (file.size > 10 * 1024 * 1024) { toast.error(t('communications.toast.max10MB')); return; }
    setUploadingFile(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `attachments/${chat.organization_id}/${chat.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('attachments').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(path);
      await supabase.from('messages').insert({
        communication_id: chat.id,
        organization_id: chat.organization_id,
        content: `📎 ${file.name}`,
        sender: 'human',
        sender_name: 'Equipo',
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      });
      await onRefresh();
      toast.success(t('communications.toast.docSent'));
    } catch (e) {
      console.error(e);
      toast.error(t('communications.toast.uploadError'));
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleMarkResolved = async () => {
    if (!chat) return;
    try {
      const { error } = await supabase
        .from('communications')
        .update({ status: 'resolved' })
        .eq('id', chat.id);

      if (error) throw error;
      await onRefresh();
      toast.success(t('communications.toast.markedResolved'));
    } catch (e) {
      console.error("Resolve Error:", e);
      toast.error(t('communications.toast.updateError'));
    }
  };

  const renderMessageContent = (content: string) => {
    if (!content) return null;

    const isAISuggestion = content.includes('[SUGERENCIA_IA]');
    const cleanContent = content.replace('[SUGERENCIA_IA]', '').trim();

    // Email HTML rendering
    if (chat?.channel === 'email') {
      const hasHTML = /<[a-z][\s\S]*>/i.test(cleanContent);
      if (hasHTML) {
        return (
          <div className="w-full overflow-hidden rounded-lg bg-white/50 dark:bg-black/20 p-2 my-1">
            <div
              className="prose prose-sm dark:prose-invert max-w-full overflow-x-auto text-[13px] leading-relaxed email-body-content"
              style={{ color: 'inherit' }}
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
          </div>
        );
      }
    }

    return (
      <div className="flex flex-col gap-1">
        {isAISuggestion && (
          <div className="flex items-center gap-1.5 mb-1 px-2 py-0.5 bg-blue-500/10 rounded-full w-fit">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Asistente AI</span>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed">
          {cleanContent}
        </p>
      </div>
    );
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 lg:p-12 text-center bg-white dark:bg-[#0D1B35] m-0 md:m-3 lg:m-4 md:rounded-xl border-none md:border border-slate-100 dark:border-[#1E3A5F] transition-colors duration-150 h-full">
        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-blue-50 dark:bg-[#111F3A] rounded-2xl flex items-center justify-center mb-6 transition-all duration-150">
          <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-blue-200 dark:text-[#1E3A5F]" />
        </div>
        <h3 className="text-lg md:text-xl lg:text-[24px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-[-0.02em] mb-2">
          {t('communications.view.title')}
        </h3>
        <p className="text-[11px] md:text-[13px] text-[#64748B] dark:text-[#64748B] font-normal max-w-md text-center">
          {t('communications.view.desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full m-0 md:m-3 lg:m-4 bg-white dark:bg-[#0D1B35] md:rounded-xl border-none md:border border-slate-100 dark:border-[#1E3A5F] shadow-sm overflow-hidden transition-colors duration-150 z-20">
      {/* Header */}
      <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4 border-b border-slate-50 dark:border-[#1E3A5F] flex items-center justify-between bg-white dark:bg-[#0D1B35] backdrop-blur-sm sticky top-0 z-10 min-h-[64px]">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-[#162040] flex items-center justify-center font-semibold text-[9px] md:text-xs text-[#64748B] dark:text-[#1B4FD8] shrink-0 border border-slate-200 dark:border-[#1E3A5F]">
            {displayName ? displayName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase() : '?'}
          </div>
          <div className="min-w-0">
            <h3 className="text-[16px] md:text-[18px] font-bold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight truncate leading-tight">
              {displayName}
            </h3>
            <div className="flex flex-col mt-0.5">
              {!(chat?.contact_identifier?.includes('@lid') || chat?.contact_identifier?.includes('@s.whatsapp.net')) && (
                <p className="text-[10px] md:text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] truncate">
                  {chat?.contact_email || chat?.contact_identifier}
                </p>
              )}
              <p className="text-[9px] md:text-[10px] text-[#94A3B8] dark:text-[#475569] font-normal uppercase tracking-wider">
                {chat?.channel === 'whatsapp' ? 'WhatsApp' : t('communications.viaEmail')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => {
              if (clientInfo?.phone) {
                window.location.href = `tel:${clientInfo.phone}`;
              } else {
                toast.error(t('communications.noPhone'));
              }
            }}
            className="p-2 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#162040] transition-all"
            title={clientInfo?.phone ? t('communications.call') + " " + clientInfo.phone : t('communications.noPhone')}
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const email = chat?.contact_email || chat?.contact_identifier || chat?.contact_name;
              if (clientInfo?.id) {
                window.location.href = `/dashboard/clients?id=${clientInfo.id}`;
              } else {
                window.location.href = `/dashboard/clients?email=${encodeURIComponent(email)}&new=true`;
              }
            }}
            className="p-2 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#162040] transition-all"
            title={t('communications.viewClientCard')}
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area — Scrollable audit log */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 bg-slate-50/10 dark:bg-[#0A1628] scrollbar-thin dark:scrollbar-thumb-[#1E3A5F] dark:scrollbar-track-transparent">
        <div className="max-w-4xl mx-auto w-full">
          <p className="text-center text-[9px] md:text-[11px] font-semibold text-[#94A3B8] dark:text-[#475569] uppercase tracking-[0.12em] py-4">
            {t('communications.historyManagedByAi')}
          </p>

          {chat.messages?.map((msg: any) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-2 max-w-[90%] md:max-w-[85%]",
                msg.sender === 'client' ? "items-start" : "ml-auto items-end"
              )}
            >
              <div className={cn(
                "p-3 md:p-4 rounded-2xl shadow-sm border",
                msg.sender === 'client'
                  ? "bg-white dark:bg-[#111F3A] border-slate-100 dark:border-[#1E3A5F] text-[#0F172A] dark:text-[#F1F5F9] rounded-tl-sm"
                  : "bg-[#1B4FD8] text-white border-blue-400/20 rounded-tr-none"
              )}>
                {renderMessageContent(msg.content)}
              </div>
              <span className="text-[10px] md:text-[11px] font-normal text-[#94A3B8] dark:text-[#475569] mx-1">
                {(() => {
                  try {
                    return new Date(msg.created_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    });
                  } catch (e) {
                    return '--:--';
                  }
                })()}
                {(msg.sender === 'admin' || msg.sender === 'ai') && " • " + t('communications.aiAssistant')}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Footer — Manual reply + Resolved */}
      <div className="p-3 md:p-4 bg-white dark:bg-[#0D1B35] border-t border-slate-50 dark:border-[#1E3A5F] transition-colors duration-150">
        <div className="max-w-4xl mx-auto w-full space-y-2">
          <div className="flex items-end gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('communications.replyPlaceholder')}
              rows={2}
              className="flex-1 bg-slate-50 dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-xl px-4 py-3 text-[13px] text-[#0F172A] dark:text-[#F1F5F9] outline-none focus:border-[#1B4FD8] transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="w-10 h-10 bg-slate-100 dark:bg-[#111F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-[#1B4FD8] hover:border-[#1B4FD8] transition-all disabled:opacity-50"
                title={t('communications.attachDocument')}
              >
                {uploadingFile ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Paperclip className="w-4 h-4" />}
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending || !replyText.trim()}
                className="w-10 h-10 bg-[#1B4FD8] rounded-xl flex items-center justify-center text-white hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                title={t('communications.send')}
              >
                {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-[#475569]">
              {(chat.status as string) === 'requires_human' ? t('communications.aiPaused') : t('communications.aiActive')}
            </span>
            <button
              onClick={handleMarkResolved}
              disabled={chat.status === 'resolved'}
              className="h-7 px-3 bg-[#10B981] text-white rounded-lg flex items-center gap-1.5 font-semibold text-[11px] hover:bg-[#059669] transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {chat.status === 'resolved' ? t('communications.resolved') : t('communications.markResolved')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
