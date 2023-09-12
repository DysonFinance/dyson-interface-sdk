import { Zero } from '@/constants'
import { BOOSTING_DYSN_MULTIPLIER, MAX_BONUS } from '@/constants/boosting'

import { sqrt } from './commonCalc'

export const calcPoolBoosting = (totalSupply: bigint, userBalance: bigint) => {
  if (totalSupply === 0n || userBalance === 0n) {
    return Zero
  }
  const candidateBoost = sqrt((BOOSTING_DYSN_MULTIPLIER * userBalance) / totalSupply)
  return candidateBoost > MAX_BONUS ? MAX_BONUS : candidateBoost
}
