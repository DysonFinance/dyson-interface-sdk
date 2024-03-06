import { getAbiItem, WalletClient } from 'viem'

import GAUGE_ABI from '@/constants/abis/Gauge'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareGaugeWithdraw(client: WalletClient) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: GAUGE_ABI,
      name: 'withdraw',
    }),
    args: [],
  })
}
