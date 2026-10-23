<template>
  <el-tag :type="cfg?.tag || 'info'" :color="solid ? cfg?.color : undefined" :effect="solid ? 'dark' : 'light'" size="small" disable-transitions>
    {{ cfg?.name || text || '未知' }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 字典表：如 EVENT_STATUS
  dict: { type: Object, default: () => ({}) },
  value: { type: String, default: '' },
  text: { type: String, default: '' },
  solid: { type: Boolean, default: false }
})

const cfg = computed(() => props.dict[props.value])
</script>
