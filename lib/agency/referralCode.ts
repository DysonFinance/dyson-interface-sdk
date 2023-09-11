import { IReferralCodeItem } from '@/entities/referral'
import { atob, btoa } from '@/utils/buffer'

export const buildReferralCode = (
  referralCode: Pick<IReferralCodeItem, 'parentSig' | 'onceKey' | 'deadline'>,
) => {
  const searchParam = new URLSearchParams()
  searchParam.set('parent', referralCode.parentSig)
  searchParam.set('key', referralCode.onceKey)
  searchParam.set('deadline', referralCode.deadline.toString())
  return btoa(searchParam.toString())
}

export const parseReferralCode = (referralCodeString: string) => {
  const PARENT_SIG_PARAMETER = 'parent'
  const ONCE_KEY_PARAMETER = 'key'
  const DEADLINE_PARAMETER = 'deadline'
  const referralCodeSearchParams = new URLSearchParams(atob(referralCodeString))

  const parentSig = referralCodeSearchParams.get(PARENT_SIG_PARAMETER)
  const onceKey = referralCodeSearchParams.get(ONCE_KEY_PARAMETER)
  const deadline = referralCodeSearchParams.get(DEADLINE_PARAMETER)
  return { parentSig, onceKey, deadline }
}
