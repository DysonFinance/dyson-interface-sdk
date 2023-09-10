import { describe, expect, it } from 'vitest'
import {
  publicClientSepolia,
  testChildSepolia,
  testClientSepolia,
} from '../../../tests/utils'
import { signReferral } from './generateReferral'
import { ChainId, TimeUnits } from '@/constants'
import { TEST_CHAIN_ID, TEST_CONFIG } from '../../../tests/config'
import { Address, decodeFunctionData } from 'viem'
import { buildReferralCode } from '@/agency'
import {
  VerifyErrorOption,
  decodeAgencyOneTimeCodesCallData,
  encodeRegister,
  isReferral,
  queryAgencyOneTimeCodesCallData,
  validateReferral,
} from './register'
import Agency from '@/constants/abis/Agency'
import { sepolia } from 'viem/chains'
import { multicallDecode, multicallEncode } from '@/utils/multicall'
import { decodeAgencyWhoisData, queryAgencyWhoisData } from './getWhois'

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
    let encodeData = [] as string[]
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
    if (!isToken) return
    try {
      encodeData = queryAgencyOneTimeCodesCallData([usedToken.onceAddress])
    } catch (error) {
      expect(error).not.throw()
    }
    const firstData = encodeData.at(0) as `0x${string}`
    const { functionName, args } = decodeFunctionData({ abi: Agency, data: firstData })
    expect(functionName).toBe('oneTimeCodes')
    expect(args).deep.eq([usedToken.onceAddress])
  })

  it('check code on chain inused', async () => {
    const result = await signReferral(
      testClientSepolia,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency as Address,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const encodeData = queryAgencyOneTimeCodesCallData([result.onceAddress])

    const { data } = await testClientSepolia.call({
      data: multicallEncode(
        encodeData.map((hash) => ({
          target: TEST_CONFIG.agency as Address,
          callData: hash,
        })),
      ),
      to: sepolia.contracts.multicall3.address,
    })
    expect(
      decodeAgencyOneTimeCodesCallData([...multicallDecode(data!)![1]]),
    ).toStrictEqual([false])
  })
  it('agent whois', async () => {
    // guarantee the account is agency
    // guarantee the account is not agency
    const resultData = await testClientSepolia.call({
      data: multicallEncode([
        {
          target: TEST_CONFIG.agency as Address,
          callData: queryAgencyWhoisData(testClientSepolia.account.address),
        },
        {
          target: TEST_CONFIG.agency as Address,
          callData: queryAgencyWhoisData(testChildSepolia.account.address),
        },
      ]),
      to: sepolia.contracts.multicall3.address,
    })

    const [parentAgent, childAgent] = [...multicallDecode(resultData.data!)![1]]

    expect(decodeAgencyWhoisData(parentAgent)).not.toBe(0n)
    expect(decodeAgencyWhoisData(childAgent)).toBe(0n)
  })

  it('agent submitting', async () => {
    const result = await signReferral(
      testClientSepolia,
      TEST_CHAIN_ID,
      TEST_CONFIG.agency as Address,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const hash = await testChildSepolia.sendUnsignedTransaction({
      from: testChildSepolia.account.address,
      to: TEST_CONFIG.agency as Address,
      data: await encodeRegister(testChildSepolia, {
        ...result,
        agencyAddress: TEST_CONFIG.agency as Address,
        chainId: TEST_CHAIN_ID,
        registerAddress: testChildSepolia.account.address,
      }),
    })

    const receipt = await testChildSepolia.waitForTransactionReceipt({ hash })
    console.log(receipt)
    expect(receipt.status).toBe('success')
  })
})
