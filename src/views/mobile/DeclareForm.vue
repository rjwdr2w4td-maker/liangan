<template>
  <div class="mobile-page">
    <div class="mobile-head">
      <div><b>皖企通</b><span>年度任务与种植意向</span></div>
      <el-tag size="small" type="success">{{ userStore.regionName }}</el-tag>
    </div>

    <div class="form-card summary-card">
      <div class="section-title"><b>本地年度生产计划</b><el-tag size="small">{{ currentYear }} 年</el-tag></div>
      <template v-if="task">
        <p class="plan-name">{{ task.planName }}</p>
        <div class="metrics"><div><b>{{ task.taskAreaMu }}</b><span>计划面积（亩）</span></div><div><b>{{ task.progress }}%</b><span>当前落实进度</span></div><div><b>{{ task.cropType }}</b><span>计划作物</span></div></div>
        <p class="muted">{{ task.cityName }} · {{ task.countyName }} · {{ task.townName }}</p>
      </template>
      <el-empty v-else description="暂无年度计划任务" :image-size="55" />
    </div>

    <div class="form-card">
      <div class="section-title"><b>填报本户种植意向</b><el-tag size="small" type="warning">极简填报</el-tag></div>
      <el-form label-position="top">
        <el-form-item label="经营主体"><el-input v-model="form.subjectName" disabled /></el-form-item>
        <el-form-item label="种植作物品种"><el-checkbox-group v-model="form.crops"><el-checkbox label="wheat">小麦</el-checkbox><el-checkbox label="rice">水稻</el-checkbox><el-checkbox label="corn">玉米</el-checkbox><el-checkbox label="soybean">大豆</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item label="各作物意向面积（亩）"><div class="crop-inputs"><el-input-number v-model="form.wheat" :min="0" controls-position="right" placeholder="小麦"/><el-input-number v-model="form.rice" :min="0" controls-position="right" placeholder="水稻"/><el-input-number v-model="form.corn" :min="0" controls-position="right" placeholder="玉米"/><el-input-number v-model="form.soybean" :min="0" controls-position="right" placeholder="大豆"/></div></el-form-item>
        <el-form-item label="预计播种时间"><el-date-picker v-model="form.sowDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
      </el-form>
      <el-alert title="提交后将用于匹配属地气象预警和农事建议" type="info" :closable="false" show-icon />
    </div>

    <div class="form-card">
      <div class="section-title"><b>年份横向对比</b><el-select v-model="compareYear" size="small" style="width:110px"><el-option v-for="year in compareYears" :key="year" :label="`${year}年`" :value="year" /></el-select></div>
      <div class="compare-row"><span>{{ compareYear }} 年历史计划</span><b>{{ historyArea }} 亩</b></div>
      <div class="compare-row"><span>{{ currentYear }} 年本户意向</span><b>{{ intentionArea }} 亩</b></div>
      <div class="compare-row"><span>面积变化</span><el-tag :type="growth >= 0 ? 'success' : 'danger'">{{ growth >= 0 ? '+' : '' }}{{ growth }}%</el-tag></div>
    </div>

    <div class="form-card">
      <div class="section-title"><b>地图点选关联地块</b><span class="muted">已选 {{ selectedPlots.length }} 块</span></div>
      <div class="map-wrap"><BaseMap ref="mapRef" :center="[33.16, 115.62]" :zoom="10" /></div>
      <div class="plot-list"><button v-for="plot in subjectPlots" :key="plot.id" :class="['plot-item', { selected: selectedPlots.includes(plot.id) }]" @click="togglePlot(plot)"><span>{{ plot.name }}</span><small>{{ plot.areaMu }}亩 · {{ plot.crop }}</small><b>{{ selectedPlots.includes(plot.id) ? '已选' : '选择' }}</b></button></div>
    </div>

    <div class="actions"><el-button @click="saveDraft">保存草稿</el-button><el-button type="primary" @click="submit">提交种植意向</el-button></div>
    <el-alert v-if="draftSaved" title="草稿已保存在本机，联网后可继续提交" type="success" :closable="false" show-icon />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { fetchSubjectPlanTasks, fetchSubjectPlotRelations } from '@/api/gpm'
import { PLOTS } from '@/mock/geo/plot-gen'
import BaseMap from '@/components/map/BaseMap.vue'

const userStore = useUserStore()
const currentYear = 2026
const compareYear = ref(2025)
const compareYears = [2025, 2024]
const task = ref(null)
const subjectPlots = ref([])
const selectedPlots = ref([])
const mapRef = ref(null)
const draftSaved = ref(false)
const form = reactive({ subjectName: userStore.role?.unit || '', crops: ['wheat'], wheat: 0, rice: 0, corn: 0, soybean: 0, sowDate: '2026-10-05' })

const intentionArea = computed(() => ['wheat', 'rice', 'corn', 'soybean'].reduce((sum, crop) => sum + Number(form[crop] || 0), 0))
const historyArea = computed(() => compareYear.value === 2025 ? 980 : 940)
const growth = computed(() => historyArea.value ? Math.round((intentionArea.value / historyArea.value - 1) * 100) : 0)
const geojson = computed(() => ({ type: 'FeatureCollection', features: subjectPlots.value.filter(item => item.geometry).map(item => ({ type: 'Feature', properties: { id: item.id }, geometry: item.geometry })) }))

const togglePlot = (plot) => {
  const index = selectedPlots.value.indexOf(plot.id)
  if (index >= 0) selectedPlots.value.splice(index, 1)
  else selectedPlots.value.push(plot.id)
}

const saveDraft = () => {
  localStorage.setItem('wanqitong-intention-draft', JSON.stringify({ ...form, selectedPlots: selectedPlots.value }))
  draftSaved.value = true
  ElMessage.success('种植意向草稿已保存')
}

const submit = () => {
  if (!form.crops.length || intentionArea.value <= 0) return ElMessage.warning('请选择作物并填写意向面积')
  if (!selectedPlots.value.length) return ElMessage.warning('请至少选择一块关联地块')
  const records = JSON.parse(localStorage.getItem('wanqitong-intentions') || '[]')
  records.unshift({ ...form, subjectId: userStore.role?.subjectId, year: currentYear, selectedPlots: [...selectedPlots.value], submittedAt: new Date().toISOString() })
  localStorage.setItem('wanqitong-intentions', JSON.stringify(records))
  draftSaved.value = false
  ElMessage.success('种植意向已提交至属地管理部门')
}

onMounted(async () => {
  const tasks = await fetchSubjectPlanTasks(userStore.role)
  task.value = tasks.find(item => Number(item.year) === currentYear) || tasks[0] || null
  const relations = await fetchSubjectPlotRelations(userStore.role, { subjectId: userStore.role?.subjectId })
  const relationIds = new Set(relations.filter(item => item.relationStatus === '已关联').map(item => item.plotId))
  subjectPlots.value = PLOTS.filter(item => item.subjectId === userStore.role?.subjectId && relationIds.has(item.id))
  const draft = JSON.parse(localStorage.getItem('wanqitong-intention-draft') || 'null')
  if (draft) {
    Object.assign(form, draft)
    selectedPlots.value = draft.selectedPlots || []
  }
  await nextTick()
  if (mapRef.value && geojson.value.features.length) mapRef.value.addGeoJSON('subject-plots', geojson.value, { style: feature => ({ color: selectedPlots.value.includes(feature.properties.id) ? '#e67e22' : '#2d8c72', weight: 2, fillOpacity: 0.35 }), onEachFeature: (feature, layer) => layer.on('click', () => togglePlot(subjectPlots.value.find(item => item.id === feature.properties.id))) })
})
</script>

<style lang="scss" scoped>
.mobile-page{width:100%;min-width:0;box-sizing:border-box;margin:0;min-height:100%;background:#f5f7fa;padding:14px;overflow-x:hidden}.mobile-head,.form-card{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px}.mobile-head{display:flex;align-items:center;justify-content:space-between;color:#1f3c68}.mobile-head b{font-size:21px;display:block}.mobile-head span{font-size:13px;color:#667085}.section-title{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#243b5a;margin-bottom:12px}.plan-name{font-weight:600;color:#344054}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center}.metrics div{background:#f4f8fb;border-radius:8px;padding:10px 4px}.metrics b,.metrics span{display:block}.metrics b{font-size:18px;color:#176b58}.metrics span,.muted{font-size:12px;color:#98a2b3}.crop-inputs{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.compare-row{display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid #edf0f5;color:#667085;font-size:13px}.compare-row b{color:#344054}.map-wrap{height:220px;border-radius:10px;overflow:hidden;position:relative}.plot-list{margin-top:10px}.plot-item{width:100%;display:flex;align-items:center;gap:8px;border:0;border-top:1px solid #edf0f5;background:#fff;padding:11px 0;text-align:left;color:#344054}.plot-item span{flex:1}.plot-item small{color:#98a2b3}.plot-item b{color:#2d8c72;font-size:12px}.plot-item.selected b{color:#e67e22}.actions{display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px}.mobile-page :deep(.el-form-item){margin-bottom:14px}
</style>