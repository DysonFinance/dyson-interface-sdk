import { TEST_CONFIG } from '../../tests/config'
import { ChainId } from './chain'

// TODO Should check the address when deploy
export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '',
  [ChainId.POLYGON]: '',
  [ChainId.FANTOM]: '',
  [ChainId.SEPOLIA]: TEST_CONFIG.router,
}

export const WRAPPED_NATIVE_TOKEN = {
  [ChainId.MAINNET]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [ChainId.POLYGON]: '',
  [ChainId.FANTOM]: '',
  [ChainId.SEPOLIA]: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
}
