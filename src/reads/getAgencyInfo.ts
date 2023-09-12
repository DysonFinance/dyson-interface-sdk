import { Address, getAbiItem } from 'viem'

import Agency from '@/constants/abis/Agency'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareAgencyInfo(address: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: Agency, name: 'userInfo' }),
    args: [address],
  })
}

export function prepareGetAgent(userId: bigint) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: Agency, name: 'getAgent' }),
    args: [userId],
  })
}
