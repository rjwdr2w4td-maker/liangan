<template>
  <div class="map-dark-page">
    <BaseMap ref="baseMapRef" />

    <!-- 下钻面包屑 -->
    <DrillBreadcrumb :code="drill.code" @jump="jumpTo" />

    <!-- 图层控制 -->
    <LayerControl :layers="layers" @toggle="toggleLayer" @opacity="setLayerOpacity" />

    <!-- 左侧指标面板 -->
    <div class="left-panel">
      <div class="lp-card">
        <div class="lp-title">{{ drill.name }} · 粮食生产态势</div>
        <div class="lp-stats">
          <div class="lp-stat">
            <div class="map-stat-value num">{{ curStat.plan }}</div>
            <div class="lp-label">计划面积(万亩)</div>
          </div>
          <div class="lp-stat">
            <div class="map-stat-value num">{{ curStat.sow }}%</div>
            <div class="lp-label">播种完成率</div>
          </div>
          <div class="lp-stat">
            <div class="map-stat-value num">{{ curStat.harvest }}%</div>
            <div class="lp-label">收获完成率</div>
          </div>
        </div>
        <div class="lp-progress">
          <div class="lpp-row">
            <span>播种进度</span>
            <el-progress :percentage="curStat.sow" :stroke-width="8" :color="'#4fd0c6'" />
          </div>
          <div class="lpp-row">
            <span>收获进度</span>
            <el-progress :percentage="curStat.harvest" :stroke-width="8" :color="'#e8b93c'" />
          </div>
        </div>
      </div>

      <!-- 区域排行（省级时显示） -->
      <div v-if="drill.level === 'province'" class="lp-card">
        <div class="lp-title">各市播种进度排行 TOP8</div>
        <div v-for="(c, i) in cityRank" :key="c.cityCode" class="rank-row" @click="drillToCity(c.cityCode)">
          <span class="rk-no" :class="{ top: i < 3 }">{{ i + 1 }}</span>
          <span class="rk-name">{{ c.cityName }}</span>
          <el-progress :percentage="c.sowRate" :stroke-width="7" class="flex-1" :color="c.sowRate > 80 ? '#4fd0c6' : '#e8b93c'" />
        </div>
      </div>

      <!-- 气象预警 -->
      <div class="lp-card warn-card">
        <div class="lp-title">气象预警叠加</div>
        <div v-for="w in weatherAlerts" :key="w.id" class="warn-row">
          <el-tag :type="w.level === '橙色' ? 'danger' : 'warning'" size="small">{{ w.type }}·{{ w.level }}</el-tag>
          <span class="warn-region">{{ w.region }}</span>
        </div>
        <div class="warn-content">{{ weatherAlerts[0]?.content }}</div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend-card">
      <div class="lg-title">作物图例</div>
      <div class="lg-row" v-for="c in legendCrops" :key="c.code">
        <span class="lg-color" :style="{ background: c.color }" />{{ c.name }}
      </div>
    </div>

    <!-- 地块穿透抽屉 -->
    <el-drawer v-model="plotDrawer" :title="curPlot?.name" size="380px" append-to-body>
      <template v-if="curPlot">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="地块编码">{{ curPlot.id }}</el-descriptions-item>
          <el-descriptions-item label="面积">{{ curPlot.areaMu }} 亩</el-descriptions-item>
          <el-descriptions-item label="当前作物">
            <el-tag size="small" :color="CROP_MAP[curPlot.crop]?.color" effect="dark">{{ CROP_MAP[curPlot.crop]?.name }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="经营主体">{{ SUBJECT_MAP[curPlot.subjectId]?.name }}</el-descriptions-item>
          <el-descriptions-item label="主体类型">{{ SUBJECT_TYPE_MAP[SUBJECT_MAP[curPlot.subjectId]?.type]?.name }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ SUBJECT_MAP[curPlot.subjectId]?.owner }}</el-descriptions-item>
          <el-descriptions-item label="计划落实">
            <el-tag :type="curPlot.implemented ? 'success' : 'warning'" size="small">{{ curPlot.implemented ? '已落实' : '未落实' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="青贮备案">
            <el-tag :type="curPlot.silageFiled ? 'success' : 'info'" size="small">{{ curPlot.silageFiled ? '已备案' : '—' }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div class="drawer-actions">
          <el-button type="primary" plain size="small" @click="$router.push('/gpm/implement')">
            计划落实 · 按图选地
          </el-button>
          <el-button type="warning" plain size="small" @click="reportProblem">
            地块信息存疑，提交修订
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import BaseMap from '@/components/map/BaseMap.vue'
import LayerControl from '@/components/map/LayerControl.vue'
import DrillBreadcrumb from '@/components/map/DrillBreadcrumb.vue'
import { useMapStateStore } from '@/stores/mapState'
import { CITY_PLANS, WEATHER_ALERTS } from '@/mock/gpm/plans'
import { PLOTS, SUBJECT_MAP } from '@/mock/geo/plot-gen'
import { CROP_MAP, SUBJECT_TYPE_MAP, CROPS } from '@/mock/common/dict'
import { listCities, REGION_MAP } from '@/mock/common/regions'
import anhuiCityGeo from '@/mock/geo/anhui-city.json'
import countiesGeo from '@/mock/geo/counties.json'

const baseMapRef = ref(null)
const mapState = useMapStateStore()
const drill = computed(() => mapState.drillRegion)

const plotDrawer = ref(false)
const curPlot = ref(null)

const layers = reactive([
  { id: 'cityBoundary', name: '市级行政区划', color: '#5b9bd5', visible: true },
  { id: 'countyBoundary', name: '县级行政区划', color: '#a7c4e8', visible: true },
  { id: 'plots', name: '种植地块', color: '#e8b93c', visible: true, opacity: 0.7 },
  { id: 'weather', name: '气象预警区域', color: '#e64545', visible: true }
])

const legendCrops = CROPS.filter((c) => ['wheat', 'rice', 'corn', 'soybean'].includes(c.code))
const weatherAlerts = WEATHER_ALERTS

// 指标（随下钻联动）
const curStat = computed(() => {
  if (drill.value.level === 'province') {
    return {
      plan: (CITY_PLANS.reduce((s, c) => s + c.totalArea, 0) / 100).toFixed(0),
      sow: Math.round(CITY_PLANS.reduce((s, c) => s + c.sowRate, 0) / CITY_PLANS.length),
      harvest: Math.round(CITY_PLANS.reduce((s, c) => s + c.harvestRate, 0) / CITY_PLANS.length)
    }
  }
  const cityPlan = CITY_PLANS.find((c) => c.cityCode === drill.value.code)
  if (cityPlan) return { plan: cityPlan.totalArea, sow: cityPlan.sowRate, harvest: cityPlan.harvestRate }
  return { plan: '—', sow: 0, harvest: 0 }
})

const cityRank = computed(() => [...CITY_PLANS].sort((a, b) => b.sowRate - a.sowRate).slice(0, 8))

onMounted(() => {
  renderCityLayer()
  renderWeatherLayer()
})

// 市界图层
const renderCityLayer = () => {
  baseMapRef.value.addGeoJSON('cityBoundary', anhuiCityGeo, {
    style: (feature) => ({
      color: '#5b9bd5',
      weight: 1.5,
      fillColor: '#173a5e',
      fillOpacity: 0.35
    }),
    onEachFeature: (feature, layer) => {
      const name = feature.properties.name
      if (!name) return
      layer.bindTooltip(name, { direction: 'center', className: 'city-tooltip' })
      layer.on('click', () => drillToCity(feature.properties.adcode))
    }
  })
}

// 气象预警区域（高亮市）
const renderWeatherLayer = () => {
  const alertFeatures = {
    type: 'FeatureCollection',
    features: anhuiCityGeo.features.filter((f) => ['阜阳市', '亳州市'].includes(f.properties.name))
  }
  baseMapRef.value.addGeoJSON('weather', alertFeatures, {
    style: { color: '#e64545', weight: 2, dashArray: '6 4', fillColor: '#e64545', fillOpacity: 0.12 },
    onEachFeature: (feature, layer) => layer.bindTooltip(`⚠ ${feature.properties.name}：暴雨/大风预警`, { sticky: true })
  })
}

// 市下钻
const drillToCity = (cityCode) => {
  const region = REGION_MAP[cityCode]
  if (!region) return
  mapState.setDrillRegion({ code: cityCode, name: region.name, level: 'city' })
  baseMapRef.value.fitBounds([[region.center[1] - 1.4, region.center[0] - 1.6], [region.center[1] + 1.4, region.center[0] + 1.6]])
  renderCountyLayer(cityCode)
  renderPlotsLayer(cityCode)
}

// 县界图层（该市有 geojson 县则显示，否则显示县名标注）
const renderCountyLayer = (cityCode) => {
  // counties.json 中：太和(341222)/涡阳(341622)属阜阳/亳州；肥西(340123)/长丰(340121)属合肥
  const cityCountyMap = {
    '341200': ['太和县'], '341600': ['涡阳县'], '340100': ['肥西县', '长丰县']
  }
  const names = cityCountyMap[cityCode] || []
  if (names.length) {
    const fc = { type: 'FeatureCollection', features: countiesGeo.features.filter((f) => names.includes(f.properties.name)) }
    baseMapRef.value.addGeoJSON('countyBoundary', fc, {
      style: { color: '#4fd0c6', weight: 1.5, fillColor: '#1d4d63', fillOpacity: 0.25 },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.name, { direction: 'center' })
        layer.on('click', () => {
          const adcode = feature.properties.adcode
          mapState.setDrillRegion({ code: String(adcode), name: feature.properties.name, level: 'county' })
          layer.openTooltip()
          renderPlotsLayer(String(adcode))
        })
      }
    })
  } else {
    baseMapRef.value.addGeoJSON('countyBoundary', null)
    // 无 geo 县：显示市中心点标注
    const region = REGION_MAP[cityCode]
    import('leaflet').then(({ default: L }) => {
      const markers = L.layerGroup(
        (region?.children || []).map((c) =>
          L.circleMarker([c.center[1], c.center[0]], { radius: 5, color: '#4fd0c6', fillOpacity: 0.9 }).bindTooltip(c.name)
        )
      )
      baseMapRef.value.addLayer('countyBoundary', markers)
    })
  }
}

// 地块图层（按作物着色）
const renderPlotsLayer = (regionCode) => {
  const plots = PLOTS.filter((p) => p.regionCode.startsWith(String(regionCode).slice(0, 6)))
  const fc = {
    type: 'FeatureCollection',
    features: plots.map((p) => ({
      type: 'Feature',
      properties: { id: p.id, name: p.name, crop: p.crop },
      geometry: p.geometry
    }))
  }
  const layer = baseMapRef.value.addGeoJSON('plots', fc, {
    style: (feature) => ({
      color: CROP_MAP[feature.properties.crop]?.color || '#999',
      weight: 1,
      fillColor: CROP_MAP[feature.properties.crop]?.color || '#999',
      fillOpacity: 0.55
    }),
    onEachFeature: (feature, lyr) => {
      lyr.bindTooltip(`${feature.properties.name}（${CROP_MAP[feature.properties.crop]?.name}）`)
      lyr.on('click', () => {
        curPlot.value = PLOTS.find((p) => p.id === feature.properties.id) || null
        plotDrawer.value = true
      })
    }
  })
  if (layer) layer.setStyle({ fillOpacity: 0.55 * (layers.find((l) => l.id === 'plots')?.opacity || 1) })
}

// 面包屑跳转
const jumpTo = (seg) => {
  if (seg.code === '340000') {
    mapState.setDrillRegion({ code: '340000', name: '安徽省', level: 'province' })
    baseMapRef.value.flyTo([32.3, 117.2], 7)
    baseMapRef.value.removeLayer('countyBoundary')
    baseMapRef.value.removeLayer('plots')
  } else {
    drillToCity(seg.code)
  }
}

const toggleLayer = (id, visible) => {
  const l = baseMapRef.value.getLayer(id)
  if (!l) return
  if (visible) l.addTo(baseMapRef.value.map.value)
  else baseMapRef.value.map.value.removeLayer(l)
}

const setLayerOpacity = (id, opacity) => {
  const l = baseMapRef.value.getLayer(id)
  if (l && l.setStyle) l.setStyle({ fillOpacity: 0.55 * opacity })
}

const reportProblem = () => {
  ElMessage.success('地块修订申请已提交，待县级核实处理')
  plotDrawer.value = false
}
</script>

<style lang="scss" scoped>
.left-panel {
  position: absolute;
  top: 56px;
  left: 12px;
  z-index: 400;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100% - 76px);
  overflow: auto;
}

.lp-card {
  background: rgba(13, 30, 52, 0.9);
  border: 1px solid rgba(59, 102, 158, 0.4);
  border-radius: 10px;
  padding: 12px 14px;
  backdrop-filter: blur(6px);
}

.lp-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #eaf2fc;
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid #4fd0c6;
}

.lp-stats {
  display: flex;
  justify-content: space-between;
  text-align: center;

  .map-stat-value { font-size: 20px; font-weight: 700; }
  .lp-label { font-size: 11px; color: #7d97b8; margin-top: 2px; }
}

.lp-progress { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.lpp-row {
  display: flex; align-items: center; gap: 8px; font-size: 12px; color: #a8c0dc;
  :deep(.el-progress) { flex: 1; }
}

.rank-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;

  &:hover .rk-name { color: #4fd0c6; }
  .rk-no {
    width: 18px; height: 18px; border-radius: 4px;
    background: rgba(59, 102, 158, 0.35);
    color: #a8c0dc; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
    &.top { background: #c2571a; color: #fff; }
  }
  .rk-name { font-size: 12.5px; color: #d7e3f4; width: 52px; }
}

.warn-card .warn-row {
  display: flex; align-items: center; gap: 8px; padding: 3px 0;
  .warn-region { font-size: 12.5px; color: #d7e3f4; }
}
.warn-content { font-size: 12px; color: #7d97b8; margin-top: 8px; line-height: 1.5; }

.legend-card {
  position: absolute;
  bottom: 16px;
  right: 12px;
  z-index: 400;
  background: rgba(13, 30, 52, 0.9);
  border: 1px solid rgba(59, 102, 158, 0.4);
  border-radius: 10px;
  padding: 10px 14px;

  .lg-title { font-size: 12.5px; font-weight: 600; color: #eaf2fc; margin-bottom: 6px; }
  .lg-row {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: #a8c0dc; padding: 2px 0;
    .lg-color { width: 12px; height: 8px; border-radius: 2px; }
  }
}

.drawer-actions { margin-top: 14px; display: flex; gap: 8px; }

:deep(.city-tooltip) {
  background: rgba(13, 30, 52, 0.9);
  border: 1px solid rgba(59, 102, 158, 0.5);
  color: #d7e3f4;
  font-size: 13px;
  font-weight: 600;
}
</style>
