export const resetActiveId = () => {
	const activeId = new Date().getTime()
	window.algorithmActiveId = activeId
}
