import { Node } from '../models/Node.ts'
import { setNodeStatus } from '../helpers'
import { Graph } from '../models/Graph.ts'

export class Dijkstra {
	render: () => void
	graph: Graph

	constructor(graph: Graph, render: () => void) {
		this.graph = graph
		this.render = render
	}

	async initHashTables(
		start: Node,
		unprocessedNodes: Set<Node>,
		timeToNodes: Map<Node, number>
	) {
		for (const node of this.graph.graph.values()) {
			unprocessedNodes.add(node)
			timeToNodes.set(node, Infinity)
		}

		timeToNodes.set(start, 0)
	}

	async getNodeWithMinTime(
		unprocessedNodes: Set<Node>,
		timeToNodes: Map<Node, number>
	) {
		let nodeWithMinTime: Node | null = null

		let minTime = Infinity

		for (const node of unprocessedNodes) {
			const time = timeToNodes.get(node)

			if (time !== undefined && time < minTime) {
				minTime = time
				nodeWithMinTime = node
			}
		}

		return nodeWithMinTime
	}

	async calculateTimeToEachNode(
		unprocessedNodes: Set<Node>,
		timeToNodes: Map<Node, number>
	) {
		while (unprocessedNodes.size > 0) {
			const node = await this.getNodeWithMinTime(unprocessedNodes, timeToNodes)

			if (!node) return
			if (timeToNodes.get(node) === Infinity) return

			await setNodeStatus(
				node,
				{
					status: 'progress',
					statusForChange: 'default'
				},
				this.render
			)

			for (const edge of node.edges) {
				if (this.graph.mode === 'directed' && edge.status === 'no-direction') {
					continue
				}

				const adjacentNode = edge.adjacentNode

				if (unprocessedNodes.has(adjacentNode)) {
					const nodeTime = timeToNodes.get(node)
					if (nodeTime === undefined) continue

					const adjacentNodeTime = timeToNodes.get(adjacentNode)
					if (adjacentNodeTime === undefined) continue

					const timeToCheck = nodeTime + edge.weight

					if (timeToCheck < adjacentNodeTime) {
						timeToNodes.set(adjacentNode, timeToCheck)
					}
				}
			}

			unprocessedNodes.delete(node)
		}
	}

	async getShortestPath(
		start: Node,
		end: Node,
		timeToNodes: Map<Node, number>
	) {
		const path = []
		let node = end

		while (node !== start) {
			const minTimeToNode = timeToNodes.get(node)
			path.unshift(node)

			for (const [parent, parentEdge] of node.parents.entries()) {
				if (timeToNodes.has(parent) === undefined) continue

				const previousNodeFound =
					Number(parentEdge.weight + (timeToNodes.get(parent) ?? 0)) ===
					minTimeToNode

				if (previousNodeFound) {
					timeToNodes.delete(node)
					node = parent
					break
				}
			}
		}

		path.unshift(node)
		return path
	}

	async dijkstra(start: Node, end: Node) {
		const unprocessedNodes = new Set<Node>()
		const timeToNodes = new Map<Node, number>()

		await this.initHashTables(start, unprocessedNodes, timeToNodes)
		await this.calculateTimeToEachNode(unprocessedNodes, timeToNodes)

		if (timeToNodes.get(end) === Infinity) return null
		return await this.getShortestPath(start, end, timeToNodes)
	}
}
