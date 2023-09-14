import { Address, getAbiItem } from 'viem'

import Agency from '@/constants/abis/Agency'
import { prepareFunctionParams } from '@/utils/viem'

export function getAgencyWhois(address: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: Agency, name: 'whois' }),
    args: [address],
  })
}
