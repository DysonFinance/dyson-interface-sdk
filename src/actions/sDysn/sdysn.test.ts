import { TEST_CONFIG } from '@tests/config'
import { publicClientSepolia, sendTestTransaction, testClientSepolia } from '@tests/utils'
import { maxUint256 } from 'viem'
import { describe, expect, it } from 'vitest'

import { TimeUnits } from '@/constants'
import Dyson from '@/constants/abis/Dyson'
import { getVaultCount, getVaults } from '@/reads/getStakingVault'

import { getUnstakeGasFee, prepareUnstake } from './redeem'
import { prepareRestake } from './restake'
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
        args: [TEST_CONFIG.sDyson, maxUint256],
        account: testClientSepolia.account,
      },
    })

    await sendTestTransaction({
      network: 'sepolia',
      ...{
        ...prepareStake({
          to: testClientSepolia.account.address,
          tokenAmount: lockDYSN,
          stakeTime: 30 * TimeUnits.Day,
        }),
        address: TEST_CONFIG.sDyson,
        gas: await getStakeGasFee({
          client: testClientSepolia,
          contractAddress: TEST_CONFIG.sDyson,
          userAddress: testClientSepolia.account.address,
          to: testClientSepolia.account.address,
          tokenAmount: lockDYSN,
          stakeTime: 30 * TimeUnits.Day,
        }),
        account: testClientSepolia.account,
      },
    })

    const vaultsAmount = await publicClientSepolia.readContract({
      ...getVaultCount(testClientSepolia.account.address),
      address: TEST_CONFIG.sDyson,
    })

    expect(vaultsAmount).not.toBe(savedAmount)
    savedAmount = vaultsAmount
  })
  const appendingLock = 50n
  it('restake', async () => {
    await sendTestTransaction({
      ...prepareRestake({
        index: Number(savedAmount) - 1,
        tokenAmount: appendingLock,
        stakeTime: 30 * TimeUnits.Day + 10,
      }),
      account: testClientSepolia.account,
      address: TEST_CONFIG.sDyson,
      network: 'sepolia',
    })
  })

  it('redeem', async () => {
    const vaults = await getVaults(
      publicClientSepolia,
      TEST_CONFIG.sDyson,
      testClientSepolia.account.address,
      Number(savedAmount),
    )
    expect(vaults[Number(savedAmount) - 1].result![0]).toBe(lockDYSN + appendingLock)
    await testClientSepolia.increaseTime({
      seconds: 4 * TimeUnits.Year,
    })
    await testClientSepolia.mine({
      blocks: 1,
    })
    const args = {
      to: testClientSepolia.account.address,
      index: Number(savedAmount) - 1,
      sDYSNAmount: vaults[Number(savedAmount) - 1].result![1],
    }
    await sendTestTransaction({
      ...prepareUnstake(args),
      gas: await getUnstakeGasFee({
        client: testClientSepolia,
        ...args,
        contractAddress: TEST_CONFIG.sDyson,
        userAddress: testClientSepolia.account.address,
      }),
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
