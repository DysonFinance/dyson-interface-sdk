import { accountManager } from '@tests/accounts'
import { TEST_CONFIG } from '@tests/config'
import { claimAgentAndToken, sendTestTransaction, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import ERC_20 from '@/constants/abis/erc20'

import { prepareApproveToken } from '../tokens/approveToken'
import { prepareDexSwap } from './dexSwap'

describe.only('dex test', async () => {
  const agent = await accountManager.getAccount()
  beforeAll(async () => {
    await claimAgentAndToken(agent)
    const approveResult = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: 10000000000000000000000000000n,
        spenderAddress: TEST_CONFIG.router as Address,
      }),
      address: TEST_CONFIG.tokens.USDC as Address,
      account: agent,
    })

    expect(approveResult.receipt.status).toBe('success')
  })
  afterAll(async () => {
    accountManager.release(agent)
  })

  it('swap usdc', async () => {
    const beforeInputBalance = await testClientSepolia.readContract({
      address: TEST_CONFIG.tokens.USDC as Address,
      abi: ERC_20,
      functionName: 'balanceOf',
      args: [agent.address],
    })

    const swapInput = 100000n

    const swapResult = await sendTestTransaction({
      ...prepareDexSwap(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.USDC as Address,
        tokenOut: TEST_CONFIG.dyson as Address,
        addressTo: agent.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: swapInput,
        minOutput: 0n,
      }),
      address: TEST_CONFIG.router,
      account: agent,
    })

    expect(swapResult.receipt.status).toBe('success')

    const afterInputBalance = await testClientSepolia.readContract({
      address: TEST_CONFIG.tokens.USDC as Address,
      abi: ERC_20,
      functionName: 'balanceOf',
      args: [agent.address],
    })

    expect(afterInputBalance + swapInput).toBe(beforeInputBalance)
  })

  it('swap eth', async () => {
    const beforeInputBalance = await testClientSepolia.getBalance({
      address: agent.address,
    })

    const swapInput = 100000n

    const swapResult = await sendTestTransaction({
      ...prepareDexSwap(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.WETH as Address,
        tokenOut: TEST_CONFIG.tokens.USDC as Address,
        addressTo: agent.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: swapInput,
        minOutput: 0n,
      }),
      address: TEST_CONFIG.router,
      account: agent,
    })

    expect(swapResult.receipt.status).toBe('success')

    const afterInputBalance = await testClientSepolia.getBalance({
      address: agent.address,
    })

    expect(afterInputBalance + swapInput).toBeLessThan(beforeInputBalance)
  })
})
