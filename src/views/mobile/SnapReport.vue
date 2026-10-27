<template>
  <div class="mobile-page">
    <div class="mobile-head"><div><b>皖企通</b><span>农情直报</span></div><el-tag size="small" type="success">直连管理部门</el-tag></div>
    <div class="form-card"><h3>发现问题，随时上报</h3><el-form label-position="top"><el-form-item label="问题类型"><el-select v-model="form.type" style="width:100%"><el-option v-for="item in issueTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item><el-form-item label="发生地点"><el-cascader v-model="form.region" :options="regionOptions" style="width:100%" /></el-form-item><el-form-item label="关联地块"><el-select v-model="form.plotId" clearable style="width:100%" placeholder="可选，便于管理部门定位"><el-option v-for="plot in subjectPlots" :key="plot.id" :label="`${plot.name}（${plot.areaMu}亩）`" :value="plot.id" /></el-select></el-form-item><el-form-item label="现场定位"><div class="location"><el-input v-model="form.location" /><el-button @click="locate">重新定位</el-button></div></el-form-item><el-form-item label="问题描述"><el-input v-model="form.description" type="textarea" :rows="4" maxlength="180" show-word-limit placeholder="请描述病虫害、干旱、洪涝等情况和影响范围" /></el-form-item><el-form-item label="现场照片"><div class="photos"><div v-for="photo in form.photos" :key="photo.name" class="photo"><img :src="photo.url" :alt="photo.name" /><i @click="removePhoto(photo)">×</i></div><label class="add-photo">＋ 添加照片<input type="file" accept="image/*" multiple @change="handlePhotos" /></label></div></el-form-item></el-form><div class="actions"><el-button @click="saveDraft">暂存草稿</el-button><el-button type="primary" @click="submit">提交农情直报</el-button></div></div>
    <div class="list-card"><div class="list-title"><b>我的上报记录</b><el-radio-group v-model="tab" size="small"><el-radio-button label="全部" /><el-radio-button label="处理中" /><el-radio-button label="已办结" /></el-radio-group></div><div v-for="item in filteredReports" :key="item.id" class="report-item"><div class="report-top"><el-tag size="small" :type="item.status === '已办结' ? 'success' : 'warning'">{{ item.status }}</el-tag><span>{{ item.time }}</span></div><b>{{ item.type }}</b><p>{{ item.regionName }} · {{ item.description }}</p><div class="report-bottom"><span>编号 {{ item.id }}</span><el-button link type="primary" @click="viewReport(item)">查看处理进度</el-button></div></div><el-empty v-if="!filteredReports.length" description="暂无记录" /></div>
    <el-dialog v-model="detailVisible" title="农情直报处理进度" width="480px"><template v-if="activeReport"><el-descriptions :column="1" border><el-descriptions-item label="问题类型">{{ activeReport.type }}</el-descriptions-item><el-descriptions-item label="所在地区">{{ activeReport.regionName }}</el-descriptions-item><el-descriptions-item label="当前状态"><el-tag type="warning">{{ activeReport.status }}</el-tag></el-descriptions-item><el-descriptions-item label="处理意见">{{ activeReport.opinion || '已转交属地农业农村部门核查，预计 1 个工作日内反馈。' }}</el-descriptions-item></el-descriptions></template></el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { createSnapshotEvent, fetchEvents } from '@/api/fsr'
import { PLOTS } from '@/mock/geo/plot-gen'

const userStore = useUserStore()
const issueTypes = [{ label: '重大病虫害', value: 'pest' }, { label: '严重干旱', value: 'drought' }, { label: '洪涝渍害', value: 'flood' }, { label: '其他农情问题', value: 'other' }]
const regionOptions = [{ value: '阜阳市', label: '阜阳市', children: [{ value: '太和县', label: '太和县', children: [{ value: '旧县镇', label: '旧县镇' }, { value: '大新镇', label: '大新镇' }] }] }]
const subjectPlots = computed(() => PLOTS.filter(item => item.subjectId === userStore.role?.subjectId))
const form = reactive({ type: 'pest', region: ['阜阳市', '太和县', '旧县镇'], plotId: '', location: '安徽省太和县（定位待更新）', description: '', photos: [] })
const reports = ref([])
const tab = ref('全部')
const detailVisible = ref(false)
const activeReport = ref(null)
const filteredReports = computed(() => reports.value.filter(item => tab.value === '全部' || item.status === tab.value))
const statusName = status => ({ pending: '处理中', checking: '处理中', reviewing: '处理中', rectifying: '处理中', recheck: '处理中', closed: '已办结' }[status] || status)

const locate = () => { form.location = '安徽省太和县旧县镇（定位已更新）'; ElMessage.success('定位已更新') }
const handlePhotos = event => Array.from(event.target.files || []).slice(0, 3 - form.photos.length).forEach(file => form.photos.push({ name: file.name, url: URL.createObjectURL(file) }))
const removePhoto = photo => { form.photos = form.photos.filter(item => item !== photo); URL.revokeObjectURL(photo.url) }
const saveDraft = () => { localStorage.setItem('wanqitong-snapshot-draft', JSON.stringify({ ...form, photos: [] })); ElMessage.success('已暂存农情直报草稿') }
const submit = async () => {
  if (!form.description.trim()) return ElMessage.warning('请填写问题描述')
  const result = await createSnapshotEvent({ type: form.type, regionCode: userStore.role?.regionCode, regionName: userStore.regionName, plotId: form.plotId, desc: form.description, photos: form.photos.map(item => item.name) }, userStore.role)
  if (!result.success) return ElMessage.error(result.message || '提交失败')
  ElMessage.success('农情直报已提交，属地部门将及时处理')
  form.description = ''
  form.photos = []
  await loadReports()
}
const loadReports = async () => { reports.value = (await fetchEvents(userStore.role, { source: 'snapshot' })).map(item => ({ ...item, type: issueTypes.find(type => type.value === item.type)?.label || item.type, regionName: item.regionName, description: item.desc, status: statusName(item.status), time: item.foundTime })) }
const viewReport = item => { activeReport.value = item; detailVisible.value = true }
onMounted(async () => { const draft = JSON.parse(localStorage.getItem('wanqitong-snapshot-draft') || 'null'); if (draft) Object.assign(form, draft); await loadReports() })
</script>

<style lang="scss" scoped>
.mobile-page{width:100%;min-width:0;box-sizing:border-box;margin:0;min-height:100%;background:#f5f7fa;padding:14px;overflow-x:hidden}.mobile-head,.form-card,.list-card{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px}.mobile-head{display:flex;align-items:center;justify-content:space-between;color:#1f3c68}.mobile-head b{font-size:21px;display:block}.mobile-head span{font-size:13px;color:#667085}.form-card h3{margin:0 0 16px;color:#243b5a}.location{display:flex;gap:8px}.location .el-input{flex:1}.photos{display:flex;gap:8px;flex-wrap:wrap}.photo{width:72px;height:72px;position:relative;border-radius:8px;overflow:hidden;background:#eaf2fb}.photo img{width:100%;height:100%;object-fit:cover}.photo i{position:absolute;right:3px;top:0;color:#fff;font-style:normal;background:#0008;border-radius:50%;width:18px;height:18px;text-align:center;cursor:pointer}.add-photo{width:72px;height:72px;display:flex;align-items:center;justify-content:center;border:1px dashed #b7cbe1;color:#3c78b5;font-size:12px;text-align:center;cursor:pointer}.add-photo input{display:none}.actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.list-title{display:flex;align-items:center;justify-content:space-between;gap:8px}.report-item{border-top:1px solid #edf0f5;padding:13px 0}.report-top,.report-bottom{display:flex;align-items:center;justify-content:space-between;color:#98a2b3;font-size:12px}.report-item>b{display:block;color:#243b5a;margin-top:9px}.report-item p{color:#667085;font-size:13px;line-height:1.5;margin:6px 0}.report-bottom span{font-size:11px}.mobile-page :deep(.el-form-item){margin-bottom:14px}
</style>