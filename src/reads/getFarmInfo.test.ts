import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'

import { getFarmRewardInfo } from '.'

describe.concurrent('fetching farm info test', () => {
  it.concurrent('fetching farm reward', async () => {
    const result = await getFarmRewardInfo(publicClientSepolia, {
      farmAddress: TEST_CONFIG.farm as Address,
      account: testClientSepolia.account.address,
    })

    expect(!!result).toBe(true)
  })
})
