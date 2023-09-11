import { ChainId } from '@/constants'
import type { Address, Client } from 'viem'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import { signTypedData } from 'viem/actions'

export async function signReferral(
  client: Client,
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

  const parentSig = await signTypedData(client, {
    domain: parentTypedData.domain,
    types: parentTypedData.types,
    message: parentTypedData.message,
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
      register: [
        { name: 'once', type: 'address' },
        { name: 'deadline', type: 'uint256' },
        { name: 'price', type: 'uint256' },
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
      deadline: BigInt(deadline),
      price: 0n,
    },
  } as const

  return parentTypedData
}
