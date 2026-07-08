import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { format, addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action } = body;

    if (!token || !action || (action !== 'accept' && action !== 'reject')) {
      return NextResponse.json({ error: 'Parámetros incorrectos' }, { status: 400 });
    }

    // Buscar presupuesto por accept_token
    const { data: est, error: estErr } = await supabaseAdmin
      .from('estimates')
      .select('*')
      .eq('accept_token', token)
      .single();

    if (estErr || !est) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
    }

    if (est.status === 'accepted' || est.status === 'rejected') {
      return NextResponse.json({ error: `El presupuesto ya ha sido ${est.status === 'accepted' ? 'aceptado' : 'rechazado'}` }, { status: 400 });
    }

    // Verificar expiración
    const isExpired = est.status === 'expired' || (est.valid_until && new Date(est.valid_until) < new Date());
    if (isExpired) {
      return NextResponse.json({ error: 'El presupuesto ha expirado' }, { status: 400 });
    }

    if (action === 'reject') {
      const { error: updErr } = await supabaseAdmin
        .from('estimates')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', est.id);

      if (updErr) throw updErr;
      return NextResponse.json({ success: true, status: 'rejected' });
    }

    // Si es accept:
    // 1. Calcular número de factura
    const currentYear = new Date().getFullYear();
    const prefix = `FAC-${currentYear}-`;
    
    const { data: invoices, error: invsErr } = await supabaseAdmin
      .from('invoices')
      .select('invoice_number')
      .eq('organization_id', est.organization_id)
      .like('invoice_number', `${prefix}%`);
      
    if (invsErr) throw invsErr;
    
    let maxSeq = 0;
    if (invoices && invoices.length > 0) {
      invoices.forEach((inv: any) => {
        const parts = inv.invoice_number.split('-');
        if (parts.length >= 3) {
          const seq = parseInt(parts[2], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      });
    }
    const nextSeq = maxSeq + 1;
    const invoiceNumber = `${prefix}${String(nextSeq).padStart(3, '0')}`;

    const issueDate = format(new Date(), 'yyyy-MM-dd');
    const dueDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

    // Obtener user_id para la factura
    let userId: string | null = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      try {
        const tokenStr = authHeader.replace('Bearer ', '');
        const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(tokenStr);
        if (authUser) {
          userId = authUser.id;
        }
      } catch (e) {
        // Silencioso
      }
    }

    if (!userId) {
      const { data: member } = await supabaseAdmin
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', est.organization_id)
        .limit(1)
        .single();
      if (member) {
        userId = member.user_id;
      }
    }

    // 2. Insertar factura
    const { data: invData, error: insertErr } = await supabaseAdmin
      .from('invoices')
      .insert({
        organization_id: est.organization_id,
        user_id: userId,
        invoice_number: invoiceNumber,
        concept: `Presupuesto ${est.estimate_number}`,
        amount: est.subtotal,
        tax_rate: est.tax_rate,
        tax_amount: est.tax_amount,
        total: est.total,
        status: 'pendiente',
        issue_date: issueDate,
        due_date: dueDate,
        notes: est.notes,
        client_id: null,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertErr) throw insertErr;

    // 3. Actualizar presupuesto con status 'accepted', accepted_at e invoice_id
    const { error: updateEstErr } = await supabaseAdmin
      .from('estimates')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        invoice_id: invData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', est.id);

    if (updateEstErr) throw updateEstErr;

    return NextResponse.json({ success: true, status: 'accepted' });
  } catch (error: unknown) {
    console.error('Error accepting estimate:', error);
    const msg = error instanceof Error ? error.message : 'Error al procesar la solicitud';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
