import Agency from '@/constants/abis/Agency'
import { Address, decodeFunctionResult, encodeFunctionData } from 'viem'

export function queryAgencyWhoisData(address: Address) {
  return encodeFunctionData({ abi: Agency, functionName: 'whois', args: [address] })
}

export function decodeAgencyWhoisData(hash: Address) {
  return decodeFunctionResult({
    abi: Agency,
    functionName: 'whois',
    data: hash
  })
}
