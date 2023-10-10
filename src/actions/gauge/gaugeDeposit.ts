import { Address, getAbiItem, WalletClient } from 'viem'

import GAUGE_ABI from '@/constants/abis/Gauge'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareGaugeDeposit(
  client: WalletClient,
  args: { tokenAmount: bigint; addressTo: Address },
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: GAUGE_ABI,
      name: 'deposit',
    }),
    args: [args.tokenAmount, args.addressTo],
  })
}
