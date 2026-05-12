export type FinanceCategory = {
  id: string;
  name: string;
  type: 'income' | 'expense';
};

export const FINANCE_CATEGORIES: Record<string, { income: FinanceCategory[], expense: FinanceCategory[] }> = {
  'default': {
    income: [
      { id: 'general_service', name: 'Servicios', type: 'income' },
      { id: 'general_sales', name: 'Venta de Productos', type: 'income' },
      { id: 'general_events', name: 'Eventos / Reservas', type: 'income' },
      { id: 'other_income', name: 'Otros Ingresos', type: 'income' }
    ],
    expense: [
      { id: 'general_rent', name: 'Alquiler / Oficina', type: 'expense' },
      { id: 'general_supplies', name: 'Suministros (Luz, Agua, etc.)', type: 'expense' },
      { id: 'general_staff', name: 'Personal / Seguros', type: 'expense' },
      { id: 'general_stock', name: 'Compras / Stock', type: 'expense' },
      { id: 'general_marketing', name: 'Marketing / Publicidad', type: 'expense' },
      { id: 'general_software', name: 'Software / Herramientas', type: 'expense' },
      { id: 'general_maintenance', name: 'Mantenimiento / Limpieza', type: 'expense' },
      { id: 'general_insurance', name: 'Seguros / Mutua', type: 'expense' },
      { id: 'other_expense', name: 'Otros Gastos', type: 'expense' }
    ]
  }
};

export function getSectorCategories(sector?: string) {
  // Always return default as we are moving to a universal architecture
  return FINANCE_CATEGORIES['default'];
}

