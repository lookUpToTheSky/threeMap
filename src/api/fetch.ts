import { decodeGeo } from '@/utils/decodeGeojson'
export const fetchJson = async (url: string) => {
    return new Promise((resovle, reject) => {
      const work = new Worker('work.js');
      work.postMessage(url)
      work.onmessage = (e) => {
        resovle(decodeGeo(e.data))
        work.terminate();
        self.close(); 
      };
    })
  }

export const getAreaList = async () => {
    const data = await fetch('/source/area/china.json').then(async (res) => {
      return await res.json()
    })
    return data
  }