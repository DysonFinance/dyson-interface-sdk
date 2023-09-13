import { TEST_CONFIG } from '@tests/config'
import { testClientSepolia } from '@tests/utils'
import { expect, test } from 'vitest'

import { prepareAgencyInfo } from './getAgencyInfo'

test.concurrent('agent info', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, gen] = await testClientSepolia.readContract({
    ...prepareAgencyInfo(testClientSepolia.account.address),
    address: TEST_CONFIG.agency,
  })

  expect(gen).toBe(1n)
})
