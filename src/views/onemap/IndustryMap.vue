<template>
  <div class="map-dark-page">
    <BaseMap ref="baseMapRef" />

    <DrillBreadcrumb code="340000" />

    <LayerControl :layers="layers" @toggle="toggleLayer" />

    <!-- 左侧面板 -->
    <div class="left-panel">
      <div class="lp-card">
        <div class="lp-title">粮食产业布局筛选</div>
        <el-select v-model="cropFilter" size="small" style="width: 100%" placeholder="选择作物">
          <el-option label="全部作物" value="" />
          <el-option v-for="c in CROPS" :key="c.code" :label="c.name" :value="c.code" />
        </el-select>
        <div class="filter-tip">按作物筛选后，地图高亮该作物主产区，指标卡同步更新</div>
      </div>

      <div class="lp-card">
        <div class="lp-title">区域产能对比（万亩）</div>
        <BaseChart :option="barOption" height="220px" dark />
      </div>

      <div class="lp-card">
        <div class="lp-title">种植主体结构</div>
        <BaseChart :option="pieOption" height="180px" dark />
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend-card">
      <div class="lg-title">产业布局图例</div>
      <div class="lg-row" v-for="c in CROPS" :key="c.code">
        <span class="lg-color" :style="{ background: c.color }" />{{ c.name }}主产区
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import BaseMap from '@/components/map/BaseMap.vue'
import LayerControl from '@/components/map/LayerControl.vue'
import DrillBreadcrumb from '@/components/map/DrillBreadcrumb.vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import { CROPS } from '@/mock/common/dict'
import { CITY_PLANS } from '@/mock/gpm/plans'
import anhuiCityGeo from '@/mock/geo/anhui-city.json'

const baseMapRef = ref(null)
const cropFilter = ref('')

const layers = reactive([
  { id: 'cityBoundary', name: '行政区划', color: '#5b9bd5', visible: true },
  { id: 'production', name: '重点生产区域', color: '#e8b93c', visible: true }
])

const barOption = computed(() => ({
  grid: { left: 44, right: 10, top: 10, bottom: 24 },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'value', axisLabel: { color: '#7d97b8' }, splitLine: { lineStyle: { color: 'rgba(59,102,158,0.2)' } } },
  yAxis: { type: 'category', data: [...CITY_PLANS].sort((a, b) => a.totalArea - b.totalArea).slice(-8).map((c) => c.cityName.replace('市', '')), axisLabel: { color: '#a8c0dc', fontSize: 11 } },
  series: [{ type: 'bar', data: [...CITY_PLANS].sort((a, b) => a.totalArea - b.totalArea).slice(-8).map((c) => c.totalArea), itemStyle: { color: '#4fd0c6', borderRadius: [0, 4, 4, 0] }, barWidth: 12 }]
}))

const pieOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie', radius: ['40%', '68%'],
    label: { color: '#a8c0dc', fontSize: 11, formatter: '{b} {d}%' },
    data: [
      { name: '普通农户', value: 62, itemStyle: { color: '#5b9bd5' } },
      { name: '规模大户', value: 18, itemStyle: { color: '#e8b93c' } },
      { name: '家庭农场', value: 9, itemStyle: { color: '#4fd0c6' } },
      { name: '合作社', value: 7, itemStyle: { color: '#7e57c2' } },
      { name: '农业企业', value: 4, itemStyle: { color: '#e64545' } }
    ]
  }]
}))

onMounted(() => {
  // 重点生产区域：按产能着色高亮
  const focusCities = ['阜阳市', '亳州市', '宿州市', '六安市', '滁州市']
  baseMapRef.value.addGeoJSON('production', {
    type: 'FeatureCollection',
    features: anhuiCityGeo.features.filter((f) => focusCities.includes(f.properties.name))
  }, {
    style: { color: '#e8b93c', weight: 2, fillColor: '#e8b93c', fillOpacity: 0.22, dashArray: '6 4' },
    onEachFeature: (feature, layer) => layer.bindTooltip(`<b>${feature.properties.name}</b><br/>重点粮食生产区域`)
  })

  baseMapRef.value.addGeoJSON('cityBoundary', anhuiCityGeo, {
    style: { color: '#5b9bd5', weight: 1, fillColor: '#132c49', fillOpacity: 0.4 },
    onEachFeature: (feature, layer) => layer.bindTooltip(feature.properties.name, { direction: 'center' })
  })
})

const toggleLayer = (id, visible) => {
  const l = baseMapRef.value.getLayer(id)
  if (!l) return
  if (visible) l.addTo(baseMapRef.value.map.value)
  else baseMapRef.value.map.value.removeLayer(l)
}
</script>

<style lang="scss" scoped>
.left-panel {
  position: absolute; top: 56px; left: 12px; z-index: 400;
  width: 296px; display: flex; flex-direction: column; gap: 10px;
  max-height: calc(100% - 76px); overflow: auto;
}
.lp-card {
  background: rgba(13, 30, 52, 0.9); border: 1px solid rgba(59, 102, 158, 0.4);
  border-radius: 10px; padding: 12px 14px; backdrop-filter: blur(6px);
}
.lp-title {
  font-size: 13.5px; font-weight: 600; color: #eaf2fc; margin-bottom: 10px;
  padding-left: 8px; border-left: 3px solid #2e9e5b;
}
.filter-tip { font-size: 11.5px; color: #7d97b8; margin-top: 8px; line-height: 1.5; }
.legend-card {
  position: absolute; bottom: 16px; right: 12px; z-index: 400;
  background: rgba(13, 30, 52, 0.9); border: 1px solid rgba(59, 102, 158, 0.4);
  border-radius: 10px; padding: 10px 14px;
  .lg-title { font-size: 12.5px; font-weight: 600; color: #eaf2fc; margin-bottom: 6px; }
  .lg-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #a8c0dc; padding: 2px 0;
    .lg-color { width: 12px; height: 8px; border-radius: 2px; } }
}
</style>
