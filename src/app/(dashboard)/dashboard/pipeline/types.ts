export interface PipelineDeal {
  id: string;
  user_id: string;
  organization_id: string | null;
  nombre: string;
  empresa: string | null;
  email: string | null;
  telefono: string | null;
  valor_estimado: number;
  moneda: string;
  etapa: PipelineEtapa;
  prioridad: Prioridad;
  origen: OrigenLead;
  notas: string | null;
  fecha_cierre_estimada: string | null;
  fecha_cierre_real: string | null;
  motivo_perdida: string | null;
  assigned_to: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

export type PipelineEtapa = 
  | 'nuevo_lead' 
  | 'contactado' 
  | 'propuesta' 
  | 'negociacion' 
  | 'cerrado_ganado' 
  | 'cerrado_perdido';

export type Prioridad = 'baja' | 'media' | 'alta' | 'urgente';

export type OrigenLead = 'web' | 'whatsapp' | 'email' | 'manual' | 'referido';

export interface PipelineColumn {
  id: PipelineEtapa;
  label: string;
  color: string;
  icon: React.ReactNode;
}
