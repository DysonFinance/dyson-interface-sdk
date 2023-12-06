import { Address, getAbiItem, WalletClient } from 'viem'

import { ABIGauge } from '@/constants/abis'
import DysonSwapRouter from '@/constants/abis/DysonSwapRouter'
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
      abi: ABIGauge,
      name: 'deposit',
    }),
    args: [args.tokenAmount, args.addressTo],
  })
}

export function prepareGaugeDepositWithRouter(
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
