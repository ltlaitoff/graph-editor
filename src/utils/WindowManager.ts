/* eslint-disable */
/* Remove eslint disable on usage :) */

class WindowManager {
	offsetUpdateCallback: (() => void) | null = null
	presetsUpdateCallback: (() => void) | null = null

	constructor() {
		addEventListener('storage', event => {
			if (event.key === 'offsets') {
				if (this.offsetUpdateCallback) {
					this.offsetUpdateCallback()
				}
			}

			if (event.key === 'presets') {
				if (this.presetsUpdateCallback) {
					this.presetsUpdateCallback()
				}
			}
		})

		window.addEventListener('beforeunload', e => {
			alert('beforeunload' + JSON.stringify(e))
		})
	}

	setUpdateOffsetCallback(callback: () => void) {
		this.offsetUpdateCallback = callback
	}

	setPresetsUpdateCallback(callback: () => void) {
		this.presetsUpdateCallback = callback
	}
}

export default WindowManager
