import React from "react";
import Link from "next/link";
import { Mail, MessageSquare, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";

export type RecentCommItem = {
  id: string;
  channel: "email" | "whatsapp" | "other";
  name: string;
  preview: string;
  status: "pending" | "answered" | "urgent" | "other";
  updatedAt: string; // ISO
};

function formatRelativeTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNowStrict(d, { addSuffix: true, locale: es });
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export default function RecentComms({ items }: { items: RecentCommItem[] }) {
  const displayComms = items ?? [];

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] md:rounded-[16px] p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1B4FD8]" />
          </div>
          <h3 className="text-sm md:text-base lg:text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] truncate">
            Comunicaciones Recientes
          </h3>
        </div>
        <Link
          href="/dashboard/communications"
          className="text-[10px] md:text-[11px] font-medium text-[#1B4FD8] hover:underline uppercase tracking-[0.08em] whitespace-nowrap"
        >
          Ver todas →
        </Link>
      </div>

      {displayComms.length === 0 ? (
        <p className="text-xs md:text-sm lg:text-[13px] text-[#64748B] font-normal">
          No hay mensajes recientes
        </p>
      ) : (
        <div className="space-y-3 md:space-y-5">
          {displayComms.map((comm) => (
            <Link
              key={comm.id}
              href="/dashboard/communications"
              className="flex items-center gap-2 md:gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#162040] transition-colors h-fit"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-[#0D1B35] flex items-center justify-center border border-slate-200 dark:border-[#1E3A5F] group-hover:bg-white dark:group-hover:bg-[#111F3A] group-hover:border-[#1B4FD8]/20 transition-all flex-shrink-0">
                {comm.channel === "whatsapp" ? (
                  <Smartphone className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#25D366]" />
                ) : comm.channel === "email" ? (
                  <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1B4FD8]" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start md:items-center gap-2 mb-0.5">
                  <p className="text-[14px] font-medium text-[#0F172A] dark:text-[#F1F5F9] truncate max-w-[120px] md:max-w-none">
                    {comm.name}
                  </p>
                  <span className="text-[10px] md:text-[11px] text-[#64748B] dark:text-[#475569] font-normal flex-shrink-0">
                    {formatRelativeTime(comm.updatedAt)}
                  </span>
                </div>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] truncate font-normal line-clamp-1">
                  {comm.preview}
                </p>
              </div>
              <div
                className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] md:text-[10px] lg:text-[11px] font-semibold tracking-[0.05em] uppercase flex-shrink-0",
                  comm.status === "pending"
                    ? "bg-[#FEF3C7] dark:bg-[#D97706]/20 text-[#D97706] dark:text-[#F59E0B]"
                    : comm.status === "urgent"
                      ? "bg-[#FEF2F2] dark:bg-[#EF4444]/20 text-[#DC2626] dark:text-[#FCA5A5]"
                      : comm.status === "answered"
                        ? "bg-[#D1FAE5] dark:bg-[#059669]/20 text-[#059669] dark:text-[#10B981]"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                {comm.status === "pending"
                  ? "Pendiente"
                  : comm.status === "urgent"
                    ? "Urgente"
                    : comm.status === "answered"
                      ? "Respondido"
                      : "Estado"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
