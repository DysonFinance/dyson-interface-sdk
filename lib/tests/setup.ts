import { startProxy } from '@viem/anvil'
export default async function () {
  return await startProxy({
    port: 8787,
    options: {
      forkUrl: import.meta.env.VITE_APP_TEST_RPC,
      forkBlockNumber: 3802888
    }
  })
}
