"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ConversationList from "@/components/dashboard/communications/ConversationList";
import ConversationView from "@/components/dashboard/communications/ConversationView";
import CommunicationsSidebar from "@/components/dashboard/communications/CommunicationsSidebar";
import { createClient } from "@/lib/supabase/client";
import { useOrganization } from "@/context/OrganizationContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import PageSkeleton from "@/components/dashboard/ui/PageSkeleton";


export type Message = {
  id: string;
  communication_id: string;
  sender: 'human' | 'client' | 'ai';
  content: string;
  read: boolean;
  created_at: string;
};

export type Conversation = {
  organization_id: string;
  id: string;
  user_id: string;
  contact_name: string;
  contact_identifier: string;
  contact_phone?: string;
  contact_email?: string;
  channel: 'whatsapp' | 'email';
  status: 'pending' | 'seen' | 'responded' | 'resolved' | 'urgent';
  responded_by?: 'ai' | 'human';
  updated_at: string;
  created_at: string;
  last_message?: string;
  messages?: Message[];
};

// Kept for API compatibility with ConversationView (legacy prop, not used in UI)
export interface SuggestedReply {
  conversationId: string;
  contactName: string;
  text: string;
}

export default function CommunicationsPage() {
  const { organization, loading: orgLoading } = useOrganization();
  const router = useRouter();
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [togglingAi, setTogglingAi] = useState(false);
  const [emailAiEnabled, setEmailAiEnabled] = useState(false);
  const [togglingEmailAi, setTogglingEmailAi] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedChatRef = useRef<Conversation | null>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const currentYear = new Date().getFullYear();

  const handleSelectChat = (chat: Conversation) => {
    setSelectedChat(chat);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  const loadConversations = useCallback(async (uid: string) => {
    const orgId = organization?.id;
    if (!orgId) return [];
    const { data: comms, error } = await supabase
      .from('communications')
      .select('*, messages(*)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Load Conversations Error:", error);
      toast.error(`Error de base de datos: ${error.message || 'Desconocido'}`);
      return [];
    }

    return (comms ?? []).map((conv: any) => {
      const sortedMessages = (conv.messages || []).sort((a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      return {
        ...conv,
        messages: sortedMessages,
        last_message: sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1].content : 'Sin mensajes'
      };
    }) as Conversation[];
  }, [supabase, organization?.id]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function init() {
      try {
        if (!mounted) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          router.push("/login");
          return;
        }

        setUserId(user.id);

        if (organization?.id) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('ai_whatsapp_enabled')
            .eq('id', organization.id)
            .single()
          if (orgData) setAiEnabled(orgData.ai_whatsapp_enabled ?? false)
        }

        if (organization?.id) {
          const { data: settingsData } = await supabase
            .from('settings')
            .select('email_ai_enabled')
            .eq('organization_id', organization.id)
            .single()
          if (settingsData) setEmailAiEnabled(settingsData.email_ai_enabled ?? false)
        }

        if (!organization?.id) {
          setLoading(false);
          return;
        }

        const data = await loadConversations(user.id);

        if (!mounted) return;

        setConversations(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error("Critical Init Error:", err);
        if (mounted) toast.error("Error crítico al inicializar la página");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [supabase, router, loadConversations, currentYear]);

  // Real-time — Asistente (Edge Functions) is the only one generating responses.
  // Frontend: reload conversations on new messages only.
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('ocio-messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload: any) => {
          const newMsg = payload.new as any;

          const freshData = await loadConversations(userId);
          setConversations(freshData);

          if (selectedChatRef.current && newMsg.communication_id === selectedChatRef.current.id) {
            const updated = freshData.find(c => c.id === selectedChatRef.current?.id);
            if (updated) setSelectedChat(updated);
          }

          // Notify on new client message (not from AI)
          if (newMsg.sender === 'client') {
            const conv = freshData.find(c => c.id === newMsg.communication_id);
            if (conv && conv.id !== selectedChatRef.current?.id) {
              const displayName = conv.contact_name || conv.contact_identifier?.split('@')[0] || 'Contacto';
              toast(`📱 Nuevo mensaje de ${displayName}`, { duration: 4000 });
            }
          }
        }
      )
      .subscribe();

    const commChannel = supabase
      .channel('ocio-comms-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'communications' },
        async () => {
          const freshData = await loadConversations(userId);
          setConversations(freshData);

          if (selectedChatRef.current) {
            const stillExists = freshData.find(c => c.id === selectedChatRef.current?.id);
            if (!stillExists) {
              setSelectedChat(null);
            } else {
              setSelectedChat(stillExists);
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (commChannel) supabase.removeChannel(commChannel);
    };
  }, [userId, supabase, loadConversations, organization?.id]);

  const handleToggleAI = async () => {
    if (!organization?.id || togglingAi) return
    setTogglingAi(true)
    try {
      const newValue = !aiEnabled
      const { error } = await supabase
        .from('organizations')
        .update({ ai_whatsapp_enabled: newValue })
        .eq('id', organization.id)
      if (error) throw error
      setAiEnabled(newValue)
      toast.success(newValue ? 'IA activada' : 'IA desactivada')
    } catch (e) {
      toast.error('Error al cambiar estado de IA')
    } finally {
      setTogglingAi(false)
    }
  }

  const handleToggleEmailAI = async () => {
    if (!organization?.id || togglingEmailAi) return
    setTogglingEmailAi(true)
    try {
      const newValue = !emailAiEnabled
      const { error } = await supabase
        .from('settings')
        .update({ email_ai_enabled: newValue })
        .eq('organization_id', organization.id)
      if (error) throw error
      setEmailAiEnabled(newValue)
      toast.success(newValue ? 'IA Email activada' : 'IA Email desactivada')
    } catch (e) {
      toast.error('Error al cambiar estado de IA Email')
    } finally {
      setTogglingEmailAi(false)
    }
  }

  if (orgLoading || (loading && organization?.id) || !isMounted) return <PageSkeleton />;

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row bg-[var(--bg-page)] transition-colors animate-in fade-in duration-700">
      <div className={`w-full md:w-[300px] lg:w-[320px] min-h-0 flex flex-col border-r border-[var(--border-card)] bg-[var(--bg-card)] ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedChat?.id}
          onSelect={handleSelectChat}
          filter={filter}
          setFilter={setFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          loading={loading}
          userId={userId}
          onOpenSettings={() => setSettingsOpen(true)}
          onRefresh={async () => {
            if (userId) {
              const fresh = await loadConversations(userId);
              setConversations(fresh);

              if (selectedChat) {
                const stillExists = fresh.find(c => c.id === selectedChat.id);
                if (!stillExists) {
                  setSelectedChat(null);
                }
              }
            }
          }}
        />
      </div>

      <div className={`flex-1 min-w-0 h-full flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <ConversationView
          chat={selectedChat}
          onRefresh={async () => {
            if (userId) {
              const fresh = await loadConversations(userId);
              setConversations(fresh);

              const updated = fresh.find(c => c.id === selectedChat?.id);
              if (updated) {
                setSelectedChat(updated);
              } else {
                setSelectedChat(null);
              }
            }
          }}
          onBack={handleCloseChat}
        />
      </div>

      <div className="hidden lg:flex lg:flex-col w-[300px] xl:w-[340px] shrink-0 border-l border-[var(--border-card)]">
        <CommunicationsSidebar
          conversations={conversations}
          aiEnabled={aiEnabled}
          togglingAi={togglingAi}
          onToggleAI={handleToggleAI}
          emailAiEnabled={emailAiEnabled}
          togglingEmailAi={togglingEmailAi}
          onToggleEmailAI={handleToggleEmailAI}
        />
      </div>

      {/* Mobile settings drawer */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-[#0D1B35] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-[#1E3A5F] overflow-y-auto">
            <div className="p-4 border-b border-[#111F3A] flex justify-between items-center bg-[#0D1B35] sticky top-0 z-10">
              <h3 className="font-bold text-white uppercase text-[12px] tracking-wider">Información</h3>
              <button onClick={() => setSettingsOpen(false)} className="p-2 text-slate-400 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <CommunicationsSidebar
                conversations={conversations}
                aiEnabled={aiEnabled}
                togglingAi={togglingAi}
                onToggleAI={handleToggleAI}
                emailAiEnabled={emailAiEnabled}
                togglingEmailAi={togglingEmailAi}
                onToggleEmailAI={handleToggleEmailAI}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ✅ app/dashboard/communications/page.tsx — Centralita Autónoma (Read-Only)
