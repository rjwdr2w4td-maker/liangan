<template>
  <div class="mobile-page">
    <div class="mobile-head">
      <button class="back-button" @click="$router.back()">‹</button>
      <div><b>惠农政策</b><span>最新惠农政策直达基层</span></div>
    </div>
    <div class="search-box">
      <el-input v-model="keyword" clearable placeholder="搜索政策标题、类别或内容">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>
    <article v-for="item in filteredPolicies" :key="item.id" class="policy-card" @click="open(item)">
      <div class="policy-meta"><el-tag size="small" type="success">{{ item.category || '惠农政策' }}</el-tag><span>{{ item.publishDate }}</span></div>
      <h3>{{ item.title }}</h3>
      <p>{{ item.summary || item.content }}</p>
      <div class="read-more">查看政策详情 <span>›</span></div>
    </article>
    <el-empty v-if="!filteredPolicies.length" description="未找到相关政策" />
    <el-dialog v-model="dialogVisible" title="政策详情" width="92%">
      <template v-if="active">
        <div class="detail-meta">{{ active.category || '惠农政策' }} · {{ active.publishDate }} · {{ active.dept || '农业农村部门' }}</div>
        <h3 class="detail-title">{{ active.title }}</h3>
        <div class="detail-content" v-html="active.content || active.summary"></div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { fetchPolicies } from '@/api/gpm'

const keyword = ref('')
const policies = ref([])
const dialogVisible = ref(false)
const active = ref(null)
const filteredPolicies = computed(() => {
  const key = keyword.value.trim()
  return policies.value.filter(item => !key || `${item.title}${item.category}${item.summary}${item.content}`.includes(key))
})
const open = item => { active.value = item; dialogVisible.value = true }
onMounted(async () => {
  policies.value = (await fetchPolicies()).filter(item => item.status === '已发布' || item.status === 'published' || item.active !== false)
})
</script>

<style lang="scss" scoped>
.mobile-page{width:100%;min-height:100%;box-sizing:border-box;background:#f5f7fa;padding:14px}.mobile-head,.search-box,.policy-card{background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:12px}.mobile-head{display:flex;align-items:center;gap:8px;color:#1f3c68}.mobile-head b{display:block;font-size:19px}.mobile-head span{display:block;color:#667085;font-size:12px;margin-top:4px}.back-button{border:0;background:none;font-size:36px;line-height:1;padding:0 8px 4px 0}.policy-meta{display:flex;justify-content:space-between;align-items:center;color:#98a2b3;font-size:11px}.policy-card{cursor:pointer}.policy-card h3{font-size:16px;line-height:1.5;color:#243b5a;margin:11px 0 6px}.policy-card p{font-size:13px;color:#667085;line-height:1.6;margin:0}.read-more{border-top:1px solid #edf0f5;margin-top:10px;padding-top:9px;color:#2d8c72;font-size:12px;text-align:right}.read-more span{font-size:18px;vertical-align:-1px}.detail-meta{color:#98a2b3;font-size:12px}.detail-title{color:#243b5a;line-height:1.5;margin:12px 0}.detail-content{color:#475467;font-size:13px;line-height:1.8}.detail-content :deep(p){margin:0 0 8px}
</style>
