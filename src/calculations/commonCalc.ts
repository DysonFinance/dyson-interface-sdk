export const sqrt = (x: bigint): bigint => {
  let z = x / 2n + 1n
  let y = x
  while (z < y) {
    y = z
    z = (x / z + z) / 2n
  }
  return y
}
