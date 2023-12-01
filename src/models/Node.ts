import { Edge } from './Edge'

class Node {
	value: number | null = null
	edges = new Set<Edge>()
	parents = new Map<Node, Edge>()

	x: number | null = null
	y: number | null = null
	status: 'default' | 'progress' | 'done' = 'default'

	constructor(value: number, x: number | null = null, y: number | null = null) {
		this.value = value

		this.x = x
		this.y = y
	}
}

export { Node }
