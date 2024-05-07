import { getAbiItem } from 'viem'

import type { ISwapMultipleHopsParams } from '@/constants'
import ROUTER_ABI from '@/constants/abis/DysonSwapRouter'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareSwapWithMultipleHops(args: ISwapMultipleHopsParams) {
  const { swapPath, addressTo, wrappedNativeToken, inputBigNumber, minOutput } = args
  const indexes = new Array(swapPath.length - 1).fill(1)

  const isInNative = swapPath[0].toLowerCase() === wrappedNativeToken.toLowerCase()
  const isOutNative =
    swapPath[swapPath.length - 1].toLowerCase() === wrappedNativeToken.toLowerCase()

  if (isInNative) {
    return {
      ...prepareFunctionParams({
        abi: getAbiItem({
          abi: ROUTER_ABI,
          name: 'swapETHInWithMultiHops',
        }),
        args: [swapPath, indexes, addressTo, minOutput],
      }),
      value: inputBigNumber,
    }
  }

  if (isOutNative) {
    return prepareFunctionParams({
      abi: getAbiItem({
        abi: ROUTER_ABI,
        name: 'swapETHOutWithMultiHops',
      }),
      args: [swapPath, indexes, addressTo, inputBigNumber, minOutput],
    })
  }

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: ROUTER_ABI,
      name: 'swapWithMultiHops',
    }),
    args: [swapPath, indexes, addressTo, inputBigNumber, minOutput],
  })
}
