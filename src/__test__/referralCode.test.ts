import { describe, expect, it } from 'vitest'

import { buildReferralCode, parseReferralCode } from '@/actions/agency/referralCode'
import { TimeUnits } from '@/constants/timeUnits'

const test = {
  parentSig: 'parentSig',
  onceKey: 'onceKey',
  deadline: Math.floor(Date.now() / 1000 + TimeUnits.Day),
}

describe.concurrent('referralCode', () => {
  it('buildReferralCode can be decode by parseReferralCode', () => {
    const referralCode = buildReferralCode(test)
    const parsed = parseReferralCode(referralCode)
    expect(parsed).toEqual({ ...test, deadline: test.deadline.toString() })
  })
})
