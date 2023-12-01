import './style.css'
import { Graph } from './models/Graph.ts'
import { Edge } from './models/Edge.ts'
import { Node } from './models/Node.ts'

class App {
	graph: Graph

	offsetX = 0
	offsetY = -105

	mouseDownValues: {
		active: boolean
		target: HTMLElement | null
		innerOffsetX: number
		innerOffsetY: number
	} = {
		active: false,
		target: null,
		innerOffsetX: 0,
		innerOffsetY: 0
	}

	algorithmActive = false
	currentClickedTarget: HTMLElement | null = null

	pressedKeyCode: string | null = null

	constructor() {
		this.graph = new Graph()
		this.initializeGraph()
		this.main()
	}

	onKeyDown(event: KeyboardEvent): void {
		this.pressedKeyCode = event.code
	}

	onKeyUp(event: KeyboardEvent): void {
		if (this.pressedKeyCode === event.code) {
			this.pressedKeyCode = null
			this.main()
		}
	}

	onMouseDown(e: MouseEvent) {
		console.log('mousedown')

		this.mouseDownValues = {
			active: true,
			target: e.target as HTMLElement,
			innerOffsetX:
				e.clientX - (e.target as HTMLElement).getBoundingClientRect().x - 20,
			innerOffsetY:
				e.clientY - (e.target as HTMLElement).getBoundingClientRect().y - 20
		}

		console.log(
			this.mouseDownValues,
			e,
			e.clientX,
			(e.target as HTMLElement).getBoundingClientRect()
		)
	}

	onMouseUp() {
		console.log('mouseup')
		this.mouseDownValues = {
			active: false,
			target: null,
			innerOffsetX: 0,
			innerOffsetY: 0
		}
	}

	onMouseMove(e: MouseEvent) {
		if (!this.mouseDownValues.active) return

		console.log('mousemove')
		if (this.pressedKeyCode === 'Space') {
			console.log(e)
			this.offsetX += e.movementX
			this.offsetY += e.movementY

			console.log(this.main)
			this.main()
		} else {
			if (!this.mouseDownValues.target) return
			if (!this.mouseDownValues.target.dataset.elementid) return
			const node = this.graph.graph.get(
				Number(this.mouseDownValues.target.dataset.elementid)
			)

			if (!node) return

			node.x = e.clientX - this.offsetX - this.mouseDownValues.innerOffsetX
			node.y = e.clientY - this.offsetY - this.mouseDownValues.innerOffsetY

			this.main()

			console.log(this.mouseDownValues.target.dataset.elementid)
		}
	}

	onClick(e: MouseEvent) {
		console.log('click')

		if ((e.target as HTMLElement).tagName !== 'svg') {
			if (!(e.target as HTMLElement).dataset.elementid) return

			console.log('currentClikedTarget: ', this.currentClickedTarget)

			if (
				this.currentClickedTarget !== null &&
				this.currentClickedTarget !== e.target
			) {
				const nodePrev = this.graph.graph.get(
					Number(this.currentClickedTarget.dataset.elementid)
				)

				const nodeCurrent = this.graph.graph.get(
					Number((e.target as HTMLElement).dataset.elementid)
				)
				console.log(nodePrev, nodeCurrent)

				if (!nodePrev || !nodeCurrent) return

				const findedEdge = [...nodePrev.edges].find(edge => {
					return edge.adjacentNode === nodeCurrent
				})

				if (!findedEdge) {
					nodePrev.edges.add(new Edge(nodeCurrent, 1))
				} else {
					nodePrev.edges.delete(findedEdge)
				}

				this.currentClickedTarget = null

				this.main()
				return
			}

			this.currentClickedTarget = e.target as HTMLElement

			this.main()
			return
		}

		console.log(e)
		console.log({
			x: e.x,
			y: e.y,
			offsetX: this.offsetX,
			offsetY: this.offsetY
		})
		this.graph.addOrGetNode(
			this.graph.graph,
			Math.ceil(Math.random() * 100),
			e.clientX - this.offsetX,
			e.clientY - this.offsetY
		)

		this.main()
	}

	onContextMenu(e: MouseEvent) {
		e.preventDefault()

		if (!(e.target as HTMLElement).dataset.elementid) return

		const nodeId = Number((e.target as HTMLElement).dataset.elementid)

		const node = this.graph.graph.get(nodeId)

		if (!node) return

		this.graph.graph.forEach(graphNode => {
			graphNode.edges = new Set(
				[...graphNode.edges].filter(edge => {
					return edge.adjacentNode !== node
				})
			)
		})

		this.graph.graph.delete(nodeId)

		this.main()
	}

	async bfs(startIndex: number, findValue: number) {
		const startNode = this.graph.graph.get(Number(startIndex)) as Node

		const queue = [startNode]
		const visited: Node[] = []

		let previousNode: Node = startNode

		while (queue.length > 0) {
			const item = queue.shift()
			console.log(item)

			if (!item) return null

			previousNode.status = 'default'

			if (item.value === findValue) {
				console.log(item.value, findValue)

				item.status = 'done'

				this.main()
				setTimeout(() => {
					item.status = 'default'
					this.main()
				}, 1000)
				return item
			}

			visited.push(item)
			previousNode = item
			item.status = 'progress'

			item.edges.forEach(edge => {
				const adjacentNode = edge.adjacentNode

				if (!visited.includes(adjacentNode) && !queue.includes(adjacentNode)) {
					queue.push(adjacentNode)
				}
			})

			this.main()

			await new Promise(resolve => {
				setTimeout(() => {
					resolve(null)
				}, 1000)
			})
		}
	}

	private initializeGraph() {
		this.graph.graph = this.graph.createGraph([
			{
				from: 3,
				to: -1,
				weight: 1,
				x: 1000,
				y: 1000
			},
			{
				from: 1,
				to: 2,
				weight: 1,
				x: 120,
				y: 230
			},
			{
				from: 1,
				to: 3,
				weight: 1,
				x: 370,
				y: 230
			},
			{
				from: 2,
				to: 3,
				weight: 1,
				x: 260,
				y: 270
			},
			{ from: 4, to: -1, weight: 1, x: 130, y: 130 }
		])
	}

	main() {
		// eslint-disable-next-line
		const ourNodes = [...this.graph.graph.entries()].map(([_, node]) => {
			const bg =
				this.currentClickedTarget &&
				Number(this.currentClickedTarget.dataset.elementid) === node.value
					? 'red'
					: 'white'

			// console.log(node.value, bg)

			return `<g
						fixed="false"
						style="cursor: pointer;"
					>
						<circle
							stroke-width="2"
							fill="${
								node.status === 'progress'
									? 'green'
									: node.status === 'done'
									  ? 'yellow'
									  : bg
							}"
							stroke="black"
							r="19"
							data-elementId="${node.value}"
							cx="${(node.x ?? 0) + this.offsetX}"
							cy="${(node.y ?? 0) + this.offsetY}"
						></circle>
						<text
							font-size="14"
							dy=".35em"
							text-anchor="middle"
							stroke-width="1"
							fill="black"
							stroke="black"
							data-elementId="${node.value}"
							x="${(node.x ?? 0) + this.offsetX}"
							y="${(node.y ?? 0) + this.offsetY}"
							style="user-select: none"
						>
							${node.value}
						</text>
					</g>`
		})

		const ourEdges = [...this.graph.graph.entries()]
			// eslint-disable-next-line
			.map(([_, node]) => {
				return [...node.edges].map(edge => {
					const vectorOne = [
						(edge.adjacentNode.x ?? 0) - (node.x ?? 0),
						(edge.adjacentNode.y ?? 0) - (node.y ?? 0)
					]

					const vectorTwo = [
						Math.abs((edge.adjacentNode.x ?? 0) - (node.x ?? 0)),
						0
					]

					const top = vectorOne[0] * vectorTwo[0] + vectorOne[1] * vectorTwo[1]
					const bottom =
						Math.sqrt(vectorOne[0] ** 2 + vectorOne[1] ** 2) *
						Math.sqrt(vectorTwo[0] ** 2 + vectorTwo[1] ** 2)

					const arrowRotateA = (Math.acos(top / bottom) * 180) / Math.PI
					const arrowRotate =
						vectorOne[1] < 0 ? 360 - arrowRotateA : arrowRotateA

					const test1 = [
						19 * Math.cos((arrowRotate * Math.PI) / 180),
						19 * Math.sin((arrowRotate * Math.PI) / 180)
					]

					if (node.value === 1 && edge.adjacentNode.value === 2) {
						// const test1 = () / (Math.sqrt(vectorOne[0] ** 2 + vectorOne[1] ** 2))

						console.log(vectorOne, vectorTwo, test1, arrowRotate)
					}

					/*

					const f = (AB) / (|A||B|)
					const A = 
					*/

					return `<g>
						<path
							d="M ${(node.x ?? 0) + this.offsetX} ${(node.y ?? 0) + this.offsetY} L ${
								(edge.adjacentNode.x ?? 0) + this.offsetX
							} ${(edge.adjacentNode.y ?? 0) + this.offsetY}"
							fill="none"
							stroke-width="2"
							stroke="black"
						></path>
						<path
						d="M ${(node.x ?? 0) + this.offsetX} ${(node.y ?? 0) + this.offsetY} L ${
							(edge.adjacentNode.x ?? 0) + this.offsetX
						} ${(edge.adjacentNode.y ?? 0) + this.offsetY}"
							opacity="0"
							fill="none"
							stroke-width="30"
							stroke="black"
						></path>
						<path stroke="black" fill="black" d="M -15 5.5 L 0 0 L -15 -5.5 Z" transform="translate (${
							(edge.adjacentNode.x ?? 0) + this.offsetX - test1[0]
						} ${
							(edge.adjacentNode.y ?? 0) + this.offsetY - test1[1]
						}) rotate(${arrowRotate})"></path>
					</g>`
				})
			})
			.flat()

		document.querySelector<HTMLDivElement>('#content')!.innerHTML = `
<div class="graph__wrapper">
	<svg
		width="100%"
		height="100%"
		preserveAspectRatio="none"
		cursor="${this.pressedKeyCode === 'Space' ? 'grabbing' : 'default'}"
		>
			<g>
				<g>
					${ourEdges.join(' ')}
				</g>
				<g>
					${ourNodes.join(' ')}
				</g>
			</g>
		</svg>
		</div>
`
	}
}

const app = new App()

document.addEventListener('mousedown', (e: MouseEvent) => app.onMouseDown(e))
document.addEventListener('mouseup', () => app.onMouseUp())
document.addEventListener('mousemove', (e: MouseEvent) => app.onMouseMove(e))

document.addEventListener('contextmenu', (e: MouseEvent) =>
	app.onContextMenu(e)
)
document.addEventListener('click', (e: MouseEvent) => app.onClick(e))

document.addEventListener('keydown', (e: KeyboardEvent) => app.onKeyDown(e))
document.addEventListener('keyup', (e: KeyboardEvent) => app.onKeyUp(e))

const form = document.querySelector('form')

form?.addEventListener('submit', e => {
	e.preventDefault()

	const from = document.querySelector('.form-from')
	const to = document.querySelector('.form-to')
	console.log('%c⧭', 'color: #00e600', from)

	app.bfs(Number(from.value), Number(to.value))
})

setTimeout(() => {
	app.algorithmActive = true
}, 2000)
