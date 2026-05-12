import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { organization_id, email_inbound, email_display_name, email_signature, email_ai_enabled } = body;

    if (!organization_id) {
      return NextResponse.json({ error: 'organization_id es requerido' }, { status: 400 });
    }

    // 2. Verificar que el usuario pertenece a la organización
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organization_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'No tienes permiso para modificar esta organización' }, { status: 403 });
    }

    // 3. Realizar el upsert de forma manual si es necesario para evitar errores de restricción
    const supabaseService = await createServiceRoleClient();
    
    // Primero verificamos si ya existe la configuración para esta organización
    const { data: existingSettings, error: selectError } = await supabaseService
      .from('settings')
      .select('id')
      .eq('organization_id', organization_id)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing settings:', selectError);
      return NextResponse.json({ error: selectError.message }, { status: 400 });
    }

    let result;
    if (existingSettings) {
      // Update
      result = await supabaseService
        .from('settings')
        .update({
          email_inbound: email_inbound?.trim(),
          email_display_name: email_display_name?.trim(),
          email_signature: email_signature?.trim(),
          email_ai_enabled: !!email_ai_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organization_id)
        .select()
        .single();
    } else {
      // Insert
      result = await supabaseService
        .from('settings')
        .insert({
          organization_id,
          email_inbound: email_inbound?.trim(),
          email_display_name: email_display_name?.trim(),
          email_signature: email_signature?.trim(),
          email_ai_enabled: !!email_ai_enabled,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving settings:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error('Unexpected error in settings API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Función auxiliar para crear el cliente de servicio
async function createServiceRoleClient() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
