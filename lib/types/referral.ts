import { ChainId } from '../constants/chain';

export interface IReferralCodeItem {
  onceAddress: string
  onceKey: string
  deadline: number
  chainId: ChainId
  parentSig: string
  used: boolean
}