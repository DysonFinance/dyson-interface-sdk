import { calcSwappedAmount, calcSwappedInputAmount } from '@/calculations'
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

export interface ICrossPoolSwapPairInfos {
  outputFeeValue: bigint
  feeValue: bigint
  inputReserve: bigint
  outputReserve: bigint
}

export function getMultiHopsSwappedAmount(
  sortedCrossPoolSwapPairInfos: ICrossPoolSwapPairInfos[],
  depositAmount: bigint,
) {
  return sortedCrossPoolSwapPairInfos.reduce((phasedSwapOutput, currentValue) => {
    return calcSwappedAmount(
      phasedSwapOutput,
      currentValue.inputReserve,
      currentValue.outputReserve,
      currentValue.feeValue,
    )
  }, depositAmount)
}

export function getMultiHopsSwappedInput(
  sortedCrossPoolSwapPairInfos: ICrossPoolSwapPairInfos[],
  expectedOutput: bigint,
) {
  return sortedCrossPoolSwapPairInfos.slice().reduce((phasedSwapResult, currentValue) => {
    return calcSwappedInputAmount(
      phasedSwapResult,
      currentValue.inputReserve,
      currentValue.outputReserve,
      currentValue.outputFeeValue,
    )
  }, expectedOutput)
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
