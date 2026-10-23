import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/components/layout/Layout.vue'

// 路由模块：全部静态注册 + meta.roles 过滤菜单
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录' }
  },
  // ===== 统一入口（独立全屏页，不套系统后台布局）=====
  {
    path: '/entry',
    name: 'Entry',
    component: () => import('@/views/entry/Entry.vue'),
    meta: { title: '统一入口' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/entry',
    children: [
      { path: 'portal', name: 'Portal', component: () => import('@/views/portal/Portal.vue'), meta: { title: '统一门户工作台', subsystem: 'portal' } },

      // ===== 专项一张图 =====
      {
        path: 'onemap',
        meta: { subsystem: 'onemap' },
        children: [
          { path: 'production', name: 'OnemapProduction', component: () => import('@/views/onemap/ProductionMap.vue'), meta: { title: '粮食生产一张图' } },
          { path: 'safety', name: 'OnemapSafety', component: () => import('@/views/onemap/SafetyMap.vue'), meta: { title: '粮食安全监测一张图' } },
          { path: 'silage', name: 'OnemapSilage', component: () => import('@/views/onemap/SilageMap.vue'), meta: { title: '青贮饲料一张图' } },
          { path: 'pesticide', name: 'OnemapPesticide', component: () => import('@/views/onemap/PesticideMap.vue'), meta: { title: '农药监管一张图' } },
          { path: 'industry', name: 'OnemapIndustry', component: () => import('@/views/onemap/IndustryMap.vue'), meta: { title: '粮食产业布局一张图' } }
        ]
      },

      // ===== 粮食计划管理 =====
      {
        path: 'gpm',
        meta: { subsystem: 'gpm' },
        children: [
          { path: 'plan', name: 'GpmPlan', component: () => import('@/views/gpm/PlanMake.vue'), meta: { title: '种植计划制定', roles: ['province', 'city', 'county'] } },
          { path: 'subjects', name: 'GpmSubjects', component: () => import('@/views/gpm/Subjects.vue'), meta: { title: '种植主体管理' } },
          { path: 'plots', name: 'GpmPlots', component: () => import('@/views/gpm/Plots.vue'), meta: { title: '地块管理' } },
          { path: 'audit', name: 'GpmAudit', component: () => import('@/views/gpm/Audit.vue'), meta: { title: '种植计划审核', roles: ['province', 'city'] } },
          { path: 'supervise', name: 'GpmSupervise', component: () => import('@/views/gpm/Supervise.vue'), meta: { title: '种植计划监督', roles: ['province', 'city', 'county'] } },
          { path: 'stats', name: 'GpmStats', component: () => import('@/views/gpm/Stats.vue'), meta: { title: '计划管理统计' } },
          { path: 'decompose', name: 'GpmDecompose', component: () => import('@/views/gpm/PlanDecompose.vue'), meta: { title: '种植计划下达', roles: ['province', 'city', 'county', 'town', 'subject'] } },
          { path: 'farm-service', name: 'GpmFarmService', component: () => import('@/views/gpm/FarmService.vue'), meta: { title: '农事服务管理' } },
          { path: 'offline-sync', name: 'GpmOfflineSync', component: () => import('@/views/gpm/OfflineSync.vue'), meta: { title: '离线填报同步' } },
          { path: 'implement', name: 'GpmImplement', component: () => import('@/views/gpm/PlanImplement.vue'), meta: { title: '计划落实·按图选地', roles: ['county', 'town'] } },
          { path: 'progress', name: 'GpmProgress', component: () => import('@/views/gpm/Progress.vue'), meta: { title: '进度调度' } },
          { path: 'rank', name: 'GpmRank', component: () => import('@/views/gpm/RankBoard.vue'), meta: { title: '落实进度排行榜', roles: ['province', 'city', 'county'] } },
          { path: 'disaster', name: 'GpmDisaster', component: () => import('@/views/gpm/Disaster.vue'), meta: { title: '防灾减灾' } },
          { path: 'policy', name: 'GpmPolicy', component: () => import('@/views/gpm/Policy.vue'), meta: { title: '惠农政策' } }
        ]
      },

      // ===== 青贮饲料管理 =====
      {
        path: 'sil',
        meta: { subsystem: 'sil' },
        children: [
          { path: 'declare', name: 'SilDeclare', component: () => import('@/views/sil/DeclareList.vue'), meta: { title: '收储申报' } },
          { path: 'audit', name: 'SilAudit', component: () => import('@/views/sil/AuditList.vue'), meta: { title: '县级备案审核', roles: ['province', 'city', 'county'] } },
          { path: 'fence', name: 'SilFence', component: () => import('@/views/sil/FenceMap.vue'), meta: { title: '种植上图·数字围栏' } },
          { path: 'ledger', name: 'SilLedger', component: () => import('@/views/sil/Ledger.vue'), meta: { title: '收储台账' } }
        ]
      },

      // ===== 粮食安全综合监管 =====
      {
        path: 'fsr',
        meta: { subsystem: 'fsr' },
        children: [
          { path: 'events', name: 'FsrEvents', component: () => import('@/views/fsr/EventCenter.vue'), meta: { title: '事件中心' } },
          { path: 'task', name: 'FsrTask', component: () => import('@/views/fsr/TaskDispatch.vue'), meta: { title: '任务派发跟踪' } },
          { path: 'handle', name: 'FsrHandle', component: () => import('@/views/fsr/HandleWorkbench.vue'), meta: { title: '处置工作台', roles: ['city', 'province'] } },
          { path: 'stats', name: 'FsrStats', component: () => import('@/views/fsr/ReviewStats.vue'), meta: { title: '复盘考核统计', roles: ['province', 'city'] } }
        ]
      },

      // ===== 农药数字监督管理 =====
      {
        path: 'pes',
        meta: { subsystem: 'pes' },
        children: [
          { path: 'subjects', name: 'PesSubjects', component: () => import('@/views/pes/SubjectArchives.vue'), meta: { title: '主体档案' } },
          { path: 'ledger', name: 'PesLedger', component: () => import('@/views/pes/LedgerBook.vue'), meta: { title: '电子台账' } },
          { path: 'trace', name: 'PesTrace', component: () => import('@/views/pes/TraceFlow.vue'), meta: { title: '流向追溯' } },
          { path: 'recycle', name: 'PesRecycle', component: () => import('@/views/pes/Recycle.vue'), meta: { title: '包装废弃物回收', roles: ['province', 'city', 'county'] } }
        ]
      },

      { path: '403', name: 'Forbidden', component: () => import('@/views/common/403.vue'), meta: { title: '无权访问' } }
    ]
  },
  // ===== 移动端演示（独立手机壳布局，不走 Layout）=====
  {
    path: '/mobile',
    children: [
      { path: 'check/list', name: 'MobileCheckList', component: () => import('@/views/mobile/CheckTask.vue'), meta: { title: '皖政通·计划管理任务' } },
      { path: 'declare', name: 'MobileDeclare', component: () => import('@/views/mobile/DeclareForm.vue'), meta: { title: '皖企通·主体填报' } },
      { path: 'snapshot', name: 'MobileSnapshot', component: () => import('@/views/mobile/SnapReport.vue'), meta: { title: '随手拍' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/entry' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  document.title = to.meta.title ? `${to.meta.title} - 安徽省粮食生产安全监测监管平台` : '安徽省粮食生产安全监测监管平台'

  if (to.path !== '/login' && !userStore.isLoggedIn) {
    return next('/login')
  }
  if (to.path === '/login' && userStore.isLoggedIn) {
    return next('/entry')
  }
  // 角色权限校验
  if (to.meta.roles && !userStore.hasRole(to.meta.roles)) {
    return next('/403')
  }
  next()
})

export default router
