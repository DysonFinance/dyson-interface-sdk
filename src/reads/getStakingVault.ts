import { Address, getAbiItem, PublicClient } from 'viem'

import SDYSN from '@/constants/abis/SDYSN'
import { prepareFunctionParams } from '@/utils/viem'

export function getVaultCount(address: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'vaultCount' }),
    args: [address],
  })
}

export async function getVaults(
  client: PublicClient,
  contractAddress: Address,
  address: Address,
  vaultAmount: number,
) {
  return await client.multicall({
    contracts: Array.from({ length: vaultAmount }).map((_, i) => ({
      ...prepareFunctionParams({
        abi: getAbiItem({ abi: SDYSN, name: 'vaults' }),
        args: [address, BigInt(i)],
      }),
      address: contractAddress,
    })),
  })
}
