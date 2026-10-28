<template>
  <div class="mobile-page"><div class="mobile-head"><div><b>惠农政策</b><span>查看属地已发布政策</span></div><el-button link type="primary" @click="$router.back()">返回</el-button></div><article v-for="item in policies" :key="item.id" class="policy-card"><div class="policy-meta"><el-tag size="small" type="success">{{ item.category || '惠农政策' }}</el-tag><span>{{ item.publishDate }}</span></div><h3>{{ item.title }}</h3><p>{{ item.summary || item.content }}</p><div class="policy-content" v-html="item.content"></div></article><el-empty v-if="!policies.length" description="暂无惠农政策" /></div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { fetchPolicies } from '@/api/gpm'
const policies = ref([])
onMounted(async () => { policies.value = (await fetchPolicies()).filter(item => item.status === '已发布' || item.status === 'published') })
</script>
<style lang="scss" scoped>
.mobile-page{width:100%;min-height:100%;box-sizing:border-box;background:#f5f7fa;padding:14px}.mobile-head,.policy-card{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px}.mobile-head{display:flex;align-items:center;justify-content:space-between;color:#1f3c68}.mobile-head b{display:block;font-size:21px}.mobile-head span{display:block;color:#667085;font-size:13px;margin-top:4px}.policy-meta{display:flex;justify-content:space-between;align-items:center;color:#98a2b3;font-size:11px}.policy-card h3{font-size:16px;line-height:1.5;color:#243b5a;margin:12px 0 6px}.policy-card>p{font-size:13px;color:#667085;line-height:1.6;margin:0 0 10px}.policy-content{border-top:1px solid #edf0f5;padding-top:10px;color:#475467;font-size:13px;line-height:1.7}.policy-content :deep(p){margin:0 0 8px}
</style>