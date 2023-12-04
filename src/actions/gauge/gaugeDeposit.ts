import { Address, getAbiItem, WalletClient } from 'viem'

import DysonSwapRouter from '@/constants/abis/DysonSwapRouter'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareGaugeDeposit(
  client: WalletClient,
  args: { tokenAmount: bigint; addressTo: Address; gaugeAddress: Address },
) {
  const chain = client.chain
  if (!chain?.id) {
    throw new Error('Chain Id on wallet client is empty')
  }

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: DysonSwapRouter,
      name: 'depositToGauge',
    }),
    args: [args.gaugeAddress, args.tokenAmount, args.addressTo],
  })
}
