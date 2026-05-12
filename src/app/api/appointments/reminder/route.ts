import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";
import { format, addDays } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Calcular mañana en formato YYYY-MM-DD
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    // Buscar citas para mañana con clientes (name, email)
    // Filtramos por estados relevantes para recordatorios
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*, clients(name, email)')
      .eq('date', tomorrowStr)
      .in('status', ['confirmed', 'pending', 'pendiente', 'confirmada']);

    if (error) throw error;
    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ sent: 0, message: "No hay citas para mañana" });
    }

    let sentCount = 0;
    for (const apt of appointments) {
      if (apt.clients?.email) {
        const timeStr = apt.time.slice(0, 5);
        const subject = `Recordatorio: Cita mañana a las ${timeStr}`;
        const text = `Hola ${apt.clients.name}, te recordamos que mañana tienes una cita con el equipo de SF a las ${timeStr}. ${apt.notes ? `\n\nTema: ${apt.notes}` : ''} \n\nSi necesitas cambiarla o surge cualquier inconveniente, contáctanos respondiendo a este correo o vía WhatsApp. \n\nAtentamente, \nEl equipo de SF`;

        const { success } = await sendEmail({
          to: apt.clients.email,
          subject,
          text
        });

        if (success) sentCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      sent: sentCount, 
      total: appointments.length 
    });

  } catch (error: unknown) {
    console.error("Error in reminder route:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 });
  }
}
