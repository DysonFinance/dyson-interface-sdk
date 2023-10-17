import { describe } from 'node:test'

import { TEST_CONFIG } from '@tests/config'
import { claimAgentAndToken, testClientSepolia } from '@tests/utils'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import { beforeAll, expect, test } from 'vitest'

import { getAgencyWhois } from './getAgencyWhois'
describe('read/getAgencyWhois', () => {
  const usedAgent = testClientSepolia.account

  beforeAll(async () => {
    await claimAgentAndToken(usedAgent)
  })

  test.concurrent('agent whois', async () => {
    const [parentAgent, childAgent] = await testClientSepolia.multicall({
      contracts: [
        {
          ...getAgencyWhois(usedAgent.address),
          address: TEST_CONFIG.agency,
        },
        {
          ...getAgencyWhois(privateKeyToAddress(generatePrivateKey())),
          address: TEST_CONFIG.agency,
        },
      ],
    })
    expect(parentAgent.result).not.toBe(0n)
    expect(childAgent.result).toBe(0n)
  })
})
