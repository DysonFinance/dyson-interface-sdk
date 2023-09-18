import { Address, getAbiItem, WalletClient } from 'viem'

import BRIBE_ABI from '@/constants/abis/Bribe'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareClaimBribeMatrix(
  client: WalletClient,
  args: { tokenList: Address[]; weekMatrix: bigint[][] },
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }
  const { tokenList, weekMatrix } = args

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: BRIBE_ABI,
      name: 'claimRewardsMultipleTokens',
    }),
    args: [tokenList, weekMatrix],
  })
}

export function prepareClaimBribeWeeks(
  client: WalletClient,
  args: { token: Address; weeks: bigint[] },
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }
  const { token, weeks } = args

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: BRIBE_ABI,
      name: 'claimRewards',
    }),
    args: [token, weeks],
  })
}

export function prepareClaimBribe(
  client: WalletClient,
  args: { token: Address; week: bigint },
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }
  const { token, week } = args

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: BRIBE_ABI,
      name: 'claimReward',
    }),
    args: [token, week],
  })
}
