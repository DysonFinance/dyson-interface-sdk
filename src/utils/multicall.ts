import { Address, decodeFunctionResult, encodeFunctionData } from 'viem'

const multicallAbi = [
  {
    constant: true,
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
        ],
        internalType: 'struct Multicall.Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
      {
        internalType: 'bytes[]',
        name: 'returnData',
        type: 'bytes[]',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const

export function multicallEncode(callData: { target: Address; callData: Address }[]) {
  return encodeFunctionData({
    abi: multicallAbi,
    functionName: 'aggregate',
    args: [callData],
  })
}
export function multicallDecode(resultData: Address) {
  return decodeFunctionResult({
    abi: multicallAbi,
    data: resultData,
    functionName: 'aggregate',
  })
}
