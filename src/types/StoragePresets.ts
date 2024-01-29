import { PresetEdge, PresetNode } from './PresetItem.ts'

export type StoragePresets = Record<
	string,
	{
		nodes: PresetNode[]
		edges: PresetEdge[]
	}
>
