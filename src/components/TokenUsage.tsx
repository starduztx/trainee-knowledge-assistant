// filepath: src/components/TokenUsage.tsx
'use client'

import { useState, useEffect } from 'react'

interface TokenUsageData {
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  date: string
}

export function TokenUsage({
  refreshKey = 0,
  currentUser
}: {
  refreshKey?: number
  currentUser: string
}) {
  const [usage, setUsage] = useState<TokenUsageData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokenUsage = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/token-usage')
        if (res.ok) {
          const data = await res.json()
          setUsage(data.usage)
          setTotal(data.total)
        }
      } catch (error) {
        console.error('Failed to fetch token usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenUsage()
  }, [refreshKey])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4 text-center text-sm text-neutral-500">Loading usage...</div>
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-950">Token Usage</h3>
          <p className="mt-1 truncate text-xs text-neutral-500">{currentUser}</p>
        </div>
        <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-500">
          30d
        </span>
      </div>

      <div className="mb-4">
        <span className="text-3xl font-semibold text-neutral-950">{total.toLocaleString()}</span>
        <span className="ml-2 text-sm text-neutral-500">tokens</span>
      </div>

      {usage.length === 0 ? (
        <p className="text-sm text-neutral-500">No usage data yet</p>
      ) : (
        <div className="space-y-2">
          {usage.slice(0, 7).map((item, index) => (
            <div key={index} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-xs">
              <span className="text-neutral-600">{formatDate(item.date)}</span>
              <div className="flex gap-3">
                <span className="text-neutral-500">
                  In {item.inputTokens.toLocaleString()}
                </span>
                <span className="text-neutral-500">
                  Out {item.outputTokens.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
