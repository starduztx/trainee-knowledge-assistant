// filepath: src/app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PDFParse } from 'pdf-parse'
import { normalizeText, validateUploadFile } from '@/lib/document'
import path from 'path'
import { pathToFileURL } from 'url'

export const runtime = 'nodejs'

const pdfWorkerPath = path.join(
  process.cwd(),
  'node_modules',
  'pdfjs-dist',
  'legacy',
  'build',
  'pdf.worker.mjs'
)
PDFParse.setWorker(pathToFileURL(pdfWorkerPath).href)

async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer })

  try {
    const result = await parser.getText()
    return result.text
  } finally {
    await parser.destroy()
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const validation = validateUploadFile({
      name: file.name,
      type: file.type,
      size: file.size
    })

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const rawContent = validation.extension === '.pdf'
      ? await extractPdfText(buffer)
      : buffer.toString('utf-8')
    const content = normalizeText(rawContent)

    if (!content) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this file' },
        { status: 400 }
      )
    }

    const savedFile = await prisma.file.create({
      data: {
        userId: session.user.id,
        filename: file.name,
        originalName: file.name,
        contentType: file.type || (validation.extension === '.pdf' ? 'application/pdf' : 'text/plain'),
        content: content,
        fileSize: file.size
      }
    })

    return NextResponse.json(savedFile)
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const files = await prisma.file.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        originalName: true,
        contentType: true,
        fileSize: true,
        createdAt: true
      }
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { error: 'Failed to get files' },
      { status: 500 }
    )
  }
}
