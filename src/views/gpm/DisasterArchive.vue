<template>
  <div class="page-container disaster-archive-page">
    <div class="page-head">
      <div>
        <h2>灾情档案</h2>
        <p>按省、市、县、种植主体、地块逐级查看主体上报的灾情信息。</p>
      </div>
      <div class="scope-label">当前范围：{{ userStore.regionName }}</div>
    </div>

    <div class="panel list-panel">
      <div class="toolbar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.code">
            <span class="breadcrumb-link" @click="goToLevel(item)">{{ item.name }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <span class="record-count">共 {{ currentRows.length }} 条记录</span>
      </div>

      <div class="detail-tip">当前页面数据均由种植主体上报，省、市、县级管理人员按权限逐级查看。</div>

      <el-table :data="currentRows" stripe border height="calc(100vh - 280px)">
        <el-table-column type="index" label="序号" width="65" align="center" />
        <el-table-column :label="isPlotLevel ? '关联地块' : currentLabel" min-width="220">
          <template #default="{ row }">
            <el-button v-if="!isPlotLevel" link type="primary" @click="openLevel(row)">{{ row.name }}</el-button>
            <span v-else>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="isPlotLevel" prop="occurrenceTime" label="灾害发生时间" width="155" />
        <el-table-column v-if="isPlotLevel" prop="disasterType" label="灾害类型" width="110" />
        <el-table-column v-if="isPlotLevel" prop="crop" label="受灾作物" width="105" />
        <el-table-column prop="affectedArea" label="受灾面积（亩）" width="125" align="right" />
        <el-table-column prop="disasterArea" label="成灾面积（亩）" width="125" align="right" />
        <el-table-column prop="lostArea" label="绝收面积（亩）" width="125" align="right" />
        <el-table-column prop="estimatedYieldLoss" label="预估产量损失（吨）" width="155" align="right" />
        <el-table-column v-if="isPlotLevel" label="操作" width="90" fixed="right">
          <template #default="{ row }"><el-button link type="primary" @click="showDetail(row.record)">查看</el-button></template>
        </el-table-column>
        <el-table-column v-else label="操作" width="100" fixed="right">
          <template #default="{ row }"><el-button link type="primary" @click="openLevel(row)">查看下级</el-button></template>
        </el-table-column>
        <template #empty><el-empty description="暂无主体上报灾情" /></template>
      </el-table>
    </div>

    <el-drawer v-model="detailVisible" title="主体上报灾情详情" size="560px">
      <el-descriptions v-if="current" :column="1" border>
        <el-descriptions-item label="上报主体">{{ current.subjectName }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ current.owner || '—' }}</el-descriptions-item>
        <el-descriptions-item label="灾害发生时间">{{ current.occurrenceTime }}</el-descriptions-item>
        <el-descriptions-item label="灾害地点">{{ current.locationName }}</el-descriptions-item>
        <el-descriptions-item label="关联地块">{{ current.plotName }}（{{ current.plotId }}）</el-descriptions-item>
        <el-descriptions-item label="灾害类型">{{ current.disasterType }}</el-descriptions-item>
        <el-descriptions-item label="受灾作物">{{ current.crop }}</el-descriptions-item>
        <el-descriptions-item label="受灾面积">{{ current.affectedArea }} 亩</el-descriptions-item>
        <el-descriptions-item label="成灾面积">{{ current.disasterArea }} 亩</el-descriptions-item>
        <el-descriptions-item label="绝收面积">{{ current.lostArea }} 亩</el-descriptions-item>
        <el-descriptions-item label="预估产量损失">{{ current.estimatedYieldLoss }} 吨</el-descriptions-item>
        <el-descriptions-item label="灾情说明">{{ current.description || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="现场图片">
          <div v-if="current.images?.length" class="现场图片列表">
            <el-image
              v-for="(image, index) in current.images"
              :key="`${current.id}-${index}`"
              class="现场图片"
              :src="image.url"
              :preview-src-list="current.images.map(item => item.url)"
              :initial-index="index"
              fit="cover"
            />
          </div>
          <span v-else>暂无现场图片</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchDisasterArchives } from '@/api/gpm'
import { useUserStore } from '@/stores/user'
import { REGION_TREE } from '@/mock/common/regions'
import { PLOTS, SUBJECT_MAP } from '@/mock/geo/plot-gen'

const userStore = useUserStore()
const records = ref([])
const currentCode = ref('')
const breadcrumbs = ref([])
const detailVisible = ref(false)
const current = ref(null)

const roleLevel = computed(() => userStore.role?.code || 'province')
const startLevel = computed(() => ({ province: 'city', city: 'county', county: 'subject', subject: 'plot' }[roleLevel.value] || 'city'))
const currentLevel = computed(() => breadcrumbs.value.at(-1)?.level || startLevel.value)
const currentRegionCode = computed(() => breadcrumbs.value.at(-1)?.scopeCode || userStore.role?.regionCode || '340000')
const isPlotLevel = computed(() => currentLevel.value === 'plot')
const currentLabel = computed(() => ({ city: '市级地区', county: '县级地区', subject: '种植主体', plot: '关联地块' }[currentLevel.value] || '下级区域'))

const findRegion = code => {
  const walk = nodes => {
    for (const node of nodes || []) {
      if (node.code === code) return node
      const result = walk(node.children)
      if (result) return result
    }
    return null
  }
  return walk(REGION_TREE)
}
const findCity = code => {
  const value = String(code || '')
  return REGION_TREE[0].children.find(city => {
    if (value === city.code || value.startsWith(city.code)) return true
    return (city.children || []).some(county => value === county.code || value.startsWith(county.code) || (county.children || []).some(town => value === town.code || value.startsWith(town.code)))
  })
}
const findCounty = code => {
  const value = String(code || '')
  return findCity(value)?.children?.find(county => value === county.code || value.startsWith(county.code) || (county.children || []).some(town => value === town.code || value.startsWith(town.code)))
}
const findTown = code => {
  const value = String(code || '')
  return findCounty(value)?.children?.find(town => value === town.code || value.startsWith(town.code))
}

const normalizedRecords = computed(() => records.value.map(item => {
  const plot = PLOTS.find(row => row.id === item.plotId)
  const subject = SUBJECT_MAP[plot?.subjectId || item.subjectId]
  const regionCode = item.regionCode || plot?.regionCode || subject?.regionCode || ''
  const town = findTown(regionCode)
  return {
    ...item,
    regionCode,
    subjectId: item.subjectId || plot?.subjectId || '',
    subjectName: item.subjectName || subject?.name || '未知主体',
    owner: item.owner || subject?.owner || '',
    plotName: item.plotName || plot?.name || item.plotId,
    townCode: town?.code || (regionCode.length > 6 ? regionCode : ''),
    townName: town?.name || item.locationName || '',
    cityCode: findCity(regionCode)?.code || '',
    cityName: findCity(regionCode)?.name || '',
    countyCode: findCounty(regionCode)?.code || '',
    countyName: findCounty(regionCode)?.name || ''
  }
}))

const rowsInScope = computed(() => normalizedRecords.value.filter(item => {
  const role = userStore.role || {}
  if (role.subjectId) return item.subjectId === role.subjectId
  if (!role.regionCode || role.regionCode === '340000') return true
  const roleCode = String(role.regionCode)
  return item.cityCode === roleCode || item.countyCode === roleCode || item.townCode === roleCode || String(item.regionCode).startsWith(roleCode)
}))
const sumRows = rows => ({ affectedArea: Number(rows.reduce((sum, item) => sum + Number(item.affectedArea || 0), 0).toFixed(2)), disasterArea: Number(rows.reduce((sum, item) => sum + Number(item.disasterArea || 0), 0).toFixed(2)), lostArea: Number(rows.reduce((sum, item) => sum + Number(item.lostArea || 0), 0).toFixed(2)), estimatedYieldLoss: Number(rows.reduce((sum, item) => sum + Number(item.estimatedYieldLoss || 0), 0).toFixed(2)) })
const currentRows = computed(() => {
  const rows = rowsInScope.value.filter(item => {
    if (currentLevel.value === 'city') return currentRegionCode.value === '340000' || item.cityCode === currentRegionCode.value
    if (currentLevel.value === 'county') return item.cityCode === currentRegionCode.value
    if (currentLevel.value === 'subject') return item.countyCode === currentRegionCode.value
    if (currentLevel.value === 'plot') return item.subjectId === currentRegionCode.value
    return true
  })
  if (isPlotLevel.value) return rows.map(item => ({ ...item, name: item.plotName, record: item }))
  const groups = new Map()
  rows.forEach(item => {
    const key = currentLevel.value === 'city' ? item.cityCode : currentLevel.value === 'county' ? item.countyCode : item.subjectId
    if (!key) return
    const name = currentLevel.value === 'city' ? item.cityName : currentLevel.value === 'county' ? item.countyName : item.subjectName
    const existing = groups.get(key) || { code: key, name, rows: [] }
    existing.rows.push(item)
    Object.assign(existing, sumRows(existing.rows))
    groups.set(key, existing)
  })
  return [...groups.values()]
})

const load = async () => {
  records.value = await fetchDisasterArchives()
  const roleRegionCode = userStore.role?.regionCode || '340000'
  const root = roleLevel.value === 'province' ? REGION_TREE[0] : findRegion(roleRegionCode)
  currentCode.value = roleRegionCode
  breadcrumbs.value = [{ code: root?.code || roleRegionCode, name: root?.name || userStore.regionName || '安徽省', level: startLevel.value, scopeCode: roleRegionCode }]
}
const openLevel = row => {
  const nextLevel = currentLevel.value === 'city' ? 'county' : currentLevel.value === 'county' ? 'subject' : 'plot'
  breadcrumbs.value = [...breadcrumbs.value, { code: row.code, name: row.name, level: nextLevel, scopeCode: row.code }]
  currentCode.value = row.code
}
const goToLevel = item => { const index = breadcrumbs.value.findIndex(row => row.code === item.code && row.level === item.level); if (index >= 0) breadcrumbs.value = breadcrumbs.value.slice(0, index + 1) }
const showDetail = row => { current.value = row; detailVisible.value = true }
onMounted(load)
</script>

<style lang="scss" scoped>
.disaster-archive-page{gap:12px;overflow:hidden}.page-head{display:flex;align-items:center;justify-content:space-between;padding:4px 2px}.page-head h2{margin:0;color:#1f2937;font-size:20px}.page-head p{margin:8px 0 0;color:#909399;font-size:13px}.scope-label{color:#606266;font-size:13px}.list-panel{flex:1;min-height:0;padding:16px}.toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.breadcrumb-link{color:#409eff;cursor:pointer}.record-count{color:#909399;font-size:13px}.detail-tip{margin-bottom:12px;padding:10px 12px;color:#606266;background:#f4f8ff;border-radius:4px}.现场图片列表{display:flex;flex-wrap:wrap;gap:10px}.现场图片{width:96px;height:72px;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer}@media (max-width:800px){.page-head,.toolbar{align-items:flex-start;flex-direction:column;gap:10px}}
</style>
