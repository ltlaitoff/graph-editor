import { Node } from '../models/Node.ts'
import { Graph } from '../models/Graph.ts'

export class FloydWarshall {
	graph: Graph

	constructor(graph: Graph) {
		this.graph = graph
	}

	floydWarshall(nodes: Node[]) {
		const numNodes = nodes.length

		const distances = Array.from({ length: numNodes }, () =>
			Array(numNodes).fill(Infinity)
		)

		nodes.forEach((node, i) => {
			distances[i][i] = 0

			node.edges.forEach(edge => {
				if (this.graph.mode === 'directed' && edge.status === 'no-direction') {
					return
				}

				const j = nodes.indexOf(edge.adjacentNode)

				distances[i][j] = edge.weight
			})
		})

		for (let i = 0; i < numNodes; i++) {
			for (let j = 0; j < numNodes; j++) {
				for (let k = 0; k < numNodes; k++) {
					if (distances[j][i] + distances[i][k] < distances[j][k]) {
						distances[j][k] = distances[j][i] + distances[i][k]
					}
				}
			}
		}

		nodes.forEach((nodeTop, i) => {
			nodes.forEach((nodeBottom, j) => {
				const result = distances[i][j]

				if (result === Infinity) return

				console.log(`${nodeTop.value} => ${nodeBottom.value}: ${result}`)
			})
		})

		return distances
	}
}
