import { createClient } from './supabase/client'

export interface WorkHoursConfig {
  start: number
  end: number
  days: number[]
}

// Versión Síncrona (solo lectura de localStorage para el cliente)
export const getWorkHoursSync = (): WorkHoursConfig => {
  if (typeof window === 'undefined') return { start: 9, end: 19, days: [1, 2, 3, 4, 5] };
  try {
    const saved = localStorage.getItem('asistente_work_hours')
    return saved
      ? JSON.parse(saved)
      : { start: 9, end: 19, days: [1, 2, 3, 4, 5] }
  } catch {
    return { start: 9, end: 19, days: [1, 2, 3, 4, 5] }
  }
}

// Versión Asíncrona (Servidor y Cliente, prioriza Supabase)
export const getWorkHours = async (orgId: string): Promise<WorkHoursConfig> => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('working_hours_start, working_hours_end, working_days')
      .eq('id', orgId)
      .single();

    if (!error && data) {
      const config = {
        start: data.working_hours_start ?? 9,
        end: data.working_hours_end ?? 19,
        days: data.working_days ?? [1, 2, 3, 4, 5]
      };
      
      // Sincronizar con localStorage si estamos en el cliente
      if (typeof window !== 'undefined') {
        localStorage.setItem('asistente_work_hours', JSON.stringify(config));
      }
      return config;
    }
  } catch (err) {
    console.error('Error fetching work hours:', err);
  }

  // Fallback a localStorage o por defecto
  return getWorkHoursSync();
}

export const isWithinWorkHours = (config: WorkHoursConfig): boolean => {
  const now = new Date()
  const madridTime = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'narrow',
    hour12: false
  }).formatToParts(now)

  const hour = Number(madridTime.find(p => p.type === 'hour')?.value)
  const minute = Number(madridTime.find(p => p.type === 'minute')?.value)
  const weekday = madridTime.find(p => p.type === 'weekday')?.value
  
  const isWeekend = weekday === 'S' || weekday === 'D'
  if (isWeekend) return false;

  const totalMinutes = hour * 60 + minute
  return totalMinutes >= (config.start * 60) && totalMinutes < (config.end * 60)
}

export const saveWorkHours = async (orgId: string, config: WorkHoursConfig) => {
  const supabase = createClient();
  
  // 1. Guardar en Supabase (usando la tabla 'organizations')
  await supabase
    .from('organizations')
    .update({ 
      working_hours_start: config.start,
      working_hours_end: config.end,
      working_days: config.days,
      updated_at: new Date().toISOString()
    })
    .eq('id', orgId);

  // 2. Guardar en localStorage (optimizacion cliente)
  if (typeof window !== 'undefined') {
    localStorage.setItem('asistente_work_hours', JSON.stringify(config))
  }
}
