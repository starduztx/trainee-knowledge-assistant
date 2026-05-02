import { chunkDocument, selectRelevantChunks } from './document.js'

export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) {
    return 0
  }

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function serializeEmbedding(embedding) {
  return JSON.stringify(embedding)
}

export function parseEmbedding(value) {
  if (!value) return null

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export async function createDocumentChunks({ prisma, fileId, content, embed }) {
  const chunks = chunkDocument(content)

  await prisma.documentChunk.deleteMany({
    where: { fileId }
  })

  for (const chunk of chunks) {
    let embedding = null

    try {
      embedding = await embed(chunk.text)
    } catch (error) {
      console.warn('Embedding failed; chunk will use keyword fallback:', error)
    }

    await prisma.documentChunk.create({
      data: {
        fileId,
        chunkIndex: chunk.index,
        content: chunk.text,
        embedding: embedding?.length ? serializeEmbedding(embedding) : null
      }
    })
  }

  return chunks.length
}

export async function selectRelevantVectorChunks({
  prisma,
  file,
  query,
  embed,
  limit = 4
}) {
  const storedChunks = await prisma.documentChunk.findMany({
    where: { fileId: file.id },
    orderBy: { chunkIndex: 'asc' }
  })

  if (storedChunks.length === 0) {
    return selectRelevantChunks(file.content, query, limit)
  }

  let queryEmbedding = null

  try {
    queryEmbedding = await embed(query)
  } catch (error) {
    console.warn('Query embedding failed; using keyword fallback:', error)
  }

  if (!queryEmbedding?.length) {
    return selectRelevantChunks(file.content, query, limit)
  }

  const scored = storedChunks
    .map((chunk) => {
      const embedding = parseEmbedding(chunk.embedding)

      return {
        index: chunk.chunkIndex,
        text: chunk.content,
        score: embedding ? cosineSimilarity(queryEmbedding, embedding) : 0
      }
    })
    .filter((chunk) => chunk.text)
    .sort((a, b) => b.score - a.score || a.index - b.index)

  const topChunks = scored.slice(0, limit)

  if (topChunks.every((chunk) => chunk.score === 0)) {
    return selectRelevantChunks(file.content, query, limit)
  }

  return topChunks.sort((a, b) => a.index - b.index)
}
