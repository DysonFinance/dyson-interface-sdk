import { expect, it } from 'vitest'

import { getMultiHopsSwappedAmount, getShortestSwapPath } from './multiHopsSwapCalc'

const graph = {
  ETH: { USDC: 1, USDT: 4 },
  USDC: { ETH: 1, OKB: 1, DYSN: 1, MATIC: 1 },
  OKB: { USDC: 1, DYSN: 1 },
  DYSN: { USDC: 1, OKB: 1, USDT: 1 },
  MATIC: { USDC: 1, USDT: 1 },
  USDT: { DYSN: 1, MATIC: 1, ETH: 4 },
}

it('getShortestSwapPath', () => {
  expect(getShortestSwapPath(graph, 'ETH', 'USDT')).toStrictEqual([
    'ETH',
    'USDC',
    'DYSN',
    'USDT',
  ])

  expect(getShortestSwapPath(graph, 'ETH', 'DYSN')).toStrictEqual(['ETH', 'USDC', 'DYSN'])
})

// test for getMultiHopsSwappedAmount
const depositAmount = 100_000000_000000_000000n

const sortedCrossPoolSwapPairInfos = [
  {
    // pool 1
    feeValue: 0n,
    inputReserve: 1000000_000000_000000_000000n,
    outputReserve: 1000000_000000_000000_000000n,
  },
  {
    // pool 2
    feeValue: 0n,
    inputReserve: 1000000_000000_000000_000000n,
    outputReserve: 1000000_000000_000000_000000n,
  },
]

it('getMultiHopsSwappedAmount', () => {
  expect(getMultiHopsSwappedAmount(sortedCrossPoolSwapPairInfos, depositAmount)).toBe(
    99980003999200159968n,
  )
})
