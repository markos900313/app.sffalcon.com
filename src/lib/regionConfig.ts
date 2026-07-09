export const REGION_CONFIG: Record<string, {
  currency: string; symbol: string; tax: string; taxLabel: string
}> = {
  'US': { currency:'USD', symbol:'$', tax:'Tax', taxLabel:'Tax' },
  'ES': { currency:'EUR', symbol:'€', tax:'IVA (21%)', taxLabel:'IVA' },
  'MX': { currency:'MXN', symbol:'$', tax:'IVA (16%)', taxLabel:'IVA' },
  'CO': { currency:'COP', symbol:'$', tax:'IVA (19%)', taxLabel:'IVA' },
  'AR': { currency:'ARS', symbol:'$', tax:'IVA (21%)', taxLabel:'IVA' },
  'CL': { currency:'CLP', symbol:'$', tax:'IVA (19%)', taxLabel:'IVA' },
  'PE': { currency:'PEN', symbol:'S/', tax:'IGV (18%)', taxLabel:'IGV' },
  'EC': { currency:'USD', symbol:'$', tax:'IVA (15%)', taxLabel:'IVA' },
  'VE': { currency:'USD', symbol:'$', tax:'IVA (16%)', taxLabel:'IVA' },
  'DO': { currency:'DOP', symbol:'RD$', tax:'ITBIS (18%)', taxLabel:'ITBIS' },
  'PR': { currency:'USD', symbol:'$', tax:'IVU (11.5%)', taxLabel:'IVU' },
  'GB': { currency:'GBP', symbol:'£', tax:'VAT (20%)', taxLabel:'VAT' },
  'DE': { currency:'EUR', symbol:'€', tax:'MwSt (19%)', taxLabel:'MwSt' },
  'FR': { currency:'EUR', symbol:'€', tax:'TVA (20%)', taxLabel:'TVA' },
  'IT': { currency:'EUR', symbol:'€', tax:'IVA (22%)', taxLabel:'IVA' },
  'PT': { currency:'EUR', symbol:'€', tax:'IVA (23%)', taxLabel:'IVA' },
  'NL': { currency:'EUR', symbol:'€', tax:'BTW (21%)', taxLabel:'BTW' },
  'CA': { currency:'CAD', symbol:'$', tax:'GST/HST', taxLabel:'Tax' },
}

export const REGION_LIST = Object.entries(REGION_CONFIG).map(
  ([code, cfg]) => ({ code, ...cfg })
)

export const COUNTRY_NAMES: Record<string, string> = {
  'US': '🇺🇸 United States',
  'ES': '🇪🇸 España',
  'MX': '🇲🇽 México',
  'CO': '🇨🇴 Colombia',
  'AR': '🇦🇷 Argentina',
  'CL': '🇨🇱 Chile',
  'PE': '🇵🇪 Perú',
  'EC': '🇪🇨 Ecuador',
  'VE': '🇻🇪 Venezuela',
  'DO': '🇩🇴 República Dominicana',
  'PR': '🇵🇷 Puerto Rico',
  'GB': '🇬🇧 United Kingdom',
  'DE': '🇩🇪 Deutschland',
  'FR': '🇫🇷 France',
  'IT': '🇮🇹 Italia',
  'PT': '🇵🇹 Portugal',
  'NL': '🇳🇱 Netherlands',
  'CA': '🇨🇦 Canada',
}

export function getTaxLabel(country?: string): string {
  return REGION_CONFIG[country?.toUpperCase() ?? '']?.taxLabel ?? 'IVA'
}

export function getTaxInfo(country?: string): string {
  return REGION_CONFIG[country?.toUpperCase() ?? '']?.tax ?? 'IVA (21%)'
}
