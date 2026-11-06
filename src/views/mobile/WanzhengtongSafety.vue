<template>
  <div class="mobile-page">
    <header class="mobile-header">
      <button class="back-button" @click="$router.back()">‹</button>
      <div><b>粮食安全综合监管</b><span>{{ userStore.role?.roleName || '皖政通监管人员' }}</span></div>
      <button class="refresh-button" @click="load">刷新</button>
    </header>

    <section class="panel overview-panel">
      <div class="section-title"><i></i><b>系统态势总览</b><span class="online" :class="{ offline: !online }">{{ online ? '在线' : '离线' }}</span></div>
      <div class="overview-grid">
        <button v-for="item in overview" :key="item.status" class="overview-item" @click="scrollToTasks(item.status)"><strong>{{ item.count }}</strong><span>{{ item.label }}</span></button>
      </div>
      <p class="notice" v-if="reminder">任务提醒：{{ reminder }}</p>
    </section>

    <section ref="taskSection" class="panel">
      <div class="section-title"><i></i><b>待办任务列表</b><span class="count">{{ events.length }} 条</span></div>
      <div v-for="item in events" :key="item.id" class="task-card" :class="`task-${item.status}`" @click="selectTask(item)">
        <div class="task-head"><b>{{ item.code }}</b><el-tag size="small" :type="statusType(item.status)">{{ statusName(item.status) }}</el-tag></div>
        <p>{{ item.regionName }} · {{ item.subjectName || '待核实主体' }}</p>
        <p class="desc">{{ item.desc }}</p>
        <div class="task-foot"><span>截止：{{ item.deadline || '未设置' }}</span><span>{{ item.risk === 'high' ? '高风险' : item.risk === 'medium' ? '中风险' : '低风险' }} ›</span></div>
        <div v-if="item.status === 'pending' && canReceive" class="task-actions"><el-button size="small" type="primary" @click.stop="receiveTask(item)">接收任务</el-button><el-button size="small" text @click.stop="selectTask(item)">查看任务</el-button></div>
      </div>
      <el-empty v-if="!events.length" description="暂无权限范围内任务" />
    </section>

    <section class="panel" v-if="activeTask">
      <div class="section-title"><i></i><b>现场导航与核查</b><el-button link type="primary" @click="activeTask = null">收起</el-button></div>
      <div class="spot-info">
        <p><b>图斑位置：</b>{{ activeTask.regionName }}</p>
        <p><b>中心经纬度：</b>{{ centerText(activeTask) }}</p>
        <p><b>图斑面积：</b>{{ activeTask.spot?.areaMu || 0 }} 亩</p>
        <el-button size="small" @click="navigate(activeTask)">开始导航</el-button>
      </div>
      <div v-if="canCheck(activeTask)" class="check-form">
        <el-form label-position="top">
          <el-form-item label="核查结论"><el-radio-group v-model="checkForm.conclusion"><el-radio label="问题属实">问题属实</el-radio><el-radio label="问题不属实">问题不属实</el-radio><el-radio label="部分属实">部分属实</el-radio></el-radio-group></el-form-item>
          <el-form-item label="问题描述"><el-input v-model="checkForm.desc" type="textarea" :rows="3" placeholder="请填写现场核查情况" /></el-form-item>
          <div class="two-col"><el-form-item label="经度"><el-input v-model="checkForm.longitude" placeholder="如 115.5412" /></el-form-item><el-form-item label="纬度"><el-input v-model="checkForm.latitude" placeholder="如 33.1456" /></el-form-item></div>
          <div class="two-col"><el-form-item label="现场照片数量"><el-input-number v-model="checkForm.photos" :min="0" /></el-form-item><el-form-item label="现场视频数量"><el-input-number v-model="checkForm.videos" :min="0" /></el-form-item></div>
        </el-form>
        <div class="form-actions"><el-button @click="saveOffline">离线保存</el-button><el-button type="primary" @click="submitCheck">提交核查结果</el-button></div>
      </div>
      <div v-else class="detail-box">核查结论：{{ activeTask.checkReport?.conclusion || '待核查' }}<br />核查描述：{{ activeTask.checkReport?.desc || '暂无' }}<br />现场证据：{{ activeTask.checkReport?.photos || 0 }} 张照片、{{ activeTask.checkReport?.videos || 0 }} 个视频</div>
    </section>

    <section class="panel">
      <div class="section-title"><i></i><b>离线填报</b></div>
      <div class="offline-grid"><button @click="downloadTemplates">下载待填报任务</button><button @click="openOffline">离线填报</button><button @click="uploadCache">上传缓存数据</button><button @click="showHistory">历史填报记录</button></div>
      <p class="cache-tip">缓存任务 {{ cachedTasks.length }} 条，离线表单 {{ cachedReports.length }} 条</p>
    </section>

    <section v-if="canAudit" class="panel">
      <div class="section-title"><i></i><b>任务审核</b></div>
      <div v-for="item in reviewingTasks" :key="item.id" class="audit-row"><div><b>{{ item.code }}</b><span>{{ item.regionName }}</span></div><div><el-button size="small" type="success" @click="audit(item, 'pass')">审核通过</el-button><el-button size="small" type="danger" plain @click="audit(item, 'reject')">打回重核</el-button></div></div>
      <el-empty v-if="!reviewingTasks.length" description="暂无待审核任务" />
    </section>

    <section v-if="isProvince" class="panel">
      <div class="section-title"><i></i><b>随机抽查</b></div>
      <p class="random-tip">从当前任务中随机抽取图斑开展监督抽查。</p><el-button type="warning" @click="randomInspect">随机抽查</el-button>
      <div v-if="randomTask" class="random-form"><p><b>抽查图斑：</b>{{ randomTask.code }} · {{ randomTask.regionName }}</p><el-form label-position="top"><el-form-item label="抽查结论"><el-select v-model="randomForm.conclusion" style="width:100%"><el-option label="通过" value="通过" /><el-option label="发现问题" value="发现问题" /><el-option label="需补充材料" value="需补充材料" /></el-select></el-form-item><el-form-item label="问题描述"><el-input v-model="randomForm.desc" type="textarea" /></el-form-item><div class="two-col"><el-form-item label="经度"><el-input v-model="randomForm.longitude" /></el-form-item><el-form-item label="纬度"><el-input v-model="randomForm.latitude" /></el-form-item></div><el-form-item label="照片数量"><el-input-number v-model="randomForm.photos" :min="0" /></el-form-item></el-form><el-button type="primary" @click="saveInspection">保存抽查记录</el-button></div>
    </section>

    <section v-if="history.length" class="panel">
      <div class="section-title"><i></i><b>历史填报记录</b><span class="count">{{ history.length }} 条</span></div>
      <div v-for="item in history" :key="item.id + item.time" class="history-row"><b>{{ item.code }}</b><span>{{ item.conclusion }}</span><small>{{ item.time }}</small></div>
    </section>

    <el-dialog v-model="historyVisible" title="历史填报记录" width="92%"><div v-for="item in history" :key="item.id + item.time" class="dialog-history"><b>{{ item.code }} · {{ item.conclusion }}</b><p>{{ item.desc || '暂无描述' }}</p><small>{{ item.time }}</small></div><el-empty v-if="!history.length" description="暂无历史填报记录" /></el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { auditEvent, dispatchTask, fetchEvent, fetchEvents, submitCheckReport } from '@/api/fsr'

const userStore = useUserStore()
const events = ref([])
const activeTask = ref(null)
const taskSection = ref(null)
const online = ref(navigator.onLine)
const historyVisible = ref(false)
const randomTask = ref(null)
const cachedTasks = ref(JSON.parse(localStorage.getItem('wzt-safety-tasks') || '[]'))
const cachedReports = ref(JSON.parse(localStorage.getItem('wzt-safety-reports') || '[]'))
const history = ref(JSON.parse(localStorage.getItem('wzt-safety-history') || '[]'))
const checkForm = reactive({ conclusion: '问题属实', desc: '', longitude: '', latitude: '', photos: 0, videos: 0 })
const randomForm = reactive({ conclusion: '通过', desc: '', longitude: '', latitude: '', photos: 0 })
const isProvince = computed(() => userStore.role?.code === 'province' || userStore.role?.regionCode === '340000')
const canAudit = computed(() => userStore.role?.code === 'city')
const canReceive = computed(() => ['county', 'wanzhengtong'].includes(userStore.role?.code))
const reviewingTasks = computed(() => events.value.filter(item => item.status === 'reviewing'))
const reminder = computed(() => events.value.find(item => ['checking', 'reviewing', 'recheck'].includes(item.status))?.code ? `您有 ${events.value.filter(item => ['checking', 'reviewing', 'recheck'].includes(item.status)).length} 条任务需要处理` : '')
const overview = computed(() => [{ label: '待核查', status: 'checking' }, { label: '待审核', status: 'reviewing' }, { label: '需复查', status: 'recheck' }, { label: '已结案', status: 'closed' }].map(item => ({ ...item, count: events.value.filter(event => event.status === item.status).length })))
const statusNames = { pending: '待接收', checking: '待核查', reviewing: '待审核', rectifying: '整改中', recheck: '需复查', closed: '已结案' }
const statusName = status => statusNames[status] || '未知状态'
const statusType = status => ({ checking: 'warning', reviewing: 'primary', recheck: 'danger', closed: 'success', rectifying: 'info' }[status] || 'info')
const centerText = event => event.spot?.center?.join?.(', ') || event.checkReport?.gps || '暂无坐标'
const canCheck = event => ['checking', 'recheck'].includes(event.status) && userStore.role?.code !== 'province' && userStore.role?.code !== 'city'
const load = async () => { events.value = await fetchEvents(userStore.role, {}); if (activeTask.value) activeTask.value = await fetchEvent(activeTask.value.id) }
const selectTask = async event => { activeTask.value = await fetchEvent(event.id); const draft = cachedReports.value.find(item => item.id === event.id); Object.assign(checkForm, draft?.report || { conclusion: '问题属实', desc: '', longitude: '', latitude: '', photos: 0, videos: 0 }) }
const scrollToTasks = status => { taskSection.value?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => { const target = events.value.find(item => item.status === status); if (target) selectTask(target) }, 250) }
const navigate = event => { const center = event.spot?.center; if (!center?.length) return ElMessage.warning('该图斑暂无中心坐标，无法导航'); window.open(`https://uri.amap.com/marker?position=${center[0]},${center[1]}&name=${encodeURIComponent(event.regionName || '图斑位置')}`, '_blank') }
const saveOffline = () => { if (!activeTask.value) return; const item = { id: activeTask.value.id, code: activeTask.value.code, report: { ...checkForm }, savedAt: Date.now() }; cachedReports.value = [...cachedReports.value.filter(row => row.id !== item.id), item]; localStorage.setItem('wzt-safety-reports', JSON.stringify(cachedReports.value)); ElMessage.success('已保存到离线缓存，联网后可上传') }
const submitCheck = async () => { if (!activeTask.value) return ElMessage.warning('请先选择待核查任务'); if (!checkForm.desc.trim()) return ElMessage.warning('请填写问题描述'); if (!checkForm.longitude || !checkForm.latitude) return ElMessage.warning('请填写经度和纬度'); if (!online.value) return saveOffline(); const result = await submitCheckReport(activeTask.value.id, { ...checkForm, gps: `${checkForm.longitude}, ${checkForm.latitude}`, checker: userStore.role?.name }); if (!result?.success) return ElMessage.error(result?.message || '提交核查结果失败'); saveHistory(activeTask.value, checkForm); cachedReports.value = cachedReports.value.filter(item => item.id !== activeTask.value.id); localStorage.setItem('wzt-safety-reports', JSON.stringify(cachedReports.value)); ElMessage.success('核查结果已提交'); activeTask.value = null; load() }
const downloadTemplates = () => { cachedTasks.value = events.value.filter(item => ['checking', 'recheck'].includes(item.status)).map(item => ({ id: item.id, code: item.code, regionName: item.regionName, spot: item.spot, downloadedAt: Date.now() })); localStorage.setItem('wzt-safety-tasks', JSON.stringify(cachedTasks.value)); ElMessage.success(`已下载 ${cachedTasks.value.length} 条待填报任务`) }
const openOffline = () => { const item = cachedTasks.value.find(task => ['checking', 'recheck'].includes(events.value.find(event => event.id === task.id)?.status)); if (!item) return ElMessage.info('请先下载待填报任务'); const event = events.value.find(row => row.id === item.id); selectTask(event); ElMessage.info('已打开离线填报表单') }
const uploadCache = async () => { if (!online.value) return ElMessage.warning('当前处于离线状态，联网后再上传'); if (!cachedReports.value.length) return ElMessage.info('暂无缓存数据'); for (const item of [...cachedReports.value]) { const result = await submitCheckReport(item.id, { ...item.report, gps: `${item.report.longitude}, ${item.report.latitude}`, checker: userStore.role?.name }); if (result?.success) { const event = events.value.find(row => row.id === item.id); if (event) saveHistory(event, item.report); cachedReports.value = cachedReports.value.filter(row => row.id !== item.id) } } localStorage.setItem('wzt-safety-reports', JSON.stringify(cachedReports.value)); ElMessage.success('缓存数据上传完成'); load() }
const saveHistory = (event, report) => { history.value.unshift({ id: event.id, code: event.code, ...report, time: new Date().toLocaleString('zh-CN') }); history.value = history.value.slice(0, 30); localStorage.setItem('wzt-safety-history', JSON.stringify(history.value)) }
const showHistory = () => { historyVisible.value = true }
const audit = async (event, action) => { const opinion = action === 'pass' ? '核查材料完整，进入整改' : '核查材料不充分，请重新核查'; const result = await auditEvent(event.id, action, opinion, userStore.role?.name); if (!result?.success) return ElMessage.error(result?.message || '审核操作失败'); ElMessage.success(action === 'pass' ? '审核通过' : '已打回重核'); load() }
const randomInspect = () => { if (!events.value.length) return ElMessage.info('暂无可抽查任务'); randomTask.value = events.value[Math.floor(Math.random() * events.value.length)]; Object.assign(randomForm, { conclusion: '通过', desc: '', longitude: centerText(randomTask.value).split(',')[0] || '', latitude: centerText(randomTask.value).split(',')[1]?.trim() || '', photos: 0 }) }
const saveInspection = () => { if (!randomTask.value) return; const key = 'wzt-safety-inspections'; const records = JSON.parse(localStorage.getItem(key) || '[]'); records.unshift({ eventId: randomTask.value.id, code: randomTask.value.code, ...randomForm, inspector: userStore.role?.name, time: new Date().toLocaleString('zh-CN') }); localStorage.setItem(key, JSON.stringify(records.slice(0, 30))); ElMessage.success('抽查记录已保存'); randomTask.value = null }
const syncOnline = () => { online.value = navigator.onLine; if (online.value) ElMessage.info('已恢复在线，可上传缓存数据') }
onMounted(() => { window.addEventListener('online', syncOnline); window.addEventListener('offline', syncOnline); load() })
onUnmounted(() => { window.removeEventListener('online', syncOnline); window.removeEventListener('offline', syncOnline) })
</script>

<style lang="scss" scoped>
.mobile-page{min-height:100%;box-sizing:border-box;background:#f5f7fa;padding:12px 12px 30px;color:#243b5a}.mobile-header{height:54px;display:grid;grid-template-columns:38px 1fr 48px;align-items:center;text-align:center}.mobile-header b{display:block;font-size:18px}.mobile-header span{display:block;color:#8a96a8;font-size:11px;margin-top:3px}.back-button,.refresh-button{border:0;background:none;color:#315f93}.back-button{font-size:36px;text-align:left;line-height:1}.refresh-button{font-size:12px}.panel{background:#fff;border-radius:13px;padding:14px;margin-bottom:12px;box-shadow:0 2px 8px rgba(31,52,73,.04)}.section-title{display:flex;align-items:center;gap:8px;margin-bottom:13px;color:#243b5a}.section-title i{width:5px;height:19px;background:#2f8c76;border-radius:3px}.section-title .count{margin-left:auto;color:#98a2b3;font-size:12px}.online{margin-left:auto;font-size:11px;color:#2f8c76}.online:before{content:'●';margin-right:3px}.online.offline{color:#e67e22}.overview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.overview-item{border:0;border-radius:8px;background:#f3f8f7;padding:9px 2px;color:#345;cursor:pointer}.overview-item strong{display:block;font-size:21px;color:#2f8c76}.overview-item span{font-size:11px}.notice{margin:12px 0 0;color:#d97706;font-size:12px;background:#fff8e8;padding:8px;border-radius:6px}.task-card{border-left:4px solid #f0ad4e;padding:10px 8px;margin:0 -2px;border-bottom:1px solid #eef1f5;cursor:pointer}.task-card:last-child{border-bottom:0}.task-reviewing{border-left-color:#409eff}.task-recheck{border-left-color:#e85d75}.task-closed{border-left-color:#67c23a}.task-head,.task-foot,.audit-row,.history-row{display:flex;justify-content:space-between;align-items:center}.task-head b{font-size:13px}.task-card p{font-size:12px;color:#667085;margin:6px 0}.task-card .desc{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.task-foot{font-size:11px;color:#98a2b3}.spot-info{background:#f7fafc;border-radius:8px;padding:10px;font-size:12px;line-height:1.6}.spot-info p{margin:2px 0}.check-form{margin-top:12px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px}.form-actions{display:flex;justify-content:flex-end;gap:8px}.detail-box{font-size:12px;color:#667085;line-height:1.9;background:#f8fafc;padding:10px;border-radius:8px}.offline-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.offline-grid button{border:1px solid #d9e8f4;background:#f7fbff;color:#35678f;border-radius:8px;padding:12px 4px;font-size:12px}.cache-tip,.random-tip{color:#98a2b3;font-size:11px;margin:10px 0 0}.audit-row{padding:10px 0;border-bottom:1px solid #eef1f5}.audit-row b,.audit-row span{display:block;font-size:12px}.audit-row span{color:#98a2b3;margin-top:4px}.random-form{margin-top:12px;border-top:1px solid #edf0f5;padding-top:10px}.history-row{padding:9px 0;border-bottom:1px solid #eef1f5;font-size:12px}.history-row span{color:#2f8c76}.history-row small{color:#98a2b3}.dialog-history{padding:10px 0;border-bottom:1px solid #eee;font-size:12px}.dialog-history p{color:#667085}.mobile-page :deep(.el-form-item){margin-bottom:11px}.mobile-page :deep(.el-radio){margin-right:8px}.mobile-page :deep(.el-input-number){width:100%}
</style>
