import { BigNumber } from '@ethersproject/bignumber'

export const sqrt = (x: BigNumber): BigNumber => {
  let z = x.div(2).add(1)
  let y = x
  while (z.lt(y)) {
    y = z
    z = x.div(z).add(z).div(2)
  }
  return y
}
