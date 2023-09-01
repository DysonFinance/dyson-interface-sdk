import { BigNumber } from '@ethersproject/bignumber'
import { WeiPerEther } from '@ethersproject/constants'
import { Zero } from '@ethersproject/constants'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

import { getPoolTokenDataType } from '@/constants/swapPoolTokenConfig'
import { SwapPool } from '@/constants/types/swapPool'

import { INTEGER_UNIT_BN } from '../../constants/calc'
import { divu, exp_2, mulu } from '../abdkMath64x64'
import { calcSwappedAmount } from './apInfoCalc'
import { sqrt } from './commonCalc'

export const calcStrikePriceByAmount = (
  quoteTokenAmount: number,
  baseTokenAmount: number,
) => {
  if (quoteTokenAmount === 0) {
    return 0
  }
  return baseTokenAmount / quoteTokenAmount
}

export const calcStrikePrice = (
  depositAmountString: string,
  depositAmount: BigNumber,
  inputReserve: BigNumber,
  outputReserve: BigNumber,
  calcFeeValue: BigNumber,
) => {
  return (
    parseFloat(depositAmountString) /
    parseFloat(
      formatUnits(
        calcSwappedAmount(depositAmount, inputReserve, outputReserve, calcFeeValue),
        18,
      ),
    )
  )
}

export const calcFairPriceBigNumber = (
  quoteTokenFee: BigNumber,
  opponentTokenFee: BigNumber,
  quoteTokenReserve: BigNumber,
  opponentTokenReserve: BigNumber,
  quoteTokenDecimal: number,
  opponentTokenDecimal: number,
) => {
  const reasonableBaseFee = quoteTokenFee.mul(WeiPerEther).div(INTEGER_UNIT_BN)
  const reasonableOpponentFee = opponentTokenFee.mul(WeiPerEther).div(INTEGER_UNIT_BN)

  const opponentUnit = parseUnits('1', opponentTokenDecimal)
  const baseUnit = parseUnits('1', quoteTokenDecimal)
  const result = quoteTokenReserve
    .mul(opponentUnit)
    .mul(WeiPerEther)
    .mul(sqrt(WeiPerEther.sub(reasonableBaseFee).mul(WeiPerEther)))
    .div(
      opponentTokenReserve
        .mul(sqrt(WeiPerEther.sub(reasonableOpponentFee).mul(WeiPerEther)))
        .mul(baseUnit),
    )
  return result // 1e18 format
}

export const calcPremium = (volatility: number, daySecond: number) => {
  return volatility * Math.sqrt(daySecond / (365.25 * 86400)) * 0.4
}

export const calcFeeWrapped = (lastFee: bigint, pastTime: bigint, halfLife: bigint) => {
  return calcFee(lastFee, pastTime, halfLife) || lastFee
}

export const calcFairPriceByPoolInfoBigNumber = (
  swapPool: SwapPool,
  quoteToken: string,
) => {
  const calcFee0 = swapPool
    ? calcFeeWrapped(
        swapPool.fee0.toBigInt(),
        BigInt(~~(Date.now() / 1000) - swapPool.timeStamp0),
        swapPool.halfLife.toBigInt(),
      )
    : Zero

  const calcFee1 = swapPool
    ? calcFeeWrapped(
        swapPool.fee1.toBigInt(),
        BigInt(~~(Date.now() / 1000) - swapPool.timeStamp1),
        swapPool.halfLife.toBigInt(),
      )
    : Zero

  const [token0Data, token1Data] = swapPool
    ? [
        getPoolTokenDataType(swapPool.token0Address),
        getPoolTokenDataType(swapPool.token1Address),
      ]
    : []

  return quoteToken === '1'
    ? calcFairPriceBigNumber(
        BigNumber.from(calcFee1),
        BigNumber.from(calcFee0),
        swapPool.token1Amount,
        swapPool.token0Amount,
        token1Data?.decimals || 18,
        token0Data?.decimals || 18,
      )
    : calcFairPriceBigNumber(
        BigNumber.from(calcFee0),
        BigNumber.from(calcFee1),
        swapPool.token0Amount,
        swapPool.token1Amount,
        token0Data?.decimals || 18,
        token1Data?.decimals || 18,
      )
}

export const calcFee = (lastFee: bigint, pastTime: bigint, halfLife: bigint) => {
  const t = divu(pastTime, halfLife)
  if (!t) return null
  const r = exp_2(-t)
  if (!r) return null
  return mulu(r, lastFee)
}

export const calcPriceImpact = (
  inputAmount: number,
  swappedAmount: number,
  inputReserve: number,
  outputReserve: number,
  calcFeeValue: BigNumber,
) => {
  if (isNaN(inputAmount) || inputAmount === 0) {
    return 0
  }
  const reasonableFee = parseFloat(
    formatUnits(calcFeeValue.mul(WeiPerEther).div(INTEGER_UNIT_BN)),
  )
  const marginalPrice = (outputReserve * (1 - reasonableFee)) / inputReserve
  const priceAveraged = swappedAmount / inputAmount
  return priceAveraged / marginalPrice - 1
}

export const calcTvl = (
  reserve0: number,
  reserve1: number,
  price0: number,
  price1: number,
) => reserve0 * price0 + reserve1 * price1

export const calcRoi = (
  isJoinReferrerSystem?: boolean,
  investTokenValue?: number,
  premium?: number,
  govValue?: number,
) => {
  if (!isJoinReferrerSystem && premium) {
    return premium * 100
  }

  if (!investTokenValue || !premium || !govValue) {
    return undefined
  }

  if (investTokenValue - govValue <= 0) {
    return Infinity
  }

  return ((investTokenValue * (1 + premium)) / (investTokenValue - govValue) - 1) * 100
}

export const calcRoiByAmount = (investTokenValue?: number, returnTokenValue?: number) => {
  if (!investTokenValue || !returnTokenValue) {
    return 0
  }
  return ((returnTokenValue - investTokenValue) / investTokenValue) * 100
}

export const calcPcv = (
  token0Pcv: number,
  token1Pcv: number,
  price0: number,
  price1: number,
) => token0Pcv * price0 + token1Pcv * price1
