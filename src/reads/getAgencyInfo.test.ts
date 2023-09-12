import { expect, test } from 'vitest';
import { testClientSepolia } from '../../tests/utils';
import { prepareAgencyInfo } from './getAgencyInfo';
import { TEST_CONFIG } from '../../tests/config';

test.concurrent('agent info', async () => {
  const [_, gen] = await testClientSepolia.readContract({
    ...prepareAgencyInfo(testClientSepolia.account.address),
    address: TEST_CONFIG.agency,
  })

  expect(gen).toBe(1n)
})
