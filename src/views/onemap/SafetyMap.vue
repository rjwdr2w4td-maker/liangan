<template>
  <div class="map-dark-page">
    <BaseMap ref="baseMapRef" />

    <DrillBreadcrumb code="340000" />

    <LayerControl :layers="layers" @toggle="toggleLayer" />

    <!-- 左侧面板：全局态势 -->
    <div class="left-panel">
      <div class="lp-card">
        <div class="lp-title">全省粮食安全态势</div>
        <div class="lp-stats">
          <div class="lp-stat"><div class="map-stat-value num">{{ stats.total }}</div><div class="lp-label">事件总数</div></div>
          <div class="lp-stat"><div class="map-stat-value num" style="color:#e64545">{{ stats.pending }}</div><div class="lp-label">待处置</div></div>
          <div class="lp-stat"><div class="map-stat-value num" style="color:#e8b93c">{{ stats.doing }}</div><div class="lp-label">处置中</div></div>
          <div class="lp-stat"><div class="map-stat-value num" style="color:#4fd0c6">{{ stats.rate }}%</div><div class="lp-label">办结率</div></div>
        </div>
      </div>

      <div class="lp-card">
        <div class="lp-title">智能预警</div>
        <div class="alert-row" v-for="a in alerts" :key="a.label">
          <span class="al-dot" :style="{ background: a.color }" />
          <span class="al-label">{{ a.label }}</span>
          <span class="al-count num">{{ a.count }}</span>
        </div>
      </div>

      <div class="lp-card">
        <div class="lp-title">事件列表</div>
        <el-select v-model="statusFilter" size="small" style="width:100%; margin-bottom:8px" placeholder="按状态筛选">
          <el-option label="全部状态" value="" />
          <el-option v-for="(v, k) in EVENT_STATUS" :key="k" :label="v.name" :value="k" />
        </el-select>
        <div class="evt-scroll">
          <div v-for="e in filteredEvents" :key="e.id" class="evt-row" @click="locateEvent(e)">
            <StatusTag :dict="EVENT_STATUS" :value="e.status" />
            <div class="er-info">
              <div class="er-code num">{{ e.code }}</div>
              <div class="er-desc">{{ e.regionName }} · {{ EVENT_TYPE_MAP[e.type]?.name }} · {{ e.spot.areaMu }}亩</div>
            </div>
            <el-icon v-if="e.overdue" color="#e64545" :size="14"><AlarmClock /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend-card">
      <div class="lg-title">图斑状态图例</div>
      <div class="lg-row"><span class="lg-color" style="background:#e64545" />高风险待处置</div>
      <div class="lg-row"><span class="lg-color" style="background:#e67e22" />核查/整改中</div>
      <div class="lg-row"><span class="lg-color" style="background:#409eff" />待审核</div>
      <div class="lg-row"><span class="lg-color" style="background:#36cfc9" />待复核</div>
      <div class="lg-row"><span class="lg-color" style="background:#67c23a" />已结案</div>
    </div>

    <!-- 图斑穿透抽屉 -->
    <el-drawer v-model="eventDrawer" :title="curEvent?.code + ' 事件详情'" size="440px" append-to-body>
      <template v-if="curEvent">
        <div class="ev-head">
          <StatusTag :dict="EVENT_STATUS" :value="curEvent.status" solid />
          <StatusTag :dict="RISK_MAP" :value="curEvent.risk" />
          <el-tag size="small" effect="plain">{{ EVENT_TYPE_MAP[curEvent.type]?.name }}</el-tag>
          <el-tag size="small" type="info" effect="plain">{{ EVENT_SOURCE_MAP[curEvent.source]?.name }}</el-tag>
          <el-tag v-if="curEvent.overdue" size="small" type="danger" effect="dark">已超期</el-tag>
        </div>
        <el-descriptions :column="1" border size="small" style="margin-top: 12px">
          <el-descriptions-item label="所在区域">{{ curEvent.regionName }}</el-descriptions-item>
          <el-descriptions-item label="涉及主体">{{ curEvent.subjectName }}</el-descriptions-item>
          <el-descriptions-item label="图斑面积">{{ curEvent.spot.areaMu }} 亩</el-descriptions-item>
          <el-descriptions-item label="发现时间">{{ curEvent.foundTime }}</el-descriptions-item>
          <el-descriptions-item label="处置时限">{{ curEvent.deadline || '—' }}</el-descriptions-item>
          <el-descriptions-item label="当前环节">{{ EVENT_STATUS[curEvent.status]?.name }}{{ curEvent.assignee ? ' · ' + curEvent.assignee : '' }}</el-descriptions-item>
          <el-descriptions-item label="事件描述" :span="1">{{ curEvent.desc }}</el-descriptions-item>
        </el-descriptions>

        <div class="sub-title">处置轨迹</div>
        <FlowSteps :steps="curEvent.trail" />

        <div class="drawer-actions">
          <el-button type="primary" size="small" @click="$router.push('/fsr/events')">进入事件中心处置</el-button>
          <el-button size="small" @click="$router.push('/fsr/task')">查看任务跟踪</el-button>
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
import StatusTag from '@/components/common/StatusTag.vue'
import FlowSteps from '@/components/common/FlowSteps.vue'
import { FSR_EVENTS } from '@/mock/fsr/events'
import { EVENT_STATUS, EVENT_TYPE_MAP, EVENT_SOURCE_MAP, RISK_MAP } from '@/mock/common/dict'
import anhuiCityGeo from '@/mock/geo/anhui-city.json'

const baseMapRef = ref(null)
const eventDrawer = ref(false)
const curEvent = ref(null)
const statusFilter = ref('')

const layers = reactive([
  { id: 'cityBoundary', name: '行政区划', color: '#5b9bd5', visible: true },
  { id: 'spots', name: '变化图斑', color: '#e64545', visible: true },
  { id: 'longTerm', name: '长势偏差区域', color: '#f1c40f', visible: true }
])

const stats = computed(() => {
  const total = FSR_EVENTS.length
  const pending = FSR_EVENTS.filter((e) => ['pending', 'checking'].includes(e.status)).length
  const doing = FSR_EVENTS.filter((e) => ['reviewing', 'rectifying', 'recheck'].includes(e.status)).length
  const closed = FSR_EVENTS.filter((e) => e.status === 'closed').length
  return { total, pending, doing, rate: Math.round((closed / total) * 100) }
})

const alerts = computed(() => [
  { label: '新增疑似图斑（近7日）', count: FSR_EVENTS.filter((e) => e.foundTime >= '2026-09-22').length, color: '#e64545' },
  { label: '超期未处置', count: FSR_EVENTS.filter((e) => e.overdue).length, color: '#e67e22' },
  { label: '高风险事件', count: FSR_EVENTS.filter((e) => e.risk === 'high' && e.status !== 'closed').length, color: '#e64545' },
  { label: '长势明显偏差区域', count: FSR_EVENTS.filter((e) => e.type === 'zhangshi').length, color: '#f1c40f' }
])

const filteredEvents = computed(() =>
  statusFilter.value ? FSR_EVENTS.filter((e) => e.status === statusFilter.value) : FSR_EVENTS
)

const statusColor = (s) => EVENT_STATUS[s]?.color || '#999'

onMounted(() => {
  baseMapRef.value.addGeoJSON('cityBoundary', anhuiCityGeo, {
    style: { color: '#5b9bd5', weight: 1, fillColor: '#173a5e', fillOpacity: 0.3 },
    onEachFeature: (feature, layer) => layer.bindTooltip(feature.properties.name, { direction: 'center' })
  })

  // 图斑图层
  baseMapRef.value.addGeoJSON('spots', {
    type: 'FeatureCollection',
    features: FSR_EVENTS.map((e) => ({
      type: 'Feature',
      properties: { id: e.id, code: e.code, status: e.status, risk: e.risk, overdue: e.overdue },
      geometry: e.spot.geometry
    }))
  }, {
    style: (f) => ({
      color: statusColor(f.properties.status),
      weight: f.properties.risk === 'high' ? 2 : 1.2,
      fillColor: statusColor(f.properties.status),
      fillOpacity: f.properties.status === 'closed' ? 0.25 : 0.55,
      dashArray: f.properties.overdue ? '5 4' : null
    }),
    onEachFeature: (feature, layer) => {
      const ev = FSR_EVENTS.find((e) => e.id === feature.properties.id)
      layer.bindTooltip(`<b>${ev.code}</b><br/>${ev.regionName} · ${EVENT_TYPE_MAP[ev.type]?.name}<br/>状态：${EVENT_STATUS[ev.status]?.name}${ev.overdue ? '（已超期）' : ''}`, { sticky: true })
      layer.on('click', () => openEvent(ev))
    }
  })

  // 长势偏差区域（zhangshi 类型闪烁动画效果用高亮描边）
  const zhangshi = FSR_EVENTS.filter((e) => e.type === 'zhangshi')
  baseMapRef.value.addGeoJSON('longTerm', {
    type: 'FeatureCollection',
    features: zhangshi.map((e) => ({ type: 'Feature', properties: {}, geometry: e.spot.geometry }))
  }, {
    style: { color: '#f1c40f', weight: 3, fillColor: '#f1c40f', fillOpacity: 0.15, dashArray: '8 6' }
  })
})

const openEvent = (ev) => {
  curEvent.value = ev
  eventDrawer.value = true
}

const locateEvent = (ev) => {
  const [lng, lat] = ev.spot.center
  baseMapRef.value.flyTo([lat, lng], 11)
  setTimeout(() => openEvent(ev), 600)
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
  padding-left: 8px; border-left: 3px solid #e64545;
}
.lp-stats { display: flex; justify-content: space-between; text-align: center;
  .map-stat-value { font-size: 19px; font-weight: 700; }
  .lp-label { font-size: 11px; color: #7d97b8; margin-top: 2px; }
}
.alert-row { display: flex; align-items: center; gap: 8px; padding: 5px 0;
  .al-dot { width: 8px; height: 8px; border-radius: 50%; }
  .al-label { flex: 1; font-size: 12.5px; color: #d7e3f4; }
  .al-count { font-size: 15px; font-weight: 700; color: #fff; }
}
.evt-scroll { max-height: 320px; overflow: auto; }
.evt-row {
  display: flex; align-items: center; gap: 8px; padding: 7px 4px;
  border-bottom: 1px dashed rgba(59, 102, 158, 0.3); cursor: pointer;
  &:hover { background: rgba(30, 64, 108, 0.4); }
  .er-info { flex: 1; min-width: 0; }
  .er-code { font-size: 12px; color: #9fc0e8; }
  .er-desc { font-size: 11.5px; color: #7d97b8; margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
.legend-card {
  position: absolute; bottom: 16px; right: 12px; z-index: 400;
  background: rgba(13, 30, 52, 0.9); border: 1px solid rgba(59, 102, 158, 0.4);
  border-radius: 10px; padding: 10px 14px;
  .lg-title { font-size: 12.5px; font-weight: 600; color: #eaf2fc; margin-bottom: 6px; }
  .lg-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #a8c0dc; padding: 2px 0;
    .lg-color { width: 12px; height: 8px; border-radius: 2px; } }
}
.ev-head { display: flex; flex-wrap: wrap; gap: 6px; }
.sub-title {
  font-size: 13.5px; font-weight: 600; margin: 16px 0 10px;
  padding-left: 8px; border-left: 3px solid var(--ah-primary);
}
.drawer-actions { margin-top: 14px; display: flex; gap: 8px; }
</style>
