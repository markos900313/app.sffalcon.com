"use client";

import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

/**
 * Unificado: Indicador de carga minimalista
 * Spinner pequeño w-8 h-8 centrado en pantalla
 */
export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1c]/80 backdrop-blur-sm pointer-events-auto">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  );
}
