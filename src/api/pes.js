// 农药监管 API（模拟）
import { mockRequest } from './request'
import { PES_SUBJECTS, PES_PRODUCTS, PES_BATCHES, PES_FLOWS, PES_RECYCLES, PES_MONTHLY_STATS, PES_PRODUCT_MAP, PES_BATCH_MAP } from '@/mock/pes/data'

const filterByRole = (list, role) => {
  if (!role) return []
  if (role.subjectId) return list.filter((i) => i.from === role.subjectId || i.to === role.subjectId)
  if (role.regionCode === '340000') return list
  return list.filter((i) => {
    const from = PES_SUBJECTS.find((s) => s.id === i.from)
    const to = PES_SUBJECTS.find((s) => s.id === i.to)
    const rc = from?.regionCode || to?.regionCode
    return String(rc || '').startsWith(role.regionCode)
  })
}

// ===== 主体 =====
export const fetchPesSubjects = (role, type) =>
  mockRequest(() => {
    let list = PES_SUBJECTS
    if (role?.subjectId) list = list.filter((s) => s.id === role.subjectId)
    else if (role && role.regionCode !== '340000') list = list.filter((s) => s.regionCode.startsWith(role.regionCode.slice(0, 6)))
    return type ? list.filter((s) => s.type === type) : list
  })

// ===== 产品与批次 =====
export const fetchProducts = () => mockRequest(() => PES_PRODUCTS)
export const fetchBatches = () => mockRequest(() => PES_BATCHES)

// 模拟扫码：随机返回一个批次（演示）
export const scanQR = () =>
  mockRequest(() => {
    const batch = PES_BATCHES[Math.floor(Math.random() * PES_BATCHES.length)]
    const product = PES_PRODUCT_MAP[batch.productId]
    return { batch, product }
  }, 1500)

// ===== 台账（流向记录）=====
export const fetchFlows = (role, filters = {}) =>
  mockRequest(() =>
    filterByRole(PES_FLOWS, role).filter((f) => {
      if (filters.batchId && f.batchId !== filters.batchId) return false
      if (filters.type && f.type !== filters.type) return false
      return true
    })
  )

// 新增台账记录（入库/出库/购买）
export const addFlow = (data) =>
  mockRequest(() => {
    PES_FLOWS.unshift({ id: `FLW-${String(PES_FLOWS.length + 1).padStart(4, '0')}`, date: new Date().toISOString().slice(0, 10), ...data })
    return { success: true }
  })

// 库存计算（演示：生产+采购-销售）
export const calcStock = (batchId, subjectId) =>
  mockRequest(() => {
    const flows = PES_FLOWS.filter((f) => f.batchId === batchId)
    let stock = 0
    flows.forEach((f) => {
      if ((f.type === 'produce' || f.type === 'purchase') && f.to === subjectId) stock += f.qty
      if (f.type === 'sale' && f.from === subjectId) stock -= f.qty
      if (f.type === 'return' && f.to === subjectId) stock += f.qty
    })
    return { stock: Math.max(0, stock) }
  }, 400)

// ===== 流向追溯 =====
// 构建链路：以批次为线索聚合 from→to
export const fetchTraceFlow = (batchId) =>
  mockRequest(() => {
    const batch = PES_BATCH_MAP[batchId]
    if (!batch) return null
    const product = PES_PRODUCT_MAP[batch.productId]
    const flows = PES_FLOWS.filter((f) => f.batchId === batchId)
    const nodes = []
    const links = []
    const nodeMap = {}
    const ensureNode = (id) => {
      if (!id) id = 'UNKNOWN'
      if (nodeMap[id]) return id
      const subject = PES_SUBJECTS.find((s) => s.id === id)
      nodeMap[id] = true
      nodes.push({
        id,
        name: subject?.name || '未知购买方',
        type: subject?.type || 'unknown',
        status: subject?.status || ''
      })
      return id
    }
    flows.forEach((f) => {
      const from = ensureNode(f.from)
      const to = ensureNode(f.to)
      links.push({ from, to, qty: f.qty, type: f.type, date: f.date, breakPoint: f.breakPoint, realName: f.realName })
    })
    return { batch, product, nodes, links }
  })

// ===== 回收 =====
export const fetchRecycles = (role) => mockRequest(() => {
  if (role && role.regionCode !== '340000') return PES_RECYCLES.filter((r) => r.regionCode.startsWith(role.regionCode.slice(0, 4)))
  return PES_RECYCLES
})

// ===== 月度统计 =====
export const fetchMonthlyStats = () => mockRequest(() => PES_MONTHLY_STATS)
