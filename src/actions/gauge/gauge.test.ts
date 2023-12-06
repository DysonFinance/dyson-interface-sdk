import { TEST_CONFIG } from '@tests/config'
import {
  claimAgentAndToken,
  publicClientSepolia,
  sendTestTransaction,
  testClientSepolia,
} from '@tests/utils'
import { type Address, maxUint256 } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'

import { TimeUnits } from '@/constants'
import Dyson from '@/constants/abis/Dyson'
import ERC_20 from '@/constants/abis/erc20'
import { prepareGaugeBalance, prepareGaugeInfos } from '@/reads/getGaugeInfo'
import { getPairsConfig, preparePairLengths } from '@/reads/getPairsConfig'
import { getVaultCount } from '@/reads/getStakingVault'

import { prepareApproveToken } from '../tokens'
import { getStakeGasFee, prepareStake } from './../sDysn/stake'
import { prepareGaugeApplyWithdraw, prepareGaugeDeposit, prepareGaugeWithdraw } from '.'
let sampleGauge: { gaugeAddress: Address; pairAddress: Address } | undefined = undefined

describe('test gauge', () => {
  beforeAll(async () => {
    await claimAgentAndToken(testClientSepolia.account)
    const usedAccount = testClientSepolia.account

    await sendTestTransaction({
      ...{
        abi: Dyson,
        address: TEST_CONFIG.dyson,
        functionName: 'approve',
        args: [TEST_CONFIG.sDyson, maxUint256],
        account: usedAccount,
      },
    })
    const lockDYSN = 1000000000000000000n

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

    await publicClientSepolia.readContract({
      ...getVaultCount(usedAccount.address),
      address: TEST_CONFIG.sDyson,
    })
    const pairLength = await testClientSepolia.readContract({
      ...preparePairLengths(),
      address: TEST_CONFIG.pairFactory,
    })

    const swapConfigMap = await getPairsConfig(publicClientSepolia, {
      pairLength: Number(pairLength),
      factoryAddress: TEST_CONFIG.pairFactory as Address,
    })

    const pairAddressList = Object.keys(swapConfigMap)

    const gaugeInfo = await testClientSepolia.readContract({
      ...prepareGaugeInfos(pairAddressList[0] as Address),
      address: TEST_CONFIG.farm,
    })

    sampleGauge = {
      gaugeAddress: gaugeInfo[4],
      pairAddress: pairAddressList[0] as Address,
    }

    const approveResult = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: 10000000000000000000000000000n,
        spenderAddress: sampleGauge.gaugeAddress as Address,
      }),
      address: TEST_CONFIG.sDyson as Address,
      account: testClientSepolia.account,
    })

    expect(approveResult.receipt.status).toBe('success')
  })

  it('A complete dyson gauge', async () => {
    const gaugeBalance = await testClientSepolia.readContract({
      ...prepareGaugeBalance(testClientSepolia.account.address),
      address: sampleGauge!.gaugeAddress,
    })

    expect(gaugeBalance).toBeGreaterThanOrEqual(0)

    const sDysnBalance = await testClientSepolia.readContract({
      address: TEST_CONFIG.sDyson as Address,
      abi: ERC_20,
      functionName: 'balanceOf',
      args: [testClientSepolia.account.address],
    })

    const targetAmount = 10000000n

    console.log(sDysnBalance, 'sDysnBalance')

    const depositResult = await sendTestTransaction({
      ...prepareGaugeDeposit(testClientSepolia, {
        tokenAmount: targetAmount,
        addressTo: testClientSepolia.account.address,
      }),
      address: TEST_CONFIG.router,
      account: testClientSepolia.account,
    })

    expect(depositResult.receipt.status).toBe('success')

    const gaugeBalanceAfterDeposit = await testClientSepolia.readContract({
      ...prepareGaugeBalance(testClientSepolia.account.address),
      address: sampleGauge!.gaugeAddress,
    })

    expect((gaugeBalance as bigint) + targetAmount).toBe(
      gaugeBalanceAfterDeposit as bigint,
    )

    const applyWithdrawResult = await sendTestTransaction({
      ...prepareGaugeApplyWithdraw(testClientSepolia, {
        tokenAmount: targetAmount,
      }),
      address: sampleGauge!.gaugeAddress,
      account: testClientSepolia.account,
    })

    expect(applyWithdrawResult.receipt.status).toBe('success')

    const gaugeBalanceAfterApplyWithdraw = await testClientSepolia.readContract({
      ...prepareGaugeBalance(testClientSepolia.account.address),
      address: sampleGauge!.gaugeAddress,
    })

    expect(gaugeBalance).toBe(gaugeBalanceAfterApplyWithdraw)

    await testClientSepolia.setNextBlockTimestamp({
      timestamp: BigInt((~~(Date.now() / (TimeUnits.Week * 1000)) + 1) * TimeUnits.Week),
    })

    await testClientSepolia.mine({
      blocks: 1,
    })

    const withdrawResult = await sendTestTransaction({
      ...prepareGaugeWithdraw(testClientSepolia),
      address: sampleGauge!.gaugeAddress,
      account: testClientSepolia.account,
    })

    expect(withdrawResult.receipt.status).toBe('success')
  })
})
