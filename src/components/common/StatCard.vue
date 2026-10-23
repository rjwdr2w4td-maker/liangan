<template>
  <div class="stat-card" :style="{ '--accent': color }">
    <div class="sc-icon" :style="{ background: color + '1a', color }">
      <el-icon :size="20"><component :is="icon" /></el-icon>
    </div>
    <div class="sc-body">
      <div class="sc-value num">
        {{ value }}<span v-if="unit" class="sc-unit">{{ unit }}</span>
      </div>
      <div class="sc-label">{{ label }}</div>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: 0 },
  unit: { type: String, default: '' },
  icon: { type: String, default: 'DataLine' },
  color: { type: String, default: '#0f5eb5' }
})
</script>

<style lang="scss" scoped>
.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(15, 62, 120, 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent);
  }

  .sc-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sc-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--ah-text);
    line-height: 1.15;

    .sc-unit { font-size: 12px; font-weight: 400; color: var(--ah-text-secondary); margin-left: 3px; }
  }
  .sc-label { font-size: 12.5px; color: var(--ah-text-secondary); margin-top: 3px; }
}
</style>
