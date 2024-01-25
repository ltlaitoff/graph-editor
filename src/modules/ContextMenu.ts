export class ContextMenu {
	root: Element
	items: (ContextItem<unknown> | ContextDivider)[] = []

	private _open = false

	get open() {
		return this._open
	}

	set open(value: boolean) {
		this._open = value
	}

	close() {
		this.root.innerHTML = ''
		this.items = []
		this.root.setAttribute('style', '')

		this.open = false
	}

	constructor() {
		const root = document.querySelector('#contextMenu')

		if (!root) {
			throw new Error('Error in context root')
		}

		this.root = root

		this.root.addEventListener('mousedown', e => {
			e.stopPropagation()
		})
	}

	renderItems() {
		this.root.innerHTML = ''

		this.items.map(item => {
			if (item instanceof ContextDivider) {
				const divider = document.createElement('div')
				divider.className = 'context-menu__divider'
				this.root.append(divider)
				return
			}

			const button = document.createElement('button')
			button.className = 'context-menu__button'

			button.innerHTML = `
			<div class="context-menu__button_key">${item.key?.name}</div>
			<div class="content-menu__button_name">${item.text}</div>
			`

			button.addEventListener('click', e => {
				item.callback(e.target as HTMLButtonElement, item.other)
			})

			this.root.append(button)
		})

		this.open = true
	}

	addItem(item: ContextItem<unknown> | ContextDivider) {
		this.items.push(item)
	}

	changePosition(x: number, y: number) {
		this.root.setAttribute('style', `top: ${y}px; left: ${x}px`)
	}

	keyPressed(key: string) {
		const itemByPressedKey = this.items.find(item => {
			if (!(item instanceof ContextItem)) return false

			return item.key?.code === key
		}) as ContextItem<unknown>

		console.log(key, itemByPressedKey)

		if (!itemByPressedKey) return

		itemByPressedKey.callback(
			document.createElement('button'),
			itemByPressedKey.other
		)
	}
}

interface ContextItemKey {
	name: string
	code: string
}

export class ContextItem<T> {
	text: string
	callback: (target: HTMLButtonElement, other: T) => Promise<void>
	other?: T
	key?: ContextItemKey

	constructor(
		text: string,
		callback: (target: HTMLButtonElement, other: T) => Promise<void>,
		other?: T,
		key?: ContextItemKey
	) {
		this.text = text
		this.callback = callback
		this.other = other
		this.key = key
	}
}

export class ContextDivider {}
