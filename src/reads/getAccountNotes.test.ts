import { accountManager } from '@tests/accounts'
import { TEST_CONFIG } from '@tests/config'
import {
  approveToken,
  claimAgentAndToken,
  publicClientSepolia,
  sendTestTransaction,
  testClientSepolia,
} from '@tests/utils'
import type { Address } from 'viem'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { prepareInvestmentDeposit } from '@/actions/dualInvestment/investmentDeposit'
import { TimeUnits } from '@/constants'
import { getAccountNotes } from '@/reads/getAccountNotes'

import { getDysonPairInfos } from './getDysonPairInfos'
import { getPairsConfig, preparePairLengths } from './getPairsConfig'

describe.only('fetching account notes test', async () => {
  const usedAccount = await accountManager.getAccount()
  beforeAll(async () => {
    await claimAgentAndToken(usedAccount)
  })
  afterAll(async () => {
    accountManager.release(usedAccount)
  })
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
      account: usedAccount.address,
      farmAddress: TEST_CONFIG.farm as Address,
      pairConfigs: Object.values(swapConfigMap),
    })

    expect(pairResult.dysonPairInfoList.length).toBe(Number(pairLength))

    const samplePair = pairResult.dysonPairInfoList[0]

    const beforeAccountNotes = await getAccountNotes(publicClientSepolia, {
      account: usedAccount.address,
      noteCounts: [Number(samplePair.noteCount)],
      pairAddresses: [samplePair.pairAddress as Address],
    })

    await approveToken(
      usedAccount,
      samplePair.token0Address as Address,
      TEST_CONFIG.router,
    )

    await approveToken(
      usedAccount,
      samplePair.token1Address as Address,
      TEST_CONFIG.router,
    )

    const depositResult = await sendTestTransaction({
      ...prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: samplePair.token0Address as Address,
        tokenOut: samplePair.token1Address as Address,
        addressTo: usedAccount.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: 100000n,
        minOutput: 0n,
        duration: TimeUnits.Day,
      }),
      address: TEST_CONFIG.router,
      account: usedAccount,
    })

    expect(depositResult.receipt.status).toBe('success')

    const afterNotes = await getAccountNotes(publicClientSepolia, {
      account: usedAccount.address,
      noteCounts: [Number(samplePair.noteCount) + 1],
      pairAddresses: [samplePair.pairAddress as Address],
    })

    expect(Object.values(afterNotes[samplePair.pairAddress]).length).toBe(
      Object.values(beforeAccountNotes[samplePair.pairAddress] ?? {}).length + 1,
    )
  })
})
