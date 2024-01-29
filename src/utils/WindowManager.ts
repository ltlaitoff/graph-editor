/* eslint-disable */
/* Remove eslint disable on usage :) */

class WindowManager {
	#windows: any
	#count: any
	#id: any
	#winData: any
	#winShapeChangeCallback: (() => void) | null = null
	#winChangeCallback: (() => void) | null = null

	constructor() {
		// event listener for when localStorage is changed from another window
		addEventListener('storage', event => {
			if (event.key == 'windows') {
				const newValue = event.newValue

				if (!newValue) return

				const newWindows = JSON.parse(newValue)
				const winChange = this.#didWindowsChange(this.#windows, newWindows)

				this.#windows = newWindows

				if (winChange) {
					if (this.#winChangeCallback) this.#winChangeCallback()
				}
			}
		})

		// event listener for when current window is about to ble closed
		window.addEventListener('beforeunload', e => {
			let index = this.getWindowIndexFromId(this.#id)

			//remove this window from the list and update local storage
			this.#windows.splice(index, 1)
			this.updateWindowsLocalStorage()
		})
	}

	// check if theres any changes to the window list
	#didWindowsChange(pWins, nWins) {
		if (pWins.length != nWins.length) {
			return true
		} else {
			let c = false

			for (let i = 0; i < pWins.length; i++) {
				if (pWins[i].id != nWins[i].id) c = true
			}

			return c
		}
	}

	// initiate current window (add metadata for custom data to store with each window instance)
	init(metaData) {
		this.#windows = JSON.parse(localStorage.getItem('windows')) || []
		this.#count = localStorage.getItem('count') || 0
		this.#count++

		this.#id = this.#count
		let shape = this.getWinShape()
		this.#winData = { id: this.#id, shape: shape, metaData: metaData }
		this.#windows.push(this.#winData)

		localStorage.setItem('count', this.#count)
		this.updateWindowsLocalStorage()
	}

	getWinShape() {
		let shape = {
			x: window.screenLeft,
			y: window.screenTop,
			w: window.innerWidth,
			h: window.innerHeight
		}
		return shape
	}

	getWindowIndexFromId(id) {
		let index = -1

		for (let i = 0; i < this.#windows.length; i++) {
			if (this.#windows[i].id == id) index = i
		}

		return index
	}

	updateWindowsLocalStorage() {
		localStorage.setItem('windows', JSON.stringify(this.#windows))
	}

	update() {
		//console.log(step);
		let winShape = this.getWinShape()

		//console.log(winShape.x, winShape.y);

		if (
			winShape.x != this.#winData.shape.x ||
			winShape.y != this.#winData.shape.y ||
			winShape.w != this.#winData.shape.w ||
			winShape.h != this.#winData.shape.h
		) {
			this.#winData.shape = winShape

			let index = this.getWindowIndexFromId(this.#id)
			this.#windows[index].shape = winShape

			//console.log(windows);
			if (this.#winShapeChangeCallback) this.#winShapeChangeCallback()
			this.updateWindowsLocalStorage()
		}
	}

	setWinShapeChangeCallback(callback: () => void) {
		this.#winShapeChangeCallback = callback
	}

	setWinChangeCallback(callback: () => void) {
		this.#winChangeCallback = callback
	}

	getWindows() {
		return this.#windows
	}

	getThisWindowData() {
		return this.#winData
	}

	getThisWindowID() {
		return this.#id
	}
}

export default WindowManager
