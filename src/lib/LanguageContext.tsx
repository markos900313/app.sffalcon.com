'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { es } from './i18n/es';
import { en } from './i18n/en';
import { TranslationKeys } from './i18n/types';

export type Language = 'es' | 'en';

type TOptions = {
  defaultValue?: string;
  [key: string]: any;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys | (string & {}), options?: TOptions) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  t: (key) => key as string,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('asistente_language');
    if (savedLanguage === 'en' || savedLanguage === 'es') {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    try {
      localStorage.setItem('asistente_language', newLanguage);
    } catch (e) {
      console.error('Error saving language preference to localStorage:', e);
    }
  };

  const t = (key: TranslationKeys | (string & {}), options?: TOptions): string => {
    const dict = language === 'en' ? en : es;
    const parts = (key as string).split('.');
    let val: any = dict;
    for (const part of parts) {
      if (val && typeof val === 'object' && part in val) {
        val = val[part];
      } else {
        // Key not found — use defaultValue or the key itself
        const fallback = options?.defaultValue ?? (key as string);
        return interpolate(fallback, options);
      }
    }
    const result = typeof val === 'string' ? val : (key as string);
    return interpolate(result, options);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Replace {varName} placeholders with values from options */
function interpolate(str: string, options?: TOptions): string {
  if (!options) return str;
  return str.replace(/\{(\w+)\}/g, (_, varName) => {
    if (varName === 'defaultValue') return _;
    return options[varName] !== undefined ? String(options[varName]) : `{${varName}}`;
  });
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }
  return context;
};
