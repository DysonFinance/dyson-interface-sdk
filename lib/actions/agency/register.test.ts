import { ChainId } from '@/constants'
import { describe, expect, test } from 'vitest'
import { VerifyErrorOption, isReferral, queryInUsedCallData, validateReferral } from './register'
import { decodeFunctionData } from 'viem'
import Agency from '@/constants/abis/Agency'

// Expire at 2023-09-08 08:58
const TestToken =
  'cGFyZW50PTB4Mzc5MDA4NDlmNGI2ZWZhYzQ0YWFmZDUwNmE0M2IxMjQ4N2NjNzIyYTYwN2Q5MGUxY2RlZTZmZTY3NmFmOGZkMzJjN2UxNmRiZGM3YjQ0ZDgxZTk5MTc5M2JmY2IxMTk3MTM5ZjAwY2U3MWFiMDNmZWIxYzA4NDE2NzNjY2Y5YzExYiZrZXk9MHg0NDg1Mzk5ODRkMTYxNjFiODYyYmQ2Mjc2ZmM0MzA5ZTAxNDAxNGM0OTMxNGViYzAyY2Q4MmVlYTM3NGE3ODFjJmRlYWRsaW5lPTE2OTQxNzc5Mzc='
const TestChain = ChainId.SEPOLIA
const TestAgencyContract = '0x4FCB36e205Da8C9940Db28ACD55dbe0becdc1638'

describe('Register test', () => {
  test('validateReferral', async () => {
    const result = await validateReferral(TestToken, TestChain, TestAgencyContract)
    expect(result).not.toBe(VerifyErrorOption.INVALID_INPUT)
    expect(result).not.toBe(VerifyErrorOption.EXPIRED_REFERRAL_CODE)
  })

  test('encode decode', async () => {
    let encodeData = [] as string[]
    const usedToken = await validateReferral(TestToken, TestChain, TestAgencyContract)
    const isToken = isReferral(usedToken)
    expect(isToken)
      .toBe(true)
    if (!isToken) return
    try {
      encodeData = queryInUsedCallData([usedToken.onceAddress])
    } catch (error) {
      expect(error).not.throw()
    }
    const firstData = encodeData.at(0) as `0x${string}`
    const { functionName, args } = decodeFunctionData({ abi: Agency, data: firstData })
    expect(functionName).toBe('oneTimeCodes')
    expect(args).deep.eq([usedToken.onceAddress])
  })
})
