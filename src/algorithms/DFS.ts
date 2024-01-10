import { Node } from '../models/Node.ts'
import { sleep, setNodeStatus } from '../helpers'
import { DELAY } from '../config/delay.ts'
import { Graph } from '../models/Graph.ts'

export class DFS {
	async dfsWrapper(id: number, graph: Graph, render: () => void) {
		const visited: Node[] = []

		for (const item of graph.graph.values()) {
			if (!visited.includes(item)) {
				if (window.algorithmActiveId !== id) {
					return
				}

				await this.dfs(item, visited, id, graph, render)
			}
		}

		render()
	}

	async dfs(
		node: Node,
		visited: Node[],
		id: number,
		graph: Graph,
		render: () => void
	) {
		const jungle: Node[] = []
		const stack = [node]

		while (stack.length > 0) {
			if (window.algorithmActiveId !== id) {
				return
			}

			const item = stack.pop()
			if (!item) return null

			visited.push(item)
			jungle.push(item)
			;[...item.edges].toReversed().forEach(edge => {
				if (graph.mode === 'directed' && edge.status === 'no-direction') {
					return
				}

				const adjacentNode = edge.adjacentNode

				if (!visited.includes(adjacentNode) && !stack.includes(adjacentNode)) {
					stack.push(adjacentNode)
				}
			})

			await setNodeStatus(
				item,
				{
					status: 'progress',
					sleep: false
				},
				render
			)

			await sleep(DELAY)
		}

		render()

		console.log('DFS:', jungle.map(item => item.value).join(', 	'))
	}
}
