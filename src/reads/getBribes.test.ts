import { TEST_CONFIG } from '@tests/config'
import { sendTestTransaction, testClientSepolia } from '@tests/utils'
import { type Address } from 'viem/accounts'
import { beforeAll, describe, expect, it } from 'vitest'

import { prepareAddBribeReward, prepareApproveToken } from '@/actions'
import { TimeUnits } from '@/constants'

import { prepareTokenRewardOfWeek } from './getBribes'

describe.skip('bribe test', () => {
  beforeAll(async () => {
    const approveResult = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: 10000000000000000000000000000n,
        spenderAddress: TEST_CONFIG.bribeSample as Address,
      }),
      address: TEST_CONFIG.tokens.USDC as Address,
      account: testClientSepolia.account,
      network: 'sepolia',
    })

    expect(approveResult.receipt.status).toBe('success')
  })

  it('add and read bribe', async () => {
    const thisWeek = BigInt(~~(Date.now() / (TimeUnits.Week * 1000)))
    const nextWeek = thisWeek + 1n

    const bribeResult = await sendTestTransaction({
      ...prepareAddBribeReward(testClientSepolia, {
        token: TEST_CONFIG.tokens.USDC as Address,
        week: nextWeek,
        amount: 1000000n,
      }),
      address: TEST_CONFIG.bribeSample,
      account: testClientSepolia.account,
      network: 'sepolia',
    })

    expect(bribeResult.receipt.status).toBe('success')

    const tokenRewardOfWeek = await testClientSepolia.readContract({
      ...prepareTokenRewardOfWeek(TEST_CONFIG.tokens.USDC as Address, nextWeek),
      address: TEST_CONFIG.bribeSample,
    })

    console.log(tokenRewardOfWeek, 'tokenRewardOfWeek')
  })
})
