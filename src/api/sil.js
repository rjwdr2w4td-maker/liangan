// 青贮业务 API（浏览器 mock：数据保存于 localStorage）
import { mockRequest } from './request'
import { SIL_DECLARATIONS, SUPPLEMENT_DECLARATIONS, SIL_FENCES, SIL_LEDGERS, fenceGeoJSON } from '@/mock/sil/declarations'
import { GROW_SUBJECTS, PLOTS, SUBJECT_MAP } from '@/mock/geo/plot-gen'

const KEYS = { declarations: 'ah_sil_declarations', supplements: 'ah_sil_supplements', plots: 'ah_sil_plots', ledgers: 'ah_sil_ledgers', fences: 'ah_sil_fences', growers: 'ah_sil_growers' }
const clone = (v) => JSON.parse(JSON.stringify(v))
const read = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : clone(fallback) } catch { return clone(fallback) } }
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const now = () => new Date().toISOString().replace('T', ' ').slice(0, 16)
const finitePositive = (v, label) => { if (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) || Number(v) <= 0) throw new Error(`${label}必须为正数`) ; return Number(v) }
const roleCanAudit = (role) => ['province', 'city', 'county', 'wanzhengtong'].includes(role?.code)
const inScope = (item, role) => {
  if (!role) return false
  if (role.subjectId) return item.subjectId === role.subjectId
  if (!role.regionCode || role.regionCode === '340000') return true
  return String(item.regionCode || '').startsWith(String(role.regionCode).slice(0, role.code === 'city' ? 4 : String(role.regionCode).length))
}
const declarations = () => [...read(KEYS.declarations, SIL_DECLARATIONS), ...read(KEYS.supplements, SUPPLEMENT_DECLARATIONS)]
const saveDeclarations = (all) => { write(KEYS.declarations, all.filter((d) => !d.isSupplement)); write(KEYS.supplements, all.filter((d) => d.isSupplement)) }
const normalizeRole = (role) => role || {}
const subjectFor = (role, subjectId) => GROW_SUBJECTS.find((s) => s.id === subjectId) || GROW_SUBJECTS.find((s) => s.id === role?.subjectId)
const validateGeometry = (geometry) => {
  const ring = geometry?.type === 'Polygon' ? geometry.coordinates?.[0] : null
  if (!Array.isArray(ring) || ring.length < 4 || JSON.stringify(ring[0]) !== JSON.stringify(ring[ring.length - 1])) throw new Error('地块必须是闭合多边形')
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
  for (let i = 0; i < ring.length - 1; i++) for (let j = i + 1; j < ring.length - 1; j++) {
    if (Math.abs(i - j) <= 1 || (i === 0 && j === ring.length - 2)) continue
    const a = ring[i], b = ring[i + 1], c = ring[j], d = ring[j + 1]
    if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) throw new Error('地块边界不能自交')
  }
  return ring
}
const validatePlotRole = (role, subjectId) => {
  if (!role || (!role.subjectId && !['county', 'wanzhengtong'].includes(role.code))) throw new Error('仅主体本人或县级代办可维护地块')
  if (role.subjectId && role.subjectId !== subjectId) throw new Error('无权维护其他主体地块')
  const subject = SUBJECT_MAP[subjectId]
  if (!subject || (role.code === 'county' && !String(subject.regionCode).startsWith(String(role.regionCode)))) throw new Error('主体不在当前管理范围')
  return subject
}

const growerRecords = (role) => {
  const declarationsBySubject = declarations().filter((item) => item.status === 'filed')
  const ledgersBySubject = ledgerList()
  return read(KEYS.growers, GROW_SUBJECTS).filter((subject) => inScope(subject, role)).map((subject) => {
    const declarations = declarationsBySubject.filter((item) => item.subjectId === subject.id)
    const ledgers = ledgersBySubject.filter((item) => item.subjectId === subject.id)
    const latest = declarations.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0]
    const ledger = ledgers.sort((a, b) => String(b.year || '').localeCompare(String(a.year || '')))[0]
    return { ...subject, silageArea: declarations.reduce((sum, item) => sum + Number(item.area ?? item.supplementArea ?? 0), 0), expectedYield: declarations.reduce((sum, item) => sum + Number(item.expectedYield || 0), 0), storedWeight: ledgers.reduce((sum, item) => sum + Number(item.weight || 0), 0), declarationCount: declarations.length, latestFiledNo: latest?.filedNo || '', latestStatus: latest?.status || '未申报', latestYear: latest?.year || ledger?.year || '' }
  })
}

export const fetchSilSubjects = (role) => mockRequest(() => GROW_SUBJECTS.filter((s) => inScope(s, role)).map(({ id, name, regionCode }) => ({ id, name, regionCode })))
export const fetchSilGrowers = (role, filters = {}) => mockRequest(() => growerRecords(role).filter((item) => (!filters.keyword || `${item.id}${item.name}${item.owner}${item.phone}`.includes(filters.keyword)) && (!filters.status || item.status === filters.status) && (!filters.crop || item.primaryCrop === filters.crop)))
export const saveSilGrower = (data, role) => mockRequest(() => {
  if (role?.code !== 'province') return { success: false, message: '仅省级账户可维护种植户信息' }
  if (!data.name || !data.owner || !data.phone || !data.regionCode) return { success: false, message: '请完善种植户名称、负责人、联系电话和所属区域' }
  const list = read(KEYS.growers, GROW_SUBJECTS)
  const item = { ...data, id: data.id || `SUB-${String(Date.now()).slice(-6)}`, type: data.type || 'big_household', primaryCrop: data.primaryCrop || '青贮玉米', status: data.status || '启用', regionCode: String(data.regionCode) }
  write(KEYS.growers, [item, ...list.filter((row) => row.id !== item.id)])
  return { success: true, id: item.id }
})
export const fetchSilPlots = (role, subjectId) => mockRequest(() => {
  const list = read(KEYS.plots, PLOTS)
  return list.filter((p) => (!subjectId || p.subjectId === subjectId) && inScope(p, role)).map((p) => ({ ...p, geometry: p.geometry ? clone(p.geometry) : null }))
})
export const saveSilPlot = (data, role) => mockRequest(() => {
  try {
    const subject = validatePlotRole(role, data.subjectId)
    const ring = validateGeometry(data.geometry)
    const areaMu = finitePositive(data.areaMu, '面积')
    if (areaMu > Number(subject.area) * 1.2) throw new Error('地块面积超出主体权属范围')
    const list = read(KEYS.plots, PLOTS)
    const id = data.id || `SIL-PL-${Date.now()}`
    const item = { ...data, id, name: data.name || '自绘地块', subjectId: subject.id, regionCode: subject.regionCode, geometry: { type: 'Polygon', coordinates: [ring] }, areaMu }
    const index = list.findIndex((p) => p.id === id); if (index >= 0) list[index] = { ...list[index], ...item }; else list.push(item)
    write(KEYS.plots, list); return { success: true, id }
  } catch (e) { return { success: false, message: e.message } }
})
export const deleteSilPlot = (id, role) => mockRequest(() => {
  try {
    const list = read(KEYS.plots, PLOTS); const plot = list.find((p) => p.id === id); if (!plot) throw new Error('地块不存在')
    validatePlotRole(role, plot.subjectId)
    if (declarations().some((d) => (d.plotIds || []).includes(id)) || read(KEYS.ledgers, SIL_LEDGERS).some((l) => (l.plotIds || []).includes(id))) throw new Error('已关联申报或台账地块不可删除')
    write(KEYS.plots, list.filter((p) => p.id !== id)); return { success: true }
  } catch (e) { return { success: false, message: e.message } }
})

export const fetchDeclarations = (role) => mockRequest(() => declarations().filter((d) => inScope(d, role)))
export const fetchSupplements = (role) => mockRequest(() => read(KEYS.supplements, SUPPLEMENT_DECLARATIONS).filter((d) => inScope(d, role)))
export const submitDeclaration = (data, role) => saveDeclaration(data, role, true)
export const updateDeclaration = (id, patch, role) => saveDeclaration({ ...declarations().find((d) => d.id === id), ...patch, id }, role, patch.submit !== false)
export const saveDeclaration = (data, role, submit = false) => mockRequest(() => {
  try {
    const r = normalizeRole(role); const subject = subjectFor(r, data.subjectId); if (!subject || (!r.subjectId && !['county', 'wanzhengtong'].includes(r.code))) throw new Error('无权操作该主体申报')
    if (r.subjectId && r.subjectId !== subject.id) throw new Error('只能操作本人申报')
    const all = declarations(); const old = data.id && all.find((d) => d.id === data.id); const isSupplement = !!data.isSupplement
    const area = finitePositive(isSupplement ? data.supplementArea : data.area, isSupplement ? '补充面积' : '申报面积')
    if (data.expectedYield !== undefined && data.expectedYield !== '' ) finitePositive(data.expectedYield, '预计产量')
    if (data.price !== undefined && data.price !== '') finitePositive(data.price, '价格')
    const item = { ...(old || {}), ...data, id: data.id || `${isSupplement ? 'QZ-BC' : 'QZ-SB'}-${Date.now()}`, subjectId: subject.id, subjectName: subject.name, regionCode: subject.regionCode, area: isSupplement ? undefined : area, supplementArea: isSupplement ? area : undefined, status: submit ? 'pending' : (old?.status === 'returned' ? 'returned' : 'draft'), createdAt: old?.createdAt || now().slice(0, 10), auditTrail: old?.auditTrail || [] }
    if (submit) { item.status = 'pending'; item.auditTrail = [...item.auditTrail, { time: now(), action: old?.status === 'returned' ? '补正重提' : '提交申报', user: `${r.name || '用户'}（${r.roleName || r.code || '浏览器模拟'}）` }] }
    saveDeclarations([item, ...all.filter((d) => d.id !== item.id)]); return { success: true, id: item.id }
  } catch (e) { return { success: false, message: e.message } }
})

let filedSeq = 20
export const auditDeclaration = (id, action, opinion, role) => mockRequest(() => {
  if (!roleCanAudit(role)) return { success: false, message: '仅省市县角色可审核' }
  const all = declarations(); const item = all.find((d) => d.id === id); if (!item || !inScope(item, role)) return { success: false, message: '无权审核该申报' }
  if (item.status !== 'pending') return { success: false, message: '当前状态不可审核' }
  if (item.submittedBy?.code === role.code && item.submittedBy?.name === role.name) return { success: false, message: '不得审核本人提交的数据' }
  if (action !== 'pass' && !String(opinion || '').trim()) return { success: false, message: '退回或驳回必须填写意见' }
  item.status = action === 'pass' ? 'filed' : action === 'return' ? 'returned' : 'rejected'; item.auditTrail = [...(item.auditTrail || []), { time: now(), action: action === 'pass' ? '审核通过并生成备案编号' : action === 'return' ? '退回补正' : '驳回', user: `${role.name}（${role.roleName}）`, opinion: opinion || '同意备案' }]
  if (action === 'pass') { item.filedNo = `${item.isSupplement ? '皖青贮补' : '皖青贮备'}〔${item.year || new Date().getFullYear()}〕第${String(filedSeq++).padStart(4, '0')}号`; const fences = read(KEYS.fences, SIL_FENCES); fences.push({ id: `FEN-${Date.now()}`, declarationId: item.id, filedNo: item.filedNo, subjectId: item.subjectId, subjectName: item.subjectName, regionCode: item.regionCode, plotIds: item.plotIds || [], crop: item.crop, createdAt: now().slice(0, 10) }); write(KEYS.fences, fences) }
  saveDeclarations(all); return { success: true, filedNo: item.filedNo }
})
export const fetchFiledDeclarations = (role) => mockRequest(() => declarations().filter((d) => d.status === 'filed' && inScope(d, role)).map((d) => ({ id: d.id, subjectId: d.subjectId, subjectName: d.subjectName, regionCode: d.regionCode, year: d.year, filedNo: d.filedNo, plotIds: d.plotIds || [], area: d.area ?? d.supplementArea, expectedYield: d.expectedYield, isSupplement: !!d.isSupplement })))
export const fetchFences = (role) => mockRequest(() => read(KEYS.fences, SIL_FENCES).filter((f) => inScope(f, role)))
export const fetchFenceGeoJSON = (fence) => mockRequest(() => fence.geometry ? { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { fenceId: fence.id, plotId: fence.plotIds?.[0], plotName: fence.plotName || '自绘地块', areaMu: fence.areaMu, subjectName: fence.subjectName, filedNo: fence.filedNo }, geometry: fence.geometry }] } : fenceGeoJSON(fence), 200)
export const pushFenceEvent = (lnglat) => mockRequest(() => ({ success: true, message: '已推送至粮食安全综合监管分系统', eventId: 'EVT-2026-NEW' }), 600)

const ledgerList = () => read(KEYS.ledgers, SIL_LEDGERS)
export const fetchLedgers = (role) => mockRequest(() => ledgerList().filter((l) => inScope(l, role)))
export const saveLedger = (data, role) => mockRequest(() => {
  try {
    if (!role) throw new Error('缺少当前角色'); const filed = declarations().find((d) => (d.id === data.declarationId || d.filedNo === data.filedNo) && d.status === 'filed'); if (!filed) throw new Error('只能为已备案申报填报台账')
    if (!inScope(filed, role)) throw new Error('无权填报该备案台账')
    ;['actualArea', 'actualYield', 'weight', 'price'].forEach((k) => { if (data[k] !== undefined && data[k] !== '') finitePositive(data[k], k) })
    if (Number(data.weight) > Number(data.actualYield)) throw new Error('收储重量不得超过实际产量')
    if (data.sowingTime && data.harvestTime && data.sowingTime > data.harvestTime) throw new Error('日期顺序不正确')
    if (data.harvestTime && data.storageTime && data.harvestTime > data.storageTime) throw new Error('日期顺序不正确')
    const list = ledgerList(); if (!data.id && list.some((l) => l.declarationId === data.declarationId)) throw new Error('同一备案不可重复新增台账')
    const old = list.find((l) => l.id === data.id); if (old && !['draft', 'returned'].includes(old.auditStatus)) throw new Error('已审核台账不可直接修改，请重新提交审核')
    const item = { ...(old || {}), ...data, id: data.id || `TZ-${Date.now()}`, declarationId: filed.id, filedNo: filed.filedNo, subjectId: filed.subjectId, subjectName: filed.subjectName, regionCode: filed.regionCode, year: filed.year, planArea: filed.area, expectedYield: filed.expectedYield, isSupplement: filed.isSupplement, amount: Number(data.weight || 0) * Number(data.price || 0) / 10000, auditStatus: data.submit ? 'pending' : 'draft', status: Number(data.weight || 0) > 0 ? '已完成' : '收储中', submittedBy: { code: role.code, name: role.name }, auditTrail: [...(old?.auditTrail || []), { time: now(), action: data.submit ? '提交台账审核' : '保存台账草稿', user: `${role.name}（${role.roleName || role.code}）` }] }
    write(KEYS.ledgers, [item, ...list.filter((l) => l.id !== item.id)]); return { success: true, message: data.submit ? '已提交待审核' : '草稿已保存', id: item.id }
  } catch (e) { return { success: false, message: e.message } }
})
export const auditLedger = (id, action, opinion, role) => mockRequest(() => {
  if (!roleCanAudit(role)) return { success: false, message: '仅省市县角色可审核台账' }; const list = ledgerList(); const item = list.find((l) => l.id === id); if (!item || item.auditStatus !== 'pending' || !inScope(item, role)) return { success: false, message: '台账状态或权限不符合审核条件' }; if (item.submittedBy?.code === role.code && item.submittedBy?.name === role.name) return { success: false, message: '不得审核自己提交的台账' }; if (action !== 'pass' && !String(opinion || '').trim()) return { success: false, message: '退回或驳回必须填写意见' }; item.auditStatus = action === 'pass' ? 'approved' : action === 'return' ? 'returned' : 'rejected'; item.auditTrail = [...(item.auditTrail || []), { time: now(), action: action === 'pass' ? '台账审核通过' : action === 'return' ? '台账退回' : '台账驳回', user: `${role.name}（${role.roleName}）`, opinion }]; write(KEYS.ledgers, list); return { success: true }
})
export const deleteLedger = (id, role) => mockRequest(() => { const list = ledgerList(); const item = list.find((l) => l.id === id); if (!item || !inScope(item, role)) return { success: false, message: '无权删除' }; if (!['draft', 'returned'].includes(item.auditStatus)) return { success: false, message: '仅草稿或退回台账可删除' }; write(KEYS.ledgers, list.filter((l) => l.id !== id)); return { success: true } })

export const submitSupplement = (data, role) => mockRequest(() => {
  try {
    const r = normalizeRole(role); const subject = subjectFor(r, data.subjectId)
    if (!subject || (r.subjectId && r.subjectId !== subject.id)) throw new Error('只能提交本人受灾补充收储')
    if (!r.subjectId && !['county', 'wanzhengtong'].includes(r.code)) throw new Error('无权提交受灾补充收储')
    ;[['affectedArea', '受灾面积'], ['lostArea', '损失面积'], ['supplementArea', '补充收储面积']].forEach(([key, label]) => finitePositive(data[key], label))
    if (Number(data.lostArea) > Number(data.affectedArea) || Number(data.supplementArea) > Number(data.lostArea)) throw new Error('受灾面积、损失面积和补充收储面积关系不正确')
    const list = read(KEYS.supplements, SUPPLEMENT_DECLARATIONS); const item = { ...data, id: data.id || `QZ-BC-${Date.now()}`, subjectId: subject.id, subjectName: subject.name, regionCode: subject.regionCode, isSupplement: true, status: 'pending', createdAt: now().slice(0, 10), auditTrail: [...(data.auditTrail || []), { time: now(), action: '提交受灾补充收储', user: `${r.name || '用户'}（${r.roleName || r.code || '主体'}）` }] }
    write(KEYS.supplements, [item, ...list.filter((x) => x.id !== item.id)]); return { success: true, id: item.id }
  } catch (e) { return { success: false, message: e.message } }
})

export const auditSupplement = (id, action, opinion, auditor, role) => mockRequest(() => {
  if (!roleCanAudit(role)) return { success: false, message: '仅省市县角色可审核' }
  const list = read(KEYS.supplements, SUPPLEMENT_DECLARATIONS); const item = list.find((x) => x.id === id)
  if (!item || !inScope(item, role) || item.status !== 'pending') return { success: false, message: '补充收储状态或权限不符合审核条件' }
  if (action !== 'pass' && !String(opinion || '').trim()) return { success: false, message: '退回或驳回必须填写意见' }
  item.status = action === 'pass' ? 'filed' : action === 'return' ? 'returned' : 'rejected'; item.auditTrail = [...(item.auditTrail || []), { time: now(), action: action === 'pass' ? '补充收储审核通过并生成备案编号' : action === 'return' ? '补充收储退回补正' : '补充收储驳回', user: auditor || `${role.name}（${role.roleName || role.code}）`, opinion: opinion || '同意备案' }]
  if (action === 'pass') item.filedNo = `皖青贮补〔${item.year || new Date().getFullYear()}〕第${String(filedSeq++).padStart(4, '0')}号`
  write(KEYS.supplements, list); return { success: true, filedNo: item.filedNo }
})

export const submitProductionReport = (data, role) => mockRequest(() => {
  try {
    const r = normalizeRole(role); const filed = declarations().find((d) => (d.id === data.declarationId || d.filedNo === data.filedNo) && d.status === 'filed')
    if (!filed || !inScope(filed, r)) throw new Error('只能填报本人范围内的已备案申报')
    ;['actualArea', 'actualYield', 'weight', 'price'].forEach((k) => { if (data[k] !== undefined && data[k] !== '') finitePositive(data[k], k) })
    if (Number(data.weight) > Number(data.actualYield)) throw new Error('收储重量不得超过实际产量')
    const list = ledgerList(); const old = list.find((x) => x.declarationId === filed.id || x.id === data.id)
    if (old && !['draft', 'returned', 'pending'].includes(old.auditStatus)) throw new Error('已审核填报不可直接修改')
    const item = { ...(old || {}), ...data, id: old?.id || data.id || `TZ-${Date.now()}`, declarationId: filed.id, filedNo: filed.filedNo, subjectId: filed.subjectId, subjectName: filed.subjectName, regionCode: filed.regionCode, year: filed.year, planArea: filed.area, expectedYield: filed.expectedYield, isSupplement: filed.isSupplement, amount: Number(data.weight || 0) * Number(data.price || 0) / 10000, status: Number(data.weight || 0) > 0 ? '已完成' : '收储中', auditStatus: 'pending', submittedBy: { code: r.code, name: r.name }, auditTrail: [...(old?.auditTrail || []), { time: now(), action: '提交产量收储填报', user: `${r.name || '用户'}（${r.roleName || r.code || '主体'}）` }] }
    write(KEYS.ledgers, [item, ...list.filter((x) => x.id !== item.id)]); return { success: true, id: item.id }
  } catch (e) { return { success: false, message: e.message } }
})

export const fetchProductionReports = (role) => mockRequest(() => ledgerList().filter((x) => x.auditStatus === 'pending' && inScope(x, role)))
export const auditProductionReport = (id, action, opinion, auditor, role) => mockRequest(() => {
  if (!roleCanAudit(role)) return { success: false, message: '仅省市县角色可审核' }; const list = ledgerList(); const item = list.find((x) => x.id === id)
  if (!item || item.auditStatus !== 'pending' || !inScope(item, role)) return { success: false, message: '填报状态或权限不符合审核条件' }
  if (action !== 'pass' && !String(opinion || '').trim()) return { success: false, message: '退回或驳回必须填写意见' }
  item.auditStatus = action === 'pass' ? 'filed' : action === 'return' ? 'returned' : 'rejected'; item.auditTrail = [...(item.auditTrail || []), { time: now(), action: action === 'pass' ? '产量收储审核通过' : action === 'return' ? '产量收储退回' : '产量收储驳回', user: auditor || `${role.name}（${role.roleName || role.code}）`, opinion: opinion || '审核通过' }]; write(KEYS.ledgers, list); return { success: true }
})

export const updateLedger = (id, patch, role) => mockRequest(() => {
  try {
    if (!roleCanAudit(role)) throw new Error('仅省市县角色可维护台账')
    const list = ledgerList(); const item = list.find((x) => x.id === id); if (!item || !inScope(item, role)) throw new Error('无权维护该台账')
    ;['actualArea', 'actualYield', 'weight', 'price', 'amount'].forEach((k) => { if (patch[k] !== undefined && patch[k] !== '') finitePositive(patch[k], k) })
    Object.assign(item, patch, { amount: patch.amount ?? (Number(patch.weight ?? item.weight ?? 0) * Number(patch.price ?? item.price ?? 0) / 10000), updatedAt: now(), auditTrail: [...(item.auditTrail || []), { time: now(), action: '管理人员维护台账', user: `${role.name || '管理员'}（${role.roleName || role.code}）` }] })
    write(KEYS.ledgers, list); return { success: true }
  } catch (e) { return { success: false, message: e.message } }
})

export const saveFencePlot = (data, role) => mockRequest(() => {
  try {
    const subject = validatePlotRole(role, data.subjectId); const ring = validateGeometry(data.geometry); const areaMu = finitePositive(data.areaMu, '面积')
    const plots = read(KEYS.plots, PLOTS); const plotId = data.plotId || `SIL-PL-${Date.now()}`; const plot = { id: plotId, name: data.plotName || '自绘地块', subjectId: subject.id, regionCode: subject.regionCode, crop: data.crop, cropName: data.cropName, areaMu, geometry: { type: 'Polygon', coordinates: [ring] } }
    write(KEYS.plots, [...plots.filter((x) => x.id !== plotId), plot]); const fences = read(KEYS.fences, SIL_FENCES); const fence = { id: data.fenceId || `FEN-${Date.now()}`, subjectId: subject.id, subjectName: subject.name, regionCode: subject.regionCode, plotIds: [plotId], crop: data.crop, filedNo: data.filedNo || '自绘围栏', createdAt: now().slice(0, 10), geometry: plot.geometry }
    write(KEYS.fences, [...fences.filter((x) => x.id !== fence.id), fence]); return { success: true, fence, plot }
  } catch (e) { return { success: false, message: e.message } }
})
