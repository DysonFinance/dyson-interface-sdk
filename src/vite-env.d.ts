interface ImportMetaEnv {
  VITE_APP_TEST_RPC: string
  VITE_APP_TEST_START_PORT: number
  VITE_APP_TEST_CHAIN_ID: number
  VITE_SEPOLIA_NETWORK_CONFIG: string
  VITE_PRIVATE_KEY: string
}

interface ImportMeta {
  env: ImportMetaEnv
  url: string
}
