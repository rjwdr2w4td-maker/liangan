<template>
  <WztShell>
    <div class="sys-frame">
      <!-- 面包屑 + 页签（在统一入口框架内打开系统） -->
      <div class="frame-bar">
        <div class="crumb">首页 <span>/</span> {{ frameName }}</div>
        <div class="tabbar">
          <div class="tab" @click="$router.push('/entry')">首页</div>
          <div class="tab active">{{ frameName }}</div>
        </div>
      </div>

      <!-- 系统功能导航 + 页面内容 -->
      <div class="frame-body">
        <AppSidebar />
        <el-main class="app-main">
          <router-view v-slot="{ Component }">
            <keep-alive :include="keepAliveList">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </div>
    </div>
  </WztShell>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import WztShell from './WztShell.vue'
import AppSidebar from './AppSidebar.vue'
import { getSystemForRoute, SYSTEM_NAMES } from '@/router/menu'

const route = useRoute()
// 一张图页面不做 keep-alive（地图组件销毁重建更稳）
const keepAliveList = computed(() => (route.path.startsWith('/onemap') ? [] : undefined))
// 当前所在子系统名称（门户工作台兜底）
const frameName = computed(() => SYSTEM_NAMES[getSystemForRoute(route.path)] || '门户工作台')
</script>

<style lang="scss" scoped>
$accent: #1668DC;

.sys-frame {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.frame-bar {
  padding: 14px 22px 0;
  flex-shrink: 0;
}

.crumb {
  font-size: 12px;
  color: #8598b3;
  margin-bottom: 8px;

  span { margin: 0 4px; }
}

.tabbar {
  display: flex;
  align-items: center;
  gap: 26px;
  border-bottom: 1px solid #e8edf3;
  padding: 2px 2px 0;
}

.tab {
  position: relative;
  font-size: 14px;
  color: #5a6d85;
  padding: 8px 2px 10px;
  cursor: pointer;

  &:hover { color: $accent; }

  &.active {
    color: $accent;
    font-weight: 600;
    cursor: default;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 2.5px;
      border-radius: 2px;
      background: $accent;
    }
  }
}

.frame-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-main {
  flex: 1;
  padding: 0;
  position: relative;
  overflow: hidden;
  background: var(--ah-bg);
}
</style>
