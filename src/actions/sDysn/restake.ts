import { Address, Client, getAbiItem } from 'viem'
import { estimateContractGas } from 'viem/actions'

import SDYSN from '@/constants/abis/SDYSN'
import { prepareFunctionParams } from '@/utils/viem'

export type PrepareRestakeParams = {
  index: number
  tokenAmount: bigint
  stakeTime: number
}

export type GetRestakeGasFeeParams = {
  client: Client
  contractAddress: Address
  userAddress: Address
  index: number
  tokenAmount: bigint
  stakeTime: number
}

export async function getRestakeGasFee({
  client,
  contractAddress,
  userAddress,
  index,
  tokenAmount,
  stakeTime,
}: GetRestakeGasFeeParams) {
  const gasFee = await estimateContractGas(client, {
    abi: SDYSN,
    functionName: 'restake',
    args: [BigInt(index), tokenAmount, BigInt(stakeTime)],
    account: userAddress,
    address: contractAddress,
  })
  return (gasFee * 15000n) / 10000n
}

export function prepareRestake({ index, tokenAmount, stakeTime }: PrepareRestakeParams) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'restake' }),
    args: [BigInt(index), tokenAmount, BigInt(stakeTime)],
  })
}
