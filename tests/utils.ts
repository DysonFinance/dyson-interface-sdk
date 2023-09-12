import type { Abi } from 'abitype'
import {
  createPublicClient,
  createTestClient,
  encodeFunctionData,
  http,
  parseUnits,
  publicActions,
  SimulateContractParameters,
  walletActions,
  WriteContractParameters,
} from 'viem'
import { mnemonicToAccount, parseAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

import { TEST_CHAIN_ID } from './config'

export const anvilSepolia = sepolia

export const publicClientSepolia = createPublicClient({
  chain: { ...anvilSepolia, id: TEST_CHAIN_ID },
  transport: http(`http://0.0.0.0:8545/1`),
})

export const testClientSepolia = createTestClient({
  chain: { ...anvilSepolia, id: TEST_CHAIN_ID },
  mode: 'anvil',
  account: mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 1 }),
  transport: http(`http://0.0.0.0:8545/1`),
})
  .extend(walletActions)
  .extend(publicActions)

export const testChildSepolia = createTestClient({
  chain: { ...anvilSepolia, id: TEST_CHAIN_ID },
  mode: 'anvil',
  account: mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 3 }),
  transport: http(`http://0.0.0.0:8545/1`),
})
  .extend(walletActions)
  .extend(publicActions)

testClientSepolia.setBalance({
  address: testClientSepolia.account.address,
  value: parseUnits('1000000', 18),
})

testChildSepolia.setBalance({
  address: testClientSepolia.account.address,
  value: parseUnits('1000000', 18),
})

export async function sendTestTransaction<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string = string,
>({
  network,
  ...args
}: SimulateContractParameters<TAbi, TFunctionName> & { network: 'sepolia' }) {
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
