import { accountManager } from '@tests/accounts'
import { TEST_CONFIG } from '@tests/config'
import {
  claimAgentAndToken,
  createMockingClient,
  publicClientSepolia,
  sendTestTransaction,
  testClientSepolia,
} from '@tests/utils'
import { type Address, encodeFunctionData } from 'viem'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { TimeUnits } from '@/constants'
import Dyson from '@/constants/abis/Dyson'
import ROUTER_ABI from '@/constants/abis/DysonSwapRouter'
import { getPairOperatorApprovals } from '@/reads'
import { getAccountNotes } from '@/reads/getAccountNotes'

import { prepareApproveToken } from '../tokens/approveToken'
import { prepareInvestmentDeposit, prepareSelfPermit } from './investmentDeposit'
import { prepareNoteWithdraw, prepareSetApprovalForAllWithSig } from './noteWithdraw'

describe('dual investment test', async () => {
  const usedAccount = await accountManager.getAccount()
  beforeAll(async () => {
    await claimAgentAndToken(usedAccount)
    const approveResult = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: 10000000000000000000000000000n,
        spenderAddress: TEST_CONFIG.router as Address,
      }),
      address: TEST_CONFIG.tokens.USDC as Address,
      account: usedAccount,
    })

    expect(approveResult.receipt.status).toBe('success')
  })
  afterAll(async () => {
    accountManager.release(usedAccount)
  })

  it.only('self permit token from router', async () => {
    const testClient = createMockingClient(usedAccount)
    const nonce = await testClient.readContract({
      abi: Dyson,
      functionName: 'nonces',
      args: [usedAccount.address],
      address: TEST_CONFIG.dyson,
    })

    await sendTestTransaction({
      ...(await prepareSelfPermit(testClient, {
        amount: 10000000000n,
        spender: TEST_CONFIG.router as Address,
        tokenContract: TEST_CONFIG.dyson as Address,
        owner: usedAccount.address,
        deadline: Math.floor(Date.now() / 1000) + TimeUnits.Day,
        nonce: nonce,
        chainId: 11155111,
      })),
      address: TEST_CONFIG.router,
      account: usedAccount,
    })

    const [nonce2, allowance] = await testClient.multicall({
      allowFailure: false,
      contracts: [
        {
          abi: Dyson,
          functionName: 'nonces',
          args: [usedAccount.address],
          address: TEST_CONFIG.dyson,
        },
        {
          abi: Dyson,
          functionName: 'allowance',
          args: [usedAccount.address, TEST_CONFIG.router],
          address: TEST_CONFIG.dyson,
        },
      ],
    })

    expect(nonce2).toBe(nonce + 1n)
    expect(allowance).toBe(10000000000n)
  })

  it.only('deposit usdc', async () => {
    const beforeAccountNotes = await getAccountNotes(publicClientSepolia, {
      account: usedAccount.address,
      noteCounts: [10],
      pairAddresses: [TEST_CONFIG.baseTokenPair.DYSN as Address],
    })

    const beforeAccountNotesLength = Object.values(Object.values(beforeAccountNotes)[0])
      .map((v) => v.token1Amount)
      .filter((bn) => bn > 0).length

    const depositResult = await sendTestTransaction({
      ...prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.USDC as Address,
        tokenOut: TEST_CONFIG.dyson as Address,
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
      noteCounts: [10],
      pairAddresses: [TEST_CONFIG.baseTokenPair.DYSN as Address],
    })

    const afterAccountNotesLength = Object.values(Object.values(afterNotes)[0])
      .map((v) => v.token1Amount)
      .filter((bn) => bn > 0).length

    expect(afterAccountNotesLength).toBe(beforeAccountNotesLength + 1)
  })

  it.only('withdraw pool', async () => {
    const depositResult = await sendTestTransaction({
      ...prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.USDC as Address,
        tokenOut: TEST_CONFIG.tokens.WBTC as Address,
        addressTo: usedAccount.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: 200000n,
        minOutput: 0n,
        duration: TimeUnits.Day,
      }),
      address: TEST_CONFIG.router,
      account: usedAccount,
    })

    expect(depositResult.receipt.status).toBe('success')

    const afterNotes = await getAccountNotes(publicClientSepolia, {
      account: usedAccount.address,
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

    const withdrawResult = await sendTestTransaction({
      ...(await prepareNoteWithdraw(testClientSepolia, {
        isNativePool: false,
        noteIndex: latestNote.noteIndex,
        pairAddress: TEST_CONFIG.baseTokenPair.WBTC as Address,
        addressTo: usedAccount.address,
      })),
      address: TEST_CONFIG.baseTokenPair.WBTC as Address,
      account: usedAccount,
    })

    expect(withdrawResult.receipt.status).toBe('success')
  })

  it.only('withdraw ETH pool', async () => {
    const depositResult = await sendTestTransaction({
      ...prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.USDC as Address,
        tokenOut: TEST_CONFIG.tokens.WETH as Address,
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
      noteCounts: [10],
      pairAddresses: [TEST_CONFIG.baseTokenPair.WETH as Address],
    })

    const availableNoteList = Object.values(Object.values(afterNotes)[0]).filter(
      (n) => n.token0Amount + n.token1Amount > 0,
    )
    const latestNote = availableNoteList[availableNoteList.length - 1]

    const preparedConfig = await prepareSetApprovalForAllWithSig(testClientSepolia, {
      owner: usedAccount.address,
      approved: true,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day),
      nonce: 0n,
      pairAddress: TEST_CONFIG.baseTokenPair.WETH!,
      operator: TEST_CONFIG.router,
    })
    // const approvalOperatorStatus = await sendTestTransaction({
    //   account: usedAccount,
    //   address: TEST_CONFIG.router,
    //   ...preparedConfig,
    // })

    const callDataApprove = encodeFunctionData({
      ...preparedConfig,
    })

    // expect(approvalOperatorStatus.receipt.status).toBe('success')
    await testClientSepolia.setNextBlockTimestamp({
      timestamp: latestNote.due,
    })

    await testClientSepolia.mine({
      blocks: 1,
    })

    const callDataWithdraw = encodeFunctionData({
      ...prepareNoteWithdraw(testClientSepolia, {
        isNativePool: true,
        noteIndex: latestNote.noteIndex,
        pairAddress: TEST_CONFIG.baseTokenPair.WETH as Address,
        addressTo: usedAccount.address,
      }),
    })

    // const withdrawResult = await sendTestTransaction({
    //   ...prepareNoteWithdraw(testClientSepolia, {
    //     isNativePool: true,
    //     noteIndex: latestNote.noteIndex,
    //     pairAddress: TEST_CONFIG.baseTokenPair.WETH as Address,
    //     addressTo: usedAccount.address,
    //   }),
    //   address: TEST_CONFIG.router as Address,
    //   account: usedAccount,
    // })

    const withdrawResult = await sendTestTransaction({
      abi: ROUTER_ABI,
      functionName: 'multicall',
      args: [[callDataApprove, callDataWithdraw]],
      address: TEST_CONFIG.router as Address,
      account: usedAccount,
    })

    expect(withdrawResult.receipt.status).toBe('success')

    const operatorResult = await testClientSepolia.readContract({
      ...getPairOperatorApprovals(usedAccount.address, TEST_CONFIG.router as Address),
      address: TEST_CONFIG.baseTokenPair.WETH as Address,
    })

    expect(operatorResult).toBe(true)
  })

  it.only('withdraw ETH pool2', async () => {
    const depositResult = await sendTestTransaction({
      ...prepareInvestmentDeposit(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.WETH as Address,
        tokenOut: TEST_CONFIG.tokens.USDC as Address,
        addressTo: usedAccount.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: 15000000000000n,
        minOutput: 0n,
        duration: TimeUnits.Day,
      }),
      address: TEST_CONFIG.router,
      account: usedAccount,
    })

    expect(depositResult.receipt.status).toBe('success')

    const afterNotes = await getAccountNotes(publicClientSepolia, {
      account: usedAccount.address,
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
    // const preparedConfig = await prepareSetApprovalForAllWithSig(testClientSepolia, {
    //   owner: usedAccount.address,
    //   approved: true,
    //   deadline: BigInt(Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day),
    //   nonce: 1n,
    //   pairAddress: TEST_CONFIG.baseTokenPair.WETH!,
    //   operator: TEST_CONFIG.router,
    // })

    // const approvalOperatorStatus = await sendTestTransaction({
    //   account: usedAccount,
    //   address: TEST_CONFIG.router,
    //   ...preparedConfig,
    // })
    // expect(approvalOperatorStatus.receipt.status).toBe('success')
    const withdrawResult = await sendTestTransaction({
      ...(await prepareNoteWithdraw(testClientSepolia, {
        isNativePool: true,
        noteIndex: latestNote.noteIndex,
        pairAddress: TEST_CONFIG.baseTokenPair.WETH as Address,
        addressTo: usedAccount.address,
      })),
      address: TEST_CONFIG.router as Address,
      account: usedAccount,
    })

    expect(withdrawResult.receipt.status).toBe('success')
  })
})
