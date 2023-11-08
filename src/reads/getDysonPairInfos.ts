import { chunk, flatten, get } from 'lodash-es'
import { Address, parseAbi, PublicClient } from 'viem'
import { multicall } from 'viem/contract'

import DYSON_PAIR_ABI from '@/constants/abis/DysonSwapPair'
import { DysonPair } from '@/entities/dysonPair'
import { ReadContractParameters, readContractParameters } from '@/utils/viem'

import { prepareGaugeInfos } from './getGaugeInfo'

const erc20BalanceAbi = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
] as const)

const currentBlockTimeAbi = parseAbi([
  'function getCurrentBlockTimestamp() view returns (uint256)',
] as const)

const AddressZero = '0x0000000000000000000000000000000000000000'

function pairAttributeContract(
  pairAddress: Address,
  attribute: 'basis' | 'getFeeRatio' | 'halfLife',
) {
  return {
    address: pairAddress,
    abi: DYSON_PAIR_ABI,
    functionName: attribute,
  }
}

function pairNoteCountContract(pairAddress: Address, account: Address) {
  return {
    address: pairAddress,
    abi: DYSON_PAIR_ABI,
    functionName: 'noteCount',
    args: [account || AddressZero],
  }
}

export function tokenBalanceContract(tokenAddress: Address, account: Address) {
  return {
    address: tokenAddress,
    abi: erc20BalanceAbi,
    functionName: 'balanceOf',
    args: [account],
  }
}

function pairReservesContract(pairAddress: Address) {
  return {
    address: pairAddress,
    abi: DYSON_PAIR_ABI,
    functionName: 'getReserves',
  }
}

function farmGaugeContract(farmAddress: Address, pairAddress: Address) {
  return {
    address: farmAddress,
    ...prepareGaugeInfos(pairAddress),
  }
}

function multicall3CurrentContract(client: PublicClient) {
  return {
    address: get(client, 'chain.contracts.multicall3.address')!,
    abi: currentBlockTimeAbi,
    functionName: 'getCurrentBlockTimestamp',
  }
}

export async function getDysonPairInfos(
  client: PublicClient,
  args: ReadContractParameters<{
    account: Address
    farmAddress?: Address
    pairConfigs: {
      pairAddress: Address
      token0Address: Address
      token1Address: Address
    }[]
  }>,
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const { account, farmAddress, pairConfigs } = args

  const noteContractMatrix = pairConfigs.map((pairConfig) => {
    const { pairAddress } = pairConfig
    const callContractList = []

    callContractList.push(pairAttributeContract(pairAddress, 'basis'))
    callContractList.push(pairAttributeContract(pairAddress, 'getFeeRatio'))
    callContractList.push(pairAttributeContract(pairAddress, 'halfLife'))
    callContractList.push(pairNoteCountContract(pairAddress, account))
    callContractList.push(pairReservesContract(pairAddress))
    farmAddress && callContractList.push(farmGaugeContract(farmAddress, pairAddress))

    return callContractList
  })

  const pairDataResult = await multicall(client, {
    ...readContractParameters(args),
    allowFailure: false,
    contracts: [multicall3CurrentContract(client), ...flatten(noteContractMatrix)],
  })

  const blockTime = pairDataResult.shift() as bigint

  const chunkSize = farmAddress ? 6 : 5
  const pairDataMatrix: any[] = chunk(pairDataResult, chunkSize)

  const dysonPairInfoList: DysonPair[] = []
  pairDataMatrix.map((pairDateArray, index) => {
    const [basis, feeStored, halfLife, noteCount, reserves, pool] = pairDateArray
    const poolArray = (pool as any[]) ?? []
    const { pairAddress, token0Address, token1Address } = pairConfigs[index]
    const [feeRatio0, feeRatio1] = feeStored as any
    const [reserve0, reserve1] = reserves as any

    dysonPairInfoList.push({
      pairAddress,
      basis: basis as bigint,
      fee0: feeRatio0 as bigint,
      fee1: feeRatio1 as bigint,
      halfLife: halfLife as bigint,
      token0Address,
      token1Address,
      token0Amount: reserve0 as bigint,
      token1Amount: reserve1 as bigint,
      noteCount: account ? Number(noteCount as bigint) : undefined,
      farmPoolInfo: {
        weight: poolArray[0] ?? 0n,
        rewardRate: poolArray[1] ?? 0n,
        lastUpdateTime: poolArray[2] ?? 0n,
        lastReserve: poolArray[3] ?? 0n,
        gauge: poolArray[4] ?? undefined,
      },

      timeStamp0: Number(blockTime),
      timeStamp1: Number(blockTime),
    })
  })

  return {
    dysonPairInfoList,
  }
}
