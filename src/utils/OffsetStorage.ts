import { Offset } from '../types/Offset.ts'

export class OffsetStorage {
	key = 'offsets'

	writeAll(data: Offset) {
		localStorage.setItem(this.key, JSON.stringify(data))
	}

	read() {
		const value = localStorage.getItem(this.key)

		if (!value) {
			return null
		}

		return JSON.parse(value)
	}
}
