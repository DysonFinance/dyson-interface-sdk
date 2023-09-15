export interface IDepositParams {
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  addressTo: `0x${string}`
  wrappedNativeToken?: `0x${string}`
  inputBigNumber: bigint
  minOutput: bigint
  duration: number
}
