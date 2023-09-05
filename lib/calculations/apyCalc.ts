const YEAR_DAYS_SECONDS = 365.25 * 86400
const WEEK_SECONDS = 86400 * 7

export const calcPremiumApy = (
  premium: number,
  depositTokenValue: number,
  govValue: number,
  daySecond: number,
) =>
  (1 + (depositTokenValue * premium) / (depositTokenValue - govValue)) **
    (YEAR_DAYS_SECONDS / daySecond) -
  1

export const calcPurePremiumApy = (premium: number, daySecond: number) =>
  calcPremiumApy(premium, 1, 0, daySecond)

export const calcPremiumApyByNote = (
  claimTokenValue: number,
  basicTokenValue: number,
  daySecond: number,
) => {
  return (claimTokenValue / basicTokenValue) ** (YEAR_DAYS_SECONDS / daySecond) - 1
}

export const calcGovApy = (
  depositTokenValue: number,
  govValue: number,
  daySecond: number,
) =>
  (depositTokenValue / (depositTokenValue - govValue)) **
    (YEAR_DAYS_SECONDS / daySecond) -
  1

export const calcPremiumApr = (
  premium: number,
  depositTokenValue: number,
  govValue: number,
  daySecond: number,
) => {
  if (depositTokenValue - govValue < 0) {
    return Infinity
  }
  return (
    ((depositTokenValue * premium) / (depositTokenValue - govValue)) *
    (YEAR_DAYS_SECONDS / daySecond)
  )
}

export const calcTotalApr = (
  premium: number,
  depositTokenValue: number,
  govValue: number,
  daySecond: number,
) => {
  if (depositTokenValue - govValue < 0) {
    return Infinity
  }

  return (
    ((depositTokenValue * (1 + premium)) / (depositTokenValue - govValue) - 1) *
    (YEAR_DAYS_SECONDS / daySecond)
  )
}

export const calcPurePremiumApr = (premium: number, daySecond: number) =>
  calcPremiumApr(premium, 1, 0, daySecond)

export const calcPremiumAprByNote = (
  claimTokenValue: number,
  basicTokenValue: number,
  daySecond: number,
) => {
  return (claimTokenValue / basicTokenValue - 1) * (YEAR_DAYS_SECONDS / daySecond)
}

export const calcGovApr = (
  depositTokenValue: number,
  govValue: number,
  daySecond: number,
) => {
  if (depositTokenValue - govValue < 0) return Infinity
  return (
    (depositTokenValue / (depositTokenValue - govValue) - 1) *
    (YEAR_DAYS_SECONDS / daySecond)
  )
}

export const calcSponsorWeeklyApr = (
  nextWeekSponsorValue: number,
  poolSdysnValue: number,
) => {
  if (poolSdysnValue === 0) {
    return 0
  }
  const x = nextWeekSponsorValue / poolSdysnValue
  return x * (YEAR_DAYS_SECONDS / WEEK_SECONDS) * 100
}
