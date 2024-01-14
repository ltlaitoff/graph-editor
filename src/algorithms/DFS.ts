import { Node } from '../models/Node.ts'
import { sleep, setNodeStatus } from '../helpers'
import { DELAY } from '../config/delay.ts'
import { Graph } from '../models/Graph.ts'

export class DFS {
	graph: Graph
	render: () => void

	constructor(graph: Graph, render: () => void) {
		this.graph = graph
		this.render = render
	}

	async dfsWrapper(id: number) {
		const visited: Node[] = []

		for (const item of this.graph.graph.values()) {
			if (!visited.includes(item)) {
				if (window.algorithmActiveId !== id) {
					return
				}

				await this.dfs(item, visited, id)
			}
		}

		this.render()
	}

	async dfs(node: Node, visited: Node[], id: number) {
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
				if (this.graph.mode === 'directed' && edge.status === 'no-direction') {
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
				this.render
			)

			await sleep(DELAY)
		}

		this.render()

		console.log('DFS:', jungle.map(item => item.value).join(', 	'))
	}
}
