import type { IPairInfoGraph } from '@/calculations/multiHopsSwapCalc'

export function dijkstra(graph: IPairInfoGraph, startNode: string, endNode: string) {
  const distances: { [key: string]: number } = {}
  const visited = new Set()
  const nodes = Object.keys(graph)

  // Initially, set the shortest distance to every node as Infinity
  for (const node of nodes) {
    distances[node] = Number.POSITIVE_INFINITY
  }

  const prevNodes: { [key: string]: string | undefined } = {}
  for (const node of nodes) {
    prevNodes[node] = undefined
  }

  // The distance from the start node to itself is 0
  distances[startNode] = 0

  while (nodes.length) {
    nodes.sort((a, b) => distances[a] - distances[b])
    const closestNode = nodes.shift()
    if (!closestNode || distances[closestNode] === Number.POSITIVE_INFINITY) break
    visited.add(closestNode)

    for (const neighbor in graph[closestNode]) {
      if (!visited.has(neighbor)) {
        const newDistance = distances[closestNode] + graph[closestNode][neighbor]
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance
          prevNodes[neighbor] = closestNode
        }
      }
    }
  }

  const shortestPath = [endNode]
  let targetNode = endNode
  while (targetNode !== startNode) {
    const prevNode = prevNodes[targetNode]
    if (prevNode) {
      shortestPath.unshift(prevNode)
      targetNode = prevNode
    }
  }

  return shortestPath
}
