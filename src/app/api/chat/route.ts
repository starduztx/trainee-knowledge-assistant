// filepath: src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chatWithDocument, createEmbedding } from '@/lib/openai'
import { buildDocumentPrompt, estimateTokenSplit } from '@/lib/document'
import { checkRateLimit } from '@/lib/rate-limit'
import { selectRelevantVectorChunks } from '@/lib/vector-store'
import { getTokenQuota } from '@/lib/token-quota'
import type { Prisma } from '@prisma/client'

interface RetrievedChunk {
  index: number
  text: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimit = checkRateLimit(session.user.id, { limit: 3, windowMs: 60_000 })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many chat requests. Please wait a minute and try again.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { message, fileId } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const currentUsage = await prisma.tokenUsage.findMany({
      where: {
        userId: session.user.id,
        date: today
      }
    })
    const quota = getTokenQuota(
      currentUsage.reduce((sum, item) => sum + item.totalTokens, 0)
    )

    if (quota.isExceeded) {
      return NextResponse.json(
        {
          error: `Daily token limit reached. You used ${quota.used.toLocaleString()} / ${quota.limit.toLocaleString()} tokens today.`
        },
        { status: 429 }
      )
    }

    let documentPrompt = ''
    let citations: Array<{ label: string; section: number }> = []

    if (fileId) {
      const file = await prisma.file.findUnique({
        where: { id: fileId }
      })

      if (!file || file.userId !== session.user.id) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }

      const chunks = await selectRelevantVectorChunks({
        prisma,
        file,
        query: message,
        embed: createEmbedding,
        limit: 4
      }) as RetrievedChunk[]
      documentPrompt = buildDocumentPrompt(file, chunks)
      citations = chunks.map((chunk) => ({
        label: `${file.originalName} - section ${chunk.index}`,
        section: chunk.index
      }))
    }

    const userMessage = await prisma.chat.create({
      data: {
        userId: session.user.id,
        fileId: fileId || null,
        role: 'user',
        content: message,
        tokens: 0
      }
    })

    const aiResponse = await chatWithDocument(
      documentPrompt,
      message,
      'gpt-5.4-mini'
    )

    const assistantMessage = await prisma.chat.create({
      data: {
        userId: session.user.id,
        fileId: fileId || null,
        role: 'assistant',
        content: aiResponse.content,
        tokens: aiResponse.tokens
      }
    })

    const tokenSplit = estimateTokenSplit(aiResponse.tokens)
    const existingUsage = await prisma.tokenUsage.findFirst({
      where: {
        userId: session.user.id,
        model: 'gpt-5.4-mini',
        date: today
      }
    })

    if (existingUsage) {
      await prisma.tokenUsage.update({
        where: { id: existingUsage.id },
        data: {
          inputTokens: { increment: tokenSplit.inputTokens },
          outputTokens: { increment: tokenSplit.outputTokens },
          totalTokens: { increment: tokenSplit.totalTokens }
        }
      })
    } else {
      await prisma.tokenUsage.create({
        data: {
          userId: session.user.id,
          model: 'gpt-5.4-mini',
          inputTokens: tokenSplit.inputTokens,
          outputTokens: tokenSplit.outputTokens,
          totalTokens: tokenSplit.totalTokens,
          date: today
        }
      })
    }

    return NextResponse.json({
      userMessage: {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        tokens: assistantMessage.tokens,
        createdAt: assistantMessage.createdAt
      },
      citations
    })
  } catch (error) {
    console.error('Chat error:', error)
    const isAbort = error instanceof Error && error.name === 'AbortError'
    const message = error instanceof Error && error.message === 'OPENAI_API_KEY is not configured'
      ? error.message
      : isAbort
        ? 'AI request timed out. Please try again.'
        : 'Chat failed'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    const where: Prisma.ChatWhereInput = { userId: session.user.id }
    if (fileId) {
      where.fileId = fileId
    }

    const chats = await prisma.chat.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(chats)
  } catch (error) {
    console.error('Get chats error:', error)
    return NextResponse.json(
      { error: 'Failed to get chats' },
      { status: 500 }
    )
  }
}
