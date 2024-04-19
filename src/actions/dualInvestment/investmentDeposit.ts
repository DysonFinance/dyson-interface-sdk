import { Address, getAbiItem, hexToNumber, slice, WalletClient } from 'viem'

import ROUTER_ABI from '@/constants/abis/DysonSwapRouter'
import { IDepositParams } from '@/constants/investment'
import { prepareFunctionParams } from '@/utils/viem'

export async function prepareSelfPermit(
  client: WalletClient,
  {
    spender,
    deadline,
    amount,
    tokenContract,
    owner,
    nonce,
    domain,
  }: {
    spender: Address
    deadline: number
    amount: bigint
    tokenContract: Address
    owner: Address
    nonce: bigint
    domain: {
      name: string
      version: string
      chainId: number
      verifyingContract: Address
    }
  },
) {
  const signedData = await client.signTypedData({
    account: client.account!,
    domain,
    types: {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Permit',
    message: {
      spender: spender,
      owner: owner,
      value: amount,
      deadline: BigInt(deadline),
      nonce: nonce,
    },
  })
  const [r, s, v] = [
    slice(signedData, 0, 32),
    slice(signedData, 32, 64),
    slice(signedData, 64, 65),
  ]
  return prepareFunctionParams({
    abi: getAbiItem({
      abi: ROUTER_ABI,
      name: 'selfPermit',
    }),

    args: [tokenContract, amount, BigInt(deadline), hexToNumber(v), r, s],
  })
}

// Should add native token test
export function prepareInvestmentDeposit(
  client: WalletClient,
  args: IDepositParams,
): ReturnType<typeof prepareFunctionParams> & { value?: bigint } {
  const chain = client.chain
  if (!chain?.id || !args.wrappedNativeToken) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const { addressTo, inputBigNumber, minOutput, duration, tokenIn, tokenOut } = args
  const isInNative = tokenIn.toLowerCase() === args.wrappedNativeToken.toLowerCase()

  if (isInNative) {
    return {
      ...prepareFunctionParams({
        abi: getAbiItem({
          abi: ROUTER_ABI,
          name: 'depositETH',
        }),
        args: [tokenOut, BigInt(1), addressTo, minOutput, BigInt(duration)],
      }),
      value: inputBigNumber,
    }
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
