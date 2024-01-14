import './style.css'
import { Graph } from './models/Graph.ts'
import { Node } from './models/Node.ts'
import { DELAY } from './config/delay.ts'
import { Render } from './modules/Render.ts'

import { sleep } from './helpers'
import { BFS } from './algorithms/BFS'
import { DFS } from './algorithms/DFS'
import { Dijkstra } from './algorithms/Dijkstra.ts'
import { BellmanFord } from './algorithms/BellmanFord.ts'
import { FloydWarshall } from './algorithms/FloydWarshall.ts'
import { NodesByDeepLevel } from './algorithms/NodesByDeepLevel.ts'

class App {
	graph: Graph

	offsetX = 0
	offsetY = -105
	lastGraph: 'default' | 'lb5' | 'lb61' | 'lb62' = 'default'

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

	currentClickedTarget: HTMLElement | null = null

	pressedKeyCode: string | null = null

	constructor() {
		this.graph = new Graph()
		// this.initializeGraph()
		this.initializeGraphForLB61()
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
		this.mouseDownValues = {
			active: true,
			target: e.target as HTMLElement,
			innerOffsetX:
				e.clientX - (e.target as HTMLElement).getBoundingClientRect().x - 20,
			innerOffsetY:
				e.clientY - (e.target as HTMLElement).getBoundingClientRect().y - 20
		}
	}

	onMouseUp() {
		this.mouseDownValues = {
			active: false,
			target: null,
			innerOffsetX: 0,
			innerOffsetY: 0
		}
	}

	onMouseMove(e: MouseEvent) {
		if (!this.mouseDownValues.active) return

		if (this.pressedKeyCode === 'Space') {
			console.log(e)
			this.offsetX += e.movementX
			this.offsetY += e.movementY

			this.render()
		} else {
			if (!this.mouseDownValues.target) return
			if (!this.mouseDownValues.target.dataset.elementid) return
			const node = this.graph.graph.get(
				this.mouseDownValues.target.dataset.elementid
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
					this.currentClickedTarget.dataset.elementid || ''
				)

				const nodeCurrent = this.graph.graph.get(
					(e.target as HTMLElement).dataset.elementid || ''
				)

				if (!nodePrev || !nodeCurrent) return

				this.graph.toggleEdge(nodePrev, nodeCurrent)

				// const findedEdge = [...nodePrev.edges].find(edge => {
				// 	return edge.adjacentNode === nodeCurrent
				// })

				// if (!findedEdge) {
				// 	nodePrev.edges.add(new Edge(nodeCurrent, 1))
				// } else {
				// 	nodePrev.edges.delete(findedEdge)
				// }

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

		const lastElement = [...this.graph.graph.values()].reduce((acc, node) => {
			const asNumber = Number(node.value)

			if (isNaN(asNumber)) {
				return acc
			}

			return asNumber > acc ? asNumber : acc
		}, -1)

		this.graph.addOrGetNode(
			this.graph.graph,
			String(lastElement + 1),
			e.clientX - this.offsetX,
			e.clientY - this.offsetY
		)

		this.render()
	}

	onContextMenu(e: MouseEvent) {
		e.preventDefault()

		if (!(e.target as HTMLElement).dataset.elementid) return

		const nodeId = (e.target as HTMLElement).dataset.elementid || ''

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
		if (window.algorithmActiveId !== id) return

		this.graph.graph.forEach(node => {
			if (window.algorithmActiveId !== id) return

			node.status = 'default'
		})

		this.render()
	}

	#graphEdgesTypeResetter(id: number) {
		if (window.algorithmActiveId !== id) return

		this.graph.graph.forEach(node => {
			if (window.algorithmActiveId !== id) return

			node.edges.forEach(edge => {
				edge.type = 'default'
			})
		})

		this.render()
	}

	async #setNodeStatus(
		node: Node,
		params: {
			status?: Node['status']
			sleep?: boolean
			render?: boolean
			statusForChange?: Node['status'] | 'any'
			renderBeforeSleep?: boolean
		} = {}
	) {
		const status = params.status ?? 'default'
		const sleepFlag = params.sleep ?? true
		const render = params.render ?? true
		const statusForChange = params.statusForChange ?? node.status
		const renderBeforeSleep = params.renderBeforeSleep ?? false

		if (statusForChange && statusForChange === node.status) {
			node.status = status
		}

		if (render && renderBeforeSleep) {
			this.render()
		}

		if (sleepFlag) {
			await sleep(DELAY)
		}

		if (render && !renderBeforeSleep) {
			this.render()
		}
	}

	/* Algorithms */

	async lb5TaskSecond(id: number) {
		const visited: Node[] = []
		const startTime: Map<Node, number> = new Map()
		const endTime: Map<Node, number> = new Map()
		const state: { time: number } = { time: 0 }

		for (const item of this.graph.graph.values()) {
			if (!visited.includes(item)) {
				if (window.algorithmActiveId !== id) {
					return
				}

				await this.lb5TaskSecondInner(
					item,
					visited,
					startTime,
					endTime,
					state,
					id
				)
			}
		}

		console.log(startTime.size, endTime.size)

		this.render()
	}

	compareStrings(firstString: string, secondString: string) {
		if (firstString === secondString) return true
		if (firstString.length !== secondString.length) return false

		let differences = 0

		for (let i = 0; i < firstString.length; i++) {
			if (firstString[i] !== secondString[i]) {
				differences++

				if (differences > 1) return false
			}
		}

		return true
	}

	async findPathThird(
		start: Node,
		end: Node,
		visited: Set<Node>,
		path: Map<Node, Node>
	) {
		const queue = [start]

		while (queue.length > 0) {
			const item = queue.shift()
			if (!item) return null

			if (item === end) {
				return item
			}

			visited.add(item)

			item.edges.forEach(edge => {
				if (this.graph.mode === 'directed' && edge.status === 'no-direction')
					return

				const adjacentNode = edge.adjacentNode

				if (!visited.has(adjacentNode) && !queue.includes(adjacentNode)) {
					queue.push(adjacentNode)
					path.set(adjacentNode, item)
				}
			})
		}

		return false
	}

	async lb5TaskSecondInner(
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

				await this.lb5TaskSecondInner(
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

		await this.#setNodeStatus(node, {
			status: 'progress',
			sleep: false
		})

		await sleep(DELAY)

		this.render()

		// console.log('DFS:', jungle.map(item => item.value).join(', 	'))
	}

	private initializeGraph() {
		this.graph.graph = this.graph.createGraph([
			{ from: '1', to: '9', weight: 1, x: 751, y: 189 },
			{ from: '1', to: '2', weight: 1, x: 751, y: 189 },
			{ from: '1', to: '3', weight: 1, x: 751, y: 189 },
			{ from: '1', to: '4', weight: 1, x: 751, y: 189 },
			{ from: '2', to: '5', weight: 1, x: 516, y: 335 },
			{ from: '2', to: '6', weight: 1, x: 516, y: 335 },
			{
				from: '3',
				to: '7',
				weight: 1,
				x: 691,
				y: 372
			},
			{
				from: '3',
				to: '8',
				weight: 1,
				x: 691,
				y: 372
			},
			{ from: '4', to: '9', weight: 1, x: 1020, y: 336 },
			{ from: '4', to: '10', weight: 1, x: 1020, y: 336 },
			{ from: '5', to: '', weight: 1, x: 390, y: 508 },
			{
				from: '6',
				to: '11',
				weight: 1,
				x: 564,
				y: 511
			},
			{ from: '7', to: '11', weight: 1, x: 681, y: 502 },
			{ from: '8', to: '1', weight: 1, x: 855, y: 494 },
			{ from: '9', to: '12', weight: 1, x: 961, y: 492 },
			{ from: '10', to: '', weight: 1, x: 1136, y: 484 },
			{
				from: '11',
				to: '13',
				weight: 1,
				x: 622,
				y: 657
			},
			{ from: '12', to: '', weight: 1, x: 1002, y: 646 },
			{ from: '13', to: '12', weight: 1, x: 813, y: 649 }
		])
	}

	render() {
		const render = new Render()

		console.log(this)

		render.render(
			this.graph,
			this.offsetX,
			this.offsetY,
			this.pressedKeyCode,
			this.currentClickedTarget
		)
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

	initializeGraphForLB61() {
		this.graph.graph = this.graph.createGraph([
			{ from: '1', to: '6', weight: 22, x: 500, y: 500 },
			{ from: '1', to: '5', weight: 31, x: 500, y: 500 },
			{ from: '1', to: '4', weight: 31, x: 500, y: 500 },
			{ from: '1', to: '3', weight: 52, x: 500, y: 500 },
			{
				from: '2',
				to: '9',
				weight: 37,
				x: 494,
				y: 216
			},
			{
				from: '3',
				to: '2',
				weight: 52,
				x: 984,
				y: 336
			},
			{
				from: '3',
				to: '9',
				weight: 89,
				x: 984,
				y: 336
			},
			{
				from: '3',
				to: '4',
				weight: 52,
				x: 984,
				y: 336
			},
			{
				from: '4',
				to: '2',
				weight: 13,
				x: 668,
				y: 346
			},
			{
				from: '5',
				to: '6',
				weight: 65,
				x: 123,
				y: 333
			},
			{
				from: '5',
				to: '2',
				weight: 73,
				x: 123,
				y: 333
			},
			{
				from: '6',
				to: '4',
				weight: 68,
				x: 396,
				y: 338
			},
			{
				from: '6',
				to: '2',
				weight: 40,
				x: 396,
				y: 338
			},
			{ from: '7', to: '', weight: 18, x: 633, y: 6, status: 'default' },
			{
				from: '8',
				to: '',
				weight: 81,
				x: 888,
				y: 70
			},
			{
				from: '9',
				to: '',
				weight: 60,
				x: 800,
				y: 214
			}
		])
		this.render()
	}

	initializeGraphForLB62() {
		this.graph.graph = this.graph.createGraph([
			{ from: '1', to: '6', weight: 22, x: 500, y: 500 },
			{ from: '1', to: '5', weight: -31, x: 500, y: 500 },
			{ from: '1', to: '4', weight: -31, x: 500, y: 500 },
			{ from: '1', to: '3', weight: 52, x: 500, y: 500 },
			{
				from: '2',
				to: '9',
				weight: 37,
				x: 494,
				y: 216
			},
			{
				from: '3',
				to: '2',
				weight: -52,
				x: 984,
				y: 336
			},
			{
				from: '3',
				to: '9',
				weight: 89,
				x: 984,
				y: 336
			},
			{
				from: '3',
				to: '4',
				weight: -52,
				x: 984,
				y: 336
			},
			{
				from: '4',
				to: '2',
				weight: 13,
				x: 668,
				y: 346
			},
			{
				from: '5',
				to: '6',
				weight: -65,
				x: 123,
				y: 333
			},
			{
				from: '5',
				to: '2',
				weight: 73,
				x: 123,
				y: 333
			},
			{
				from: '6',
				to: '4',
				weight: 68,
				x: 396,
				y: 338
			},
			{
				from: '6',
				to: '2',
				weight: -40,
				x: 396,
				y: 338
			},
			{ from: '7', to: '', weight: 18, x: 633, y: 6, status: 'default' },
			{
				from: '8',
				to: '',
				weight: 81,
				x: 888,
				y: 70
			},
			{
				from: '9',
				to: '',
				weight: 60,
				x: 800,
				y: 214
			}
		])
		this.render()
	}

	#initilizeMenu() {
		const mainMenu = document.querySelector('#main-menu')
		const panel = document.querySelector('#panel')
		const form = document.querySelector('#form')
		const formHeading = document.querySelector('.panel__form-heading')
		const formCodeOutput = document.querySelector('#form-code-output')

		if (!formCodeOutput) return

		mainMenu?.addEventListener('click', async e => {
			if (!(e.target as HTMLElement).className.includes('menu__link')) return

			const targetDataId = (e.target as HTMLElement).dataset.id

			if (!targetDataId) {
				return
			}

			if (targetDataId === 'bfs' || targetDataId === 'dfs') {
				;(e.target as HTMLElement).classList.add('menu__link--active')

				const activeId = new Date().getTime()
				window.algorithmActiveId = new Date().getTime()

				this.#graphNodesStatusResetter(activeId)

				if (targetDataId === 'bfs') {
					const bfsAlgorithm = new BFS(this.graph, this.render.bind(this))
					await bfsAlgorithm.bfsWrapper(activeId)
				}

				if (targetDataId === 'dfs') {
					const dfsAlgorithm = new DFS(this.graph, this.render.bind(this))
					await dfsAlgorithm.dfsWrapper(activeId)
				}

				;(e.target as HTMLElement).classList.remove('menu__link--active')
				this.#graphNodesStatusResetter(activeId)

				return
			}

			if (targetDataId === 'reset') {
				window.algorithmActiveId = -1

				this.#graphNodesStatusResetter(window.algorithmActiveId)
				this.#graphEdgesTypeResetter(window.algorithmActiveId)
				return
			}

			if (targetDataId === 'mode') {
				if (this.graph.mode === 'directed') {
					this.graph.mode = 'undirected'
				} else {
					this.graph.mode = 'directed'
				}

				;(e.target as HTMLElement).textContent = this.graph.mode[0]
				this.render()
				return
			}

			if (targetDataId === 'change_graph') {
				if (this.lastGraph === 'default') {
					// lb61
					this.initializeGraphForLB61()
					;(e.target as HTMLElement).textContent = 'lb61'
					this.lastGraph = 'lb61'
					this.render()
					return
				}

				if (this.lastGraph === 'lb5') {
					this.initializeGraph()
					this.lastGraph = 'default'
					;(e.target as HTMLElement).textContent = 'd'
					this.render()
					return
				}

				if (this.lastGraph === 'lb61') {
					this.initializeGraphForLB62()
					this.lastGraph = 'lb62'
					;(e.target as HTMLElement).textContent = 'lb62'
					this.render()
					return
				}

				if (this.lastGraph === 'lb62') {
					this.initializeGraph()
					this.lastGraph = 'default'
					;(e.target as HTMLElement).textContent = 'd'
					this.render()
					return
				}

				return
			}

			if (targetDataId === 'weight') {
				if (this.graph.weights === true) {
					this.graph.weights = false
				} else {
					this.graph.weights = true
				}

				;(e.target as HTMLElement).textContent = this.graph.weights ? 'w' : 'nw'

				this.render()
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

			formCodeOutput.textContent = ''

			const start = document.querySelector(
				'#panel__form--from'
			) as HTMLInputElement
			const to = document.querySelector('#panel__form--to') as HTMLInputElement

			if (
				!start ||
				!to ||
				start.value === undefined ||
				to.value === undefined
			) {
				return
			}

			// @ts-expect-error TODO
			const algorithm = this.localState.algorithm

			const activeId = new Date().getTime()
			window.algorithmActiveId = activeId

			this.#graphNodesStatusResetter(activeId)

			const startNode = start && this.graph.graph.get(start.value)
			if (!startNode) return

			if (algorithm === 'lb5first') {
				startNode.status = 'done'

				const maxLevel = Number(to?.value) || 2

				const nodesByDeepLevel = new NodesByDeepLevel(
					this.graph,
					this.render.bind(this)
				)

				nodesByDeepLevel
					.getNodesByDeepLevel(startNode, [], activeId, maxLevel)
					.then(async value => {
						console.log(value)

						this.#graphNodesStatusResetter(activeId)
					})
			}

			if (algorithm === 'lb5second') {
				startNode.status = 'done'

				// const maxLevel = Number(to?.value) || 2

				this.lb5TaskSecond(activeId).then(async value => {
					console.log(value)

					this.#graphNodesStatusResetter(activeId)
				})
			}

			if (algorithm === 'lb6one') {
				startNode.status = 'done'
				this.render()

				const bellmanFord = new BellmanFord(this.graph)

				const distances = await bellmanFord.bellmanFord(startNode)

				if (distances) {
					const result = [...distances.entries()].reduce(
						(acc, [node, distance]) => {
							return {
								...acc,
								[node.value]: distance
							}
						},
						{}
					)

					formCodeOutput.textContent = JSON.stringify(result, null, 2)
				} else {
					console.log('Paths not found')
				}
			}

			const endNode = to && this.graph.graph.get(to.value)
			if (!endNode) return

			if (algorithm === 'lb6two') {
				startNode.status = 'done'
				endNode.status = 'done'

				const dijkstra = new Dijkstra(this.graph, this.render.bind(this))
				const result = await dijkstra.dijkstra(startNode, endNode)

				if (result === null) {
					formCodeOutput.textContent = 'Not found!'
				} else {
					formCodeOutput.textContent = result
						?.map(item => item.value)
						.join(' -> ')
				}
			}

			if (algorithm === 'lb6three') {
				const nodes = Array.from(this.graph.graph.values()).sort((a, b) => {
					return Number(a.value) - Number(b.value)
				})
				console.log('%c⧭', 'color: #731d1d', nodes)

				const floydWarshall = new FloydWarshall(this.graph)
				const result = await floydWarshall.floydWarshall(nodes)

				result.unshift([])
				result.unshift(nodes.map(node => node.value))

				formCodeOutput.textContent = JSON.stringify(
					[
						...result.map(item => {
							const tmp: string[] = []

							item.map(subItem => {
								let s = String(subItem)

								if (subItem === Infinity) {
									s = '-'
								}

								if (s.length < 2) {
									s = ' ' + s
								}

								if (s.length < 3 && s.length === 2) {
									s = ' ' + s
								}

								tmp.push(s)
							})

							return tmp.join(',')
						})
					],
					null,
					2
				)
			}
		})
	}
}

const app = new App()

app.initializeApp()
