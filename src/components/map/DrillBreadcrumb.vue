<template>
  <div class="drill-breadcrumb">
    <template v-for="(seg, i) in pathList" :key="seg.code">
      <span
        class="seg"
        :class="{ clickable: i < pathList.length - 1, current: i === pathList.length - 1 }"
        @click="i < pathList.length - 1 && $emit('jump', seg)"
      >
        {{ seg.name }}
      </span>
      <el-icon v-if="i < pathList.length - 1" class="sep"><ArrowRight /></el-icon>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { REGION_MAP } from '@/mock/common/regions'

const props = defineProps({
  // 当前下钻区划 code
  code: { type: String, default: '340000' }
})
defineEmits(['jump'])

// 从 code 推导面包屑路径（行政区划编码前缀逐级截断）
const pathList = computed(() => {
  const code = props.code || '340000'
  const levels = [code.slice(0, 2) + '0000', code.slice(0, 4) + '00', code.slice(0, 6), code.slice(0, 9)].filter((c, i, a) => a.indexOf(c) === i)
  return levels.map((c) => REGION_MAP[c]).filter(Boolean)
})
</script>

<style lang="scss" scoped>
.drill-breadcrumb {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 8px;
  padding: 7px 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  font-size: 13px;

  .seg {
    color: var(--ah-text-secondary);
    &.clickable { cursor: pointer; &:hover { color: var(--ah-primary); } }
    &.current { color: var(--ah-primary); font-weight: 600; }
  }
  .sep { color: #b6c2d1; font-size: 12px; }
}
</style>
