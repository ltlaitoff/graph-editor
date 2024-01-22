import { setNodeStatus } from '../helpers'
import { Graph } from '../models/Graph'
import { Node } from '../models/Node'

export class EdgesTypes {
	graph: Graph
	render: () => void

	constructor(render: () => void, graph: Graph) {
		this.render = render
		this.graph = graph
	}

	async edgesTypes(id: number) {
		const visited: Node[] = []
		const startTime: Map<Node, number> = new Map()
		const endTime: Map<Node, number> = new Map()
		const state: { time: number } = { time: 0 }

		for (const item of this.graph.graph.values()) {
			if (!visited.includes(item)) {
				if (window.algorithmActiveId !== id) {
					return
				}

				await this.edgesTypesInner(item, visited, startTime, endTime, state, id)
			}
		}

		console.log(startTime.size, endTime.size)

		this.render()
	}

	async edgesTypesInner(
		node: Node,
		visited: Node[],
		startTime: Map<Node, number>,
		endTime: Map<Node, number>,
		state: { time: number },
		id: number
	) {
		const jungle: Node[] = []

		if (window.algorithmActiveId !== id) {
			return
		}

		if (!node) return null

		startTime.set(node, state.time)
		state.time++

		visited.push(node)
		jungle.push(node)

		for (const edge of [...node.edges].toReversed()) {
			if (this.graph.mode === 'directed' && edge.status === 'no-direction') {
				continue
			}

			const adjacentNode = edge.adjacentNode

			// if (item.value === 8) debugger

			if (!visited.includes(adjacentNode)) {
				console.log(
					'Tree Edge: ' + node.value + '-->' + adjacentNode.value + '<br>'
				)

				edge.type = 'default'

				await this.edgesTypesInner(
					adjacentNode,
					visited,
					startTime,
					endTime,
					state,
					id
				)
			} else {
				// if parent node is traversed after the neighbour node

				const itemStartTime = startTime.get(node) ?? -1
				const adjacentStartTime = startTime.get(adjacentNode) ?? -1
				const itemEndTime = endTime.get(node) ?? -1
				const adjacentEndTime = endTime.get(adjacentNode) ?? -1

				console.table({
					value: node.value,
					// startTime: startTime,
					// endTime: JSendTime,
					adjacentNode: adjacentNode.value,
					itemStartTime: itemStartTime,
					adjacentStartTime: adjacentStartTime,
					itemEndTime: itemEndTime,
					adjacentEndTime: adjacentEndTime
				})

				if (itemStartTime >= adjacentStartTime && adjacentEndTime === -1) {
					console.log(
						'Back Edge: ' + node.value + '-->' + adjacentNode.value + '<br>'
					)
					edge.type = 'back'
				}

				// if the neighbour node is a  but not a part of the tree
				else if (itemStartTime < adjacentStartTime && adjacentEndTime !== -1) {
					console.log(
						'Forward Edge: ' + node.value + '-->' + adjacentNode.value + '<br>'
					)
					edge.type = 'forward'
				}

				// if parent and neighbour node do not
				// have any ancestor and descendant relationship between them
				else {
					console.log(
						'Cross Edge: ' + node.value + '-->' + adjacentNode.value + '<br>'
					)
					edge.type = 'cross'
				}
			}
		}

		endTime.set(node, state.time)
		state.time++

		await setNodeStatus(
			node,
			{
				status: 'progress',
				renderBeforeSleep: true
			},
			this.render.bind(this)
		)

		this.render()

		// console.log('DFS:', jungle.map(item => item.value).join(', 	'))
	}
}
