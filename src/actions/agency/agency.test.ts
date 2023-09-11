import { describe, expect, it } from 'vitest'
import {
  publicClientSepolia,
  sendTestTransaction,
  testChildSepolia,
  testClientSepolia,
} from '../../../tests/utils'
import { signReferral } from './generateReferral'
import { TimeUnits } from '@/constants'
import { TEST_CHAIN_ID, TEST_CONFIG } from '../../../tests/config'
import { buildReferralCode, parseReferralCode } from '@/agency'
import {
  VerifyErrorOption,
  isReferral,
  prepareOneTimeCodes,
  prepareRegister,
  validateReferral,
} from './register'
import { prepareAgencyInfo, prepareAgencyWhois } from './getWhois'
import { Address } from 'viem';

describe('agency referral code test', () => {
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
    } else {
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

  it.concurrent('agent whois', async () => {
    const [parentAgent, childAgent] = await testClientSepolia.multicall({
      contracts: [
        {
          ...prepareAgencyWhois(testClientSepolia.account.address),
          address: TEST_CONFIG.agency,
        },
        {
          ...prepareAgencyWhois(testChildSepolia.account.address),
          address: TEST_CONFIG.agency,
        },
      ],
    })
    expect(parentAgent.result).not.toBe(0n)
    expect(childAgent.result).toBe(0n)
  })

  it.concurrent('agent info', async () => {
    const [_, gen] = await testClientSepolia.readContract({
      ...prepareAgencyInfo(testClientSepolia.account.address),
      address: TEST_CONFIG.agency,
    })

    expect(gen).toBe(1n)
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

    expect(register)
      .not.toBe(0n)
  })
})
