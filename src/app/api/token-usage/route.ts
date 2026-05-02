// filepath: src/app/api/token-usage/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTokenQuota } from '@/lib/token-quota'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokenUsage = await prisma.tokenUsage.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 30
    })

    const totalTokens = tokenUsage.reduce((sum, item) => sum + item.totalTokens, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTotal = tokenUsage
      .filter((item) => item.date.getTime() === today.getTime())
      .reduce((sum, item) => sum + item.totalTokens, 0)
    const quota = getTokenQuota(todayTotal)

    return NextResponse.json({
      usage: tokenUsage,
      total: totalTokens,
      todayTotal,
      dailyLimit: quota.limit,
      remaining: quota.remaining,
      percentUsed: quota.percentUsed,
      isWarning: quota.isWarning,
      isExceeded: quota.isExceeded
    })
  } catch (error) {
    console.error('Get token usage error:', error)
    return NextResponse.json(
      { error: 'Failed to get token usage' },
      { status: 500 }
    )
  }
}
