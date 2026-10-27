<template>
  <div class="mobile-page" role="main" aria-label="皖企通粮食生产服务首页">
    <div class="brand-card">
      <div class="brand-row"><div><b>皖企通</b><span>粮食生产服务</span></div><el-tag type="success" size="small">{{ userStore.regionName || '属地服务' }}</el-tag></div>
      <p>计划随时看、农情及时报、农事建议精准推送</p>
    </div>

    <div class="quick-grid">
      <button class="quick-item plan" @click="$router.push('/mobile/declare')"><strong>任务与计划</strong><span>查看年度计划 · 填报种植意向</span></button>
      <button class="quick-item weather" @click="weatherVisible = true"><strong>气象与农事</strong><span>{{ alerts.length }} 条属地预警 · 个性建议</span></button>
      <button class="quick-item report" @click="$router.push('/mobile/snapshot')"><strong>农情直报</strong><span>拍照上报重大农情问题</span></button>
    </div>

    <section class="card"><div class="section-title"><b>本地气象预警</b><el-button link type="primary" @click="weatherVisible = true">查看全部</el-button></div><div v-for="item in alerts.slice(0, 2)" :key="item.id" class="alert-row"><el-tag size="small" type="danger">{{ item.level }}</el-tag><div><b>{{ item.type }} · {{ item.regionName }}</b><p>{{ item.content }}</p></div></div><el-empty v-if="!alerts.length" description="暂无预警" :image-size="50"/></section>
    <section class="card advice-card" role="region" aria-labelledby="advice-section-title"><div class="section-title"><b id="advice-section-title">今日农事建议</b><el-tag size="small" type="success">个性化</el-tag></div><p class="advice-title">{{ advice.title }}</p><p>{{ advice.content }}</p><div class="advice-meta">适用作物：{{ advice.crop }} · {{ advice.source }}</div></section>
    <section class="card"><div class="section-title"><b>快捷入口</b></div><div class="link-list"><button @click="$router.push('/mobile/check/list')">我的计划任务 <span>›</span></button><button @click="$router.push('/mobile/declare')">年度种植意向 <span>›</span></button><button @click="$router.push('/mobile/snapshot')">我的农情上报 <span>›</span></button></div></section>

    <div v-if="weatherVisible" class="weather-modal" role="dialog" aria-modal="true" aria-label="气象与农事建议">
      <div class="weather-sheet">
        <div class="weather-modal-head"><b>气象与农事建议</b><button type="button" aria-label="关闭" @click="weatherVisible = false">×</button></div>
        <div class="weather-modal-body">
          <div class="drawer-summary">当前属地：{{ userStore.regionName || '安徽省' }} · {{ alerts.length }} 条气象信息</div>
          <section class="drawer-section">
            <div class="drawer-section-title"><b>气象预警与预报</b><span>与管理端同步</span></div>
            <div v-for="item in alerts" :key="item.id" class="drawer-alert">
              <div class="alert-heading"><el-tag size="small" :type="item.kind === 'warning' ? 'warning' : 'info'">{{ item.kind === 'warning' ? '预警' : '预报' }}</el-tag><b>{{ item.type }} · {{ item.level }}</b><span>{{ item.regionName }}</span></div>
              <p>{{ item.content }}</p>
              <div class="advice-box"><b>防范建议</b>{{ item.advice || '请关注属地农技人员通知，合理安排农事作业。' }}</div>
              <div class="alert-time">发布时间：{{ item.publishTime }}<span v-if="item.validUntil"> · 有效期至 {{ item.validUntil }}</span></div>
            </div>
            <el-empty v-if="!alerts.length" description="暂无属地气象信息" :image-size="60" />
          </section>
          <section class="drawer-section">
            <div class="drawer-section-title"><b>个性化农事建议</b><span>按属地和作物推荐</span></div>
            <div v-for="item in services" :key="item.id" class="service-row">
              <div class="service-icon">农事</div>
              <div class="service-main"><b>{{ item.title }}</b><p>{{ item.content }}</p><small>{{ item.crop }} · {{ item.provider }} · {{ item.publishDate }}</small></div>
            </div>
            <el-empty v-if="!services.length" description="暂无匹配的农事建议" :image-size="60" />
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { fetchFarmServices, fetchWeatherAlerts } from '@/api/gpm'
const userStore = useUserStore()
const alerts = ref([])
const services = ref([])
const weatherVisible = ref(false)
const advice = computed(() => {
  const alert = alerts.value[0]
  const service = services.value[0]
  if (service) return { title: service.title, content: service.content, crop: service.crop, source: service.provider }
  if (alert) return { title: `${alert.regionName}${alert.type}防范建议`, content: alert.advice || alert.content, crop: alert.crops || '当前作物', source: alert.source || '气象部门' }
  return { title: '本地农事管理提醒', content: '请结合当前墒情和天气变化合理安排播种、施肥、灌溉及田间巡查。', crop: '粮食作物', source: '属地农技员' }
})
onMounted(async () => {
  const [weatherRows, serviceRows] = await Promise.all([
    fetchWeatherAlerts(userStore.role),
    fetchFarmServices(userStore.role, { status: '已发布' })
  ])
  alerts.value = weatherRows || []
  services.value = serviceRows || []
})
</script>
<style lang="scss" scoped>
.mobile-page{width:100%;min-height:100dvh;box-sizing:border-box;background:#f4f7fb;padding:14px;overflow-x:hidden}.brand-card{background:linear-gradient(135deg,#176b58,#249477);color:#fff;border-radius:16px;padding:20px 18px;margin-bottom:14px}.brand-row,.section-title{display:flex;align-items:center;justify-content:space-between;gap:10px}.brand-row b{font-size:25px;margin-right:10px}.brand-row span{opacity:.85;font-size:13px}.brand-card p{margin:14px 0 0;font-size:13px;opacity:.9}.quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.quick-item{border:0;border-radius:14px;padding:16px;text-align:left;min-height:100px;color:#fff;cursor:pointer}.quick-item strong,.quick-item span{display:block}.quick-item strong{font-size:17px;margin-bottom:9px}.quick-item span{font-size:12px;line-height:1.5;opacity:.9}.quick-item.plan{background:#3d78c4}.quick-item.weather{background:#e19b31}.quick-item.report{background:#c8564d;grid-column:span 2}.card{background:#fff;border-radius:14px;padding:16px;margin-top:12px}.section-title{color:#243b5a;margin-bottom:12px}.alert-row{display:flex;gap:10px;border-top:1px solid #edf0f5;padding:12px 0}.alert-row b{font-size:14px;color:#344054}.alert-row p,.drawer-alert p{font-size:13px;color:#667085;line-height:1.55;margin:5px 0 0}.advice-title{font-weight:600;color:#344054;margin:0 0 6px}.advice-card>p:not(.advice-title){color:#667085;font-size:13px;line-height:1.6}.advice-meta{font-size:12px;color:#98a2b3}.link-list button{width:100%;background:none;border:0;border-top:1px solid #edf0f5;padding:13px 0;text-align:left;color:#344054;font-size:14px}.link-list span{float:right;color:#98a2b3;font-size:20px}.weather-modal{position:fixed;inset:0;z-index:3000;background:rgba(15,23,42,.48);display:flex;align-items:flex-end;justify-content:center}.weather-sheet{width:min(390px,100%);height:88%;max-height:680px;background:#f7f9fc;border-radius:18px 18px 0 0;overflow:hidden;box-shadow:0 -12px 30px rgba(15,23,42,.2)}.weather-modal-head{height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:#fff;border-bottom:1px solid #edf0f5;color:#243b5a;font-size:15px}.weather-modal-head button{width:32px;height:32px;border:0;border-radius:50%;background:#f2f4f7;color:#667085;font-size:24px;line-height:1;cursor:pointer}.weather-modal-body{height:calc(100% - 52px);overflow-y:auto;padding:12px 14px 24px}.drawer-summary{background:#eaf6f1;color:#176b58;border-radius:10px;padding:10px 12px;font-size:12px;margin-bottom:12px}.drawer-section{background:#fff;border-radius:12px;padding:14px;margin-bottom:12px}.drawer-section-title{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;color:#243b5a}.drawer-section-title span{font-size:11px;color:#98a2b3;font-weight:400}.drawer-alert{border-bottom:1px solid #edf0f5;padding:12px 0}.drawer-alert:last-child{border-bottom:0}.alert-heading{display:flex;align-items:center;gap:7px;min-width:0}.alert-heading b{font-size:14px;color:#344054;flex:1}.alert-heading>span{font-size:12px;color:#667085;white-space:nowrap}.drawer-alert p{margin:8px 0;color:#667085}.advice-box{background:#fff7e6;border-radius:8px;padding:10px;color:#8a5a00;font-size:13px;line-height:1.5}.advice-box b{display:block;margin-bottom:3px}.alert-time{font-size:11px;color:#98a2b3;margin-top:8px}.service-row{display:flex;gap:10px;border-top:1px solid #edf0f5;padding:12px 0}.service-icon{width:38px;height:38px;flex:0 0 38px;border-radius:10px;background:#eaf6f1;color:#176b58;display:flex;align-items:center;justify-content:center;font-size:11px}.service-main{min-width:0}.service-main b{font-size:14px;color:#344054}.service-main p{font-size:13px;line-height:1.5;color:#667085;margin:5px 0}.service-main small{font-size:11px;color:#98a2b3}
</style>