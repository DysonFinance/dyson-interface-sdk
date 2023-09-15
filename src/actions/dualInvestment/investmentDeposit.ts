import { getAbiItem, WalletClient } from 'viem'

import ROUTER_ABI from '@/constants/abis/DysonSwapRouter'
import { IDepositParams } from '@/constants/investment'
import { prepareFunctionParams } from '@/utils/viem'

export async function prepareInvestmentDeposit(
  client: WalletClient,
  args: IDepositParams,
) {
  const chain = client.chain
  if (!chain?.id || !args.wrappedNativeToken) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const { addressTo, inputBigNumber, minOutput, duration, tokenIn, tokenOut } = args
  const isInNative = tokenIn.toLowerCase() === args.wrappedNativeToken.toLowerCase()

  if (isInNative) {
    return prepareFunctionParams({
      abi: getAbiItem({
        abi: ROUTER_ABI,
        name: 'depositETH',
      }),
      args: [tokenOut, BigInt(1), addressTo, minOutput, BigInt(duration)],
      value: inputBigNumber,
    })
  }

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: ROUTER_ABI,
      name: 'deposit',
    }),
    args: [
      tokenIn,
      tokenOut,
      BigInt(1),
      addressTo,
      inputBigNumber,
      minOutput,
      BigInt(duration),
    ],
  })
}
