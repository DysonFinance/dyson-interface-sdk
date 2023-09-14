import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, sendTestTransaction, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'

import { TimeUnits } from '@/constants'
import { getAccountNotes } from '@/reads/getAccountNotes'

import { prepareApproveToken } from '../allowance/approveToken'
import { prepareInvestmentDeposit } from './investmentDeposit'

describe('dual investment test', () => {
  it.concurrent('deposit token0', async () => {
    const { request: approveRequest } = await testClientSepolia.simulateContract({
      ...(await prepareApproveToken(testClientSepolia, {
        allowance: 10000000000000000000000000000n,
        spenderAddress: TEST_CONFIG.router as Address,
      })),
      address: TEST_CONFIG.tokens.USDC as Address,
      account: testClientSepolia.account,
    })

    const approveResult = await sendTestTransaction({
      ...approveRequest,
      network: 'sepolia',
    })

    expect(approveResult.receipt.status).toBe('success')

    const beforeAccountNotes = await getAccountNotes(publicClientSepolia, {
      account: testClientSepolia.account.address,
      noteCounts: [10],
      pairAddresses: [TEST_CONFIG.baseTokenPair.DYSN as Address],
    })

    console.log(
      Object.values(Object.values(beforeAccountNotes)[0]).map((v) => v.token1Amount),
    )

    const { request } = await testClientSepolia.simulateContract({
      ...(await prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.USDC as Address,
        tokenOut: TEST_CONFIG.dyson as Address,
        addressTo: testClientSepolia.account.address,
        inputBigNumber: 100000n,
        minOutput: 0n,
        duration: TimeUnits.Day,
      })),
      address: TEST_CONFIG.router,
      account: testClientSepolia.account,
    })
    const depositResult = await sendTestTransaction({
      ...request,
      network: 'sepolia',
    })

    expect(depositResult.receipt.status).toBe('success')

    const afterNotes = await getAccountNotes(publicClientSepolia, {
      account: testClientSepolia.account.address,
      noteCounts: [10],
      pairAddresses: [TEST_CONFIG.baseTokenPair.DYSN as Address],
    })

    console.log(Object.values(Object.values(afterNotes)[0]).map((v) => v.token1Amount))
  })
})
