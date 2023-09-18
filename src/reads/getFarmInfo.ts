import { Address, getAbiItem } from 'viem'

import { ABIFarm } from '@/constants/abis'
import { prepareFunctionParams } from '@/utils/viem'

export function getSPBalanceOf(address: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: ABIFarm, name: 'balanceOf' }),
    args: [address],
  })
}

export function getSPCoolDown(address: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: ABIFarm, name: 'cooldown' }),
    args: [address],
  })
}
