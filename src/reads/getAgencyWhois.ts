import Agency from '@/constants/abis/Agency'
import { prepareFunctionParams } from '@/utils/viem'
import { Address, getAbiItem } from 'viem'

export function prepareAgencyWhois(address: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: Agency, name: 'whois' }),
    args: [address],
  })
}
