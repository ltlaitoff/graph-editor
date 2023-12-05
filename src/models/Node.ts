import { Edge } from './Edge'

class Node {
	value: number | null = null
	edges = new Set<Edge>()
	parents = new Map<Node, Edge>()

	x: number | null = null
	y: number | null = null
	status: 'default' | 'progress' | 'done' | 'passed' = 'default'

	constructor(value: number, x: number | null = null, y: number | null = null) {
		this.value = value

		this.x = x
		this.y = y
	}

	toString() {
		return JSON.stringify({
			from: this.value,
			to: -1,
			weight: 1,
			x: this.x,
			y: this.y
		})
	}
}

export { Node }
