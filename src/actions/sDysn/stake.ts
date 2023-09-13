import { Address, Client, getAbiItem } from 'viem'
import { estimateContractGas } from 'viem/actions'

import SDYSN from '@/constants/abis/SDYSN'
import { prepareFunctionParams } from '@/utils/viem'

export async function getStakeGasFee(
  client: Client,
  contractAddress: Address,
  userAddress: Address,
  to: Address,
  tokenAmount: bigint,
  stakeTime: number,
) {
  const gasFee = await estimateContractGas(client, {
    abi: SDYSN,
    functionName: 'stake',
    args: [to, tokenAmount, BigInt(stakeTime)],
    address: contractAddress,
    account: userAddress,
  })
  const betterGas = (gasFee * 15000n) / 10000n
  return betterGas
}

export function prepareStake(to: Address, tokenAmount: bigint, stakeTime: number) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'stake' }),
    args: [to, tokenAmount, BigInt(stakeTime)],
  })
}
