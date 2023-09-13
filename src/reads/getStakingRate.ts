import { getAbiItem } from 'viem'

import SDYSN from '@/constants/abis/SDYSN'
import { prepareFunctionParams } from '@/utils/viem'

export function getStakingRate(lockPeriod: bigint) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'getStakingRate' }),
    args: [lockPeriod],
  })
}
