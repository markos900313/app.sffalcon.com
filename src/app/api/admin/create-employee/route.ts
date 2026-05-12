import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { email, password, organization_id, full_name, role, phone } = await req.json();

    if (!email || !password || !organization_id || !full_name) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // 1. Crea usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;
    const fichar_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 2. Inserta en staff
    const { error: staffError } = await supabaseAdmin
      .from('staff')
      .insert({
        id: userId,
        user_id: userId,
        organization_id,
        full_name,
        email,
        phone,
        role,
        status: 'active',
        fichar_code
      });

    if (staffError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: staffError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, fichar_code });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
