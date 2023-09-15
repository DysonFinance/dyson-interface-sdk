import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, testClientSepolia } from '@tests/utils'
import { Address } from 'viem'
import { describe, expect, it } from 'vitest'

import { getPairAllowanceMap, prepareTokenAllowance } from './getTokenAllowance'

describe.concurrent('fetching token allowance', () => {
  // beforeAll(async () => {
  //   const approveResult = await sendTestTransaction({
  //     ...prepareApproveToken(testClientSepolia, {
  //       allowance: 10000000000000000000000000000n,
  //       spenderAddress: TEST_CONFIG.router as Address,
  //     }),
  //     address: TEST_CONFIG.tokens.USDC as Address,
  //     account: testClientSepolia.account,
  //     network: 'sepolia',
  //   })

  //   expect(approveResult.receipt.status).toBe('success')
  // })

  it.concurrent('fetching single token allowance', async () => {
    const allowance = await testClientSepolia.readContract({
      ...prepareTokenAllowance(
        testClientSepolia.account.address,
        TEST_CONFIG.router as Address,
      ),
      address: TEST_CONFIG.tokens.USDC as Address,
    })
    expect(allowance).toBeGreaterThanOrEqual(0)
  })
  it.concurrent('fetching multiple token allowance', async () => {
    const tokenAllowanceMap = await getPairAllowanceMap(publicClientSepolia, {
      tokenAllowanceMap: {
        tempKey: {
          tokenAddress: TEST_CONFIG.tokens.USDC as Address,
          spenderAddress: TEST_CONFIG.router as Address,
        },
        tempKey2: {
          tokenAddress: TEST_CONFIG.tokens.WBTC as Address,
          spenderAddress: TEST_CONFIG.router as Address,
        },
      },
      account: testClientSepolia.account.address,
    })

    expect(Object.values(tokenAllowanceMap).length).toBe(2)
  })
})
