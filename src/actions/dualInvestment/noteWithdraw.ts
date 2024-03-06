import { unzip } from 'lodash-es'
import { Address, getAbiItem, WalletClient } from 'viem'

import DYSON_PAIR_ABI from '@/constants/abis/DysonSwapPair'
import DysonSwapPair from '@/constants/abis/DysonSwapPair'
import ROUTER_ABI from '@/constants/abis/DysonSwapRouter'
import { prepareFunctionParams } from '@/utils/viem'

function getApprovalForAllWithSigTypedData({
  chainId,
  owner,
  operator,
  pairAddress,
  approved,
  nonce,
  deadline,
}: {
  chainId: number
  owner: Address
  operator: Address
  pairAddress: Address
  approved: boolean
  nonce: bigint
  deadline: bigint
}) {
  const approvalForAllTypedData = {
    types: {
      setApprovalForAllWithSig: [
        { name: 'owner', type: 'address' },
        { name: 'operator', type: 'address' },
        { name: 'approved', type: 'bool' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'setApprovalForAllWithSig' as const,
    domain: {
      name: 'Pair',
      version: '1',
      chainId: chainId,
      verifyingContract: pairAddress,
    },
    message: {
      owner,
      operator,
      approved,
      nonce,
      deadline,
    },
  } as const

  return approvalForAllTypedData
}

/**
 * @description This one use on Pair
 */
export async function prepareSetApprovalForAll(operator: Address, approved: boolean) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: DysonSwapPair, name: 'setApprovalForAll' }),
    args: [operator, approved],
  })
}

/**
 * @description This one use on Router
 */
export async function prepareSetApprovalForAllWithSig(
  client: WalletClient,
  args: {
    owner: Address
    pairAddress: Address
    operator: Address
    approved: boolean
    nonce: bigint
    deadline: bigint
  },
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }
  const { owner, pairAddress, approved, nonce, deadline, operator } = args
  const approvalForAllDigest = getApprovalForAllWithSigTypedData({
    chainId: chain.id,
    approved,
    deadline,
    operator,
    nonce,
    owner,
    pairAddress,
  })
  const signedData = await client.signTypedData({
    ...approvalForAllDigest,
    account: owner,
  })

  return prepareFunctionParams({
    abi: getAbiItem({ abi: ROUTER_ABI, name: 'setApprovalForAllWithSig' }),
    args: [pairAddress, approved, deadline, signedData],
  })
}

export function prepareNoteWithdraw(
  client: WalletClient,
  args: {
    isNativePool: boolean
    noteIndex: number
    pairAddress: `0x${string}`
    addressTo: `0x${string}`
  },
): ReturnType<typeof prepareFunctionParams> & { value?: bigint | undefined } {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const { isNativePool, noteIndex, pairAddress, addressTo } = args

  if (isNativePool) {
    return prepareFunctionParams({
      abi: getAbiItem({
        abi: ROUTER_ABI,
        name: 'withdrawETH',
      }),
      args: [pairAddress, BigInt(noteIndex), addressTo],
    })
  }

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: DYSON_PAIR_ABI,
      name: 'withdraw',
    }),
    args: [BigInt(noteIndex), addressTo],
  })
}

export function prepareNoteWithdrawForAll(
  client: WalletClient,
  args: {
    pairs: {
      address: Address
      noteIndex: bigint
      addressTo: Address
    }[]
  },
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const fnArg = unzip(
    args.pairs.map((ele) => [ele.address, ele.noteIndex, ele.addressTo] as const),
  ) as [Address[], bigint[], Address[]]
  return prepareFunctionParams({
    abi: getAbiItem({
      abi: ROUTER_ABI,
      name: 'withdrawMultiPositions',
    }),
    args: fnArg,
  })
}
