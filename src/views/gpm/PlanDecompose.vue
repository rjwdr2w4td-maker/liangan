<template>
  <div class="page-container task-page">
    <div class="page-head">
      <div>
        <h2>种植计划下达</h2>
        <p>审核通过后，按照行政区划、作物类型、主体类型和地块范围下达种植任务，乡镇管理人员和种植主体可通过PC端或移动端查看。</p>
      </div>
      <el-button @click="load">刷新计划</el-button>
    </div>

    <div class="metric-grid">
      <div class="metric-card"><span>当前层级</span><strong>{{ levelLabel(currentLevel) }}</strong><small>逐层下钻查看任务</small></div>
      <div class="metric-card blue"><span>当前对象数</span><strong>{{ currentRows.length }}</strong><small>{{ currentLevel === 'province' ? '省级计划' : '当前下级任务' }}</small></div>
      <div class="metric-card green"><span>当前计划种植面积</span><strong>{{ currentArea.toLocaleString() }}</strong><small>亩</small></div>
      <div class="metric-card orange"><span>已落实任务</span><strong>{{ completedCount }}</strong><small>当前层级已完成</small></div>
    </div>

    <div v-if="userStore.role?.code === 'county'" class="panel county-issue-panel">
      <div class="panel-title">
        <span class="title-text">县级种植计划下达列表</span>
        <el-tag type="info" effect="plain">只读查看</el-tag>
      </div>
      <el-form :inline="true" class="county-filters">
        <el-form-item label="关键字"><el-input v-model="countyFilters.keyword" clearable placeholder="作物类型或计划说明" style="width:180px" /></el-form-item>
        <el-form-item label="年份"><el-select v-model="countyFilters.year" clearable placeholder="全部" style="width:115px"><el-option label="2026年" :value="2026" /></el-select></el-form-item>
        <el-form-item label="季度"><el-select v-model="countyFilters.quarter" clearable placeholder="全部" style="width:130px"><el-option v-for="item in quarters" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-button type="primary" @click="loadCountyIssueList">查询</el-button>
      </el-form>
      <el-table :data="countyIssueRows" border stripe class="county-issue-table">
        <el-table-column prop="year" label="年份" width="90"><template #default="{ row }">{{ row.year }}年</template></el-table-column>
        <el-table-column prop="quarter" label="季度" width="110" />
        <el-table-column prop="area" label="计划种植面积（万亩）" width="150" align="right" />
        <el-table-column prop="cropType" label="作物类型" width="150" />
        <el-table-column prop="description" label="计划说明" min-width="280" show-overflow-tooltip />
        <el-table-column label="附件" min-width="220">
          <template #default="{ row }">
            <span v-if="row.attachmentName" class="attachment-name">{{ row.attachmentName }}</span>
            <span v-else class="attachment-empty">未上传</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openCountyIssue(row)">查看</el-button></template></el-table-column>
      </el-table>
      <el-empty v-if="!countyIssueRows.length" description="暂无种植计划" />
    </div>

    <div v-else class="panel">
      <div class="panel-title">
        <span class="title-text">计划下钻</span>
        <span class="title-extra">省级计划 → 市级 → 县级 → 乡镇 → 村级 → 主体 → 地块</span>
      </div>

      <el-form :inline="true" class="filters">
        <el-form-item label="年份">
          <el-select v-model="filters.year" clearable placeholder="全部" style="width:115px">
            <el-option label="2026年" :value="2026" />
          </el-select>
        </el-form-item>
        <el-form-item label="季度">
          <el-select v-model="filters.quarter" clearable placeholder="全部" style="width:130px">
            <el-option v-for="item in quarters" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="行政区划">
          <el-select v-model="filters.region" clearable placeholder="全部区域" style="width:150px">
            <el-option v-for="item in regionOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="作物类型">
          <el-select v-model="filters.cropType" clearable placeholder="全部作物" style="width:130px">
            <el-option v-for="item in cropOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="主体类型">
          <el-select v-model="filters.subjectType" clearable placeholder="全部类型" style="width:130px">
            <el-option label="合作社" value="合作社" />
            <el-option label="家庭农场" value="家庭农场" />
            <el-option label="种植大户" value="种植大户" />
          </el-select>
        </el-form-item>
        <el-form-item label="地块范围">
          <el-select v-model="filters.plotRange" clearable placeholder="全部地块" style="width:130px">
            <el-option label="已关联地块" value="linked" />
            <el-option label="未关联地块" value="unlinked" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="filters.keyword" clearable placeholder="计划、区域或主体" style="width:190px" @keyup.enter="load" />
        </el-form-item>
        <el-button type="primary" @click="load">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form>

      <el-table v-if="hierarchy.length" :data="hierarchy" border stripe class="plan-table" @row-click="openPlan">
        <el-table-column label="省级计划" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="name-cell">
              <span class="level-dot dot-province"></span>
              <div><strong>{{ row.name }}</strong><small>{{ row.unit }}</small></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="年度" width="100"><template #default="{ row }">{{ row.year }}年</template></el-table-column>
        <el-table-column prop="quarter" label="季度" width="110" />
        <el-table-column prop="cropType" label="作物类型" width="120" />
        <el-table-column label="任务数量" width="120" align="right"><template #default="{ row }">{{ row.taskCount || 0 }}</template></el-table-column>
        <el-table-column label="计划种植面积（亩）" width="150" align="right"><template #default="{ row }">{{ Number(row.area || 0).toLocaleString() }}</template></el-table-column>
        <el-table-column v-if="currentLevel !== 'plot'" label="状态" width="110"><template #default="{ row }"><el-tag size="small" :type="statusType(row.status)">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="130" fixed="right"><template #default="{ row }"><el-button link type="primary" @click.stop="openPlan(row)">查看市级</el-button></template></el-table-column>
      </el-table>
      <el-empty v-else description="暂无匹配的计划" />
    </div>

    <el-dialog v-if="userStore.role?.code === 'county'" v-model="countyIssueVisible" title="种植计划任务分解" width="1050px" destroy-on-close>
      <template v-if="countyIssueDetail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="年份">{{ countyIssueDetail.year }}年</el-descriptions-item>
          <el-descriptions-item label="季度">{{ countyIssueDetail.quarter }}</el-descriptions-item>
          <el-descriptions-item label="计划种植面积">{{ countyIssueDetail.area }} 万亩</el-descriptions-item>
          <el-descriptions-item label="作物类型">{{ countyIssueDetail.cropType }}</el-descriptions-item>
          <el-descriptions-item label="附件">{{ countyIssueDetail.attachmentName || '未上传' }}</el-descriptions-item>
          <el-descriptions-item label="状态"><el-tag size="small">{{ countyIssueDetail.status }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="计划说明" :span="3">{{ countyIssueDetail.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-title"><b>县级分解到种植大户和地块</b></div>
        <el-table :data="countySubjectRows" stripe border max-height="390">
          <el-table-column prop="subjectName" label="种植大户/主体" min-width="220" />
          <el-table-column prop="owner" label="负责人" width="100" />
          <el-table-column prop="townName" label="乡镇" width="110" />
          <el-table-column prop="villageName" label="村" width="110" />
          <el-table-column prop="targetArea" label="主体任务面积（亩）" width="140" align="right" />
          <el-table-column label="地块落实面积" min-width="270">
            <template #default="{ row }">
              <div v-for="plot in row.plotRows" :key="plot.plotId" class="plot-summary-row">{{ plot.plotName }}：{{ Number(plot.targetArea || 0).toFixed(1) }}亩</div>
            </template>
          </el-table-column>
          <el-table-column prop="cropType" label="作物类型" width="110" />
          <el-table-column prop="status" label="分解状态" width="110"><template #default="{ row }"><el-tag size="small" :type="row.status === '已分解' ? 'success' : 'warning'">{{ row.status }}</el-tag></template></el-table-column>
        </el-table>
      </template>
      <template #footer><el-button @click="countyIssueVisible = false">关闭</el-button></template>
    </el-dialog>

    <el-dialog v-model="drillVisible" :title="`${currentTitle} - ${levelLabel(currentLevel)}`" width="1000px" destroy-on-close>
      <div class="breadcrumb-bar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="(item, index) in stack" :key="item.id"><span class="breadcrumb-link" @click="jumpTo(index)">{{ item.name }}</span></el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="drill-header"><div><span class="level-badge" :class="`level-${currentLevel}`">{{ levelLabel(currentLevel) }}</span><strong>{{ currentTitle }}</strong></div><span class="drill-tip">点击列表行进入下一层</span></div>
      <el-table v-if="currentRows.length" :data="currentRows" border stripe class="drill-table" @row-click="openRow">
        <el-table-column label="名称" min-width="280" show-overflow-tooltip><template #default="{ row }"><div class="name-cell"><span class="level-dot" :class="`dot-${row.level}`"></span><div><strong>{{ row.name }}</strong><small>{{ row.unit }}</small></div></div></template></el-table-column>
        <el-table-column label="下级对象" width="120" align="center"><template #default="{ row }">{{ row.children?.length || 0 }} 个</template></el-table-column>
        <el-table-column label="任务数量" width="120" align="right"><template #default="{ row }">{{ row.taskCount || 0 }}</template></el-table-column>
        <el-table-column label="计划种植面积（亩）" width="150" align="right"><template #default="{ row }">{{ Number(row.area || 0).toLocaleString() }}</template></el-table-column>
        <el-table-column label="状态" width="110"><template #default="{ row }"><el-tag size="small" :type="statusType(row.status)">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="130" fixed="right"><template #default="{ row }"><el-button link type="primary" @click.stop="openRow(row)">{{ row.children?.length ? '查看下级' : '查看详情' }}</el-button></template></el-table-column>
      </el-table>
      <el-empty v-else description="暂无下级任务" />
      <template #footer><el-button @click="drillVisible = false">关闭</el-button></template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="地块任务详情" width="900px" destroy-on-close>
      <template v-if="detail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="来源计划" :span="2">{{ detail.planName }}</el-descriptions-item>
          <el-descriptions-item label="作物类型">{{ detail.cropType }}</el-descriptions-item>
          <el-descriptions-item label="行政路径" :span="3">安徽省 / {{ detail.cityName }} / {{ detail.countyName }} / {{ detail.townName }} / {{ detail.villageName }} / {{ detail.subjectName }}</el-descriptions-item>
          <el-descriptions-item label="种植主体">{{ detail.subjectName }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ detail.owner }}</el-descriptions-item>
          <el-descriptions-item label="计划种植面积">{{ detail.taskArea }} 亩</el-descriptions-item>
          <el-descriptions-item label="下达时间">{{ detail.issuedAt }}</el-descriptions-item>
          <el-descriptions-item label="落实进度">{{ detail.progress }}%</el-descriptions-item>
          <el-descriptions-item label="状态"><el-tag :type="statusType(detail.status)">{{ detail.status }}</el-tag></el-descriptions-item>
        </el-descriptions>

        <div class="detail-title"><b>完整下达路径</b></div>
        <div class="path-flow">
          <template v-for="(node, index) in detail.nodes" :key="`${node.level}-${node.name}`">
            <div class="flow-node" :class="`level-${index}`">
              <span>{{ node.level }}</span><strong>{{ node.name }}</strong><small>{{ node.unit }}</small>
              <el-tag size="small" :type="statusType(node.status)">{{ node.status }}</el-tag>
            </div>
            <div v-if="index < detail.nodes.length - 1" class="flow-arrow">→</div>
          </template>
        </div>

        <div class="detail-title"><b>关联地块</b><span>共 {{ detail.plots.length }} 个</span></div>
        <el-table :data="detail.plots" border size="small">
          <el-table-column prop="name" label="地块名称" min-width="220" />
          <el-table-column prop="id" label="地块编号" width="130" />
          <el-table-column prop="taskArea" label="计划种植面积（亩）" width="150" align="right" />
          <el-table-column label="当前作物" width="110"><template #default="{ row }">{{ cropName(row.crop) }}</template></el-table-column>
        </el-table>

        <div class="detail-title"><b>任务落实进度</b><span>{{ detail.progress }}%</span></div>
        <el-progress :percentage="detail.progress" :stroke-width="14" :status="detail.progress === 100 ? 'success' : ''" />
      </template>
      <template #footer><el-button @click="detailVisible = false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { fetchCountyPlanIssueList, fetchPlantingPlanSubjectTasks, fetchTaskHierarchy, fetchTaskPathDetail } from '@/api/gpm'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const hierarchy = ref([])
const countyIssueRows = ref([])
const countyIssueVisible = ref(false)
const countyIssueDetail = ref(null)
const countySubjectRows = ref([])
const countyFilters = reactive({ keyword: '', year: '', quarter: '' })
const stack = ref([])
const detail = ref(null)
const detailVisible = ref(false)
const drillVisible = ref(false)
const filters = reactive({ year: '', quarter: '', region: '', cropType: '', subjectType: '', plotRange: '', keyword: '' })
const quarters = ['第一季度', '第二季度', '第三季度', '第四季度']
const regionOptions = ['阜阳市', '亳州市', '合肥市']
const cropOptions = ['小麦', '水稻', '玉米', '大豆']
const levelLabels = { province: '省级计划', city: '市级', county: '县级', town: '乡镇', village: '村级', subject: '种植主体', plot: '地块' }
const levelLabel = (level) => levelLabels[level] || level
const currentNode = computed(() => stack.value[stack.value.length - 1] || null)
const currentRows = computed(() => currentNode.value ? currentNode.value.children || [] : hierarchy.value)
const currentLevel = computed(() => currentRows.value[0]?.level || currentNode.value?.level || 'province')
const currentTitle = computed(() => currentNode.value ? `${currentNode.value.name}下级任务` : '省级计划列表')
const currentArea = computed(() => currentRows.value.reduce((sum, item) => sum + Number(item.area || 0), 0))
const completedCount = computed(() => currentRows.value.filter((item) => item.status === '已落实').length)
const statusType = (status) => ({ 已落实: 'success', 落实中: 'warning', 已下达: 'primary' }[status] || 'info')
const cropName = (crop) => ({ wheat: '小麦', rice: '水稻', corn: '玉米', soybean: '大豆', silage_corn: '青贮玉米' }[crop] || crop || '未设置')

const loadCountyIssueList = async () => {
  countyIssueRows.value = await fetchCountyPlanIssueList(userStore.role, countyFilters)
}
const openCountyIssue = async (row) => {
  countyIssueDetail.value = row
  countySubjectRows.value = await fetchPlantingPlanSubjectTasks(row.id, userStore.role)
  countyIssueVisible.value = true
}
const load = async () => {
  if (userStore.role?.code === 'county') {
    await loadCountyIssueList()
    return
  }
  hierarchy.value = await fetchTaskHierarchy({ ...filters, role: userStore.role })
  stack.value = []
  drillVisible.value = false
}
const reset = () => {
  Object.assign(filters, { year: '', quarter: '', region: '', cropType: '', subjectType: '', plotRange: '', keyword: '' })
  load()
}
const openPlan = (row) => {
  stack.value = [row]
  drillVisible.value = true
}
const openRow = async (row) => {
  if (row.children?.length) {
    stack.value.push(row)
    return
  }
  if (row.detailId) {
    detail.value = await fetchTaskPathDetail(row.detailId)
    detailVisible.value = true
  }
}
const jumpTo = (index) => {
  stack.value = stack.value.slice(0, index + 1)
}
const goHome = () => {
  stack.value = []
  drillVisible.value = false
}

onMounted(load)
</script>

<style lang="scss" scoped>
.task-page{overflow:auto}.page-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}.page-head h2{margin:4px 0 5px;font-size:22px}.page-head p{color:var(--ah-text-secondary);font-size:13px}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px}.metric-card{padding:14px 16px;background:#fff;border-left:4px solid #8a97a8;border-radius:8px;box-shadow:0 1px 4px rgba(15,62,120,.06)}.metric-card.blue{border-color:var(--ah-primary)}.metric-card.green{border-color:var(--ah-success)}.metric-card.orange{border-color:var(--ah-warning)}.metric-card span,.metric-card small{display:block;color:var(--ah-text-secondary);font-size:12px}.metric-card strong{display:block;margin:5px 0 2px;font-size:23px}.filters{display:flex;align-items:center;flex-wrap:nowrap}.filters :deep(.el-form-item){margin-bottom:12px;margin-right:10px}.county-issue-panel{min-height:260px}.county-filters{display:flex;align-items:center;flex-wrap:nowrap}.county-filters :deep(.el-form-item){margin-bottom:12px;margin-right:12px}.county-issue-table{margin-top:4px}.breadcrumb-bar{display:flex;align-items:center;gap:16px;min-height:38px;margin:2px 0 10px;padding:8px 12px;background:#f7f9fc;border-radius:4px}.breadcrumb-link{cursor:pointer;color:var(--ah-primary)}.drill-header{display:flex;align-items:center;justify-content:space-between;margin:12px 0;padding-bottom:10px;border-bottom:1px solid #e8edf3}.drill-header>div{display:flex;align-items:center;gap:10px}.drill-header strong{font-size:16px}.drill-tip{color:var(--ah-text-secondary);font-size:12px}.level-badge{display:inline-flex;align-items:center;justify-content:center;min-width:64px;padding:4px 8px;border-radius:4px;background:#e8f1ff;color:var(--ah-primary);font-size:12px}.level-badge.level-county{background:#eef4ff;color:#5b8ff9}.level-badge.level-town{background:#eaf8f1;color:var(--ah-success)}.level-badge.level-village{background:#fff5e7;color:#c77a12}.level-badge.level-subject{background:#f5edff;color:#8257c7}.level-badge.level-plot{background:#f1f3f5;color:#606b7a}.drill-table{cursor:pointer}.name-cell{display:flex;align-items:center;gap:10px}.name-cell>div{display:flex;flex-direction:column;gap:4px}.name-cell small{color:var(--ah-text-secondary);font-size:12px}.level-dot{width:9px;height:9px;border-radius:50%;background:var(--ah-primary)}.dot-county{background:#5b8ff9}.dot-town{background:var(--ah-success)}.dot-village{background:#d9942d}.dot-subject{background:#8257c7}.dot-plot{background:#606b7a}.detail-title{display:flex;align-items:center;justify-content:space-between;margin:20px 0 12px}.path-flow{display:flex;align-items:stretch;justify-content:space-between;overflow-x:auto}.flow-node{display:flex;flex:1;min-width:120px;flex-direction:column;gap:6px;padding:14px;background:#f5f8fc;border-top:3px solid var(--ah-primary);border-radius:6px}.flow-node span,.flow-node small{color:var(--ah-text-secondary);font-size:12px}.flow-node strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.flow-node.level-1{border-color:#5b8ff9}.flow-node.level-2{border-color:var(--ah-success)}.flow-node.level-3{border-color:#d9942d}.flow-node.level-4{border-color:#8257c7}.flow-node.level-5{border-color:#606b7a}.flow-node .el-tag{align-self:flex-start}.flow-arrow{display:flex;align-items:center;padding:0 6px;color:var(--ah-primary);font-size:22px}@media(max-width:1000px){.metric-grid{grid-template-columns:repeat(2,1fr)}.filters{flex-wrap:wrap}.path-flow{overflow-x:auto}.flow-node{min-width:150px}}
</style>