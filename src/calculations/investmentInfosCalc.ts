import { formatUnits, parseUnits } from 'viem'

import { WeiPerEther } from '@/constants'
import { INTEGER_UNIT_BN } from '@/constants'
import { DysonPair } from '@/entities/dysonPair'
import { PoolToken } from '@/entities/poolToken'

import { divu, exp_2, mulu } from './abdkMath64x64'
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
  depositAmount: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  calcFeeValue: bigint,
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

export const calcFairPriceBigInt = (
  quoteTokenFee: bigint,
  opponentTokenFee: bigint,
  quoteTokenReserve: bigint,
  opponentTokenReserve: bigint,
  quoteTokenDecimal: number,
  opponentTokenDecimal: number,
) => {
  const reasonableBaseFee = (quoteTokenFee * WeiPerEther) / INTEGER_UNIT_BN
  const reasonableOpponentFee = (opponentTokenFee * WeiPerEther) / INTEGER_UNIT_BN

  const opponentUnit = parseUnits('1', opponentTokenDecimal)
  const baseUnit = parseUnits('1', quoteTokenDecimal)
  const result =
    (quoteTokenReserve *
      opponentUnit *
      WeiPerEther *
      sqrt((WeiPerEther - reasonableBaseFee) * WeiPerEther)) /
    (opponentTokenReserve *
      sqrt((WeiPerEther - reasonableOpponentFee) * WeiPerEther) *
      baseUnit)
  return result // 1e18 format
}

export const calcPremium = (volatility: number, daySecond: number) => {
  return volatility * Math.sqrt(daySecond / (365.25 * 86400)) * 0.4
}

export const calcFeeWrapped = (lastFee: bigint, pastTime: bigint, halfLife: bigint) => {
  return calcFee(lastFee, pastTime, halfLife) || lastFee
}

export const calcFairPriceByPairInfoBigInt = <T extends string>(
  dysonPair: DysonPair,
  quoteToken: string,
  poolToken: PoolToken<T>,
) => {
  const calcFee0 = dysonPair
    ? calcFeeWrapped(
        dysonPair.fee0,
        BigInt(Math.floor(Date.now() / 1000) - dysonPair.timeStamp0),
        dysonPair.halfLife,
      )
    : 0n // Initialize with 0n for bigint

  const calcFee1 = dysonPair
    ? calcFeeWrapped(
        dysonPair.fee1,
        BigInt(Math.floor(Date.now() / 1000) - dysonPair.timeStamp1),
        dysonPair.halfLife,
      )
    : 0n // Initialize with 0n for bigint

  const [token0Data, token1Data] = dysonPair
    ? [
        poolToken.getPoolTokenDataType(dysonPair.token0Address),
        poolToken.getPoolTokenDataType(dysonPair.token1Address),
      ]
    : [null, null] // Initialize with null

  return quoteToken === '1'
    ? calcFairPriceBigInt(
        calcFee1,
        calcFee0,
        BigInt(dysonPair.token1Amount),
        BigInt(dysonPair.token0Amount),
        token1Data?.decimals || 18,
        token0Data?.decimals || 18,
      )
    : calcFairPriceBigInt(
        calcFee0,
        calcFee1,
        BigInt(dysonPair.token0Amount),
        BigInt(dysonPair.token1Amount),
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
  calcFeeValue: bigint,
  calcFeeDecimals = 18,
) => {
  if (isNaN(Number(inputAmount)) || inputAmount == 0) {
    return 0
  }
  const reasonableFee = parseFloat(
    formatUnits((calcFeeValue * WeiPerEther) / INTEGER_UNIT_BN, calcFeeDecimals),
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
