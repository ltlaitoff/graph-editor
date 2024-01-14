export {}

declare global {
	interface Window {
		DEBUG: boolean
		algorithmActiveId: number
		render: () => void
	}
}

window.DEBUG = false
window.algorithmActiveId = -1
window.render = () => {}
