export interface PresetNode {
	value: string
	x: number
	y: number
}

export interface PresetEdge {
	from: string
	to: string
	weight: number
}

export interface Preset {
	nodes: PresetNode[]
	edges: PresetEdge[]
}
