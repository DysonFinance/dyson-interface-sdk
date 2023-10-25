import { Address, getAbiItem } from 'viem'

import DYSON_PAIR_ABI from '@/constants/abis/DysonSwapPair'
import { prepareFunctionParams } from '@/utils/viem'

export function getPairsNonces(owner: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: DYSON_PAIR_ABI, name: 'nonces' }),
    args: [owner],
  })
}
