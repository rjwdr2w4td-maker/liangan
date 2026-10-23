// 粮食安全监管 Mock：图斑与事件（状态机全状态覆盖）
import { PLOTS, GROW_SUBJECTS } from '@/mock/geo/plot-gen'
import { circlePolygon, offsetPoint } from '@/map/geoUtils'

// ===== 事件（25 条，覆盖全部状态）=====
// status: pending 待派发 / checking 待核查 / reviewing 待审核 / rectifying 整改中 / recheck 待复核 / closed 已结案
const buildEvents = () => {
  const events = []

  // 用现有地块生成图斑（关联主体便于穿透查询）
  const mkSpotFromPlot = (plot, type, risk) => ({
    plotId: plot.id,
    geometry: plot.geometry,
    center: plot.center,
    areaMu: plot.areaMu
  })

  const mkStandaloneSpot = (regionCode, center, type, risk, areaMu) => ({
    plotId: null,
    geometry: { type: 'Polygon', coordinates: [circlePolygon(center, 1.5, 7)] },
    center,
    areaMu: areaMu || 220
  })

  const taihePlots = PLOTS.filter((p) => p.regionCode.startsWith('341222'))
  const guoyangPlots = PLOTS.filter((p) => p.regionCode.startsWith('341622'))
  const feixiPlots = PLOTS.filter((p) => p.regionCode.startsWith('340123'))

  // --- 待派发（3条，供演示派发流程）---
  events.push({
    id: 'EVT-2026-0012', code: 'FSR-2026-0012', type: 'baomai', source: 'remote', risk: 'high',
    regionCode: '341222104', regionName: '太和县旧县镇', spot: mkSpotFromPlot(taihePlots[3] || taihePlots[0], 'baomai', 'high'),
    subjectId: taihePlots[3]?.subjectId || 'SUB-0004', subjectName: GROW_SUBJECTS.find((s) => s.id === (taihePlots[3]?.subjectId))?.name || '旧县镇赵多种植大户',
    foundTime: '2026-09-28', desc: '遥感影像比对发现疑似毁青收贮行为，5月小麦灌浆期地块出现大面积收割痕迹',
    status: 'pending', deadline: null, trail: [
      { time: '2026-09-28 08:15', action: '遥感识别发现疑似图斑', user: '系统（第3包遥感成果推送）', extra: '影像时相：2026-09-25，分辨率2m' }
    ]
  })
  events.push({
    id: 'EVT-2026-0013', code: 'FSR-2026-0013', type: 'piaohuang', source: 'grid', risk: 'medium',
    regionCode: '341222108', regionName: '太和县税镇镇', spot: mkStandaloneSpot('341222108', offsetPoint([115.451, 33.196], 6, -4), 'piaohuang', 'medium', 340),
    subjectId: null, subjectName: '待核实',
    foundTime: '2026-09-27', desc: '网格巡查上报：该地块连续两季未耕种，杂草丛生，疑似撂荒',
    status: 'pending', deadline: null, trail: [
      { time: '2026-09-27 15:40', action: '网格巡查上报', user: '税镇镇网格员（皖政通）' }
    ]
  })
  events.push({
    id: 'EVT-2026-0014', code: 'FSR-2026-0014', type: 'feilianghua', source: 'snapshot', risk: 'high',
    regionCode: '341622', regionName: '涡阳县', spot: mkStandaloneSpot('341622', offsetPoint([116.216, 33.493], -8, 5), 'feilianghua', 'high', 560),
    subjectId: null, subjectName: '待核实',
    foundTime: '2026-09-26', desc: '群众随手拍举报：永久基本农田疑似开挖鱼塘，改变耕地用途',
    status: 'pending', deadline: null, trail: [
      { time: '2026-09-26 10:05', action: '随手拍线索上报', user: '公众（皖事通）', extra: '附现场照片2张' }
    ]
  })

  // --- 待核查（已派发任务，3条）---
  events.push({
    id: 'EVT-2026-0011', code: 'FSR-2026-0011', type: 'baomai', source: 'fence', risk: 'high',
    regionCode: '341222', regionName: '太和县', spot: mkSpotFromPlot(taihePlots[8] || taihePlots[1], 'baomai', 'high'),
    subjectId: taihePlots[8]?.subjectId || 'SUB-0003', subjectName: '太和县宏发农业发展有限公司',
    foundTime: '2026-09-25', desc: '数字围栏校验发现：未备案地块疑似青贮收割行为，联动生成本事件',
    status: 'checking', deadline: '2026-10-02', assignee: '旧县镇人民政府（核查员：赵磊）', taskId: 'TSK-2026-0011',
    trail: [
      { time: '2026-09-25 14:30', action: '数字围栏联动发现', user: '系统（青贮一张图坐标校验）' },
      { time: '2026-09-26 09:15', action: '任务已派发', user: '王芳（太和县农业农村局）', extra: '责任单位：旧县镇人民政府，时限7天，任务编号TSK-2026-0011' }
    ]
  })
  events.push({
    id: 'EVT-2026-0010', code: 'FSR-2026-0010', type: 'zhangshi', source: 'remote', risk: 'medium',
    regionCode: '340123', regionName: '肥西县', spot: mkStandaloneSpot('340123', offsetPoint([116.854, 31.708], 5, 4), 'zhangshi', 'medium', 410),
    subjectId: 'SUB-0009', subjectName: '肥西县三河现代农业公司',
    foundTime: '2026-09-24', desc: '作物长势监测发现水稻长势明显偏差，NDVI低于常年同期15%',
    status: 'checking', deadline: '2026-09-30', assignee: '肥西县农业农村局（核查员：周平）', taskId: 'TSK-2026-0010',
    trail: [
      { time: '2026-09-24 09:00', action: '遥感长势监测发现异常区域', user: '系统（长势专题产品）' },
      { time: '2026-09-25 10:20', action: '任务已派发', user: '合肥市农业农村局', extra: '时限5天' }
    ]
  })
  events.push({
    id: 'EVT-2026-0009', code: 'FSR-2026-0009', type: 'piaohuang', source: 'remote', risk: 'low',
    regionCode: '341622', regionName: '涡阳县', spot: mkSpotFromPlot(guoyangPlots[4] || guoyangPlots[0], 'piaohuang', 'low'),
    subjectId: guoyangPlots[4]?.subjectId || 'SUB-0008', subjectName: '涡阳县刘桥家庭农场',
    foundTime: '2026-09-22', desc: '遥感识别疑似撂荒图斑，需现场核实耕种状态',
    status: 'checking', deadline: '2026-10-08', assignee: '涡阳县农业农村局（核查员：马强）', taskId: 'TSK-2026-0009',
    trail: [
      { time: '2026-09-22 11:00', action: '遥感识别发现疑似图斑', user: '系统' },
      { time: '2026-09-23 14:00', action: '任务已派发', user: '亳州市农业农村局', extra: '时限7天' }
    ]
  })

  // --- 待审核（已核查上报，2条）---
  events.push({
    id: 'EVT-2026-0008', code: 'FSR-2026-0008', type: 'baomai', source: 'remote', risk: 'high',
    regionCode: '341222104', regionName: '太和县旧县镇', spot: mkSpotFromPlot(taihePlots[5] || taihePlots[2], 'baomai', 'high'),
    subjectId: taihePlots[5]?.subjectId || 'SUB-0005', subjectName: '旧县镇田乐家庭农场',
    foundTime: '2026-09-20', desc: '遥感发现疑似毁麦毁粮图斑',
    status: 'reviewing', deadline: '2026-09-28', assignee: '阜阳市农业农村局', taskId: 'TSK-2026-0008',
    checkReport: {
      conclusion: '属实', desc: '经现场核查，该地块存在提前收割青贮行为，未办理青贮备案手续',
      gps: '115.5412, 33.1456', checker: '赵磊（旧县镇）', time: '2026-09-26',
      photos: 3, videos: 1
    },
    trail: [
      { time: '2026-09-20 09:30', action: '遥感识别发现疑似图斑', user: '系统' },
      { time: '2026-09-21 10:00', action: '任务已派发', user: '太和县农业农村局', extra: '责任单位：旧县镇' },
      { time: '2026-09-26 15:42', action: '现场核查完成并上报', user: '赵磊（皖政通移动核查）', extra: '核查结论：属实；现场照片3张、视频1个、GPS定位1条' }
    ]
  })
  events.push({
    id: 'EVT-2026-0007', code: 'FSR-2026-0007', type: 'piaohuang', source: 'grid', risk: 'medium',
    regionCode: '341200', regionName: '阜阳市颍州区', spot: mkStandaloneSpot('341202', offsetPoint([115.806, 32.88], -6, 3), 'piaohuang', 'medium', 280),
    subjectId: null, subjectName: '待核实',
    foundTime: '2026-09-10', desc: '网格巡查上报疑似撂荒',
    status: 'reviewing', deadline: '2026-09-25', assignee: '阜阳市农业农村局', taskId: 'TSK-2026-0007', overdue: true,
    checkReport: {
      conclusion: '部分属实', desc: '现场核查发现地块一半面积撂荒，另一半已补种秋粮',
      gps: '115.7612, 32.8834', checker: '周伟（颍州区）', time: '2026-09-24',
      photos: 4, videos: 0
    },
    trail: [
      { time: '2026-09-10 10:15', action: '网格巡查上报', user: '颍州区网格员' },
      { time: '2026-09-11 09:00', action: '任务已派发', user: '阜阳市农业农村局', extra: '时限7天' },
      { time: '2026-09-24 16:20', action: '现场核查完成并上报', user: '周伟（皖政通）', extra: '核查结论：部分属实' }
    ]
  })

  // --- 整改中（2条）---
  events.push({
    id: 'EVT-2026-0006', code: 'FSR-2026-0006', type: 'feilianghua', source: 'remote', risk: 'high',
    regionCode: '341222', regionName: '太和县', spot: mkStandaloneSpot('341222', offsetPoint([115.622, 33.16], 9, 6), 'feilianghua', 'high', 380),
    subjectId: 'SUB-0003', subjectName: '太和县宏发农业发展有限公司',
    foundTime: '2026-09-08', desc: '永久基本农田疑似种植苗木（非粮化）',
    status: 'rectifying', deadline: '2026-10-15', assignee: '太和县农业农村局', taskId: 'TSK-2026-0006',
    checkReport: {
      conclusion: '属实', desc: '现场核实该地块违规种植绿化苗木，涉及永久基本农田380亩',
      gps: '115.6812, 33.1934', checker: '张勇（太和县）', time: '2026-09-15',
      photos: 5, videos: 1
    },
    rectifyNote: { desc: '已通知主体限期清退苗木，恢复粮食种植，计划10月15日前完成', time: '2026-09-18', unit: '太和县农业农村局' },
    trail: [
      { time: '2026-09-08 09:00', action: '遥感识别发现疑似图斑', user: '系统' },
      { time: '2026-09-09 10:30', action: '任务已派发', user: '阜阳市农业农村局', extra: '时限7天' },
      { time: '2026-09-15 14:00', action: '现场核查完成并上报', user: '张勇（皖政通）', extra: '核查结论：属实' },
      { time: '2026-09-16 09:20', action: '市级审核通过，转入整改', user: '李强（阜阳市农业农村局）', opinion: '核查材料完整，事实清楚，请责任单位限期整改' },
      { time: '2026-09-18 11:00', action: '整改方案已提交', user: '太和县农业农村局', extra: '限期10月15日前清退苗木并恢复种粮' }
    ]
  })
  events.push({
    id: 'EVT-2026-0005', code: 'FSR-2026-0005', type: 'baomai', source: 'platform', risk: 'high',
    regionCode: '341622', regionName: '涡阳县', spot: mkStandaloneSpot('341622', offsetPoint([116.216, 33.493], 10, -6), 'baomai', 'high', 260),
    subjectId: null, subjectName: '某收储经纪点',
    foundTime: '2026-09-05', desc: '地方平台推送：未备案青贮收割事件',
    status: 'rectifying', deadline: '2026-10-10', assignee: '涡阳县农业农村局', taskId: 'TSK-2026-0005',
    checkReport: {
      conclusion: '属实', desc: '现场核查发现收储车辆正在作业，无法出示备案凭证',
      gps: '116.3012, 33.4334', checker: '马强（涡阳县）', time: '2026-09-12',
      photos: 6, videos: 2
    },
    rectifyNote: { desc: '已责令停止收储作业，对涉事主体立案调查', time: '2026-09-14', unit: '涡阳县农业农村局' },
    trail: [
      { time: '2026-09-05 10:00', action: '地方平台推送事件', user: '亳州市粮食安全平台（接口）' },
      { time: '2026-09-06 09:00', action: '任务已派发', user: '亳州市农业农村局' },
      { time: '2026-09-12 15:30', action: '现场核查完成并上报', user: '马强（皖政通）', extra: '核查结论：属实' },
      { time: '2026-09-13 10:00', action: '市级审核通过，转入整改', user: '亳州市农业农村局', opinion: '事实清楚，移交执法处置' },
      { time: '2026-09-14 09:30', action: '整改方案已提交', user: '涡阳县农业农村局' }
    ]
  })

  // --- 待复核（2条）---
  events.push({
    id: 'EVT-2026-0004', code: 'FSR-2026-0004', type: 'piaohuang', source: 'remote', risk: 'medium',
    regionCode: '340123', regionName: '肥西县', spot: mkStandaloneSpot('340123', offsetPoint([116.854, 31.708], -7, -5), 'piaohuang', 'medium', 190),
    subjectId: 'SUB-0010', subjectName: '肥西县严店种粮大户集群',
    foundTime: '2026-09-01', desc: '遥感识别疑似撂荒图斑',
    status: 'recheck', deadline: '2026-09-30', assignee: '合肥市农业农村局', taskId: 'TSK-2026-0004',
    checkReport: {
      conclusion: '属实', desc: '现场核实该地块因主体经营困难撂荒半年',
      gps: '116.7712, 31.6634', checker: '周平（肥西县）', time: '2026-09-08',
      photos: 3, videos: 0
    },
    rectifyNote: { desc: '已组织代耕代种服务，完成翻耕并播种秋粮，附整改后照片', time: '2026-09-20', unit: '肥西县农业农村局' },
    trail: [
      { time: '2026-09-01 09:00', action: '遥感识别发现疑似图斑', user: '系统' },
      { time: '2026-09-02 10:00', action: '任务已派发', user: '合肥市农业农村局' },
      { time: '2026-09-08 14:30', action: '现场核查完成并上报', user: '周平（皖政通）', extra: '核查结论：属实' },
      { time: '2026-09-10 09:00', action: '市级审核通过，转入整改', user: '合肥市农业农村局', opinion: '同意核查结论，请限期整改' },
      { time: '2026-09-20 16:00', action: '整改完成，申请复核', user: '肥西县农业农村局', extra: '已完成代耕代种190亩并播种' }
    ]
  })
  events.push({
    id: 'EVT-2026-0003', code: 'FSR-2026-0003', type: 'zhangshi', source: 'remote', risk: 'low',
    regionCode: '341622', regionName: '涡阳县', spot: mkStandaloneSpot('341622', offsetPoint([116.216, 33.493], -10, 8), 'zhangshi', 'low', 450),
    subjectId: 'SUB-0007', subjectName: '涡阳县丰收种植合作社',
    foundTime: '2026-08-28', desc: '玉米长势异常，疑似病虫害',
    status: 'recheck', deadline: '2026-10-01', assignee: '亳州市农业农村局', taskId: 'TSK-2026-0003',
    checkReport: {
      conclusion: '属实', desc: '现场核实玉米螟虫害较重，已指导主体开展防治',
      gps: '116.1312, 33.5634', checker: '马强（涡阳县）', time: '2026-09-05',
      photos: 4, videos: 0
    },
    rectifyNote: { desc: '已完成两轮飞防作业，虫害得到控制，长势恢复', time: '2026-09-22', unit: '涡阳县农业农村局' },
    trail: [
      { time: '2026-08-28 09:00', action: '长势监测发现异常', user: '系统' },
      { time: '2026-08-29 10:00', action: '任务已派发', user: '亳州市农业农村局' },
      { time: '2026-09-05 14:00', action: '现场核查完成并上报', user: '马强（皖政通）', extra: '核查结论：属实（虫害）' },
      { time: '2026-09-07 09:30', action: '市级审核通过，转入整改', user: '亳州市农业农村局', opinion: '请加强田管指导' },
      { time: '2026-09-22 15:00', action: '整改完成，申请复核', user: '涡阳县农业农村局', extra: '两轮飞防完成' }
    ]
  })

  // --- 已结案（6条）---
  const closedCases = [
    { id: 'EVT-2026-0002', type: 'baomai', source: 'remote', risk: 'high', regionCode: '341222', regionName: '太和县', offset: [4, -8], subjectId: 'SUB-0002', subjectName: '太和县绿源家庭农场', desc: '疑似毁麦收贮', found: '2026-05-20', area: 150 },
    { id: 'EVT-2026-0001', type: 'feilianghua', source: 'remote', risk: 'medium', regionCode: '340121', regionName: '长丰县', offset: [-5, 6], subjectId: 'SUB-0011', subjectName: '长丰县下塘龙虾稻田农场', desc: '耕地疑似建养殖设施', found: '2026-06-12', area: 90 },
    { id: 'EVT-2026-0015', type: 'piaohuang', source: 'grid', risk: 'low', regionCode: '341222104', regionName: '太和县旧县镇', offset: [7, 7], subjectId: 'SUB-0004', subjectName: '旧县镇赵多种植大户', desc: '网格上报疑似撂荒（实为轮作休耕）', found: '2026-07-02', area: 120 },
    { id: 'EVT-2026-0016', type: 'zhangshi', source: 'remote', risk: 'medium', regionCode: '340123', regionName: '肥西县', offset: [8, -3], subjectId: 'SUB-0009', subjectName: '肥西县三河现代农业公司', desc: '水稻长势异常（干旱缺水）', found: '2026-07-18', area: 300 },
    { id: 'EVT-2026-0017', type: 'baomai', source: 'snapshot', risk: 'high', regionCode: '341622', regionName: '涡阳县', offset: [-4, -7], subjectId: null, subjectName: '某个体收储户', desc: '群众举报夜间毁粮收储', found: '2026-05-28', area: 80 },
    { id: 'EVT-2026-0018', type: 'feilianghua', source: 'platform', risk: 'medium', regionCode: '341200', regionName: '阜阳市颍东区', offset: [12, 4], subjectId: null, subjectName: '某苗木种植户', desc: '地方平台推送耕地种树', found: '2026-06-25', area: 210 }
  ]
  closedCases.forEach((c, i) => {
    const countyCenter = { '341222': [115.622, 33.16], '341222104': [115.544, 33.148], '340121': [117.167, 32.479], '340123': [116.854, 31.708], '341622': [116.216, 33.493], '341200': [115.82, 32.901] }[c.regionCode]
    events.push({
      id: c.id, code: c.code || c.id.replace('EVT-', 'FSR-'), type: c.type, source: c.source, risk: c.risk,
      regionCode: c.regionCode, regionName: c.regionName,
      spot: mkStandaloneSpot(c.regionCode, offsetPoint(countyCenter, c.offset[0], c.offset[1]), c.type, c.risk, c.area),
      subjectId: c.subjectId, subjectName: c.subjectName,
      foundTime: c.found, desc: c.desc,
      status: 'closed', deadline: null, assignee: '属地农业农村局', taskId: `TSK-${c.id.slice(-4)}`,
      trail: [
        { time: `${c.found} 09:00`, action: '事件接入', user: c.source === 'remote' ? '系统（遥感）' : c.source === 'grid' ? '网格员' : c.source === 'snapshot' ? '公众（随手拍）' : '地方平台' },
        { time: `${c.found} 15:00`, action: '任务已派发', user: '市级农业农村局' },
        { time: '2026-07-02 14:00', action: '现场核查完成并上报', user: '属地核查员（皖政通）', extra: '核查结论：' + (i === 2 ? '不属实（轮作休耕）' : '属实') },
        { time: '2026-07-04 09:00', action: '市级审核', user: '市级农业农村局', opinion: i === 2 ? '核查充分，事件不属实，予以销案' : '事实清楚，限期整改' },
        ...(i === 2 ? [] : [{ time: '2026-07-20 10:00', action: '整改完成并复核通过', user: '市级农业农村局', extra: '已恢复种粮/完成处置' }]),
        { time: '2026-07-25 16:00', action: '事件结案归档', user: '系统', extra: '生成事件报告' }
      ]
    })
  })

  return events
}

export const FSR_EVENTS = buildEvents()
export const EVENT_MAP = Object.fromEntries(FSR_EVENTS.map((e) => [e.id, e]))

// 事件图斑 GeoJSON（按状态着色由视图层处理）
export const eventsGeoJSON = (events) => ({
  type: 'FeatureCollection',
  features: events.map((e) => ({
    type: 'Feature',
    properties: {
      eventId: e.id, code: e.code, type: e.type, risk: e.risk, status: e.status,
      regionName: e.regionName, areaMu: e.spot.areaMu, subjectName: e.subjectName, desc: e.desc, overdue: e.overdue
    },
    geometry: e.spot.geometry
  }))
})
