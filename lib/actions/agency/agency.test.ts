import { describe, expect, it } from 'vitest'
import {
  sendTestTransaction,
  testChildSepolia,
  testClientSepolia,
} from '../../../tests/utils'
import { signReferral } from './generateReferral'
import { TimeUnits } from '@/constants'
import { TEST_CHAIN_ID, TEST_CONFIG } from '../../../tests/config'
import { Address } from 'viem'
import { buildReferralCode } from '@/agency'
import {
  VerifyErrorOption,
  isReferral,
  prepareOneTimeCodes,
  prepareRegister,
  validateReferral,
} from './register'
import { prepareAgencyInfo, prepareAgencyWhois } from './getWhois'

describe('agency referral code test', () => {
  it('create code and verify', async () => {
    const result = await signReferral(
      testClientSepolia,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency as Address,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const code = buildReferralCode(result)
    const referralStatus = await validateReferral(
      code,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency as Address,
    )
    expect(referralStatus).not.toBe(VerifyErrorOption.INVALID_INPUT)
    expect(referralStatus).not.toBe(VerifyErrorOption.EXPIRED_REFERRAL_CODE)
  })

  it('encode decode', async () => {
    const result = await signReferral(
      testClientSepolia,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency as Address,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const TestToken = buildReferralCode(result)
    const usedToken = await validateReferral(
      TestToken,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency as Address,
    )
    const isToken = isReferral(usedToken)
    expect(isToken).toBe(true)
  })

  it('check code on chain inused', async () => {
    const result = await signReferral(
      testClientSepolia,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency as Address,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const [oneTimeCode] = await testClientSepolia.multicall({
      contracts: prepareOneTimeCodes([result.onceAddress], TEST_CONFIG.agency as Address),
    })
    expect(oneTimeCode.result).toStrictEqual(false)
  })

  it('agent whois', async () => {
    const [parentAgent, childAgent] = await testClientSepolia.multicall({
      contracts: [
        {
          ...prepareAgencyWhois(testClientSepolia.account.address),
          address: TEST_CONFIG.agency as Address,
        },
        {
          ...prepareAgencyWhois(testChildSepolia.account.address),
          address: TEST_CONFIG.agency as Address,
        },
      ],
    })
    expect(parentAgent.result).not.toBe(0n)
    expect(childAgent.result).toBe(0n)
  })

  it('agent info', async () => {
    const [_, gen] = await testClientSepolia.readContract({
      ...prepareAgencyInfo(testClientSepolia.account.address),
      address: TEST_CONFIG.agency as Address,
    })

    expect(gen).toBe(1n)
  })

  it('agent submitting', async () => {
    const result = await signReferral(
      testClientSepolia,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency as Address,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )
    const { request } = await testChildSepolia.simulateContract({
      ...(await prepareRegister(testChildSepolia, {
        ...result,
        contractAddress: TEST_CONFIG.agency as Address,
        chainId: TEST_CHAIN_ID,
      })),
      address: TEST_CONFIG.agency as Address,
      account: testChildSepolia.account,
    })
    await sendTestTransaction({
      ...request,
      network: 'sepolia',
    })
    
  })
})
