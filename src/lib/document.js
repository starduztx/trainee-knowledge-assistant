export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024
export const ALLOWED_EXTENSIONS = new Set(['.pdf', '.txt'])
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/x-pdf',
  'text/plain',
  'text/markdown',
  'application/octet-stream',
  ''
])

export function getFileExtension(filename) {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot < 0) return ''
  return filename.slice(lastDot).toLowerCase()
}

export function validateUploadFile({ name, type = '', size = 0 }) {
  const extension = getFileExtension(name || '')

  if (!name || !extension) {
    return { ok: false, error: 'File must have a .pdf or .txt extension' }
  }

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return { ok: false, error: 'Only PDF and TXT files are allowed' }
  }

  if (!ALLOWED_MIME_TYPES.has(type || '')) {
    return { ok: false, error: 'Unsupported file type' }
  }

  if (size <= 0) {
    return { ok: false, error: 'File is empty' }
  }

  if (size > MAX_UPLOAD_SIZE) {
    return { ok: false, error: 'File is too large. Maximum size is 10MB' }
  }

  return { ok: true, extension }
}

export function normalizeText(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function chunkDocument(content, chunkSize = 1600, overlap = 180) {
  const normalized = normalizeText(content)
  if (!normalized) return []

  const chunks = []
  let start = 0

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length)
    const text = normalized.slice(start, end).trim()
    if (text) {
      chunks.push({
        index: chunks.length + 1,
        text,
        start,
        end
      })
    }

    if (end >= normalized.length) break
    start = Math.max(0, end - overlap)
  }

  return chunks
}

export function tokenizeForSearch(text) {
  return Array.from(
    new Set(
      String(text || '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((word) => word.length >= 2)
    )
  )
}

export function selectRelevantChunks(content, query, limit = 4) {
  const chunks = chunkDocument(content)
  if (chunks.length <= limit) return chunks

  const queryTerms = tokenizeForSearch(query)
  if (queryTerms.length === 0) return chunks.slice(0, limit)

  const scored = chunks.map((chunk) => {
    const text = chunk.text.toLowerCase()
    const score = queryTerms.reduce((total, term) => {
      return total + (text.includes(term) ? 1 : 0)
    }, 0)

    return { ...chunk, score }
  })

  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
}

export function buildDocumentPrompt(file, chunks) {
  if (!file || chunks.length === 0) return ''

  const sections = chunks
    .map((chunk) => `[${file.originalName || file.filename} - section ${chunk.index}]\n${chunk.text}`)
    .join('\n\n---\n\n')

  return `Use the document excerpts below to answer. Cite the section label when useful.\n\n${sections}`
}

export function estimateTokenSplit(totalTokens) {
  const safeTotal = Number.isFinite(totalTokens) ? Math.max(0, totalTokens) : 0
  return {
    inputTokens: Math.floor(safeTotal * 0.3),
    outputTokens: safeTotal - Math.floor(safeTotal * 0.3),
    totalTokens: safeTotal
  }
}
