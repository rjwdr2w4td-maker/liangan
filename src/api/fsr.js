// 粮食安全综合监管 API（模拟）
import { mockRequest } from './request'
import { FSR_EVENTS } from '@/mock/fsr/events'

const filterByRole = (list, role) => {
  if (!role) return []
  if (role.subjectId) return list.filter((i) => i.subjectId === role.subjectId)
  if (role.regionCode === '340000') return list
  return list.filter((i) => String(i.regionCode || '').startsWith(role.regionCode.slice(0, 6)))
}

export const fetchEvents = (role, filters = {}) =>
  mockRequest(() =>
    filterByRole(FSR_EVENTS, role).filter((e) => {
      if (filters.status && e.status !== filters.status) return false
      if (filters.type && e.type !== filters.type) return false
      if (filters.source && e.source !== filters.source) return false
      if (filters.risk && e.risk !== filters.risk) return false
      return true
    })
  )

export const fetchEvent = (id) => mockRequest(() => FSR_EVENTS.find((e) => e.id === id))

let taskSeq = 20
// 派发任务：pending → checking
export const dispatchTask = (eventId, { assignee, deadlineDays, requirement }) =>
  mockRequest(() => {
    const ev = FSR_EVENTS.find((e) => e.id === eventId)
    if (!ev) return { success: false }
    const now = new Date()
    const deadline = new Date(now.getTime() + deadlineDays * 86400000).toISOString().slice(0, 10)
    ev.status = 'checking'
    ev.assignee = assignee
    ev.deadline = deadline
    ev.taskId = `TSK-2026-${String(taskSeq++).padStart(4, '0')}`
    ev.trail.push({
      time: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      action: '任务已派发', user: '派发人（演示）',
      extra: `责任单位：${assignee}，时限${deadlineDays}天${requirement ? '，要求：' + requirement : ''}，任务编号${ev.taskId}`
    })
    return { success: true, taskId: ev.taskId }
  }, 600)

// 移动端现场核查上报：checking → reviewing
export const submitCheckReport = (eventId, report) =>
  mockRequest(() => {
    const ev = FSR_EVENTS.find((e) => e.id === eventId)
    if (!ev) return { success: false }
    const now = new Date()
    ev.status = 'reviewing'
    ev.checkReport = report
    ev.trail.push({
      time: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      action: '现场核查完成并上报', user: `${report.checker}（皖政通移动核查）`,
      extra: `核查结论：${report.conclusion}；现场照片${report.photos}张${report.videos ? '、视频' + report.videos + '个' : ''}、GPS定位1条`
    })
    return { success: true }
  }, 800)

// 市级审核：reviewing → rectifying(通过) / checking(打回)
export const auditEvent = (eventId, action, opinion, auditor) =>
  mockRequest(() => {
    const ev = FSR_EVENTS.find((e) => e.id === eventId)
    if (!ev) return { success: false }
    const now = new Date()
    const time = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`
    if (action === 'pass') {
      ev.status = 'rectifying'
      ev.trail.push({ time, action: '市级审核通过，转入整改', user: auditor, opinion: opinion || '核查材料完整，事实清楚，请责任单位限期整改' })
    } else {
      ev.status = 'checking'
      ev.trail.push({ time, action: '打回重核', user: auditor, opinion: opinion || '核查材料不充分，请重新核查' })
    }
    return { success: true }
  })

// 整改提交：rectifying → recheck
export const submitRectify = (eventId, note) =>
  mockRequest(() => {
    const ev = FSR_EVENTS.find((e) => e.id === eventId)
    if (!ev) return { success: false }
    const now = new Date()
    ev.status = 'recheck'
    ev.rectifyNote = { desc: note.desc, time: now.toISOString().slice(0, 10), unit: '责任单位' }
    ev.trail.push({
      time: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      action: '整改完成，申请复核', user: '责任单位（属地农业农村局）', extra: note.desc
    })
    return { success: true }
  })

// 复核结案：recheck → closed / rectifying(不通过)
export const closeEvent = (eventId, action, opinion, auditor) =>
  mockRequest(() => {
    const ev = FSR_EVENTS.find((e) => e.id === eventId)
    if (!ev) return { success: false }
    const now = new Date()
    const time = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`
    if (action === 'pass') {
      ev.status = 'closed'
      ev.closedAt = time
      ev.trail.push({ time, action: '复核通过，事件结案归档', user: auditor, opinion: opinion || '整改到位，同意结案', extra: '事件报告已生成' })
    } else {
      ev.status = 'rectifying'
      ev.trail.push({ time, action: '复核不通过，退回整改', user: auditor, opinion: opinion || '整改不到位，请继续整改' })
    }
    return { success: true }
  })

// 分级修正
export const adjustRisk = (eventId, risk, reason) =>
  mockRequest(() => {
    const ev = FSR_EVENTS.find((e) => e.id === eventId)
    if (!ev) return { success: false }
    const oldRisk = ev.risk
    ev.risk = risk
    ev.trail.push({
      time: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
      action: `风险等级修正（${oldRisk} → ${risk}）`, user: '管理人员', extra: reason || ''
    })
    return { success: true }
  }, 300)

// 数字围栏联动新增事件
export const createFenceEvent = (payload) =>
  mockRequest(() => {
    const id = `EVT-2026-${String(FSR_EVENTS.length + 1).padStart(4, '0')}`
    const now = new Date()
    FSR_EVENTS.unshift({
      id, code: id.replace('EVT-', 'FSR-'), type: 'weibeian', source: 'fence', risk: 'high',
      regionCode: payload.regionCode || '341222', regionName: payload.regionName || '太和县',
      spot: { plotId: null, geometry: { type: 'Polygon', coordinates: [payload.ring] }, center: payload.center, areaMu: payload.areaMu || 200 },
      subjectId: null, subjectName: '待核实',
      foundTime: now.toISOString().slice(0, 10), desc: payload.desc || '数字围栏校验发现疑似未备案收割行为',
      status: 'pending', deadline: null, taskId: null,
      trail: [{ time: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`, action: '数字围栏联动发现', user: '系统（青贮一张图坐标校验）' }]
    })
    return { success: true, id }
  }, 600)
