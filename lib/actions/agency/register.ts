import { parseReferralCode } from '@/agency'
import { ChainId } from '@/constants'
import Agency from '@/constants/abis/Agency'
import {
  type WalletClient,
  decodeFunctionResult,
  encodeFunctionData,
  hashTypedData,
  isAddress,
  recoverAddress,
} from 'viem'
import { type Address, privateKeyToAddress } from 'viem/accounts'

type Resolve<T> = T extends Promise<infer G> ? G : never

export enum VerifyErrorOption {
  UNKNOWN,
  EXPIRED_REFERRAL_CODE,
  INVALID_INPUT,
  CODE_IN_USED,
  NOT_YET,
  NO_EMPTY_SLOT,
}

export function queryInUsedCallData(referralCodes: Address[]): Address[] {
  const filteredCode = referralCodes.filter(isAddress)
  if (!filteredCode.length) return []
  return filteredCode.map((referralCode) => {
    return encodeFunctionData({
      abi: Agency,
      functionName: 'oneTimeCodes',
      args: [referralCode],
    })
  })
}

export async function encodeRegister(
  client: WalletClient,
  args: {
    chainId: ChainId
    agencyAddress: Address
    registerAddress: Address
    parentSig: Address
    deadline: bigint
  },
) {
  const registerDigest = getOnceTypedData(
    args.chainId,
    args.agencyAddress,
    args.registerAddress,
  )
  const registerSig = await client.signTypedData({
    ...registerDigest,
    account: args.registerAddress,
    primaryType: 'register',
  })
  return encodeFunctionData({
    abi: Agency,
    functionName: 'register',
    args: [args.parentSig, registerSig, args.deadline],
  })
}

export function decodeInUsedCallData(result: Address[]): boolean[] {
  return result.map((hash) => {
    return decodeFunctionResult({ abi: Agency, functionName: 'oneTimeCodes', data: hash })
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

async function getParentNodeAddressByReferralCode(
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
