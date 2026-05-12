'use client';

import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import AgentCard from './AgentCard';
import toast from 'react-hot-toast';

interface VoiceAgentProps {
  onAddLog: (log: any) => void;
}

export default function VoiceAgent({ onAddLog }: VoiceAgentProps) {
  const [isActive, setIsActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  return (
    <AgentCard 
      icon={Mic}
      iconColor="#1B4FD8"
      title="Agente de Voz"
      description="Atiende llamadas de clientes automáticamente, responde dudas y gestiona reservas mediante voz con inteligencia artificial humana."
      isActive={isActive}
      isRunning={isRunning}
      badge="Disponible próximamente"
      onToggle={() => toast.error('Módulo en desarrollo')}
      onConfigure={() => toast.error('Módulo en desarrollo')}
      onRun={() => toast.error('Módulo en desarrollo')}
    />
  );
}
