import { Address, getAbiItem, PublicClient } from 'viem'

import Agency from '@/constants/abis/Agency'
import { prepareFunctionParams } from '@/utils/viem'
const usedAbiItem = getAbiItem({ abi: Agency, name: 'oneTimeCodes' })
export function getReferralCodeUsed(
  client: PublicClient,
  oneTimeCodeList: Address[],
  agencyAddress: Address,
) {
  return client.multicall({
    contracts: oneTimeCodeList.map(
      (code) =>
        ({
          ...prepareReferralCodeUsed(code),
          address: agencyAddress,
        }) as const,
    ),
  })
}

export function prepareReferralCodeUsed(oneTimeCode: Address) {
  return prepareFunctionParams({
    abi: usedAbiItem,
    args: [oneTimeCode],
  })
}
