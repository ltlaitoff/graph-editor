export {}

declare global {
	interface Window {
		DEBUG: boolean
		algorithmActiveId: number
	}
}

window.DEBUG = false
window.algorithmActiveId = -1
