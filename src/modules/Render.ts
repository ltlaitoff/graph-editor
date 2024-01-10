import { NODE_COLORS } from '../config/nodeColors.ts'
import { Node } from '../models/Node.ts'
import { Graph } from '../models/Graph.ts'

export class Render {
	#getNodeStatusForRender(
		node: Node,
		currentClickedTarget: HTMLElement | null
	) {
		return currentClickedTarget &&
			currentClickedTarget.dataset.elementid === node.value
			? 'checked'
			: node.status
	}

	#getRenderedCircles(
		graph: Graph,
		offsetX: number,
		offsetY: number,
		currentClickedTarget: HTMLElement | null
	) {
		return [...graph.graph.entries()].map(([_, node]) => {
			const status = this.#getNodeStatusForRender(node, currentClickedTarget)
			const x = (node.x ?? 0) + offsetX
			const y = (node.y ?? 0) + offsetY

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
		})
	}

	#getLinesForRender(graph: Graph, offsetX: number, offsetY: number) {
		return (
			[...graph.graph.entries()]
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

						if (edge.status === 'no-direction' && graph.mode !== 'undirected')
							return

						const color =
							edge.status === 'no-direction' && window.DEBUG
								? 'green'
								: edge.type === 'default'
								  ? 'black'
								  : edge.type === 'back'
								    ? 'lightblue'
								    : edge.type === 'cross'
								      ? 'lightgreen'
								      : 'lightpink'

						const arrow = `<path stroke="${color}" fill="${color}" d="M -15 5.5 L 0 0 L -15 -5.5 Z" transform="translate (${
							adjacentNodeX + offsetX - distanceFromCenter[0]
						} ${
							adjacentNodeY + offsetY - distanceFromCenter[1]
						}) rotate(${arrowRotateDegWithReflection})"></path>`

						const textPosition = {
							x: (nodeX + adjacentNodeX) / 2 + distanceFromCenter[0] + offsetX,
							y: (nodeY + adjacentNodeY) / 2 + distanceFromCenter[1] + offsetY
						}

						const text = `
							<text x="${textPosition.x}" y="${textPosition.y}" style="stroke:white; stroke-width:0.6em">${edge.weight}</text>
							<text x="${textPosition.x}" y="${textPosition.y}" style="fill:black">${edge.weight}</text> `

						return `<g>
							<path
							class="content--edge"
								d="M ${nodeX + offsetX} ${nodeY + offsetY} L ${adjacentNodeX + offsetX} ${
									adjacentNodeY + offsetY
								}"
								fill="none"
								stroke-width="2"
								stroke="${color}"
							></path>
							<path
							class="content--edge"
							d="M ${nodeX + offsetX} ${nodeY + offsetY} L ${adjacentNodeX + offsetX} ${
								adjacentNodeY + offsetY
							}"
								opacity="0"
								fill="none"
								stroke-width="30"
								stroke="${color}"
							></path>
							${graph.mode === 'directed' || window.DEBUG ? arrow : ''}
							${graph.weights ? text : ''}
						</g>`
					})
				})
				.flat()
		)
	}

	render(
		graph: Graph,
		offsetX: number,
		offsetY: number,
		pressedKeyCode: string | null,
		currentClickedTarget: HTMLElement | null
	) {
		const ourNodes = this.#getRenderedCircles(
			graph,
			offsetX,
			offsetY,
			currentClickedTarget
		)
		const ourEdges = this.#getLinesForRender(graph, offsetX, offsetY)

		document.querySelector<HTMLDivElement>('#content')!.innerHTML = `
			<div class="graph__wrapper">
				<svg
				width="100%"
				height="100%"
				preserveAspectRatio="none"
				cursor="${pressedKeyCode === 'Space' ? 'grabbing' : 'default'}"
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
