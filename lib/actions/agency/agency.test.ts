import { describe, expect, it } from 'vitest'
import { testClientSepolia } from '../../../tests/utils'
import { signReferral } from './generateReferral'
import { ChainId, TimeUnits } from '@/constants'
import { TEST_CONFIG } from '../../../tests/config'
import { Address, decodeFunctionData } from 'viem'
import { buildReferralCode } from '@/agency'
import {
  VerifyErrorOption,
  decodeInUsedCallData,
  encodeRegister,
  isReferral,
  queryInUsedCallData,
  validateReferral,
} from './register'
import Agency from '@/constants/abis/Agency'
import { sepolia } from 'viem/chains'
import { multicallDecode, multicallEncode } from '@/utils/multicall'

describe('agency referral code test', () => {
  it('create code and verify', async () => {
    const result = await signReferral(
      testClientSepolia,
      ChainId.SEPOLIA,
      TEST_CONFIG.agency as Address,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const code = buildReferralCode(result)
    const referralStatus = await validateReferral(
      code,
      ChainId.SEPOLIA,
      TEST_CONFIG.agency as Address,
    )
    expect(referralStatus).not.toBe(VerifyErrorOption.INVALID_INPUT)
    expect(referralStatus).not.toBe(VerifyErrorOption.EXPIRED_REFERRAL_CODE)
  })

  it('encode decode', async () => {
    let encodeData = [] as string[]
    const result = await signReferral(
      testClientSepolia,
      ChainId.SEPOLIA,
      TEST_CONFIG.agency as Address,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const TestToken = buildReferralCode(result)
    const usedToken = await validateReferral(
      TestToken,
      ChainId.SEPOLIA,
      TEST_CONFIG.agency as Address,
    )
    const isToken = isReferral(usedToken)
    expect(isToken).toBe(true)
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

  it('check code on chain inused', async () => {
    const result = await signReferral(
      testClientSepolia,
      ChainId.SEPOLIA,
      TEST_CONFIG.agency as Address,
      Math.floor(Date.now() / 1000) + 4 * TimeUnits.Day,
    )

    const multiResult = await testClientSepolia.multicall({
      contracts: [
        {
          abi: Agency,
          address: TEST_CONFIG.agency as Address,
          functionName: 'owner',
        },
      ],
    })

    console.log(multiResult[0])

    const encodeData = queryInUsedCallData([result.onceAddress])

    const { data } = await testClientSepolia.call({
      data: multicallEncode(
        encodeData.map((hash) => ({
          target: TEST_CONFIG.agency as Address,
          callData: hash,
        })),
      ),
      to: sepolia.contracts.multicall3.address,
    })

    console.log(decodeInUsedCallData([...multicallDecode(data!)![1]]))

    const preparedSendRegister = encodeRegister({
    })
  })
})
