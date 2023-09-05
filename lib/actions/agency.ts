import { parseReferralCode } from '@/agency'
import { ChainId } from '@/constants'
import { hashTypedData, recoverAddress } from 'viem'
import { Address, privateKeyToAddress } from 'viem/accounts'
export enum VerifyErrorOption {
  UNKNOWN,
  EXPIRED_REFERRAL_CODE,
  INVALID_INPUT,
  CODE_IN_USED,
  NOT_YET,
  NO_EMPTY_SLOT,
}

function getParentNodeAddressByReferralCode(
  chainId: ChainId,
  parentSig: string,
  onceKey: string,
  deadline: string,
  agencyContractAddress: string,
) {
  const address = privateKeyToAddress(onceKey as Address)
  const parentDigest = getParentDigest(
    chainId,
    agencyContractAddress,
    address,
    parseInt(deadline),
  )
  const parentAddress = recoverAddress({
    hash: parentDigest,
    signature: parentSig as Address,
  })
  return { parentAddress, onceAddress: address }
}

export function register() {}
export function validateReferral(
  token: string,
  chainId: ChainId,
  agencyContractAddress: Address,
) {
  if (!token) return false
  const { parentSig, onceKey, deadline } = parseReferralCode(token)
  const isExpired = !!deadline && parseInt(deadline) * 1000 < Date.now()
  if (!(parentSig && onceKey && deadline)) {
    return VerifyErrorOption.INVALID_INPUT
  }
  if (isExpired) {
    return VerifyErrorOption.EXPIRED_REFERRAL_CODE
  }
  return getParentNodeAddressByReferralCode(
    chainId,
    parentSig,
    onceKey,
    deadline,
    agencyContractAddress,
  )
}
export function getParentDigest(
  chainId: ChainId,
  agencyAddress: string,
  onceAddress: string,
  deadline: number,
) {
  const parentTypedData = hashTypedData({
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      register: [
        { name: 'once', type: 'address' },
        { name: 'deadline', type: 'uint256' },
        { name: 'price', type: 'uint256' },
      ],
    },
    primaryType: 'register' as const,
    domain: {
      name: 'Dyson Agency',
      version: '1',
      chainId: BigInt(chainId),
      verifyingContract: agencyAddress as Address,
    },
    message: {
      once: onceAddress as Address,
      deadline: BigInt(deadline),
      price: 0n,
    },
  })

  return parentTypedData
}
