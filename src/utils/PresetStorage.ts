import { StoragePresets } from '../types/StoragePresets.ts'

export class PresetStorage {
	key = 'presets'

	writeAll(data: StoragePresets) {
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
