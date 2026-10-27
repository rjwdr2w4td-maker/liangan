import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { findRole } from '@/mock/common/users'
import { REGION_MAP } from '@/mock/common/regions'

const STORAGE_KEY = 'ah_grain_demo_user'

export const useUserStore = defineStore('user', () => {
  const role = ref(null)

  // 恢复登录态
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) role.value = JSON.parse(saved)
  } catch (e) { /* 忽略 */ }

  const isLoggedIn = computed(() => !!role.value)
  const regionName = computed(() => role.value?.regionName || '')

  // 菜单权限判定
  const hasRole = (roles) => {
    if (!roles || !roles.length) return true
    return roles.includes(role.value?.code)
  }

  // 数据范围过滤（区划前缀 + 主体绑定）
  const canSee = (dataRegionCode, dataSubjectId) => {
    if (!role.value) return false
    // 主体角色只能看自己的数据
    if (role.value.subjectId) return dataSubjectId === role.value.subjectId
    const rc = role.value.regionCode
    if (!rc || rc === '340000') return true
    return String(dataRegionCode || '').startsWith(rc)
  }

  const login = (roleCode) => {
    const r = findRole(roleCode)
    if (!r) return false
    role.value = r
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r))
    return true
  }

  // 免登录切换演示角色（串场演示关键能力）
  const switchRole = (roleCode) => {
    // #region debug-point D:store-switch
    fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'role-switch-plan-issue', runId: 'pre', hypothesisId: 'D', location: 'user.js:45', msg: '[DEBUG] store role switch', data: { roleCode, beforeRole: role.value?.code, roleExists: !!findRole(roleCode) }, ts: Date.now() }) }).catch(() => {})
    // #endregion
    return login(roleCode)
  }

  const logout = () => {
    role.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  const regionPath = computed(() => {
    if (!role.value) return ''
    return REGION_MAP[role.value.regionCode]?.path || role.value.regionName
  })

  return { role, isLoggedIn, regionName, regionPath, hasRole, canSee, login, switchRole, logout }
})
