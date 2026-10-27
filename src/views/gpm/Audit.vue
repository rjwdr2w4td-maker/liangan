<template>
  <div class="page-container gpm-page">
    <div class="page-head">
      <div>
        <h2>{{ readonlyMode ? '种植计划下达' : '种植计划审核' }}</h2>
        <p>{{ readonlyMode ? '查看审核通过后的种植计划、行政区划、作物类型、主体类型和地块范围任务下达信息。' : userStore.role?.code === 'city' ? '审核县级分解到种植主体、镇村和具体地块的任务，支持退回修改、意见填写和审核留痕。' : '对年度种植计划及各级任务分解进行逐级审核，支持退回修改、意见填写和审核留痕。' }}</p>
      </div>
      <el-tag v-if="!readonlyMode" type="warning">待审核 {{ pendingCount }} 条</el-tag>
      <el-tag v-else type="success">只读查看</el-tag>
    </div>

    <div class="panel">
      <el-form :inline="true" class="filters">
        <el-form-item v-if="!readonlyMode && userStore.role?.code !== 'city'" label="审核范围">
          <el-select v-model="filters.view" clearable placeholder="全部范围" style="width:150px">
            <el-option label="市级审核县级" value="city-county" />
            <el-option label="县级分配计划" value="county-plan" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="filters.keyword" clearable placeholder="计划、提交行政区" />
        </el-form-item>
        <el-form-item label="年份">
          <el-select v-model="filters.year" clearable placeholder="全部" style="width:120px">
            <el-option label="2026年" :value="2026" />
            <el-option label="2025年" :value="2025" />
          </el-select>
        </el-form-item>
        <el-form-item label="季度">
          <el-select v-model="filters.quarter" clearable placeholder="全部" style="width:130px">
            <el-option v-for="item in quarters" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!readonlyMode" label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部" style="width:130px">
            <el-option v-if="!readonlyMode" label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option v-if="!readonlyMode" label="已退回" value="rejected" />
            <el-option v-if="!readonlyMode" label="历史计划" value="history" />
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="load">查询</el-button>
      </el-form>

      <el-table :data="rows" stripe border>
        <el-table-column prop="planYear" label="年份" width="80" />
        <el-table-column prop="quarter" label="季度" width="105" />
        <el-table-column prop="regionName" :label="userStore.role?.code === 'city' ? '提交县' : '提交市'" width="105" />
        <el-table-column prop="cropType" label="作物类型" width="130" show-overflow-tooltip />
        <el-table-column prop="countyCount" label="县级计划数" width="105" align="center" />
        <el-table-column prop="totalArea" label="计划种植面积（万亩）" width="145" align="right" />
        <el-table-column prop="actualArea" label="实际种植面积（万亩）" width="145" align="right" />
        <el-table-column prop="submitter" label="提交单位" min-width="160" />
        <el-table-column :prop="readonlyMode ? 'issuedAt' : 'submittedAt'" :label="readonlyMode ? '下达时间' : '提交时间'" width="110" />
        <el-table-column v-if="!readonlyMode" label="状态" width="95">
          <template #default="{ row }">
            <el-tag size="small" :type="tagType(row.status)">{{ statusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="!readonlyMode" label="审核结果" width="105">
          <template #default="{ row }">{{ row.status === 'approved' ? '已通过' : row.status === 'rejected' ? '已退回' : '待审核' }}</template>
        </el-table-column>
        <el-table-column v-if="!readonlyMode" prop="auditor" label="审核人" width="120" />
        <el-table-column v-if="!readonlyMode" prop="auditedAt" label="审核时间" width="110" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" @click="open(row)">{{ readonlyMode ? '查看计划' : (row.status === 'pending' ? '审核' : '查看留痕') }}</el-button>
              <el-button v-if="!readonlyMode" link @click="showOpinion(row)">审核意见</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="visible" :title="readonlyMode ? '种植计划下达详情' : (current?.status === 'pending' ? '种植计划审核' : '种植计划审核留痕')" width="920px" destroy-on-close>
      <template v-if="current">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="计划年度">{{ current.planYear }}年</el-descriptions-item>
          <el-descriptions-item label="计划季度">{{ current.quarter }}</el-descriptions-item>
          <el-descriptions-item label="作物类型">{{ current.cropType }}</el-descriptions-item>
          <el-descriptions-item :label="userStore.role?.code === 'city' ? '提交县' : '提交市'">{{ current.regionName }}</el-descriptions-item>
          <el-descriptions-item label="提交单位">{{ current.submitter }}</el-descriptions-item>
          <el-descriptions-item :label="readonlyMode ? '下达时间' : '提交时间'">{{ readonlyMode ? (current.issuedAt || current.submittedAt) : current.submittedAt }}</el-descriptions-item>
          <el-descriptions-item :label="userStore.role?.code === 'city' ? '县级任务面积' : '市级计划种植面积'">{{ current.totalArea }} 万亩</el-descriptions-item>
          <el-descriptions-item :label="userStore.role?.code === 'city' ? '县级落实面积' : '市级实际种植面积'">
            <span>{{ current.actualArea ?? current.totalArea }} 万亩</span>
          </el-descriptions-item>
          <el-descriptions-item :label="userStore.role?.code === 'city' ? '提交县数' : '县级计划数量'">{{ current.countyCount }} 个</el-descriptions-item>
          <el-descriptions-item v-if="!readonlyMode" :label="userStore.role?.code === 'city' ? '县级任务面积合计' : '县级计划种植面积合计'">
            <span>{{ countyTotal }} 万亩</span>
          </el-descriptions-item>
          <el-descriptions-item label="计划说明" :span="3">{{ current.planDescription }}</el-descriptions-item>
          <el-descriptions-item v-if="!readonlyMode" label="审核层级">{{ current.auditLevel || '省级审核' }}</el-descriptions-item>
          <el-descriptions-item v-if="!readonlyMode" label="审核人">{{ current.auditor || '待审核' }}</el-descriptions-item>
          <el-descriptions-item v-if="!readonlyMode" label="审核时间">{{ current.auditedAt || '待审核' }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-title">
          <b>{{ userStore.role?.code === 'city' ? '县级任务分解明细' : '县级计划分解明细' }}</b>
          <span v-if="userStore.role?.code === 'province'">点击县级行查看种植主体和地块明细</span>
        </div>
        <template v-if="userStore.role?.code === 'city'">
          <el-table :data="citySubjectRows" border stripe max-height="330">
            <el-table-column type="index" label="序号" width="58" />
            <el-table-column prop="subjectName" label="种植大户/主体" min-width="210" />
            <el-table-column prop="owner" label="负责人" width="95" />
            <el-table-column prop="townName" label="乡镇" width="105" />
            <el-table-column prop="villageName" label="村" width="105" />
            <el-table-column prop="taskArea" label="主体任务面积（亩）" width="145" align="right" />
            <el-table-column label="地块落实面积" min-width="280">
              <template #default="{ row }">
                <div v-for="plot in row.plots" :key="plot.id" class="plot-summary-row">
                  {{ plot.name }}：{{ Number(plot.targetArea ?? plot.areaMu ?? 0).toFixed(1) }}亩
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="cropType" label="作物类型" width="105" />
          </el-table>
          <el-empty v-if="!citySubjectRows.length" description="该县暂无种植主体和地块分解数据" />
        </template>
        <el-table v-else :data="current.countyPlans" border stripe max-height="330" @row-click="openCountyDetails">
          <el-table-column type="index" label="序号" width="65" />
          <el-table-column prop="countyName" label="县级行政区" width="120">
            <template #default="{ row }">
              <el-button link type="primary" @click="openCountyDetails(row)">{{ row.countyName }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="area" label="计划种植面积（万亩）" width="145" align="right" />
          <el-table-column label="落实面积（万亩）" width="160" align="right"><template #default="{ row }"><span>{{ row.actualArea ?? row.area }}</span></template></el-table-column>
          <el-table-column prop="cropType" label="作物类型" width="120" />
          <el-table-column prop="description" label="县级计划说明" min-width="200" show-overflow-tooltip />
          <el-table-column v-if="!readonlyMode" label="审核状态" width="105"><template #default="{ row }"><el-tag size="small" :type="tagType(row.status)">{{ statusName(row.status) }}</el-tag></template></el-table-column>
        </el-table>

        <el-input v-if="!readonlyMode && current.status === 'pending'" v-model="opinion" type="textarea" :rows="3" placeholder="填写审核意见；退回时必填" class="opinion-input" />
        <el-alert v-else :title="current.opinion || '审核时未填写意见'" type="info" :closable="false" class="opinion-input" />
      </template>
      <template #footer>
        <el-button @click="visible = false">关闭</el-button>
        <template v-if="!readonlyMode && current?.status === 'pending'">
          <el-button type="danger" @click="audit('rejected')">退回修改</el-button>
          <el-button type="primary" :disabled="!areaMatched" @click="audit('approved')">审核通过</el-button>
        </template>
      </template>
    </el-dialog>

    <el-dialog v-model="countyDetailVisible" :title="`${countyDetail?.countyName || ''}种植主体和地块明细`" width="1120px" destroy-on-close>
      <template v-if="countyDetail">
        <el-descriptions :column="4" border size="small">
          <el-descriptions-item label="计划年度">{{ current?.planYear }}年</el-descriptions-item>
          <el-descriptions-item label="计划季度">{{ current?.quarter }}</el-descriptions-item>
          <el-descriptions-item label="作物类型">{{ countyDetail.cropType || current?.cropType }}</el-descriptions-item>
          <el-descriptions-item label="提交县">{{ countyDetail.countyName }}</el-descriptions-item>
          <el-descriptions-item label="县级任务面积">{{ countyDetail.area }} 万亩</el-descriptions-item>
          <el-descriptions-item label="主体数量">{{ countySubjectRows.length }} 个</el-descriptions-item>
          <el-descriptions-item label="地块数量">{{ countySubjectRows.reduce((sum, row) => sum + (row.plots?.length || 0), 0) }} 个</el-descriptions-item>
          <el-descriptions-item label="地块落实面积">{{ countySubjectRows.reduce((sum, row) => sum + (row.plots || []).reduce((area, plot) => area + Number(plot.targetArea ?? plot.areaMu ?? 0), 0), 0).toFixed(1) }} 亩</el-descriptions-item>
        </el-descriptions>
        <div class="detail-title"><b>种植主体及地块落实明细</b></div>
        <el-table :data="countySubjectRows" border stripe max-height="410">
          <el-table-column type="index" label="序号" width="58" />
          <el-table-column prop="subjectName" label="种植大户/主体" min-width="220" show-overflow-tooltip />
          <el-table-column prop="owner" label="负责人" width="95" />
          <el-table-column prop="townName" label="乡镇" width="105" />
          <el-table-column prop="villageName" label="村" width="110" />
          <el-table-column prop="taskArea" label="主体任务面积（亩）" width="145" align="right" />
          <el-table-column label="地块落实面积" min-width="300">
            <template #default="{ row }">
              <div v-for="plot in row.plots" :key="plot.id" class="plot-summary-row">
                <b>{{ plot.name }}</b>：{{ Number(plot.targetArea ?? plot.areaMu ?? 0).toFixed(1) }}亩
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="cropType" label="作物类型" width="105" />
        </el-table>
        <el-empty v-if="!countySubjectRows.length" description="该县暂无种植主体和地块分解数据" />
      </template>
      <template #footer><el-button @click="countyDetailVisible = false">关闭</el-button></template>
    </el-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchCountyTaskDetails, fetchPlanAudits, auditPlan } from '@/api/gpm'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const route = useRoute()
const readonlyMode = computed(() => route.name === 'GpmDecompose')
const rows = ref([])
const quarters = ['第一季度', '第二季度', '第三季度', '第四季度']
const filters = reactive({ view: '', keyword: '', year: '', quarter: '', status: '' })
const visible = ref(false)
const current = ref(null)
const opinion = ref('')
const citySubjectRows = ref([])
const countyDetailVisible = ref(false)
const countyDetail = ref(null)
const countySubjectRows = ref([])
const pendingCount = computed(() => rows.value.filter((item) => item.status === 'pending').length)
const countyTotal = computed(() => Number((current.value?.countyPlans || []).reduce((sum, item) => sum + Number(item.area || 0), 0).toFixed(2)))
const areaMatched = computed(() => userStore.role?.code === 'city' || (!!current.value && countyTotal.value === Number(current.value.totalArea)))
const statusName = (status) => ({ pending: '待审核', approved: '已通过', rejected: '已退回' }[status] || status)
const tagType = (status) => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[status] || 'info')

const resetPageState = () => {
  Object.assign(filters, { view: '', keyword: '', year: '', quarter: '', status: '' })
  rows.value = []
  current.value = null
  opinion.value = ''
  visible.value = false
  citySubjectRows.value = []
  countyDetailVisible.value = false
  countyDetail.value = null
  countySubjectRows.value = []
}

const load = async () => {
  const query = readonlyMode.value
    ? { keyword: filters.keyword, year: filters.year, quarter: filters.quarter, status: 'approved' }
    : filters
  rows.value = await fetchPlanAudits(userStore.role, query)
}

watch(() => route.name, async () => {
  resetPageState()
  await load()
})

const open = async (row) => {
  current.value = row
  opinion.value = row.opinion || ''
  citySubjectRows.value = []
  visible.value = true
  if (userStore.role?.code !== 'city') return
  const details = await Promise.all((row.countyPlans || []).map(async (county) => {
    const items = (await fetchCountyTaskDetails({
      planId: row.targetId,
      countyCode: county.countyCode || county.regionCode,
      countyName: county.countyName,
      cityName: row.regionName,
      area: county.area,
      year: row.planYear,
      quarter: row.quarter,
      cropType: county.cropType || row.cropType
    })) || []
    return items.map((item) => ({
      ...item,
      countyName: county.countyName,
      cityAuditStatus: county.cityAuditStatus || county.status,
      cityAuditor: county.cityAuditor,
      cityAuditedAt: county.cityAuditedAt,
      cityAuditOpinion: county.cityAuditOpinion
    }))
  }))
  citySubjectRows.value = details.flat()
}

const openCountyDetails = async (county) => {
  if (userStore.role?.code !== 'province' || !current.value) return
  countyDetail.value = county
  countySubjectRows.value = await fetchCountyTaskDetails({
    planId: current.value.targetId,
    countyCode: county.countyCode || county.regionCode,
    countyName: county.countyName,
    cityName: current.value.regionName,
    area: county.area,
    year: current.value.planYear,
    quarter: current.value.quarter,
    cropType: county.cropType || current.value.cropType
  })
  countyDetailVisible.value = true
}

const showOpinion = (row) => {
  const trail = row.auditTrail || []
  const content = trail.length
    ? trail.map((item) => `${item.auditedAt}｜${item.level}｜${item.auditor}｜${item.status === 'approved' ? '已通过' : '已退回'}｜${item.opinion || '未填写意见'}`).join('\n')
    : row.opinion || '暂无审核意见'
  ElMessageBox.alert(content, '审核留痕', { confirmButtonText: '关闭' })
}

const audit = async (status) => {
  if (!current.value || current.value.status !== 'pending') return ElMessage.warning('当前记录不可重复审核')
  if (status === 'approved' && !areaMatched.value) return ElMessage.warning('县级计划种植面积合计与上级计划不一致，不能审核通过')
  if (status === 'rejected' && !opinion.value.trim()) return ElMessage.warning('退回时必须填写审核意见')
  try {
    await ElMessageBox.confirm(`确认${status === 'approved' ? '通过' : '退回'}“${current.value.targetName}”？`, '审核确认', { type: status === 'approved' ? 'success' : 'warning' })
  } catch {
    return
  }
  const result = await auditPlan(current.value.id, status, opinion.value, userStore.regionName, userStore.role)
  if (!result.success) return ElMessage.error(result.message)
  ElMessage.success(status === 'approved' ? '审核已通过' : '已退回修改')
  visible.value = false
  await load()
}

onMounted(load)
</script>

<style lang="scss" scoped>
.gpm-page{gap:12px;overflow:auto}.page-head{display:flex;justify-content:space-between}.page-head h2{margin:4px 0;color:var(--ah-text);font-size:22px}.page-head p{color:var(--ah-text-secondary);font-size:13px}.filters{display:flex;align-items:center;flex-wrap:nowrap}.filters :deep(.el-form-item){margin-bottom:12px}.action-buttons{display:flex;align-items:center;flex-wrap:nowrap;white-space:nowrap}.action-buttons :deep(.el-button){margin-left:0;margin-right:8px}.detail-title{display:flex;align-items:center;justify-content:space-between;margin:18px 0 10px}.county-drilldown{padding:12px 20px;background:#f8fafc;border-left:3px solid #2f73c8}.county-drilldown-title{margin-bottom:10px;color:#1f3b5b;font-weight:700}.county-drilldown :deep(.el-descriptions){margin-bottom:0}.plot-summary-row{line-height:1.6;white-space:normal}.opinion-input{margin-top:16px}.area-error{color:var(--el-color-danger);font-weight:700}.readonly-text{color:#98a2b3;font-size:12px}
</style>
