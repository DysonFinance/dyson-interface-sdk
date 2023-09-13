import { beforeAll } from 'vitest'

import { TEST_JSON_RPC } from './config'
import { testClientSepolia } from './utils'

beforeAll(async () => {
  await testClientSepolia.reset({
    jsonRpcUrl: TEST_JSON_RPC,
  })
})
