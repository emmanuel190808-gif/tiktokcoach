'use client'
import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

export default function CoachChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Salut ! Je suis ton coach TikTok personnel. Dis-moi ce qui te bloque, ce que tu veux améliorer, ou pose-moi n'importe quelle question sur ta stratégie de contenu. Je suis là pour t'aider à progresser. 🎯"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Désolé, une erreur s'est produite. Réessaie." }])
    }
    setLoading(false)
  }

  return (
    <main translate="no" className="notranslate min-h-screen bg-black text-white flex flex-col max-w-lg mx-auto">
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800 sticky top-0 bg-black z-10">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-red-500 flex items-center justify-center text-sm font-black">TC</div>
        <div>
          <div className="font-bold text-sm">Ton Coach TikTok</div>
          <div className="text-xs text-green-400">● En ligne</div>
        </div>
        <a href="/tiktok-coach" className="ml-auto text-xs text-zinc-500 hover:text-zinc-300">← Retour</a>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-red-500 text-white rounded-br-sm'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="p-4 border-t border-zinc-800 sticky bottom-0 bg-black">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Pose ta question à ton coach…"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 transition-colors"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-red-500 rounded-xl font-bold text-sm disabled:bg-zinc-800 disabled:text-zinc-600 transition-all"
          >
            →
          </button>
        </div>
      </div>
    </main>
  )
}