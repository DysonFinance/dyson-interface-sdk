import { Address, getAbiItem, WalletClient } from 'viem'

import FARM_ABI from '@/constants/abis/Farm'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareSpSwap(client: WalletClient, account: Address) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: FARM_ABI,
      name: 'swap',
    }),
    args: [account],
  })
}
