import { describe } from 'node:test'

import { TEST_CONFIG } from '@tests/config'
import { claimAgentAndToken, testClientSepolia } from '@tests/utils'
import { expect, test } from 'vitest'

import { getAgencyReferrerGenInfo } from './getAgencyInfo'

describe('read/getAgencyReferrerGenInfo', () => {
  test.only('agent info', async () => {
    await claimAgentAndToken(testClientSepolia.account)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, gen] = await testClientSepolia.readContract({
      ...getAgencyReferrerGenInfo(testClientSepolia.account.address),
      address: TEST_CONFIG.agency,
    })

    expect(gen).toBe(1n)
  })
})
