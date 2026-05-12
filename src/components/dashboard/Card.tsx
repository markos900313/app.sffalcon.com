'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  category?: 'clientes' | 'agenda' | 'mensajes' | 'finanzas' | 'facturas' | 'trabajos' | 'proyectos' | 'ia' | 'asistente' | 'resumen' | 'stats';
  title?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function Card({ children, className, category, title, icon, rightAction }: CardProps) {
  return (
    <div className={cn(
      "card-premium",
      category && `card-${category}`,
      className
    )}>
      {(title || icon || rightAction) && (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <div className="text-slate-400">{icon}</div>}
            {title && <h3 className="card-titulo">{title}</h3>}
          </div>
          {rightAction && <div>{rightAction}</div>}
        </div>
      )}
      <div className={cn("p-6", (title || icon || rightAction) ? "pt-4" : "")}>
        {children}
      </div>
    </div>
  );
}

export default Card;
