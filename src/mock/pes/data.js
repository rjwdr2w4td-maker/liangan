// 农药监管 Mock：主体、产品批次、流向记录
import { offsetPoint } from '@/map/geoUtils'

// ===== 主体（生产4 / 经营25 / 使用30 / 回收5）=====
const buildPesSubjects = () => {
  const subjects = []
  // 生产企业
  const producers = [
    { id: 'PES-P-0001', name: '安徽华星化工有限公司', city: '合肥市', regionCode: '340123', center: [116.854, 31.708], license: '农药生许字(皖)第001号', capacity: '20000吨/年', status: '正常' },
    { id: 'PES-P-0002', name: '安徽久易农业股份有限公司', city: '合肥市', regionCode: '340121', center: [117.167, 32.479], license: '农药生许字(皖)第002号', capacity: '15000吨/年', status: '正常' },
    { id: 'PES-P-0003', name: '安徽广信农化股份有限公司', city: '宣城市', regionCode: '341822', center: [118.42, 30.63], license: '农药生许字(皖)第003号', capacity: '30000吨/年', status: '正常' },
    { id: 'PES-P-0004', name: '安徽中山化工有限公司', city: '池州市', regionCode: '341721', center: [117.49, 30.66], license: '农药生许字(皖)第004号', capacity: '12000吨/年', status: '停产整改' }
  ]
  producers.forEach((p) => subjects.push({ ...p, type: 'produce', legal: '张某某', address: `安徽省${p.city}经济开发区` }))

  // 经营网点（含演示主角刘敏的门店）
  const shops = [
    { id: 'PES-S-0012', name: '太和县皖丰农资经营部', regionCode: '341222', center: [115.622, 33.16], owner: '刘敏' },
    { id: 'PES-S-0001', name: '合肥丰乐农资连锁总店', regionCode: '340104', center: [117.26, 31.85], owner: '王某' },
    { id: 'PES-S-0002', name: '肥西县农资放心店（上派镇）', regionCode: '340123', center: [116.86, 31.72], owner: '李某' },
    { id: 'PES-S-0003', name: '长丰县下塘农资店', regionCode: '340121', center: [117.17, 32.47], owner: '赵某' },
    { id: 'PES-S-0004', name: '涡阳县雉河农资经营部', regionCode: '341622', center: [116.21, 33.49], owner: '马某' },
    { id: 'PES-S-0005', name: '阜阳颍州农资大市场三店', regionCode: '341202', center: [115.8, 32.88], owner: '周某' },
    { id: 'PES-S-0006', name: '蒙城县庄周农资店', regionCode: '341621', center: [116.56, 33.26], owner: '陈某' },
    { id: 'PES-S-0007', name: '亳州谯城农资连锁店', regionCode: '341602', center: [115.78, 33.85], owner: '吴某' },
    { id: 'PES-S-0008', name: '宿州埇桥农资经营部', regionCode: '341302', center: [116.96, 33.64], owner: '郑某' },
    { id: 'PES-S-0009', name: '蚌埠淮上农资店', regionCode: '340311', center: [117.39, 32.95], owner: '冯某' },
    { id: 'PES-S-0010', name: '淮南田家庵农资店', regionCode: '340403', center: [117.02, 32.64], owner: '褚某' },
    { id: 'PES-S-0011', name: '滁州南谯农资经营部', regionCode: '341103', center: [118.34, 32.3], owner: '卫某' }
  ]
  shops.forEach((s, i) => subjects.push({
    ...s, type: 'operate', legal: s.owner, address: `安徽省${s.name.slice(0, 4)}`,
    license: `农药经许(皖)第${String(i + 1).padStart(3, '0')}号`, status: i === 8 ? '责令整改' : '正常'
  }))

  // 使用主体（规模种植主体）
  const users = [
    { id: 'SUB-0001', name: '太和县丰乐种植专业合作社', regionCode: '341222', center: [115.62, 33.17] },
    { id: 'SUB-0002', name: '太和县绿源家庭农场', regionCode: '341222', center: [115.6, 33.15] },
    { id: 'SUB-0007', name: '涡阳县丰收种植合作社', regionCode: '341622', center: [116.2, 33.5] },
    { id: 'SUB-0009', name: '肥西县三河现代农业公司', regionCode: '340123', center: [116.85, 31.71] },
    { id: 'SUB-0011', name: '长丰县下塘龙虾稻田农场', regionCode: '340121', center: [117.16, 32.48] },
    { id: 'SUB-0006', name: '太和县税镇镇兴农合作社', regionCode: '341222', center: [115.45, 33.2] }
  ]
  users.forEach((u) => subjects.push({ ...u, type: 'use', crops: '小麦、玉米、水稻', status: '正常' }))

  // 回收处理主体
  const recyclers = [
    { id: 'PES-R-0001', name: '合肥绿源包装废弃物回收中心', regionCode: '340111', center: [117.15, 31.78], capacity: '500吨/年' },
    { id: 'PES-R-0002', name: '阜阳农资包装回收站', regionCode: '341202', center: [115.79, 32.87], capacity: '300吨/年' },
    { id: 'PES-R-0003', name: '亳州利农回收处理公司', regionCode: '341602', center: [115.77, 33.84], capacity: '400吨/年' }
  ]
  recyclers.forEach((r) => subjects.push({ ...r, type: 'recycle', legal: '钱某某', status: '正常' }))

  return subjects
}

export const PES_SUBJECTS = buildPesSubjects()
export const PES_SUBJECT_MAP = Object.fromEntries(PES_SUBJECTS.map((s) => [s.id, s]))

// 主体点位 GeoJSON
export const pesSubjectsGeoJSON = (types) => ({
  type: 'FeatureCollection',
  features: PES_SUBJECTS.filter((s) => types.includes(s.type)).map((s) => ({
    type: 'Feature',
    properties: { id: s.id, name: s.name, type: s.type, status: s.status, license: s.license || '' },
    geometry: { type: 'Point', coordinates: s.center }
  }))
})

// ===== 产品与批次 =====
export const PES_PRODUCTS = [
  { id: 'PRD-0001', regNo: 'PD20140236', name: '草甘膦异丙胺盐水剂', toxA: 'low', toxAName: '低毒', formulation: '水剂', content: '30%', trademark: '农达', brand: '除草剂', producer: 'PES-P-0001', producerName: '安徽华星化工有限公司', crops: '非耕地', targets: '杂草' },
  { id: 'PRD-0002', regNo: 'PD20181052', name: '吡虫啉悬浮剂', toxA: 'low', toxAName: '低毒', formulation: '悬浮剂', content: '20%', trademark: '大功臣', brand: '杀虫剂', producer: 'PES-P-0002', producerName: '安徽久易农业股份有限公司', crops: '小麦、水稻', targets: '蚜虫、飞虱' },
  { id: 'PRD-0003', regNo: 'PD20200641', name: '阿维菌素乳油', toxA: 'medium', toxAName: '中等毒', formulation: '乳油', content: '1.8%', trademark: '虫螨克', brand: '杀虫剂', producer: 'PES-P-0003', producerName: '安徽广信农化股份有限公司', crops: '玉米、蔬菜', targets: '玉米螟、红蜘蛛' },
  { id: 'PRD-0004', regNo: 'PD20150918', name: '多菌灵可湿性粉剂', toxA: 'low', toxAName: '低毒', formulation: '可湿性粉剂', content: '50%', trademark: '霉灵', brand: '杀菌剂', producer: 'PES-P-0001', producerName: '安徽华星化工有限公司', crops: '小麦', targets: '赤霉病、白粉病' },
  { id: 'PRD-0005', regNo: 'PD20172306', name: '高效氯氟氰菊酯水乳剂', toxA: 'medium', toxAName: '中等毒', formulation: '水乳剂', content: '2.5%', trademark: '锐宁', brand: '杀虫剂', producer: 'PES-P-0002', producerName: '安徽久易农业股份有限公司', crops: '小麦、玉米', targets: '蚜虫、粘虫' },
  { id: 'PRD-0006', regNo: 'PD20191472', name: '戊唑醇悬浮剂', toxA: 'low', toxAName: '低毒', formulation: '悬浮剂', content: '43%', trademark: '立克秀', brand: '杀菌剂', producer: 'PES-P-0003', producerName: '安徽广信农化股份有限公司', crops: '小麦', targets: '纹枯病、锈病' },
  { id: 'PRD-0007', regNo: 'PD20160385', name: '敌敌畏乳油', toxA: 'high', toxAName: '高毒', formulation: '乳油', content: '77.5%', trademark: '必歼', brand: '杀虫剂', producer: 'PES-P-0004', producerName: '安徽中山化工有限公司', crops: '仓储害虫', targets: '多种害虫', restricted: true },
  { id: 'PRD-0008', regNo: 'PD20210884', name: '噻虫嗪种子处理悬浮剂', toxA: 'low', toxAName: '低毒', formulation: '种衣剂', content: '30%', trademark: '锐胜', brand: '杀虫剂', producer: 'PES-P-0002', producerName: '安徽久易农业股份有限公司', crops: '小麦、玉米', targets: '地下害虫' }
]

// 批次
export const PES_BATCHES = [
  { id: 'BAT-2601', productId: 'PRD-0001', batchNo: 'HG20260301A', produceDate: '2026-03-01', qty: 800, unit: '吨', qr: 'https://pms.ah.gov.cn/qr/HG20260301A' },
  { id: 'BAT-2602', productId: 'PRD-0002', batchNo: 'JY20260412B', produceDate: '2026-04-12', qty: 500, unit: '吨', qr: 'https://pms.ah.gov.cn/qr/JY20260412B' },
  { id: 'BAT-2603', productId: 'PRD-0003', batchNo: 'GX20260420C', produceDate: '2026-04-20', qty: 320, unit: '吨', qr: 'https://pms.ah.gov.cn/qr/GX20260420C' },
  { id: 'BAT-2604', productId: 'PRD-0004', batchNo: 'HG20260505A', produceDate: '2026-05-05', qty: 600, unit: '吨', qr: 'https://pms.ah.gov.cn/qr/HG20260505A' },
  { id: 'BAT-2605', productId: 'PRD-0005', batchNo: 'JY20260618B', produceDate: '2026-06-18', qty: 280, unit: '吨', qr: 'https://pms.ah.gov.cn/qr/JY20260618B' },
  { id: 'BAT-2606', productId: 'PRD-0006', batchNo: 'GX20260702C', produceDate: '2026-07-02', qty: 450, unit: '吨', qr: 'https://pms.ah.gov.cn/qr/GX20260702C' },
  { id: 'BAT-2607', productId: 'PRD-0002', batchNo: 'JY20260815D', produceDate: '2026-08-15', qty: 420, unit: '吨', qr: 'https://pms.ah.gov.cn/qr/JY20260815D' },
  { id: 'BAT-2608', productId: 'PRD-0008', batchNo: 'JY20260901E', produceDate: '2026-09-01', qty: 260, unit: '吨', qr: 'https://pms.ah.gov.cn/qr/JY20260901E' }
]

export const PES_PRODUCT_MAP = Object.fromEntries(PES_PRODUCTS.map((p) => [p.id, p]))
export const PES_BATCH_MAP = Object.fromEntries(PES_BATCHES.map((b) => [b.id, b]))

// ===== 流向记录 =====
// type: produce 生产入库 / purchase 采购入库 / sale 销售出库 / buy 购买 / return 退货
// from/to: 主体id
const buildFlows = () => {
  const flows = []
  let id = 1
  const add = (batchId, type, from, to, qty, date, extra = {}) => {
    flows.push({ id: `FLW-${String(id++).padStart(4, '0')}`, batchId, type, from, to, qty, unit: '吨', date, regionCode: '340000', ...extra })
  }

  // 链路1：草甘膦（完整链 + 断点）
  add('BAT-2601', 'produce', 'PES-P-0001', 'PES-P-0001', 800, '2026-03-05')
  add('BAT-2601', 'sale', 'PES-P-0001', 'PES-S-0012', 120, '2026-03-20')
  add('BAT-2601', 'sale', 'PES-P-0001', 'PES-S-0002', 200, '2026-03-22')
  add('BAT-2601', 'sale', 'PES-P-0001', 'PES-S-0004', 150, '2026-03-25')
  add('BAT-2601', 'buy', 'PES-S-0012', 'SUB-0001', 8, '2026-04-02', { buyerName: '太和县丰乐种植专业合作社', realName: true })
  add('BAT-2601', 'buy', 'PES-S-0012', 'SUB-0002', 5, '2026-04-05', { buyerName: '太和县绿源家庭农场', realName: true })
  add('BAT-2601', 'buy', 'PES-S-0002', 'SUB-0009', 40, '2026-04-10', { buyerName: '肥西县三河现代农业公司', realName: true })
  // 断点链：涡阳店售出但购买方缺失
  add('BAT-2601', 'sale', 'PES-P-0001', 'PES-S-0004', 150, '2026-03-25', { breakPoint: true })
  add('BAT-2601', 'sale', 'PES-S-0004', null, 60, '2026-04-18', { buyerName: null, realName: false, breakPoint: true, remark: '购买方信息缺失' })

  // 链路2：吡虫啉（完整链）
  add('BAT-2602', 'produce', 'PES-P-0002', 'PES-P-0002', 500, '2026-04-15')
  add('BAT-2602', 'sale', 'PES-P-0002', 'PES-S-0012', 80, '2026-04-28')
  add('BAT-2602', 'sale', 'PES-P-0002', 'PES-S-0005', 100, '2026-04-30')
  add('BAT-2602', 'buy', 'PES-S-0012', 'SUB-0001', 6, '2026-05-06', { buyerName: '太和县丰乐种植专业合作社', realName: true })
  add('BAT-2602', 'buy', 'PES-S-0012', 'SUB-0006', 4, '2026-05-08', { buyerName: '太和县税镇镇兴农合作社', realName: true })
  add('BAT-2602', 'buy', 'PES-S-0005', 'SUB-0007', 12, '2026-05-12', { buyerName: '涡阳县丰收种植合作社', realName: true })
  add('BAT-2602', 'return', 'SUB-0007', 'PES-S-0005', 2, '2026-05-20', { remark: '包装破损退货' })

  // 链路3：阿维菌素
  add('BAT-2603', 'produce', 'PES-P-0003', 'PES-P-0003', 320, '2026-04-25')
  add('BAT-2603', 'sale', 'PES-P-0003', 'PES-S-0006', 60, '2026-05-10')
  add('BAT-2603', 'sale', 'PES-P-0003', 'PES-S-0011', 45, '2026-05-12')
  add('BAT-2603', 'buy', 'PES-S-0006', 'SUB-0007', 5, '2026-05-25', { buyerName: '涡阳县丰收种植合作社', realName: true })
  add('BAT-2603', 'buy', 'PES-S-0011', 'SUB-0001', 3, '2026-05-28', { buyerName: '太和县丰乐种植专业合作社', realName: true })

  // 链路4：多菌灵
  add('BAT-2604', 'produce', 'PES-P-0001', 'PES-P-0001', 600, '2026-05-08')
  add('BAT-2604', 'sale', 'PES-P-0001', 'PES-S-0012', 90, '2026-05-20')
  add('BAT-2604', 'buy', 'PES-S-0012', 'SUB-0004', 2, '2026-05-26', { buyerName: '旧县镇赵多种植大户', realName: true })
  add('BAT-2604', 'buy', 'PES-S-0012', 'SUB-0005', 1.5, '2026-05-27', { buyerName: '旧县镇田乐家庭农场', realName: true })

  // 链路5：戊唑醇
  add('BAT-2606', 'produce', 'PES-P-0003', 'PES-P-0003', 450, '2026-07-05')
  add('BAT-2606', 'sale', 'PES-P-0003', 'PES-S-0012', 70, '2026-07-18')
  add('BAT-2606', 'buy', 'PES-S-0012', 'SUB-0002', 3, '2026-07-22', { buyerName: '太和县绿源家庭农场', realName: true })

  // 链路6：噻虫嗪
  add('BAT-2608', 'produce', 'PES-P-0002', 'PES-P-0002', 260, '2026-09-03')
  add('BAT-2608', 'sale', 'PES-P-0002', 'PES-S-0003', 50, '2026-09-15')
  add('BAT-2608', 'buy', 'PES-S-0003', 'SUB-0011', 2, '2026-09-20', { buyerName: '长丰县下塘龙虾稻田农场', realName: true })

  // 库存调整：退货回流
  add('BAT-2602', 'return', 'SUB-0007', 'PES-S-0005', 2, '2026-05-20', { remark: '包装破损退货' })

  return flows
}

export const PES_FLOWS = buildFlows()

// ===== 包装废弃物回收 =====
export const PES_RECYCLES = [
  { id: 'RC-0001', stationId: 'PES-R-0002', stationName: '阜阳农资包装回收站', regionCode: '341202', date: '2026-09-20', fromSubject: 'PES-S-0012', fromName: '太和县皖丰农资经营部', type: '农药瓶', count: 4200, weight: 210, handle: '无害化焚烧处置', voucher: 'HZ-2026-0920', status: '已完成' },
  { id: 'RC-0002', stationId: 'PES-R-0001', stationName: '合肥绿源包装废弃物回收中心', regionCode: '340111', date: '2026-09-18', fromSubject: 'PES-S-0001', fromName: '合肥丰乐农资连锁总店', type: '农药袋', count: 8600, weight: 172, handle: '资源化利用', voucher: 'HZ-2026-0918', status: '已完成' },
  { id: 'RC-0003', stationId: 'PES-R-0003', stationName: '亳州利农回收处理公司', regionCode: '341602', date: '2026-09-25', fromSubject: 'PES-S-0006', fromName: '蒙城县庄周农资店', type: '农药瓶', count: 3100, weight: 155, handle: '无害化焚烧处置', voucher: 'HZ-2026-0925', status: '运输中' }
]

// ===== 生产月度统计（演示）=====
export const PES_MONTHLY_STATS = [
  { month: '2026-04', output: 820, sales: 780, salesAmount: 2350, export: 120 },
  { month: '2026-05', output: 910, sales: 860, salesAmount: 2610, export: 150 },
  { month: '2026-06', output: 780, sales: 800, salesAmount: 2420, export: 90 },
  { month: '2026-07', output: 850, sales: 820, salesAmount: 2500, export: 110 },
  { month: '2026-08', output: 900, sales: 870, salesAmount: 2680, export: 160 },
  { month: '2026-09', output: 880, sales: 840, salesAmount: 2590, export: 140 }
]
