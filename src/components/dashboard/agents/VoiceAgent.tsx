'use client';

import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import AgentCard from './AgentCard';
import toast from 'react-hot-toast';
import { useLanguage } from '@/lib/LanguageContext';

interface VoiceAgentProps {
  onAddLog: (log: any) => void;
}

export default function VoiceAgent({ onAddLog }: VoiceAgentProps) {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  return (
    <AgentCard 
      icon={Mic}
      iconColor="#1B4FD8"
      title={t('aiAgents.cards.voice.title')}
      description={t('aiAgents.cards.voice.desc')}
      isActive={isActive}
      isRunning={isRunning}
      badge={t('aiAgents.cards.upcoming')}
      onToggle={() => toast.error(t('aiAgents.cards.devModule'))}
      onConfigure={() => toast.error(t('aiAgents.cards.devModule'))}
      onRun={() => toast.error(t('aiAgents.cards.devModule'))}
    />
  );
}
