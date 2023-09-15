import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, sendTestTransaction, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'

import { TimeUnits } from '@/constants'
import { getAccountNotes } from '@/reads/getAccountNotes'

import { prepareApproveToken } from '../tokens/approveToken'
import { prepareInvestmentDeposit } from './investmentDeposit'
import { prepareNoteWithdraw } from './noteWithdraw'

describe('dual investment test', () => {
  beforeAll(async () => {
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
  })

  it.skip('deposit usdc', async () => {
    const beforeAccountNotes = await getAccountNotes(publicClientSepolia, {
      account: testClientSepolia.account.address,
      noteCounts: [10],
      pairAddresses: [TEST_CONFIG.baseTokenPair.DYSN as Address],
    })

    const beforeAccountNotesLength = Object.values(Object.values(beforeAccountNotes)[0])
      .map((v) => v.token1Amount)
      .filter((bn) => bn > 0).length

    const { request } = await testClientSepolia.simulateContract({
      ...(await prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.USDC as Address,
        tokenOut: TEST_CONFIG.dyson as Address,
        addressTo: testClientSepolia.account.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
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

    const afterAccountNotesLength = Object.values(Object.values(afterNotes)[0])
      .map((v) => v.token1Amount)
      .filter((bn) => bn > 0).length

    expect(afterAccountNotesLength).toBe(beforeAccountNotesLength + 1)
  })

  it('withdraw pool', async () => {
    const { request } = await testClientSepolia.simulateContract({
      ...(await prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.USDC as Address,
        tokenOut: TEST_CONFIG.tokens.WBTC as Address,
        addressTo: testClientSepolia.account.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: 200000n,
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
      pairAddresses: [TEST_CONFIG.baseTokenPair.WBTC as Address],
    })

    const availableNoteList = Object.values(Object.values(afterNotes)[0]).filter(
      (n) => n.token0Amount + n.token1Amount > 0,
    )

    const latestNote = availableNoteList[availableNoteList.length - 1]

    await testClientSepolia.setNextBlockTimestamp({
      timestamp: latestNote.due,
    })

    await testClientSepolia.mine({
      blocks: 1,
    })

    const { request: withdrawRequest } = await testClientSepolia.simulateContract({
      ...(await prepareNoteWithdraw(testClientSepolia, {
        isNativePool: false,
        noteIndex: latestNote.noteIndex,
        pairAddress: TEST_CONFIG.baseTokenPair.WBTC as Address,
        addressTo: testClientSepolia.account.address,
        routerAddress: TEST_CONFIG.router,
      })),
      address: TEST_CONFIG.baseTokenPair.WBTC,
      account: testClientSepolia.account,
    })
    const withdrawResult = await sendTestTransaction({
      ...withdrawRequest,
      network: 'sepolia',
    })

    expect(withdrawResult.receipt.status).toBe('success')
  })

  it('withdraw ETH pool', async () => {
    const { request } = await testClientSepolia.simulateContract({
      ...(await prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.USDC as Address,
        tokenOut: TEST_CONFIG.tokens.WETH as Address,
        addressTo: testClientSepolia.account.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
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
      pairAddresses: [TEST_CONFIG.baseTokenPair.WETH as Address],
    })

    const availableNoteList = Object.values(Object.values(afterNotes)[0]).filter(
      (n) => n.token0Amount + n.token1Amount > 0,
    )
    const latestNote = availableNoteList[availableNoteList.length - 1]

    await testClientSepolia.setNextBlockTimestamp({
      timestamp: latestNote.due,
    })

    await testClientSepolia.mine({
      blocks: 1,
    })

    const { request: withdrawRequest } = await testClientSepolia.simulateContract({
      ...(await prepareNoteWithdraw(testClientSepolia, {
        isNativePool: true,
        noteIndex: latestNote.noteIndex,
        pairAddress: TEST_CONFIG.baseTokenPair.WETH as Address,
        addressTo: testClientSepolia.account.address,
        routerAddress: TEST_CONFIG.router,
      })),
      address: TEST_CONFIG.router as Address,
      account: testClientSepolia.account,
    })
    const withdrawResult = await sendTestTransaction({
      ...withdrawRequest,
      network: 'sepolia',
    })

    expect(withdrawResult.receipt.status).toBe('success')
  })

  it('withdraw ETH pool2', async () => {
    const { request } = await testClientSepolia.simulateContract({
      ...(await prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.WETH as Address,
        tokenOut: TEST_CONFIG.tokens.USDC as Address,
        addressTo: testClientSepolia.account.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: 15000000000000n,
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
      pairAddresses: [TEST_CONFIG.baseTokenPair.WETH as Address],
    })

    const availableNoteList = Object.values(Object.values(afterNotes)[0]).filter(
      (n) => n.token0Amount + n.token1Amount > 0,
    )

    const latestNote = availableNoteList[availableNoteList.length - 1]

    await testClientSepolia.setNextBlockTimestamp({
      timestamp: latestNote.due,
    })

    await testClientSepolia.mine({
      blocks: 1,
    })

    const { request: withdrawRequest } = await testClientSepolia.simulateContract({
      ...(await prepareNoteWithdraw(testClientSepolia, {
        isNativePool: true,
        noteIndex: latestNote.noteIndex,
        pairAddress: TEST_CONFIG.baseTokenPair.WETH as Address,
        addressTo: testClientSepolia.account.address,
        routerAddress: TEST_CONFIG.router,
      })),
      address: TEST_CONFIG.router as Address,
      account: testClientSepolia.account,
    })
    const withdrawResult = await sendTestTransaction({
      ...withdrawRequest,
      network: 'sepolia',
    })

    expect(withdrawResult.receipt.status).toBe('success')
  })
})
