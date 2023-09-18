import { Address, getAbiItem, WalletClient } from 'viem'

import BRIBE_ABI from '@/constants/abis/Bribe'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareAddBribeReward(
  client: WalletClient,
  args: { token: Address; week: bigint; amount: bigint },
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }
  const { token, week, amount } = args

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: BRIBE_ABI,
      name: 'addReward',
    }),
    args: [token, week, amount],
  })
}
