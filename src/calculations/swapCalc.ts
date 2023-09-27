import { parseUnits } from 'viem'

import { WeiPerEther } from '@/constants'

const bigInt264 = 18446744073709551616n // 2n ** 64n

const maxIterations = 100
export const calcNewtonDerivativeReciprocal = (
  depositAmount: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  calcFeeValue: bigint,
) => {
  const fee = (depositAmount * calcFeeValue) / bigInt264
  const dInputWithFee = WeiPerEther - (WeiPerEther * calcFeeValue) / bigInt264

  const inputWithFee = depositAmount - fee
  const dOutput =
    (outputReserve * (inputReserve - inputWithFee)) / (inputReserve + inputWithFee)

  // origin dInputWithFee.mul(dOutput).div(WeiPerEther).div(inputReserve.add(inputWithFee))
  return (
    (WeiPerEther * (inputReserve + inputWithFee) * WeiPerEther) /
    (dInputWithFee * dOutput)
  )
}

const calcNewtonInput = (
  initialInputGuess: bigint,
  guessOutAmount: bigint,
  outputReserve: bigint,
  inputReserve: bigint,
  calcFeeValue: bigint,
  passTolerance?: bigint,
) => {
  let inputGuess = initialInputGuess
  const tolerance = passTolerance ?? guessOutAmount / 1000000n

  for (let index = 0; index < maxIterations; index++) {
    const difference =
      calcSwappedAmount(inputGuess, inputReserve, outputReserve, calcFeeValue) -
      guessOutAmount // base is output

    const absDiffer = difference > 0n ? difference : -difference

    if (absDiffer <= tolerance) {
      break
    }

    inputGuess =
      inputGuess -
      (difference *
        calcNewtonDerivativeReciprocal(
          inputGuess,
          inputReserve,
          outputReserve,
          calcFeeValue,
        )) /
        WeiPerEther
  }
  return inputGuess
}

export const calcSwappedInputAmount = (
  guessOutAmount: bigint,
  outputReserve: bigint,
  inputReserve: bigint,
  calcFeeValue: bigint,
) => {
  const pureInputGuess = (guessOutAmount * inputReserve) / outputReserve

  return calcNewtonInput(
    pureInputGuess,
    guessOutAmount,
    outputReserve,
    inputReserve,
    calcFeeValue,
  )
}

export const calcSwappedAmount = (
  depositAmount: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  calcFeeValue: bigint,
) => {
  const fee = (depositAmount * calcFeeValue) / bigInt264
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
