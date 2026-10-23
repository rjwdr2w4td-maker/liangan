<template>
  <div class="map-dark-page">
    <BaseMap ref="baseMapRef" />

    <DrillBreadcrumb code="340000" />

    <LayerControl :layers="layers" @toggle="toggleLayer" />

    <!-- 左侧面板 -->
    <div class="left-panel">
      <div class="lp-card">
        <div class="lp-title">青贮饲料收储态势</div>
        <div class="lp-stats">
          <div class="lp-stat"><div class="map-stat-value num">{{ fences.length }}</div><div class="lp-label">备案围栏</div></div>
          <div class="lp-stat"><div class="map-stat-value num">{{ totalArea }}</div><div class="lp-label">备案面积(亩)</div></div>
          <div class="lp-stat"><div class="map-stat-value num">{{ totalYield }}</div><div class="lp-label">预计产量(吨)</div></div>
        </div>
      </div>

      <div class="lp-card">
        <div class="lp-title">数字围栏列表</div>
        <div class="fence-scroll">
          <div v-for="f in fences" :key="f.id" class="fence-row" @click="locateFence(f)">
            <div class="fr-main">
              <div class="fr-no num">{{ f.filedNo }}</div>
              <div class="fr-sub">{{ f.subjectName }}</div>
            </div>
            <el-button type="primary" link size="small">定位</el-button>
          </div>
        </div>
      </div>

      <div class="lp-card">
        <div class="lp-title">收储状态分布</div>
        <BaseChart :option="chartOption" height="180px" dark />
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend-card">
      <div class="lg-title">图例</div>
      <div class="lg-row"><span class="lg-color" style="background:#26a69a" />备案数字围栏</div>
      <div class="lg-row"><span class="lg-color" style="background:#7e57c2" />苜蓿围栏</div>
      <div class="lg-row"><span class="lg-dot" style="background:#e8b93c" />种植/收储主体</div>
      <div class="lg-row"><span class="lg-dot" style="background:#e64545" />异常点位</div>
    </div>

    <!-- 围栏穿透 -->
    <el-drawer v-model="fenceDrawer" :title="curFence?.filedNo" size="400px" append-to-body>
      <template v-if="curFence">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="备案编号">{{ curFence.filedNo }}</el-descriptions-item>
          <el-descriptions-item label="备案主体">{{ curFence.subjectName }}</el-descriptions-item>
          <el-descriptions-item label="作物类型">{{ CROP_MAP[curFence.crop]?.name }}</el-descriptions-item>
          <el-descriptions-item label="备案日期">{{ curFence.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="围栏地块数">{{ curFencePlots.length }} 块</el-descriptions-item>
          <el-descriptions-item label="围栏面积">{{ curFencePlots.reduce((s, p) => s + p.areaMu, 0) }} 亩</el-descriptions-item>
        </el-descriptions>
        <div class="sub-title">围栏内地块</div>
        <el-table :data="curFencePlots" size="small" border>
          <el-table-column prop="name" label="地块名称" min-width="140" />
          <el-table-column prop="areaMu" label="面积(亩)" width="90" />
        </el-table>
        <div class="drawer-actions">
          <el-button type="primary" size="small" @click="$router.push('/sil/fence')">进入围栏校验</el-button>
          <el-button size="small" @click="$router.push('/sil/ledger')">查看收储台账</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import BaseMap from '@/components/map/BaseMap.vue'
import LayerControl from '@/components/map/LayerControl.vue'
import DrillBreadcrumb from '@/components/map/DrillBreadcrumb.vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import { SIL_FENCES, SIL_DECLARATIONS, SIL_LEDGERS, fenceGeoJSON } from '@/mock/sil/declarations'
import { PLOTS, GROW_SUBJECTS } from '@/mock/geo/plot-gen'
import { CROP_MAP } from '@/mock/common/dict'
import anhuiCityGeo from '@/mock/geo/anhui-city.json'

const baseMapRef = ref(null)
const fenceDrawer = ref(false)
const curFence = ref(null)

const layers = reactive([
  { id: 'cityBoundary', name: '行政区划', color: '#5b9bd5', visible: true },
  { id: 'fences', name: '备案数字围栏', color: '#26a69a', visible: true },
  { id: 'subjects', name: '主体点位', color: '#e8b93c', visible: true },
  { id: 'abnormal', name: '异常点位', color: '#e64545', visible: true }
])

const fences = SIL_FENCES
const totalArea = computed(() =>
  PLOTS.filter((p) => p.silageFiled).reduce((s, p) => s + p.areaMu, 0)
)
const totalYield = computed(() =>
  SIL_DECLARATIONS.filter((d) => d.status === 'filed').reduce((s, d) => s + (d.expectedYield || 0), 0)
)

const curFencePlots = computed(() => {
  if (!curFence.value) return []
  const decl = SIL_DECLARATIONS.find((d) => d.id === curFence.value.declarationId)
  return decl ? PLOTS.filter((p) => decl.plotIds.includes(p.id)) : []
})

const chartOption = computed(() => {
  const counts = { 已完成: 0, 收储中: 0, 补充收储: 0 }
  SIL_LEDGERS.forEach((l) => {
    if (l.isSupplement) counts['补充收储']++
    else if (counts[l.status] !== undefined) counts[l.status]++
  })
  return {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['40%', '68%'], center: ['50%', '50%'],
      label: { color: '#a8c0dc', fontSize: 11, formatter: '{b}\n{c}' },
      data: [
        { name: '已完成', value: counts['已完成'], itemStyle: { color: '#4fd0c6' } },
        { name: '收储中', value: counts['收储中'], itemStyle: { color: '#e8b93c' } },
        { name: '补充收储', value: counts['补充收储'], itemStyle: { color: '#7e57c2' } }
      ]
    }]
  }
})

onMounted(async () => {
  baseMapRef.value.addGeoJSON('cityBoundary', anhuiCityGeo, {
    style: { color: '#5b9bd5', weight: 1, fillColor: '#173a5e', fillOpacity: 0.3 },
    onEachFeature: (feature, layer) => layer.bindTooltip(feature.properties.name, { direction: 'center' })
  })

  // 数字围栏图层
  const fenceFeatures = []
  fences.forEach((f) => {
    fenceGeoJSON(f).features.forEach((ft) => fenceFeatures.push(ft))
  })
  baseMapRef.value.addGeoJSON('fences', { type: 'FeatureCollection', features: fenceFeatures }, {
    style: (f) => ({
      color: f.properties.subjectName ? '#26a69a' : '#26a69a',
      weight: 2,
      fillColor: '#26a69a',
      fillOpacity: 0.3,
      dashArray: '4 3'
    }),
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(`<b>${feature.properties.filedNo}</b><br/>${feature.properties.subjectName}<br/>${feature.properties.plotName} · ${feature.properties.areaMu}亩`)
      layer.on('click', () => {
        curFence.value = fences.find((f) => f.id === feature.properties.fenceId)
        fenceDrawer.value = true
      })
    }
  })

  // 主体点位（种植/收储主体代表点）
  import('leaflet').then(({ default: L }) => {
    const points = [
      { s: GROW_SUBJECTS.find((x) => x.id === 'SUB-0001'), at: [33.18, 115.63] },
      { s: GROW_SUBJECTS.find((x) => x.id === 'SUB-0007'), at: [33.5, 116.22] },
      { s: GROW_SUBJECTS.find((x) => x.id === 'SUB-0009'), at: [31.72, 116.86] },
      { s: GROW_SUBJECTS.find((x) => x.id === 'SUB-0006'), at: [33.2, 115.45] },
      { s: GROW_SUBJECTS.find((x) => x.id === 'SUB-0012'), at: [32.48, 117.15] }
    ].filter((p) => p.s)
    const markers = L.layerGroup(
      points.map(({ s, at }) =>
        L.circleMarker(at, { radius: 6, color: '#e8b93c', fillColor: '#e8b93c', fillOpacity: 0.9 })
          .bindTooltip(`<b>${s.name}</b><br/>${s.owner} · 种植面积${s.area}亩`)
      )
    )
    baseMapRef.value.addLayer('subjects', markers)
  })

  // 异常点位（未备案收割）
  import('leaflet').then(({ default: L }) => {
    const abnormal = L.layerGroup([
      L.circleMarker([33.12, 115.52], { radius: 7, color: '#e64545', fillColor: '#e64545', fillOpacity: 0.9 })
        .bindTooltip('<b>疑似未备案收割</b><br/>来源：数字围栏联动<br/><a href="#/fsr/events">点击进入处置</a>'),
      L.circleMarker([33.42, 116.28], { radius: 7, color: '#e64545', fillColor: '#e64545', fillOpacity: 0.9 })
        .bindTooltip('<b>疑似超范围收储</b><br/>来源：县级巡查')
    ])
    baseMapRef.value.addLayer('abnormal', abnormal)
  })
})

const locateFence = (f) => {
  const plots = PLOTS.filter((p) => {
    const decl = SIL_DECLARATIONS.find((d) => d.id === f.declarationId)
    return decl && decl.plotIds.includes(p.id)
  })
  if (plots.length) {
    const [lng, lat] = plots[0].center
    baseMapRef.value.flyTo([lat, lng], 12)
    setTimeout(() => {
      curFence.value = f
      fenceDrawer.value = true
    }, 600)
  }
}

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
  padding-left: 8px; border-left: 3px solid #26a69a;
}
.lp-stats { display: flex; justify-content: space-between; text-align: center;
  .map-stat-value { font-size: 19px; font-weight: 700; }
  .lp-label { font-size: 11px; color: #7d97b8; margin-top: 2px; }
}
.fence-scroll { max-height: 260px; overflow: auto; }
.fence-row {
  display: flex; align-items: center; gap: 8px; padding: 7px 4px;
  border-bottom: 1px dashed rgba(59, 102, 158, 0.3); cursor: pointer;
  &:hover { background: rgba(30, 64, 108, 0.4); }
  .fr-main { flex: 1; }
  .fr-no { font-size: 12.5px; color: #4fd0c6; }
  .fr-sub { font-size: 11.5px; color: #7d97b8; margin-top: 1px; }
}
.legend-card {
  position: absolute; bottom: 16px; right: 12px; z-index: 400;
  background: rgba(13, 30, 52, 0.9); border: 1px solid rgba(59, 102, 158, 0.4);
  border-radius: 10px; padding: 10px 14px;
  .lg-title { font-size: 12.5px; font-weight: 600; color: #eaf2fc; margin-bottom: 6px; }
  .lg-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #a8c0dc; padding: 2px 0;
    .lg-color { width: 12px; height: 8px; border-radius: 2px; }
    .lg-dot { width: 8px; height: 8px; border-radius: 50%; } }
}
.sub-title { font-size: 13.5px; font-weight: 600; margin: 14px 0 8px; padding-left: 8px; border-left: 3px solid var(--ah-primary); }
.drawer-actions { margin-top: 14px; display: flex; gap: 8px; }
</style>
