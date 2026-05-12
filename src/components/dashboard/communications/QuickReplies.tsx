"use client";

import React, { useState } from "react";
import { Plus, Clock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type QuickReply = {
  id: string;
  title: string;
  content: string;
};

export default function QuickReplies({
  replies,
  onSelect,
  loading,
  onRefresh,
  organizationId
}: {
  replies: QuickReply[],
  onSelect: (content: string) => void,
  loading: boolean,
  onRefresh: () => void,
  organizationId?: string
}) {
  const supabase = createClient();

  const handleAdd = async () => {
    const title = window.prompt("Título de la respuesta rápida:");
    const content = window.prompt("Contenido de la respuesta:");

    if (!title || !content) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('quick_replies')
      .insert({
        user_id: user.id,
        organization_id: organizationId,
        title: title.trim(),
        content: content.trim()
      });

    if (error) {
      toast.error("Error al añadir respuesta");
    } else {
      toast.success("Respuesta añadida");
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#64748B] dark:text-[#475569] text-[11px] font-medium uppercase tracking-wider ml-1">
          RESPUESTAS RÁPIDAS
        </h3>
        <button
          onClick={handleAdd}
          className="text-[11px] font-medium text-[#1B4FD8] hover:text-[#2563EB] uppercase tracking-wider transition-colors duration-150 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> NUEVA
        </button>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
          </div>
        ) : replies.length === 0 ? (
          <p className="text-[10px] text-center text-[#94A3B8] py-4 italic">No hay respuestas guardadas</p>
        ) : (
          replies.map(reply => (
            <div
              key={reply.id}
              onClick={() => onSelect(reply.content)}
              className="p-3 bg-white dark:bg-[#111F3A] border border-slate-100 dark:border-[#1E3A5F] rounded-lg group cursor-pointer hover:bg-[#162040] hover:border-[#1B4FD8] transition-all duration-150 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
                <h4 className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] truncate">
                  {reply.title}
                </h4>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#64748B] truncate leading-relaxed">
                {reply.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
