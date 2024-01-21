import './style.css'
import { Node } from './models/Node.ts'
import { DELAY } from './config/delay.ts'
import { Render } from './modules/Render.ts'

import { resetActiveId, setNodeStatus, sleep } from './helpers'
import { BFS } from './algorithms/BFS'
import { DFS } from './algorithms/DFS'
import { Dijkstra } from './algorithms/Dijkstra.ts'
import { BellmanFord } from './algorithms/BellmanFord.ts'
import { FloydWarshall } from './algorithms/FloydWarshall.ts'
import { NodesByDeepLevel } from './algorithms/NodesByDeepLevel.ts'
import { DEFAULT_PRESET, MINUS_WEIGHTS_PRESET, WEIGHTS_PRESET } from './presets'
import { Menu, MenuItem } from './modules/Menu.ts'
import { Graph } from './models/Graph.ts'
import { SidePanel } from './modules/Panel.ts'
import { Form } from './modules/Form.ts'

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
		this.initializeGraph('weight')
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

		await setNodeStatus(
			node,
			{
				status: 'progress',
				sleep: false
			},
			this.render.bind(this)
		)

		await sleep(DELAY)

		this.render()

		// console.log('DFS:', jungle.map(item => item.value).join(', 	'))
	}

	private initializeGraph(
		type: 'default' | 'weight' | 'minus-weight' = 'default'
	) {
		let graphData = []

		switch (type) {
			case 'default': {
				graphData = DEFAULT_PRESET
				break
			}
			case 'weight': {
				graphData = WEIGHTS_PRESET
				break
			}
			case 'minus-weight': {
				graphData = MINUS_WEIGHTS_PRESET
				break
			}
		}

		this.graph.graph = this.graph.createGraph(graphData)
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
		this.#initializeUserEvents()
		this.#initilizeMenu()
	}

	#initializeUserEvents() {
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

	async #algotihmWrapper(callback: () => Promise<void>) {
		resetActiveId()

		this.#graphNodesStatusResetter(window.algorithmActiveId)

		await callback()

		this.#graphNodesStatusResetter(window.algorithmActiveId)
	}

	#initilizeMenu() {
		const menu = new Menu()

		const bfsElement = new MenuItem(
			'bfs',
			async () => {
				this.#algotihmWrapper(async () => {
					const bfsAlgorithm = new BFS(this.graph, this.render.bind(this))
					await bfsAlgorithm.bfsWrapper(window.algorithmActiveId)
				})
			},
			true
		)

		const dfsElement = new MenuItem(
			'dfs',
			async () => {
				this.#algotihmWrapper(async () => {
					const dfsAlgorithm = new DFS(this.graph, this.render.bind(this))
					await dfsAlgorithm.dfsWrapper(window.algorithmActiveId)
				})
			},
			true
		)

		const resetElement = new MenuItem('reset', async () => {
			window.algorithmActiveId = -1

			this.#graphNodesStatusResetter(window.algorithmActiveId)
			this.#graphEdgesTypeResetter(window.algorithmActiveId)
		})

		const modeElement = new MenuItem('directed', async target => {
			if (this.graph.mode === 'directed') {
				this.graph.mode = 'undirected'
			} else {
				this.graph.mode = 'directed'
			}

			target.textContent = this.graph.mode
			this.render()
		})

		const changeGraphElement = new MenuItem('d', async target => {
			if (this.lastGraph === 'default') {
				this.initializeGraph('weight')
				target.textContent = 'lb61'
				this.lastGraph = 'lb61'
			}

			if (this.lastGraph === 'lb5') {
				this.initializeGraph()
				this.lastGraph = 'default'
				target.textContent = 'd'
			}

			if (this.lastGraph === 'lb61') {
				this.initializeGraph('minus-weight')
				this.lastGraph = 'lb62'
				target.textContent = 'lb62'
			}

			if (this.lastGraph === 'lb62') {
				this.initializeGraph()
				this.lastGraph = 'default'
				target.textContent = 'd'
			}

			this.render()
		})

		const weightElement = new MenuItem('w', async target => {
			if (this.graph.weights === true) {
				this.graph.weights = false
			} else {
				this.graph.weights = true
			}

			target.textContent = this.graph.weights ? 'w' : 'nw'

			this.render()
		})

		const sidePanel = new SidePanel('panel')

		const deepElement = new MenuItem('deep', async () => {
			const FORM_KEY = 'deep'

			if (sidePanel.formId === FORM_KEY && sidePanel.opened) {
				sidePanel.close()
				return
			}

			const deepForm = new Form('Deep level', async data => {
				if (data.startNodeId === undefined || data.endNodeId === undefined) {
					return
				}

				const startNode = this.graph.graph.get(data.startNodeId)
				if (!startNode || data.endNodeId === undefined) return

				resetActiveId()
				startNode.status = 'done'

				const maxLevel = Number(data.endNodeId) || 2

				const nodesByDeepLevel = new NodesByDeepLevel(
					this.graph,
					this.render.bind(this)
				)

				const value = await nodesByDeepLevel.getNodesByDeepLevel(
					startNode,
					[],
					window.algorithmActiveId,
					maxLevel
				)

				console.log(value)

				this.#graphNodesStatusResetter(window.algorithmActiveId)
			})

			deepForm.addInput('startNodeId', 'Start node id:')
			deepForm.addInput('endNodeId', 'Deep level:')

			sidePanel.renderForm(deepForm.getForRender(), FORM_KEY)
			sidePanel.open()
		})

		const idk1Element = new MenuItem('idk-1', async () => {
			const FORM_KEY = 'idk-1'

			if (sidePanel.formId === FORM_KEY && sidePanel.opened) {
				sidePanel.close()
				return
			}

			const deepForm = new Form('IDK-1', async data => {
				if (data.startNodeId === undefined) {
					return
				}

				const startNode = this.graph.graph.get(data.startNodeId)
				if (!startNode) return

				resetActiveId()
				startNode.status = 'done'
				// TODO: Add checkbox auto reset
				// TODO: Add use node in algorithm
				const value = await this.lb5TaskSecond(window.algorithmActiveId)

				console.log(value)

				this.#graphEdgesTypeResetter(window.algorithmActiveId)
				this.#graphNodesStatusResetter(window.algorithmActiveId)
			})

			deepForm.addInput('startNodeId', 'Start node id:')

			sidePanel.renderForm(deepForm.getForRender(), FORM_KEY)
			sidePanel.open()
		})

		const bellmanFordElement = new MenuItem('bellmanFord', async () => {
			const FORM_KEY = 'bellmanFord'

			if (sidePanel.formId === FORM_KEY && sidePanel.opened) {
				sidePanel.close()
				return
			}

			const bellmanFordForm = new Form('Bellman Ford', async data => {
				if (data.startNodeId === undefined) {
					return
				}

				const startNode = this.graph.graph.get(data.startNodeId)
				if (!startNode) return

				resetActiveId()
				startNode.status = 'done'

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

					console.log(result)
					// 					formCodeOutput.textContent = JSON.stringify(result, null, 2)
				} else {
					console.log('Paths not found')
				}

				this.#graphNodesStatusResetter(window.algorithmActiveId)
			})

			bellmanFordForm.addInput('startNodeId', 'Start node id:')

			sidePanel.renderForm(bellmanFordForm.getForRender(), FORM_KEY)
			sidePanel.open()
		})

		const dijkstraElement = new MenuItem('dijkstra', async () => {
			const FORM_KEY = 'dijkstra'

			if (sidePanel.formId === FORM_KEY && sidePanel.opened) {
				sidePanel.close()
				return
			}

			const dijkstraForm = new Form('Dijkstra', async data => {
				if (data.startNodeId === undefined || data.endNodeId === undefined) {
					return
				}

				const startNode = this.graph.graph.get(data.startNodeId)
				const endNode = this.graph.graph.get(data.endNodeId)

				if (!startNode || !endNode) return

				resetActiveId()

				startNode.status = 'done'
				endNode.status = 'done'

				const dijkstra = new Dijkstra(this.graph, this.render.bind(this))
				const result = await dijkstra.dijkstra(startNode, endNode)

				console.log(result)
				if (result === null) {
					// 	formCodeOutput.textContent = 'Not found!'
				} else {
					// 	formCodeOutput.textContent = result
					// 	?.map(item => item.value)
					// 						.join(' -> ')
				}

				this.#graphNodesStatusResetter(window.algorithmActiveId)
			})

			dijkstraForm.addInput('startNodeId', 'Start node id:')
			dijkstraForm.addInput('endNodeId', 'End node id:')

			sidePanel.renderForm(dijkstraForm.getForRender(), FORM_KEY)
			sidePanel.open()
		})

		const floydWarshallElement = new MenuItem('floydWarshall', async () => {
			const FORM_KEY = 'floydWarshall'

			if (sidePanel.formId === FORM_KEY && sidePanel.opened) {
				sidePanel.close()
				return
			}

			const floydWarshallForm = new Form('Floyd Warshall', async () => {
				resetActiveId()

				const nodes = Array.from(this.graph.graph.values()).sort((a, b) => {
					return Number(a.value) - Number(b.value)
				})
				console.log('%c⧭', 'color: #731d1d', nodes)

				const floydWarshall = new FloydWarshall(this.graph)
				const result = await floydWarshall.floydWarshall(nodes)

				result.unshift([])
				result.unshift(nodes.map(node => node.value))

				const text = JSON.stringify(
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

				console.log(text)

				this.#graphNodesStatusResetter(window.algorithmActiveId)
			})

			sidePanel.renderForm(floydWarshallForm.getForRender(), FORM_KEY)
			sidePanel.open()
		})

		menu.addItem(bfsElement)
		menu.addItem(dfsElement)
		menu.addItem(resetElement)
		menu.addItem(modeElement)
		menu.addItem(changeGraphElement)
		menu.addItem(weightElement)
		menu.addItem(deepElement)
		menu.addItem(idk1Element)
		menu.addItem(bellmanFordElement)
		menu.addItem(dijkstraElement)
		menu.addItem(floydWarshallElement)

		menu.render()
	}
}

const app = new App()

app.initializeApp()
