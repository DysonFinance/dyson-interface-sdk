import { TEST_CONFIG } from '@tests/config'
import { claimAgentAndToken, sendTestTransaction, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'

import { TimeUnits } from '@/constants'

import { prepareInvestmentDeposit } from '../dualInvestment'
import { prepareApproveToken } from '../tokens/approveToken'
import { prepareSpSwap } from '.'

describe.only('swap sp test', () => {
  const usedAccount = testClientSepolia.account
  beforeAll(async () => {
    await claimAgentAndToken(usedAccount)
    const approveResult = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: 10000000000000000000000000000n,
        spenderAddress: TEST_CONFIG.router as Address,
      }),
      address: TEST_CONFIG.tokens.USDC as Address,
      account: testClientSepolia.account,
    })

    expect(approveResult.receipt.status).toBe('success')
  })

  it('deposit usdc and swap SP', async () => {
    const depositResult = await sendTestTransaction({
      ...prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.USDC as Address,
        tokenOut: TEST_CONFIG.dyson as Address,
        addressTo: testClientSepolia.account.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: 100000n,
        minOutput: 0n,
        duration: TimeUnits.Day,
      }),
      address: TEST_CONFIG.router,
      account: testClientSepolia.account,
    })

    expect(depositResult.receipt.status).toBe('success')

    const swapSpResult = await sendTestTransaction({
      ...prepareSpSwap(testClientSepolia, testClientSepolia.account.address),
      address: TEST_CONFIG.farm as Address,
      account: testClientSepolia.account,
    })

    expect(swapSpResult.receipt.status).toBe('success')
  })
})
