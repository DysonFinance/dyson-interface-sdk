import { ChainId } from '@/constants'
import type { Address, WalletClient } from 'viem'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'

export async function signReferral(
  client: WalletClient,
  chainId: ChainId,
  agencyAddress: Address,
  deadline: number,
) {
  const onceKey = generatePrivateKey()
  const onceAddress = privateKeyToAddress(onceKey)
  const parentTypedData = getParentTypedData(
    chainId,
    agencyAddress,
    onceAddress,
    deadline,
  )

  const parentSig = await client.signTypedData({
    domain: parentTypedData.domain as any,
    types: parentTypedData.types,
    message: parentTypedData.message as any,
    account: client.account!,
    primaryType: 'register',
  })

  return { parentSig, onceAddress, onceKey, deadline }
}

function getParentTypedData(
  chainId: ChainId,
  agencyAddress: Address,
  onceAddress: Address,
  deadline: number,
) {
  const parentTypedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      register: [
        { name: 'once', type: 'address' },
        { name: 'deadline', type: 'uint' },
        { name: 'price', type: 'uint' },
      ],
    },
    domain: {
      name: 'Dyson Agency',
      version: '1',
      chainId: chainId,
      verifyingContract: agencyAddress as Address,
    },
    message: {
      once: onceAddress,
      deadline: deadline,
      price: 0,
    },
  } as const

  return parentTypedData
}
