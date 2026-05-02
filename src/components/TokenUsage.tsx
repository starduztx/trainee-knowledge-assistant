'use client'

import { useEffect, useState } from 'react'

export function TokenUsage({
  refreshKey = 0,
  currentUser
}: {
  refreshKey?: number
  currentUser: string
}) {
  const [total, setTotal] = useState(0)
  const [todayTotal, setTodayTotal] = useState(0)
  const [dailyLimit, setDailyLimit] = useState(10000)
  const [remaining, setRemaining] = useState(10000)
  const [percentUsed, setPercentUsed] = useState(0)
  const [isWarning, setIsWarning] = useState(false)
  const [isExceeded, setIsExceeded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokenUsage = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/token-usage')
        if (res.ok) {
          const data = await res.json()
          setTotal(data.total)
          setTodayTotal(data.todayTotal ?? 0)
          setDailyLimit(data.dailyLimit ?? 10000)
          setRemaining(data.remaining ?? 10000)
          setPercentUsed(data.percentUsed ?? 0)
          setIsWarning(Boolean(data.isWarning))
          setIsExceeded(Boolean(data.isExceeded))
        }
      } catch (error) {
        console.error('Failed to fetch token usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenUsage()
  }, [refreshKey])

  const formatCompact = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
    }

    return value.toLocaleString()
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4 text-center text-sm text-neutral-500">
        Loading usage...
      </div>
    )
  }

  const barColor = isExceeded ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-neutral-950'
  const statusText = isExceeded
    ? 'Daily limit reached'
    : isWarning
      ? 'Almost at daily limit'
      : 'Available today'

  return (
    <section className="rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-950">Token Usage</h3>
          <p className="mt-1 truncate text-xs text-neutral-500">{currentUser}</p>
        </div>
        <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-500">
          1d limit
        </span>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-neutral-500">Today</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-950">
              {formatCompact(todayTotal)}
              <span className="ml-1 text-sm font-normal text-neutral-500">
                / {formatCompact(dailyLimit)}
              </span>
            </p>
          </div>
          <p className="text-right text-xs text-neutral-500">
            {formatCompact(remaining)} left
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <p className={`mt-2 text-xs ${isExceeded ? 'text-red-600' : isWarning ? 'text-amber-700' : 'text-neutral-500'}`}>
          {statusText} ({todayTotal.toLocaleString()} / {dailyLimit.toLocaleString()} tokens)
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <span>30-day total</span>
        <span>{total.toLocaleString()} tokens</span>
      </div>
    </section>
  )
}
