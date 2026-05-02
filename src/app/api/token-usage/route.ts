// filepath: src/app/api/token-usage/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    return NextResponse.json({
      usage: tokenUsage,
      total: totalTokens
    })
  } catch (error) {
    console.error('Get token usage error:', error)
    return NextResponse.json(
      { error: 'Failed to get token usage' },
      { status: 500 }
    )
  }
}
