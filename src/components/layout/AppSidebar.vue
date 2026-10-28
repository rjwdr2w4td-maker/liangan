<template>
  <el-aside class="app-sidebar" :width="collapsed ? '64px' : '220px'">
    <div class="collapse-btn" @click="appStore.toggleSidebar()">
      <el-icon :size="16"><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
    </div>
    <el-scrollbar>
      <!-- 子系统后台：仅展示本系统功能 -->
      <template v-if="systemGroup">
        <el-menu
          :default-active="activeMenu"
          :collapse="collapsed"
          :collapse-transition="false"
          background-color="#ffffff"
          text-color="#5a6d85"
          active-text-color="#1668DC"
          router
        >
          <template v-for="(c, index) in systemGroup.children" :key="c.route">
            <div
              v-if="c.section && (index === 0 || c.section !== systemGroup.children[index - 1].section)"
              class="menu-section-title"
              :class="{ 'is-collapsed': collapsed }"
            >
              {{ c.section }}
            </div>
            <el-menu-item :index="c.route">
              <el-icon><component :is="c.icon" /></el-icon>
              <template #title>{{ c.title }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </template>

      <!-- 门户工作台：跨系统导航 -->
      <el-menu
        v-else
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="#ffffff"
        text-color="#5a6d85"
        active-text-color="#1668DC"
        router
      >
        <template v-for="group in menus" :key="group.title">
          <el-menu-item v-if="!group.children" :index="group.route">
            <el-icon><component :is="group.icon" /></el-icon>
            <template #title>{{ group.title }}</template>
          </el-menu-item>
          <el-sub-menu v-else :index="group.title">
            <template #title>
              <el-icon><component :is="group.icon" /></el-icon>
              <span>{{ group.title }}</span>
            </template>
            <el-menu-item v-for="c in group.children" :key="c.route" :index="c.route">
              <el-icon><component :is="c.icon" /></el-icon>
              <template #title>{{ c.title }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getMenusForRole, getMenusForSystem, getSystemForRoute } from '@/router/menu'

const route = useRoute()
const appStore = useAppStore()
const collapsed = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)

// 门户工作台展示全部导航；进入子系统后仅展示本系统菜单
const currentSystem = computed(() => getSystemForRoute(route.path))
const menus = computed(() => getMenusForRole())
const systemGroup = computed(() => {
  if (currentSystem.value === 'portal') return []
  const groups = getMenusForSystem(currentSystem.value)
  return groups[0] || null
})
</script>

<style lang="scss" scoped>
.app-sidebar {
  background: #fff;
  border-right: 1px solid #e8edf3;
  display: flex;
  flex-direction: column;
  transition: width 0.2s;
  flex-shrink: 0;
  overflow: hidden;
}

.collapse-btn {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8598b3;
  cursor: pointer;

  &:hover { color: #1668DC; background: #f0f6fd; }
}

.menu-section-title {
  height: 28px;
  padding: 10px 18px 0;
  color: #a0aec0;
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
  letter-spacing: 0.5px;
  transition: opacity 0.2s;

  &.is-collapsed {
    width: 64px;
    padding: 10px 0 0;
    color: transparent;
    overflow: hidden;
  }
}

:deep(.el-menu) {
  border-right: none;

  .el-menu-item {
    &:hover { background: #f0f6fd; }
    &.is-active {
      background: #e8f1fd;
      font-weight: 600;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        border-radius: 0 2px 2px 0;
        background: #1668DC;
      }
    }
  }
  .el-sub-menu .el-sub-menu__title:hover { background: #f0f6fd; }
}
</style>
