import SDYSN from '@/constants/abis/SDYSN'
import { prepareFunctionParams } from '@/utils/viem'
import { Address, PublicClient, getAbiItem } from 'viem'

export function getVaultCount(address: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: SDYSN, name: 'vaultCount' }),
    args: [address],
  })
}

export async function getVaults(client: PublicClient, address: Address, amount: number) {
  return await client.multicall({
    contracts: Array.from({ length: amount }).map((_, i) => ({
      ...prepareFunctionParams({
        abi: getAbiItem({ abi: SDYSN, name: 'vaults' }),
        args: [address, BigInt(i)],
      }),
      address,
    })),
  })
}
