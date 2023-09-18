import { Address, getAbiItem } from 'viem'

import BRIBE_ABI from '@/constants/abis/Bribe'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareTokenRewardOfWeek(token: Address, week: bigint) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: BRIBE_ABI, name: 'tokenRewardOfWeek' }),
    args: [token, week],
  })
}

export function tokenRewardOfWeekContract(
  bribeAddress: Address,
  token: Address,
  week: bigint,
) {
  return {
    address: bribeAddress,
    abi: BRIBE_ABI,
    functionName: 'tokenRewardOfWeek' as const,
    args: [token, week] as [Address, bigint],
  }
}

export function bribeGaugeContract(bribeAddress: Address) {
  return {
    address: bribeAddress,
    abi: BRIBE_ABI,
    functionName: 'gauge' as const,
  }
}
