import { Node } from '../models/Node.ts'
import { sleep } from './sleep.ts'
import { DELAY } from '../config/delay.ts'

export async function setNodeStatus(
	node: Node,
	params: {
		status?: Node['status']
		sleep?: boolean
		render?: boolean
		statusForChange?: Node['status'] | 'any'
		renderBeforeSleep?: boolean
	} = {},
	render: () => void
) {
	const status = params.status ?? 'default'
	const sleepFlag = params.sleep ?? true
	const renderProp = params.render ?? true
	const statusForChange = params.statusForChange ?? node.status
	const renderBeforeSleep = params.renderBeforeSleep ?? false

	if (statusForChange && statusForChange === node.status) {
		node.status = status
	}

	if (renderProp && renderBeforeSleep) {
		render()
	}

	if (sleepFlag) {
		await sleep(DELAY)
	}

	if (renderProp && !renderBeforeSleep) {
		render()
	}
}
