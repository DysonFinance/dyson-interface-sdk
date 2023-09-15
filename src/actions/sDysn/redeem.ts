import { Address, Client, getAbiItem } from 'viem'
import { estimateContractGas } from 'viem/actions'

import SDYSN from '@/constants/abis/SDYSN'
import { prepareFunctionParams } from '@/utils/viem'

export type PrepareUnstakeParams = { to: Address; index: number; sDYSNAmount: bigint }
export type GetUnstakeGasParams = {
  client: Client
  contractAddress: Address
  userAddress: Address
} & PrepareUnstakeParams

export async function getUnstakeGasFee({
  client,
  contractAddress,
  userAddress,
  to,
  index,
  sDYSNAmount,
}: GetUnstakeGasParams) {
  const gasFee = await estimateContractGas(client, {
    abi: SDYSN,
    functionName: 'unstake',
    args: [to, BigInt(index), sDYSNAmount],
    account: userAddress,
    address: contractAddress,
  })
  return (gasFee * 15000n) / 10000n
}

export function prepareUnstake({ to, index, sDYSNAmount }: PrepareUnstakeParams) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'unstake' }),
    args: [to, BigInt(index), sDYSNAmount],
  })
}
