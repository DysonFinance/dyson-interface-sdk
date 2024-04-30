import { calcSwappedAmount } from '@/calculations'
import { dijkstra } from '@/utils/dijkstra'

export interface IPairInfoGraph {
  [key: string]: { [key: string]: number }
}

export function getShortestSwapPath(
  pairInfoGraph: IPairInfoGraph,
  inputToken: string,
  outputToken: string,
) {
  return dijkstra(pairInfoGraph, inputToken, outputToken)
}

interface ICrossPoolSwapPairInfos {
  feeValue: bigint
  inputReserve: bigint
  outputReserve: bigint
}

export function getMultiHopsSwappedAmount(
  sortedCrossPoolSwapPairInfos: ICrossPoolSwapPairInfos[],
  depositAmount: bigint,
) {
  let swappedAmount = 0n
  sortedCrossPoolSwapPairInfos.forEach((pairInfo, index) => {
    swappedAmount = calcSwappedAmount(
      index === 0 ? depositAmount : swappedAmount,
      pairInfo.inputReserve,
      pairInfo.outputReserve,
      pairInfo.feeValue,
    )
  })

  return swappedAmount
}

export const calcMultiHopsPriceImpact = (
  inputAmount: number,
  swappedAmount: number,
  dryRunInputAmount: number,
  dryRunSwappedAmount: number,
) => {
  if (Number.isNaN(Number(inputAmount)) || inputAmount === 0) {
    return 0
  }
  const marginalPrice = dryRunSwappedAmount / dryRunInputAmount
  const priceAveraged = swappedAmount / inputAmount
  return priceAveraged / marginalPrice - 1
}
