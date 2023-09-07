import { startProxy } from '@viem/anvil'
import { TEST_JSON_RPC, TEST_MENOMIC } from './config'
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
export default async function () {
  const proxy = await startProxy({
    port: 8545,
    options: {
      port: 8545,
      chainId: 11155111,
      timeout: 1_00_0000,
      forkUrl: TEST_JSON_RPC,
      forkBlockNumber: 3802888,
      mnemonic: TEST_MENOMIC,
    },
  })
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
  //   transport: http('http://0.0.0.0:8545/1')
  // })

  // console.log(await cli.getBlockNumber())

  return proxy
}
