export interface Lead {
  id: string;
  user_id: string;
  organization_id: string | null;
  nombre: string;
  empresa: string | null;
  email: string | null;
  telefono: string | null;
  cargo: string | null;
  estado: LeadEstado;
  temperatura: LeadTemperatura;
  origen: LeadOrigen;
  notas: string | null;
  ultimo_contacto: string | null;
  proximo_seguimiento: string | null;
  assigned_to: string | null;
  convertido_en: 'cliente' | 'deal' | 'cliente_y_deal' | null;
  converted_client_id: string | null;
  converted_deal_id: string | null;
  fecha_conversion: string | null;
  valor_estimado: number;
  moneda: string;
  motivo_descarte: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadEstado = 'nuevo' | 'contactado' | 'cualificado' | 'descartado' | 'convertido';
export type LeadTemperatura = 'frio' | 'tibio' | 'caliente';
export type LeadOrigen = 'web' | 'whatsapp' | 'email' | 'manual' | 'referido' | 'redes_sociales';
