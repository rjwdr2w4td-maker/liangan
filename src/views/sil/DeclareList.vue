<template>
  <div class="page-container sil-page">
    <div class="page-head">
      <div><h2>青贮种植计划</h2><p>管理全省及各地区青贮饲料年度种植计划面积和预计产量。</p></div>
    </div>
    <div class="panel">
      <div class="panel-title"><span class="title-text">青贮种植计划列表</span><span class="title-extra">共 {{ rows.length }} 条</span></div>
      <el-form :inline="true" class="filters">
        <el-form-item label="年度"><el-select v-model="filters.year" clearable placeholder="全部年度" style="width:130px"><el-option v-for="year in years" :key="year" :label="`${year}年`" :value="year" /></el-select></el-form-item>
        <el-form-item label="地区"><el-input v-model="filters.region" clearable placeholder="省、市、县或乡镇" @keyup.enter="load" /></el-form-item>
        <el-form-item label="青贮品种"><el-select v-model="filters.crop" clearable placeholder="全部品种" style="width:150px"><el-option v-for="crop in crops" :key="crop" :label="crop" :value="crop" /></el-select></el-form-item>
        <el-button type="primary" @click="load">查询</el-button><el-button @click="reset">重置</el-button>
      </el-form>
      <div class="summary-grid">
        <div class="summary-card"><span>年度计划面积</span><b>{{ totalArea.toFixed(1) }}</b><em>亩</em></div>
        <div class="summary-card"><span>预计产量</span><b>{{ totalYield.toFixed(1) }}</b><em>吨</em></div>
        <div class="summary-card"><span>覆盖地区</span><b>{{ regionCount }}</b><em>个</em></div>
        <div class="summary-card"><span>青贮品种</span><b>{{ cropCount }}</b><em>种</em></div>
      </div>
      <el-table :data="rows" stripe border>
        <el-table-column prop="year" label="年度" width="90"><template #default="{ row }">{{ row.year }}年</template></el-table-column>
        <el-table-column prop="regionName" label="计划地区" min-width="190" show-overflow-tooltip/>
        <el-table-column prop="cropName" label="青贮品种" width="130"/>
        <el-table-column prop="planArea" label="年度计划面积（亩）" width="170" align="right"/>
        <el-table-column prop="expectedYield" label="预计产量（吨）" width="150" align="right"/>
        <el-table-column prop="subjectCount" label="种植主体数" width="120" align="right"/>
        <el-table-column prop="plotCount" label="关联地块数" width="120" align="right"/>
        <el-table-column label="计划状态" width="110"><template #default="{ row }"><el-tag size="small" type="success">已汇总</el-tag></template></el-table-column>
        <el-table-column label="操作" width="100" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="showDetail(row)">查看明细</el-button></template></el-table-column>
      </el-table>
      <el-empty v-if="!rows.length" description="暂无青贮种植计划" />
    </div>
    <el-dialog v-model="detailVisible" title="青贮种植计划明细" width="760px">
      <template v-if="current">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="年度">{{ current.year }}年</el-descriptions-item><el-descriptions-item label="计划地区">{{ current.regionName }}</el-descriptions-item>
          <el-descriptions-item label="青贮品种">{{ current.cropName }}</el-descriptions-item><el-descriptions-item label="种植主体数">{{ current.subjectCount }} 个</el-descriptions-item>
          <el-descriptions-item label="年度计划面积">{{ current.planArea.toFixed(1) }} 亩</el-descriptions-item><el-descriptions-item label="预计产量">{{ current.expectedYield.toFixed(1) }} 吨</el-descriptions-item>
          <el-descriptions-item label="关联地块数">{{ current.plotCount }} 块</el-descriptions-item><el-descriptions-item label="数据来源">青贮种植计划汇总</el-descriptions-item>
        </el-descriptions>
        <div class="sub-title">种植主体计划明细</div>
        <el-table :data="current.details" stripe border max-height="360"><el-table-column prop="subjectName" label="种植主体" min-width="220" show-overflow-tooltip/><el-table-column prop="cropName" label="青贮品种" width="120"/><el-table-column prop="area" label="计划面积（亩）" width="130" align="right"/><el-table-column label="种植地块" min-width="240" show-overflow-tooltip><template #default="{ row }"><span>{{ row.plotNames || '未关联地块' }}</span></template></el-table-column><el-table-column prop="expectedYield" label="预计产量（吨）" width="130" align="right"/></el-table>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { fetchDeclarations } from '@/api/sil'
import { getRegion } from '@/mock/common/regions'
import { PLOT_MAP } from '@/mock/geo/plot-gen'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const sourceRows = ref([])
const rows = ref([])
const current = ref(null)
const detailVisible = ref(false)
const filters = reactive({ year: '', region: '', crop: '' })
const regionName = (code) => code === '340000' ? '全省' : getRegion(code)?.name || code || '未明确地区'
const years = computed(() => [...new Set(sourceRows.value.map((item) => Number(item.year)).filter(Boolean))].sort((a, b) => b - a))
const crops = computed(() => [...new Set(sourceRows.value.map((item) => item.cropName || item.crop).filter(Boolean))])
const aggregate = (items) => {
  const grouped = new Map()
  items.forEach((item) => {
    const key = `${item.year || 2026}-${item.regionCode || '340000'}-${item.cropName || item.crop || '其他青贮'}`
    const plotIds = item.plotIds || []
    const detail = { subjectId: item.subjectId, subjectName: item.subjectName || '未填报主体', cropName: item.cropName || item.crop || '其他青贮', area: Number(item.area ?? item.supplementArea ?? 0), expectedYield: Number(item.expectedYield || 0), plotIds, plotNames: plotIds.map((id) => PLOT_MAP[id]?.name || id).join('、') }
    const row = grouped.get(key) || { year: Number(item.year || 2026), regionCode: item.regionCode || '340000', regionName: regionName(item.regionCode), cropName: detail.cropName, planArea: 0, expectedYield: 0, subjectIds: new Set(), plotIds: new Set(), details: [] }
    row.planArea += detail.area; row.expectedYield += detail.expectedYield; row.subjectIds.add(item.subjectId || item.subjectName); plotIds.forEach((id) => row.plotIds.add(id)); row.details.push(detail); grouped.set(key, row)
  })
  return [...grouped.values()].map((row) => ({ ...row, subjectCount: row.subjectIds.size, plotCount: row.plotIds.size })).sort((a, b) => b.year - a.year || a.regionName.localeCompare(b.regionName, 'zh-CN'))
}
const load = async () => {
  sourceRows.value = await fetchDeclarations(userStore.role)
  rows.value = aggregate(sourceRows.value).filter((row) => (!filters.year || row.year === filters.year) && (!filters.crop || row.cropName === filters.crop) && (!filters.region || row.regionName.includes(filters.region)))
}
const reset = () => { Object.assign(filters, { year: '', region: '', crop: '' }); load() }
const showDetail = (row) => { current.value = row; detailVisible.value = true }
const totalArea = computed(() => rows.value.reduce((sum, row) => sum + row.planArea, 0))
const totalYield = computed(() => rows.value.reduce((sum, row) => sum + row.expectedYield, 0))
const regionCount = computed(() => new Set(rows.value.map((row) => row.regionCode)).size)
const cropCount = computed(() => new Set(rows.value.map((row) => row.cropName)).size)
onMounted(load)
</script>
<style scoped lang="scss">
.sil-page{overflow:auto}.page-head{display:flex;justify-content:space-between;margin-bottom:14px}.page-head h2{margin:4px 0;color:var(--ah-text);font-size:22px}.page-head p{color:var(--ah-text-secondary);font-size:13px}.filters{display:flex;align-items:center;flex-wrap:wrap}.filters :deep(.el-form-item){margin-bottom:12px}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:4px 0 16px}.summary-card{padding:14px 18px;border:1px solid #e4ebf3;border-radius:8px;background:#f8fbff}.summary-card span{display:block;color:#718096;font-size:13px}.summary-card b{margin-top:5px;color:#1d5d9b;font-size:24px}.summary-card em{margin-left:6px;color:#718096;font-size:12px;font-style:normal}.sub-title{margin:18px 0 10px;padding-left:8px;border-left:3px solid var(--ah-primary);font-weight:600}@media(max-width:900px){.summary-grid{grid-template-columns:repeat(2,1fr)}}
</style>