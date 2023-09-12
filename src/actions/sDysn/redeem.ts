import SDYSN from '@/constants/abis/SDYSN'
import { prepareFunctionParams } from '@/utils/viem'
import { Address, PublicClient, getAbiItem } from 'viem'

export async function getUnstakeGasFee(
  client: PublicClient,
  contractAddress: Address,
  userAddress: Address,
  to: Address,
  index: number,
  sDYSNAmount: bigint,
) {
  const gasFee = await client.estimateContractGas({
    abi: SDYSN,
    functionName: 'unstake',
    args: [to, BigInt(index), sDYSNAmount],
    account: userAddress,
    address: contractAddress,
  })
  return (gasFee * 15000n) / 10000n
}

export function prepareUnstake(to: Address, index: number, sDYSNAmount: bigint) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'unstake' }),
    args: [to, BigInt(index), sDYSNAmount],
  })
}
