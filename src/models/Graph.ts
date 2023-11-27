import { Edge } from './Edge'
import { Node } from './Node'

class Graph {
	graph = new Map<number, Node>()

	addOrGetNode(
		graph: Map<number, Node>,
		value: number,
		x?: number,
		y?: number
	) {
		if (value === -1) return null
		if (graph.has(value)) return graph.get(value) as Node

		const node: Node = new Node(value, x, y)
		graph.set(value, node)

		return node
	}

	createGraph(
		graphData: {
			from: number
			to: number
			weight: number
			x: number
			y: number
		}[]
	) {
		const newGraph = new Map<number, Node>()

		for (const row of graphData) {
			const node = this.addOrGetNode(newGraph, row.from)
			if (!node) continue

			node.x = row.x
			node.y = row.y

			const adjuacentNode = this.addOrGetNode(newGraph, row.to)

			if (adjuacentNode === null) continue

			const edge = new Edge(adjuacentNode, row.weight)
			node?.edges.add(edge)
		}

		return newGraph
	}
}

export { Graph }
