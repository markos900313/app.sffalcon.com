'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import { OCIO_EXPENSE_CATEGORIES } from './categories';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const { organization } = useOrganization();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [concept, setConcept] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const filteredSuggestions = OCIO_EXPENSE_CATEGORIES.filter((s) =>
    s.toUpperCase().includes(category.toUpperCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!category.trim()) {
      newErrors.category = 'Selecciona o escribe una categoría';
    }

    const amountNum = parseFloat(amount.replace(',', '.'));
    if (!amount.trim() || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'El importe debe ser mayor que 0';
    }

    if (!selectedMonth) {
      newErrors.month = 'Selecciona un mes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setCategory(suggestion);
    setShowSuggestions(false);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setShowSuggestions(true);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: '' }));
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const handleMonthChange = (value: number) => {
    setSelectedMonth(value);
    if (errors.month) {
      setErrors((prev) => ({ ...prev, month: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Usuario no autenticado');
        setIsLoading(false);
        return;
      }

      if (!organization?.id) {
        toast.error('Organización no encontrada');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from('finance_entries')
        .insert({
          user_id: user.id,
          organization_id: organization.id,
          month: selectedMonth,
          year: 2026,
          concept: concept.trim() || category.toUpperCase(),
          category: category.toUpperCase(),
          type: 'gasto',
          amount: parseFloat(amount.replace(',', '.')),
        });

      if (error) {
        throw error;
      }

      toast.success('Gasto añadido');
      setCategory('');
      setAmount('');
      setSelectedMonth(new Date().getMonth() + 1);
      setConcept('');
      setErrors({});
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al añadir gasto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-lg md:rounded-xl p-4 md:p-5 lg:p-6 w-full max-w-sm md:max-w-md shadow-2xl transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">
            Nuevo Gasto
          </h2>
          <button
            onClick={onClose}
            className="text-[#64748B] dark:text-[#475569] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-3.5 lg:space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2.5 ml-1">
              Nombre / Categoría
            </label>
            <div className="relative" ref={suggestionsRef}>
              <input
                type="text"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Ej: Mantenimiento"
                className={`w-full px-4 py-2.5 border rounded-xl bg-[#F1F5F9] dark:bg-[#111F3A] text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-[#475569] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-normal min-h-[44px] ${
                  errors.category
                    ? 'border-[#EF4444] dark:border-[#EF4444]'
                    : 'border-[#E2E8F0] dark:border-[#1E3A5F]'
                }`}
              />
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111F3A] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-sm">
                  {(category ? filteredSuggestions : OCIO_EXPENSE_CATEGORIES).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-2.5 text-[12px] text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors first:rounded-t-xl last:rounded-b-xl border-b last:border-0 border-[#F1F5F9] dark:border-[#1E3A5F]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.category && (
              <p className="text-[10px] md:text-[11px] lg:text-[12px] text-[#EF4444] mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2.5 ml-1">
              Tipo de Gasto (Rápido)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl bg-[#F1F5F9] dark:bg-[#111F3A] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-normal min-h-[44px] appearance-none"
            >
              <option value="" className="bg-[#111F3A] text-white">Selecciona una opción...</option>
              {OCIO_EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#111F3A] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0,00"
              className={`w-full px-4 py-2.5 border rounded-xl bg-[#F1F5F9] dark:bg-[#111F3A] text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-[#475569] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-semibold tabular-nums min-h-[44px] ${
                errors.amount
                  ? 'border-[#EF4444] dark:border-[#EF4444]'
                  : 'border-[#E2E8F0] dark:border-[#1E3A5F]'
              }`}
            />
            {errors.amount && (
              <p className="text-[10px] md:text-[11px] lg:text-[12px] text-[#EF4444] mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(parseInt(e.target.value))}
              className={`w-full px-4 py-2.5 border rounded-xl bg-[#F1F5F9] dark:bg-[#111F3A] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-normal min-h-[44px] appearance-none ${
                errors.month
                  ? 'border-[#EF4444] dark:border-[#EF4444]'
                  : 'border-[#E2E8F0] dark:border-[#1E3A5F]'
              }`}
            >
              <option value={1} className="bg-[#111F3A] text-white">Enero</option>
              <option value={2} className="bg-[#111F3A] text-white">Febrero</option>
              <option value={3} className="bg-[#111F3A] text-white">Marzo</option>
              <option value={4} className="bg-[#111F3A] text-white">Abril</option>
              <option value={5} className="bg-[#111F3A] text-white">Mayo</option>
              <option value={6} className="bg-[#111F3A] text-white">Junio</option>
              <option value={7} className="bg-[#111F3A] text-white">Julio</option>
              <option value={8} className="bg-[#111F3A] text-white">Agosto</option>
              <option value={9} className="bg-[#111F3A] text-white">Septiembre</option>
              <option value={10} className="bg-[#111F3A] text-white">Octubre</option>
              <option value={11} className="bg-[#111F3A] text-white">Noviembre</option>
              <option value={12} className="bg-[#111F3A] text-white">Diciembre</option>
            </select>
            {errors.month && (
              <p className="text-[10px] md:text-[11px] lg:text-[12px] text-[#EF4444] mt-1">{errors.month}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2.5 ml-1">
              Concepto / Detalles
            </label>
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Añade detalles del gasto..."
              className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-xl bg-[#F1F5F9] dark:bg-[#111F3A] text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-[#475569] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-normal resize-none h-20"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-[#1E3A5F]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#64748B] dark:text-[#94A3B8] rounded-xl hover:bg-slate-50 dark:hover:bg-[#162040] transition-all text-[13px] font-semibold uppercase tracking-wide disabled:opacity-50 min-h-[48px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#1B4FD8] text-white rounded-xl hover:bg-blue-700 transition-all text-[13px] font-semibold uppercase tracking-wide shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
            >
              {isLoading ? 'Guardando...' : 'Nuevo Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
