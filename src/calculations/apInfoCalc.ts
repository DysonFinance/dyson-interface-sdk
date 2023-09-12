import { formatUnits, parseUnits } from 'viem'

import { WeiPerEther } from '@/constants'

import { sqrt } from './commonCalc'

export const calcSwappedAmount = (
  depositAmount: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  calcFeeValue: bigint,
) => {
  const fee = (depositAmount * calcFeeValue) / 2n ** 64n
  const inputWithFee = depositAmount - fee
  return (inputWithFee * outputReserve) / (inputReserve + inputWithFee)
}

export const calcMinOutput = (
  swappedAmount: bigint,
  slippage: string,
  decimals: number,
) => {
  return (
    swappedAmount -
    (swappedAmount * parseUnits(slippage, decimals)) / parseUnits('1', decimals)
  )
}

export const calcLocalAP = (
  inputTokenAmount: bigint,
  virtualSwapOutputAmount: bigint,
  premium: number,
  boosting: number,
) => {
  return parseFloat(
    formatUnits(
      (((sqrt(inputTokenAmount * virtualSwapOutputAmount) *
        parseUnits(premium.toFixed(10), 18)) /
        WeiPerEther) *
        parseUnits((1 + boosting).toFixed(10), 18)) /
        WeiPerEther,
      18,
    ),
  )
}

export const calcMarginLocalSP = (
  fairPrice: bigint,
  premium: number,
  baseTokenPrice: number,
  combineTokenDecimals: number,
  boosting: number,
) => {
  if (baseTokenPrice === 0) {
    return 0
  }
  const result =
    (((sqrt(fairPrice * parseUnits('1', combineTokenDecimals)) *
      (WeiPerEther + parseUnits(boosting.toFixed(4), 18))) /
      parseUnits(baseTokenPrice.toFixed(4), 18)) *
      parseUnits(premium.toFixed(4), 18)) /
    WeiPerEther /
    parseUnits('1', 9) // remove fairPriceBn decimal (is 18 decimals bn)

  return parseFloat(formatUnits(result, 18))
}

// {
//   console.log(token1 / token0, token0Price)
//   return (Math.sqrt(token1 / token0) / token0Price) * premium * (1 + boosting)
// }

export const calcTornadoMargin = (reserve: number, weight: number) => {
  return (reserve / weight) * Math.log(2)
}

export const localAPToGlobalAP = (
  localApAmount: number,
  gaugePoolReserve: number,
  gaugePoolW: number,
) => {
  const globalApAmount =
    gaugePoolReserve * (1 - Math.pow(2, -(localApAmount / gaugePoolW)))
  return globalApAmount
}

export const globalApToGOV = (
  apAmount: number,
  reserveGlobal: number,
  globalW: number,
) => {
  const govAmount = reserveGlobal * (1 - Math.pow(2, -(apAmount / globalW)))
  return govAmount
}

export const calcDepositToGov = (
  inputTokenAmount: bigint,
  virtualSwapOutputAmount: bigint,
  premium: number,
  boosting: number,
  gaugePoolReserve: number,
  gaugePoolW: number,
  reserveGlobal: number,
  globalW: number,
) => {
  const localAp = calcLocalAP(
    inputTokenAmount,
    virtualSwapOutputAmount,
    premium,
    boosting,
  )
  // console.log(localAp.toString(), 'localAp with premium:', premium)
  // console.log(gaugePoolW.toString())
  const globalAp = localAPToGlobalAP(localAp, gaugePoolReserve, gaugePoolW)
  // console.log(globalAp, 'globalAp with premium:', premium)

  return globalApToGOV(globalAp, reserveGlobal, globalW)
}

export const calcGovCurrentPrice = (
  govAmount: number,
  reserveUSD: number,
  reserveGOV: number,
) => {
  const priceGOV = reserveUSD / reserveGOV
  return govAmount * priceGOV
}

export const getCurrentReserve = (
  rewardRate: number,
  lastReserve: number,
  lastUpdateTime: number,
) => {
  return (~~(Date.now() / 1000) - lastUpdateTime) * rewardRate + lastReserve
}
