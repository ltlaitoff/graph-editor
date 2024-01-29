import { Preset } from '../types/PresetItem.ts'

export const DEFAULT_PRESET: Preset = {
	nodes: [
		{ value: '1', x: 751, y: 189 },
		{ value: '2', x: 516, y: 335 },
		{ value: '3', x: 691, y: 372 },
		{ value: '4', x: 1020, y: 336 },
		{ value: '5', x: 390, y: 508 },
		{ value: '6', x: 564, y: 511 },
		{ value: '7', x: 681, y: 502 },
		{ value: '8', x: 855, y: 494 },
		{ value: '9', x: 961, y: 492 },
		{ value: '10', x: 1136, y: 484 },
		{ value: '11', x: 622, y: 657 },
		{ value: '12', x: 1002, y: 646 },
		{ value: '13', x: 813, y: 649 }
	],
	edges: [
		{ from: '1', to: '9', weight: 1 },
		{ from: '1', to: '2', weight: 1 },
		{ from: '1', to: '3', weight: 1 },
		{ from: '1', to: '4', weight: 1 },
		{ from: '2', to: '5', weight: 1 },
		{ from: '2', to: '6', weight: 1 },
		{ from: '3', to: '7', weight: 1 },
		{ from: '3', to: '8', weight: 1 },
		{ from: '4', to: '9', weight: 1 },
		{ from: '4', to: '10', weight: 1 },
		{ from: '5', to: '', weight: 1 },
		{ from: '6', to: '11', weight: 1 },
		{ from: '7', to: '11', weight: 1 },
		{ from: '8', to: '1', weight: 1 },
		{ from: '9', to: '12', weight: 1 },
		{ from: '10', to: '', weight: 1 },
		{ from: '11', to: '13', weight: 1 },
		{ from: '12', to: '', weight: 1 },
		{ from: '13', to: '12', weight: 1 }
	]
}
