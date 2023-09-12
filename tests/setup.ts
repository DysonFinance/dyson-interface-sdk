import { beforeAll } from 'vitest'
import { testClientSepolia } from './utils'
import { TEST_JSON_RPC } from './config'

beforeAll(async () => {
  await testClientSepolia.reset({
    jsonRpcUrl: TEST_JSON_RPC,
  })
})
