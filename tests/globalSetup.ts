import { createPool, startProxy } from '@viem/anvil'

import { TEST_CHAIN_ID, TEST_JSON_RPC, TEST_MENOMIC, TEST_PORT } from './config'
import { claimAgentAndToken, testClientSepolia } from './utils'
export default async function () {
  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString())
    return int ?? this.toString()
  }
  const proxy = await startProxy({
    port: TEST_PORT,
    host: '127.0.0.1',
    pool: createPool({ instanceLimit: 10 }),
    options: {
      chainId: TEST_CHAIN_ID,
      timeout: 1_00_0000,
      forkUrl: TEST_JSON_RPC,
      mnemonic: TEST_MENOMIC,
      accounts: 10,
    },
  })
  claimAgentAndToken(testClientSepolia.account)
  // var myHeaders = new Headers()
  // myHeaders.append('Content-Type', 'application/json')

  // var raw = JSON.stringify({
  //   method: 'eth_chainId',
  //   params: [],
  //   id: 1,
  //   jsonrpc: '2.0',
  // })

  // var requestOptions = {
  //   method: 'POST',
  //   headers: myHeaders,
  //   body: raw,
  //   redirect: 'follow',
  // }

  // fetch('http://127.0.0.1:8545/0', requestOptions)
  //   .then((response) => response.text())
  //   .then((result) => console.log(result))
  //   .catch((error) => console.log('error', error))

  // const cli = createPublicClient({
  //   chain: sepolia,
  //   transport: http('http://0.0.0.0:8545/0')
  // })

  // console.log(await cli.getBlockNumber())

  return proxy
}
