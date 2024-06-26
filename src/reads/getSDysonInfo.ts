import { Address, getAbiItem } from 'viem'

import SDYSN from '@/constants/abis/SDYSN'
import { prepareFunctionParams } from '@/utils/viem'
export function getBaseSDysonInfo() {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'totalSupply' }),
    args: [],
  })
}

export function getSDysonBalance(address: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'balanceOf' }),
    args: [address],
  })
}

export function getDysonAmountStaked(address: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'dysonAmountStaked' }),
    args: [address],
  })
}

export function getVotingPower(address: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'vaultCount' }),
    args: [address],
  })
}
