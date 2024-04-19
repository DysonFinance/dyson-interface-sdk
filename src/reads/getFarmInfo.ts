import { Address, getAbiItem, PublicClient } from 'viem'

import { ABIFarm } from '@/constants/abis'
import { IFarmRewardInfo } from '@/constants/farm'
import {
  prepareFunctionParams,
  ReadContractParameters,
  readContractParameters,
} from '@/utils/viem'

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

export function farmSpBalanceContract(farmAddress: Address, account: Address) {
  return {
    address: farmAddress,
    abi: ABIFarm,
    functionName: 'balanceOf' as const,
    args: [account] as [Address],
  }
}

export function farmSwapSpCdContract(farmAddress: Address, account: Address) {
  return {
    address: farmAddress,
    abi: ABIFarm,
    functionName: 'cooldown' as const,
    args: [account] as [Address],
  }
}

export function farmGlobalPoolContract(farmAddress: Address) {
  return {
    address: farmAddress,
    abi: ABIFarm,
    functionName: 'globalPool' as const,
  }
}

export async function getFarmRewardInfo(
  client: PublicClient,
  args: ReadContractParameters<{ farmAddress: Address; account: Address }>,
) {
  const chain = client.chain
  const { farmAddress, account, ...rest } = args
  if (!chain?.id || !farmAddress) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const farmRewardInfo = await client.multicall({
    ...readContractParameters(rest),
    allowFailure: false,
    contracts: [
      farmSpBalanceContract(farmAddress, account),
      farmSwapSpCdContract(farmAddress, account),
      farmGlobalPoolContract(farmAddress),
    ],
  })
  const [accountSpBalance, coolDownTime, globalPoolConfig] = farmRewardInfo
  const [w, rewardRate, lastUpdateTime, lastReserve] = globalPoolConfig
  const farmInfo: IFarmRewardInfo = {
    w,
    rewardRate,
    lastUpdateTime,
    lastReserve,
    userInfo: {
      spBalance: accountSpBalance,
      coolDownTime: Number(coolDownTime),
    },
  }

  return farmInfo
}
