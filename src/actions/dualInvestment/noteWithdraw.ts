import { ChainId } from '@/constants'
import ROUTER_ABI from '@/constants/abis/DysonSwapRouter'
import DYSON_PAIR_ABI from '@/constants/abis/DysonSwapPair'

import { ROUTER_ADDRESS } from '@/constants/addresses'
import { prepareFunctionParams } from '@/utils/viem'
import { Address, WalletClient, getAbiItem } from 'viem'

export function getWithdrawNoteTypedData(
  chainId: ChainId,
  dysonPairAddress: string,
  noteIndex: number,
  routerAddress: string,
): any {
  const withdrawTypedData = {
    types: {
      withdraw: [
        { name: 'operator', type: 'address' },
        { name: 'index', type: 'uint' },
        { name: 'to', type: 'address' },
        { name: 'deadline', type: 'uint' },
      ],
    },
    primaryType: 'withdraw' as const,
    domain: {
      name: 'DysonPair',
      version: '1',
      chainId: chainId,
      verifyingContract: dysonPairAddress as Address,
    },
    message: {
      operator: routerAddress as Address,
      index: BigInt(noteIndex),
      to: routerAddress as Address,
      deadline: 0n,
    },
  }

  return withdrawTypedData
}

export async function prepareNoteWithdraw(
  client: WalletClient,
  args: {
    isNativePool: boolean
    noteIndex: number
    pairAddress: `0x${string}`
    addressTo: `0x${string}`
  },
) {
  const chain = client.chain
  if (!chain?.id || !ROUTER_ADDRESS[chain.id as ChainId]) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const { isNativePool, noteIndex, pairAddress, addressTo } = args

  if (isNativePool) {
    const sigTypeData = getWithdrawNoteTypedData(
      chain.id,
      pairAddress,
      noteIndex,
      ROUTER_ADDRESS[chain.id as ChainId],
    )

    const withdrawSig = await client.signTypedData({
      ...sigTypeData,
      account: client.account!.address,
    })

    return prepareFunctionParams({
      abi: getAbiItem({
        abi: ROUTER_ABI,
        name: 'withdrawETH',
      }),
      args: [pairAddress, BigInt(noteIndex), addressTo, BigInt(0), withdrawSig],
    })
  }

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: DYSON_PAIR_ABI,
      name: 'withdraw',
    }),
    args: [BigInt(noteIndex)],
  })
}
