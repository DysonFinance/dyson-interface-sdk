import { getAbiItem, WalletClient } from 'viem'

import GAUGE_ABI from '@/constants/abis/Gauge'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareGaugeApplyWithdraw(
  client: WalletClient,
  args: { tokenAmount: bigint },
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: GAUGE_ABI,
      name: 'applyWithdrawal',
    }),
    args: [args.tokenAmount],
  })
}
