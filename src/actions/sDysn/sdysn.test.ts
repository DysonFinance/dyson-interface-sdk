import { sendTestTransaction, testClientSepolia } from '@tests/utils'
import { describe, it } from 'vitest'
import { getStakeGasFee, prepareStake } from './stake'
import { TimeUnits } from '@/constants'
import { TEST_CONFIG } from '@tests/config'
import Dyson from '@/constants/abis/Dyson';

describe('sdysn test', () => {
  it('stake test', async () => {
    console.log(TEST_CONFIG.dyson)
    const userBalance = await testClientSepolia.simulateContract({
      abi: Dyson,
      address: TEST_CONFIG.dyson,
      functionName: 'approve',
      args: [TEST_CONFIG.sDyson, 10000000n],
    })
    await sendTestTransaction({
      network: 'sepolia',
      ...userBalance.request,
    })
    const stakeResult = await testClientSepolia.simulateContract({
      ...prepareStake(testClientSepolia.account.address, 10000n, 30 * TimeUnits.Minute),
      address: TEST_CONFIG.sDyson,
      gas: await getStakeGasFee(
        testClientSepolia,
        TEST_CONFIG.sDyson,
        testClientSepolia.account.address,
        testClientSepolia.account.address,
        10000n,
        30 * TimeUnits.Minute,
      ),
    })

    const { result } = await sendTestTransaction({
      network: 'sepolia',
      ...stakeResult.request,
    })

    console.log(result)
  })
})
