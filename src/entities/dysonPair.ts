export interface DysonPair {
  pairAddress: string
  basis: bigint
  fee0: bigint
  fee1: bigint
  timeStamp0: number
  timeStamp1: number
  halfLife: bigint
  token0Address: string
  token1Address: string
  token0Amount: bigint
  token1Amount: bigint
  noteCount: number | undefined
  farmPoolInfo: PoolStruct
}

export interface PoolStruct {
  weight: bigint
  rewardRate: bigint
  lastUpdateTime: bigint
  lastReserve: bigint
  gauge: string
  isPool?: boolean
}

export interface DysonPoolConfig {
  pairAddress: `0x${string}`
  token0Address: `0x${string}`
  token1Address: `0x${string}`
}
