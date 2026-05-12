import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

interface InvoicesAnalyticsProps {
  invoices: any[];
}

export default function InvoicesAnalytics({ invoices }: InvoicesAnalyticsProps) {
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();

    let totalFacturadoYear = 0;
    let totalPendiente = 0;
    let sumDaysToPay = 0;
    let paidCountWithDates = 0;

    invoices.forEach(inv => {
      // Total facturado este año (todos los estados menos canceladas/borrador)
      const isFacturado = inv.status !== 'cancelada' && inv.status !== 'borrador';
      const issueDate = new Date(inv.issue_date || inv.created_at);
      if (isFacturado && issueDate.getFullYear() === currentYear) {
        totalFacturadoYear += Number(inv.total || inv.total_amount || 0);
      }

      // Total pendiente global
      if (inv.status === 'pendiente') {
        totalPendiente += Number(inv.total || inv.total_amount || 0);
      }

      // Tiempo medio de pago (solo pagadas con paid_date y issue_date válidas)
      if (inv.status === 'pagada' && inv.paid_date && inv.issue_date) {
        const issuesT = new Date(inv.issue_date).getTime();
        const paidT = new Date(inv.paid_date).getTime();
        const diffDays = Math.max(0, (paidT - issuesT) / (1000 * 3600 * 24));
        sumDaysToPay += diffDays;
        paidCountWithDates++;
      }
    });

    const avgPaymentDays = paidCountWithDates > 0 ? Math.round(sumDaysToPay / paidCountWithDates) : 0;

    // Pagadas vs Pendientes por Mes (últimos 6 meses)
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString('es-ES', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        Pagadas: 0,
        Pendientes: 0
      };
    }).reverse();

    invoices.forEach(inv => {
      if (inv.status === 'pagada' || inv.status === 'pendiente') {
        const d = new Date(inv.issue_date || inv.created_at);
        const target = last6Months.find(m => m.monthNum === d.getMonth() && m.year === d.getFullYear());
        if (target) {
          if (inv.status === 'pagada') target.Pagadas += Number(inv.total || inv.total_amount || 0);
          if (inv.status === 'pendiente') target.Pendientes += Number(inv.total || inv.total_amount || 0);
        }
      }
    });

    return { totalFacturadoYear, totalPendiente, avgPaymentDays, barData: last6Months };
  }, [invoices]);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center rounded-xl shrink-0">
            <FileText className="w-6 h-6 text-[#1B4FD8]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Facturado este Año</p>
            <p className="text-[24px] font-bold text-[#0F172A] dark:text-[#F1F5F9] mt-0.5">
              {stats.totalFacturadoYear.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Pendiente de Cobro</p>
            <p className="text-[24px] font-bold text-[#0F172A] dark:text-[#F1F5F9] mt-0.5">
              {stats.totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center rounded-xl shrink-0">
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Tiempo Medio de Pago</p>
            <p className="text-[24px] font-bold text-[#0F172A] dark:text-[#F1F5F9] mt-0.5">
              {stats.avgPaymentDays} <span className="text-sm font-medium text-[#64748B]">días</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 gap-6 w-full">
        <div className="bg-white dark:bg-[#111F3A] p-6 rounded-[24px] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-sm w-full min-w-0">
          <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight mb-6">Facturación Mensual (Pagadas vs Pendientes)</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={stats.barData}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k€`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString('es-ES')} €`]}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="Pagadas" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Pendientes" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
