import { Address } from 'abitype'
import { getAbiItem } from 'viem'

import DysonSwapPair from '@/constants/abis/DysonSwapPair'
import { prepareFunctionParams } from '@/utils/viem'

export function getPairOperatorApprovals(owner: Address, operator: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: DysonSwapPair, name: 'operatorApprovals' }),
    args: [owner, operator],
  })
}
