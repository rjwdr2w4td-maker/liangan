// 青贮饲料 API（模拟）
import { mockRequest } from './request'
import { SIL_DECLARATIONS, SUPPLEMENT_DECLARATIONS, SIL_FENCES, SIL_LEDGERS, fenceGeoJSON } from '@/mock/sil/declarations'

const filterByRole = (list, role, subjectField = 'subjectId') => {
  if (!role) return []
  if (role.subjectId) return list.filter((i) => i[subjectField] === role.subjectId)
  if (role.regionCode === '340000') return list
  const prefix = role.code === 'city' ? String(role.regionCode).slice(0, 4) : String(role.regionCode || '')
  return prefix ? list.filter((i) => String(i.regionCode || '').startsWith(prefix)) : []
}

// ===== 申报 =====
export const fetchDeclarations = (role) => mockRequest(() => filterByRole(SIL_DECLARATIONS, role))

export const submitDeclaration = (data) =>
  mockRequest(() => {
    const id = `QZ-SB-2026-${String(SIL_DECLARATIONS.length + 1).padStart(4, '0')}`
    SIL_DECLARATIONS.unshift({
      id, year: 2027, status: 'pending', createdAt: new Date().toISOString().slice(0, 10),
      auditTrail: [{ time: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`, action: '提交申报', user: '主体（皖企通/PC端）' }],
      ...data
    })
    return { success: true, id }
  })

export const updateDeclaration = (id, patch) =>
  mockRequest(() => {
    const decl = SIL_DECLARATIONS.find((d) => d.id === id)
    if (decl) Object.assign(decl, patch)
    return { success: true }
  })

// 审核动作
let filedSeq = 8
export const auditDeclaration = (id, action, opinion, auditor) =>
  mockRequest(() => {
    const decl = SIL_DECLARATIONS.find((d) => d.id === id)
    if (!decl) return { success: false }
    const now = new Date()
    const time = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`
    if (action === 'pass') {
      decl.status = 'filed'
      decl.filedNo = `皖青贮备〔2026〕第${String(filedSeq++).padStart(4, '0')}号`
      decl.auditTrail.push({ time, action: '审核通过并生成备案编号', user: auditor, opinion: opinion || '同意备案' })
      // 自动生成数字围栏
      const fence = { id: `FEN-${String(SIL_FENCES.length + 1).padStart(4, '0')}`, filedNo: decl.filedNo, declarationId: decl.id, subjectId: decl.subjectId, subjectName: decl.subjectName, regionCode: decl.regionCode, crop: decl.crop, createdAt: time.slice(0, 10) }
      SIL_FENCES.push(fence)
      return { success: true, filedNo: decl.filedNo }
    }
    if (action === 'return') {
      decl.status = 'returned'
      decl.auditTrail.push({ time, action: '退回补正', user: auditor, opinion: opinion || '请补充材料后重新提交' })
    }
    if (action === 'reject') {
      decl.status = 'rejected'
      decl.auditTrail.push({ time, action: '驳回', user: auditor, opinion: opinion || '涉嫌虚假材料，驳回' })
    }
    return { success: true }
  }, 500)

// ===== 补充收储 =====
export const fetchSupplements = (role) => mockRequest(() => filterByRole(SUPPLEMENT_DECLARATIONS, role))

// ===== 围栏 =====
export const fetchFences = (role) => mockRequest(() => filterByRole(SIL_FENCES, role))

export const fetchFenceGeoJSON = (fence) => mockRequest(() => fenceGeoJSON(fence), 200)

// 围栏外坐标 → 推送监管事件（联动 FSR）
export const pushFenceEvent = (lnglat) =>
  mockRequest(() => ({ success: true, message: '已推送至粮食安全综合监管分系统', eventId: 'EVT-2026-NEW' }), 600)

// ===== 台账 =====
export const fetchLedgers = (role) => mockRequest(() => filterByRole(SIL_LEDGERS, role))
