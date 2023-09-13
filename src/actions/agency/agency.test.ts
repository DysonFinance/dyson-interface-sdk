import { TEST_CHAIN_ID, TEST_CONFIG } from '@tests/config'
import {
  publicClientSepolia,
  sendTestTransaction,
  testChildSepolia,
  testClientSepolia,
} from '@tests/utils'
import { describe, expect, it } from 'vitest'

import { TimeUnits } from '@/constants'
import { prepareGetAgent } from '@/reads/getAgencyInfo'
import { prepareAgencyWhois } from '@/reads/getAgencyWhois'

import { signReferral } from './generateReferral'
import { buildReferralCode } from './referralCode'
import {
  isReferral,
  prepareOneTimeCodes,
  prepareRegister,
  validateReferral,
  VerifyErrorOption,
} from './register'

describe.concurrent('agency referral code test', () => {
  it.concurrent('create code and verify', async () => {
    const result = await signReferral(
      testClientSepolia,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const code = buildReferralCode(result)
    const referralStatus = await validateReferral(code, TEST_CHAIN_ID, TEST_CONFIG.agency)
    expect(referralStatus).not.toBe(VerifyErrorOption.INVALID_INPUT)
    expect(referralStatus).not.toBe(VerifyErrorOption.EXPIRED_REFERRAL_CODE)
  })

  it.concurrent('encode decode', async () => {
    const result = await signReferral(
      testClientSepolia,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const TestToken = buildReferralCode(result)
    const usedToken = await validateReferral(TestToken, TEST_CHAIN_ID, TEST_CONFIG.agency)
    const isToken = isReferral(usedToken)
    expect(isToken).toBe(true)
    if (isReferral(usedToken)) {
      expect(usedToken.parentAddress).toBe(testClientSepolia.account.address)
    }
  })

  it.concurrent('check code on chain inused', async () => {
    const result = await signReferral(
      testClientSepolia,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const [oneTimeCode] = await testClientSepolia.multicall({
      contracts: prepareOneTimeCodes([result.onceAddress], TEST_CONFIG.agency),
    })
    expect(oneTimeCode.result).toStrictEqual(false)
  })

  it('agent submitting', async () => {
    // test token cGFyZW50PTB4N2NhNjFhZTQxM2Q4N2M0ZGJkZDQ1MzM2OTkzZjBmMWM2ZWI1MWViYWM2ODA3NDA3MTFlMjk0ODgyZDU0MTg0OTQ5Y2IwMTFlZWZiNjU5YzMyNDlhYzhkYzA0OWJiYzIyZWVmMzVjNzQwNTAwNzQyZDBkNDkyNzQxOWEzMzQwOGIxYiZrZXk9MHg5MGE3NTM0YWZiODNjZDcxN2IwYjk3OTcwZTYzNWYyOTliOTYwZTcwNGRmNDA1NTU1ZDhkOWJkZTIzMjhhMGNjJmRlYWRsaW5lPTE2OTQ1OTc2Nzg=
    const token = await signReferral(
      testClientSepolia,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )
    const { request } = await testChildSepolia.simulateContract({
      ...(await prepareRegister(testChildSepolia, {
        deadline: Number(token.deadline),
        parentSig: token.parentSig! as `0x${string}`,
        onceKey: token.onceKey! as `0x${string}`,
        contractAddress: TEST_CONFIG.agency,
        chainId: TEST_CHAIN_ID,
      })),
      address: TEST_CONFIG.agency,
      account: testChildSepolia.account,
    })
    await sendTestTransaction({
      ...request,
      network: 'sepolia',
    })

    const register = await publicClientSepolia.readContract({
      ...prepareAgencyWhois(testChildSepolia.account.address),
      address: TEST_CONFIG.agency,
    })

    expect(register).not.toBe(0n)
  })

  it.concurrent('getAgent', async () => {
    const register = await publicClientSepolia.readContract({
      ...prepareAgencyWhois(testClientSepolia.account.address),
      address: TEST_CONFIG.agency,
    })
    const result = await testClientSepolia.readContract({
      ...prepareGetAgent(register),
      address: TEST_CONFIG.agency,
    })

    expect(result[0]).not.toBe('0x0000000000000000000000000000000000000000')
  })
})
