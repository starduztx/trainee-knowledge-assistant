export const DAILY_TOKEN_LIMIT = 10_000

export function getTokenQuota(totalTokens, limit = DAILY_TOKEN_LIMIT) {
  const used = Math.max(0, Number(totalTokens) || 0)
  const safeLimit = Math.max(1, Number(limit) || DAILY_TOKEN_LIMIT)
  const remaining = Math.max(0, safeLimit - used)
  const percentUsed = Math.min(100, Math.round((used / safeLimit) * 100))

  return {
    limit: safeLimit,
    used,
    remaining,
    percentUsed,
    isWarning: percentUsed >= 80 && used < safeLimit,
    isExceeded: used >= safeLimit
  }
}
