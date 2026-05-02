import assert from 'node:assert/strict'
import { checkRateLimit, resetRateLimits } from '../src/lib/rate-limit.js'

const tests = [
  ['checkRateLimit blocks after configured limit', () => {
    resetRateLimits()

    assert.equal(checkRateLimit('user-1', { limit: 2, windowMs: 60_000 }).allowed, true)
    assert.equal(checkRateLimit('user-1', { limit: 2, windowMs: 60_000 }).allowed, true)
    assert.equal(checkRateLimit('user-1', { limit: 2, windowMs: 60_000 }).allowed, false)
  }],
  ['checkRateLimit tracks keys independently', () => {
    resetRateLimits()

    assert.equal(checkRateLimit('user-1', { limit: 1, windowMs: 60_000 }).allowed, true)
    assert.equal(checkRateLimit('user-1', { limit: 1, windowMs: 60_000 }).allowed, false)
    assert.equal(checkRateLimit('user-2', { limit: 1, windowMs: 60_000 }).allowed, true)
  }]
]

export default tests
