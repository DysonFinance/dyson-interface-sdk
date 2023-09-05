import { describe, expect, it } from 'vitest'

import { divu, exp_2, mulu } from '../calculations/abdkMath64x64'

const fixed = 2n ** 64n

describe('abdkMath64x64', () => {
  it('divu', () => {
    expect(divu(16n * fixed, 8n * fixed)).toBe(2n * fixed)
  })
  it('exp_2', () => {
    expect(exp_2(3n * fixed)).toBe(8n * fixed)
  })
  it('mulu', () => {
    expect(mulu(7n * fixed, 8n * fixed)).toBe(56n * fixed)
  })
  it('todo', () => {
    expect(true).toBe(true)
  })
})
