import { testChildSepolia, testClientSepolia } from '@tests/utils';
import { expect, test } from 'vitest';
import { prepareAgencyWhois } from './getAgencyWhois';
import { TEST_CONFIG } from '@tests/config';

test.concurrent('agent whois', async () => {
  const [parentAgent, childAgent] = await testClientSepolia.multicall({
    contracts: [
      {
        ...prepareAgencyWhois(testClientSepolia.account.address),
        address: TEST_CONFIG.agency,
      },
      {
        ...prepareAgencyWhois(testChildSepolia.account.address),
        address: TEST_CONFIG.agency,
      },
    ],
  })
  expect(parentAgent.result).not.toBe(0n)
  expect(childAgent.result).toBe(0n)
})