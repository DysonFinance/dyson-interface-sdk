import type { Address } from 'viem'

enum PoolTokenType {
  USDC = 'USDC',
  DAI = 'DAI',
  USDT = 'USDT',
  WETH = 'WETH',
  WBTC = 'WBTC',
  DYSN = 'DYSN',
}

export interface IMainAddressesConfig {
  agency: Address
  dyson: string
  sDyson: string
  pairFactory: string
  router: string
  farm: string
  wrappedNativeToken: string
  tokens: { [baseToken in PoolTokenType]?: string }
  baseTokenPair: { [baseToken in PoolTokenType]?: string }
}

export const TEST_CONFIG: IMainAddressesConfig = JSON.parse(
  import.meta.env.VITE_SEPOLIA_NETWORK_CONFIG,
)

export const TEST_JSON_RPC = import.meta.env.VITE_APP_TEST_RPC
export const TEST_MENOMIC = import.meta.env.VITE_PRIVATE_KEY
export const TEST_PORT = import.meta.env.VITE_APP_TEST_START_PORT
export const TEST_CHAIN_ID = import.meta.env.VITE_APP_TEST_CHAIN_ID
