<template>
  <div class="mobile-page">
    <div class="mobile-head">
      <button class="back-button" @click="$router.back()">‹</button>
      <div><b>进度填报</b><span>查看皖企通种植主体上报的播种与收获进度</span></div>
    </div>

    <div class="filters">
      <label>年份</label>
      <select v-model="year">
        <option v-for="item in years" :key="item" :value="item">{{ item }}年</option>
      </select>
    </div>

    <div class="tabs">
      <button :class="{ active: type === 'sow' }" @click="type = 'sow'">播种进度</button>
      <button :class="{ active: type === 'harvest' }" @click="type = 'harvest'">收获进度</button>
    </div>

    <section class="summary-card">
      <div class="summary-head">
        <b>{{ type === 'sow' ? '播种' : '收获' }}进度汇总</b>
        <el-tag size="small" :type="type === 'sow' ? 'warning' : 'success'">种植主体上报</el-tag>
      </div>
      <div class="summary-number"><strong>{{ summary.reportedArea.toFixed(1) }}</strong><span> / {{ summary.planArea.toFixed(1) }} 亩</span></div>
      <el-progress :percentage="summary.progress" :status="type === 'harvest' ? 'success' : undefined" :show-text="false" />
      <div class="summary-foot"><span>已上报面积 / 计划面积</span><b>{{ summary.progress }}%</b></div>
    </section>

    <section v-for="item in visibleRows" :key="item.id" class="progress-card">
      <div class="card-top"><el-tag size="small" type="info">上报数据</el-tag><span>{{ item.updatedAt || '待更新' }}</span></div>
      <b>{{ item.subjectName || '种植主体' }}</b>
      <p>{{ item.planName }} · {{ item.cropName || item.crop }} · {{ item.regionName }}</p>
      <div class="data-line"><span>计划面积 {{ Number(item.planArea || 0).toFixed(1) }} 亩</span><strong>{{ Number(item.reportedArea || 0).toFixed(1) }} 亩</strong></div>
      <div class="report-source">数据来源：皖企通种植主体上报</div>
    </section>
    <el-empty v-if="!visibleRows.length" :description="`暂无${type === 'sow' ? '播种' : '收获'}进度上报数据`" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { fetchSowingProgress, fetchHarvestProgress } from '@/api/gpm'

const userStore = useUserStore()
const type = ref('sow')
const year = ref(2026)
const years = [2026, 2025, 2024]
const rows = ref([])

const visibleRows = computed(() => rows.value)
const summary = computed(() => {
  const planArea = rows.value.reduce((sum, item) => sum + Number(item.planArea || 0), 0)
  const reportedArea = rows.value.reduce((sum, item) => sum + Number(item.reportedArea || 0), 0)
  return {
    planArea,
    reportedArea,
    progress: planArea ? Number(Math.min(100, reportedArea / planArea * 100).toFixed(1)) : 0
  }
})

const load = async () => {
  const result = type.value === 'sow'
    ? await fetchSowingProgress(userStore.role, { year: year.value })
    : await fetchHarvestProgress(userStore.role, { year: year.value })

  rows.value = (result || [])
    .filter(item => item.level === 'subject' && item.subjectId)
    .map(item => ({
      ...item,
      status: item.status || '待审核',
      reportedArea: type.value === 'sow' ? Number(item.sownArea || 0) : Number(item.harvestedArea || 0)
    }))
}

watch([type, year], load)
onMounted(load)
</script>

<style lang="scss" scoped>
.mobile-page{width:100%;min-height:100%;box-sizing:border-box;background:#f5f7fa;padding:14px}.mobile-head,.summary-card,.progress-card{background:#fff;border-radius:12px;padding:14px;margin-bottom:12px}.mobile-head{display:flex;align-items:center;gap:8px;color:#1f3c68}.mobile-head b{display:block;font-size:19px}.mobile-head span{display:block;color:#667085;font-size:12px;margin-top:4px}.back-button{border:0;background:none;font-size:36px;line-height:1;padding:0 8px 4px 0}.filters{display:flex;align-items:center;justify-content:space-between;background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:12px;color:#667085;font-size:13px}.filters select{border:1px solid #d9e2ec;border-radius:8px;background:#fff;padding:7px 12px;color:#243b5a}.tabs{display:flex;gap:8px;margin-bottom:12px}.tabs button{flex:1;border:1px solid #d9e2ec;background:#fff;border-radius:8px;padding:9px;color:#667085}.tabs button.active{background:#eaf6f1;border-color:#2d8c72;color:#176b58;font-weight:600}.summary-card{background:linear-gradient(135deg,#eaf6f1,#f8fbfa);border:1px solid #d6eee5}.summary-head,.summary-foot,.card-top,.data-line{display:flex;align-items:center;justify-content:space-between;gap:8px}.summary-head{color:#176b58}.summary-number{margin:14px 0 10px;color:#667085}.summary-number strong{font-size:30px;color:#176b58}.summary-number span{font-size:14px}.summary-foot{font-size:12px;color:#667085;margin-top:8px}.summary-foot b{color:#176b58;font-size:16px}.card-top{color:#98a2b3;font-size:11px}.progress-card>b{display:block;color:#243b5a;font-size:15px;margin:11px 0 5px}.progress-card p{font-size:12px;color:#667085;margin:0 0 12px}.data-line{padding:10px;background:#f4f8fb;border-radius:8px;color:#667085;font-size:12px}.data-line strong{font-size:16px;color:#176b58}.report-source{color:#98a2b3;font-size:11px;margin-top:9px}
</style>
