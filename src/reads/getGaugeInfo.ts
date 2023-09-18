import { Address, getAbiItem } from 'viem'

import FARM_ABI from '@/constants/abis/Farm'
import GAUGE_API from '@/constants/abis/Gauge'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareGaugeInfos(pairAddress: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: FARM_ABI, name: 'pools' }),
    args: [pairAddress],
  })
}

export function prepareGaugeBalance(account: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: GAUGE_API, name: 'balanceOf' }),
    args: [account],
  })
}
