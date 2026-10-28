<template>
  <div class="mobile-page">
    <div class="mobile-head">
      <button class="back-button" @click="$router.back()">‹</button>
      <div><b>灾情上报</b><span>填报灾情信息，提交现场图文</span></div>
      <el-button size="small" type="primary" @click="fillDisaster">填报灾情信息</el-button>
    </div>
    <section ref="reportCard" class="report-card">
      <h3>发现问题，随时上报</h3>
      <el-form label-position="top">
        <el-form-item label="问题类型"><el-select v-model="form.type" style="width:100%"><el-option v-for="item in disasterTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        <el-form-item label="经营主体"><el-select v-model="form.subjectId" style="width:100%" placeholder="请选择经营主体" @change="form.plotId = ''"><el-option v-for="item in subjects" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="发生地点"><el-cascader v-model="form.region" :options="regionOptions" style="width:100%" /></el-form-item>
        <el-form-item label="关联地块"><el-select v-model="form.plotId" style="width:100%" placeholder="请选择受灾地块"><el-option v-for="item in subjectPlots" :key="item.id" :label="`${item.name}（${item.areaMu}亩）`" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="现场定位"><div class="location"><el-input v-model="form.location" /><el-button @click="locate">重新定位</el-button></div></el-form-item>
        <el-form-item label="问题描述"><el-input v-model="form.description" type="textarea" :rows="4" maxlength="180" show-word-limit placeholder="请描述病虫害、干旱、洪涝等情况和影响范围" /></el-form-item>
        <el-form-item label="现场照片"><div class="photos"><div v-for="photo in form.photos" :key="photo.name" class="photo"><img :src="photo.url" :alt="photo.name" /><i @click="removePhoto(photo)">×</i></div><label class="add-photo">＋ 添加照片<input type="file" accept="image/*" multiple @change="handlePhotos" /></label></div></el-form-item>
      </el-form>
      <div class="actions"><el-button @click="saveDraft">暂存草稿</el-button><el-button type="primary" @click="submit">提交农情直报</el-button></div>
    </section>
    <section class="disaster-card">
      <div class="section-title"><b>我的上报记录</b><el-button link type="primary" @click="load">刷新</el-button></div>
      <el-radio-group v-model="tab" size="small" class="record-tabs"><el-radio-button label="全部" /><el-radio-button label="处理中" /><el-radio-button label="已办结" /></el-radio-group>
      <div v-for="item in filteredDisasters" :key="item.id" class="disaster-row" @click="view(item)"><div class="row-top"><el-tag size="small" :type="statusType(item.status)">{{ item.status || '待核实' }}</el-tag><span>{{ item.foundTime || item.createdAt || '最新' }}</span></div><b>{{ issueLabel(item.type) }}</b><p>{{ item.subjectName || '未关联主体' }} · {{ item.plotName || '未关联地块' }}</p><p>{{ item.regionName || item.regionCode }} · {{ item.description || item.desc || '暂无描述' }}</p><div class="row-bottom">编号 {{ item.id }} <span>查看上报进度 ›</span></div></div>
      <el-empty v-if="!filteredDisasters.length" description="暂无上报记录" />
    </section>
    <el-dialog v-model="detailVisible" title="我的上报记录详情" width="92%">
      <template v-if="active">
        <el-descriptions :column="1" border><el-descriptions-item label="问题类型">{{ issueLabel(active.type) }}</el-descriptions-item><el-descriptions-item label="经营主体">{{ active.subjectName || '未关联' }}</el-descriptions-item><el-descriptions-item label="关联地块">{{ active.plotName || '未关联' }}</el-descriptions-item><el-descriptions-item label="发生地区">{{ active.regionName || active.regionCode }}</el-descriptions-item><el-descriptions-item label="当前状态"><el-tag :type="statusType(active.status)">{{ active.status }}</el-tag></el-descriptions-item><el-descriptions-item label="上报描述">{{ active.description || active.desc || '暂无' }}</el-descriptions-item></el-descriptions>
        <div class="timeline-title">处置记录</div><div v-for="item in actions" :key="item.id" class="action-row"><b>{{ item.action }}</b><span>{{ item.unit }} · {{ item.time || item.createdAt || '已记录' }}</span></div><el-empty v-if="!actions.length" description="暂无处置记录" />
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { addDisaster, fetchDisasters, fetchPlanSubjects, fetchRescueActions } from '@/api/gpm'
import { PLOTS } from '@/mock/geo/plot-gen'

const userStore = useUserStore()
const disasterTypes = [{ label: '重大病虫害', value: 'pest' }, { label: '严重干旱', value: 'drought' }, { label: '洪涝渍害', value: 'flood' }, { label: '其他农情问题', value: 'other' }]
const regionOptions = [{ value: '阜阳市', label: '阜阳市', children: [{ value: '太和县', label: '太和县', children: [{ value: '旧县镇', label: '旧县镇' }, { value: '大新镇', label: '大新镇' }] }] }]
const disasters = ref([])
const actions = ref([])
const tab = ref('全部')
const subjects = ref([])
const active = ref(null)
const detailVisible = ref(false)
const reportCard = ref(null)
const form = reactive({ type: 'pest', subjectId: '', plotId: '', region: ['阜阳市', '太和县', '旧县镇'], location: '安徽省太和县（定位待更新）', description: '', photos: [] })
const subjectPlots = computed(() => PLOTS.filter(item => item.subjectId === form.subjectId))
const issueLabel = item => disasterTypes.find(type => type.value === item)?.label || item
const filteredDisasters = computed(() => disasters.value.filter(item => tab.value === '全部' || item.status === tab.value))
const load = async () => {
  disasters.value = await fetchDisasters(userStore.role) || []
}
const statusType = status => status === '已办结' || status === '已处置' ? 'success' : status === '处置中' ? 'warning' : 'danger'
const fillDisaster = () => reportCard.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
const locate = () => {
  if (!navigator.geolocation) {
    form.location = '安徽省太和县旧县镇（定位不可用）'
    return ElMessage.warning('当前设备不支持定位')
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      form.location = `定位坐标：${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
      ElMessage.success('定位已更新')
    },
    () => {
      form.location = '安徽省太和县旧县镇（定位失败）'
      ElMessage.warning('定位失败，请检查定位权限')
    }
  )
}
const handlePhotos = event => Array.from(event.target.files || []).slice(0, 3 - form.photos.length).forEach(file => form.photos.push({ name: file.name, url: URL.createObjectURL(file) }))
const removePhoto = photo => { form.photos = form.photos.filter(item => item !== photo); URL.revokeObjectURL(photo.url) }
const saveDraft = () => { localStorage.setItem('wanzhengtong-disaster-draft', JSON.stringify({ ...form, photos: [] })); ElMessage.success('已暂存灾情上报草稿') }
const submit = async () => {
  if (!form.subjectId) return ElMessage.warning('请选择经营主体')
  if (!form.plotId) return ElMessage.warning('请选择关联地块')
  if (!form.description.trim()) return ElMessage.warning('请填写灾情描述')
  const subject = subjects.value.find(item => item.id === form.subjectId)
  const plot = subjectPlots.value.find(item => item.id === form.plotId)
  const regionName = form.region.join('/')
  const result = await addDisaster({ type: form.type, subjectId: form.subjectId, subjectName: subject?.name, plotId: form.plotId, plotName: plot?.name, regionCode: plot?.regionCode || userStore.role?.regionCode || '340000', regionName, location: form.location, description: form.description, photos: form.photos.map(item => item.name), reporter: userStore.role?.name })
  if (!result.success) return ElMessage.error(result.message || '提交失败')
  ElMessage.success('灾情上报已提交')
  form.description = ''
  form.location = ''
  form.photos = []
  await load()
}
const view = async item => { active.value = item; actions.value = await fetchRescueActions(item.id); detailVisible.value = true }
onMounted(async () => {
  const draft = JSON.parse(localStorage.getItem('wanzhengtong-disaster-draft') || 'null')
  subjects.value = await fetchPlanSubjects(userStore.role)
  if (draft) Object.assign(form, draft)
  if (!form.subjectId && subjects.value.length) form.subjectId = subjects.value[0].id
  await load()
})
</script>

<style lang="scss" scoped>
.mobile-page{width:100%;min-height:100%;box-sizing:border-box;background:#f5f7fa;padding:14px}.mobile-head,.report-card,.disaster-card{background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:12px}.mobile-head{display:flex;align-items:center;gap:8px;color:#1f3c68}.mobile-head b{display:block;font-size:19px}.mobile-head span{display:block;color:#667085;font-size:12px;margin-top:4px}.back-button{border:0;background:none;font-size:36px;line-height:1;padding:0 8px 4px 0}.section-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;color:#243b5a}.record-tabs{margin-bottom:8px}.disaster-row{border-top:1px solid #edf0f5;padding:12px 0}.disaster-row>b{font-size:13px;color:#344054}.disaster-row p{font-size:12px;color:#667085;line-height:1.5;margin:4px 0}.row-top,.row-bottom{font-size:11px;color:#98a2b3;display:flex;align-items:center;justify-content:space-between}.row-bottom span{color:#2d8c72}.disaster-row{cursor:pointer}.photos{display:flex;gap:8px;flex-wrap:wrap}.photo,.add-photo{width:68px;height:68px;border-radius:8px}.photo{position:relative;overflow:hidden;background:#eaf2fb}.photo img{width:100%;height:100%;object-fit:cover}.photo i{position:absolute;right:3px;top:0;color:#fff;font-style:normal;background:#0008;border-radius:50%;width:18px;height:18px;text-align:center;cursor:pointer}.add-photo{display:flex;align-items:center;justify-content:center;border:1px dashed #b7cbe1;color:#3c78b5;font-size:12px;text-align:center;cursor:pointer}.add-photo input{display:none}.actions{display:flex;justify-content:flex-end}.timeline-title{font-weight:600;color:#243b5a;margin:18px 0 8px}.action-row{border-left:2px solid #2d8c72;padding:2px 0 8px 10px;margin-left:4px}.action-row b,.action-row span{display:block;font-size:12px}.action-row span{color:#98a2b3;margin-top:4px}.mobile-page :deep(.el-form-item){margin-bottom:13px}
</style>
