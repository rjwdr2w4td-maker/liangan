<template>
  <div class="page-container sil-page">
    <div class="page-head">
      <div><h2>青贮生产/收储台账</h2><p>填报实际产量、收储重量并维护全过程台账。</p></div>
      <el-button v-if="isManager" type="primary" @click="load">刷新待审核</el-button>
    </div>

    <div class="stat-grid">
      <div><span>计划面积</span><b>{{ sum('planArea').toFixed(1) }}</b><em>亩</em></div>
      <div><span>实际面积</span><b>{{ sum('actualArea').toFixed(1) }}</b><em>亩</em></div>
      <div><span>预计产量</span><b>{{ sum('expectedYield').toFixed(1) }}</b><em>吨</em></div>
      <div><span>收储重量</span><b>{{ sum('weight').toFixed(1) }}</b><em>吨</em></div>
    </div>

    <div class="panel">
      <el-form :inline="true" class="filters">
        <el-form-item label="年份"><el-select v-model="filters.year" clearable placeholder="全部" style="width:120px"><el-option :value="2026" label="2026年"/><el-option :value="2027" label="2027年"/></el-select></el-form-item>
        <el-form-item label="审核状态"><el-select v-model="filters.auditStatus" clearable placeholder="全部" style="width:130px"><el-option label="草稿" value="draft"/><el-option label="待审核" value="pending"/><el-option label="已通过" value="approved"/><el-option label="退回" value="returned"/><el-option label="驳回" value="rejected"/></el-select></el-form-item>
        <el-form-item label="关键词"><el-input v-model="filters.keyword" clearable placeholder="主体、备案编号或买方"/></el-form-item>
        <el-button type="primary" @click="apply">查询</el-button><el-button @click="reset">重置</el-button>
      </el-form>
      <el-table :data="rows" stripe border>
        <el-table-column prop="isSupplement" label="类型" width="95"><template #default="{row}"><el-tag size="small" :type="row.isSupplement ? 'warning' : 'success'">{{ row.isSupplement ? '补充收储' : '生产收储' }}</el-tag></template></el-table-column>
        <el-table-column prop="filedNo" label="备案编号" width="180"/><el-table-column prop="subjectName" label="收储主体" min-width="180"/><el-table-column prop="planArea" label="计划面积（亩）" width="120" align="right"/><el-table-column prop="actualArea" label="实际面积（亩）" width="115" align="right"/><el-table-column prop="actualYield" label="实际产量（吨）" width="115" align="right"><template #default="{row}">{{ row.actualYield ?? '—' }}</template></el-table-column><el-table-column prop="weight" label="收储重量（吨）" width="115" align="right"><template #default="{row}">{{ row.weight ?? '—' }}</template></el-table-column><el-table-column prop="auditStatus" label="审核状态" width="100"><template #default="{row}"><el-tag size="small" :type="auditType(row.auditStatus)">{{ auditName(row.auditStatus) }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="210" fixed="right"><template #default="{row}"><el-button link type="primary" @click="openEdit(row)">{{ isManager ? '维护' : '填报' }}</el-button><el-button v-if="isManager && row.auditStatus === 'pending'" link type="success" @click="openAudit(row)">审核</el-button><el-button v-if="!isManager && ['draft','returned'].includes(row.auditStatus)" link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
      </el-table>
      <el-empty v-if="!rows.length" description="暂无台账数据"/>
    </div>

    <el-dialog v-model="editVisible" :title="isManager ? '维护台账' : '产量、收储重量填报'" width="700px">
      <el-form v-if="form" :model="form" label-width="115px" class="edit-form">
        <el-descriptions :column="2" border><el-descriptions-item label="备案编号">{{ form.filedNo }}</el-descriptions-item><el-descriptions-item label="主体">{{ form.subjectName }}</el-descriptions-item></el-descriptions>
        <el-form-item label="实际面积（亩）"><el-input-number v-model="form.actualArea" :min="0" :precision="1"/></el-form-item>
        <el-form-item label="实际产量（吨）"><el-input-number v-model="form.actualYield" :min="0" :precision="1"/></el-form-item>
        <el-form-item label="收储重量（吨）"><el-input-number v-model="form.weight" :min="0" :precision="1"/></el-form-item>
        <el-form-item label="收储价格（元/吨）"><el-input-number v-model="form.price" :min="0" :precision="2"/></el-form-item>
        <el-form-item label="买方/去向"><el-input v-model="form.buyer" placeholder="如：自用、某养殖场"/></el-form-item>
        <el-form-item label="播种时间"><el-date-picker v-model="form.sowingTime" value-format="YYYY-MM-DD" type="date"/></el-form-item>
        <el-form-item label="收获时间"><el-date-picker v-model="form.harvestTime" value-format="YYYY-MM-DD" type="date"/></el-form-item>
        <el-form-item label="入库时间"><el-date-picker v-model="form.storageTime" value-format="YYYY-MM-DD" type="date"/></el-form-item>
      </el-form>
      <template #footer><el-button @click="editVisible=false">取消</el-button><el-button @click="save(false)">保存草稿</el-button><el-button type="primary" @click="save(true)">{{ isManager ? '保存维护' : '提交审核' }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="auditVisible" title="台账审核" width="650px"><template v-if="current"><el-descriptions :column="2" border><el-descriptions-item label="备案编号">{{ current.filedNo }}</el-descriptions-item><el-descriptions-item label="主体">{{ current.subjectName }}</el-descriptions-item><el-descriptions-item label="实际产量">{{ current.actualYield }} 吨</el-descriptions-item><el-descriptions-item label="收储重量">{{ current.weight }} 吨</el-descriptions-item></el-descriptions><el-input v-model="opinion" type="textarea" :rows="3" placeholder="退回或驳回时必须填写意见"/></template><template #footer><el-button @click="auditVisible=false">取消</el-button><el-button type="warning" @click="audit('return')">退回</el-button><el-button type="danger" @click="audit('reject')">驳回</el-button><el-button type="primary" @click="audit('pass')">通过</el-button></template></el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchLedgers, saveLedger, submitProductionReport, updateLedger, auditLedger, deleteLedger } from '@/api/sil'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const isManager = computed(() => ['province', 'city', 'county', 'wanzhengtong'].includes(userStore.role?.code))
const allRows = ref([]); const rows = ref([]); const current = ref(null); const form = ref(null); const editVisible = ref(false); const auditVisible = ref(false); const opinion = ref(''); const filters = reactive({ year: '', auditStatus: '', keyword: '' })
const auditName = (s) => ({ draft: '草稿', pending: '待审核', approved: '已通过', filed: '已通过', returned: '退回', rejected: '驳回' }[s] || '未填报')
const auditType = (s) => ({ pending: 'warning', approved: 'success', filed: 'success', returned: 'warning', rejected: 'danger' }[s] || 'info')
const sum = (key) => rows.value.reduce((total, row) => total + Number(row[key] || 0), 0)
const apply = () => { rows.value = allRows.value.filter((r) => (!filters.year || r.year === filters.year) && (!filters.auditStatus || r.auditStatus === filters.auditStatus) && (!filters.keyword || `${r.filedNo}${r.subjectName}${r.buyer || ''}`.includes(filters.keyword))) }
const reset = () => { Object.assign(filters, { year: '', auditStatus: '', keyword: '' }); apply() }
const load = async () => { allRows.value = await fetchLedgers(userStore.role); apply() }
const openEdit = (row) => { current.value = row; form.value = { ...row }; editVisible.value = true }
const save = async (submit) => { if (!form.value) return; const payload = { ...form.value, submit }; const result = isManager.value ? await updateLedger(form.value.id, payload, userStore.role) : submit ? await submitProductionReport(payload, userStore.role) : await saveLedger(payload, userStore.role); if (!result.success) return ElMessage.error(result.message || '保存失败'); ElMessage.success(result.message || '保存成功'); editVisible.value = false; load() }
const openAudit = (row) => { current.value = row; opinion.value = ''; auditVisible.value = true }
const audit = async (action) => { if (action !== 'pass' && !opinion.value.trim()) return ElMessage.warning('请填写审核意见'); try { await ElMessageBox.confirm('确认处理该台账吗？', '审核确认') } catch { return }; const result = await auditLedger(current.value.id, action, opinion.value, userStore.role); if (!result.success) return ElMessage.error(result.message || '审核失败'); ElMessage.success('审核完成'); auditVisible.value = false; load() }
const remove = async (row) => { try { await ElMessageBox.confirm('确认删除该台账吗？', '删除确认', { type: 'warning' }) } catch { return }; const result = await deleteLedger(row.id, userStore.role); if (!result.success) return ElMessage.error(result.message || '删除失败'); ElMessage.success('已删除'); load() }
onMounted(load)
</script>
<style scoped lang="scss">.sil-page{overflow:auto}.page-head{display:flex;justify-content:space-between;margin-bottom:14px}.page-head h2{margin:4px 0;color:var(--ah-text);font-size:22px}.page-head p{color:var(--ah-text-secondary);font-size:13px}.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.stat-grid>div{padding:16px 20px;background:#fff;border:1px solid #e6edf5;border-radius:8px}.stat-grid span{display:block;color:#7b8794;font-size:13px}.stat-grid b{display:inline-block;margin-top:8px;color:var(--ah-primary);font-size:25px}.stat-grid em{margin-left:6px;font-style:normal;color:#8492a6;font-size:12px}.filters{display:flex;align-items:center;flex-wrap:wrap}.filters :deep(.el-form-item){margin-bottom:12px}.edit-form{display:grid;grid-template-columns:1fr 1fr;gap:0 18px}.edit-form :deep(.el-descriptions),.edit-form :deep(.el-form-item:first-of-type){grid-column:1/-1}.edit-form :deep(.el-input-number),.edit-form :deep(.el-date-editor){width:100%}@media(max-width:1000px){.stat-grid{grid-template-columns:repeat(2,1fr)}.edit-form{display:block}}</style>
