<template>
  <div class="login-page">
    <!-- CSS 绘制背景：农田山丘 -->
    <div class="bg-layer">
      <div class="sun" />
      <div class="hill hill-1" />
      <div class="hill hill-2" />
      <div class="field-strip" v-for="n in 5" :key="n" :class="`strip-${n}`" />
    </div>

    <div class="login-card">
      <div class="brand">
        <svg class="logo" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#fff"/><path d="M8 22c0-6 4-12 8-14 4 2 8 8 8 14H8z" fill="#0f5eb5"/><path d="M16 8v14M10 16h12" stroke="#fff" stroke-width="1.5"/></svg>
        <h1>安徽省粮食生产安全监测监管平台</h1>
        <p class="sub">粮食计划管理 · 青贮饲料管理 · 粮食安全综合监管 · 农药数字监督管理</p>
      </div>

      <el-tabs v-model="activeTab" stretch>
        <el-tab-pane label="账号登录" name="account">
          <el-form @submit.prevent>
            <el-form-item>
              <el-input v-model="account" size="large" placeholder="请输入账号（演示：任意输入即可）">
                <template #prefix><el-icon><User /></el-icon></template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="password" type="password" size="large" show-password placeholder="请输入密码" @keyup.enter="doLogin">
                <template #prefix><el-icon><Lock /></el-icon></template>
              </el-input>
            </el-form-item>
            <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="doLogin">
              登 录
            </el-button>
            <div class="tip">已接入安徽省统一身份认证 · 演示环境</div>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="演示角色" name="roles">
          <div class="role-list">
            <div v-for="r in DEMO_ROLES" :key="r.code" class="role-row" @click="quickLogin(r.code)">
              <div class="rr-avatar" :style="{ background: r.avatarColor }">{{ r.name.charAt(0) }}</div>
              <div class="rr-info">
                <div class="rr-name">{{ r.name }} <span class="rr-role">{{ r.roleName }}</span></div>
                <div class="rr-unit">{{ r.unit }} · {{ r.regionName }}</div>
              </div>
              <el-icon class="rr-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="footer">安徽省农业农村厅 · 演示原型（数据为模拟数据）</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { DEMO_ROLES } from '@/mock/common/users'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('account')
const account = ref('admin')
const password = ref('123456')
const loading = ref(false)

const doLogin = () => {
  if (!account.value || !password.value) return ElMessage.warning('请输入账号和密码')
  loading.value = true
  setTimeout(() => {
    quickLogin('province')
    loading.value = false
  }, 600)
}

const quickLogin = (code) => {
  // #region debug-point D:quick-login
  fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'role-switch-plan-issue', runId: 'pre', hypothesisId: 'D', location: 'Login.vue:81', msg: '[DEBUG] quick login entered', data: { code }, ts: Date.now() }) }).catch(() => {})
  // #endregion
  userStore.login(code)
  ElMessage.success(`欢迎，${userStore.role.roleName} ${userStore.role.name}`)
  router.push(userStore.role?.homeRoute || '/entry')
}
</script>

<style lang="scss" scoped>
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #7ab8e8 0%, #a8d4a0 55%, #6fae54 100%);
}

.bg-layer { position: absolute; inset: 0; pointer-events: none; }

.sun {
  position: absolute;
  right: 14%;
  top: 9%;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff6cf 30%, #ffe28a 70%);
  box-shadow: 0 0 60px 24px rgba(255, 240, 180, 0.55);
}

.hill {
  position: absolute;
  border-radius: 50%;
  background: #5f9e46;
}
.hill-1 { width: 900px; height: 260px; left: -180px; bottom: 90px; }
.hill-2 { width: 1100px; height: 300px; right: -260px; bottom: 60px; background: #4c8c3b; }

.field-strip {
  position: absolute;
  left: 0;
  right: 0;
  height: 46px;
  background: linear-gradient(180deg, #5aa03f, #4a8a34);
  opacity: 0.85;
  transform: skewY(-1deg);
}
.strip-1 { bottom: 0; }
.strip-2 { bottom: 42px; background: #6cb04c; }
.strip-3 { bottom: 84px; background: #5aa03f; }
.strip-4 { bottom: 126px; background: #6cb04c; }
.strip-5 { bottom: 168px; background: #79bb58; opacity: 0.6; }

.login-card {
  position: relative;
  z-index: 2;
  width: 460px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 30px 36px 26px;
  box-shadow: 0 20px 60px rgba(20, 60, 30, 0.35);

  .brand {
    text-align: center;
    margin-bottom: 10px;

    .logo { width: 52px; height: 52px; margin-bottom: 8px; }
    h1 { font-size: 20px; color: #16324f; letter-spacing: 1px; }
    .sub { font-size: 12px; color: #7d8fa3; margin-top: 6px; letter-spacing: 1px; }
  }
}

.login-btn { width: 100%; margin-top: 4px; letter-spacing: 6px; }
.tip { text-align: center; font-size: 12px; color: #9aa9b8; margin-top: 12px; }

.role-list { max-height: 380px; overflow: auto; margin-top: 6px; }

.role-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e4e9f1;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--ah-primary);
    box-shadow: 0 4px 14px rgba(15, 94, 181, 0.16);
    transform: translateY(-1px);

    .rr-arrow { color: var(--ah-primary); transform: translateX(2px); }
  }

  .rr-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
  }
  .rr-info { flex: 1; min-width: 0; }
  .rr-name { font-size: 14px; font-weight: 600; color: var(--ah-text); }
  .rr-role { font-size: 11px; color: #fff; background: var(--ah-primary); border-radius: 4px; padding: 1px 6px; margin-left: 6px; }
  .rr-unit { font-size: 12px; color: #7d8fa3; margin-top: 2px; }
  .rr-arrow { color: #c2cad6; transition: all 0.2s; }
}

.footer {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  z-index: 2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
