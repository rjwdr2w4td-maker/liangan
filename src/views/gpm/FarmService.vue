<template>
  <div class="page-container service-page">
    <div class="page-head">
      <div><h2>农事服务管理</h2><p>统一维护农技、农机和灾害防范服务，按地区、作物和服务类型精准推送。</p></div>
      <el-button type="primary" @click="openEdit()">新增服务</el-button>
    </div>
    <div class="stat-grid">
      <div class="stat"><span>服务总数</span><b>{{ rows.length }}</b></div><div class="stat"><span>已发布</span><b>{{ publishedCount }}</b></div><div class="stat"><span>累计推送</span><b>{{ totalPush }}</b></div><div class="stat"><span>覆盖作物</span><b>{{ cropCount }}</b></div>
    </div>
    <div class="panel">
      <el-form :inline="true" class="filters"><el-form-item label="关键字"><el-input v-model="filters.keyword" clearable placeholder="标题/区域/作物" /></el-form-item><el-form-item label="类型"><el-select v-model="filters.type" clearable placeholder="全部" style="width:140px"><el-option v-for="item in types" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="状态"><el-select v-model="filters.status" clearable placeholder="全部" style="width:130px"><el-option label="待发布" value="待发布"/><el-option label="已发布" value="已发布"/></el-select></el-form-item><el-button type="primary" @click="load">查询</el-button><el-button @click="resetFilters">重置</el-button></el-form>
      <el-table :data="rows" stripe><el-table-column prop="title" label="服务标题" min-width="210"/><el-table-column prop="type" label="类型" width="105"/><el-table-column prop="crop" label="作物" width="85"/><el-table-column prop="regionName" label="服务区域" width="105"/><el-table-column prop="provider" label="提供单位" min-width="170"/><el-table-column prop="status" label="状态" width="90"><template #default="{row}"><el-tag :type="row.status === '已发布' ? 'success' : 'warning'">{{ row.status }}</el-tag></template></el-table-column><el-table-column prop="pushCount" label="已推送" width="85"/><el-table-column label="操作" width="240" fixed="right"><template #default="{row}"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link :type="row.status === '已发布' ? 'warning' : 'success'" @click="togglePublish(row)">{{ row.status === '已发布' ? '撤回' : '发布' }}</el-button><el-button link type="primary" :disabled="row.status !== '已发布'" @click="openPush(row)">定向推送</el-button></template></el-table-column></el-table>
    </div>
    <div class="panel"><div class="panel-title"><span class="title-text">最近推送记录</span><span class="title-extra">按地区、作物、类型形成可追溯记录</span></div><el-table :data="pushRecords" size="small"><el-table-column prop="time" label="推送时间" width="165"/><el-table-column prop="title" label="服务内容" min-width="200"/><el-table-column prop="region" label="目标地区" width="110"/><el-table-column prop="crop" label="目标作物" width="90"/><el-table-column prop="type" label="服务类型" width="110"/><el-table-column prop="count" label="触达主体" width="90"/></el-table></div>

    <el-dialog v-model="editVisible" :title="form.id ? '编辑农事服务' : '新增农事服务'" width="580px"><el-form :model="form" label-width="90px"><el-form-item label="服务标题" required><el-input v-model="form.title"/></el-form-item><el-form-item label="服务类型"><el-select v-model="form.type" style="width:100%"><el-option v-for="item in types" :key="item" :label="item" :value="item"/></el-select></el-form-item><el-form-item label="适用作物"><el-select v-model="form.crop" style="width:100%"><el-option v-for="item in crops" :key="item" :label="item" :value="item"/></el-select></el-form-item><el-form-item label="服务区域"><el-input v-model="form.regionName" placeholder="如阜阳市或全省"/></el-form-item><el-form-item label="提供单位" required><el-input v-model="form.provider"/></el-form-item><el-form-item label="服务内容"><el-input v-model="form.content" type="textarea" :rows="4"/></el-form-item></el-form><template #footer><el-button @click="editVisible=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template></el-dialog>
    <el-dialog v-model="pushVisible" title="定向推送" width="520px"><el-alert :title="pushForm.title" type="info" :closable="false"/><el-form :model="pushForm" label-width="90px" class="push-form"><el-form-item label="目标地区"><el-select v-model="pushForm.region" style="width:100%"><el-option v-for="item in regions" :key="item" :label="item" :value="item"/></el-select></el-form-item><el-form-item label="目标作物"><el-select v-model="pushForm.crop" style="width:100%"><el-option v-for="item in crops" :key="item" :label="item" :value="item"/></el-select></el-form-item><el-form-item label="服务类型"><el-select v-model="pushForm.type" style="width:100%"><el-option v-for="item in types" :key="item" :label="item" :value="item"/></el-select></el-form-item><el-form-item label="预计触达"><el-input-number v-model="pushForm.count" :min="1" :max="999"/> 个主体</el-form-item></el-form><template #footer><el-button @click="pushVisible=false">取消</el-button><el-button type="primary" @click="confirmPush">确认推送</el-button></template></el-dialog>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchFarmServices, saveFarmService, publishFarmService, pushFarmService } from '@/api/gpm'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const types = ['技术指导', '农机服务', '灾害防范']
const crops = ['小麦', '水稻', '玉米', '大豆', '通用']
const regions = ['全省', '合肥市', '阜阳市', '亳州市', '太和县', '旧县镇']
const rows = ref([]); const editVisible = ref(false); const pushVisible = ref(false)
const filters = reactive({ keyword: '', type: '', status: '' })
const emptyForm = () => ({ id: '', title: '', type: '技术指导', crop: '小麦', regionName: '全省', provider: '', content: '' })
const form = reactive(emptyForm())
const pushForm = reactive({ id: '', title: '', region: '全省', crop: '小麦', type: '技术指导', count: 20 })
const pushRecords = ref([{ time: '2026-10-12 09:30', title: '小麦播种技术指导', region: '阜阳市', crop: '小麦', type: '技术指导', count: 128 }, { time: '2026-10-10 15:20', title: '秋粮抢收农机调度', region: '全省', crop: '水稻', type: '农机服务', count: 256 }])
const publishedCount = computed(() => rows.value.filter(item => item.status === '已发布').length)
const totalPush = computed(() => rows.value.reduce((sum, item) => sum + Number(item.pushCount || 0), 0))
const cropCount = computed(() => new Set(rows.value.map(item => item.crop)).size)
const load = async () => { rows.value = await fetchFarmServices(userStore.role, filters) }
const resetFilters = () => { Object.assign(filters, { keyword: '', type: '', status: '' }); load() }
const openEdit = row => { Object.assign(form, emptyForm(), row || {}); editVisible.value = true }
const save = async () => { const result = await saveFarmService({ ...form }); if (!result.success) return ElMessage.error(result.message); editVisible.value = false; ElMessage.success('农事服务已保存'); load() }
const togglePublish = async row => { const next = row.status === '已发布' ? '待发布' : '已发布'; await ElMessageBox.confirm(`确认${next === '已发布' ? '发布' : '撤回'}“${row.title}”？`, '状态确认'); const result = await publishFarmService(row.id, next); if (!result.success) return ElMessage.error(result.message); ElMessage.success(next === '已发布' ? '服务已发布' : '服务已撤回'); load() }
const openPush = row => { Object.assign(pushForm, { id: row.id, title: row.title, region: row.regionName || '全省', crop: row.crop, type: row.type, count: 20 }); pushVisible.value = true }
const confirmPush = async () => { const result = await pushFarmService(pushForm.id, { region: pushForm.region, crop: pushForm.crop, type: pushForm.type, count: pushForm.count }); if (!result.success) return ElMessage.error(result.message); pushRecords.value.unshift({ time: new Date().toLocaleString('zh-CN', { hour12: false }), title: pushForm.title, region: pushForm.region, crop: pushForm.crop, type: pushForm.type, count: pushForm.count }); pushVisible.value = false; ElMessage.success(`已推送至 ${pushForm.count} 个目标主体`); load() }
onMounted(load)
</script>
<style lang="scss" scoped>
.service-page{gap:12px;overflow:auto}.page-head{display:flex;justify-content:space-between;align-items:flex-start}.eyebrow{color:var(--ah-primary);font-size:11px;letter-spacing:1px;font-weight:700}h2{margin:4px 0;font-size:22px}.page-head p{color:var(--ah-text-secondary);font-size:13px}.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.stat{background:#fff;border-radius:8px;padding:14px 18px;border-left:4px solid var(--ah-primary);box-shadow:0 1px 4px rgba(15,62,120,.06)}.stat span{display:block;color:var(--ah-text-secondary);font-size:12px}.stat b{display:block;font-size:24px;margin-top:5px}.filters{display:flex;align-items:center;flex-wrap:wrap}.filters :deep(.el-form-item){margin-bottom:12px;margin-right:12px}.push-form{margin-top:16px}@media(max-width:900px){.stat-grid{grid-template-columns:repeat(2,1fr)}}
</style>
