import { IAgencyGen } from '@/entities/agency'
import { between } from '@/utils/between'
import { last } from '@/utils/last'

export function getMediumGen(nodeList: IAgencyGen[]) {
  let current = nodeList[1]
  if (!current) return 1
  let sum = 0

  const listOfRange: ((arg: number) => boolean)[] = []

  for (let i = 2; nodeList[i]; current = nodeList[i], i++) {
    // current * 3 - next nodes
    const _currentOrder = current!.count * 3 - nodeList[i].count
    listOfRange.push(between(sum, (sum += _currentOrder)))
  }
  listOfRange.push(
    (
      (sum: number) => (n) =>
        n >= sum
    )(sum),
  )

  sum += last(nodeList)!.count * 3
  const midNumber = sum / 2
  const id = listOfRange.findIndex((fn) => fn(midNumber))

  return id + 2
}
