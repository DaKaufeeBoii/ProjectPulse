'use client'
import { useState, useEffect, useRef } from 'react'

type Msg = {
  id: string
  content: string
  author: string
  avatar: string | null
  createdAt: string
}

export default function ChatPanel({
  initialMessages,
  projectId,
  userName,
}: {
  initialMessages: Msg[]
  projectId: string
  userName: string
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // ── SSE subscription ─────────────────────────────────────
  useEffect(() => {
    const es = new EventSource(`/api/messages/stream?projectId=${projectId}`)

    es.onopen = () => setConnected(true)

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data)
        if (payload.type === 'init') {
          // Replace local state with authoritative list from server
          setMessages(payload.messages)
        } else if (payload.type === 'message') {
          setMessages(prev => {
            // Avoid duplicates (our own optimistic message is already there)
            if (prev.find(m => m.id === payload.message.id)) return prev
            return [...prev, payload.message]
          })
        }
      } catch { /* ignore malformed */ }
    }

    es.onerror = () => setConnected(false)

    return () => es.close()
  }, [projectId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!text.trim() || sending) return
    setSending(true)
    const draft = text
    setText('')

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: draft,
        projectId,
        author: userName || 'You',
        avatar: (userName || 'You').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      }),
    })
    setSending(false)
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="glass rounded-xl flex flex-col h-[600px]">
      <div className="px-5 py-4 border-b border-white/5">
        <h2 className="font-display font-semibold text-white">Team Chat</h2>
        <div className="flex items-center gap-1.5 mt-1">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-jade animate-pulse-slow' : 'bg-white/20'}`} />
          <span className="text-xs text-white/30">{connected ? 'Live' : 'Connecting…'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-white/20">No messages yet. Start the conversation.</p>
          </div>
        )}
        {messages.map(msg => {
          const isOwn = msg.author === (userName || 'You')
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isOwn ? 'bg-accent/30 text-accent-light' : 'bg-surface-3 text-white/50'
                }`}>
                {msg.avatar || msg.author.slice(0, 2).toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isOwn ? 'items-end' : ''} flex flex-col gap-1`}>
                <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] text-white/30">{msg.author}</span>
                  <span className="text-[10px] text-white/20">{formatTime(msg.createdAt)}</span>
                </div>
                <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${isOwn ? 'bg-accent/80 text-white rounded-tr-sm' : 'bg-surface-3 text-white/80 rounded-tl-sm'
                  }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type a message…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="px-3 py-2 bg-accent hover:bg-accent/80 disabled:opacity-30 text-white rounded-xl transition-all text-sm"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
