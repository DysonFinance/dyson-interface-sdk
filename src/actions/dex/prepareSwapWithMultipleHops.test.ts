import { accountManager } from '@tests/accounts'
import { TEST_CONFIG } from '@tests/config'
import { claimAgentAndToken, sendTestTransaction, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import ERC_20 from '@/constants/abis/erc20'

import { prepareApproveToken } from '../tokens/approveToken'
import { prepareSwapWithMultipleHops } from './prepareSwapWithMultipleHops'

describe.only('multiple hops test', async () => {
  const agent = await accountManager.getAccount()
  beforeAll(async () => {
    await claimAgentAndToken(agent)
    const approveResult = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: 10000000000000000000000000000n,
        spenderAddress: TEST_CONFIG.router as Address,
      }),
      address: TEST_CONFIG.dyson as Address,
      account: agent,
    })

    expect(approveResult.receipt.status).toBe('success')
  })
  afterAll(async () => {
    accountManager.release(agent)
  })

  it('swap DYSN to ETH', async () => {
    const beforeInputBalance = await testClientSepolia.readContract({
      address: TEST_CONFIG.dyson as Address,
      abi: ERC_20,
      functionName: 'balanceOf',
      args: [agent.address],
    })

    const beforeEthBalance = await testClientSepolia.getBalance({
      address: agent.address,
    })

    const swapInput = 4000_000000_000000_000000n

    const swapResult = await sendTestTransaction({
      ...prepareSwapWithMultipleHops({
        swapPath: [
          TEST_CONFIG.dyson as Address,
          TEST_CONFIG.tokens.USDC as Address,
          TEST_CONFIG.tokens.WETH as Address,
        ],
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
      address: TEST_CONFIG.dyson as Address,
      abi: ERC_20,
      functionName: 'balanceOf',
      args: [agent.address],
    })

    const afterEthBalance = await testClientSepolia.getBalance({
      address: agent.address,
    })

    expect(afterInputBalance).toBeLessThan(beforeInputBalance)
    expect(afterEthBalance).toBeGreaterThan(beforeEthBalance)
  })

  it('swap ETH to DYSN', async () => {
    const beforeDysnBalance = await testClientSepolia.readContract({
      address: TEST_CONFIG.dyson as Address,
      abi: ERC_20,
      functionName: 'balanceOf',
      args: [agent.address],
    })

    const beforeEthBalance = await testClientSepolia.getBalance({
      address: agent.address,
    })

    const swapInput = 10000_000000_000000n

    const swapResult = await sendTestTransaction({
      ...prepareSwapWithMultipleHops({
        swapPath: [
          TEST_CONFIG.tokens.WETH as Address,
          TEST_CONFIG.tokens.USDC as Address,
          TEST_CONFIG.dyson as Address,
        ],
        addressTo: agent.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: swapInput,
        minOutput: 0n,
      }),
      address: TEST_CONFIG.router,
      account: agent,
    })

    expect(swapResult.receipt.status).toBe('success')

    const afterDysnBalance = await testClientSepolia.readContract({
      address: TEST_CONFIG.dyson as Address,
      abi: ERC_20,
      functionName: 'balanceOf',
      args: [agent.address],
    })

    const afterEthBalance = await testClientSepolia.getBalance({
      address: agent.address,
    })

    expect(afterEthBalance + swapInput).toBeLessThan(beforeEthBalance)
    expect(afterDysnBalance).toBeGreaterThan(beforeDysnBalance)
  })
})
