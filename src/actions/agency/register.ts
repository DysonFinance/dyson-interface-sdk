import {
  getAbiItem,
  Hash,
  hashTypedData,
  isAddress,
  recoverAddress,
  size,
  type WalletClient,
} from 'viem'
import { type Address, privateKeyToAccount, privateKeyToAddress } from 'viem/accounts'

import { ChainId } from '@/constants'
import Agency from '@/constants/abis/Agency'
import { prepareFunctionParams } from '@/utils/viem'

import { parseReferralCode } from './referralCode'

type Resolve<T> = T extends Promise<infer G> ? G : never

export enum VerifyErrorOption {
  UNKNOWN,
  EXPIRED_REFERRAL_CODE,
  INVALID_INPUT,
  CODE_IN_USED,
  NOT_YET,
  NO_EMPTY_SLOT,
}

export function prepareOneTimeCodes(onceAddress: Address[], agencyAddress: Address) {
  return onceAddress.map(
    (ele) =>
      ({
        ...prepareFunctionParams({
          abi: getAbiItem({ abi: Agency, name: 'oneTimeCodes' }),
          args: [ele],
        }),
        address: agencyAddress,
      }) as const,
  )
}

export async function prepareRegister(
  client: WalletClient,
  args: {
    chainId: ChainId
    contractAddress: Address
    onceKey: Address
    parentSig: Hash
    deadline: number
  },
) {
  const wallet = privateKeyToAccount(args.onceKey)
  const registerDigest = getOnceTypedData(
    args.chainId,
    args.contractAddress,
    client.account!.address,
  )

  const registerSig = await wallet.signTypedData({
    message: registerDigest.message,
    types: registerDigest.types,
    domain: registerDigest.domain as any,
    primaryType: 'register',
  })

  return prepareFunctionParams({
    abi: getAbiItem({
      abi: Agency,
      name: 'register',
    }),
    args: [args.parentSig, registerSig, BigInt(args.deadline)],
  })
}

export function isReferral(
  input: Resolve<ReturnType<typeof validateReferral>>,
): input is { parentAddress: Address; onceAddress: Address } {
  if (input === false) return false
  if (typeof input === 'number') return false
  return true
}

export async function validateReferral(
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

function getParentDigest(
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
        { name: 'deadline', type: 'uint' },
        { name: 'price', type: 'uint' },
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
      deadline: BigInt(deadline) as any,
      price: 0n as any,
    },
  })

  return parentTypedData
}

async function getParentNodeAddressByReferralCode(
  chainId: ChainId,
  parentSig: string,
  onceKey: string,
  deadline: string,
  agencyContractAddress: string,
): Promise<{ parentAddress: Address; onceAddress: Address }> {
  const address = privateKeyToAddress(onceKey as Address)
  if (size((parentSig as Address) || '0x') == 20 && isAddress(parentSig)) {
    return { parentAddress: parentSig, onceAddress: address }
  }
  const parentDigest = getParentDigest(
    chainId,
    agencyContractAddress,
    address,
    parseInt(deadline),
  )
  const parentAddress = await recoverAddress({
    hash: parentDigest,
    signature: parentSig as Address,
  })
  return { parentAddress, onceAddress: address }
}

function getOnceTypedData(
  chainId: ChainId,
  agencyAddress: Address,
  childAddress: Address,
) {
  const registerTypedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      register: [{ name: 'child', type: 'address' }],
    },
    domain: {
      name: 'Dyson Agency',
      version: '1',
      chainId: chainId,
      verifyingContract: agencyAddress,
    },
    message: {
      child: childAddress,
    },
  } as const

  return registerTypedData
}
