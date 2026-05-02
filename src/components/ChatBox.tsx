// filepath: src/components/ChatBox.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { MarkdownText } from '@/components/MarkdownText'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  tokens?: number
  createdAt: string
}

interface ChatBoxProps {
  fileId?: string
  selectedFileName?: string
  onMessageSent?: () => void
}

interface Citation {
  label: string
  chunk: number
}

export function ChatBox({ fileId, selectedFileName, onMessageSent }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [citationsByMessage, setCitationsByMessage] = useState<Record<string, Citation[]>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchChats = async () => {
      const url = fileId ? `/api/chat?fileId=${fileId}` : '/api/chat'

      try {
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
          setCitationsByMessage({})
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error)
      }
    }

    fetchChats()
  }, [fileId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    const optimisticId = `pending-${Date.now()}`
    setMessages(prev => [...prev, {
      id: optimisticId,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString()
    }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, fileId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Chat failed')
      }

      setMessages(prev => {
        const withoutOptimistic = prev.filter((message) => message.id !== optimisticId)

        return [
          ...withoutOptimistic,
          {
            id: data.userMessage.id,
            role: 'user',
            content: data.userMessage.content,
            createdAt: data.userMessage.createdAt
          },
          {
            id: data.assistantMessage.id,
            role: 'assistant',
            content: data.assistantMessage.content,
            tokens: data.assistantMessage.tokens,
            createdAt: data.assistantMessage.createdAt
          }
        ]
      })

      if (data.citations?.length) {
        setCitationsByMessage(prev => ({
          ...prev,
          [data.assistantMessage.id]: data.citations
        }))
      }

      onMessageSent?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Chat failed'
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I could not complete that request.\n\n${message}`,
        createdAt: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-neutral-200 bg-[#fbfbfa]">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Context</p>
          <p className="truncate text-sm font-semibold text-neutral-950">
            {selectedFileName || 'General assistant'}
          </p>
        </div>
        <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-500">
          {fileId ? 'Document chat' : 'General chat'}
        </span>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md text-center">
              <p className="text-lg font-medium text-neutral-950">
                {fileId ? 'Ask about this document' : 'Start a conversation'}
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                {fileId
                  ? 'Questions will use the selected file as context.'
                  : 'Upload a document or ask a general question.'}
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[min(760px,85%)] rounded-2xl px-4 py-3 text-[15px] leading-7 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-neutral-950 text-white'
                    : 'border border-neutral-200 bg-white text-neutral-950'
                }`}
              >
                {message.role === 'assistant' ? (
                  <MarkdownText content={message.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                {message.tokens && message.tokens > 0 && (
                  <p className={`mt-2 text-xs ${message.role === 'user' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {message.tokens} tokens
                  </p>
                )}
                {citationsByMessage[message.id]?.length > 0 && (
                  <div className="mt-3 border-t border-neutral-200 pt-2">
                    <p className="text-xs font-semibold text-neutral-500">Sources</p>
                    <ul className="mt-1 space-y-1">
                      {citationsByMessage[message.id].map((citation) => (
                        <li key={citation.label} className="text-xs text-neutral-500">
                          {citation.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: '0.1s' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-neutral-200 bg-[#fbfbfa] p-4">
        <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-10 rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
