export class SidePanel {
	root: HTMLElement
	public formId: string = ''
	private _opened: boolean = false

	get opened() {
		return this._opened
	}

	set opened(newValue: boolean) {
		this._opened = newValue
		if (newValue === false) {
			this.root.classList.remove('panel--opened')
		} else {
			this.root.classList.add('panel--opened')
		}
	}

	constructor(id: string) {
		const newRoot = document.querySelector(`.${id}`)

		if (!newRoot) {
			throw new Error('Error with SidePanel id')
		}

		this.root = newRoot as HTMLElement
	}

	renderForm(form: HTMLElement, formId: string) {
		this.root.innerHTML = ''
		this.root.append(form)
		this.formId = formId
	}

	open() {
		this.opened = true
	}

	close() {
		this.opened = false
	}
}
