'use client';

import { useEffect } from 'react';

export function ThemeInitializer() {
  useEffect(() => {
    // Forzar siempre modo oscuro
    document.documentElement.classList.add('dark');
    localStorage.setItem('asistente_theme', 'dark');
  }, []);

  return null;
}
