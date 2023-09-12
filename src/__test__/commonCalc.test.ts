import { describe, expect, it } from 'vitest'

import { sqrt } from '@/calculations/commonCalc'

describe('common calc test', () => {
  it('Sqrt normally', () => {
    expect(sqrt(4n)).eq(2n)
    expect(sqrt(16n)).eq(4n)
    expect(sqrt(9n)).eq(3n)
    expect(sqrt(144n)).eq(12n)
  })

  it('Sqrt others', () => {
    expect(sqrt(20n)).eq(4n)
    expect(sqrt(1000n)).eq(31n)
    expect(sqrt(1n)).eq(1n)
    expect(sqrt(2n)).eq(2n)
  })
})
