import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'

import { prepareGaugeBalance, prepareGaugeInfos } from './getGaugeInfo'
import { getPairsConfig, preparePairLengths } from './getPairsConfig'

describe('fetching dyson gauge', () => {
  it('fetch one dyson gauge', async () => {
    const pairLength = await testClientSepolia.readContract({
      ...preparePairLengths(),
      address: TEST_CONFIG.pairFactory,
    })

    const swapConfigMap = await getPairsConfig(publicClientSepolia, {
      pairLength: Number(pairLength),
      factoryAddress: TEST_CONFIG.pairFactory as Address,
    })

    const pairAddressList = Object.keys(swapConfigMap)

    const gaugeInfo = await testClientSepolia.readContract({
      ...prepareGaugeInfos(pairAddressList[0] as Address),
      address: TEST_CONFIG.farm,
    })

    const gaugeBalance = await testClientSepolia.readContract({
      ...prepareGaugeBalance(testClientSepolia.account.address),
      address: gaugeInfo[4],
    })

    expect(gaugeBalance).toBeGreaterThanOrEqual(0)
  })
})
