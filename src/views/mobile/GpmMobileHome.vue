<template>
  <div class="mobile-page" role="main" aria-label="粮食计划管理移动端首页">
    <div class="brand-card">
      <div class="brand-row">
        <div><b>粮食计划管理</b><span>皖企通移动端</span></div>
        <el-tag type="success" size="small">{{ userStore.regionName || '属地服务' }}</el-tag>
      </div>
      <p>计划查看、进度填报、灾情上报一站完成</p>
    </div>

    <div class="quick-grid">
      <button class="quick-item plan" @click="$router.push('/mobile/plans')">
        <strong>计划列表</strong>
        <span>查看本年度下达计划，填报播种与收获进度</span>
      </button>
      <button class="quick-item progress" @click="$router.push('/mobile/progress')">
        <strong>播种与收获</strong>
        <span>查看已填写的播种、收获进度数据</span>
      </button>
      <button class="quick-item report" @click="$router.push('/mobile/snapshot')">
        <strong>灾情上报</strong>
        <span>病虫害、干旱、洪涝等问题随时上报</span>
      </button>
    </div>

    <section class="card weather-card">
      <div class="section-title">
        <b>气象预警</b>
        <span class="section-note">{{ alerts.length }} 条属地信息</span>
      </div>
      <button v-for="item in alerts.slice(0, 2)" :key="item.id" class="weather-row" @click="$router.push('/mobile/snapshot')">
        <el-tag size="small" :type="item.level === '红色' ? 'danger' : 'warning'">{{ item.level || '提醒' }}</el-tag>
        <div><b>{{ item.type }} · {{ item.regionName }}</b><p>{{ item.content }}</p></div>
      </button>
      <el-empty v-if="!alerts.length" description="暂无气象预警" :image-size="50" />
    </section>

    <section class="card policy-card">
      <div class="section-title">
        <b>惠农政策</b>
        <el-button link type="primary" @click="$router.push('/mobile/policies')">查看全部</el-button>
      </div>
      <button v-for="item in policies.slice(0, 3)" :key="item.id" class="policy-row" @click="$router.push('/mobile/policies')">
        <div><b>{{ item.title }}</b><p>{{ item.summary || item.content }}</p></div>
        <span>›</span>
      </button>
      <el-empty v-if="!policies.length" description="暂无惠农政策" :image-size="50" />
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { fetchPolicies, fetchWeatherAlerts } from '@/api/gpm'

const userStore = useUserStore()
const policies = ref([])
const alerts = ref([])

onMounted(async () => {
  const [policyRows, weatherRows] = await Promise.all([
    fetchPolicies(),
    fetchWeatherAlerts(userStore.role)
  ])
  policies.value = (policyRows || []).filter(item => item.active !== false && item.status !== '已下线' && item.status !== 'offline')
  alerts.value = weatherRows || []
})
</script>

<style lang="scss" scoped>
.mobile-page{width:100%;min-width:0;min-height:100%;box-sizing:border-box;background:#f4f7fb;padding:14px;overflow-x:hidden}.brand-card{background:linear-gradient(135deg,#176b58,#249477);color:#fff;border-radius:16px;padding:20px 18px;margin-bottom:14px}.brand-row,.section-title{display:flex;align-items:center;justify-content:space-between;gap:10px}.brand-row b{font-size:25px;margin-right:10px}.brand-row span{opacity:.85;font-size:13px}.brand-card p{margin:14px 0 0;font-size:13px;opacity:.9}.quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.quick-item{border:0;border-radius:14px;padding:16px;text-align:left;min-height:112px;color:#fff;cursor:pointer}.quick-item strong,.quick-item span{display:block}.quick-item strong{font-size:17px;margin-bottom:9px}.quick-item span{font-size:12px;line-height:1.5;opacity:.9}.quick-item.plan{background:#3d78c4}.quick-item.progress{background:#2d8c72}.quick-item.report{background:#c8564d;grid-column:span 2}.card{background:#fff;border-radius:14px;padding:16px;margin-top:12px}.section-title{color:#243b5a;margin-bottom:12px}.section-note{font-size:12px;color:#98a2b3;font-weight:400}.weather-row{width:100%;display:flex;align-items:flex-start;gap:10px;text-align:left;background:none;border:0;border-top:1px solid #edf0f5;padding:12px 0;color:#344054}.weather-row b{font-size:14px}.weather-row p{margin:5px 0 0;color:#667085;font-size:12px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.policy-row{width:100%;display:flex;justify-content:space-between;gap:10px;text-align:left;background:none;border:0;border-top:1px solid #edf0f5;padding:13px 0;color:#344054}.policy-row b{font-size:14px}.policy-row p{margin:5px 0 0;color:#667085;font-size:12px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.policy-row>span{color:#98a2b3;font-size:22px;line-height:1.5}
</style>