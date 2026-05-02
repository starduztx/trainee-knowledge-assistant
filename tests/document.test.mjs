import assert from 'node:assert/strict'
import {
  chunkDocument,
  estimateTokenSplit,
  selectRelevantChunks,
  validateUploadFile
} from '../src/lib/document.js'
import {
  cosineSimilarity,
  parseEmbedding,
  serializeEmbedding
} from '../src/lib/vector-store.js'
import { getTokenQuota } from '../src/lib/token-quota.js'

const tests = [
  ['validateUploadFile accepts txt and pdf under 10MB', () => {
    assert.equal(validateUploadFile({
      name: 'notes.txt',
      type: 'text/plain',
      size: 100
    }).ok, true)

    assert.equal(validateUploadFile({
      name: 'manual.pdf',
      type: 'application/pdf',
      size: 100
    }).ok, true)
  }],
  ['validateUploadFile rejects unsafe or oversized files', () => {
    assert.equal(validateUploadFile({
      name: 'shell.php',
      type: 'text/plain',
      size: 100
    }).ok, false)

    assert.equal(validateUploadFile({
      name: 'large.pdf',
      type: 'application/pdf',
      size: 11 * 1024 * 1024
    }).ok, false)
  }],
  ['chunkDocument splits long content with stable indexes', () => {
    const chunks = chunkDocument('a'.repeat(3500), 1000, 100)
    assert.equal(chunks.length, 4)
    assert.deepEqual(chunks.map((chunk) => chunk.index), [1, 2, 3, 4])
  }],
  ['selectRelevantChunks ranks chunks by query overlap', () => {
    const content = [
      'Authentication uses bcrypt and JWT sessions.',
      'File upload supports PDF and TXT documents.',
      'Token usage is shown after each assistant response.',
      'Docker compose starts the application with one command.',
      'Legacy systems need careful rollback planning.'
    ].join('\n\n'.repeat(500))

    const chunks = selectRelevantChunks(content, 'How does token usage work?', 2)
    assert.ok(chunks.some((chunk) => chunk.text.includes('Token usage')))
  }],
  ['estimateTokenSplit preserves total tokens', () => {
    const split = estimateTokenSplit(101)
    assert.equal(split.inputTokens + split.outputTokens, 101)
    assert.equal(split.totalTokens, 101)
  }],
  ['cosineSimilarity ranks similar vectors higher', () => {
    assert.equal(cosineSimilarity([1, 0], [1, 0]), 1)
    assert.equal(cosineSimilarity([1, 0], [0, 1]), 0)
  }],
  ['serializeEmbedding and parseEmbedding round trip vectors', () => {
    const serialized = serializeEmbedding([0.1, 0.2, 0.3])
    assert.deepEqual(parseEmbedding(serialized), [0.1, 0.2, 0.3])
  }],
  ['getTokenQuota reports remaining daily allowance', () => {
    const quota = getTokenQuota(2312, 10000)
    assert.equal(quota.remaining, 7688)
    assert.equal(quota.percentUsed, 23)
    assert.equal(quota.isExceeded, false)
  }],
  ['getTokenQuota marks exceeded usage', () => {
    const quota = getTokenQuota(10000, 10000)
    assert.equal(quota.remaining, 0)
    assert.equal(quota.isExceeded, true)
  }]
]

export default tests
