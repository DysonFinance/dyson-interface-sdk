function formatNumberWithCommas(n: number) {
  const parts = n.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

const percentageFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatNumber(amount: number | string | undefined, toFixedValue?: number) {
  const processAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (processAmount == null || isNaN(processAmount)) {
    return '-'
  } else {
    return typeof toFixedValue === 'number'
      ? formatNumberWithCommas(parseFloat(processAmount.toFixed(toFixedValue)))
      : formatNumberWithCommas(processAmount)
  }
}

export function getCommonDecimal(amount: number) {
  if (amount < 0.01) return 8
  if (amount < 1) return 6
  if (amount < 10) return 5
  if (amount < 100) return 4
  if (amount < 1000) return 3
  return 2
}

export function formatCommonNumber(amount: number | string | undefined) {
  const processAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (processAmount == null || isNaN(processAmount)) {
    return '-'
  }
  if (processAmount === 0) return '0'
  if (processAmount < 0.000001) return '<0.000001'
  return formatNumber(processAmount, getCommonDecimal(processAmount))
}

export function formatPercentageNumber(amount: number | string | undefined) {
  const processAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (processAmount == null || isNaN(processAmount)) {
    return '-'
  }

  if (processAmount === 0) return '0'
  if (Math.abs(processAmount) < 0.01) {
    return processAmount < 0 ? '< -0.01' : '<0.01'
  }
  if (processAmount < 0) return percentageFormatter.format(processAmount)

  if (processAmount > 1000000) return '>1,000k'
  if (processAmount > 10000) return `${percentageFormatter.format(processAmount / 1000)}k`

  return percentageFormatter.format(processAmount)
}

export const cutInputToDecimal = (input: string, decimals?: number) => {
  if (!decimals) {
    return input
  }
  const inputArray = input.split('.')
  if (!inputArray[1]) {
    return input
  }
  const newInput = inputArray[0] + '.' + inputArray[1].slice(0, decimals)
  return newInput
}
