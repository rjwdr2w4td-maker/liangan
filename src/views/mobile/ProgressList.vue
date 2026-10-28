<template>
  <div class="mobile-page">
    <div class="mobile-head">
      <div><b>播种与收获列表</b><span>查看主体已填写的进度数据</span></div>
      <el-button link type="primary" @click="$router.back()">返回</el-button>
    </div>

    <div class="year-tabs">
      <button v-for="year in years" :key="year" :class="{ active: selectedYear === year }" @click="selectedYear = year">
        {{ year }}年
      </button>
    </div>

    <div class="tabs">
      <button :class="{ active: type === 'sow' }" @click="type = 'sow'">播种进度</button>
      <button :class="{ active: type === 'harvest' }" @click="type = 'harvest'">收获进度</button>
    </div>

    <section class="summary-card">
      <div class="summary-head"><b>{{ selectedYear }}年{{ type === 'sow' ? '播种' : '收获' }}总进度</b><el-tag size="small" :type="type === 'sow' ? 'warning' : 'success'">计划基准</el-tag></div>
      <div class="summary-number"><strong>{{ summary.reportedArea.toFixed(1) }}</strong><span> / {{ summary.planArea.toFixed(1) }} 亩</span></div>
      <el-progress :percentage="summary.progress" :status="type === 'harvest' ? 'success' : undefined" :show-text="false" />
      <div class="summary-foot"><span>计划面积 {{ summary.planArea.toFixed(1) }} 亩</span><b>{{ summary.progress }}%</b></div>
      <p>总进度按照本年度已下达计划面积计算，下面展示每一条主体上报记录。</p>
    </section>

    <div v-for="item in rows" :key="item.id" class="progress-card">
      <div class="progress-top"><el-tag size="small" :type="type === 'sow' ? 'warning' : 'success'">{{ type === 'sow' ? '播种上报' : '收获上报' }}</el-tag><span>{{ item.date || item.updatedAt }}</span></div>
      <b>{{ item.planName }}</b>
      <p>{{ item.cropName || item.crop }} · {{ item.regionName }} · {{ item.plotId }}</p>
      <div class="report-line"><span>本次上报面积</span><strong>{{ Number(item.area || 0).toFixed(1) }} 亩</strong></div>
      <div class="report-meta"><span>上报主体：{{ item.subjectName || '当前主体' }}</span><span>{{ item.source || '皖企通填报' }}</span></div>
    </div>
    <el-empty v-if="!rows.length" description="暂无该年度进度填报数据" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { fetchProgressRecords, fetchSubjectPlanTasks } from '@/api/gpm'

const userStore = useUserStore()
const years = [2026, 2025, 2024]
const selectedYear = ref(2026)
const type = ref('sow')
const tasks = ref([])
const records = ref([])
const summary = reactive({ planArea: 0, reportedArea: 0, progress: 0 })

const rows = computed(() => {
  const acceptedTypes = type.value === 'sow' ? ['sow', 'planting'] : ['harvest']
  return records.value.filter(item => Number(item.year || String(item.date || '').slice(0, 4)) === selectedYear.value && acceptedTypes.includes(item.type))
})

const load = async () => {
  const [taskRows, recordRows] = await Promise.all([
    fetchSubjectPlanTasks(userStore.role),
    fetchProgressRecords(userStore.role)
  ])
  tasks.value = taskRows || []
  records.value = recordRows || []
  const yearTasks = tasks.value.filter(item => Number(item.year) === selectedYear.value)
  const taskIds = new Set(yearTasks.map(item => item.taskId || item.id))
  const matchedRows = rows.value.filter(item => !item.taskId || taskIds.has(item.taskId))
  summary.planArea = yearTasks.reduce((sum, item) => sum + Number(item.taskAreaMu || item.taskArea || 0), 0)
  summary.reportedArea = matchedRows.reduce((sum, item) => sum + Number(item.area || 0), 0)
  summary.progress = summary.planArea ? Number(Math.min(100, summary.reportedArea / summary.planArea * 100).toFixed(1)) : 0
}

watch([type, selectedYear], load)
onMounted(load)
</script>

<style lang="scss" scoped>
.mobile-page{width:100%;min-height:100%;box-sizing:border-box;background:#f5f7fa;padding:14px}.mobile-head,.summary-card,.progress-card{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px}.mobile-head{display:flex;align-items:center;justify-content:space-between;color:#1f3c68}.mobile-head b{display:block;font-size:21px}.mobile-head span{display:block;color:#667085;font-size:13px;margin-top:4px}.year-tabs,.tabs{display:flex;gap:8px;margin-bottom:12px}.year-tabs button,.tabs button{flex:1;border:1px solid #d9e2ec;background:#fff;border-radius:8px;padding:9px;color:#667085}.year-tabs button.active,.tabs button.active{background:#eaf6f1;border-color:#2d8c72;color:#176b58;font-weight:600}.summary-card{background:linear-gradient(135deg,#eaf6f1,#f8fbfa);border:1px solid #d6eee5}.summary-head,.summary-foot{display:flex;align-items:center;justify-content:space-between}.summary-head{color:#176b58}.summary-number{margin:14px 0 10px;color:#667085}.summary-number strong{font-size:30px;color:#176b58}.summary-number span{font-size:14px}.summary-foot{font-size:12px;color:#667085;margin-top:8px}.summary-foot b{color:#176b58;font-size:16px}.summary-card p{font-size:11px;color:#7a918a;line-height:1.5;margin:10px 0 0}.progress-top{display:flex;justify-content:space-between;color:#98a2b3;font-size:11px}.progress-card>b{display:block;color:#243b5a;font-size:15px;margin:11px 0 5px}.progress-card p{font-size:12px;color:#667085;margin:0 0 13px}.report-line{display:flex;justify-content:space-between;align-items:center;padding:10px;background:#f4f8fb;border-radius:8px;font-size:12px;color:#667085}.report-line strong{font-size:16px;color:#176b58}.report-meta{display:flex;justify-content:space-between;gap:8px;color:#98a2b3;font-size:11px;margin-top:10px}
</style>