<template>
  <div class="page-container portal-page">
    <!-- 欢迎条 -->
    <div class="welcome-bar panel">
      <div class="wb-left">
        <div class="wb-avatar" :style="{ background: userStore.role?.avatarColor }">
          {{ userStore.role?.name?.charAt(0) }}
        </div>
        <div>
          <div class="wb-hello">{{ greeting }}，{{ userStore.role?.name }}（{{ userStore.role?.roleName }}）</div>
          <div class="wb-scope">
            <el-icon><Location /></el-icon>数据范围：{{ userStore.regionPath }}
            <el-divider direction="vertical" />
            <el-icon><Calendar /></el-icon>{{ today }} · 秋收秋种关键期
          </div>
        </div>
      </div>
      <div class="wb-right">
        <el-button type="primary" plain @click="$router.push('/onemap/production')">
          <el-icon style="margin-right:4px"><MapLocation /></el-icon>进入一张图
        </el-button>
      </div>
    </div>

    <!-- 指标卡 -->
    <div class="stat-grid">
      <StatCard label="年度计划面积" :value="stat.planArea" unit="万亩" icon="DataAnalysis" color="#0f5eb5" />
      <StatCard label="播种完成率" :value="stat.sowRate" unit="%" icon="TrendCharts" color="#2e9e5b" />
      <StatCard label="青贮备案地块" :value="stat.silageCount" unit="个" icon="Wheat" color="#26a69a" />
      <StatCard label="待处置事件" :value="stat.pendingEvents" unit="件" icon="Warning" color="#e64545" />
      <StatCard label="农药经营主体" :value="stat.pesSubjects" unit="家" icon="Aim" color="#c2571a" />
    </div>

    <div class="portal-body">
      <!-- 待办 -->
      <div class="panel todo-panel">
        <div class="panel-title">
          <span class="title-text">我的待办</span>
          <el-radio-group v-model="todoTab" size="small">
            <el-radio-button value="todo">待办 ({{ todos.filter(t=>!t.done).length }})</el-radio-button>
            <el-radio-button value="done">已办</el-radio-button>
          </el-radio-group>
        </div>
        <div class="todo-list">
          <div v-for="t in visibleTodos" :key="t.id" class="todo-item" @click="goRoute(t)">
            <el-tag :type="t.urgent ? 'danger' : 'info'" size="small" effect="plain">{{ t.urgent ? '紧急' : '常规' }}</el-tag>
            <div class="ti-title flex-1">{{ t.title }}</div>
            <div class="ti-time">{{ t.time }}</div>
            <el-icon class="ti-arrow"><ArrowRight /></el-icon>
          </div>
          <el-empty v-if="!visibleTodos.length" description="暂无待办" :image-size="60" />
        </div>
      </div>

      <!-- 图表 -->
      <div class="panel chart-panel">
        <div class="panel-title"><span class="title-text">全省播种进度（万亩）</span></div>
        <BaseChart :option="sowChartOption" height="240px" />
      </div>

      <div class="panel chart-panel">
        <div class="panel-title"><span class="title-text">粮食安全事件类型分布</span></div>
        <BaseChart :option="eventChartOption" height="240px" />
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="panel">
      <div class="panel-title"><span class="title-text">常用功能入口</span></div>
      <div class="quick-grid">
        <div v-for="q in quickEntries" :key="q.route" class="quick-item" @click="$router.push(q.route)">
          <div class="qi-icon" :style="{ background: q.color + '1a', color: q.color }">
            <el-icon :size="22"><component :is="q.icon" /></el-icon>
          </div>
          <div class="qi-label">{{ q.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import StatCard from '@/components/common/StatCard.vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import { fetchTodos } from '@/api/common'
import { CITY_PLANS } from '@/mock/gpm/plans'
import { FSR_EVENTS } from '@/mock/fsr/events'
import { SIL_FENCES } from '@/mock/sil/declarations'
import { PES_SUBJECTS } from '@/mock/pes/data'

const router = useRouter()
const userStore = useUserStore()

const todos = ref([])
const todoTab = ref('todo')

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})
const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

const stat = computed(() => {
  const role = userStore.role
  const inScope = (code) => !role || role.regionCode === '340000' || String(code).startsWith(role.regionCode.slice(0, 6))
  const plans = CITY_PLANS.filter((p) => inScope(p.cityCode))
  const events = FSR_EVENTS.filter((e) => inScope(e.regionCode))
  const fences = SIL_FENCES.filter((f) => inScope(f.regionCode))
  return {
    planArea: (plans.reduce((s, p) => s + p.totalArea, 0) / 100).toFixed(1),
    sowRate: Math.round(plans.reduce((s, p) => s + p.sowRate, 0) / (plans.length || 1)),
    silageCount: fences.length,
    pendingEvents: events.filter((e) => !['closed'].includes(e.status)).length,
    pesSubjects: PES_SUBJECTS.filter((s) => s.type === 'operate' && inScope(s.regionCode)).length
  }
})

const visibleTodos = computed(() => todos.value.filter((t) => (todoTab.value === 'todo' ? !t.done : t.done)))

const goRoute = (t) => router.push(t.route)

// 播种进度图（前8市）
const sowChartOption = computed(() => ({
  grid: { left: 60, right: 20, top: 20, bottom: 30 },
  xAxis: { type: 'category', data: CITY_PLANS.slice(0, 8).map((c) => c.cityName.replace('市', '')), axisLabel: { fontSize: 11 } },
  yAxis: { type: 'value', name: '万亩' },
  series: [
    { name: '计划', type: 'bar', data: CITY_PLANS.slice(0, 8).map((c) => c.totalArea), itemStyle: { color: '#b3d1ef' }, barWidth: 14 },
    { name: '已播', type: 'bar', data: CITY_PLANS.slice(0, 8).map((c) => Math.round(c.totalArea * c.sowRate / 100)), itemStyle: { color: '#0f5eb5' }, barWidth: 14 }
  ],
  tooltip: { trigger: 'axis' },
  legend: { top: 0, right: 0, itemWidth: 12, itemHeight: 8 }
}))

// 事件类型分布
const eventChartOption = computed(() => {
  const typeNames = { baomai: '毁麦毁粮', piaohuang: '耕地撂荒', feilianghua: '非粮化', zhangshi: '长势异常', weibeian: '未备案收割' }
  const colors = ['#e64545', '#e67e22', '#c0392b', '#f1c40f', '#9b59b6']
  const counts = {}
  FSR_EVENTS.forEach((e) => { counts[e.type] = (counts[e.type] || 0) + 1 })
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c}件 ({d}%)' },
    legend: { orient: 'vertical', right: 0, top: 'center', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['38%', '50%'],
      label: { show: false },
      data: Object.entries(counts).map(([k, v], i) => ({ name: typeNames[k] || k, value: v, itemStyle: { color: colors[i % colors.length] } }))
    }]
  }
})

const quickEntries = computed(() => {
  const base = [
    { label: '粮食生产一张图', route: '/onemap/production', icon: 'MapLocation', color: '#0f5eb5' },
    { label: '计划分解下达', route: '/gpm/decompose', icon: 'Share', color: '#2e9e5b' },
    { label: '青贮备案审核', route: '/sil/audit', icon: 'Wheat', color: '#26a69a' },
    { label: '事件中心', route: '/fsr/events', icon: 'Warning', color: '#e64545' },
    { label: '流向追溯', route: '/pes/trace', icon: 'Aim', color: '#c2571a' },
    { label: '移动核查演示', route: '/mobile/check/list', icon: 'Iphone', color: '#6a4fa3' },
    { label: '进度调度', route: '/gpm/progress', icon: 'TrendCharts', color: '#8a6d3b' },
    { label: '惠农政策', route: '/gpm/policy', icon: 'Reading', color: '#4a6fa5' }
  ]
  return base
})

onMounted(async () => {
  todos.value = await fetchTodos(userStore.role)
})
</script>

<style lang="scss" scoped>
.portal-page { overflow: auto; }

.welcome-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .wb-left { display: flex; align-items: center; gap: 12px; }
  .wb-avatar {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 20px; font-weight: 600;
  }
  .wb-hello { font-size: 16px; font-weight: 600; }
  .wb-scope {
    display: flex; align-items: center; gap: 4px;
    font-size: 12.5px; color: var(--ah-text-secondary); margin-top: 3px;
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.portal-body {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.todo-list { display: flex; flex-direction: column; }

.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 6px;
  border-bottom: 1px dashed var(--ah-border);
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: #f5f8fc; .ti-title { color: var(--ah-primary); } .ti-arrow { color: var(--ah-primary); } }
  .ti-title { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ti-time { font-size: 12px; color: var(--ah-text-secondary); flex-shrink: 0; }
  .ti-arrow { color: #c2cad6; flex-shrink: 0; }
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 4px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #f0f6fd; transform: translateY(-2px); }
  .qi-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .qi-label { font-size: 12.5px; color: var(--ah-text); }
}
</style>
