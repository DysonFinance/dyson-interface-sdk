import { flatten } from 'lodash-es'
import { chunk } from 'lodash-es'
import { Address, getAbiItem, PublicClient } from 'viem'
import { multicall } from 'viem/actions'

import FACTORY_ABI from '@/constants/abis/DysonSwapFactory'
import DYSON_PAIR_ABI from '@/constants/abis/DysonSwapPair'
import { DysonPoolConfig } from '@/entities/dysonPair'
import {
  prepareFunctionParams,
  ReadContractParameters,
  readContractParameters,
} from '@/utils/viem'

type DysonConfigMapType = {
  [contractAddress: string]: DysonPoolConfig
}

export function preparePairLengths() {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: FACTORY_ABI, name: 'allPairsLength' }),
    args: [],
  })
}

export function pairAddressesContract(factoryAddress: Address, pairIndex: number) {
  return {
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: 'allPairs',
    args: [pairIndex],
  }
}

export function pairTokenAddressesContract(pairAddress: Address, tokenIndex: number) {
  const callName = tokenIndex === 0 ? 'token0' : 'token1'
  return {
    address: pairAddress,
    abi: DYSON_PAIR_ABI,
    functionName: callName,
  }
}

export async function getPairsConfig(
  client: PublicClient,
  args: ReadContractParameters<{ pairLength: number; factoryAddress: Address }>,
) {
  const chain = client.chain
  const { factoryAddress } = args
  if (!chain?.id || !factoryAddress) {
    throw new Error('Chain Id on wallet client is empty')
  }

  let arr = new Array(args.pairLength).fill(undefined)

  const pairAddresses = (await multicall(client, {
    ...readContractParameters(args),
    allowFailure: false,
    contracts: arr.map((_, index) => pairAddressesContract(factoryAddress, index)),
  })) as Address[]

  const tokenAddresses = (await multicall(client, {
    ...readContractParameters(args),
    allowFailure: false,
    contracts: flatten(
      pairAddresses.map((pairAddress) => [
        pairTokenAddressesContract(pairAddress, 0),
        pairTokenAddressesContract(pairAddress, 1),
      ]),
    ),
  })) as Address[]

  const dysonPoolConfigMap: DysonConfigMapType = {}
  const tokenChunks: Address[][] = chunk(tokenAddresses, 2)
  tokenChunks.map((tokenArray, index) => {
    const [token0Address, token1Address] = tokenArray
    const pairAddress = pairAddresses[index]
    dysonPoolConfigMap[pairAddress] = {
      token0Address: token0Address as Address,
      token1Address: token1Address as Address,
      pairAddress,
    }
  })

  return dysonPoolConfigMap
}
