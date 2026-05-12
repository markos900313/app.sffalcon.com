"use client";

import React from "react";
import { cn } from "@/lib/utils";

const months = [
  { id: "ENE", label: "ENE" },
  { id: "FEB", label: "FEB" },
  { id: "MAR", label: "MAR" },
  { id: "ABR", label: "ABR" },
  { id: "MAY", label: "MAY" },
  { id: "JUN", label: "JUN" },
  { id: "JUL", label: "JUL" },
  { id: "AGO", label: "AGO" },
  { id: "SEP", label: "SEP" },
  { id: "OCT", label: "OCT" },
  { id: "NOV", label: "NOV" },
  { id: "DIC", label: "DIC" },
];

interface MonthSelectorProps {
  selected: string;
  onChange: (id: string) => void;
  statuses: Record<string, "completo" | "parcial" | "vacio">;
}

export default function MonthSelector({ selected, onChange, statuses }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-3 md:gap-6 lg:gap-8 border-b border-[#E2E8F0] dark:border-[#1E3A5F] pb-1.5 md:pb-2 overflow-x-auto no-scrollbar -mx-3 px-3">
      {months.map((month) => {
        const isSelected = selected === month.id;
        return (
          <button
            key={month.id}
            onClick={() => onChange(month.id)}
            className="flex flex-col items-center gap-3 md:gap-4 group pb-3 md:pb-4 relative min-w-[52px] md:min-w-[60px]"
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className={cn(
                "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-transform group-hover:scale-125",
                statuses[month.id] === "completo" ? "bg-[#10B981]" : 
                statuses[month.id] === "parcial" ? "bg-[#F59E0B]" : 
                "bg-slate-300 dark:bg-[#475569]"
              )} />
              <span className={cn(
                "text-[13px] font-semibold tracking-wide transition-colors",
                isSelected 
                  ? "text-[#1B4FD8]" 
                  : "text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-[#F1F5F9]"
              )}>
                {month.label}
              </span>
            </div>
            {isSelected && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1B4FD8] rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
