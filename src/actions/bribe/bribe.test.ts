import { accountManager } from '@tests/accounts'
import { TEST_CONFIG } from '@tests/config'
import { claimAgentAndToken, sendTestTransaction, testClientSepolia } from '@tests/utils'
import { maxUint256 } from 'viem'
import { type Address } from 'viem/accounts'
import { multicall } from 'viem/actions'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  getStakeGasFee,
  prepareAddBribeReward,
  prepareApproveToken,
  prepareClaimBribeMatrix,
  prepareStake,
} from '@/actions'
import { TimeUnits } from '@/constants'
import Dyson from '@/constants/abis/Dyson'
import { bribeGaugeContract, tokenRewardOfWeekContract } from '@/reads/getBribes'

import { prepareGaugeDeposit } from '../gauge'

describe('bribe test', async () => {
  const usedAccount = await accountManager.getAccount()
  beforeAll(async () => {
    try {
      await claimAgentAndToken(usedAccount)
    } catch (_) {
      /* empty */
    }

    await sendTestTransaction({
      ...{
        abi: Dyson,
        address: TEST_CONFIG.dyson,
        functionName: 'approve',
        args: [TEST_CONFIG.sDyson, maxUint256],
        account: usedAccount,
      },
    })

    const dysnBalance = await testClientSepolia.readContract({
      address: TEST_CONFIG.tokens.USDC as Address,
      abi: Dyson,
      functionName: 'balanceOf',
      args: [usedAccount.address],
    })

    const lockDYSN =
      1000000000000000000n > dysnBalance ? dysnBalance / 2n : 1000000000000000000n

    await sendTestTransaction({
      ...{
        ...prepareStake({
          to: usedAccount.address,
          tokenAmount: lockDYSN,
          stakeTime: 30 * TimeUnits.Day,
        }),
        address: TEST_CONFIG.sDyson,
        gas: await getStakeGasFee({
          client: testClientSepolia,
          contractAddress: TEST_CONFIG.sDyson,
          userAddress: usedAccount.address,
          to: usedAccount.address,
          tokenAmount: lockDYSN,
          stakeTime: 30 * TimeUnits.Day,
        }),
        account: usedAccount,
      },
    })

    const approveResult = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: maxUint256,
        spenderAddress: TEST_CONFIG.bribeSample as Address,
      }),
      address: TEST_CONFIG.tokens.USDC as Address,
      account: usedAccount,
    })

    expect(approveResult.receipt.status).toBe('success')

    const approveResult2 = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: maxUint256,
        spenderAddress: TEST_CONFIG.bribeSample as Address,
      }),
      address: TEST_CONFIG.dyson as Address,
      account: usedAccount,
    })

    expect(approveResult2.receipt.status).toBe('success')
  })

  afterAll(async () => {
    accountManager.release(usedAccount)
  })

  it('add and read bribe and claim', async () => {
    const thisWeek = BigInt(~~(Date.now() / (TimeUnits.Week * 1000)))
    const nextWeek = thisWeek + 1n
    const totalSampleReward = 1000000000n

    const bribeResult = await sendTestTransaction({
      ...prepareAddBribeReward(testClientSepolia, {
        token: TEST_CONFIG.tokens.USDC as Address,
        week: thisWeek,
        amount: totalSampleReward,
      }),
      address: TEST_CONFIG.bribeSample,
      account: usedAccount,
    })

    await sendTestTransaction({
      ...prepareAddBribeReward(testClientSepolia, {
        token: TEST_CONFIG.dyson as Address,
        week: thisWeek,
        amount: totalSampleReward * 10n,
      }),
      address: TEST_CONFIG.bribeSample,
      account: usedAccount,
    })

    expect(bribeResult.receipt.status).toBe('success')

    const [tokenReward, gaugeAddress] = (await multicall(testClientSepolia, {
      allowFailure: false,
      contracts: [
        {
          ...tokenRewardOfWeekContract(
            TEST_CONFIG.bribeSample as Address,
            TEST_CONFIG.tokens.USDC as Address,
            thisWeek,
          ),
        },
        bribeGaugeContract(TEST_CONFIG.bribeSample),
      ],
    })) as [bigint, Address]

    expect(tokenReward).toBe(totalSampleReward)

    const approveSdysnResult = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: 10000000000000000000000000000n,
        spenderAddress: gaugeAddress as Address,
      }),
      address: TEST_CONFIG.sDyson as Address,
      account: usedAccount,
    })

    expect(approveSdysnResult.receipt.status).toBe('success')

    const sdysnBalance = await testClientSepolia.readContract({
      address: TEST_CONFIG.sDyson as Address,
      abi: Dyson,
      functionName: 'balanceOf',
      args: [usedAccount.address],
    })

    const depositResult = await sendTestTransaction({
      ...prepareGaugeDeposit(testClientSepolia, {
        tokenAmount: sdysnBalance / 2n,
        addressTo: usedAccount.address,
      }),
      address: gaugeAddress,
      account: usedAccount,
    })

    expect(depositResult.receipt.status).toBe('success')

    await testClientSepolia.setNextBlockTimestamp({
      timestamp: nextWeek * BigInt(TimeUnits.Week) + 1n,
    })

    await testClientSepolia.mine({
      blocks: 1,
    })

    const claimResult = await sendTestTransaction({
      ...prepareClaimBribeMatrix(testClientSepolia, {
        tokenList: [TEST_CONFIG.tokens.USDC as Address, TEST_CONFIG.dyson as Address],
        weekMatrix: [[thisWeek], [thisWeek]],
      }),
      address: TEST_CONFIG.bribeSample,
      account: usedAccount,
    })

    expect(claimResult.result[0]).toBeGreaterThan(0n)
    expect(claimResult.result[0]).toBeLessThanOrEqual(totalSampleReward)

    expect(claimResult.result[1]).toBeGreaterThan(0n)
    expect(claimResult.result[1]).toBeLessThanOrEqual(totalSampleReward * 10n)
  })
})
