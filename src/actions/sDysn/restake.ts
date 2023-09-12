import SDYSN from '@/constants/abis/SDYSN'
import { prepareFunctionParams } from '@/utils/viem'
import { Address, PublicClient, getAbiItem } from 'viem'

export async function getRestakeGasFee(
  client: PublicClient,
  contractAddress: Address,
  userAddress: Address,
  index: number,
  tokenAmount: bigint,
  stakeTime: number,
) {
  const gasFee = await client.estimateContractGas({
    abi: SDYSN,
    functionName: 'restake',
    args: [BigInt(index), tokenAmount, BigInt(stakeTime)],
    account: userAddress,
    address: contractAddress,
  })
  return (gasFee * 15000n) / 10000n
}

export function prepareRestake(index: number, tokenAmount: bigint, stakeTime: number) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'restake' }),
    args: [BigInt(index), tokenAmount, BigInt(stakeTime)],
  })
}
