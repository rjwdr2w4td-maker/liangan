<template>
  <div class="mobile-nav">
    <div class="status-bar">
      <span>9:41</span>
      <span class="notch" />
      <span class="status-icons">中国移动 ▮▮▮ ⚡</span>
    </div>
    <div class="nav-bar">
      <div class="nav-left" @click="$emit('back')">
        <el-icon v-if="showBack"><ArrowLeft /></el-icon>
        <span class="nav-title">{{ title }}</span>
      </div>
      <div class="nav-right">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true }
})
defineEmits(['back'])
</script>

<style lang="scss" scoped>
.mobile-nav {
  background: #0f5eb5;
  color: #fff;
  flex-shrink: 0;

  .status-bar {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    font-size: 12px;
    font-weight: 600;

    .notch {
      width: 110px;
      height: 20px;
      background: #1a2332;
      border-radius: 0 0 14px 14px;
    }
    .status-icons { font-size: 10px; }
  }

  .nav-bar {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;

    .nav-left {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }
    .nav-title { font-size: 16px; font-weight: 600; }
    .nav-right { display: flex; align-items: center; gap: 10px; }
  }
}
</style>
