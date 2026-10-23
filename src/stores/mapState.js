import { defineStore } from 'pinia'
import { ref } from 'vue'

// 跨页面共享的地图状态：当前下钻区划、图层显隐
export const useMapStateStore = defineStore('mapState', () => {
  // 下钻区划 { code, name, level } level: province/city/county
  const drillRegion = ref({ code: '340000', name: '安徽省', level: 'province' })

  const setDrillRegion = (r) => { drillRegion.value = r }

  return { drillRegion, setDrillRegion }
})
