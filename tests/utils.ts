import type { Abi } from 'abitype'
import {
  Account,
  Address,
  createPublicClient,
  createTestClient,
  encodeFunctionData,
  http,
  publicActions,
  SimulateContractParameters,
  walletActions,
  WriteContractParameters,
} from 'viem'
import { mnemonicToAccount, parseAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

import { prepareApproveToken } from '@/actions'
import AuthFaucet from '@/constants/abis/AuthFaucet'

import { TEST_CHAIN_ID, TEST_CONFIG, TEST_PORT } from './config'

export const anvilSepolia = sepolia

export const publicClientSepolia = createPublicClient({
  chain: { ...anvilSepolia, id: TEST_CHAIN_ID },
  transport: http(`http://0.0.0.0:${TEST_PORT}/0`),
})

export const testClientSepolia = createTestClient({
  chain: { ...anvilSepolia, id: TEST_CHAIN_ID },
  mode: 'anvil',
  account: mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 0 }),
  transport: http(`http://0.0.0.0:${TEST_PORT}/0`),
})
  .extend(walletActions)
  .extend(publicActions)

export function createMockingClient(account: Account) {
  return createTestClient({
    chain: { ...anvilSepolia, id: TEST_CHAIN_ID },
    mode: 'anvil',
    transport: http(`http://0.0.0.0:${TEST_PORT}/0`),
    account,
  })
    .extend(walletActions)
    .extend(publicActions)
}

export async function sendTestTransaction<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string = string,
>({ ...args }: SimulateContractParameters<TAbi, TFunctionName>) {
  const publicClient = publicClientSepolia
  const testClient = testClientSepolia

  const { request, result } = await publicClient.simulateContract(
    args as unknown as SimulateContractParameters<TAbi, TFunctionName>,
  )
  const account = parseAccount(request.account)
  const params = request as unknown as WriteContractParameters

  // We simply pretend that the simulation is always correct. This is not going to work outside of a pristine, isolated, test environment.
  const hash = await testClient.sendUnsignedTransaction({
    from: account.address,
    to: params.address,
    data: encodeFunctionData(params),
    ...(params.value === undefined ? {} : { value: params.value }),
    ...(params.nonce === undefined ? {} : { nonce: params.nonce }),
    ...(params.gas === undefined ? {} : { gas: params.gas }),
    ...(params.gasPrice === undefined ? {} : { gas: params.gasPrice }),
    ...(params.accessList === undefined ? {} : { accessList: params.accessList }),
    ...(params.maxFeePerGas === undefined ? {} : { maxFeePerGas: params.maxFeePerGas }),
    ...(params.maxPriorityFeePerGas === undefined
      ? {}
      : { maxPriorityFeePerGas: params.maxPriorityFeePerGas }),
  })

  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  return { request, result, receipt, hash }
}

export async function claimAgentAndToken(account: Account) {
  try {
    await sendTestTransaction({
      account: account,
      address: TEST_CONFIG.faucet,
      abi: AuthFaucet,
      functionName: 'claimAgent',
    })
    await sendTestTransaction({
      account: account,
      address: TEST_CONFIG.faucet,
      abi: AuthFaucet,
      functionName: 'claimToken',
    })
  } catch (error) {
    console.log(error)
    // ignore
  }
}
const targetAllowance = 10000000000000000000000000000n

export async function approveToken(
  account: Account,
  token: Address,
  spenderAddress: Address,
) {
  try {
    await sendTestTransaction({
      account,
      address: token,
      ...prepareApproveToken(testClientSepolia, {
        spenderAddress,
        allowance: targetAllowance,
      }),
    })
  } catch (error) {
    //
  }
}
