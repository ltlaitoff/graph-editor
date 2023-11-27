import './style.css'
import { Graph } from './models/Graph.ts'
import { Edge } from './models/Edge.ts'

class App {
	graph: Graph

	offsetX = 0
	offsetY = -105

	mouseDown = false
	mouseDownTarget: HTMLElement | null = null
	currentClikedTarget: HTMLElement | null = null

	pressedKey: string | null = null

	constructor() {
		this.graph = new Graph()
		this.initializeGraph()
		this.main()
	}

	onKeyDown(event: KeyboardEvent): void {
		console.log(event)
		this.pressedKey = event.code
	}

	onKeyUp(event: KeyboardEvent): void {
		if (this.pressedKey === event.code) {
			this.pressedKey = null
			this.main()
		}
	}

	onMouseDown(e: MouseEvent) {
		console.log('down', e)
		this.mouseDown = true
		this.mouseDownTarget = e.target as HTMLElement
	}

	onMouseUp() {
		console.log('up')
		this.mouseDown = false
		this.mouseDownTarget = null
	}

	onMouseMove(e: MouseEvent) {
		console.log(this.pressedKey)
		if (!this.mouseDown) return

		if (this.pressedKey === 'Space') {
			console.log(e)
			this.offsetX += e.movementX
			this.offsetY += e.movementY

			console.log(this.main)
			this.main()
		} else {
			if (!this.mouseDownTarget) return
			if (!this.mouseDownTarget.dataset.elementid) return
			const node = this.graph.graph.get(
				Number(this.mouseDownTarget.dataset.elementid)
			)

			if (!node) return

			// node.x += e.movementX
			// node.y += e.movementY

			node.x = e.clientX - this.offsetX
			node.y = e.clientY - this.offsetY

			this.main()

			console.log(this.mouseDownTarget.dataset.elementid)
		}
	}

	onClick(e: MouseEvent) {
		if ((e.target as HTMLElement).tagName !== 'svg') {
			if (!(e.target as HTMLElement).dataset.elementid) return

			console.log('currentClikedTarget: ', this.currentClikedTarget)

			if (
				this.currentClikedTarget !== null &&
				this.currentClikedTarget !== e.target
			) {
				const nodePrev = this.graph.graph.get(
					Number(this.currentClikedTarget.dataset.elementid)
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

				this.currentClikedTarget = null

				this.main()
				return
			}

			this.currentClikedTarget = e.target as HTMLElement

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

		this.graph.graph.delete(Number((e.target as HTMLElement).dataset.elementid))

		this.main()
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
				this.currentClikedTarget &&
				Number(this.currentClikedTarget.dataset.elementid) === node.value
					? 'red'
					: 'white'

			// console.log(node.value, bg)

			return `<g
						fixed="false"
						style="cursor: pointer"
					>
						<circle
							stroke-width="2"
							fill="${bg}"
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

		document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="graph__wrapper">
	<svg
		width="100%"
		height="100%"
		preserveAspectRatio="none"
		cursor="${this.pressedKey === 'Space' ? 'grabbing' : 'default'}"
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
