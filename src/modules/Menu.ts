type TextColors =
	| 'pink'
	| 'green'
	| 'sky'
	| 'amber'
	| 'lime'
	| 'teal'
	| 'indigo'
	| 'purple'
	| 'rose'

export class Menu {
	items: [MenuItem | MenuDivider, TextColors][] = []

	section: Element

	constructor() {
		const section = document.querySelector('#menu')

		if (!section) {
			throw new Error('section not found')
		}

		this.section = section
	}

	render() {
		const nav = document.createElement('nav')
		nav.className = 'menu__nav'

		const ul = document.createElement('ul')
		ul.className = 'menu__list'

		ul.append(
			...this.items.map(([item, color]) => {
				const listElement = document.createElement('li')
				listElement.className = 'menu__item'

				if (item instanceof MenuItem) {
					const button = document.createElement('button')
					button.className = `menu__link menu__link--${color}`

					button.textContent = item.text
					button.onclick = async e => {
						if (item.highlight) {
							button.classList.add('menu__link--active')
						}

						await item.callback(e.target as HTMLButtonElement)

						if (item.highlight) {
							button.classList.remove('menu__link--active')
						}
					}

					listElement.append(button)
				}

				if (item instanceof MenuDivider) {
					const divider = document.createElement('div')
					divider.className = `menu__divider`

					listElement.append(divider)
				}

				return listElement
			})
		)

		nav.append(ul)
		nav.onclick = e => {
			e.stopPropagation()
		}

		this.section.innerHTML = ''
		this.section.append(nav)
	}

	addItem(item: MenuItem | MenuDivider, color: TextColors = 'pink') {
		this.items.push([item, color])
	}
}

export class MenuDivider {}

export class MenuItem {
	text: string
	callback: (target: HTMLButtonElement) => Promise<void>
	highlight: boolean

	constructor(
		text: string,
		callback: (target: HTMLButtonElement) => Promise<void>,
		highlight: boolean = false
	) {
		this.text = text
		this.callback = callback
		this.highlight = highlight
	}
}
