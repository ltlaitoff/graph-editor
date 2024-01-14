import { Node } from '../models/Node.ts'
import { sleep, setNodeStatus } from '../helpers'
import { DELAY } from '../config/delay.ts'
import { Graph, GraphValue } from '../models/Graph.ts'

class TreeNode {
	value: GraphValue
	childrens: TreeNode[] = []

	constructor(value: GraphValue) {
		this.value = value
	}

	find(node: TreeNode, value: GraphValue): TreeNode | undefined {
		if (node.value === value) return node

		for (const child of node.childrens) {
			const result = this.find(child, value)

			if (result) {
				return result
			}
		}

		return undefined
	}

	add(node: TreeNode) {
		this.childrens.push(node)
	}
}

class Tree {
	root: TreeNode

	constructor(value: GraphValue) {
		this.root = new TreeNode(value)
	}

	add(node: GraphValue, value: GraphValue) {
		const prevNode = this.root.find(this.root, node)

		if (!prevNode) return

		prevNode.add(new TreeNode(value))
	}

	display() {
		console.log(this.root)
	}
}

export class BFS {
	graph: Graph
	render: () => void

	constructor(graph: Graph, render: () => void) {
		this.graph = graph
		this.render = render
	}

	async bfsWrapper(id: number) {
		const visited: Node[] = []

		for (const item of this.graph.graph.values()) {
			if (!visited.includes(item)) {
				if (window.algorithmActiveId !== id) {
					return
				}

				await this.bfs(item, visited, id)
			}
		}

		this.render()
	}

	async bfs(node: Node, visited: Node[], id: number) {
		const tree = new Tree(node.value)

		const queue = [node]

		while (queue.length > 0) {
			if (window.algorithmActiveId !== id) {
				return
			}

			const item = queue.shift()
			if (!item) return null

			visited.push(item)

			item.edges.forEach(edge => {
				if (this.graph.mode === 'directed' && edge.status === 'no-direction')
					return

				const adjacentNode = edge.adjacentNode

				if (!visited.includes(adjacentNode) && !queue.includes(adjacentNode)) {
					tree.add(item.value ?? -1, adjacentNode.value ?? -1)
					queue.push(adjacentNode)
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

		tree.display()

		this.render()
	}
}
