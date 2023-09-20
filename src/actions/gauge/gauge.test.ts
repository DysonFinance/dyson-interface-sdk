import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, sendTestTransaction, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'

import { TimeUnits } from '@/constants'
import ERC_20 from '@/constants/abis/erc20'
import { prepareGaugeBalance, prepareGaugeInfos } from '@/reads/getGaugeInfo'
import { getPairsConfig, preparePairLengths } from '@/reads/getPairsConfig'

import { prepareApproveToken } from '../tokens'
import { prepareGaugeApplyWithdraw, prepareGaugeDeposit, prepareGaugeWithdraw } from '.'
let sampleGauge: { gaugeAddress: Address; pairAddress: Address } | undefined = undefined

describe('test gauge', () => {
  beforeAll(async () => {
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
      network: 'sepolia',
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
      }),
      address: sampleGauge!.gaugeAddress,
      account: testClientSepolia.account,
      network: 'sepolia',
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
      network: 'sepolia',
    })

    expect(applyWithdrawResult.receipt.status).toBe('success')

    const gaugeBalanceAfterApplyWithdraw = await testClientSepolia.readContract({
      ...prepareGaugeBalance(testClientSepolia.account.address),
      address: sampleGauge!.gaugeAddress,
    })

    expect(gaugeBalance).toBe(gaugeBalanceAfterApplyWithdraw)

    await testClientSepolia.setNextBlockTimestamp({
      timestamp: (~~(Date.now() / (TimeUnits.Week * 1000)) + 1) * TimeUnits.Week,
    })

    await testClientSepolia.mine({
      blocks: 1,
    })

    const withdrawResult = await sendTestTransaction({
      ...prepareGaugeWithdraw(testClientSepolia),
      address: sampleGauge!.gaugeAddress,
      account: testClientSepolia.account,
      network: 'sepolia',
    })

    expect(withdrawResult.receipt.status).toBe('success')
  })
})
