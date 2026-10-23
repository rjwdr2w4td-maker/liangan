// 业务字典：作物类型、事件类型、风险等级、状态机等

// 作物类型（含地图着色）
export const CROPS = [
  { code: 'wheat', name: '小麦', color: '#e8b93c' },
  { code: 'rice', name: '水稻', color: '#4caf50' },
  { code: 'corn', name: '玉米', color: '#f2842a' },
  { code: 'soybean', name: '大豆', color: '#8bc34a' },
  { code: 'silage_corn', name: '青贮玉米', color: '#26a69a' },
  { code: 'alfalfa', name: '苜蓿', color: '#7e57c2' }
]

export const CROP_MAP = Object.fromEntries(CROPS.map((c) => [c.code, c]))

// 事件类型
export const EVENT_TYPES = [
  { code: 'baomai', name: '毁麦毁粮', color: '#e64545' },
  { code: 'piaohuang', name: '耕地撂荒', color: '#e67e22' },
  { code: 'feilianghua', name: '非粮化', color: '#c0392b' },
  { code: 'zhangshi', name: '长势异常', color: '#f1c40f' },
  { code: 'weibeian', name: '未备案收割', color: '#9b59b6' }
]

export const EVENT_TYPE_MAP = Object.fromEntries(EVENT_TYPES.map((t) => [t.code, t]))

// 事件来源
export const EVENT_SOURCES = [
  { code: 'remote', name: '遥感识别' },
  { code: 'grid', name: '网格巡查' },
  { code: 'snapshot', name: '随手拍' },
  { code: 'fence', name: '数字围栏联动' },
  { code: 'platform', name: '地方平台推送' }
]

export const EVENT_SOURCE_MAP = Object.fromEntries(EVENT_SOURCES.map((s) => [s.code, s]))

// 风险等级
export const RISK_LEVELS = [
  { code: 'high', name: '高风险', color: '#e64545', tag: 'danger' },
  { code: 'medium', name: '中风险', color: '#e67e22', tag: 'warning' },
  { code: 'low', name: '低风险', color: '#409eff', tag: 'primary' }
]

export const RISK_MAP = Object.fromEntries(RISK_LEVELS.map((r) => [r.code, r]))

// ===== 状态机 =====

// 粮食安全事件状态
export const EVENT_STATUS = {
  pending: { name: '待派发', color: '#e64545', tag: 'danger' },
  checking: { name: '待核查', color: '#e67e22', tag: 'warning' },
  reviewing: { name: '待审核', color: '#409eff', tag: 'primary' },
  rectifying: { name: '整改中', color: '#9b59b6', tag: 'warning' },
  recheck: { name: '待复核', color: '#36cfc9', tag: 'success' },
  closed: { name: '已结案', color: '#67c23a', tag: 'success' }
}

// 青贮申报状态
export const SIL_STATUS = {
  draft: { name: '草稿', color: '#909399', tag: 'info' },
  pending: { name: '待审核', color: '#e6a23c', tag: 'warning' },
  returned: { name: '已退回', color: '#e64545', tag: 'danger' },
  rejected: { name: '已驳回', color: '#8b0000', tag: 'danger' },
  filed: { name: '已备案', color: '#67c23a', tag: 'success' }
}

// 种植计划状态
export const PLAN_STATUS = {
  drafting: { name: '编制中', color: '#909399', tag: 'info' },
  pending: { name: '待审核', color: '#e6a23c', tag: 'warning' },
  issued: { name: '已下达', color: '#0f5eb5', tag: 'primary' },
  implementing: { name: '落实中', color: '#9b59b6', tag: 'warning' },
  completed: { name: '已完成', color: '#67c23a', tag: 'success' }
}

// 主体类型
export const SUBJECT_TYPES = [
  { code: 'big_household', name: '规模大户' },
  { code: 'family_farm', name: '家庭农场' },
  { code: 'cooperative', name: '合作社' },
  { code: 'farmer', name: '普通农户' },
  { code: 'enterprise', name: '农业企业' }
]

export const SUBJECT_TYPE_MAP = Object.fromEntries(SUBJECT_TYPES.map((s) => [s.code, s]))

// 农药主体类型
export const PES_SUBJECT_TYPES = [
  { code: 'produce', name: '生产企业' },
  { code: 'operate', name: '经营网点' },
  { code: 'use', name: '使用主体' },
  { code: 'recycle', name: '回收处理主体' }
]

// 农药毒性
export const TOXICITY = [
  { code: 'low', name: '低毒', tag: 'success' },
  { code: 'medium', name: '中等毒', tag: 'warning' },
  { code: 'high', name: '高毒', tag: 'danger' }
]

// 流向记录类型
export const FLOW_TYPES = [
  { code: 'produce', name: '生产入库' },
  { code: 'purchase', name: '采购入库' },
  { code: 'sale', name: '销售出库' },
  { code: 'buy', name: '购买' },
  { code: 'return', name: '退货' }
]
