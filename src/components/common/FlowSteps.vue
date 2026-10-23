<template>
  <el-timeline class="flow-steps">
    <el-timeline-item
      v-for="(step, i) in steps"
      :key="i"
      :timestamp="step.time"
      :type="i === steps.length - 1 ? 'primary' : step.type || ''"
      :hollow="false"
      placement="top"
    >
      <div class="fs-title">
        {{ step.action }}
        <span v-if="step.user" class="fs-user">{{ step.user }}</span>
      </div>
      <div v-if="step.opinion" class="fs-opinion">"{{ step.opinion }}"</div>
      <div v-if="step.extra" class="fs-extra">{{ step.extra }}</div>
    </el-timeline-item>
  </el-timeline>
</template>

<script setup>
defineProps({
  // [{ time, action, user, opinion, extra, type }]
  steps: { type: Array, default: () => [] }
})
</script>

<style lang="scss" scoped>
.flow-steps {
  padding-left: 4px;

  .fs-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ah-text);

    .fs-user { font-weight: 400; color: var(--ah-text-secondary); margin-left: 8px; font-size: 12.5px; }
  }
  .fs-opinion { font-size: 12.5px; color: #4a5568; margin-top: 3px; background: #f6f8fb; border-radius: 6px; padding: 5px 8px; }
  .fs-extra { font-size: 12px; color: var(--ah-text-secondary); margin-top: 3px; }
}
</style>
