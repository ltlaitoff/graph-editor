import { Node } from '../models/Node.ts'
import { sleep } from '../helpers'
import { DELAY } from '../config/delay.ts'
import { Graph } from '../models/Graph.ts'

export class NodesByDeepLevel {
	graph: Graph
	render: () => void

	constructor(graph: Graph, render: () => void) {
		this.graph = graph
		this.render = render
	}

	async getNodesByDeepLevel(
		node: Node,
		visited: Node[],
		id: number,
		maxLevel = 2,
		level = 0
	) {
		if (level > maxLevel) return []

		visited.push(node)

		node.status = 'progress'

		this.render()

		await sleep(DELAY)

		const result: (string | null)[] = []

		for (const edge of node.edges) {
			if (this.graph.mode === 'directed' && edge.status === 'no-direction') {
				continue
			}

			if (visited.includes(edge.adjacentNode)) {
				continue
			}

			if (window.algorithmActiveId !== id) {
				return
			}

			const nodes = await this.getNodesByDeepLevel(
				edge.adjacentNode,
				visited,
				id,
				maxLevel,
				level + 1
			)

			if (nodes === undefined) {
				continue
			}

			result.push(...nodes)
		}

		return [node.value, ...result].flat()
	}
}
