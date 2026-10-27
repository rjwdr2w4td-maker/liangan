<template>
  <div class="page-container stats-page">
    <div class="page-head">
      <div>
        <div class="eyebrow">数据自动汇总 · 减负增效</div>
        <h2>种植统计分析</h2>
        <p>系统自动汇总各市、县年度种植数据，减少基层重复填报和人工汇总。</p>
      </div>
      <div class="head-actions">
        <el-select v-model="selectedYear" style="width: 130px" @change="load">
          <el-option v-for="year in years" :key="year" :label="`${year}年`" :value="year" />
        </el-select>
        <el-button type="primary" @click="load">刷新数据</el-button>
        <el-button @click="exportReport">导出分析报表</el-button>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card blue"><span>年度播种面积</span><strong>{{ format(totalSownArea) }}</strong><small>亩</small></div>
      <div class="stat-card green"><span>年度收获面积</span><strong>{{ format(totalHarvestedArea) }}</strong><small>亩</small></div>
      <div class="stat-card orange"><span>估算粮食产量</span><strong>{{ format(totalYield) }}</strong><small>吨</small></div>
      <div class="stat-card purple"><span>任务完成率</span><strong>{{ taskRate }}%</strong><small>按年度计划面积计算</small></div>
    </div>

    <div class="analysis-grid">
      <div class="panel chart-panel">
        <div class="panel-title"><span class="title-text">各市年度种植完成情况</span><span class="title-extra">{{ selectedYear }}年 · 面积单位：亩</span></div>
        <BaseChart :option="regionOption" height="300px" />
      </div>
      <div class="panel chart-panel">
        <div class="panel-title"><span class="title-text">作物结构</span><span class="title-extra">按播种面积统计</span></div>
        <BaseChart :option="cropOption" height="300px" />
      </div>
    </div>

    <div class="analysis-grid secondary">
      <div class="panel chart-panel">
        <div class="panel-title"><span class="title-text">年度播种与收获趋势</span><span class="title-extra">{{ selectedYear }}年</span></div>
        <BaseChart :option="trendOption" height="270px" />
      </div>
      <div class="panel chart-panel">
        <div class="panel-title"><span class="title-text">主体分布</span><span class="title-extra">按上报主体数量统计</span></div>
        <BaseChart :option="subjectOption" height="270px" />
      </div>
    </div>

    <div class="panel report-panel">
      <div class="panel-title">
        <span class="title-text">市县种植分析报表</span>
        <span class="title-extra">数据由播种、收获进度自动汇总生成</span>
      </div>
      <el-table :data="cityRows" stripe border>
        <el-table-column type="index" label="序号" width="65" align="center" />
        <el-table-column prop="regionName" label="市级地区" min-width="140" />
        <el-table-column prop="planArea" label="计划面积(亩)" align="right" />
        <el-table-column prop="sownArea" label="播种面积(亩)" align="right" />
        <el-table-column prop="harvestedArea" label="收获面积(亩)" align="right" />
        <el-table-column prop="yield" label="估算产量(吨)" align="right" />
        <el-table-column prop="subjectCount" label="主体数" width="90" align="right" />
        <el-table-column prop="sowingRate" label="任务完成率" width="110" align="center"><template #default="{ row }">{{ row.sowingRate }}%</template></el-table-column>
        <el-table-column label="操作" width="110" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openCounty(row)">查看县级</el-button></template></el-table-column>
      </el-table>
    </div>

    <el-drawer v-model="countyVisible" :title="`${currentCity?.regionName || ''}县级统计报表`" size="820px">
      <el-table :data="countyRows" stripe border>
        <el-table-column type="index" label="序号" width="65" align="center" />
        <el-table-column prop="regionName" label="县级地区" min-width="140" />
        <el-table-column prop="planArea" label="计划面积(亩)" align="right" />
        <el-table-column prop="sownArea" label="播种面积(亩)" align="right" />
        <el-table-column prop="harvestedArea" label="收获面积(亩)" align="right" />
        <el-table-column prop="yield" label="估算产量(吨)" align="right" />
        <el-table-column prop="subjectCount" label="主体数" width="90" align="right" />
        <el-table-column prop="sowingRate" label="任务完成率" width="110" align="center"><template #default="{ row }">{{ row.sowingRate }}%</template></el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import BaseChart from '@/components/charts/BaseChart.vue'
import { fetchSowingProgress, fetchHarvestProgress } from '@/api/gpm'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const years = [2026, 2025, 2024]
const selectedYear = ref(2026)
const sowingRows = ref([])
const harvestRows = ref([])
const cityRows = ref([])
const countyRows = ref([])
const countyVisible = ref(false)
const currentCity = ref(null)
const cropNames = { wheat: '小麦', rice: '水稻', corn: '玉米', soybean: '大豆', silage_corn: '青贮玉米', alfalfa: '苜蓿' }
const cropYield = { wheat: 0.48, rice: 0.56, corn: 0.62, soybean: 0.19, silage_corn: 0.72, alfalfa: 0.38 }

const format = (value) => Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 1 })
const aggregate = (regionCode, regionName, level) => {
  const sowing = sowingRows.value.filter(item => item.level === level && String(item.regionCode) === String(regionCode))
  const harvest = harvestRows.value.filter(item => item.level === level && String(item.regionCode) === String(regionCode))
  const planArea = sowing.reduce((sum, item) => sum + Number(item.planArea || 0), 0)
  const sownArea = sowing.reduce((sum, item) => sum + Number(item.sownArea || 0), 0)
  const harvestedArea = harvest.reduce((sum, item) => sum + Number(item.harvestedArea || 0), 0)
  const yieldAmount = harvest.reduce((sum, item) => sum + Number(item.harvestedArea || 0) * (cropYield[item.crop] || 0.45), 0)
  const subjects = new Set(sowing.map(item => item.subjectId).filter(Boolean))
  return { regionCode, regionName, planArea: Number(planArea.toFixed(1)), sownArea: Number(sownArea.toFixed(1)), harvestedArea: Number(harvestedArea.toFixed(1)), yield: Number(yieldAmount.toFixed(1)), subjectCount: subjects.size, sowingRate: planArea ? Number((sownArea / planArea * 100).toFixed(1)) : 0, harvestRate: planArea ? Number((harvestedArea / planArea * 100).toFixed(1)) : 0 }
}
const totalPlanArea = computed(() => cityRows.value.reduce((sum, row) => sum + row.planArea, 0))
const totalSownArea = computed(() => cityRows.value.reduce((sum, row) => sum + row.sownArea, 0))
const totalHarvestedArea = computed(() => cityRows.value.reduce((sum, row) => sum + row.harvestedArea, 0))
const totalYield = computed(() => cityRows.value.reduce((sum, row) => sum + row.yield, 0))
const taskRate = computed(() => totalPlanArea.value ? (totalSownArea.value / totalPlanArea.value * 100).toFixed(1) : '0.0')
const cropData = computed(() => {
  const map = new Map()
  sowingRows.value.filter(item => item.level === 'city').forEach(item => map.set(item.crop, (map.get(item.crop) || 0) + Number(item.sownArea || 0)))
  return [...map.entries()].map(([code, value]) => ({ name: cropNames[code] || code, value: Number(value.toFixed(1)) }))
})
const subjectData = computed(() => cityRows.value.map(row => ({ name: row.regionName, value: row.subjectCount })))
const regionOption = computed(() => ({ tooltip: { trigger: 'axis' }, legend: { data: ['播种面积', '收获面积'] }, grid: { left: 45, right: 20, bottom: 35, top: 35 }, xAxis: { type: 'category', data: cityRows.value.map(row => row.regionName) }, yAxis: { type: 'value' }, series: [{ name: '播种面积', type: 'bar', data: cityRows.value.map(row => row.sownArea), itemStyle: { color: '#3b82f6' } }, { name: '收获面积', type: 'bar', data: cityRows.value.map(row => row.harvestedArea), itemStyle: { color: '#67c23a' } }] }))
const cropOption = computed(() => ({ tooltip: { trigger: 'item', formatter: '{b}: {c}亩 ({d}%)' }, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['42%', '70%'], center: ['50%', '45%'], data: cropData.value, label: { formatter: '{b} {d}%' } }] }))
const trendOption = computed(() => ({ tooltip: { trigger: 'axis' }, legend: { data: ['计划面积', '播种面积', '收获面积'] }, grid: { left: 45, right: 20, bottom: 35, top: 35 }, xAxis: { type: 'category', data: ['年度计划', '播种完成', '收获完成'] }, yAxis: { type: 'value' }, series: [{ name: '计划面积', type: 'line', data: [totalPlanArea.value, null, null], itemStyle: { color: '#909399' } }, { name: '播种面积', type: 'line', data: [null, totalSownArea.value, null], itemStyle: { color: '#3b82f6' } }, { name: '收获面积', type: 'line', data: [null, null, totalHarvestedArea.value], itemStyle: { color: '#67c23a' } }] }))
const subjectOption = computed(() => ({ tooltip: { trigger: 'item' }, grid: { left: 70, right: 20, bottom: 20, top: 10 }, xAxis: { type: 'value', minInterval: 1 }, yAxis: { type: 'category', data: subjectData.value.map(item => item.name) }, series: [{ type: 'bar', data: subjectData.value.map(item => item.value), itemStyle: { color: '#8b5cf6' }, label: { show: true, position: 'right' } }] }))

const load = async () => {
  const role = { ...userStore.role, code: 'province', regionCode: '340000' }
  const [sowing, harvest] = await Promise.all([fetchSowingProgress(role, { year: selectedYear.value }), fetchHarvestProgress(role, { year: selectedYear.value })])
  sowingRows.value = sowing
  harvestRows.value = harvest
  const cities = new Map()
  sowing.filter(item => item.level === 'city').forEach(item => cities.set(item.regionCode, aggregate(item.regionCode, item.regionName, 'city')))
  cityRows.value = [...cities.values()]
}
const openCounty = (row) => {
  currentCity.value = row
  const counties = new Map()
  sowingRows.value.filter(item => item.level === 'county' && String(item.cityCode) === String(row.regionCode)).forEach(item => counties.set(item.regionCode, aggregate(item.regionCode, item.regionName, 'county')))
  countyRows.value = [...counties.values()]
  countyVisible.value = true
}
const exportReport = () => ElMessage.success(`${selectedYear.value}年种植分析报表已生成`)
onMounted(load)
</script>

<style lang="scss" scoped>
.stats-page { gap: 12px; overflow: auto; }
.page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.eyebrow { margin-bottom: 4px; color: var(--ah-primary); font-size: 12px; font-weight: 600; }
.page-head h2 { margin: 0 0 6px; color: var(--ah-text); font-size: 22px; }
.page-head p { margin: 0; color: var(--ah-text-secondary); font-size: 13px; }
.head-actions { display: flex; gap: 8px; align-items: center; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { padding: 16px; background: #fff; border: 1px solid var(--ah-border); border-radius: 8px; border-top: 3px solid var(--ah-primary); }
.stat-card span, .stat-card small { display: block; color: var(--ah-text-secondary); font-size: 12px; }.stat-card strong { display: inline-block; margin: 8px 6px 4px 0; color: var(--ah-text); font-size: 25px; }
.stat-card.green { border-top-color: #67c23a; }.stat-card.orange { border-top-color: #e6a23c; }.stat-card.purple { border-top-color: #8b5cf6; }
.analysis-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 12px; }.analysis-grid.secondary { grid-template-columns: 1fr 1fr; }.chart-panel { min-width: 0; }
.panel-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }.title-text { font-weight: 700; }.title-extra { color: var(--ah-text-secondary); font-size: 12px; }.report-panel { padding-bottom: 2px; }
@media (max-width: 1000px) { .stat-grid, .analysis-grid, .analysis-grid.secondary { grid-template-columns: 1fr 1fr; } }
@media (max-width: 700px) { .page-head { flex-direction: column; }.head-actions { flex-wrap: wrap; }.stat-grid, .analysis-grid, .analysis-grid.secondary { grid-template-columns: 1fr; } }
</style>
