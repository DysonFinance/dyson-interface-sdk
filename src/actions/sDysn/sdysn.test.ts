import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, sendTestTransaction, testClientSepolia } from '@tests/utils'
import { describe, expect, it } from 'vitest'

import { TimeUnits } from '@/constants'
import Dyson from '@/constants/abis/Dyson'
import { getVaultCount, getVaults } from '@/reads/getStakingVault'

import { prepareUnstake } from './redeem'
import { getStakeGasFee, prepareStake } from './stake'

let savedAmount = 0n

describe('sdysn test', () => {
  const lockDYSN = 100000n
  it('stake test', async () => {
    savedAmount = await publicClientSepolia.readContract({
      ...getVaultCount(testClientSepolia.account.address),
      address: TEST_CONFIG.sDyson,
    })

    await sendTestTransaction({
      network: 'sepolia',
      ...{
        abi: Dyson,
        address: TEST_CONFIG.dyson,
        functionName: 'approve',
        args: [TEST_CONFIG.sDyson, lockDYSN],
        account: testClientSepolia.account,
      },
    })

    const { result: resultOfStake } = await sendTestTransaction({
      network: 'sepolia',
      ...{
        ...prepareStake(
          testClientSepolia.account.address,
          lockDYSN,
          30 * TimeUnits.Minute,
        ),
        address: TEST_CONFIG.sDyson,
        gas: await getStakeGasFee(
          testClientSepolia,
          TEST_CONFIG.sDyson,
          testClientSepolia.account.address,
          testClientSepolia.account.address,
          lockDYSN,
          30 * TimeUnits.Minute,
        ),
        account: testClientSepolia.account,
      },
    })
    console.log(resultOfStake)

    const vaultsAmount = await publicClientSepolia.readContract({
      ...getVaultCount(testClientSepolia.account.address),
      address: TEST_CONFIG.sDyson,
    })

    console.log(vaultsAmount)
    expect(vaultsAmount).not.toBe(savedAmount)
    savedAmount = vaultsAmount
  })

  it('redeem', async () => {
    const vaults = await getVaults(
      publicClientSepolia,
      TEST_CONFIG.sDyson,
      testClientSepolia.account.address,
      Number(savedAmount),
    )
    console.log(vaults)
    expect(vaults[Number(savedAmount) - 1].result![0]).toBe(lockDYSN)
    await testClientSepolia.increaseTime({
      seconds: 4 * TimeUnits.Year,
    })
    await testClientSepolia.mine({
      blocks: 1,
    })
    console.log((await testClientSepolia.getBlock()).timestamp)
    console.log(vaults[Number(savedAmount) - 1].result![1])
    await sendTestTransaction({
      ...prepareUnstake(
        testClientSepolia.account.address,
        Number(savedAmount) - 1,
        vaults[Number(savedAmount) - 1].result![1],
      ),
      account: testClientSepolia.account,
      address: TEST_CONFIG.sDyson,
      network: 'sepolia',
    })
    const vaults2 = await getVaults(
      publicClientSepolia,
      TEST_CONFIG.sDyson,
      testClientSepolia.account.address,
      Number(savedAmount),
    )
    expect(vaults2[Number(savedAmount) - 1].result?.[0]).toBe(0n)
    expect(vaults2[Number(savedAmount) - 1].result?.[1]).toBe(0n)
  })
})
