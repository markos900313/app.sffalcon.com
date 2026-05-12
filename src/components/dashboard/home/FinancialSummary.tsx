import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";

export type FinancialSummaryRow = {
  mes: "ENE" | "FEB" | "MAR" | "ABR" | "MAY" | "JUN" | "JUL" | "AGO" | "SEP" | "OCT" | "NOV" | "DIC";
  ingresos: number;
  balance: number;
};

export default function FinancialSummary({
  rows,
  acumulado,
  title = "Resumen Financiero",
  labelAcumulado = "Acumulado",
  detailHref = "/dashboard/finances"
}: {
  rows: FinancialSummaryRow[];
  acumulado: number;
  title?: string;
  labelAcumulado?: string;
  detailHref?: string;
}) {

  return (
    <div className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[12px] md:rounded-[16px] p-4 md:p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
        <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1B4FD8]" />
        </div>
        <h3 className="text-sm md:text-base lg:text-[16px] font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
          {title}
        </h3>
      </div>

      <div className="overflow-x-auto flex-1 -mx-4 md:-mx-6 px-4 md:px-6">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="pb-3 md:pb-4 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">
                PERIODO
              </th>
              <th className="pb-3 md:pb-4 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right whitespace-nowrap pr-2">
                INGRESOS
              </th>
              <th className="pb-3 md:pb-4 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right whitespace-nowrap">
                BALANCE
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-[#1E3A5F]">
            {rows.map((row) => (
              <tr key={row.mes} className="group hover:bg-[#F8FAFC] dark:hover:bg-[#162040] transition-colors">
                <td className="py-3 md:py-4 text-[14px] font-normal text-[#0F172A] dark:text-[#F1F5F9] truncate">{row.mes}</td>
                <td className="py-3 md:py-4 text-[14px] font-normal text-[#64748B] dark:text-[#94A3B8] text-right pr-2 tabular-nums">
                  {formatCurrency(row.ingresos)}
                </td>
                <td
                  className={cn(
                    "py-3 md:py-4 text-[14px] font-normal text-right tabular-nums",
                    row.balance < 0 ? "text-[#EF4444]" : "text-[#10B981]"
                  )}
                >
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[#E2E8F0] dark:border-[#1E3A5F]">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
            {labelAcumulado}
          </p>
          <span className={cn("text-2xl font-bold tracking-tight tabular-nums", acumulado < 0 ? "text-[#EF4444]" : "text-[#10B981]")}>
            {formatCurrency(acumulado)}
          </span>
        </div>
        <div className="mt-3 md:mt-4 flex justify-end">
          <Link href={detailHref} className="text-xs md:text-sm lg:text-[13px] font-medium text-[#1B4FD8] hover:text-[#1E40AF] transition-colors">
            Ver detalle →
          </Link>
        </div>
      </div>
    </div>
  );
}
