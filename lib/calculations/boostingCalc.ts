import { BigNumber } from '@ethersproject/bignumber'
import { Zero } from '@ethersproject/constants'

import { BOOSTING_DYSN_MULTIPLIER, MAX_BONUS } from '@/constants/boosting'

import { sqrt } from './commonCalc'

export const calcPoolBoosting = (totalSupply: BigNumber, userBalance: BigNumber) => {
  if (totalSupply.eq(0) || userBalance.eq(0)) {
    return Zero
  }
  const candidateBoost = sqrt(BOOSTING_DYSN_MULTIPLIER.mul(userBalance).div(totalSupply))
  return candidateBoost.gt(MAX_BONUS) ? MAX_BONUS : candidateBoost
}
