export const REGION_CONFIG: Record<string, {
  currency: string; symbol: string; tax: string; taxLabel: string
}> = {
  'ES': { currency:'EUR', symbol:'€', tax:'IVA (21%)', taxLabel:'IVA' },
  'FR': { currency:'EUR', symbol:'€', tax:'TVA (20%)', taxLabel:'TVA' },
  'DE': { currency:'EUR', symbol:'€', tax:'MwSt (19%)', taxLabel:'MwSt' },
  'IT': { currency:'EUR', symbol:'€', tax:'IVA (22%)', taxLabel:'IVA' },
  'PT': { currency:'EUR', symbol:'€', tax:'IVA (23%)', taxLabel:'IVA' },
  'US': { currency:'USD', symbol:'$', tax:'Tax', taxLabel:'Tax' },
  'MX': { currency:'MXN', symbol:'$', tax:'IVA (16%)', taxLabel:'IVA' },
  'GB': { currency:'GBP', symbol:'£', tax:'VAT (20%)', taxLabel:'VAT' },
  'CO': { currency:'COP', symbol:'$', tax:'IVA (19%)', taxLabel:'IVA' },
  'AR': { currency:'ARS', symbol:'$', tax:'IVA (21%)', taxLabel:'IVA' },
}

export function getTaxLabel(country?: string): string {
  return REGION_CONFIG[country?.toUpperCase() ?? '']?.taxLabel ?? 'IVA'
}

export function getTaxInfo(country?: string): string {
  return REGION_CONFIG[country?.toUpperCase() ?? '']?.tax ?? 'IVA (21%)'
}
