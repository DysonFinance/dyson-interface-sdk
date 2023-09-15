import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'

import { getPairsConfig, preparePairLengths } from './getPairsConfig'

describe.concurrent('fetching pair configs test', () => {
  it.concurrent('fetching pair length', async () => {
    const pairLength = await testClientSepolia.readContract({
      ...preparePairLengths(),
      address: TEST_CONFIG.pairFactory,
    })

    expect(pairLength).toBeGreaterThan(0)
  })

  it.concurrent('fetching pair infos', async () => {
    const pairLength = await testClientSepolia.readContract({
      ...preparePairLengths(),
      address: TEST_CONFIG.pairFactory,
    })

    const swapConfigMap = await getPairsConfig(publicClientSepolia, {
      pairLength: Number(pairLength),
      factoryAddress: TEST_CONFIG.pairFactory as Address,
    })

    expect(Object.keys(swapConfigMap).length).toBe(Number(pairLength))
  })
})
