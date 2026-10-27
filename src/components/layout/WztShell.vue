<template>
  <div class="wzt-page">
    <!-- 左侧导航栏（皖政通全局导航，全站保持不变） -->
    <aside class="side">
      <el-tooltip :content="`${userStore.role?.name} · ${userStore.role?.roleName}`" placement="right">
        <div class="side-avatar" :style="{ background: userStore.role?.avatarColor }">
          {{ userStore.role?.name?.charAt(0) }}
        </div>
      </el-tooltip>

      <div class="side-nav">
        <div
          v-for="n in sideNavs"
          :key="n.label"
          class="side-item"
          :class="{ active: n.label === '首页' && isEntry }"
          @click="onSide(n)"
        >
          <el-icon :size="18"><component :is="n.icon" /></el-icon>
          <span>{{ n.label }}</span>
          <i v-if="n.badge" class="side-badge">{{ n.badge }}</i>
        </div>
      </div>

      <div class="side-bottom">
        <div class="side-item" @click="onSetting">
          <el-icon :size="18"><Setting /></el-icon><span>设置</span>
        </div>
        <div class="side-item" @click="go('/portal')">
          <el-icon :size="18"><Monitor /></el-icon><span>工作台</span>
        </div>
        <div class="side-item" @click="logout">
          <el-icon :size="18"><SwitchButton /></el-icon><span>退出</span>
        </div>
      </div>
    </aside>

    <!-- 右侧主区 -->
    <div class="main">
      <!-- 顶部蓝色渐变栏 -->
      <header class="topbar">
        <div class="tb-user">
          <div class="tb-avatar" :style="{ background: userStore.role?.avatarColor }">
            {{ userStore.role?.name?.charAt(0) }}
          </div>
          <span class="tb-name">{{ userStore.role?.name }}</span>
          <i class="tb-online" title="在线" />
        </div>

        <div class="tb-search">
          <el-input v-model="kw" placeholder="搜索功能或应用" clearable @keyup.enter="onSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <div class="tb-right">
          <el-tooltip content="电话" placement="bottom">
            <div class="tb-icon" @click="onPhone">
              <el-icon :size="16"><Phone /></el-icon>
            </div>
          </el-tooltip>
          <el-badge :value="unreadCount" :hidden="!unreadCount" :max="99">
            <el-tooltip content="消息提醒" placement="bottom">
              <div class="tb-icon" @click="msgVisible = true">
                <el-icon :size="17"><Bell /></el-icon>
              </div>
            </el-tooltip>
          </el-badge>
          <el-dropdown trigger="click" @command="onOrgCommand">
            <div class="tb-org">
              <el-icon :size="15"><OfficeBuilding /></el-icon>
              <span>{{ userStore.role?.unit }}</span>
              <el-icon :size="12"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <el-icon><Location /></el-icon>数据范围：{{ userStore.regionPath }}
                </el-dropdown-item>
                <el-dropdown-item command="portal">
                  <el-icon><Monitor /></el-icon>门户工作台
                </el-dropdown-item>
                <el-dropdown-item command="switchRole">
                  <el-icon><Switch /></el-icon>切换演示角色
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区：入口页 / 各系统后台均渲染在此框架内 -->
      <main class="content">
        <slot />
      </main>
    </div>

    <!-- 切换演示角色 -->
    <el-dialog v-model="roleDialogVisible" title="切换演示角色（免登录串场）" width="640px" append-to-body>
      <div class="role-grid">
        <div
          v-for="r in DEMO_ROLES"
          :key="r.code"
          class="role-card"
          :class="{ active: r.code === userStore.role?.code }"
          @click="chooseRole(r.code)"
        >
          <div class="rc-avatar" :style="{ background: r.avatarColor }">{{ r.name.charAt(0) }}</div>
          <div class="rc-name">{{ r.name }}</div>
          <div class="rc-unit">{{ r.unit }}</div>
          <div class="rc-role">{{ r.roleName }}</div>
          <el-icon v-if="r.code === userStore.role?.code" class="rc-check"><CircleCheckFilled /></el-icon>
        </div>
      </div>
    </el-dialog>

    <!-- 消息中心 -->
    <el-drawer v-model="msgVisible" title="消息提醒" size="360px" append-to-body>
      <div v-for="m in MESSAGES" :key="m.id" class="msg-item" :class="{ unread: !m.read }">
        <div class="msg-dot" />
        <div class="flex-1">
          <div class="msg-title">{{ m.title }}</div>
          <div class="msg-time">{{ m.time }}</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { DEMO_ROLES } from '@/mock/common/users'
import { MESSAGES } from '@/mock/common/messages'
import { getMenusForRole } from '@/router/menu'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const roleDialogVisible = ref(false)
const msgVisible = ref(false)
const kw = ref('')

const isEntry = computed(() => route.path === '/entry')
const unreadCount = computed(() => MESSAGES.filter((m) => !m.read).length)

// 左侧导航（对照皖政通端补充完整图标入口）
const sideNavs = [
  { icon: 'HomeFilled', label: '首页' },
  { icon: 'ChatDotRound', label: '消息', badge: 3 },
  { icon: 'List', label: '待办' },
  { icon: 'MagicStick', label: 'AI皖美' },
  { icon: 'Message', label: '政务邮箱' },
  { icon: 'Promotion', label: '消息必达' },
  { icon: 'VideoCamera', label: '视频会议' },
  { icon: 'Folder', label: '文件' },
  { icon: 'Picture', label: '相册' }
]
const onSide = (n) => {
  if (n.label === '首页') { go('/entry'); return }
  ElMessage.info(`「${n.label}」为皖政通端演示入口，暂未接入`)
}
const onSetting = () => ElMessage.info('设置为皖政通端演示入口，暂未接入')
const onPhone = () => ElMessage.info('电话为皖政通端演示入口，暂未接入')

// 顶部全局搜索：跨系统匹配功能菜单并跳转
const onSearch = () => {
  const key = kw.value.trim()
  if (!key) return
  const all = getMenusForRole().flatMap((g) => (g.children ? g.children : [g]))
  const hit = all.find((c) => (c.title || '').includes(key))
  if (hit) router.push(hit.route)
  else ElMessage.warning('未找到相关功能')
}

const chooseRole = (code) => {
  // #region debug-point D:role-switch
  fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'role-switch-plan-issue', runId: 'pre', hypothesisId: 'D', location: 'WztShell.vue:181', msg: '[DEBUG] role switch entered', data: { code, beforeRole: userStore.role?.code }, ts: Date.now() }) }).catch(() => {})
  // #endregion
  const switched = userStore.switchRole(code)
  if (!switched) {
    ElMessage.error('角色切换失败')
    return
  }
  roleDialogVisible.value = false
  ElMessage.success(`已切换为「${userStore.role.roleName}」`)
  // 皖企通主体切换后直接进入移动端首页，管理角色仍回到统一入口
  router.push(userStore.role?.subjectId ? '/mobile/wanqitong' : '/entry')
}

const onOrgCommand = (cmd) => {
  if (cmd === 'portal') go('/portal')
  if (cmd === 'switchRole') roleDialogVisible.value = true
  if (cmd === 'logout') logout()
}

const go = (path) => router.push(path)
const logout = () => { userStore.logout(); router.push('/login') }
</script>

<style lang="scss" scoped>
// 皖政通 PC 端统一外壳：浅色左侧导航 + 蓝色渐变顶栏
$accent: #1668DC;

.wzt-page {
  height: 100%;
  display: flex;
  overflow: hidden;
  background: #f5f7fa;
}

/* ===== 左侧导航栏 ===== */
.side {
  width: 78px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e8edf3;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 0 12px;
}

.side-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}

.side-nav {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar { width: 0; }
}

.side-item {
  position: relative;
  width: 62px;
  padding: 9px 0 7px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #5a6d85;
  cursor: pointer;
  transition: all 0.15s;

  span { font-size: 11px; line-height: 1; }

  &:hover { color: $accent; background: #f0f6fd; }
  &.active { color: $accent; background: #e8f1fd; font-weight: 600; }
}

.side-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  min-width: 15px;
  height: 15px;
  padding: 0 3px;
  border-radius: 8px;
  background: #f2455d;
  color: #fff;
  font-size: 10px;
  font-style: normal;
  line-height: 15px;
  text-align: center;
}

.side-bottom {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  border-top: 1px solid #e8edf3;
  padding-top: 10px;
}

/* ===== 主区 ===== */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部蓝色渐变栏 */
.topbar {
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 20px;
  color: #fff;
  background: linear-gradient(90deg, #1a6fe0 0%, $accent 55%, #0f55b8 100%);
  box-shadow: 0 2px 8px rgba(16, 49, 95, 0.18);
}

.tb-user { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tb-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
}
.tb-name { font-size: 14px; font-weight: 600; white-space: nowrap; }
.tb-online {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3ddc84;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
}

.tb-search {
  flex: 1;
  max-width: 360px;
  margin-left: auto;

  :deep(.el-input__wrapper) { border-radius: 17px; background: rgba(255, 255, 255, 0.22); box-shadow: none; }
  :deep(.el-input__inner) { color: #fff; }
  :deep(.el-input__inner::placeholder) { color: rgba(255, 255, 255, 0.65); }
  :deep(.el-input__prefix .el-icon) { color: rgba(255, 255, 255, 0.85); }
  :deep(.el-input__suffix .el-icon) { color: rgba(255, 255, 255, 0.85); }
}

.tb-right { display: flex; align-items: center; gap: 16px; }

.tb-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { background: rgba(255, 255, 255, 0.18); }
}

.tb-org {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  outline: none;

  &:hover { background: rgba(255, 255, 255, 0.14); }
  span { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}

/* 内容区：由各页面自行组织滚动与布局 */
.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 切换角色卡片 */
.role-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.role-card {
  position: relative;
  border: 1.5px solid var(--ah-border);
  border-radius: 10px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: var(--ah-primary-light); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(15, 94, 181, 0.15); }
  &.active { border-color: var(--ah-primary); background: #eef5fd; }

  .rc-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    margin: 0 auto 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }
  .rc-name { font-size: 14px; font-weight: 600; }
  .rc-unit { font-size: 12px; color: var(--ah-text-secondary); margin-top: 2px; }
  .rc-role { font-size: 12px; color: var(--ah-primary); margin-top: 4px; }
  .rc-check { position: absolute; top: 8px; right: 8px; color: var(--ah-primary); font-size: 18px; }
}

.msg-item {
  display: flex;
  gap: 10px;
  padding: 12px 4px;
  border-bottom: 1px solid var(--ah-border);
  cursor: pointer;

  .msg-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #d4dae2;
    margin-top: 6px;
    flex-shrink: 0;
  }
  &.unread .msg-dot { background: var(--ah-danger); }
  &.unread .msg-title { font-weight: 600; }

  .msg-title { font-size: 13px; color: var(--ah-text); }
  .msg-time { font-size: 12px; color: var(--ah-text-secondary); margin-top: 2px; }
}

@media (max-width: 860px) {
  .tb-search, .tb-org span { display: none; }
}
</style>
