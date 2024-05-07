export interface ISwapParams {
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  addressTo: `0x${string}`
  wrappedNativeToken?: `0x${string}`
  inputBigNumber: bigint
  minOutput: bigint
}

export interface ISwapMultipleHopsParams {
  swapPath: `0x${string}`[]
  addressTo: `0x${string}`
  wrappedNativeToken: `0x${string}`
  inputBigNumber: bigint
  minOutput: bigint
}
