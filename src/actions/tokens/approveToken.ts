import { Address, getAbiItem, WalletClient } from 'viem'

import ERC20_ABI from '@/constants/abis/erc20'
import { prepareFunctionParams } from '@/utils/viem'

export function prepareApproveToken(
  client: WalletClient,
  args: { spenderAddress: Address; allowance: bigint },
) {
  const chain = client.chain
  const enabled = !!chain?.id

  const { spenderAddress, allowance } = args

  return {
    ...prepareFunctionParams({
      abi: getAbiItem({
        abi: ERC20_ABI,
        name: 'approve',
      }),
      args: [spenderAddress, allowance],
    }),
    enabled,
  } as const
}
