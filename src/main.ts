import './style.css'
import { Graph } from './models/Graph.ts'
import { Edge } from './models/Edge.ts'
import { Node } from './models/Node.ts'
import { NODE_COLORS } from './config/nodeColors.ts'
import { DELAY } from './config/delay.ts'

async function sleep(time: number) {
	await new Promise(resolve => {
		setTimeout(() => {
			resolve(null)
		}, time)
	})
}

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

	algorithmActiveId: number | null = -1
	currentClickedTarget: HTMLElement | null = null

	pressedKeyCode: string | null = null

	constructor() {
		this.graph = new Graph()
		this.initializeGraph()
		this.render()
	}

	onKeyDown(event: KeyboardEvent): void {
		this.pressedKeyCode = event.code

		if (event.code === 'Escape') {
			this.currentClickedTarget = null
			this.render()
		}
	}

	onKeyUp(event: KeyboardEvent): void {
		if (this.pressedKeyCode === event.code) {
			this.pressedKeyCode = null
			this.render()
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

			console.log(this.render)
			this.render()
		} else {
			if (!this.mouseDownValues.target) return
			if (!this.mouseDownValues.target.dataset.elementid) return
			const node = this.graph.graph.get(
				Number(this.mouseDownValues.target.dataset.elementid)
			)

			if (!node) return

			node.x = e.clientX - this.offsetX - this.mouseDownValues.innerOffsetX
			node.y = e.clientY - this.offsetY - this.mouseDownValues.innerOffsetY

			this.render()

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

				this.render()
				return
			}

			this.currentClickedTarget = e.target as HTMLElement

			this.render()
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

		this.render()
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

		this.render()
	}

	// #nodeStatusChanger(node: Node, newStatus: 'default' | 'progress' | 'done') {
	// 	node.status = newStatus
	// }

	#graphNodesStatusResetter(id: number) {
		if (this.algorithmActiveId !== id) return

		this.graph.graph.forEach(node => {
			if (this.algorithmActiveId !== id) return

			node.status = 'default'
		})

		this.render()
	}

	async dfsWrapper(id: number) {
		const visited: Node[] = []

		for (const item of this.graph.graph.values()) {
			if (!visited.includes(item)) {
				if (this.algorithmActiveId !== id) {
					return
				}

				await this.dfs(item, visited, id)
			}
		}

		this.render()
	}

	async dfs(node: Node, visited: Node[], id: number) {
		visited.push(node)

		node.status = 'progress'

		this.render()

		await sleep(DELAY)

		for (const edge of node.edges) {
			if (!visited.includes(edge.adjacentNode)) {
				if (this.algorithmActiveId !== id) {
					return
				}

				await this.dfs(edge.adjacentNode, visited, id)
			}
		}
	}

	async bfsWrapper(id: number) {
		const visited: Node[] = []

		for (const item of this.graph.graph.values()) {
			if (!visited.includes(item)) {
				if (this.algorithmActiveId !== id) {
					return
				}

				await this.bfs(item, visited, id)
			}
		}

		this.render()
	}

	async bfs(node: Node, visited: Node[], id: number) {
		const queue = [node]

		while (queue.length > 0) {
			if (this.algorithmActiveId !== id) {
				return
			}

			const item = queue.shift()
			if (!item) return null

			visited.push(item)

			item.status = 'progress'

			item.edges.forEach(edge => {
				const adjacentNode = edge.adjacentNode

				if (!visited.includes(adjacentNode) && !queue.includes(adjacentNode)) {
					queue.push(adjacentNode)
				}
			})

			this.render()

			await sleep(DELAY)
		}

		this.render()
	}

	async findPath(
		start: Node,
		end: Node,
		visited: Node[],
		path: Node[],
		id: number
	) {
		if (start === end) {
			start.status = 'done'

			path.push(start)

			this.render()
			return true
		}

		visited.push(start)

		if (start.status === 'default') {
			start.status = 'progress'
		}

		await sleep(DELAY)

		this.render()

		for (const edge of start.edges) {
			if (this.algorithmActiveId !== id) {
				return
			}

			if (!visited.includes(edge.adjacentNode)) {
				if (await this.findPath(edge.adjacentNode, end, visited, path, id)) {
					if (this.algorithmActiveId !== id) {
						return
					}

					path.push(start)

					start.status = 'done'
					this.render()

					return true
				}
			}
		}

		if (start.status === 'progress') {
			start.status = 'passed'
		}

		this.render()
	}

	async findPathes(
		start: Node,
		end: Node,
		visited: Set<Node>,
		paths: Node[][],
		id: number
	) {
		if (start === end) {
			paths.push([...visited, start])

			paths[paths.length - 1].forEach(item => {
				item.status = 'done'
			})

			return
		}

		visited.add(start)

		if (start.status === 'default') {
			start.status = 'progress'
		}

		await sleep(DELAY)

		this.render()

		for (const edge of start.edges) {
			if (this.algorithmActiveId !== id) {
				return
			}

			if (!visited.has(edge.adjacentNode)) {
				await this.findPathes(edge.adjacentNode, end, visited, paths, id)
			}
		}

		visited.delete(start)

		if (start.status === 'progress') {
			start.status = 'passed'
		}
		this.render()
	}

	private initializeGraph() {
		this.graph.graph = this.graph.createGraph([
			{ from: 1, to: 2, weight: 1, x: 751, y: 189 },
			{ from: 1, to: 3, weight: 1, x: 751, y: 189 },
			{ from: 1, to: 4, weight: 1, x: 751, y: 189 },
			{ from: 2, to: 5, weight: 1, x: 516, y: 335 },
			{ from: 2, to: 6, weight: 1, x: 516, y: 335 },
			{
				from: 3,
				to: 7,
				weight: 1,
				x: 691,
				y: 372
			},
			{
				from: 3,
				to: 8,
				weight: 1,
				x: 691,
				y: 372
			},
			{ from: 4, to: 9, weight: 1, x: 1020, y: 336 },
			{ from: 4, to: 10, weight: 1, x: 1020, y: 336 },
			{ from: 5, to: -1, weight: 1, x: 390, y: 508 },
			{
				from: 6,
				to: 11,
				weight: 1,
				x: 564,
				y: 511
			},
			{ from: 7, to: 11, weight: 1, x: 681, y: 502 },
			{ from: 8, to: 1, weight: 1, x: 855, y: 494 },
			{ from: 9, to: 12, weight: 1, x: 961, y: 492 },
			{ from: 10, to: -1, weight: 1, x: 1136, y: 484 },
			{
				from: 11,
				to: 13,
				weight: 1,
				x: 622,
				y: 657
			},
			{ from: 12, to: -1, weight: 1, x: 1002, y: 646 },
			{ from: 13, to: 12, weight: 1, x: 813, y: 649 }
		])
	}

	#getNodeStatusForRender(node: Node) {
		return this.currentClickedTarget &&
			Number(this.currentClickedTarget.dataset.elementid) === node.value
			? 'checked'
			: node.status
	}

	#getRenderedCircles() {
		return [...this.graph.graph.entries()].map(
			(
				// eslint-disable-next-line
				[_, node]
			) => {
				const status = this.#getNodeStatusForRender(node)
				const x = (node.x ?? 0) + this.offsetX
				const y = (node.y ?? 0) + this.offsetY

				return `<g
						fixed="false"
						style="cursor: pointer;"
					>
						<circle
							class="content--circle"
							stroke-width="2"
							fill="${NODE_COLORS[status]}"
							stroke="black"
							r="19"
							data-elementId="${node.value}"
							cx="${x}"
							cy="${y}"
						></circle>
						<text
							class="content--text"
							font-size="14"
							dy=".35em"
							text-anchor="middle"
							stroke-width="1"
							fill="black"
							stroke="black"
							data-elementId="${node.value}"
							x="${x}"
							y="${y}"
							style="user-select: none"
						>
							${node.value}
						</text>
					</g>`
			}
		)
	}

	#getLinesForRender() {
		return (
			[...this.graph.graph.entries()]
				// eslint-disable-next-line
				.map(([_, node]) => {
					return [...node.edges].map(edge => {
						const adjacentNodeX = edge.adjacentNode.x ?? 0
						const adjacentNodeY = edge.adjacentNode.y ?? 0
						const nodeX = node.x ?? 0
						const nodeY = node.y ?? 0

						const vectorOne = [adjacentNodeX - nodeX, adjacentNodeY - nodeY]
						const vectorOneProtectionToX = [Math.abs(adjacentNodeX - nodeX), 0]

						const top =
							vectorOne[0] * vectorOneProtectionToX[0] +
							vectorOne[1] * vectorOneProtectionToX[1]
						const bottom =
							Math.sqrt(vectorOne[0] ** 2 + vectorOne[1] ** 2) *
							Math.sqrt(
								vectorOneProtectionToX[0] ** 2 + vectorOneProtectionToX[1] ** 2
							)

						const arrowRotateDeg = (Math.acos(top / bottom) * 180) / Math.PI
						const arrowRotateDegWithReflection =
							vectorOne[1] < 0 ? 360 - arrowRotateDeg : arrowRotateDeg

						const distanceFromCenter = [
							19 * Math.cos((arrowRotateDegWithReflection * Math.PI) / 180),
							19 * Math.sin((arrowRotateDegWithReflection * Math.PI) / 180)
						]

						return `<g>
							<path
							class="content--edge"
								d="M ${nodeX + this.offsetX} ${nodeY + this.offsetY} L ${
									adjacentNodeX + this.offsetX
								} ${adjacentNodeY + this.offsetY}"
								fill="none"
								stroke-width="2"
								stroke="black"
							></path>
							<path
							class="content--edge"
							d="M ${nodeX + this.offsetX} ${nodeY + this.offsetY} L ${
								adjacentNodeX + this.offsetX
							} ${adjacentNodeY + this.offsetY}"
								opacity="0"
								fill="none"
								stroke-width="30"
								stroke="black"
							></path>
							<path stroke="black" fill="black" d="M -15 5.5 L 0 0 L -15 -5.5 Z" transform="translate (${
								adjacentNodeX + this.offsetX - distanceFromCenter[0]
							} ${
								adjacentNodeY + this.offsetY - distanceFromCenter[1]
							}) rotate(${arrowRotateDegWithReflection})"></path>
						</g>`
					})
				})
				.flat()
		)
	}

	render() {
		const ourNodes = this.#getRenderedCircles()
		const ourEdges = this.#getLinesForRender()

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

	initializeApp() {
		this.#initilizeUserEvents()
		this.#initilizeMenu()
	}

	#initilizeUserEvents() {
		document.addEventListener('mousedown', (e: MouseEvent) =>
			this.onMouseDown(e)
		)
		document.addEventListener('mouseup', () => this.onMouseUp())
		document.addEventListener('mousemove', (e: MouseEvent) =>
			this.onMouseMove(e)
		)

		document.addEventListener('contextmenu', (e: MouseEvent) =>
			this.onContextMenu(e)
		)
		document.addEventListener('click', (e: MouseEvent) => this.onClick(e))

		document.addEventListener('keydown', (e: KeyboardEvent) =>
			this.onKeyDown(e)
		)
		document.addEventListener('keyup', (e: KeyboardEvent) => this.onKeyUp(e))
	}

	localState:
		| {
				opened: false
		  }
		| {
				opened: true
				algorithm: string
				activeElement: HTMLElement
		  } = {
		opened: false
	}

	#initilizeMenu() {
		const mainMenu = document.querySelector('#main-menu')
		const panel = document.querySelector('#panel')
		const form = document.querySelector('#form')
		const formHeading = document.querySelector('.panel__form-heading')

		mainMenu?.addEventListener('click', async e => {
			if (!(e.target as HTMLElement).className.includes('menu__link')) return

			const targetDataId = (e.target as HTMLElement).dataset.id

			if (!targetDataId) {
				return
			}

			if (targetDataId === 'bfs' || targetDataId === 'dfs') {
				;(e.target as HTMLElement).classList.add('menu__link--active')

				const activeId = new Date().getTime()
				this.algorithmActiveId = new Date().getTime()

				this.#graphNodesStatusResetter(activeId)

				if (targetDataId === 'bfs') {
					await this.bfsWrapper(activeId)
				}

				if (targetDataId === 'dfs') {
					await this.dfsWrapper(activeId)
				}

				;(e.target as HTMLElement).classList.remove('menu__link--active')
				this.#graphNodesStatusResetter(activeId)

				return
			}

			if (targetDataId === 'reset') {
				this.algorithmActiveId = -1

				this.#graphNodesStatusResetter(this.algorithmActiveId)
				return
			}

			if (this.localState.opened) {
				if (this.localState.algorithm === targetDataId) {
					panel?.classList.remove('panel--opened')
					;(e.target as HTMLElement).classList.remove('menu__link--active')

					this.localState = {
						opened: false
					}
				} else {
					this.localState.algorithm = targetDataId
					;(e.target as HTMLElement).classList.add('menu__link--active')
					this.localState.activeElement.classList.remove('menu__link--active')

					this.localState.activeElement = e.target as HTMLElement
				}
			} else {
				panel?.classList.add('panel--opened')
				;(e.target as HTMLElement).classList.add('menu__link--active')

				this.localState = {
					opened: true,
					algorithm: targetDataId,
					activeElement: e.target as HTMLElement
				}
			}

			if (formHeading) {
				formHeading.textContent = targetDataId
			}
		})

		form?.addEventListener('submit', async e => {
			e.preventDefault()

			const start = document.querySelector('#panel__form--from')
			const to = document.querySelector('#panel__form--to')

			// @ts-expect-error TODO
			const algorithm = this.localState.algorithm
			// @ts-expect-error TODO
			const startNode = this.graph.graph.get(Number(start.value))
			// @ts-expect-error TODO
			const endNode = this.graph.graph.get(Number(to.value))

			if (!startNode || !endNode) return

			if (algorithm === 'find-one-path') {
				const path: Node[] = []

				const activeId = new Date().getTime()
				this.algorithmActiveId = new Date().getTime()

				this.#graphNodesStatusResetter(activeId)

				startNode.status = 'done'
				endNode.status = 'done'

				console.log(await this.findPath(startNode, endNode, [], path, activeId))

				await sleep(DELAY)

				this.#graphNodesStatusResetter(activeId)

				console.log(path)
			}

			if (algorithm === 'find-all-paths') {
				const path: Node[][] = []

				const activeId = new Date().getTime()
				this.algorithmActiveId = new Date().getTime()

				this.#graphNodesStatusResetter(activeId)

				startNode.status = 'done'
				endNode.status = 'done'

				console.log(
					await this.findPathes(startNode, endNode, new Set(), path, activeId)
				)

				await sleep(DELAY)

				this.#graphNodesStatusResetter(activeId)

				console.log(path)
			}
		})
	}
}

const app = new App()

app.initializeApp()

// }

/*

Форма з двумя input, checkbox и кнопкой
BFS
DFS

BFS => form open => render with form for BFS from App class state

state: {
	opened: boolean,
	algorithm: 'BFS' | 'DFS',
}

*/
