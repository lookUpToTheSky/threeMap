onmessage = async(e) => {
	console.log(`收到了主进程发出的信息：${e.data}`); 
	let url = e.data
	// 收到了主进程发出的信息：hello worker
	const fetchJson = async (url) => {
		const data = await fetch(url).then(async (res) => {
			let json = await res.json()
			return json
		})
		return data
	}
	let data = await fetchJson(url)
	postMessage(data);
}