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

    const { estimateId, pdfBase64, clientEmail, clientName, estimateNumber, acceptToken } = await request.json();

    if (!estimateId || !pdfBase64 || !clientEmail) {
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

    // Enlace de aprobación
    const approvalLink = `https://app.sffalcon.com/accept-estimate/${acceptToken || estimateId}`;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${orgName} <noreply@sffalcon.com>`,
      to: [clientEmail],
      subject: `Presupuesto de ${orgName}`,
      html: `
        <h2>Hola ${clientName || 'Cliente'},</h2>
        <p>Adjuntamos el presupuesto solicitado <strong>${estimateNumber || ''}</strong>.</p>
        <p>Para aceptar o rechazar este presupuesto, puedes hacerlo directamente haciendo clic en el siguiente enlace:</p>
        <p><a href="${approvalLink}" style="display:inline-block;background-color:#1B4FD8;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;font-weight:bold;">Revisar y Aceptar Presupuesto</a></p>
        <p>Para cualquier consulta, no dudes en contactarnos a <a href="mailto:${orgEmail}">${orgEmail}</a>.</p>
        <br/>
        <p>Un cordial saludo,</p>
        <p><strong>${orgName}</strong></p>
      `,
      attachments: [
        {
          filename: `Presupuesto_${estimateNumber || estimateId}.pdf`,
          content: base64Data,
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    // Update status to 'sent'
    await supabase
      .from('estimates')
      .update({ status: 'sent' })
      .eq('id', estimateId);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Error sending estimate:', error);
    const msg = error instanceof Error ? error.message : 'Error al enviar el presupuesto';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
