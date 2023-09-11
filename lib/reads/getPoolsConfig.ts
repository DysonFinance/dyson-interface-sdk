import { ChainId } from '@/constants'
import { flatten } from 'lodash-es'
import { SWAP_POOL_FACTORY } from '@/constants/addresses'
import FACTORY_ABI from '@/constants/abis/DysonSwapFactory'
import DYSON_POOL_ABI from '@/constants/abis/DysonSwapPair'
import { ReadContractParameters, prepareFunctionParams, readContractParameters } from '@/utils/viem'
import { getAbiItem, multicall } from 'viem/contract'
import { Address, PublicClient } from 'viem'

export function preparePairLengths() {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: FACTORY_ABI, name: 'allPairsLength' }),
  })
}

function pairAddressesContract(factoryAddress: Address, pairIndex: number) {
  return {
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: 'allPairs',
    args: [pairIndex],
  }
}

function pairTokenAddressesContract(pairAddress: Address, tokenIndex: number) {
  const callName = tokenIndex === 0 ? 'token0' : 'token1'
  return {
    address: pairAddress,
    abi: DYSON_POOL_ABI,
    functionName: callName,
  }
}

export async function getPairsConfig(client: PublicClient, args: ReadContractParameters<{ pairLength: number }>) {
  const chain = client.chain
  if (!chain?.id || !SWAP_POOL_FACTORY?.[chain.id as ChainId]) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const factoryAddress = SWAP_POOL_FACTORY[chain.id as ChainId] as Address
  let arr = new Array(args.pairLength)

  const pairAddresses = (await multicall(client, {
    ...readContractParameters(args),
    allowFailure: false,
    contracts: arr.map((_, index) => pairAddressesContract(factoryAddress, index)),
  })) as Address[]

  const tokenAddresses = (await multicall(client, {
    ...readContractParameters(args),
    allowFailure: false,
    contracts: flatten(pairAddresses.map((pairAddress) => ([pairTokenAddressesContract(pairAddress, 0), pairTokenAddressesContract(pairAddress, 1)]))),
  })) as Address[]

  return {
    pairAddresses,
    tokenAddresses,
  }
}
