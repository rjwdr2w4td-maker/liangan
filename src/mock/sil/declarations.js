// 青贮饲料 Mock：收储申报、备案围栏、台账
import { PLOTS } from '@/mock/geo/plot-gen'

// ===== 收储申报（15 条覆盖全状态）=====
// status: draft/pending/returned/rejected/filed
export const SIL_DECLARATIONS = [
  {
    id: 'QZ-SB-2026-0001', year: 2027, subjectId: 'SUB-0001', subjectName: '太和县丰乐种植专业合作社', regionCode: '341222',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '豫青贮23号', area: 850, expectedYield: 3400, expectedTime: '2027-08',
    price: 480, weight: 3400, usage: 'self', crossCounty: false, contact: '陈勇', phone: '139****6688',
    plotIds: ['PL-0001', 'PL-0002'], status: 'filed', filedNo: '皖青贮备〔2026〕第0001号',
    promiseSignedAt: '2026-09-20 10:32', attachments: ['收储合同扫描件.pdf'], createdAt: '2026-09-20', auditTrail: [
      { time: '2026-09-20 10:32', action: '提交申报', user: '陈勇（皖企通）' },
      { time: '2026-09-21 15:08', action: '审核通过并生成备案编号', user: '王芳（太和县农业农村局）', opinion: '材料齐全，同意备案' }
    ]
  },
  {
    id: 'QZ-SB-2026-0002', year: 2027, subjectId: 'SUB-0007', subjectName: '涡阳县丰收种植合作社', regionCode: '341622',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '雅玉青贮8号', area: 1200, expectedYield: 4800, expectedTime: '2027-08',
    price: 460, weight: 4800, usage: 'sell', crossCounty: true, crossTo: '蒙城县', contact: '马丰', phone: '138****5566',
    plotIds: ['PL-0020'], status: 'filed', filedNo: '皖青贮备〔2026〕第0002号',
    promiseSignedAt: '2026-09-22 09:15', attachments: ['收购订单-蒙城现代牧业.pdf'], createdAt: '2026-09-22', auditTrail: [
      { time: '2026-09-22 09:15', action: '提交申报（跨县域委托收储）', user: '马丰（皖企通）' },
      { time: '2026-09-23 11:20', action: '审核通过并生成备案编号', user: '涡阳县农业农村局（代办）', opinion: '跨县收储材料符合要求' }
    ]
  },
  {
    id: 'QZ-SB-2026-0003', year: 2027, subjectId: 'SUB-0002', subjectName: '太和县绿源家庭农场', regionCode: '341222',
    crop: 'alfalfa', cropName: '苜蓿', variety: '中苜3号', area: 300, expectedYield: 1350, expectedTime: '2027-05',
    price: 550, weight: 1350, usage: 'self', crossCounty: false, contact: '王建国', phone: '138****2345',
    plotIds: ['PL-0005'], status: 'pending',
    promiseSignedAt: '2026-09-28 14:22', attachments: [], createdAt: '2026-09-28', auditTrail: [
      { time: '2026-09-28 14:22', action: '提交申报', user: '王建国（皖企通）' }
    ]
  },
  {
    id: 'QZ-SB-2026-0004', year: 2027, subjectId: 'SUB-0004', subjectName: '旧县镇赵多种植大户', regionCode: '341222104',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '郑青贮1号', area: 210, expectedYield: 840, expectedTime: '2027-08',
    price: 470, weight: 840, usage: 'sell', crossCounty: false, contact: '赵多', phone: '136****3456',
    plotIds: ['PL-0007'], status: 'pending',
    promiseSignedAt: '2026-09-29 09:32', attachments: ['收购意向书.pdf'], createdAt: '2026-09-29', auditTrail: [
      { time: '2026-09-29 09:32', action: '提交申报', user: '赵多（皖企通）' }
    ]
  },
  {
    id: 'QZ-SB-2026-0005', year: 2027, subjectId: 'SUB-0009', subjectName: '肥西县三河现代农业公司', regionCode: '340123',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '北农青贮208', area: 640, expectedYield: 2560, expectedTime: '2027-09',
    price: 500, weight: 2560, usage: 'sell', crossCounty: false, contact: '张三河', phone: '136****4477',
    plotIds: ['PL-0026'], status: 'returned',
    promiseSignedAt: '2026-09-26 11:00', attachments: [], createdAt: '2026-09-26', auditTrail: [
      { time: '2026-09-26 11:00', action: '提交申报', user: '张三河（皖企通）' },
      { time: '2026-09-27 16:40', action: '退回补正', user: '肥西县农业农村局', opinion: '用于出售但未上传收购合同，请补充材料后重新提交' }
    ]
  },
  {
    id: 'QZ-SB-2026-0006', year: 2026, subjectId: 'SUB-0003', subjectName: '太和县宏发农业发展有限公司', regionCode: '341222',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '豫青贮23号', area: 580, expectedYield: 2320, expectedTime: '2026-08',
    price: 490, weight: 2320, usage: 'self', crossCounty: false, contact: '李宏', phone: '137****9012',
    plotIds: ['PL-0010'], status: 'rejected',
    promiseSignedAt: '2026-08-01 10:20', attachments: ['伪造地块证明.pdf'], createdAt: '2026-08-01', auditTrail: [
      { time: '2026-08-01 10:20', action: '提交申报', user: '李宏（PC端）' },
      { time: '2026-08-02 09:45', action: '驳回', user: '王芳（太和县农业农村局）', opinion: '涉嫌使用虚假地块证明材料，驳回并记录' }
    ]
  },
  {
    id: 'QZ-SB-2026-0007', year: 2026, subjectId: 'SUB-0001', subjectName: '太和县丰乐种植专业合作社', regionCode: '341222',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '豫青贮23号', area: 820, expectedYield: 3280, expectedTime: '2026-08',
    price: 475, weight: 3280, usage: 'self', crossCounty: false, contact: '陈勇', phone: '139****6688',
    plotIds: ['PL-0001'], status: 'filed', filedNo: '皖青贮备〔2026〕第0003号',
    promiseSignedAt: '2026-08-10 09:00', attachments: [], createdAt: '2026-08-10', auditTrail: [
      { time: '2026-08-10 09:00', action: '提交申报', user: '陈勇（皖企通）' },
      { time: '2026-08-11 14:30', action: '审核通过并生成备案编号', user: '王芳（太和县农业农村局）', opinion: '同意备案' }
    ]
  },
  {
    id: 'QZ-SB-2026-0008', year: 2026, subjectId: 'SUB-0006', subjectName: '太和县税镇镇兴农合作社', regionCode: '341222108',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '雅玉青贮8号', area: 980, expectedYield: 3920, expectedTime: '2026-08',
    price: 465, weight: 3920, usage: 'sell', crossCounty: true, crossTo: '界首市', contact: '孙兴', phone: '139****1122',
    plotIds: ['PL-0013'], status: 'filed', filedNo: '皖青贮备〔2026〕第0004号',
    promiseSignedAt: '2026-08-12 16:40', attachments: ['收购合同-界首某牧场.pdf'], createdAt: '2026-08-12', auditTrail: [
      { time: '2026-08-12 16:40', action: '提交申报（跨县域委托收储）', user: '孙兴（PC端）' },
      { time: '2026-08-13 10:15', action: '审核通过并生成备案编号', user: '王芳（太和县农业农村局）', opinion: '同意备案' }
    ]
  },
  {
    id: 'QZ-SB-2026-0009', year: 2027, subjectId: 'SUB-0011', subjectName: '长丰县下塘龙虾稻田农场', regionCode: '340121',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '青贮1号', area: 260, expectedYield: 1040, expectedTime: '2027-09',
    price: 480, weight: 1040, usage: 'self', crossCounty: false, contact: '王塘', phone: '139****9911',
    plotIds: ['PL-0030'], status: 'draft',
    promiseSignedAt: null, attachments: [], createdAt: '2026-09-29', auditTrail: []
  },
  {
    id: 'QZ-SB-2026-0010', year: 2026, subjectId: 'SUB-0010', subjectName: '肥西县严店种粮大户集群', regionCode: '340123',
    crop: 'alfalfa', cropName: '苜蓿', variety: '中苜3号', area: 180, expectedYield: 810, expectedTime: '2026-05',
    price: 560, weight: 810, usage: 'sell', crossCounty: false, contact: '严店', phone: '135****2233',
    plotIds: ['PL-0028'], status: 'filed', filedNo: '皖青贮备〔2026〕第0005号',
    promiseSignedAt: '2026-04-15 09:30', attachments: ['苜蓿收购协议.pdf'], createdAt: '2026-04-15', auditTrail: [
      { time: '2026-04-15 09:30', action: '提交申报', user: '严店（皖企通）' },
      { time: '2026-04-16 11:00', action: '审核通过并生成备案编号', user: '肥西县农业农村局', opinion: '同意备案' }
    ]
  },
  {
    id: 'QZ-SB-2026-0011', year: 2026, subjectId: 'SUB-0008', subjectName: '涡阳县刘桥家庭农场', regionCode: '341622',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '郑青贮1号', area: 320, expectedYield: 1280, expectedTime: '2026-08',
    price: 470, weight: 1280, usage: 'self', crossCounty: false, contact: '刘桥', phone: '137****8899',
    plotIds: ['PL-0023'], status: 'filed', filedNo: '皖青贮备〔2026〕第0006号',
    promiseSignedAt: '2026-08-05 10:10', attachments: [], createdAt: '2026-08-05', auditTrail: [
      { time: '2026-08-05 10:10', action: '提交申报', user: '刘桥（皖企通）' },
      { time: '2026-08-06 09:20', action: '审核通过并生成备案编号', user: '涡阳县农业农村局', opinion: '同意备案' }
    ]
  },
  {
    id: 'QZ-SB-2026-0012', year: 2027, subjectId: 'SUB-0005', subjectName: '旧县镇田乐家庭农场', regionCode: '341222104',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '北农青贮208', area: 190, expectedYield: 760, expectedTime: '2027-08',
    price: 475, weight: 760, usage: 'self', crossCounty: false, contact: '田乐', phone: '135****7890',
    plotIds: ['PL-0009'], status: 'pending',
    promiseSignedAt: '2026-09-27 15:00', attachments: [], createdAt: '2026-09-27', auditTrail: [
      { time: '2026-09-27 15:00', action: '提交申报', user: '田乐（皖企通）' }
    ]
  },
  {
    id: 'QZ-SB-2026-0013', year: 2027, subjectId: 'SUB-0003', subjectName: '太和县宏发农业发展有限公司', regionCode: '341222',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '豫青贮23号', area: 460, expectedYield: 1840, expectedTime: '2027-08',
    price: 480, weight: 1840, usage: 'sell', crossCounty: false, contact: '李宏', phone: '137****9012',
    plotIds: ['PL-0010'], status: 'pending',
    promiseSignedAt: '2026-09-29 08:40', attachments: ['收购合同-太和某养殖场.pdf'], createdAt: '2026-09-29', auditTrail: [
      { time: '2026-09-29 08:40', action: '提交申报', user: '李宏（PC端）' }
    ]
  },
  {
    id: 'QZ-SB-2026-0014', year: 2026, subjectId: 'SUB-0012', subjectName: '长丰县水湖草莓粮经合作社', regionCode: '340121',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '雅玉青贮8号', area: 380, expectedYield: 1520, expectedTime: '2026-09',
    price: 490, weight: 1520, usage: 'self', crossCounty: false, contact: '李水湖', phone: '138****3344',
    plotIds: ['PL-0032'], status: 'filed', filedNo: '皖青贮备〔2026〕第0007号',
    promiseSignedAt: '2026-08-25 09:00', attachments: [], createdAt: '2026-08-25', auditTrail: [
      { time: '2026-08-25 09:00', action: '提交申报', user: '李水湖（PC端）' },
      { time: '2026-08-26 10:30', action: '审核通过并生成备案编号', user: '长丰县农业农村局', opinion: '同意备案' }
    ]
  },
  {
    id: 'QZ-SB-2026-0015', year: 2026, subjectId: 'SUB-0007', subjectName: '涡阳县丰收种植合作社', regionCode: '341622',
    crop: 'silage_corn', cropName: '青贮玉米', variety: '郑青贮1号', area: 260, expectedYield: 1040, expectedTime: '2026-08',
    price: 460, weight: 1040, usage: 'self', crossCounty: false, contact: '马丰', phone: '138****5566',
    plotIds: ['PL-0021'], status: 'returned',
    promiseSignedAt: '2026-08-08 14:20', attachments: [], createdAt: '2026-08-08', auditTrail: [
      { time: '2026-08-08 14:20', action: '提交申报', user: '马丰（皖企通）' },
      { time: '2026-08-09 09:30', action: '退回补正', user: '涡阳县农业农村局', opinion: '地块面积与申报面积不符，请核对后重新提交' }
    ]
  }
]

// ===== 补充收储（受灾）=====
export const SUPPLEMENT_DECLARATIONS = [
  {
    id: 'QZ-BC-2026-0001', disasterType: '风雹', subjectId: 'SUB-0004', subjectName: '旧县镇赵多种植大户', regionCode: '341222104',
    crop: 'wheat', affectedArea: 210, lostArea: 85, estLoss: '约12万元', expertEval: '经县农业农村局组织专家评估，受灾小麦不适合收获为粮食，建议补充青贮收储',
    supplementArea: 85, supplementTime: '2026-05-20', status: 'filed', filedNo: '皖青贮补〔2026〕第0001号', createdAt: '2026-05-18'
  },
  {
    id: 'QZ-BC-2026-0002', disasterType: '渍涝', subjectId: 'SUB-0007', subjectName: '涡阳县丰收种植合作社', regionCode: '341622',
    crop: 'corn', affectedArea: 680, lostArea: 320, estLoss: '约46万元', expertEval: '受7月渍涝影响，320亩玉米绝收，适合青贮收储减少损失',
    supplementArea: 320, supplementTime: '2026-08-10', status: 'pending', createdAt: '2026-08-08'
  }
]

// ===== 备案围栏（已备案地块自动生成数字围栏）=====
// 与申报 filed 状态对应
export const SIL_FENCES = [
  { id: 'FEN-0001', filedNo: '皖青贮备〔2026〕第0001号', declarationId: 'QZ-SB-2026-0007', subjectId: 'SUB-0001', subjectName: '太和县丰乐种植专业合作社', regionCode: '341222', crop: 'silage_corn', createdAt: '2026-08-11' },
  { id: 'FEN-0002', filedNo: '皖青贮备〔2026〕第0002号', declarationId: 'QZ-SB-2026-0002', subjectId: 'SUB-0007', subjectName: '涡阳县丰收种植合作社', regionCode: '341622', crop: 'silage_corn', createdAt: '2026-09-23' },
  { id: 'FEN-0003', filedNo: '皖青贮备〔2026〕第0004号', declarationId: 'QZ-SB-2026-0008', subjectId: 'SUB-0006', subjectName: '太和县税镇镇兴农合作社', regionCode: '341222108', crop: 'silage_corn', createdAt: '2026-08-13' },
  { id: 'FEN-0004', filedNo: '皖青贮备〔2026〕第0005号', declarationId: 'QZ-SB-2026-0010', subjectId: 'SUB-0010', subjectName: '肥西县严店种粮大户集群', regionCode: '340123', crop: 'alfalfa', createdAt: '2026-04-16' },
  { id: 'FEN-0005', filedNo: '皖青贮备〔2026〕第0006号', declarationId: 'QZ-SB-2026-0011', subjectId: 'SUB-0008', subjectName: '涡阳县刘桥家庭农场', regionCode: '341622', crop: 'silage_corn', createdAt: '2026-08-06' },
  { id: 'FEN-0006', filedNo: '皖青贮备〔2026〕第0007号', declarationId: 'QZ-SB-2026-0014', subjectId: 'SUB-0012', subjectName: '长丰县水湖草莓粮经合作社', regionCode: '340121', crop: 'silage_corn', createdAt: '2026-08-26' }
]

// 围栏地块几何：从 PLOTS 取多边形
export const fenceGeoJSON = (fence) => {
  const plots = PLOTS.filter((p) => {
    const decl = SIL_DECLARATIONS.find((d) => d.id === fence.declarationId)
    return decl && decl.plotIds.includes(p.id)
  })
  return {
    type: 'FeatureCollection',
    features: plots.map((p) => ({
      type: 'Feature',
      properties: { fenceId: fence.id, plotId: p.id, plotName: p.name, areaMu: p.areaMu, subjectName: fence.subjectName, filedNo: fence.filedNo },
      geometry: p.geometry
    }))
  }
}

// ===== 收储台账 =====
export const SIL_LEDGERS = [
  { id: 'TZ-2026-0001', filedNo: '皖青贮备〔2026〕第0001号', subjectId: 'SUB-0001', subjectName: '太和县丰乐种植专业合作社', regionCode: '341222', year: 2026, planArea: 820, actualArea: 815, expectedYield: 3280, actualYield: 3180, price: 478, amount: 152.0, status: '已完成', harvestTime: '2026-08-25', buyer: '自用（本场养殖）' },
  { id: 'TZ-2026-0002', filedNo: '皖青贮备〔2026〕第0004号', subjectId: 'SUB-0006', subjectName: '太和县税镇镇兴农合作社', regionCode: '341222108', year: 2026, planArea: 980, actualArea: 972, expectedYield: 3920, actualYield: 3890, price: 466, amount: 181.3, status: '已完成', harvestTime: '2026-08-28', buyer: '界首市某牧业有限公司' },
  { id: 'TZ-2026-0003', filedNo: '皖青贮备〔2026〕第0005号', subjectId: 'SUB-0010', subjectName: '肥西县严店种粮大户集群', regionCode: '340123', year: 2026, planArea: 180, actualArea: 178, expectedYield: 810, actualYield: 822, price: 562, amount: 46.2, status: '已完成', harvestTime: '2026-05-15', buyer: '合肥某饲料公司' },
  { id: 'TZ-2026-0004', filedNo: '皖青贮备〔2026〕第0006号', subjectId: 'SUB-0008', subjectName: '涡阳县刘桥家庭农场', regionCode: '341622', year: 2026, planArea: 320, actualArea: 312, expectedYield: 1280, actualYield: 1150, price: 471, amount: 54.2, status: '已完成', harvestTime: '2026-08-30', buyer: '自用（本场养殖）' },
  { id: 'TZ-2026-0005', filedNo: '皖青贮备〔2026〕第0007号', subjectId: 'SUB-0012', subjectName: '长丰县水湖草莓粮经合作社', regionCode: '340121', year: 2026, planArea: 380, actualArea: 0, expectedYield: 1520, actualYield: null, price: 490, amount: null, status: '收储中', harvestTime: '预计2026-09-30', buyer: '自用（本场养殖）' },
  { id: 'TZ-2026-0006', filedNo: '皖青贮补〔2026〕第0001号', subjectId: 'SUB-0004', subjectName: '旧县镇赵多种植大户', regionCode: '341222104', year: 2026, planArea: 85, actualArea: 85, expectedYield: 340, actualYield: 335, price: 350, amount: 11.7, status: '已完成', harvestTime: '2026-05-22', buyer: '补充收储（受灾）', isSupplement: true }
]
