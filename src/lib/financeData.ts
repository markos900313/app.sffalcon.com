import { createClient } from "@/lib/supabase/client";

interface FinanceEntry {
  id: string;
  user_id: string;
  type: string;
  amount: number | string;
  month: number;
  year: number;
  [key: string]: any;
}

export async function getFinanceSummary(month: number, year: number = 2026) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('finance_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', year)
    .eq('month', month);

  if (error) {
    console.error('Error fetching finance entries:', error);
    return null;
  }

  const entries = (data || []) as FinanceEntry[];

  const ingresos = entries
    .filter((item: FinanceEntry) => item.type === 'ingreso')
    .reduce((acc: number, curr: FinanceEntry) => acc + Number(curr.amount), 0);

  const gastos = entries
    .filter((item: FinanceEntry) => item.type !== 'ingreso' && item.type !== 'ahorro')
    .reduce((acc: number, curr: FinanceEntry) => acc + Number(curr.amount), 0);

  const balance = ingresos - gastos;

  return {
    ingresos,
    gastos,
    balance,
    entries
  };
}

export async function getAnnualEvolution(year: number = 2026) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('finance_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', year);

  if (error) return [];

  const entries = (data || []) as FinanceEntry[];
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const evolution = months.map((name, index) => {
    const monthData = entries.filter((item: FinanceEntry) => item.month === index + 1);
    const ingresos = monthData
      .filter((item: FinanceEntry) => item.type === 'ingreso')
      .reduce((acc: number, curr: FinanceEntry) => acc + Number(curr.amount), 0);
    const gastos = monthData
      .filter((item: FinanceEntry) => item.type !== 'ingreso' && item.type !== 'ahorro')
      .reduce((acc: number, curr: FinanceEntry) => acc + Number(curr.amount), 0);

    return {
      name,
      ingresos,
      gastos,
      balance: ingresos - gastos
    };
  });

  return evolution.filter((m) => m.ingresos > 0 || m.gastos > 0);
}
