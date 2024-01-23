import './style.css'
import { Render } from './modules/Render.ts'

import { resetActiveId } from './helpers'
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
import { EdgesTypes } from './algorithms/EdgesTypes.ts'

class UserInteractionManager {
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

	currentClickedTarget: HTMLElement | null = null

	pressedKeyCode: string | null = null

	constructor(graph: Graph) {
		this.graph = graph
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

	render() {
		const render = new Render()

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
}

class App {
	graph: Graph
	lastGraph: 'default' | 'lb5' | 'lb61' | 'lb62' = 'default'
	render: () => void = () => {}
	menu: Menu | null = null

	constructor() {
		this.graph = new Graph()
		this.initializeGraph('weight')
	}

	initialize() {
		const userInteractionManager = new UserInteractionManager(this.graph)

		userInteractionManager.initializeApp()

		this.render = userInteractionManager.render.bind(userInteractionManager)
		this.menu = this.initializeMenu()
		this.initializeHidePanelButton()
	}

	initializeHidePanelButton() {
		const hidePanelButton = document.querySelector('#hidePanelButton')
		if (!hidePanelButton) return

		hidePanelButton.addEventListener('click', e => {
			e.stopPropagation()

			if (!this.menu) return

			this.menu.section.classList.toggle('menu--hidden')
			e.currentTarget.classList.toggle('hide-menu--active')
		})
	}

	graphNodesStatusResetter(id: number) {
		if (window.algorithmActiveId !== id) return

		this.graph.graph.forEach(node => {
			if (window.algorithmActiveId !== id) return

			node.status = 'default'
		})

		this.render()
	}

	graphEdgesTypeResetter(id: number) {
		if (window.algorithmActiveId !== id) return

		this.graph.graph.forEach(node => {
			if (window.algorithmActiveId !== id) return

			node.edges.forEach(edge => {
				edge.type = 'default'
			})
		})

		this.render()
	}

	async algorithmWrapper(callback: () => Promise<void>) {
		resetActiveId()

		this.graphNodesStatusResetter(window.algorithmActiveId)

		await callback()

		this.graphNodesStatusResetter(window.algorithmActiveId)
	}

	initializeGraph(type: 'default' | 'weight' | 'minus-weight' = 'default') {
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

	initializeMenu() {
		const menu = new Menu()

		const bfsElement = new MenuItem(
			'bfs',
			async () => {
				this.algorithmWrapper(async () => {
					const bfsAlgorithm = new BFS(this.graph, this.render)
					await bfsAlgorithm.bfsWrapper(window.algorithmActiveId)
				})
			},
			true
		)

		const dfsElement = new MenuItem(
			'dfs',
			async () => {
				this.algorithmWrapper(async () => {
					const dfsAlgorithm = new DFS(this.graph, this.render)
					await dfsAlgorithm.dfsWrapper(window.algorithmActiveId)
				})
			},
			true
		)

		const resetElement = new MenuItem('reset', async () => {
			window.algorithmActiveId = -1

			this.graphNodesStatusResetter(window.algorithmActiveId)
			this.graphEdgesTypeResetter(window.algorithmActiveId)
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
				const startNode = this.graph.graph.get(data.startNodeId)
				if (!startNode || data.endNodeId === undefined) return

				resetActiveId()
				startNode.status = 'done'

				const maxLevel = Number(data.endNodeId) || 2

				const nodesByDeepLevel = new NodesByDeepLevel(this.graph, this.render)

				const value = await nodesByDeepLevel.getNodesByDeepLevel(
					startNode,
					[],
					window.algorithmActiveId,
					maxLevel
				)

				console.log(value)

				this.graphNodesStatusResetter(window.algorithmActiveId)
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
				const startNode = this.graph.graph.get(data.startNodeId)
				if (!startNode) return

				resetActiveId()
				startNode.status = 'done'

				const edgesTypes = new EdgesTypes(this.render, this.graph)

				const value = await edgesTypes.edgesTypes(window.algorithmActiveId)

				// TODO: Add checkbox auto reset
				// TODO: Add use node in algorithm

				console.log(value)

				this.graphEdgesTypeResetter(window.algorithmActiveId)
				this.graphNodesStatusResetter(window.algorithmActiveId)
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
					bellmanFordForm.renderCustomOutput(JSON.stringify(result, null, 2))
				} else {
					bellmanFordForm.renderCustomOutput('Paths not found')
				}

				this.graphNodesStatusResetter(window.algorithmActiveId)
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
				const startNode = this.graph.graph.get(data.startNodeId)
				const endNode = this.graph.graph.get(data.endNodeId)

				if (!startNode || !endNode) return

				resetActiveId()

				startNode.status = 'done'
				endNode.status = 'done'

				const dijkstra = new Dijkstra(this.graph, this.render)
				const result = await dijkstra.dijkstra(startNode, endNode)

				console.log(result)
				if (result === null) {
					dijkstraForm.renderCustomOutput('Not found!')
				} else {
					dijkstraForm.renderCustomOutput(
						result?.map(item => item.value).join(' -> ')
					)
				}

				this.graphNodesStatusResetter(window.algorithmActiveId)
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

				floydWarshallForm.renderCustomOutput(text)

				this.graphNodesStatusResetter(window.algorithmActiveId)
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
		return menu
	}
}

const app = new App()

app.initialize()
