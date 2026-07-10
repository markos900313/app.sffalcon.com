import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { sendWhatsApp } from '@/lib/sendWhatsApp';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { task_id, organization_id } = await request.json();
    if (!task_id || !organization_id) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
    }

    // 1. Read task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', task_id)
      .eq('organization_id', organization_id)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'No se encontró la tarea' }, { status: 404 });
    }

    // 2. Check if already executed or auto_action is null
    if (!task.auto_action) {
      return NextResponse.json({ error: 'La tarea no requiere ejecución automática' }, { status: 400 });
    }

    if (task.auto_executed_at) {
      return NextResponse.json({ error: 'La tarea ya fue ejecutada anteriormente' }, { status: 400 });
    }

    // Get organization name
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organization_id)
      .single();
    
    const orgName = org?.name || 'SF Falcon';

    // 3. Read data from related record
    let contactEmail = '';
    let contactName = '';
    let contactPhone = '';
    
    let subject = '';
    let emailHtml = '';
    let messageText = '';

    const relatedType = task.related_type;
    const relatedId = task.related_id;

    if (!relatedType || !relatedId) {
      return NextResponse.json({ error: 'La tarea no tiene un registro vinculado para ejecución' }, { status: 400 });
    }

    if (relatedType === 'lead') {
      const { data: lead } = await supabase
        .from('leads')
        .select('nombre, email, telefono')
        .eq('id', relatedId)
        .single();

      if (!lead) {
        return NextResponse.json({ error: 'No se encontró el Lead vinculado' }, { status: 404 });
      }

      contactName = lead.nombre || 'Cliente';
      contactEmail = lead.email || '';
      contactPhone = lead.telefono || '';

      subject = `Seguimiento de tu consulta — ${orgName}`;
      emailHtml = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
          <h2 style="color: #1B4FD8;">Hola ${contactName},</h2>
          <p>Espero que estés teniendo un excelente día.</p>
          <p>Te escribimos de parte de <strong>${orgName}</strong> para dar seguimiento a tu consulta reciente.</p>
          <p>Queríamos saber si pudiste revisar la información o si tienes alguna pregunta en la que podamos asistirte.</p>
          <br/>
          <p>Quedamos a tu entera disposición.</p>
          <p>Atentamente,</p>
          <p>El equipo de <strong>${orgName}</strong></p>
        </div>
      `;

      messageText = `Hola ${contactName}, te escribimos de ${orgName} en relación a tu consulta. ¿Tienes alguna duda en la que te podamos ayudar?`;

    } else if (relatedType === 'estimate') {
      const { data: estimate } = await supabase
        .from('estimates')
        .select('estimate_number, customer_name, customer_email, customer_phone, total')
        .eq('id', relatedId)
        .single();

      if (!estimate) {
        return NextResponse.json({ error: 'No se encontró el Presupuesto vinculado' }, { status: 404 });
      }

      contactName = estimate.customer_name || 'Cliente';
      contactEmail = estimate.customer_email || '';
      contactPhone = estimate.customer_phone || '';

      subject = `¿Has tenido oportunidad de revisar nuestro presupuesto?`;
      emailHtml = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
          <h2 style="color: #1B4FD8;">Hola ${contactName},</h2>
          <p>Espero que te encuentres muy bien.</p>
          <p>Nos ponemos en contacto contigo para ver si has tenido la oportunidad de revisar el presupuesto <strong>${estimate.estimate_number || ''}</strong> por un total de <strong>${estimate.total || 0}€</strong> que te enviamos recientemente.</p>
          <p>Si tienes alguna consulta sobre los conceptos del presupuesto o deseas realizar cualquier modificación, no dudes en indicárnoslo.</p>
          <br/>
          <p>Atentamente,</p>
          <p>El equipo de <strong>${orgName}</strong></p>
        </div>
      `;

      messageText = `Hola ${contactName}, te escribimos de ${orgName}. ¿Has tenido oportunidad de revisar el presupuesto ${estimate.estimate_number || ''} por un total de ${estimate.total || 0}€ que te enviamos recientemente?`;

    } else if (relatedType === 'invoice') {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*, clients(name, email, phone)')
        .eq('id', relatedId)
        .single();

      if (!invoice) {
        return NextResponse.json({ error: 'No se encontró la Factura vinculada' }, { status: 404 });
      }

      // Safe extract from client join or invoice columns
      contactName = invoice.client_name || invoice.clients?.name || 'Cliente';
      contactEmail = invoice.client_email || invoice.clients?.email || '';
      contactPhone = invoice.client_phone || invoice.clients?.phone || '';

      const invoiceNum = invoice.invoice_number || '';
      const due = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('es-ES') : '—';
      const totalAmount = invoice.total || 0;

      subject = `Recordatorio de pago — Factura ${invoiceNum}`;
      emailHtml = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
          <h2 style="color: #1B4FD8;">Hola ${contactName},</h2>
          <p>Espero que te encuentres bien.</p>
          <p>Te enviamos este recordatorio amistoso en relación a la Factura <strong>${invoiceNum}</strong> por un importe total de <strong>${totalAmount}€</strong>, la cual figura como pendiente de pago y tiene como fecha límite el <strong>${due}</strong>.</p>
          <p>Agradecemos si pudieras revisar el estado de esta factura. Si ya has realizado el pago de la misma, por favor ignora este mensaje.</p>
          <br/>
          <p>Atentamente,</p>
          <p>El equipo de <strong>${orgName}</strong></p>
        </div>
      `;

      messageText = `Hola ${contactName}, te escribimos de ${orgName} para recordarte amistosamente que tienes la Factura ${invoiceNum} por un total de ${totalAmount}€ pendiente de pago. ¡Muchas gracias!`;
    } else {
      return NextResponse.json({ error: `Tipo de relación '${relatedType}' no soportada para automatización.` }, { status: 400 });
    }

    // 4. Execute auto action
    let notesActionDesc = '';
    const payload: any = {};
    let actionResult = task.auto_action;

    if (task.auto_action === 'send_email') {
      if (!contactEmail) {
        return NextResponse.json({ error: 'No se encontró correo electrónico para enviar el mensaje.' }, { status: 400 });
      }

      // Send email using Resend
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'hola@sffalcon.com',
        to: [contactEmail],
        subject: subject,
        html: emailHtml
      });

      if (emailError) {
        console.error('Error sending Resend email:', emailError);
        return NextResponse.json({ error: 'Error al enviar el correo por el proveedor' }, { status: 500 });
      }

      notesActionDesc = 'Envío de correo de seguimiento';
      payload.email_sent = true;
      payload.message_id = emailData?.id;

    } else if (task.auto_action === 'send_whatsapp') {
      if (!contactPhone) {
        return NextResponse.json({ error: 'No se encontró número de teléfono para enviar el mensaje.' }, { status: 400 });
      }

      console.log(`[WhatsApp Auto Task] Attempting auto send to: ${contactPhone}`);
      const waResult = await sendWhatsApp({
        to: contactPhone,
        message: messageText,
        orgId: organization_id
      });

      if (!waResult.success) {
        console.error('Error sending WhatsApp message:', waResult.error);
        return NextResponse.json({ error: `Error al enviar WhatsApp: ${waResult.error}` }, { status: 500 });
      }

      notesActionDesc = 'Envío automático de WhatsApp';
      payload.whatsapp_sent = true;
      payload.message_text = messageText;
      payload.phone = contactPhone;
      actionResult = 'send_whatsapp_auto';
    }

    // 5. Update task: status='completed', auto_executed_at=now(), notes updated
    const oldNotes = task.notes ? task.notes : '';
    const newNotes = `${oldNotes}\nEjecutado automáticamente: ${notesActionDesc}`.trim();

    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        auto_executed_at: new Date().toISOString(),
        auto_action_payload: payload,
        notes: newNotes
      })
      .eq('id', task_id);

    if (updateError) {
      console.error('Error updating task status:', updateError);
      // Even if update failed, we already sent the email, but returning status is good
    }

    // 6. Create notification
    await supabase.from('notifications').insert({
      organization_id: organization_id,
      title: 'Tarea ejecutada',
      message: `${task.title} completada automáticamente`,
      type: 'success',
      link: '/dashboard/tareas',
      read: false
    });

    return NextResponse.json({
      success: true,
      action: actionResult,
      message_text: messageText,
      phone: contactPhone,
      whatsapp_auto_sent: payload.whatsapp_sent
    });

  } catch (error: any) {
    console.error('Tasks execution API Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
