import { Node } from '../models/Node.ts'
import { Graph } from '../models/Graph.ts'

export class BellmanFord {
	graph: Graph

	constructor(graph: Graph) {
		this.graph = graph
	}

	async bellmanFord(startNode: Node) {
		const distances = new Map<Node, number>()

		for (const node of this.graph.graph.values()) {
			distances.set(node, Infinity)
		}

		distances.set(startNode, 0)

		for (let i = 0; i < this.graph.graph.size; i++) {
			for (const currentNode of [...this.graph.graph.values()]) {
				for (const edge of currentNode.edges) {
					if (
						this.graph.mode === 'directed' &&
						edge.status === 'no-direction'
					) {
						continue
					}

					const newDistance = distances.get(currentNode)! + edge.weight

					if (newDistance < distances.get(edge.adjacentNode)!) {
						distances.set(edge.adjacentNode, newDistance)
					}
				}
			}
		}

		for (const currentNode of this.graph.graph.values()) {
			if (currentNode === startNode) {
				continue
			}

			for (const edge of currentNode.edges) {
				if (this.graph.mode === 'directed' && edge.status === 'no-direction') {
					continue
				}

				if (
					distances.get(currentNode)! + edge.weight <
					distances.get(edge.adjacentNode)!
				) {
					console.error('Graph contains a negative cycle.')
					return
				}
			}
		}

		return distances
	}
}
