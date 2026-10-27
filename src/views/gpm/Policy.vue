<template>
  <div class="page-container policy-page">
    <div class="panel filter-panel">
      <div class="page-head">
        <div><h2>惠农政策</h2><p>发布、维护和公开展示惠农政策内容。</p></div>
        <el-button type="primary" @click="openCreate">发布政策</el-button>
      </div>
      <el-form :inline="true">
        <el-form-item label="关键词"><el-input v-model="filters.keyword" clearable placeholder="标题、摘要、部门" /></el-form-item>
        <el-form-item label="类别"><el-select v-model="filters.category" clearable placeholder="全部"><el-option v-for="item in categories" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.active" clearable placeholder="全部"><el-option label="已发布" :value="true" /><el-option label="已下线" :value="false" /></el-select></el-form-item>
        <el-form-item><el-button @click="reset">重置</el-button></el-form-item>
      </el-form>
    </div>

    <div class="panel list-panel">
      <div class="panel-title"><span class="title-text">政策列表</span><span class="title-extra">共 {{ filteredPolicies.length }} 条</span></div>
      <el-table :data="filteredPolicies" stripe>
        <el-table-column type="index" label="序号" width="65" />
        <el-table-column prop="title" label="政策标题" min-width="280" show-overflow-tooltip />
        <el-table-column prop="category" label="类别" width="110" />
        <el-table-column prop="dept" label="发布部门" width="150" />
        <el-table-column prop="publishDate" label="发布日期" width="120" />
        <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="row.active ? 'success' : 'info'">{{ row.active ? '已发布' : '已下线' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="190" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="showDetail(row)">查看</el-button><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
      </el-table>
      <el-empty v-if="!filteredPolicies.length" description="暂无政策" />
    </div>

    <el-drawer v-model="detailVisible" title="政策详情" size="620px"><template v-if="current"><h2>{{ current.title }}</h2><el-descriptions :column="1" border><el-descriptions-item label="类别/状态">{{ current.category }} / {{ current.active ? '已发布' : '已下线' }}</el-descriptions-item><el-descriptions-item label="发布部门">{{ current.dept }}</el-descriptions-item><el-descriptions-item label="发布日期">{{ current.publishDate }}</el-descriptions-item><el-descriptions-item label="适用范围">{{ current.scope }}</el-descriptions-item></el-descriptions><div class="rich-content" v-html="current.content || current.summary" /></template></el-drawer>

    <el-dialog v-model="formVisible" :title="editing ? '编辑惠农政策' : '发布惠农政策'" width="900px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16"><el-col :span="16"><el-form-item label="政策标题" prop="title"><el-input v-model="form.title" /></el-form-item></el-col><el-col :span="8"><el-form-item label="类别" prop="category"><el-select v-model="form.category" style="width:100%"><el-option v-for="item in policyCategories" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col></el-row>
        <el-row :gutter="16"><el-col :span="12"><el-form-item label="发布部门" prop="dept"><el-input v-model="form.dept" /></el-form-item></el-col><el-col :span="12"><el-form-item label="适用范围" prop="scope"><el-input v-model="form.scope" /></el-form-item></el-col></el-row>
        <el-form-item label="政策摘要" prop="summary"><el-input v-model="form.summary" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="政策内容" prop="content"><div class="editor-toolbar"><el-button size="small" @click="exec('bold')"><b>加粗</b></el-button><el-button size="small" @click="exec('insertUnorderedList')">列表</el-button><el-button size="small" @click="exec('formatBlock','h3')">标题</el-button><el-button size="small" @click="exec('removeFormat')">清除格式</el-button></div><div ref="editorRef" class="rich-editor" contenteditable="true" @input="syncContent" /></el-form-item>
        <el-form-item label="发布状态"><el-switch v-model="form.active" active-text="立即发布" inactive-text="保存草稿" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addPolicy, deletePolicy, fetchPolicies, updatePolicy } from '@/api/gpm'

const policies = ref([])
const current = ref(null)
const detailVisible = ref(false)
const formVisible = ref(false)
const editing = ref(false)
const formRef = ref(null)
const editorRef = ref(null)
const filters = reactive({ keyword: '', category: '', active: null })
const policyCategories = ['补贴政策', '保险政策', '管护制度', '产业政策']
const form = reactive({ id: '', title: '', category: '补贴政策', dept: '省农业农村厅', scope: '全省', summary: '', content: '', active: true })
const rules = { title: [{ required: true, message: '请输入政策标题', trigger: 'blur' }], category: [{ required: true, message: '请选择政策类别', trigger: 'change' }], dept: [{ required: true, message: '请输入发布部门', trigger: 'blur' }], summary: [{ required: true, message: '请输入政策摘要', trigger: 'blur' }], content: [{ required: true, message: '请输入政策内容', trigger: 'blur' }] }
const categories = computed(() => [...new Set(policies.value.map(item => item.category))])
const filteredPolicies = computed(() => policies.value.filter(item => (!filters.keyword || `${item.title}${item.summary}${item.dept}`.includes(filters.keyword)) && (!filters.category || item.category === filters.category) && (filters.active === null || item.active === filters.active)))
const reset = () => Object.assign(filters, { keyword: '', category: '', active: null })
const showDetail = item => { current.value = item; detailVisible.value = true }
const syncContent = event => { form.content = event.target.innerHTML }
const exec = (command, value = null) => { editorRef.value?.focus(); document.execCommand(command, false, value); syncContent({ target: editorRef.value }) }
const fillEditor = async content => { await nextTick(); if (editorRef.value) editorRef.value.innerHTML = content || '' }
const openCreate = () => { editing.value = false; Object.assign(form, { id: '', title: '', category: '补贴政策', dept: '省农业农村厅', scope: '全省', summary: '', content: '', active: true }); formVisible.value = true; fillEditor('') }
const openEdit = row => { editing.value = true; Object.assign(form, { id: row.id, title: row.title, category: row.category, dept: row.dept, scope: row.scope, summary: row.summary, content: row.content || row.summary, active: row.active }); formVisible.value = true; fillEditor(form.content) }
const load = async () => { policies.value = await fetchPolicies() }
const save = async () => { await formRef.value.validate(); const result = editing.value ? await updatePolicy(form) : await addPolicy(form); if (!result?.success) return ElMessage.error(result?.message || '保存失败'); ElMessage.success(editing.value ? '政策已更新' : '政策已发布'); formVisible.value = false; await load() }
const remove = async row => { await ElMessageBox.confirm(`确定删除“${row.title}”吗？`, '删除政策', { type: 'warning' }); const result = await deletePolicy(row.id); if (!result?.success) return ElMessage.error(result?.message || '删除失败'); ElMessage.success('政策已删除'); await load() }
onMounted(load)
</script>

<style lang="scss" scoped>
.policy-page{gap:12px;overflow:auto}.filter-panel,.list-panel{padding:16px}.page-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}.page-head h2{margin:0 0 5px}.page-head p{margin:0;color:var(--ah-text-secondary);font-size:13px}.filter-panel :deep(.el-form-item){margin-bottom:0}.panel-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.title-text{font-weight:700}.title-extra{color:var(--ah-text-secondary);font-size:12px}.editor-toolbar{padding:7px;background:#f5f7fa;border:1px solid var(--ah-border);border-bottom:0}.rich-editor{min-height:260px;padding:12px;border:1px solid var(--ah-border);outline:none;line-height:1.8}.rich-content{margin-top:18px;line-height:1.9}.rich-content :deep(p){margin:8px 0}.rich-content :deep(h3){margin:14px 0 8px}
</style>
