import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { invoiceId, pdfBase64, clientEmail, clientName, invoiceNumber } = await request.json();

    if (!invoiceId || !pdfBase64 || !clientEmail) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    let base64Data = pdfBase64;
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }

    // Get organization info
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    const { data: org } = await supabase
      .from('organizations')
      .select('name, email')
      .eq('id', member?.organization_id)
      .single();

    const orgName = org?.name || 'SF';
    const orgEmail = org?.email || '';

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${orgName} <noreply@sffalcon.com>`,
      to: [clientEmail],
      subject: `Factura de ${orgName}`,
      html: `
        <h2>Hola ${clientName || 'Cliente'},</h2>
        <p>Adjuntamos tu nueva factura.</p>
        <p>Para cualquier consulta, no dudes en contactarnos: <a href="mailto:${orgEmail}">${orgEmail}</a></p>
        <br/>
        <p>Un cordial saludo,</p>
        <p><strong>${orgName}</strong></p>
      `,
      attachments: [
        {
          filename: `Factura_${invoiceNumber || invoiceId}.pdf`,
          content: base64Data,
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    // Verify invoice and update status if it was "borrador"
    const { data: inv } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (inv && inv.status === 'borrador') {
      await supabase
        .from('invoices')
        .update({ status: 'pendiente' })
        .eq('id', invoiceId)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Error sending invoice:', error);
    const msg = error instanceof Error ? error.message : 'Error al enviar la factura';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
