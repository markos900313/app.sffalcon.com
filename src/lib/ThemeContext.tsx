'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    // Forzar siempre modo oscuro
    applyTheme('dark');
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    html.classList.add('dark');
    // Para asegurar que no se guarde otro estado
    localStorage.setItem('asistente_theme', 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    // No permitir cambiar a light
    applyTheme('dark');
  };

  const toggleTheme = () => {
    // No hacer nada al intentar toggle
  };

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};
