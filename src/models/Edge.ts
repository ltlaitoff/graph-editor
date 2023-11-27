import { Node } from './Node'

class Edge {
	adjacentNode: Node
	weight: number

	constructor(adjacentNode: Node, weight: number) {
		this.adjacentNode = adjacentNode
		this.weight = weight
	}
}

export { Edge }
