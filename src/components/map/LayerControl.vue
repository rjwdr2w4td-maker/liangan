<template>
  <div class="layer-control" :class="{ collapsed: !expanded }">
    <div class="lc-header" @click="expanded = !expanded">
      <el-icon :size="14"><LayerIcon /></el-icon>
      <span v-if="expanded">图层</span>
    </div>
    <div v-show="expanded" class="lc-body">
      <div v-for="layer in layers" :key="layer.id" class="lc-item">
        <el-checkbox
          :model-value="layer.visible"
          size="small"
          @change="(v) => $emit('toggle', layer.id, v)"
        >
          <span class="lc-name">
            <span class="lc-color" :style="{ background: layer.color }" />
            {{ layer.name }}
          </span>
        </el-checkbox>
        <el-slider
          v-if="layer.visible && layer.opacity !== undefined"
          :model-value="layer.opacity"
          :min="0.2"
          :max="1"
          :step="0.1"
          size="small"
          class="lc-slider"
          @update:model-value="(v) => $emit('opacity', layer.id, v)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Files as LayerIcon } from '@element-plus/icons-vue'

defineProps({
  layers: { type: Array, default: () => [] }
})
defineEmits(['toggle', 'opacity'])

const expanded = ref(true)
</script>

<style lang="scss" scoped>
.layer-control {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 500;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  min-width: 46px;
  max-width: 190px;
  overflow: hidden;

  .lc-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: var(--ah-text);
    &:hover { background: #f2f6fb; }
  }

  .lc-body { padding: 2px 10px 10px; max-height: 320px; overflow: auto; }

  .lc-item { padding: 2px 0; }

  .lc-name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;

    .lc-color {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      flex-shrink: 0;
      border: 1px solid rgba(0, 0, 0, 0.15);
    }
  }

  .lc-slider { margin: 0 0 4px 22px; width: 110px; }
}
</style>
