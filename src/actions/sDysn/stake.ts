import { Address, Client, getAbiItem } from 'viem'
import { estimateContractGas } from 'viem/actions'

import DysonSwapRouter from '@/constants/abis/DysonSwapRouter'
import { prepareFunctionParams } from '@/utils/viem'
export type PrepareStakeParams = { to: Address; tokenAmount: bigint; stakeTime: number }
export type GetStakeGasFeeParams = PrepareStakeParams & {
  client: Client
  contractAddress: Address
  userAddress: Address
}
export async function getStakeGasFee({
  client,
  contractAddress,
  userAddress,
  to,
  tokenAmount,
  stakeTime,
}: GetStakeGasFeeParams) {
  const gasFee = await estimateContractGas(client, {
    abi: DysonSwapRouter,
    functionName: 'stakeDyson',
    args: [to, tokenAmount, BigInt(stakeTime)],
    address: contractAddress,
    account: userAddress,
  })
  const betterGas = (gasFee * 15000n) / 10000n
  return betterGas
}

export function prepareStake({ to, tokenAmount, stakeTime }: PrepareStakeParams) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: DysonSwapRouter, name: 'stakeDyson' }),
    args: [to, tokenAmount, BigInt(stakeTime)],
  })
}
