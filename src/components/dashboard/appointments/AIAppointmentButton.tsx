"use client";

import React, { useState } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import AppointmentModal from "./AppointmentModal";

interface AIAppointmentButtonProps {
  communicationId: string;
  messages: any[];
  className?: string;
}

export default function AIAppointmentButton({ 
  communicationId, 
  messages,
  className 
}: AIAppointmentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

  const handleExtract = async () => {
    if (messages.length === 0) {
      toast.error("No hay mensajes en la conversación");
      return;
    }

    setLoading(true);
    try {
      // Preparamos el contexto de los mensajes para la IA
      const chatContext = messages
        .slice(-10) // Últimos 10 mensajes para contexto
        .map(m => `${m.sender === 'client' ? 'Cliente' : 'SF'}: ${m.content}`)
        .join('\n');

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'extract_appointment',
          message: chatContext
        })
      });

      if (!res.ok) throw new Error("Error al consultar la IA");

      const data = await res.json();
      const aiResponse = data.response;

      // Intentar parsear el JSON de la IA
      try {
        const appointmentData = JSON.parse(aiResponse);
        
        if (!appointmentData.date || !appointmentData.time) {
          toast.error("No se detectó una fecha u hora clara en la conversación");
          // Abrimos el modal de todos modos pero vacío o con lo que tenga
        }

        setAiData({
          ...appointmentData,
          created_by: 'ai'
        });
        setModalOpen(true);
      } catch (e) {
        console.error("Error parseando respuesta IA:", aiResponse);
        toast.error("La IA no devolvió un formato válido");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExtract}
        disabled={loading || messages.length === 0}
        className={cn(
          "flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-full text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all disabled:opacity-50",
          className
        )}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CalendarPlus className="w-3.5 h-3.5" />
        )}
        <span>Crear cita con IA</span>
      </button>

      {modalOpen && (
        <AppointmentModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false);
            toast.success("Cita guardada correctamente");
          }}
          initialData={aiData}
        />
      )}
    </>
  );
}

// Helper simple para usar 'cn' si no está importado o disponible de forma global
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
