import { Preset } from '../types/PresetItem'

export const WEIGHTS_PRESET: Preset = {
	nodes: [
		{ value: '1', x: 500, y: 500 },
		{ value: '1', x: 500, y: 500 },
		{ value: '1', x: 500, y: 500 },
		{ value: '1', x: 500, y: 500 },
		{ value: '2', x: 494, y: 216 },
		{ value: '3', x: 984, y: 336 },
		{ value: '3', x: 984, y: 336 },
		{ value: '3', x: 984, y: 336 },
		{ value: '4', x: 668, y: 346 },
		{ value: '5', x: 123, y: 333 },
		{ value: '5', x: 123, y: 333 },
		{ value: '6', x: 396, y: 338 },
		{ value: '6', x: 396, y: 338 },
		{ value: '7', x: 633, y: 6 },
		{ value: '8', x: 888, y: 70 },
		{ value: '9', x: 800, y: 214 }
	],
	edges: [
		{ from: '1', to: '6', weight: 22 },
		{ from: '1', to: '5', weight: 31 },
		{ from: '1', to: '4', weight: 31 },
		{ from: '1', to: '3', weight: 52 },
		{ from: '2', to: '9', weight: 37 },
		{ from: '3', to: '2', weight: 52 },
		{ from: '3', to: '9', weight: 89 },
		{ from: '3', to: '4', weight: 52 },
		{ from: '4', to: '2', weight: 13 },
		{ from: '5', to: '6', weight: 65 },
		{ from: '5', to: '2', weight: 73 },
		{ from: '6', to: '4', weight: 68 },
		{ from: '6', to: '2', weight: 40 },
		{ from: '7', to: '', weight: 18 },
		{ from: '8', to: '', weight: 81 },
		{ from: '9', to: '', weight: 60 }
	]
}
