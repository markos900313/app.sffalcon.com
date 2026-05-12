'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Send, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  financeEntries: any[]
  businessEntries: any[]
  communications: any[]
  clients: any[]
  projects: any
  selectedMonth: number
  year: number
}

export default function AsistenteAIAssistant({ 
  financeEntries,
  businessEntries,
  communications,
  clients,
  projects,
  selectedMonth,
  year
}: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [user, setUser] = useState<any>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUserData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: member } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', authUser.id)
          .single()

        if (member?.organization_id) {
          setOrganizationId(member.organization_id)
        }

        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        if (userProfile) {
          setUser(authUser)
          setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }])
        } else {
          setUser(authUser)
          setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }])
        }
      }
    }
    getUserData()
  }, [])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)



  // Foco automático
  useEffect(() => {
    if (!loading) {
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100)
    }
  }, [loading])

  // Mensaje de bienvenida unificado
  useEffect(() => {
    if (messages.length <= 1 && user) {
      setMessages([{ role: 'assistant', content: '¿En qué te puedo ayudar?' }])
    }
  }, [selectedMonth, user])

  // Scroll automático
  useEffect(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      const container = messagesEndRef.current?.parentElement
      if (container) container.scrollTop = container.scrollHeight
    }, 50)
    return () => { if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current) }
  }, [messages.length, loading])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setInput('')
    setLoading(true)
    const userMsg: Message = { role: 'user', content: trimmed }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          organizationId: organizationId,
          history: newMessages.slice(-8)
        })
      })

      if (!response.ok) throw new Error('Error en la respuesta')
      
      const data = await response.json()
      const aiReply = data.reply || 'No pude procesar tu consulta.'
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiReply 
      }])

    } catch (error: any) {
      console.error('AI Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Vaya, parece que ha habido un problema al conectar. ¿Podemos intentarlo de nuevo?' }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 10)
    }
  }

  const sugerencias: string[] = []

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111F3A] overflow-hidden transition-all duration-200">

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col min-h-[220px] scrollbar-none bg-white dark:bg-[#111F3A]">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "text-sm py-3 px-4 leading-relaxed",
            msg.role === 'assistant' 
              ? "bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none max-w-[85%] self-start shadow-sm" 
              : "bg-blue-600 text-white rounded-2xl rounded-br-none max-w-[85%] self-end shadow-md shadow-blue-500/10"
          )}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bg-[#F8FAFC] dark:bg-[#162040] border border-[#E2E8F0] dark:border-[#1E3A5F] rounded-[4px_14px_14px_14px] px-4 py-2 self-start">
            <div className="flex gap-1.5 text-[#94A3B8]">
              {[0, 150, 300].map(d => (
                <div key={d} className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{animationDelay: `${d}ms`}} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>


      {/* INPUT */}
      <div className="h-16 px-10 border-t border-slate-50 dark:border-white/5 bg-white dark:bg-[#111F3A] flex items-center flex-shrink-0">
        <div className="flex gap-2 w-full">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Pregunta lo que sea..."
            disabled={loading}
            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-5 py-3 text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-slate-400 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-lg shadow-blue-500/20 grow-0 shrink-0"
          >
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  )
}
