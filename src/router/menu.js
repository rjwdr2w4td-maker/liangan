// 菜单配置：与路由 meta 对应，侧栏 = 菜单 ∩ 当前角色
// 每个子系统独立后台，仅保留本系统相关功能；门户工作台展示跨系统导航
import { useUserStore } from '@/stores/user'

export const MENU_CONFIG = [
  {
    title: '工作台',
    icon: 'Monitor',
    route: '/portal',
    system: 'portal'
  },
  {
    title: '粮食计划管理',
    icon: 'DataAnalysis',
    system: 'gpm',
    children: [
      // 基础数据：主体档案与地块台账分开管理
      { title: '种植主体管理', route: '/gpm/subjects', icon: 'OfficeBuilding', section: '基础数据', roles: ['province'] },
      { title: '地块管理', route: '/gpm/plots', icon: 'Grid', section: '基础数据', roles: ['province'] },

      // 计划编制与下达：制定 → 审核 → 下达
      { title: '种植计划制定', route: '/gpm/plan', icon: 'EditPen', section: '计划编制与下达', roles: ['province', 'city', 'county'] },
      { title: '种植计划审核', route: '/gpm/audit', icon: 'Stamp', section: '计划编制与下达', roles: ['province', 'city'] },
      { title: '种植计划下达', route: '/gpm/decompose', icon: 'Share', section: '计划编制与下达', roles: ['province', 'city', 'county', 'town', 'subject'] },

      // 计划落实与调度：落实 → 进度 → 监督 → 排名
      { title: '计划落实·按图选地', route: '/gpm/implement', icon: 'MapLocation', section: '计划落实与调度', roles: ['county', 'town'] },
      { title: '进度调度', route: '/gpm/progress', icon: 'DataLine', section: '计划落实与调度' },
      { title: '种植计划监督', route: '/gpm/supervise', icon: 'Warning', section: '计划落实与调度', roles: ['province', 'city', 'county'] },
      { title: '落实进度排行榜', route: '/gpm/rank', icon: 'Trophy', section: '计划落实与调度', roles: ['province', 'city', 'county'] },

      // 服务保障
      { title: '农事服务管理', route: '/gpm/farm-service', icon: 'Service', section: '服务保障' },
      { title: '惠农政策', route: '/gpm/policy', icon: 'Reading', section: '服务保障' },
      { title: '防灾减灾', route: '/gpm/disaster', icon: 'Umbrella', section: '服务保障' },
      { title: '离线填报同步', route: '/gpm/offline-sync', icon: 'Refresh', section: '服务保障' },

      // 统计分析与一张图
      { title: '计划管理统计', route: '/gpm/stats', icon: 'PieChart', section: '统计分析' },
      { title: '粮食生产一张图', route: '/onemap/production', icon: 'Compass', section: '统计分析' },
      { title: '粮食产业布局一张图', route: '/onemap/industry', icon: 'TrendCharts', section: '统计分析' }
    ]
  },
  {
    title: '青贮饲料管理',
    icon: 'Wheat',
    system: 'sil',
    children: [
      { title: '收储申报', route: '/sil/declare', icon: 'Tickets' },
      { title: '县级备案审核', route: '/sil/audit', icon: 'Stamp', roles: ['province', 'city', 'county'] },
      { title: '种植上图·数字围栏', route: '/sil/fence', icon: 'Grid' },
      { title: '收储台账', route: '/sil/ledger', icon: 'Notebook' },
      { title: '青贮饲料一张图', route: '/onemap/silage', icon: 'Picture' }
    ]
  },
  {
    title: '粮食安全综合监管',
    icon: 'Warning',
    system: 'fsr',
    children: [
      { title: '事件中心', route: '/fsr/events', icon: 'MessageBox' },
      { title: '任务派发跟踪', route: '/fsr/task', icon: 'Position' },
      { title: '处置工作台', route: '/fsr/handle', icon: 'Tools', roles: ['city', 'province'] },
      { title: '复盘考核统计', route: '/fsr/stats', icon: 'PieChart', roles: ['province', 'city'] },
      { title: '粮食安全监测一张图', route: '/onemap/safety', icon: 'DataBoard' }
    ]
  },
  {
    title: '农药数字监督管理',
    icon: 'Aim',
    system: 'pes',
    children: [
      { title: '主体档案', route: '/pes/subjects', icon: 'OfficeBuilding' },
      { title: '电子台账', route: '/pes/ledger', icon: 'DocumentCopy' },
      { title: '流向追溯', route: '/pes/trace', icon: 'Connection' },
      { title: '包装废弃物回收', route: '/pes/recycle', icon: 'Delete', roles: ['province', 'city', 'county'] },
      { title: '农药监管一张图', route: '/onemap/pesticide', icon: 'View' }
    ]
  },
  {
    title: '移动端演示',
    icon: 'Iphone',
    system: 'mobile',
    children: [
      { title: '皖政通·计划管理任务', route: '/mobile/check/list', icon: 'Iphone' },
      { title: '皖企通·主体填报', route: '/mobile/declare', icon: 'Tickets' },
      { title: '随手拍', route: '/mobile/snapshot', icon: 'Camera' }
    ]
  }
]

// 按角色过滤菜单
export function getMenusForRole() {
  const userStore = useUserStore()
  return MENU_CONFIG.map((group) => {
    if (!group.children) {
      return userStore.hasRole(group.roles) ? group : null
    }
    const children = group.children.filter((c) => userStore.hasRole(c.roles))
    return children.length ? { ...group, children } : null
  }).filter(Boolean)
}

// 按子系统获取菜单（独立后台仅展示本系统功能）
export function getMenusForSystem(system) {
  const userStore = useUserStore()
  const group = MENU_CONFIG.find((g) => g.system === system)
  if (!group || !group.children) return []
  const children = group.children.filter((c) => userStore.hasRole(c.roles))
  return children.length ? [{ ...group, children }] : []
}

// 根据路由判断当前所在子系统（一张图按业务归属返回对应系统）
export function getSystemForRoute(path) {
  if (path.startsWith('/portal')) return 'portal'
  for (const group of MENU_CONFIG) {
    if (group.route === path) return group.system
    if (group.children?.some((c) => c.route === path)) return group.system
  }
  if (path.startsWith('/gpm/')) return 'gpm'
  if (path.startsWith('/sil/')) return 'sil'
  if (path.startsWith('/fsr/')) return 'fsr'
  if (path.startsWith('/pes/')) return 'pes'
  return 'portal'
}

// 子系统显示名称（供头部标识等使用）
export const SYSTEM_NAMES = {
  gpm: '粮食计划管理系统',
  sil: '青贮饲料管理系统',
  fsr: '粮食安全综合监管系统',
  pes: '农药数字监督管理系统'
}
