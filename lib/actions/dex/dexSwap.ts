import { ChainId } from '@/constants'
import ROUTER_ABI from '@/constants/abis/DysonSwapRouter'
import { ISwapParams } from '@/constants/dex'
import { WRAPPED_NATIVE_TOKEN } from '@/constants/router'
import { WalletClient, encodeFunctionData } from 'viem'

export async function encodeDexSwap(client: WalletClient, args: ISwapParams) {
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
    return encodeFunctionData({
      abi: ROUTER_ABI,
      functionName: 'swapETHIn',
      args: [tokenOut, BigInt(1), addressTo, minOutput],
    })
  }
  if (isOutNative) {
    return encodeFunctionData({
      abi: ROUTER_ABI,
      functionName: 'swapETHOut',
      args: [tokenIn, BigInt(1), addressTo, inputBigNumber, minOutput],
    })
  }

  return encodeFunctionData({
    abi: ROUTER_ABI,
    functionName: 'swap',
    args: [tokenIn,tokenOut, BigInt(1), addressTo, inputBigNumber, minOutput],
  })
}
