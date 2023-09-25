import { type Address, getAbiItem, hashTypedData, Hex, type WalletClient } from 'viem'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'

import { ChainId } from '@/constants'
import { ABIAgency } from '@/constants/abis'
import { prepareFunctionParams } from '@/utils/viem'

export async function signReferral(
  client: WalletClient,
  chainId: ChainId,
  agencyAddress: Address,
  deadline: number,
  isUsedContractWallet = false,
) {
  const onceKey = generatePrivateKey()
  const onceAddress = privateKeyToAddress(onceKey)
  const parentTypedData = getParentTypedData(
    chainId,
    agencyAddress,
    onceAddress,
    deadline,
  )
  if (isUsedContractWallet) {
    return {
      parentSig: hashTypedData({ ...parentTypedData, primaryType: 'register' }),
      onceAddress,
      onceKey,
      deadline,
    }
  }
  const parentSig = await client.signTypedData({
    domain: parentTypedData.domain as any,
    types: parentTypedData.types,
    message: parentTypedData.message as any,
    account: client.account!,
    primaryType: 'register',
  })

  return { parentSig, onceAddress, onceKey, deadline }
}

/**
 * @desc This only used on contract wallet
 */
export async function prepareSign(parentSig: Hex) {
  return prepareFunctionParams({
    abi: getAbiItem({ abi: ABIAgency, name: 'sign' }),
    args: [parentSig],
  })
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
      chainId: BigInt(chainId),
      verifyingContract: agencyAddress as Address,
    },
    message: {
      once: onceAddress,
      deadline: deadline as any,
      price: 0 as any,
    },
  } as const

  return parentTypedData
}
