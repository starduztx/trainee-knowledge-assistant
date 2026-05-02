// filepath: src/lib/openai.ts
import OpenAI from 'openai'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
}

export async function countTokens(text: string): Promise<number> {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4)
}

export async function createEmbedding(input: string) {
  const openai = getOpenAIClient()

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input
  })

  return response.data[0]?.embedding || []
}

export async function chatWithDocument(
  documentPrompt: string,
  userMessage: string,
  model: string = 'gpt-5.4-mini'
) {
  const openai = getOpenAIClient()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  const instructions = documentPrompt
    ? `You are a helpful assistant that answers questions about uploaded documents.
Answer based only on the provided excerpts. If the answer is not present, say that you cannot find it in the uploaded document. Include short citations such as "section 2" when relevant.

${documentPrompt}`
    : 'You are a helpful assistant. Answer clearly and concisely.'

  const response = await openai.responses.create({
    model,
    instructions,
    input: userMessage,
    max_output_tokens: 2000,
    store: true
  }, { signal: controller.signal })

  clearTimeout(timeout)

  return {
    content: response.output_text || '',
    tokens: response.usage?.total_tokens || 0
  }
}
