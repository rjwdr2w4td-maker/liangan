<template>
  <div class="mobile-page">
    <div class="mobile-head"><div><b>计划列表</b><span>查看已下达计划并填报进度</span></div><el-button link type="primary" @click="$router.back()">返回</el-button></div>
    <div class="year-tabs"><button v-for="year in years" :key="year" :class="{active: selectedYear === year}" @click="selectedYear = year">{{ year }}年</button></div>
    <div v-for="task in filteredTasks" :key="task.taskId" class="plan-card">
      <div class="plan-top"><el-tag size="small" type="success">已下达</el-tag><span>{{ task.issuedAt }}</span></div>
      <h3>{{ task.planName }}</h3>
      <p class="location">{{ task.cityName }} · {{ task.countyName }} · {{ task.townName }}</p>
      <div class="plan-metrics"><div><b>{{ task.taskAreaMu }}</b><span>下达面积（亩）</span></div><div><b>{{ task.cropType }}</b><span>计划作物</span></div><div><b>{{ task.progress || 0 }}%</b><span>计划落实</span></div></div>
      <el-button type="primary" plain class="detail-btn" @click="openDetail(task)">查看计划详情并填报</el-button>
    </div>
    <el-empty v-if="!filteredTasks.length" description="暂无该年度下达计划" />

    <div v-if="detailVisible" class="detail-modal" @click.self="detailVisible = false">
      <div class="detail-sheet">
        <div class="sheet-head"><b>计划详情</b><button @click="detailVisible = false">×</button></div>
        <div class="sheet-body" v-if="activeTask">
          <div class="detail-summary"><b>{{ activeTask.planName }}</b><p>{{ activeTask.cropType }} · 下达面积 {{ activeTask.taskAreaMu }} 亩</p><p>{{ activeTask.cityName }} · {{ activeTask.countyName }} · {{ activeTask.townName }}</p></div>
          <el-form label-position="top">
            <el-form-item label="填报类型"><el-radio-group v-model="form.type"><el-radio-button label="sow">播种进度</el-radio-button><el-radio-button label="harvest">收获进度</el-radio-button></el-radio-group></el-form-item>
            <el-form-item label="填报面积（亩）"><el-input-number v-model="form.area" :min="0" :max="activeTask.taskAreaMu" :precision="1" controls-position="right" style="width:100%" /></el-form-item>
            <el-form-item label="关联地块"><el-select v-model="form.plotId" style="width:100%" placeholder="请选择本主体地块"><el-option v-for="plot in plots" :key="plot.id" :label="`${plot.name}（${plot.areaMu}亩）`" :value="plot.id" /></el-select></el-form-item>
            <el-form-item label="填报说明"><el-input v-model="form.remark" type="textarea" :rows="3" maxlength="120" show-word-limit placeholder="可填写作业时间、现场情况等" /></el-form-item>
          </el-form>
          <el-button type="primary" class="submit-btn" @click="submitProgress">提交并更新进度</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { addProgressRecord, fetchSubjectPlanTasks, fetchSubjectPlotRelations } from '@/api/gpm'
import { PLOTS } from '@/mock/geo/plot-gen'

const userStore = useUserStore()
const years = [2026, 2025, 2024]
const selectedYear = ref(2026)
const tasks = ref([])
const plots = ref([])
const detailVisible = ref(false)
const activeTask = ref(null)
const form = reactive({ type: 'sow', area: 0, plotId: '', remark: '' })
const filteredTasks = computed(() => tasks.value.filter(item => Number(item.year) === selectedYear.value))

const openDetail = task => {
  activeTask.value = task
  form.type = 'sow'
  form.area = 0
  form.plotId = plots.value[0]?.id || ''
  form.remark = ''
  detailVisible.value = true
}
const submitProgress = async () => {
  if (!form.plotId) return ElMessage.warning('请选择关联地块')
  if (Number(form.area) <= 0) return ElMessage.warning('请填写大于0的填报面积')
  const result = await addProgressRecord({ ...form, subjectId: userStore.role?.subjectId, regionCode: activeTask.value.townCode, regionName: activeTask.value.townName, planId: activeTask.value.planId, taskId: activeTask.value.taskId, planName: activeTask.value.planName, cropName: activeTask.value.cropType, role: userStore.role })
  if (!result.success) return ElMessage.error(result.message || '提交失败')
  ElMessage.success('进度已提交，列表数据将自动更新')
  detailVisible.value = false
  tasks.value = await fetchSubjectPlanTasks(userStore.role)
}

onMounted(async () => {
  tasks.value = await fetchSubjectPlanTasks(userStore.role)
  const relations = await fetchSubjectPlotRelations(userStore.role, { subjectId: userStore.role?.subjectId })
  const ids = new Set(relations.filter(item => item.relationStatus === '已关联').map(item => item.plotId))
  plots.value = PLOTS.filter(item => item.subjectId === userStore.role?.subjectId && ids.has(item.id))
})
</script>

<style lang="scss" scoped>
.mobile-page{width:100%;min-height:100%;box-sizing:border-box;background:#f5f7fa;padding:14px}.mobile-head,.plan-card{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px}.mobile-head{display:flex;align-items:center;justify-content:space-between;color:#1f3c68}.mobile-head b{display:block;font-size:21px}.mobile-head span{display:block;color:#667085;font-size:13px;margin-top:4px}.year-tabs{display:flex;gap:8px;margin-bottom:12px}.year-tabs button{flex:1;border:1px solid #d9e2ec;background:#fff;border-radius:8px;padding:9px;color:#667085}.year-tabs button.active{background:#eaf6f1;border-color:#2d8c72;color:#176b58;font-weight:600}.plan-top{display:flex;justify-content:space-between;color:#98a2b3;font-size:11px}.plan-card h3{font-size:16px;color:#243b5a;margin:12px 0 5px}.location{font-size:12px;color:#667085;margin:0 0 12px}.plan-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.plan-metrics div{background:#f4f8fb;border-radius:8px;text-align:center;padding:9px 3px}.plan-metrics b,.plan-metrics span{display:block}.plan-metrics b{color:#176b58;font-size:16px}.plan-metrics span{color:#98a2b3;font-size:11px;margin-top:3px}.detail-btn{width:100%;margin-top:13px}.detail-modal{position:fixed;inset:0;z-index:3000;background:#0007;display:flex;align-items:flex-end;justify-content:center}.detail-sheet{width:min(390px,100%);max-height:88%;background:#f7f9fc;border-radius:18px 18px 0 0;overflow:hidden}.sheet-head{height:52px;background:#fff;border-bottom:1px solid #edf0f5;display:flex;align-items:center;justify-content:space-between;padding:0 16px;color:#243b5a}.sheet-head button{border:0;background:#f2f4f7;border-radius:50%;width:30px;height:30px;font-size:22px;color:#667085}.sheet-body{padding:14px;overflow-y:auto;max-height:calc(88vh - 52px)}.detail-summary{background:#eaf6f1;border-radius:10px;padding:12px;color:#176b58;margin-bottom:14px}.detail-summary p{font-size:12px;margin:6px 0 0;color:#4b7d70}.submit-btn{width:100%;margin-top:4px}.mobile-page :deep(.el-form-item){margin-bottom:14px}
</style>