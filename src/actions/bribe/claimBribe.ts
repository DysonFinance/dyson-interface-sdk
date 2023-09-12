import { Address, getAbiItem, WalletClient } from 'viem'

import BRIBE_ABI from '@/constants/abis/Bribe'
import { prepareFunctionParams } from '@/utils/viem'

export async function prepareClaimBribe(
  client: WalletClient,
  args: { tokenList: Address[]; weekMatrix: string[][] },
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
