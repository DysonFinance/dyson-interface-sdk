import { accountManager } from '@tests/accounts'
import { TEST_CHAIN_ID, TEST_CONFIG } from '@tests/config'
import {
  claimAgentAndToken,
  publicClientSepolia,
  sendTestTransaction,
  testClientSepolia,
} from '@tests/utils'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { TimeUnits } from '@/constants'
import { getAgentInfo } from '@/reads/getAgencyInfo'
import { getAgencyWhois } from '@/reads/getAgencyWhois'
import { getReferralCodeUsed } from '@/reads/getReferralCodeUsed'

import { prepareSign, signReferral } from './generateReferral'
import { buildReferralCode } from './referralCode'
import {
  isReferral,
  prepareRegister,
  validateReferral,
  VerifyErrorOption,
} from './register'

describe.only('agency referral code test', async () => {
  let [parent, child, simulateChild] = await Promise.all([
    accountManager.getAccount(),
    privateKeyToAccount(generatePrivateKey()),
    privateKeyToAccount(generatePrivateKey()),
  ])
  beforeAll(async () => {
    await claimAgentAndToken(parent)
    await testClientSepolia.setBalance({
      address: child.address,
      value: 1000000000000000000n,
    })
    await testClientSepolia.setBalance({
      address: simulateChild.address,
      value: 1000000000000000000n,
    })
  })
  afterAll(async () => {
    accountManager.release(parent)
  })
  it.concurrent('create code and verify', async () => {
    const result = await signReferral(
      testClientSepolia,
      parent,
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
      parent,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const TestToken = buildReferralCode(result)
    const usedToken = await validateReferral(TestToken, TEST_CHAIN_ID, TEST_CONFIG.agency)
    const isToken = isReferral(usedToken)
    expect(isToken).toBe(true)
    if (isReferral(usedToken)) {
      expect(usedToken.parentAddress).toBe(parent.address)
    } else {
      expect(false).toBe(true)
    }
  })

  it.concurrent('check code on chain inused', async () => {
    const result = await signReferral(
      testClientSepolia,
      parent,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )
    const oneTimeCode = await getReferralCodeUsed(
      publicClientSepolia,
      [result.onceAddress],
      TEST_CONFIG.agency,
    )
    expect(oneTimeCode[0].result).toStrictEqual(false)
  })

  let agentId = 0n

  it.only('agent submitting', async () => {
    // faucet member
    agentId = await testClientSepolia.readContract({
      ...getAgencyWhois(parent.address),
      address: TEST_CONFIG.agency,
    })
    expect(agentId).not.toBe(0n)
    console.log(agentId)
    const token = await signReferral(
      testClientSepolia,
      parent,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    await sendTestTransaction({
      ...(await prepareRegister(testClientSepolia, {
        deadline: Number(token.deadline),
        parentSig: token.parentSig! as `0x${string}`,
        onceKey: token.onceKey! as `0x${string}`,
        contractAddress: TEST_CONFIG.agency,
        chainId: TEST_CHAIN_ID,
      })),
      address: TEST_CONFIG.agency,
      account: child,
    })

    const register = await publicClientSepolia.readContract({
      ...getAgencyWhois(child.address),
      address: TEST_CONFIG.agency,
    })

    expect(register).not.toBe(0n)
  })

  it.skipIf(agentId === 0n).only('getAgent', async () => {
    const register = await publicClientSepolia.readContract({
      ...getAgencyWhois(parent.address),
      address: TEST_CONFIG.agency,
    })
    const result = await testClientSepolia.readContract({
      ...getAgentInfo(register),
      address: TEST_CONFIG.agency,
    })

    expect(result[0]).not.toBe('0x0000000000000000000000000000000000000000')
  })

  it.todo('simulate contract wallet sign', async () => {
    await claimAgentAndToken(parent)
    const token = await signReferral(
      testClientSepolia,
      parent,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
      true,
    )
    await sendTestTransaction({
      address: TEST_CONFIG.agency,
      account: parent,
      ...(await prepareSign(token.parentSig)),
    })

    await sendTestTransaction({
      ...(await prepareRegister(testClientSepolia, {
        deadline: Number(token.deadline),
        parentSig: parent.address,
        onceKey: token.onceKey! as `0x${string}`,
        contractAddress: TEST_CONFIG.agency,
        chainId: TEST_CHAIN_ID,
      })),
      address: TEST_CONFIG.agency,
      account: simulateChild,
    })

    const register = await publicClientSepolia.readContract({
      ...getAgencyWhois(simulateChild.address),
      address: TEST_CONFIG.agency,
    })

    expect(register).not.toBe(0n)
  })
})
