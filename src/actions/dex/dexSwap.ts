import { getAbiItem, WalletClient } from 'viem'

import { ChainId } from '@/constants'
import ROUTER_ABI from '@/constants/abis/DysonSwapRouter'
import { WRAPPED_NATIVE_TOKEN } from '@/constants/addresses'
import { ISwapParams } from '@/constants/dex'
import { prepareFunctionParams } from '@/utils/viem'

export async function prepareDexSwap(client: WalletClient, args: ISwapParams) {
  const chain = client.chain
  if (!chain?.id || !WRAPPED_NATIVE_TOKEN[chain.id as ChainId]) {
    throw new Error('Chain Id on wallet client is empty')
  }
  const { addressTo, inputBigNumber, minOutput, tokenIn, tokenOut } = args

  const isInNative =
    tokenIn.toLowerCase() === WRAPPED_NATIVE_TOKEN[chain.id as ChainId].toLowerCase()
  const isOutNative =
    tokenOut.toLowerCase() === WRAPPED_NATIVE_TOKEN[chain.id as ChainId].toLowerCase()

  if (isInNative) {
    return prepareFunctionParams({
      abi: getAbiItem({
        abi: ROUTER_ABI,
        name: 'swapETHIn',
      }),
      args: [tokenOut, BigInt(1), addressTo, minOutput],
    })
  }
  if (isOutNative) {
    return prepareFunctionParams({
      abi: getAbiItem({
        abi: ROUTER_ABI,
        name: 'swapETHOut',
      }),
      args: [tokenIn, BigInt(1), addressTo, inputBigNumber, minOutput],
    })
  }

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: ROUTER_ABI,
      name: 'swap',
    }),
    args: [tokenIn, tokenOut, BigInt(1), addressTo, inputBigNumber, minOutput],
  })
}
