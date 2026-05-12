'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrganization } from '@/context/OrganizationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const { organization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: '¿En qué puedo ayudarte con tu negocio?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !organization?.id) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          organizationId: organization.id,
          history: messages.slice(-8).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply || 'Error al procesar tu consulta.' 
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error de conexión. Inténtalo de nuevo.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <motion.button
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            setTimeout(() => {
              setMessages([{ role: 'assistant', content: '¿En qué puedo ayudarte con tu negocio?' }]);
              setInput('');
            }, 300);
          } else {
            setIsOpen(true);
          }
        }}
        className={cn(
          "fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full bg-[#1B4FD8] flex items-center justify-center hover:bg-[#1642B5] transition-colors group shadow-none",
          isOpen && "hidden md:flex"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Icono Robot solicitado */}
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            {/* Cabeza */}
            <rect x="5" y="8" width="14" height="10" rx="2" />
            {/* Ojos (Barras verticales) */}
            <line x1="9" y1="12" x2="9" y2="14" />
            <line x1="15" y1="12" x2="15" y2="14" />
            {/* Antena en T */}
            <line x1="12" y1="8" x2="12" y2="5" />
            <line x1="10" y1="5" x2="14" y2="5" />
            {/* Orejas/Nodos laterales */}
            <path d="M5 12H3.5" />
            <path d="M19 12H20.5" />
          </svg>

        </div>
      </motion.button>



      {/* CHAT POPUP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-[9997] flex flex-col bg-[#0D1B3E] border border-[#1E3A5F] shadow-2xl overflow-hidden bottom-6 left-4 right-4 rounded-[24px] md:bottom-24 md:right-6 md:left-auto md:w-[360px]"
            style={{ maxHeight: '75vh' }}
          >
            <div className="px-5 py-4 border-b border-[#1E3A5F] flex items-center justify-between bg-[#111F3A] shrink-0">
              <p className="text-sm font-bold text-white tracking-wide italic">SF</p>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => {
                    setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }]);
                    setInput('');
                  }, 300);
                }} 
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>


            {/* MESSAGES */}
            <div className="overflow-y-auto p-4 space-y-3" style={{ minHeight: '280px', maxHeight: '320px' }}>
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-[#1B4FD8] text-white rounded-br-sm" 
                      : "bg-[#1E3A5F] text-slate-200 rounded-bl-sm border-l-2 border-[#1B4FD8]"
                  )}>

                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#1E3A5F] px-4 py-3 rounded-2xl rounded-bl-sm">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-[#1E3A5F] bg-[#111F3A] shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe tu pregunta..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-[#0D1B3E] border border-[#1E3A5F] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#1B4FD8]/50 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-[#1B4FD8] hover:bg-[#1642B5] disabled:opacity-40 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
