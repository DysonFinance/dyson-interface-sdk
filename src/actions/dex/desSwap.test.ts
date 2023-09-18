import { TEST_CONFIG } from '@tests/config'
import { sendTestTransaction, testClientSepolia } from '@tests/utils'
import type { Address } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'

import ERC_20 from '@/constants/abis/erc20'

import { prepareApproveToken } from '../tokens/approveToken'
import { prepareDexSwap } from './dexSwap'

describe('dex test', () => {
  beforeAll(async () => {
    const approveResult = await sendTestTransaction({
      ...prepareApproveToken(testClientSepolia, {
        allowance: 10000000000000000000000000000n,
        spenderAddress: TEST_CONFIG.router as Address,
      }),
      address: TEST_CONFIG.tokens.USDC as Address,
      account: testClientSepolia.account,
      network: 'sepolia',
    })

    expect(approveResult.receipt.status).toBe('success')
  })

  it('swap usdc', async () => {
    const beforeInputBalance = await testClientSepolia.readContract({
      address: TEST_CONFIG.tokens.USDC as Address,
      abi: ERC_20,
      functionName: 'balanceOf',
      args: [testClientSepolia.account.address],
    })

    const swapInput = 100000n

    const swapResult = await sendTestTransaction({
      ...prepareDexSwap(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.USDC as Address,
        tokenOut: TEST_CONFIG.dyson as Address,
        addressTo: testClientSepolia.account.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: swapInput,
        minOutput: 0n,
      }),
      address: TEST_CONFIG.router,
      account: testClientSepolia.account,
      network: 'sepolia',
    })

    expect(swapResult.receipt.status).toBe('success')

    const afterInputBalance = await testClientSepolia.readContract({
      address: TEST_CONFIG.tokens.USDC as Address,
      abi: ERC_20,
      functionName: 'balanceOf',
      args: [testClientSepolia.account.address],
    })

    expect(afterInputBalance + swapInput).toBe(beforeInputBalance)
  })

  it('swap eth', async () => {
    const beforeInputBalance = await testClientSepolia.getBalance({
      address: testClientSepolia.account.address,
    })

    const swapInput = 100000n

    const swapResult = await sendTestTransaction({
      ...prepareDexSwap(testClientSepolia, {
        tokenIn: TEST_CONFIG.tokens.WETH as Address,
        tokenOut: TEST_CONFIG.tokens.USDC as Address,
        addressTo: testClientSepolia.account.address,
        wrappedNativeToken: TEST_CONFIG.wrappedNativeToken as Address,
        inputBigNumber: swapInput,
        minOutput: 0n,
      }),
      address: TEST_CONFIG.router,
      account: testClientSepolia.account,
      network: 'sepolia',
    })

    expect(swapResult.receipt.status).toBe('success')

    const afterInputBalance = await testClientSepolia.getBalance({
      address: testClientSepolia.account.address,
    })

    expect(afterInputBalance + swapInput).toBeLessThan(beforeInputBalance)
  })
})
