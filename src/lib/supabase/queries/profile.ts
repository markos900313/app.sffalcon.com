import { createClient } from "@/lib/supabase/client";

export const getProfile = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Si no existe el perfil, lo creamos
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: user?.user_metadata?.full_name || '',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (createError) throw createError;
    return newProfile;
  }

  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, profileData: any) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
};

export const getNotificationSettings = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();  // maybeSingle → nunca lanza 406, devuelve null si no hay fila

  if (error) throw error;
  
  if (!data) {
    const defaultSettings = {
      user_id: userId,
      system_alerts: true,
      new_leads: true,
      weekly_summary: false,
      negative_balance: true,
      new_messages: true,
      updated_at: new Date().toISOString()
    };
    
    // upsert respeta la constraint UNIQUE(user_id)
    const { data: newData, error: createError } = await supabase
      .from('notification_settings')
      .upsert(defaultSettings, { onConflict: 'user_id' })
      .select()
      .single();
      
    if (createError) throw createError;
    return newData;
  }
  
  return data;
};

export const updateNotificationSetting = async (userId: string, field: string, value: boolean) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('notification_settings')
    .update({
      [field]: value,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) throw error;
};

export const getIntegrations = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  
  if (!data || data.length === 0) {
    const baseIntegrations = [
      { user_id: userId, service: 'email', status: 'disconnected', config: {} },
      { user_id: userId, service: 'whatsapp', status: 'disconnected', config: {} },
      { user_id: userId, service: 'claude_api', status: 'disconnected', config: {} }
    ];
    
    // Usar upsert para evitar conflictos si ya existen
    const { data: newData, error: createError } = await supabase
      .from('integrations')
      .upsert(baseIntegrations, { onConflict: 'user_id,service' })
      .select();
      
    if (createError) throw createError;
    return newData;
  }
  
  return data;
};

export const upsertIntegration = async (userId: string, service: string, status: string, config: any) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      service,
      status,
      config,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,service' });

  if (error) throw error;
};
