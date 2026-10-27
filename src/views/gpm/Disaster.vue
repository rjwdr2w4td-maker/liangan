<template>
  <div class="page-container weather-page">
    <div class="page-head">
      <div><h2>气象预警</h2><p>接入或录入气象部门预报、预警信息，并关联受影响的种植区域和作物。</p></div>
      <el-button type="primary" @click="openCreate">录入气象信息</el-button>
    </div>

    <div class="panel filter-panel">
      <el-form :inline="true">
        <el-form-item label="关键词"><el-input v-model="filters.keyword" clearable placeholder="灾害类型、地区、内容" /></el-form-item>
        <el-form-item label="信息类型"><el-select v-model="filters.kind" clearable placeholder="全部"><el-option label="天气预报" value="forecast" /><el-option label="气象预警" value="warning" /></el-select></el-form-item>
        <el-form-item label="预警等级"><el-select v-model="filters.level" clearable placeholder="全部"><el-option v-for="item in levels" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" clearable placeholder="全部"><el-option label="已发布" value="active" /><el-option label="草稿" value="draft" /><el-option label="已失效" value="expired" /></el-select></el-form-item>
      </el-form>
    </div>

    <div class="panel list-panel">
      <div class="panel-title"><span class="title-text">气象预警与预报列表</span><span class="title-extra">共 {{ filteredAlerts.length }} 条</span></div>
      <el-table :data="filteredAlerts" stripe>
        <el-table-column type="index" label="序号" width="65" />
        <el-table-column label="类型" width="100"><template #default="{ row }"><el-tag :type="row.kind === 'warning' ? 'warning' : 'info'">{{ row.kind === 'warning' ? '气象预警' : '天气预报' }}</el-tag></template></el-table-column>
        <el-table-column prop="type" label="天气/灾害类型" width="125" />
        <el-table-column prop="level" label="等级" width="90" />
        <el-table-column prop="regionName" label="关联种植区域" min-width="150" />
        <el-table-column prop="crops" label="关联作物" min-width="130" />
        <el-table-column prop="publishTime" label="发布时间" width="155" />
        <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : row.status === 'draft' ? 'info' : 'danger'">{{ statusText(row.status) }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="200" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="showDetail(row)">查看</el-button><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
      </el-table>
      <el-empty v-if="!filteredAlerts.length" description="暂无气象预报或预警信息" />
    </div>

    <el-drawer v-model="detailVisible" title="气象信息详情" size="560px"><template v-if="current"><el-descriptions :column="1" border><el-descriptions-item label="信息类型">{{ current.kind === 'warning' ? '气象预警' : '天气预报' }}</el-descriptions-item><el-descriptions-item label="天气/灾害类型">{{ current.type }} · {{ current.level }}</el-descriptions-item><el-descriptions-item label="关联种植区域">{{ current.regionName }}</el-descriptions-item><el-descriptions-item label="关联作物">{{ current.crops }}</el-descriptions-item><el-descriptions-item label="发布时间">{{ current.publishTime }}</el-descriptions-item><el-descriptions-item label="有效期">{{ current.validUntil || '未设置' }}</el-descriptions-item><el-descriptions-item label="信息内容">{{ current.content }}</el-descriptions-item><el-descriptions-item label="防范建议">{{ current.advice || '暂无' }}</el-descriptions-item></el-descriptions></template></el-drawer>

    <el-dialog v-model="formVisible" :title="editing ? '编辑气象信息' : '录入气象信息'" width="620px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="105px">
        <el-form-item label="信息类型" prop="kind"><el-radio-group v-model="form.kind"><el-radio value="forecast">天气预报</el-radio><el-radio value="warning">气象预警</el-radio></el-radio-group></el-form-item>
        <el-form-item label="天气/灾害类型" prop="type"><el-select v-model="form.type" style="width:100%"><el-option v-for="item in weatherTypes" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="预警等级"><el-select v-model="form.level" style="width:100%"><el-option v-for="item in levels" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="关联县域" prop="regionCode"><el-select v-model="form.regionCode" filterable style="width:100%" placeholder="请选择县域" @change="selectCounty"><el-option v-for="item in countyOptions" :key="item.code" :label="`${item.name}（${item.cityName}）`" :value="item.code" /></el-select></el-form-item>
        <el-form-item label="县域名称"><el-input v-model="form.regionName" disabled /></el-form-item>
        <el-form-item label="关联作物" prop="crops"><el-input v-model="form.crops" placeholder="如：小麦、玉米" /></el-form-item>
        <el-form-item label="发布时间" prop="publishTime"><el-date-picker v-model="form.publishTime" type="datetime" value-format="YYYY-MM-DD HH:mm" style="width:100%" /></el-form-item>
        <el-form-item label="有效期至"><el-date-picker v-model="form.validUntil" type="datetime" value-format="YYYY-MM-DD HH:mm" style="width:100%" /></el-form-item>
        <el-form-item label="预报预警内容" prop="content"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="防范建议"><el-input v-model="form.advice" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="发布状态"><el-radio-group v-model="form.status"><el-radio value="active">立即发布</el-radio><el-radio value="draft">保存草稿</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addWeatherAlert, deleteWeatherAlert, fetchWeatherAlerts, updateWeatherAlert } from '@/api/gpm'
import { useUserStore } from '@/stores/user'
import { REGION_TREE } from '@/mock/common/regions'

const userStore = useUserStore()
const alerts = ref([])
const current = ref(null)
const detailVisible = ref(false)
const formVisible = ref(false)
const editing = ref(false)
const formRef = ref(null)
const levels = ['蓝色', '黄色', '橙色', '红色', '一般']
const weatherTypes = ['暴雨', '大风', '寒潮', '高温', '干旱', '低温冻害', '台风', '雷电']
const countyOptions = computed(() => REGION_TREE[0].children.flatMap(city => (city.children || []).map(county => ({ ...county, cityCode: city.code, cityName: city.name }))).filter(item => !userStore.role?.regionCode || userStore.role.regionCode === '340000' || item.code.startsWith(String(userStore.role.regionCode))))
const filters = reactive({ keyword: '', kind: '', level: '', status: '' })
const form = reactive({ id: '', kind: 'warning', type: '暴雨', level: '黄色', regionName: '', regionCode: '', crops: '', publishTime: '', validUntil: '', content: '', advice: '', status: 'active' })
const rules = { kind: [{ required: true, message: '请选择信息类型' }], type: [{ required: true, message: '请选择天气或灾害类型' }], regionName: [{ required: true, message: '请输入关联种植区域' }], regionCode: [{ required: true, message: '请输入区域编码' }], crops: [{ required: true, message: '请输入关联作物' }], publishTime: [{ required: true, message: '请选择发布时间' }], content: [{ required: true, message: '请输入预报预警内容' }] }
const filteredAlerts = computed(() => alerts.value.filter(item => (!filters.keyword || `${item.type}${item.regionName}${item.content}${item.crops}`.includes(filters.keyword)) && (!filters.kind || item.kind === filters.kind) && (!filters.level || item.level === filters.level) && (!filters.status || item.status === filters.status)))
const statusText = status => ({ active: '已发布', draft: '草稿', expired: '已失效' }[status] || status)
const load = async () => { alerts.value = await fetchWeatherAlerts(userStore.role) }
const showDetail = row => { current.value = row; detailVisible.value = true }
const selectCounty = code => { form.regionName = countyOptions.value.find(item => item.code === code)?.name || '' }
const openCreate = () => { editing.value = false; const county = countyOptions.value.find(item => item.code === userStore.role?.regionCode) || countyOptions.value[0]; Object.assign(form, { id: '', kind: 'warning', type: '暴雨', level: '黄色', regionName: county?.name || userStore.regionName || '', regionCode: county?.code || '', crops: '', publishTime: new Date().toISOString().slice(0, 16).replace('T', ' '), validUntil: '', content: '', advice: '', status: 'active' }); formVisible.value = true }
const openEdit = row => { editing.value = true; Object.assign(form, row); formVisible.value = true }
const save = async () => { await formRef.value.validate(); const result = editing.value ? await updateWeatherAlert(form) : await addWeatherAlert({ ...form, source: '人工录入' }); if (!result?.success) return ElMessage.error(result?.message || '保存失败'); ElMessage.success(editing.value ? '气象信息已更新' : '气象信息已录入'); formVisible.value = false; await load() }
const remove = async row => { await ElMessageBox.confirm(`确定删除“${row.type}·${row.regionName}”吗？`, '删除气象信息', { type: 'warning' }); const result = await deleteWeatherAlert(row.id); if (!result?.success) return ElMessage.error(result?.message || '删除失败'); ElMessage.success('气象信息已删除'); await load() }
onMounted(load)
</script>

<style lang="scss" scoped>
.weather-page{gap:12px;overflow:auto}.page-head{display:flex;justify-content:space-between;align-items:flex-start}.page-head h2{margin:0 0 6px;font-size:22px}.page-head p{margin:0;color:var(--ah-text-secondary)}.filter-panel,.list-panel{padding:16px}.filter-panel :deep(.el-form-item){margin-bottom:0}.panel-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.title-text{font-weight:700}.title-extra{font-size:12px;color:var(--ah-text-secondary)}
</style>
