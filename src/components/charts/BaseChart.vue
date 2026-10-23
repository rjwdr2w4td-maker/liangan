<template>
  <div ref="chartEl" class="base-chart" :style="{ height }" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: { type: Object, required: true },
  height: { type: String, default: '300px' },
  // 深色主题（一张图用）
  dark: { type: Boolean, default: false }
})

const chartEl = ref(null)
let chart = null
let ro = null

const render = () => {
  if (!chartEl.value || !props.option) return
  if (!chart) {
    chart = echarts.init(chartEl.value, null, { renderer: 'canvas' })
  }
  chart.setOption(props.option, true)
}

onMounted(() => {
  nextTick(render)
  ro = new ResizeObserver(() => chart && chart.resize())
  ro.observe(chartEl.value)
})

watch(() => props.option, render, { deep: true })

onUnmounted(() => {
  if (ro) ro.disconnect()
  if (chart) { chart.dispose(); chart = null }
})

defineExpose({ getChart: () => chart })
</script>

<style lang="scss" scoped>
.base-chart { width: 100%; }
</style>
