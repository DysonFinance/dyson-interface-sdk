import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, sendTestTransaction, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'

import { prepareInvestmentDeposit } from '@/actions/dualInvestment/investmentDeposit'
import { TimeUnits } from '@/constants'
import { getAccountNotes } from '@/reads/getAccountNotes'

import { getDysonPairInfos } from './getDysonPairInfos'
import { getPairsConfig, preparePairLengths } from './getPairsConfig'

describe('fetching account notes test', () => {
  it.concurrent('fetch notes', async () => {
    const pairLength = await testClientSepolia.readContract({
      ...preparePairLengths(),
      address: TEST_CONFIG.pairFactory,
    })

    const swapConfigMap = await getPairsConfig(publicClientSepolia, {
      pairLength: Number(pairLength),
      factoryAddress: TEST_CONFIG.pairFactory as Address,
    })

    const pairResult = await getDysonPairInfos(publicClientSepolia, {
      account: testClientSepolia.account.address,
      farmAddress: TEST_CONFIG.farm as Address,
      pairConfigs: Object.values(swapConfigMap),
    })

    expect(pairResult.dysonPairInfoList.length).toBe(Number(pairLength))

    const samplePair = pairResult.dysonPairInfoList[0]

    const beforeAccountNotes = await getAccountNotes(publicClientSepolia, {
      account: testClientSepolia.account.address,
      noteCounts: [Number(samplePair.noteCount)],
      pairAddresses: [samplePair.pairAddress as Address],
    })

    const { request } = await testClientSepolia.simulateContract({
      ...(await prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: samplePair.token0Address as Address,
        tokenOut: samplePair.token1Address as Address,
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
      noteCounts: [Number(samplePair.noteCount) + 1],
      pairAddresses: [samplePair.pairAddress as Address],
    })

    expect(Object.values(afterNotes[samplePair.pairAddress]).length).toBe(
      Object.values(beforeAccountNotes[samplePair.pairAddress]).length + 1,
    )
  })
})
