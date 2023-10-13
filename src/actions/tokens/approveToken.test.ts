import { TEST_CONFIG } from '@tests/config'
import { sendTestTransaction, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'

import ERC_20 from '@/constants/abis/erc20'

import { prepareApproveToken } from './approveToken'

describe('approve token test', () => {
  it.concurrent('approve usdc', async () => {
    const targetAllowance = 10000000000000000000000000000n
    const approveResult = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: targetAllowance,
        spenderAddress: TEST_CONFIG.router as Address,
      }),
      address: TEST_CONFIG.tokens.USDC as Address,
      account: testClientSepolia.account,
    })

    expect(approveResult.receipt.status).toBe('success')

    const allowance = await testClientSepolia.readContract({
      address: TEST_CONFIG.tokens.USDC as Address,
      abi: ERC_20,
      functionName: 'allowance',
      args: [testClientSepolia.account.address, TEST_CONFIG.router as Address],
    })

    expect(allowance).toBe(targetAllowance)
  })
})
