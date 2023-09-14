import { TEST_CONFIG } from '@tests/config'
import { testChildSepolia, testClientSepolia } from '@tests/utils'
import { expect, test } from 'vitest'

import { getAgencyWhois } from './getAgencyWhois'

test.concurrent('agent whois', async () => {
  const [parentAgent, childAgent] = await testClientSepolia.multicall({
    contracts: [
      {
        ...getAgencyWhois(testClientSepolia.account.address),
        address: TEST_CONFIG.agency,
      },
      {
        ...getAgencyWhois(testChildSepolia.account.address),
        address: TEST_CONFIG.agency,
      },
    ],
  })
  expect(parentAgent.result).not.toBe(0n)
  expect(childAgent.result).toBe(0n)
})
