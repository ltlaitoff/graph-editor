function getRandomInt(max: number) {
	return Math.floor(Math.random() * max)
}

export class Form {
	inputs: HTMLElement[] = []
	title: string
	callback: (value: Record<string, string>) => void

	constructor(
		title: string,
		callback: (value: Record<string, string>) => void
	) {
		this.title = title
		this.callback = callback
	}

	addInput(key: string, title: string) {
		const id = `${getRandomInt(1000)}-${new Date().getTime()}`

		const label = document.createElement('label')
		label.className = 'panel__form-label'
		label.htmlFor = id

		const div = document.createElement('div')
		div.textContent = title

		const input = document.createElement('input')
		input.className = 'panel__form-input panel__form-input--from'
		input.id = id
		input.dataset.key = key
		input.type = 'text'

		label.append(div, input)

		this.inputs.push(label)
	}

	getForRender() {
		const form = document.createElement('form')
		form.className = 'panel__form'

		const h2 = document.createElement('h2')
		h2.className = 'panel__form-heading'
		h2.textContent = this.title

		form.append(h2)
		form.append(...this.inputs)

		const button = document.createElement('button')
		button.textContent = 'Run'
		button.className = 'panel__form-button'

		form.append(button)

		form.onsubmit = e => {
			e.preventDefault()

			const allInputs = [
				...(e.target as HTMLFormElement).querySelectorAll('input')
			]

			const result = allInputs.reduce((acc, input) => {
				const key = input.dataset.key

				if (!key) {
					return acc
				}

				return {
					...acc,
					[key]: input.value
				}
			}, {})

			this.callback(result)
		}

		return form
	}
}
