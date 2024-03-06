import { cloneDeep } from 'lodash-es'
import { Address, getAbiItem, parseAbi, PublicClient } from 'viem'
import { multicall } from 'viem/actions'

import {
  prepareFunctionParams,
  ReadContractParameters,
  readContractParameters,
} from '@/utils/viem'

const erc20AllowanceAbi = parseAbi([
  'function allowance(address owner, address spender) external view returns (uint256)',
] as const)

export interface ITokenAllowanceMap {
  [allowancePair: string]: AllowanceData
}
export interface AllowanceData extends AllowancePair {
  allowance?: bigint
}

export interface AllowancePair {
  tokenAddress: string
  spenderAddress: string
}

export function prepareTokenAllowance(owner: Address, spender: Address) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: erc20AllowanceAbi, name: 'allowance' }),
    args: [owner, spender],
  })
}

function tokenAllowanceContract(tokenAddress: Address, owner: Address, spender: Address) {
  return {
    address: tokenAddress,
    ...prepareTokenAllowance(owner, spender),
  }
}

export async function getPairAllowanceMap(
  client: PublicClient,
  args: ReadContractParameters<{
    tokenAllowanceMap: ITokenAllowanceMap
    account: Address
  }>,
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  const tokenAllowanceValues = Object.values(args.tokenAllowanceMap)

  const allowanceContractList = tokenAllowanceValues.map((allowanceData) =>
    tokenAllowanceContract(
      allowanceData.tokenAddress as Address,
      args.account,
      allowanceData.spenderAddress as Address,
    ),
  )

  const allowanceResult = await multicall(client, {
    ...readContractParameters(args),
    allowFailure: false,
    contracts: allowanceContractList,
  })

  const tokenAllowanceMap = cloneDeep(args.tokenAllowanceMap)
  Object.keys(args.tokenAllowanceMap).forEach((key, index) => {
    tokenAllowanceMap[key].allowance = allowanceResult[index] as bigint
  })

  return tokenAllowanceMap
}
