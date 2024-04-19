import { getAbiItem, WalletClient } from 'viem'

import ROUTER_ABI from '@/constants/abis/DysonSwapRouter'
import { ISwapParams } from '@/constants/dex'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareDexSwap(
  client: WalletClient,
  args: ISwapParams,
): ReturnType<typeof prepareFunctionParams> & { value?: bigint } {
  const chain = client.chain
  if (!chain?.id || !args.wrappedNativeToken) {
    throw new Error('Chain Id on wallet client is empty')
  }
  const { addressTo, inputBigNumber, minOutput, tokenIn, tokenOut } = args

  const isInNative = tokenIn.toLowerCase() === args.wrappedNativeToken.toLowerCase()
  const isOutNative = tokenOut.toLowerCase() === args.wrappedNativeToken.toLowerCase()

  if (isInNative) {
    return {
      ...prepareFunctionParams({
        abi: getAbiItem({
          abi: ROUTER_ABI,
          name: 'swapETHIn',
        }),
        args: [tokenOut, BigInt(1), addressTo, minOutput],
      }),
      value: inputBigNumber,
    }
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
