export class Menu {
	items: MenuItem[] = []

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
			...this.items.map(item => {
				const listElement = document.createElement('li')
				listElement.className = 'menu__item'

				const button = document.createElement('button')
				button.className = 'menu__link'

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

	addItem(item: MenuItem) {
		this.items.push(item)
	}
}

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
