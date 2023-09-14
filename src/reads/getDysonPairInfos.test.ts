import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'

import { getDysonPairInfos } from './getDysonPairInfos'
import { getPairsConfig, preparePairLengths } from './getPairsConfig'

describe('fetching dyson pair test', () => {
  it.concurrent('fetch dyson pair', async () => {
    const pairLength = await testClientSepolia.readContract({
      ...preparePairLengths(),
      address: TEST_CONFIG.pairFactory,
    })

    const swapConfigMap = await getPairsConfig(publicClientSepolia, {
      pairLength: Number(pairLength),
      factoryAddress: TEST_CONFIG.pairFactory as Address,
    })

    const pairResult = await getDysonPairInfos(publicClientSepolia, {
      account: testClientSepolia.account.address,
      farmAddress: TEST_CONFIG.farm as Address,
      pairConfigs: Object.values(swapConfigMap),
    })

    expect(pairResult.dysonPairInfoList.length).toBe(Number(pairLength))
  })
})
