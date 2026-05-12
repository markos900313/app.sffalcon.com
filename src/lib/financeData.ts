import { createClient } from "@/lib/supabase/client";

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

  const ingresos = data
    .filter(item => item.type === 'ingreso')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const gastos = data
    .filter(item => item.type !== 'ingreso' && item.type !== 'ahorro')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = ingresos - gastos;

  return {
    ingresos,
    gastos,
    balance,
    entries: data
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

  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const evolution = months.map((name, index) => {
    const monthData = data.filter(item => item.month === index + 1);
    const ingresos = monthData
      .filter(item => item.type === 'ingreso')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const gastos = monthData
      .filter(item => item.type !== 'ingreso' && item.type !== 'ahorro')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
      name,
      ingresos,
      gastos,
      balance: ingresos - gastos
    };
  });

  return evolution.filter(m => m.ingresos > 0 || m.gastos > 0);
}
