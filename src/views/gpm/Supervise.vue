<template>
  <div class="page-container gpm-page">
    <div class="page-head">
      <div><h2>种植计划监督工作台</h2><p>以种植主体任务为最小监督粒度，跟踪播种、收获上报并自动识别填报与面积异常。</p></div>
      <el-button type="primary" @click="load">刷新数据</el-button>
    </div>

    <div class="metric-grid">
      <div class="metric-card blue"><span>监督计划数</span><strong>{{ summary.planCount }}</strong><small>项</small></div>
      <div class="metric-card cyan"><span>计划实际面积</span><strong>{{ summary.plannedAreaMu }}</strong><small>亩</small></div>
      <div class="metric-card green"><span>播种上报</span><strong>{{ summary.sowingAreaMu }}</strong><small>亩 / {{ summary.sowingRate }}%</small></div>
      <div class="metric-card orange"><span>收获上报</span><strong>{{ summary.harvestAreaMu }}</strong><small>亩 / {{ summary.harvestRate }}%</small></div>
      <div class="metric-card purple"><span>已完成计划</span><strong>{{ summary.completed }}</strong><small>项</small></div>
      <div class="metric-card red"><span>当前预警</span><strong>{{ summary.alerts }}</strong><small>条</small></div>
    </div>

    <div class="panel">
      <div class="panel-title"><span class="title-text">计划监督明细</span><span class="title-extra">共 {{ rows.length }} 项计划，面积单位：亩</span></div>
      <el-form :inline="true" class="filters">
        <el-form-item label="关键字"><el-input v-model="filters.keyword" clearable placeholder="计划、区域或作物" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" clearable placeholder="全部" style="width:140px"><el-option label="正常监督" value="NORMAL" /><el-option label="存在预警" value="ALERT" /><el-option label="已完成" value="COMPLETED" /><el-option label="未完成" value="IN_PROGRESS" /></el-select></el-form-item>
        <el-button type="primary" @click="load">查询</el-button>
      </el-form>
      <el-table :data="rows" stripe border>
        <el-table-column prop="planName" label="种植计划" min-width="240" show-overflow-tooltip />
        <el-table-column prop="regionName" label="区域" width="110" />
        <el-table-column prop="plannedAreaMu" label="计划实际面积（亩）" width="140" align="right" />
        <el-table-column prop="subjectCount" label="主体数" width="80" align="right" />
        <el-table-column label="播种上报" width="145"><template #default="{ row }">{{ row.sowingReportedAreaMu }}亩 / {{ row.sowingProgressRate }}%</template></el-table-column>
        <el-table-column label="收获上报" width="145"><template #default="{ row }">{{ row.harvestReportedAreaMu }}亩 / {{ row.harvestProgressRate }}%</template></el-table-column>
        <el-table-column label="计划完成状态" width="115"><template #default="{ row }"><el-tag :type="row.completionStatus === 'COMPLETED' ? 'success' : 'warning'">{{ row.completionStatus === 'COMPLETED' ? '已完成' : '未完成' }}</el-tag></template></el-table-column>
        <el-table-column label="未填报主体" width="125"><template #default="{ row }">播种 {{ row.sowingUnreportedSubjects }} / 收获 {{ row.harvestUnreportedSubjects }}</template></el-table-column>
        <el-table-column prop="alertCount" label="预警数" width="75" align="right" />
        <el-table-column label="操作" width="100" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="open(row)">查看详情</el-button></template></el-table-column>
      </el-table>
    </div>

    <el-drawer v-model="visible" title="计划监督详情" size="860px">
      <template v-if="current">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="计划" :span="3">{{ current.planName }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ current.regionName }}</el-descriptions-item><el-descriptions-item label="计划实际面积">{{ current.plannedAreaMu }} 亩</el-descriptions-item><el-descriptions-item label="主体数">{{ current.subjectCount }}</el-descriptions-item>
          <el-descriptions-item label="播种上报">{{ current.sowingReportedAreaMu }} 亩 / {{ current.sowingProgressRate }}%</el-descriptions-item><el-descriptions-item label="收获上报">{{ current.harvestReportedAreaMu }} 亩 / {{ current.harvestProgressRate }}%</el-descriptions-item><el-descriptions-item label="完成状态">{{ current.completionStatus === 'COMPLETED' ? '已完成' : '未完成' }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-title">播种 / 收获阶段统计</div>
        <div class="stage-grid"><div>播种面积偏差：<b>{{ current.sowingAreaDeviationRate }}%</b></div><div>收获面积偏差：<b>{{ current.harvestAreaDeviationRate }}%</b></div><div>最近播种填报：<b>{{ current.latestSowingReportAt || '未填报' }}</b></div><div>最近收获填报：<b>{{ current.latestHarvestReportAt || '未填报' }}</b></div></div>
        <div class="detail-title">主体任务明细</div>
        <el-table :data="taskPageRows" stripe size="small"><el-table-column prop="subjectName" label="主体" min-width="180" /><el-table-column prop="regionName" label="区域" min-width="170" /><el-table-column prop="plannedAreaMu" label="任务面积（亩）" width="110" /><el-table-column label="播种" width="120"><template #default="{ row }">{{ row.sowingReportedAreaMu }} / {{ row.sowingProgressRate }}%</template></el-table-column><el-table-column label="收获" width="120"><template #default="{ row }">{{ row.harvestReportedAreaMu }} / {{ row.harvestProgressRate }}%</template></el-table-column><el-table-column prop="alertCount" label="预警" width="65" /></el-table>
        <el-pagination v-model:current-page="detailPages.tasks" v-model:page-size="detailPageSizes.tasks" class="detail-pagination" layout="total, sizes, prev, pager, next" :total="current.tasks?.length || 0" :page-sizes="[5, 10, 20]" />
        <div class="detail-title">预警明细</div>
        <el-table :data="alertPageRows" stripe size="small"><el-table-column prop="type" label="类型" width="170"><template #default="{ row }">{{ alertLabel(row.type) }}</template></el-table-column><el-table-column prop="subjectName" label="主体" min-width="170" /><el-table-column prop="message" label="说明" min-width="260" /></el-table>
        <el-pagination v-model:current-page="detailPages.alerts" v-model:page-size="detailPageSizes.alerts" class="detail-pagination" layout="total, sizes, prev, pager, next" :total="current.alerts?.length || 0" :page-sizes="[5, 10, 20]" />
        <div class="detail-title">上报记录</div>
        <el-table :data="reportPageRows" stripe size="small"><el-table-column prop="date" label="填报日期" width="110" /><el-table-column prop="subjectName" label="主体" min-width="170" /><el-table-column prop="stage" label="阶段" width="80"><template #default="{ row }">{{ row.stage === 'sowing' ? '播种' : '收获' }}</template></el-table-column><el-table-column prop="area" label="面积（亩）" width="100" /><el-table-column prop="reporter" label="填报人" width="100" /></el-table>
        <el-pagination v-model:current-page="detailPages.reports" v-model:page-size="detailPageSizes.reports" class="detail-pagination" layout="total, sizes, prev, pager, next" :total="current.reportingRecords?.length || 0" :page-sizes="[5, 10, 20]" />
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { fetchSupervisionAlerts, fetchSupervisionPlanDetail, fetchSupervisionPlans } from '@/api/gpm'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const rows = ref([])
const alerts = ref([])
const current = ref(null)
const visible = ref(false)
const filters = reactive({ keyword: '', status: '', areaDeviationThreshold: 0.2, staleDaysThreshold: 30 })
const alertFilters = reactive({ type: '', keyword: '' })
const detailPages = reactive({ tasks: 1, alerts: 1, reports: 1 })
const detailPageSizes = reactive({ tasks: 5, alerts: 5, reports: 5 })
const pageRows = (items, page, pageSize) => (items || []).slice((page - 1) * pageSize, page * pageSize)
const taskPageRows = computed(() => pageRows(current.value?.tasks, detailPages.tasks, detailPageSizes.tasks))
const alertPageRows = computed(() => pageRows(current.value?.alerts, detailPages.alerts, detailPageSizes.alerts))
const reportPageRows = computed(() => pageRows(current.value?.reportingRecords, detailPages.reports, detailPageSizes.reports))
const alertTypes = [
  { label: '未填报播种', value: 'NO_SOWING_REPORT' }, { label: '未填报收获', value: 'NO_HARVEST_REPORT' },
  { label: '长期未填报播种', value: 'STALE_SOWING_REPORT' }, { label: '长期未填报收获', value: 'STALE_HARVEST_REPORT' },
  { label: '播种面积偏差', value: 'SOWING_AREA_DEVIATION' }, { label: '收获面积偏差', value: 'HARVEST_AREA_DEVIATION' }, { label: '收获超过播种', value: 'HARVEST_EXCEEDS_SOWING' }
]
const alertLabel = (type) => alertTypes.find((item) => item.value === type)?.label || type
const summary = computed(() => {
  const planned = rows.value.reduce((sum, item) => sum + Number(item.plannedAreaMu || 0), 0)
  const sowing = rows.value.reduce((sum, item) => sum + Number(item.sowingReportedAreaMu || 0), 0)
  const harvest = rows.value.reduce((sum, item) => sum + Number(item.harvestReportedAreaMu || 0), 0)
  return { planCount: rows.value.length, plannedAreaMu: planned.toFixed(2), sowingAreaMu: sowing.toFixed(2), harvestAreaMu: harvest.toFixed(2), sowingRate: planned ? (sowing / planned * 100).toFixed(1) : 0, harvestRate: planned ? (harvest / planned * 100).toFixed(1) : 0, completed: rows.value.filter((item) => item.completionStatus === 'COMPLETED').length, alerts: alerts.value.length }
})
const loadAlerts = async () => {
  alerts.value = (await fetchSupervisionAlerts(userStore.role, { ...alertFilters })) || []
}
const resetDetailPages = () => {
  Object.assign(detailPages, { tasks: 1, alerts: 1, reports: 1 })
  Object.assign(detailPageSizes, { tasks: 5, alerts: 5, reports: 5 })
}
const load = async () => { rows.value = await fetchSupervisionPlans(userStore.role, filters); await loadAlerts() }
const open = async (row) => { resetDetailPages(); current.value = await fetchSupervisionPlanDetail(row.planId, userStore.role); visible.value = true }
onMounted(load)
</script>

<style lang="scss" scoped>
.gpm-page{gap:12px;overflow:auto}.page-head{display:flex;justify-content:space-between;align-items:flex-start}.page-head h2{margin:4px 0;color:var(--ah-text);font-size:22px}.page-head p{color:var(--ah-text-secondary);font-size:13px}.metric-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.metric-card{padding:16px 18px;background:#fff;border:1px solid var(--ah-border);border-radius:6px;box-shadow:0 2px 8px rgba(30,60,90,.04)}.metric-card span,.metric-card small{display:block;color:var(--ah-text-secondary);font-size:12px}.metric-card strong{display:inline-block;margin:8px 6px 4px 0;color:var(--ah-text);font-size:24px}.metric-card.blue{border-top:3px solid #409eff}.metric-card.cyan{border-top:3px solid #22b8cf}.metric-card.green{border-top:3px solid #67c23a}.metric-card.orange{border-top:3px solid #e6a23c}.metric-card.red{border-top:3px solid #f56c6c}.metric-card.purple{border-top:3px solid #8b5cf6}.panel-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.title-text{font-weight:700;color:var(--ah-text)}.title-extra{color:var(--ah-text-secondary);font-size:12px}.filters{display:flex;align-items:center;flex-wrap:wrap}.filters :deep(.el-form-item){margin-bottom:12px}.detail-title{margin:18px 0 10px;font-weight:700;color:var(--ah-text)}.detail-pagination{justify-content:flex-end;margin:10px 0 18px}.stage-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:12px;background:#f7f9fc;color:var(--ah-text-secondary);font-size:13px}.stage-grid b{color:var(--ah-text)}@media (max-width:1200px){.metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (max-width:700px){.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.page-head{gap:12px;flex-direction:column}}
</style>