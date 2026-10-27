// 粮食计划管理 Mock：年度计划、分解、落实、进度、政策、防灾减灾
import { getRegion, listCities } from '@/mock/common/regions'
import { GROW_SUBJECTS, PLOTS } from '@/mock/geo/plot-gen'

export const PLANTING_PLAN_LIST = [
  { id: 'PLANT-2026-Q1', year: 2026, quarter: '第一季度', area: 2184, cropType: '小麦', description: '稳定夏粮播种面积，重点保障小麦生产任务落实。', attachmentName: '2026年第一季度小麦种植计划.pdf', status: '已分解' },
  { id: 'PLANT-2026-Q2', year: 2026, quarter: '第二季度', area: 3822, cropType: '水稻', description: '统筹早中晚稻生产布局，推进水稻绿色高质高效生产。', attachmentName: '2026年第二季度水稻种植计划.docx', status: '已分解' },
  { id: 'PLANT-2026-Q3', year: 2026, quarter: '第三季度', area: 3276, cropType: '玉米、大豆', description: '落实玉米大豆带状复合种植，稳定秋粮生产面积。', attachmentName: '', status: '待分解' },
  { id: 'PLANT-2026-Q4', year: 2026, quarter: '第四季度', area: 1638, cropType: '小麦、油菜', description: '做好秋冬种安排，提前落实冬小麦及轮作任务。', attachmentName: '', status: '待分解' },
  { id: 'PLANT-2025-Q4', year: 2025, quarter: '第四季度', area: 1580, cropType: '小麦、油菜', description: '2025年第四季度秋冬种植任务。', attachmentName: '2025年第四季度种植计划.pdf', status: '已分解' }
]

export const PLANTING_PLAN_CITY_TASKS = []

export const PROVINCE_PLAN = {
  year: 2026,
  id: 'PLAN-2026-PROV',
  name: '安徽省2026年粮食生产种植计划',
  remark: '围绕粮食安全责任制和年度生产目标，统筹安排主要粮食作物种植面积。',
  status: 'issued',
  totalArea: 10920,
  crops: [
    { crop: 'wheat', name: '小麦', area: 4280 },
    { crop: 'rice', name: '水稻', area: 2650 },
    { crop: 'corn', name: '玉米', area: 2480 },
    { crop: 'soybean', name: '大豆', area: 1510 }
  ],
  createdAt: '2026-08-20',
  issuedAt: '2026-09-10'
}

const CITY_WEIGHT = {
  '340100': 6.2, '340200': 2.1, '340300': 4.8, '340400': 3.6, '340500': 1.9,
  '340600': 2.9, '340700': 1.6, '340800': 4.2, '341000': 0.9, '341100': 6.8,
  '341200': 8.9, '341300': 7.2, '341500': 7.6, '341600': 7.8, '341700': 1.9, '341800': 2.4
}
const sumWeight = Object.values(CITY_WEIGHT).reduce((a, b) => a + b, 0)

export const CITY_PLANS = listCities().map((city, idx) => {
  const total = Math.round(PROVINCE_PLAN.totalArea * CITY_WEIGHT[city.code] / sumWeight)
  const wheat = Math.round(total * 0.39)
  const rice = Math.round(total * 0.24)
  const corn = Math.round(total * 0.23)
  return {
    id: `PLAN-2026-${city.code}`, year: 2026, cityCode: city.code, cityName: city.name,
    totalArea: total, wheat, rice, corn, soybean: total - wheat - rice - corn,
    status: ['issued', 'issued', 'issued', 'implementing'][idx % 4],
    implementRate: 55 + ((idx * 7) % 44), sowRate: 60 + ((idx * 11) % 38), harvestRate: (idx * 13) % 75
  }
})

const QUARTER_CONFIG = [
  { quarter: 'Q1', name: '第一季度', rate: 0.2 },
  { quarter: 'Q2', name: '第二季度', rate: 0.35 },
  { quarter: 'Q3', name: '第三季度', rate: 0.3 },
  { quarter: 'Q4', name: '第四季度', rate: 0.15 }
]

export const QUARTERLY_PLAN_TARGETS = QUARTER_CONFIG.map((item) => ({
  year: PROVINCE_PLAN.year,
  quarter: item.quarter,
  quarterName: item.name,
  totalArea: Math.round(PROVINCE_PLAN.totalArea * item.rate),
  crops: PROVINCE_PLAN.crops.map((crop) => ({ ...crop, area: Math.round(crop.area * item.rate) }))
}))

QUARTERLY_PLAN_TARGETS[QUARTERLY_PLAN_TARGETS.length - 1].totalArea = PROVINCE_PLAN.totalArea - QUARTERLY_PLAN_TARGETS.slice(0, -1).reduce((sum, item) => sum + item.totalArea, 0)
QUARTERLY_PLAN_TARGETS[QUARTERLY_PLAN_TARGETS.length - 1].crops = PROVINCE_PLAN.crops.map((crop) => ({
  ...crop,
  area: crop.area - QUARTERLY_PLAN_TARGETS.slice(0, -1).reduce((sum, item) => sum + Number(item.crops.find((row) => row.crop === crop.crop)?.area || 0), 0)
}))

export const CITY_QUARTER_ALLOCATIONS = QUARTERLY_PLAN_TARGETS.flatMap((target) => CITY_PLANS.map((city, index) => {
  const totalArea = Math.round(target.totalArea * CITY_WEIGHT[city.cityCode] / sumWeight)
  const wheat = Math.round(totalArea * city.wheat / city.totalArea)
  const rice = Math.round(totalArea * city.rice / city.totalArea)
  const corn = Math.round(totalArea * city.corn / city.totalArea)
  return {
    id: `CLAIM-${target.year}-${target.quarter}-${city.cityCode}`,
    year: target.year,
    quarter: target.quarter,
    quarterName: target.quarterName,
    cityCode: city.cityCode,
    cityName: city.cityName,
    targetArea: totalArea,
    claimedArea: totalArea,
    wheat,
    rice,
    corn,
    soybean: totalArea - wheat - rice - corn,
    status: '已领取',
    claimedAt: '2026-01-15'
  }
}))

export const COUNTY_PLANS = [
  { id: 'PLAN-2026-341222', year: 2026, countyCode: '341222', countyName: '太和县', cityCode: '341200', totalArea: 302, wheat: 128, rice: 32, corn: 96, soybean: 46, status: 'implementing', implementRate: 78, sowRate: 86, harvestRate: 42 },
  { id: 'PLAN-2026-341226', year: 2026, countyCode: '341226', countyName: '颍上县', cityCode: '341200', totalArea: 300, wheat: 115, rice: 90, corn: 65, soybean: 30, status: 'issued', implementRate: 84, sowRate: 89, harvestRate: 51 },
  { id: 'PLAN-2026-341221', year: 2026, countyCode: '341221', countyName: '临泉县', cityCode: '341200', totalArea: 290, wheat: 125, rice: 48, corn: 75, soybean: 42, status: 'implementing', implementRate: 73, sowRate: 81, harvestRate: 39 },
  { id: 'PLAN-2026-341225', year: 2026, countyCode: '341225', countyName: '阜南县', cityCode: '341200', totalArea: 265, wheat: 105, rice: 88, corn: 45, soybean: 27, status: 'issued', implementRate: 69, sowRate: 77, harvestRate: 36 },
  { id: 'PLAN-2026-341282', year: 2026, countyCode: '341282', countyName: '界首市', cityCode: '341200', totalArea: 216, wheat: 62, rice: 72, corn: 35, soybean: 47, status: 'issued', implementRate: 88, sowRate: 92, harvestRate: 57 },
  { id: 'PLAN-2026-341622', year: 2026, countyCode: '341622', countyName: '涡阳县', cityCode: '341600', totalArea: 358, wheat: 152, rice: 18, corn: 128, soybean: 60, status: 'implementing', implementRate: 71, sowRate: 82, harvestRate: 38 },
  { id: 'PLAN-2026-340123', year: 2026, countyCode: '340123', countyName: '肥西县', cityCode: '340100', totalArea: 186, wheat: 58, rice: 74, corn: 30, soybean: 24, status: 'implementing', implementRate: 66, sowRate: 78, harvestRate: 51 },
  { id: 'PLAN-2026-340121', year: 2026, countyCode: '340121', countyName: '长丰县', cityCode: '340100', totalArea: 172, wheat: 52, rice: 66, corn: 28, soybean: 26, status: 'implementing', implementRate: 62, sowRate: 74, harvestRate: 47 }
]

export const TOWN_PLANS = [
  { id: 'PLAN-2026-341222104', year: 2026, townCode: '341222104', townName: '旧县镇', countyCode: '341222', totalArea: 70, wheat: 30, rice: 8, corn: 22, soybean: 10, status: 'implementing', implementRate: 92, sowRate: 96, harvestRate: 70 },
  { id: 'PLAN-2026-341222103', year: 2026, townCode: '341222103', townName: '大新镇', countyCode: '341222', totalArea: 62, wheat: 26, rice: 7, corn: 20, soybean: 9, status: 'implementing', implementRate: 68, sowRate: 81, harvestRate: 48 },
  { id: 'PLAN-2026-341222108', year: 2026, townCode: '341222108', townName: '税镇镇', countyCode: '341222', totalArea: 58, wheat: 24, rice: 6, corn: 18, soybean: 10, status: 'implementing', implementRate: 55, sowRate: 73, harvestRate: 39 },
  { id: 'PLAN-2026-341222112', year: 2026, townCode: '341222112', townName: '皮条孙镇', countyCode: '341222', totalArea: 54, wheat: 22, rice: 5, corn: 18, soybean: 9, status: 'issued', implementRate: 43, sowRate: 62, harvestRate: 31 },
  { id: 'PLAN-2026-341222101', year: 2026, townCode: '341222101', townName: '城关镇', countyCode: '341222', totalArea: 58, wheat: 26, rice: 6, corn: 18, soybean: 8, status: 'issued', implementRate: 81, sowRate: 88, harvestRate: 54 }
]

const definedTownCodes = new Set(TOWN_PLANS.map(item => item.townCode))
const ALL_TOWN_PLANS = COUNTY_PLANS.flatMap((county) => {
  const children = getRegion(county.countyCode)?.children || []
  const missing = children.filter(town => !definedTownCodes.has(town.code))
  return missing.map((town, index) => {
    const count = missing.length || 1
    return {
      id: `PLAN-2026-${town.code}`,
      year: county.year,
      townCode: town.code,
      townName: town.name,
      countyCode: county.countyCode,
      totalArea: Number((county.totalArea / count).toFixed(1)),
      wheat: Number((county.wheat / count).toFixed(1)),
      rice: Number((county.rice / count).toFixed(1)),
      corn: Number((county.corn / count).toFixed(1)),
      soybean: Number((county.soybean / count).toFixed(1)),
      status: index % 2 ? 'issued' : 'implementing'
    }
  })
})
const SOWING_TOWN_PLANS = [...TOWN_PLANS, ...ALL_TOWN_PLANS]

const sowingCropKeys = ['wheat', 'rice', 'corn', 'soybean']
const sowingRowsFromPlans = (plans, level) => plans.flatMap((plan) => sowingCropKeys.map((crop, index) => {
  const planArea = Number(plan[crop] || 0)
  const sownArea = Number((planArea * (0.58 + ((index + String(plan.id).length) % 25) / 100)).toFixed(1))
  const regionCode = level === 'city' ? plan.cityCode : level === 'county' ? plan.countyCode : plan.townCode
  const regionName = level === 'city' ? plan.cityName : level === 'county' ? plan.countyName : plan.townName
  return {
    id: `SOW-${level}-${regionCode}-${crop}`,
    year: plan.year,
    level,
    regionCode,
    regionName,
    cityCode: plan.cityCode || (level === 'city' ? plan.cityCode : String(plan.countyCode || '').slice(0, 4) + '00'),
    countyCode: plan.countyCode || (level === 'county' ? plan.countyCode : ''),
    townCode: plan.townCode || (level === 'town' ? plan.townCode : ''),
    crop,
    planArea,
    sownArea,
    updatedAt: '2026-10-20'
  }
}))

const sowingSubjectRows = () => GROW_SUBJECTS.flatMap((subject, subjectIndex) => {
  const townPlans = SOWING_TOWN_PLANS.filter(plan => plan.countyCode === subject.regionCode || plan.townCode === subject.regionCode)
  const countyPlan = COUNTY_PLANS.find(plan => plan.countyCode === subject.regionCode)
  const townPlan = townPlans[subjectIndex % Math.max(townPlans.length, 1)] || (countyPlan ? {
    ...countyPlan,
    townCode: countyPlan.countyCode,
    townName: countyPlan.countyName
  } : null)
  if (!townPlan) return []
  const sourceRows = sowingRowsFromPlans([townPlan], 'town')
  const subjectsInRegion = GROW_SUBJECTS.filter(item => item.regionCode === subject.regionCode)
  const totalArea = subjectsInRegion.reduce((sum, item) => sum + Number(item.area || 0), 0)
  const ratio = totalArea ? Number(subject.area || 0) / totalArea : 0
  return sourceRows.map(row => ({
    ...row,
    id: `SOW-subject-${subject.id}-${row.crop}`,
    level: 'subject',
    regionCode: townPlan.townCode,
    regionName: townPlan.townName,
    subjectId: subject.id,
    subjectName: subject.name,
    planArea: Number((row.planArea * ratio).toFixed(1)),
    sownArea: Number((row.sownArea * ratio).toFixed(1))
  }))
})

const CURRENT_SOWING_PROGRESS_ROWS = [
  ...sowingRowsFromPlans(CITY_PLANS, 'city'),
  ...sowingRowsFromPlans(COUNTY_PLANS, 'county'),
  ...sowingRowsFromPlans(SOWING_TOWN_PLANS, 'town'),
  ...sowingSubjectRows()
]

export const SOWING_PROGRESS_ROWS = [
  ...CURRENT_SOWING_PROGRESS_ROWS,
  ...CURRENT_SOWING_PROGRESS_ROWS.map((row) => ({
    ...row,
    id: row.id.replace('SOW-', 'SOW-2025-'),
    year: 2025,
    planArea: Number((Number(row.planArea || 0) * 0.94).toFixed(1)),
    sownArea: Number((Number(row.sownArea || 0) * 0.91).toFixed(1)),
    updatedAt: '2025-10-22'
  })),
  ...CURRENT_SOWING_PROGRESS_ROWS.map((row) => ({
    ...row,
    id: row.id.replace('SOW-', 'SOW-2024-'),
    year: 2024,
    planArea: Number((Number(row.planArea || 0) * 0.88).toFixed(1)),
    sownArea: Number((Number(row.sownArea || 0) * 0.86).toFixed(1)),
    updatedAt: '2024-10-22'
  }))
]

export const HARVEST_PROGRESS_ROWS = SOWING_PROGRESS_ROWS.map((row, index) => ({
  ...row,
  id: row.id.replace('SOW-', 'HARVEST-'),
  harvestedArea: Number((Number(row.sownArea || 0) * (0.42 + (index % 19) / 100)).toFixed(1)),
  updatedAt: '2026-10-22'
}))

// 历史省级计划及下级任务分解演示数据
export const PLAN_HISTORY = [
  {
    id: 'PLAN-HISTORY-2025-PROV-V2', year: 2025, version: 'V2', name: '安徽省2025年粮食生产种植计划（调整版）',
    remark: '统筹夏粮和秋粮生产，优化水稻、玉米种植结构。', status: 'completed', totalArea: 10680,
    crops: [{ crop: 'wheat', name: '小麦', area: 4210 }, { crop: 'rice', name: '水稻', area: 2710 }, { crop: 'corn', name: '玉米', area: 2350 }, { crop: 'soybean', name: '大豆', area: 1410 }],
    createdAt: '2025-01-12', issuedAt: '2025-02-08', versionNote: '根据春季生产形势完成一次调整', decompositionSummary: { cityCount: 16, taskCount: 16, issuedArea: 10680 }
  },
  {
    id: 'PLAN-HISTORY-2025-PROV-V1', year: 2025, version: 'V1', name: '安徽省2025年粮食生产种植计划',
    remark: '年度粮食生产目标计划。', status: 'completed', totalArea: 10450,
    crops: [{ crop: 'wheat', name: '小麦', area: 4180 }, { crop: 'rice', name: '水稻', area: 2580 }, { crop: 'corn', name: '玉米', area: 2290 }, { crop: 'soybean', name: '大豆', area: 1400 }],
    createdAt: '2024-12-18', issuedAt: '2025-01-06', versionNote: '初始下达版本', decompositionSummary: { cityCount: 16, taskCount: 16, issuedArea: 10450 }
  },
  {
    id: 'PLAN-HISTORY-2024-PROV-V1', year: 2024, version: 'V1', name: '安徽省2024年粮食生产种植计划',
    remark: '稳定粮食播种面积，提升主要粮食作物综合产能。', status: 'completed', totalArea: 10120,
    crops: [{ crop: 'wheat', name: '小麦', area: 4020 }, { crop: 'rice', name: '水稻', area: 2510 }, { crop: 'corn', name: '玉米', area: 2220 }, { crop: 'soybean', name: '大豆', area: 1370 }],
    createdAt: '2023-12-20', issuedAt: '2024-01-15', versionNote: '年度正式版本', decompositionSummary: { cityCount: 16, taskCount: 16, issuedArea: 10120 }
  }
]

export const TASK_HISTORY = [
  { id: 'TASK-HISTORY-2025-CITY-341200', year: 2025, level: 'city', levelName: '市级', regionCode: '341200', regionName: '阜阳市', parentPlanId: 'PLAN-HISTORY-2025-PROV-V2', parentPlanName: '安徽省2025年粮食生产种植计划（调整版）', totalArea: 965, crops: { wheat: 380, rice: 260, corn: 195, soybean: 130 }, status: 'completed', issuedAt: '2025-02-10', issuer: '安徽省农业农村厅', issueRecords: [{ time: '2025-02-10 09:30', issuer: '安徽省农业农村厅', action: '下达至阜阳市' }] },
  { id: 'TASK-HISTORY-2025-COUNTY-341222', year: 2025, level: 'county', levelName: '县级', regionCode: '341222', regionName: '太和县', parentPlanId: 'PLAN-HISTORY-2025-CITY-341200', parentPlanName: '阜阳市2025年粮食生产任务', totalArea: 198, crops: { wheat: 82, rice: 30, corn: 58, soybean: 28 }, status: 'completed', issuedAt: '2025-02-18', issuer: '阜阳市农业农村局', issueRecords: [{ time: '2025-02-18 15:00', issuer: '阜阳市农业农村局', action: '下达至太和县' }] },
  { id: 'TASK-HISTORY-2025-TOWN-341222104', year: 2025, level: 'town', levelName: '乡镇', regionCode: '341222104', regionName: '旧县镇', parentPlanId: 'TASK-HISTORY-2025-COUNTY-341222', parentPlanName: '太和县2025年粮食生产任务', totalArea: 48, crops: { wheat: 20, rice: 8, corn: 13, soybean: 7 }, status: 'completed', issuedAt: '2025-02-26', issuer: '太和县农业农村局', issueRecords: [{ time: '2025-02-26 10:20', issuer: '太和县农业农村局', action: '下达至旧县镇' }] },
  { id: 'TASK-HISTORY-2024-CITY-341200', year: 2024, level: 'city', levelName: '市级', regionCode: '341200', regionName: '阜阳市', parentPlanId: 'PLAN-HISTORY-2024-PROV-V1', parentPlanName: '安徽省2024年粮食生产种植计划', totalArea: 920, crops: { wheat: 365, rice: 245, corn: 185, soybean: 125 }, status: 'completed', issuedAt: '2024-01-20', issuer: '安徽省农业农村厅', issueRecords: [{ time: '2024-01-20 09:00', issuer: '安徽省农业农村厅', action: '下达至阜阳市' }] },
  { id: 'TASK-HISTORY-2024-COUNTY-341222', year: 2024, level: 'county', levelName: '县级', regionCode: '341222', regionName: '太和县', parentPlanId: 'TASK-HISTORY-2024-CITY-341200', parentPlanName: '阜阳市2024年粮食生产任务', totalArea: 186, crops: { wheat: 76, rice: 28, corn: 55, soybean: 27 }, status: 'completed', issuedAt: '2024-01-28', issuer: '阜阳市农业农村局', issueRecords: [{ time: '2024-01-28 14:00', issuer: '阜阳市农业农村局', action: '下达至太和县' }] }
]

export const TASK_PATH_DETAILS = [
  { id: 'PATH-001', planName: '2026年第一季度小麦种植计划', year: 2026, quarter: '第一季度', cropType: '小麦', cityCode: '341200', cityName: '阜阳市', countyCode: '341222', countyName: '太和县', townCode: '341222104', townName: '旧县镇', subjectId: 'SUB-0004', subjectName: '旧县镇赵多种植大户', owner: '赵磊', taskArea: 220, issuedAt: '2026-02-26', status: '已落实', progress: 100 },
  { id: 'PATH-002', planName: '2026年第一季度小麦种植计划', year: 2026, quarter: '第一季度', cropType: '小麦', cityCode: '341200', cityName: '阜阳市', countyCode: '341222', countyName: '太和县', townCode: '341222104', townName: '旧县镇', subjectId: 'SUB-0005', subjectName: '旧县镇田乐家庭农场', owner: '田乐', taskArea: 180, issuedAt: '2026-02-26', status: '落实中', progress: 82 },
  { id: 'PATH-003', planName: '2026年第一季度小麦种植计划', year: 2026, quarter: '第一季度', cropType: '小麦', cityCode: '341200', cityName: '阜阳市', countyCode: '341222', countyName: '太和县', townCode: '341222103', townName: '大新镇', subjectId: 'SUB-0001', subjectName: '太和县丰乐种植专业合作社', owner: '陈勇', taskArea: 620, issuedAt: '2026-02-27', status: '落实中', progress: 76 },
  { id: 'PATH-004', planName: '2026年第二季度水稻种植计划', year: 2026, quarter: '第二季度', cropType: '水稻', cityCode: '341200', cityName: '阜阳市', countyCode: '341226', countyName: '颍上县', townCode: '341226106', townName: '润河镇', subjectId: 'SUB-0101', subjectName: '颍上县润河合作社', owner: '周明', taskArea: 760, issuedAt: '2026-04-18', status: '已下达', progress: 35 },
  { id: 'PATH-005', planName: '2026年第一季度小麦种植计划', year: 2026, quarter: '第一季度', cropType: '小麦', cityCode: '341600', cityName: '亳州市', countyCode: '341622', countyName: '涡阳县', townCode: '341622105', townName: '义门镇', subjectId: 'SUB-0007', subjectName: '涡阳县丰收种植合作社', owner: '马丰', taskArea: 850, issuedAt: '2026-02-28', status: '落实中', progress: 71 },
  { id: 'PATH-006', planName: '2026年第二季度水稻种植计划', year: 2026, quarter: '第二季度', cropType: '水稻', cityCode: '340100', cityName: '合肥市', countyCode: '340123', countyName: '肥西县', townCode: '340123101', townName: '三河镇', subjectId: 'SUB-0009', subjectName: '肥西县三河现代农业公司', owner: '张三河', taskArea: 1100, issuedAt: '2026-04-20', status: '已落实', progress: 100 }
].map((item) => ({
  ...item,
  path: `${item.cityName} / ${item.countyName} / ${item.townName} / ${item.subjectName}`,
  nodes: [
    { level: '市级', name: item.cityName, unit: `${item.cityName}农业农村局`, status: '已下达' },
    { level: '县级', name: item.countyName, unit: `${item.countyName}农业农村局`, status: '已下达' },
    { level: '乡级', name: item.townName, unit: `${item.townName}人民政府`, status: '已下达' },
    { level: '种植主体', name: item.subjectName, unit: item.owner, status: item.status }
  ]
}))

export const PLAN_SUBJECTS = GROW_SUBJECTS.map((item, index) => ({
  ...item,
  contact: item.owner,
  primaryCrop: ['小麦', '水稻', '玉米', '大豆'][index % 4],
  regionName: getRegion(item.regionCode)?.path || item.regionCode,
  muInvestment: 680 + (index % 5) * 45,
  muNetIncome: 520 + (index % 6) * 60,
  registeredAt: `202${5 + (index % 2)}-${String((index % 9) + 1).padStart(2, '0')}-15`,
  plotCount: PLOTS.filter((plot) => plot.subjectId === item.id).length
}))

export const SUBJECT_PLOT_RELATIONS = PLOTS.filter((plot) => plot.subjectId).map((plot, index) => ({
  id: `REL-${String(index + 1).padStart(4, '0')}`,
  plotId: plot.id,
  plotName: plot.name,
  subjectId: plot.subjectId,
  subjectName: PLAN_SUBJECTS.find((item) => item.id === plot.subjectId)?.name || '',
  regionCode: plot.regionCode,
  regionName: PLAN_SUBJECTS.find((item) => item.id === plot.subjectId)?.regionCode || plot.regionCode,
  area: Number(plot.areaMu.toFixed(1)),
  crop: plot.crop,
  relationStatus: index % 4 === 0 ? '待确认' : '已关联',
  updatedAt: '2026-09-18'
}))

const CITY_COUNTY_PLAN_MAP = {
  '340100': ['肥西县', '长丰县', '肥东县', '巢湖市'],
  '340200': ['无为市', '南陵县', '湾沚区', '繁昌区'],
  '340300': ['怀远县', '五河县', '固镇县', '淮上区'],
  '341200': ['太和县', '临泉县', '阜南县', '颍上县'],
  '341300': ['萧县', '砀山县', '灵璧县', '泗县'],
  '341600': ['涡阳县', '蒙城县', '利辛县', '谯城区']
}

const auditCities = listCities().filter((city) => CITY_COUNTY_PLAN_MAP[city.code])
export const PLAN_AUDITS = auditCities.map((city, cityIndex) => {
  const plan = PLANTING_PLAN_LIST[cityIndex % 2]
  const totalArea = [168, 142, 126, 214, 176, 152][cityIndex]
  const countyNames = CITY_COUNTY_PLAN_MAP[city.code]
  const countyPlans = countyNames.map((countyName, countyIndex) => {
    const area = countyIndex === countyNames.length - 1
      ? Number((totalArea - countyNames.slice(0, -1).reduce((sum, _, index) => sum + Number((totalArea * [0.29, 0.26, 0.24][index]).toFixed(2)), 0)).toFixed(2))
      : Number((totalArea * [0.29, 0.26, 0.24][countyIndex]).toFixed(2))
    return {
      id: `COUNTY-TASK-${city.code}-${countyIndex + 1}`,
      countyName,
      area,
      actualArea: Number((area * [0.96, 0.91, 0.98][countyIndex % 3]).toFixed(2)),
      cropType: plan.cropType,
      description: `${countyName}${plan.year}年${plan.quarter}${plan.cropType}种植任务`,
      status: '已提交',
      cityAuditStatus: countyIndex % 3 === 0 ? 'approved' : countyIndex % 3 === 1 ? 'pending' : 'rejected',
      cityAuditor: `${city.name}农业农村局计划科`,
      cityAuditedAt: countyIndex % 3 === 1 ? '' : `2026-10-${String(15 + cityIndex + countyIndex).padStart(2, '0')}`,
      cityAuditOpinion: countyIndex % 3 === 2 ? '请补充乡镇分配依据后重新提交' : ''
    }
  })
  return {
    id: `AUDIT-CITY-${plan.id}-${city.code}`,
    type: '市级分解计划',
    targetId: plan.id,
    targetName: `${city.name}${plan.year}年${plan.quarter}县级任务分解计划`,
    planYear: plan.year,
    quarter: plan.quarter,
    cropType: plan.cropType,
    planDescription: plan.description,
    regionCode: city.code,
    regionName: city.name,
    submitter: `${city.name}农业农村局`,
    submittedAt: `2026-10-${String(10 + cityIndex).padStart(2, '0')}`,
    totalArea,
    actualArea: Number((totalArea * 0.95).toFixed(2)),
    countyCount: countyPlans.length,
    countyPlans,
    status: cityIndex % 3 === 0 ? 'pending' : cityIndex % 3 === 1 ? 'approved' : 'rejected',
    opinion: cityIndex % 3 === 2 ? '县级任务面积合计与市级领取任务不一致，请核实后重新提交' : ''
  }
})

export const PLAN_SUPERVISE = [
  { id: 'SUP-001', targetId: 'PLANT-2026-Q1', taskId: 'PLAN-2026-341222', targetName: '2026年第一季度小麦种植计划', regionCode: '341222', regionName: '太和县', supervisor: '省农业农村厅计划处', deadline: '2026-10-30', progress: 78, taskProgress: 78, sowingProgress: 82, harvestProgress: 36, completionRate: 78, unreportedSubjects: 3, abnormalArea: 126, logicIssues: 1, status: '监督中', issue: '任务落实进度滞后，仍有 3 个主体未填报，存在面积异常', lastFollowUp: '2026-10-10' },
  { id: 'SUP-002', targetId: 'PLANT-2026-Q3', taskId: 'PLAN-2026-341622', targetName: '2026年第三季度玉米、大豆种植计划', regionCode: '341622', regionName: '涡阳县', supervisor: '阜阳市农业农村局', deadline: '2026-10-25', progress: 92, taskProgress: 92, sowingProgress: 96, harvestProgress: 88, completionRate: 92, unreportedSubjects: 0, abnormalArea: 0, logicIssues: 0, status: '已完成', issue: '各项进度正常', lastFollowUp: '2026-10-08' },
  { id: 'SUP-003', targetId: 'PLANT-2026-Q2', taskId: 'PLAN-2026-340123', targetName: '2026年第二季度水稻种植计划', regionCode: '340123', regionName: '肥西县', supervisor: '合肥市农业农村局', deadline: '2026-10-28', progress: 64, taskProgress: 64, sowingProgress: 72, harvestProgress: 42, completionRate: 64, unreportedSubjects: 5, abnormalArea: 268, logicIssues: 2, status: '逾期预警', issue: '收获进度低于序时进度，存在未填报主体和数据逻辑异常', lastFollowUp: '2026-10-09' }
]

export const PLAN_STATS = {
  overview: { totalSubjects: PLAN_SUBJECTS.length, totalPlots: PLOTS.length, totalArea: PLAN_SUBJECTS.reduce((sum, item) => sum + item.area, 0) },
  crops: [{ name: '小麦', value: CITY_PLANS.reduce((sum, item) => sum + item.wheat, 0) }, { name: '水稻', value: CITY_PLANS.reduce((sum, item) => sum + item.rice, 0) }, { name: '玉米', value: CITY_PLANS.reduce((sum, item) => sum + item.corn, 0) }, { name: '大豆', value: CITY_PLANS.reduce((sum, item) => sum + item.soybean, 0) }],
  trend: [
    { month: '7月', planArea: 10920, implementRate: 48, sowRate: 35 }, { month: '8月', planArea: 10920, implementRate: 62, sowRate: 54 }, { month: '9月', planArea: 10920, implementRate: 78, sowRate: 71 }, { month: '10月', planArea: 10920, implementRate: 86, sowRate: 83 }
  ]
}

export const PLAN_PLOTS = [
  { id: 'PLOT-PLAN-001', planId: 'PLAN-2026-341222104', plotId: 'PL-0007', regionCode: '341222104', regionName: '旧县镇', subjectId: 'SUB-0004', subjectName: '旧县镇赵多种植大户', crop: 'wheat', cropName: '小麦', area: 220, status: 'implemented', implementedAt: '2026-09-20' },
  { id: 'PLOT-PLAN-002', planId: 'PLAN-2026-341222104', plotId: 'PL-0009', regionCode: '341222104', regionName: '旧县镇', subjectId: 'SUB-0005', subjectName: '旧县镇田乐家庭农场', crop: 'corn', cropName: '玉米', area: 180, status: 'implemented', implementedAt: '2026-09-22' },
  { id: 'PLOT-PLAN-003', planId: 'PLAN-2026-341222', plotId: 'PL-0001', regionCode: '341222', regionName: '太和县', subjectId: 'SUB-0001', subjectName: '太和县丰乐种植专业合作社', crop: 'corn', cropName: '玉米', area: 620, status: 'implemented', implementedAt: '2026-09-25' }
]

export const PROGRESS_RECORDS = [
  { id: 'PR-0001', planId: 'PLANT-2026-Q1', planName: '2026年第一季度小麦种植计划', regionCode: '341222104', regionName: '旧县镇', subjectId: 'SUB-0004', subjectName: '旧县镇赵多种植大户', plotId: 'PL-0007', crop: 'wheat', cropName: '小麦', type: 'harvest', area: 220, date: '2026-09-25', reporter: '赵磊', source: '皖政通填报' },
  { id: 'PR-0002', planId: 'PLANT-2026-Q1', planName: '2026年第一季度小麦种植计划', regionCode: '341222104', regionName: '旧县镇', subjectId: 'SUB-0005', subjectName: '旧县镇田乐家庭农场', plotId: 'PL-0009', crop: 'corn', cropName: '玉米', type: 'harvest', area: 180, date: '2026-09-26', reporter: '田乐', source: '皖企通填报' },
  { id: 'PR-0003', planId: 'PLANT-2026-Q1', planName: '2026年第一季度小麦种植计划', regionCode: '341222', regionName: '太和县', subjectId: 'SUB-0001', subjectName: '太和县丰乐种植专业合作社', plotId: 'PL-0001', crop: 'corn', cropName: '玉米', type: 'harvest', area: 620, date: '2026-09-27', reporter: '陈勇', source: '皖企通填报' },
  { id: 'PR-0004', planId: 'PLANT-2026-Q1', planName: '2026年第一季度小麦种植计划', regionCode: '341622', regionName: '涡阳县', subjectId: 'SUB-0007', subjectName: '涡阳县丰收种植合作社', plotId: 'PL-0020', crop: 'rice', cropName: '水稻', type: 'sow', area: 850, date: '2026-09-24', reporter: '马丰', source: 'PC端填报' },
  { id: 'PR-0005', planId: 'PLANT-2026-Q2', planName: '2026年第二季度水稻种植计划', regionCode: '340123', regionName: '肥西县', subjectId: 'SUB-0009', subjectName: '肥西县三河现代农业公司', plotId: 'PL-0026', crop: 'wheat', cropName: '小麦', type: 'sow', area: 1100, date: '2026-09-28', reporter: '张三河', source: '皖企通填报' },
  { id: 'PR-0006', planId: 'PLANT-2026-Q2', planName: '2026年第二季度水稻种植计划', regionCode: '341226', regionName: '颍上县', subjectId: 'SUB-0101', subjectName: '颍上县润河合作社', plotId: 'FY-0101', crop: 'rice', cropName: '水稻', type: 'sow', area: 760, date: '2026-09-21', reporter: '周明', source: 'PC端填报' },
  { id: 'PR-0007', planId: 'PLANT-2026-Q1', planName: '2026年第一季度小麦种植计划', regionCode: '341221', regionName: '临泉县', subjectId: 'SUB-0102', subjectName: '临泉县丰源家庭农场', plotId: 'FY-0102', crop: 'wheat', cropName: '小麦', type: 'sow', area: 680, date: '2026-09-20', reporter: '刘丰', source: '皖企通填报' },
  { id: 'PR-0008', planId: 'PLANT-2026-Q1', planName: '2026年第一季度小麦种植计划', regionCode: '341222', regionName: '太和县', subjectId: 'SUB-0001', subjectName: '太和县丰乐种植专业合作社', plotId: 'PL-0002', crop: 'wheat', cropName: '小麦', type: 'planting', area: 315.6, date: '2026-09-18', reporter: '陈勇', source: '主体端填报' },
  { id: 'PR-0009', planId: 'PLANT-2026-Q2', planName: '2026年第二季度水稻种植计划', regionCode: '340123', regionName: '肥西县', subjectId: 'SUB-0009', subjectName: '肥西县三河现代农业公司', plotId: 'PL-9006', crop: 'rice', cropName: '水稻', type: 'planting', area: 420.7, date: '2026-09-23', reporter: '张三河', source: '主体端填报' }
]

export const POLICIES = [
  { id: 'POL-001', title: '安徽省2026年耕地地力保护补贴实施方案', category: '补贴政策', publishDate: '2026-03-15', effectiveDate: '2026-03-15 至 2026-12-31', dept: '省农业农村厅', scope: '全省', active: true, summary: '对拥有耕地承包权并实际保护耕地地力的种地农民给予年度补贴，补贴标准由各县结合资金规模和核定面积测算。', conditions: '拥有合法耕地承包经营权；耕地用途符合粮食生产要求；未发生弃耕、违法占用或破坏耕地行为。', process: ['村级登记申报', '乡镇核验公示', '县级审核汇总', '财政惠农一卡通发放'], materials: '身份证明、承包经营权证明、惠农一卡通账户。' },
  { id: 'POL-002', title: '关于做好2026年实际种粮农民一次性补贴发放工作的通知', category: '补贴政策', publishDate: '2026-05-20', effectiveDate: '2026-05-20 至 2026-08-31', dept: '省财政厅', scope: '全省', active: true, summary: '面向实际承担农资价格上涨成本的种粮主体发放一次性补贴，重点支持规模种粮户、家庭农场、合作社和农业企业。', conditions: '在申报年度实际种植粮食作物；种植面积经村、乡两级核实；不存在重复申报。', process: ['主体自主申报', '村级面积核实', '乡镇公开公示', '县级兑付补贴'], materials: '种植主体证明、土地流转合同或承包证明、种植面积清册。' },
  { id: 'POL-003', title: '安徽省水稻完全成本保险投保指南', category: '保险政策', publishDate: '2026-04-02', effectiveDate: '2026-04-02 至 2026-11-30', dept: '省农业农村厅', scope: '水稻主产区', active: true, summary: '保障水稻生产的物化成本、土地成本和人工成本，农户承担保费的20%，其余由各级财政按规定分担。', conditions: '水稻种植地块位于政策实施区域；种植权属清晰；按实际种植面积投保。', process: ['联系承保机构', '核验地块面积', '签订投保单', '灾后报案查勘理赔'], materials: '投保人身份证明、地块清单、土地权属或流转证明。' },
  { id: 'POL-004', title: '2026年农机购置与应用补贴政策解读', category: '补贴政策', publishDate: '2026-02-18', effectiveDate: '2026-02-18 至 2026-12-31', dept: '省农业农村厅', scope: '全省', active: true, summary: '对购置补贴目录内先进适用农业机械的个人和农业生产经营组织实行定额补贴，重点支持粮食生产薄弱环节机具。', conditions: '申请人为农业生产经营个人或组织；机具在补贴目录内；完成实名登记和机具核验。', process: ['自主购机', '线上提交申请', '县级机具核验', '公示后兑付'], materials: '购机发票、身份证明、机具铭牌照片、银行账户。' },
  { id: 'POL-005', title: '安徽省粮食生产功能区管护办法', category: '管护制度', publishDate: '2025-12-30', effectiveDate: '2026-01-01 至 2027-12-31', dept: '省政府办公厅', scope: '全省', active: true, summary: '粮食生产功能区实行用途管控和动态监测，原则上每年至少种植一季粮食作物，严禁擅自改变耕地用途。', conditions: '适用于划定的粮食生产功能区内各类农业生产经营活动。', process: ['地块上图入库', '日常巡查监测', '异常核实整改', '年度评价通报'], materials: '无需个人申报，由属地政府依职责组织实施。' },
  { id: 'POL-006', title: '关于加快推进青贮饲料产业发展的实施意见', category: '产业政策', publishDate: '2026-01-10', effectiveDate: '2026-01-10 至 2027-01-09', dept: '省农业农村厅', scope: '牛羊养殖大县', active: false, summary: '支持符合产业规划的青贮饲料生产和专业化收储服务，对完成备案、验收合格的作业主体按当地细则给予支持。', conditions: '位于牛羊养殖重点县；完成种植或收储备案；作业台账完整并通过县级验收。', process: ['县级备案', '按备案组织作业', '提交验收申请', '核验公示后兑现'], materials: '备案表、作业合同、地块与收储台账、验收申请。' }
]

export const WEATHER_ALERTS = [
  { id: 'WA-001', kind: 'warning', type: '暴雨', level: '橙色', regionName: '太和县', region: '太和县', regionCode: '341222', content: '预计未来24小时太和县有大到暴雨，局部大暴雨，请注意防范农田渍涝。', advice: '及时疏通沟渠，做好田间排水。', publishTime: '2026-09-28 16:00', crops: '玉米、大豆', status: 'active', source: '气象部门' },
  { id: 'WA-002', kind: 'forecast', type: '大风', level: '黄色', regionName: '涡阳县', region: '涡阳县', regionCode: '341622', content: '预计未来12小时涡阳县平均风力可达6级以上，阵风7-8级，秋收作业请注意安全。', advice: '暂停高空和露天农事作业，加固农业设施。', publishTime: '2026-09-28 10:30', crops: '玉米', status: 'active', source: '气象部门' },
  { id: 'WA-003', kind: 'warning', type: '寒潮', level: '蓝色', regionName: '全省', region: '全省', regionCode: '340000', content: '10月2日起全省自北向南平均气温下降6-8℃，请防范晚秋作物低温冷害。', advice: '加强田间巡查，做好保温和防冻措施。', publishTime: '2026-09-27 09:00', crops: '水稻', status: 'active', source: '气象部门' }
]

export const DISASTERS = [
  { id: 'DIS-001', type: '风雹', region: '太和县旧县镇', regionCode: '341222104', date: '2026-08-15', crop: '玉米', affectedArea: 1850, disasterArea: 620, lostArea: 180, estLoss: '约86万元', status: '已处置', description: '短时大风冰雹造成部分玉米倒伏和叶片损伤。', materials: 3 },
  { id: 'DIS-002', type: '渍涝', region: '涡阳县', regionCode: '341622', date: '2026-07-28', crop: '玉米', affectedArea: 3200, disasterArea: 1200, lostArea: 350, estLoss: '约210万元', status: '处置中', description: '连续强降雨导致低洼田块积水，已组织机排。', materials: 5 },
  { id: 'DIS-003', type: '干旱', region: '长丰县', regionCode: '340121', date: '2026-07-05', crop: '水稻', affectedArea: 2600, disasterArea: 800, lostArea: 120, estLoss: '约95万元', status: '已处置', description: '阶段性高温少雨影响水稻分蘖，已调度水源灌溉。', materials: 4 }
]

export const DISASTER_ARCHIVES = [
  { id: 'DA-001', occurrenceTime: '2026-08-15 08:30', plotId: 'PL-0007', subjectId: 'SUB-0004', subjectName: '旧县镇赵多种植大户', owner: '赵磊', plotName: '旧县镇东42号地块', locationName: '太和县旧县镇', regionCode: '341222104', disasterType: '风雹', crop: '玉米', affectedArea: 1850, disasterArea: 620, lostArea: 180, estimatedYieldLoss: 129, description: '短时大风冰雹造成玉米倒伏和叶片损伤。', images: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=realistic%20agricultural%20field%20with%20hailstorm%20damage%20and%20fallen%20corn%20plants%2C%20documentary%20photo&image_size=landscape_4_3', name: '风雹受灾现场' }, { url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=realistic%20close-up%20of%20damaged%20corn%20leaves%20after%20hailstorm%2C%20agricultural%20disaster%20record%20photo&image_size=landscape_4_3', name: '玉米受灾情况' }] },
  { id: 'DA-002', occurrenceTime: '2026-07-28 14:00', plotId: 'PL-0020', subjectId: 'SUB-0007', subjectName: '涡阳县丰收种植合作社', owner: '马丰', plotName: '涡阳县东42号地块', locationName: '涡阳县', regionCode: '341622', disasterType: '暴雨洪涝', crop: '玉米', affectedArea: 3200, disasterArea: 1200, lostArea: 350, estimatedYieldLoss: 315, description: '连续强降雨导致低洼田块积水。', images: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=realistic%20flooded%20corn%20field%20after%20heavy%20rain%2C%20agricultural%20disaster%20record%20photo&image_size=landscape_4_3', name: '暴雨受灾现场' }] },
  { id: 'DA-003', occurrenceTime: '2026-07-05 10:20', plotId: 'PL-0026', subjectId: 'SUB-0009', subjectName: '肥西县三河现代农业公司', owner: '张三河', plotName: '肥西县三河镇现代农业地块', locationName: '肥西县三河镇', regionCode: '340123101', disasterType: '干旱', crop: '水稻', affectedArea: 2600, disasterArea: 800, lostArea: 120, estimatedYieldLoss: 142, description: '阶段性高温少雨影响水稻分蘖。', images: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=realistic%20dry%20rice%20field%20with%20heat%20and%20drought%20damage%2C%20agricultural%20disaster%20record%20photo&image_size=landscape_4_3', name: '干旱受灾现场' }] }
]

export const RESCUE_ACTIONS = [
  { id: 'RA-001', disasterId: 'DIS-001', phase: '灾前应急', unit: '太和县农业农村局', action: '发布风雹预警，组织抢收已成熟玉米', time: '2026-08-14 18:00', result: '抢收1200亩' },
  { id: 'RA-002', disasterId: 'DIS-001', phase: '灾中处置', unit: '旧县镇人民政府', action: '组织排涝和扶苗培土', time: '2026-08-15 09:00', result: '排涝1850亩' },
  { id: 'RA-003', disasterId: 'DIS-001', phase: '灾后救助', unit: '太和县财政局', action: '核灾定损，启动政策性农业保险理赔', time: '2026-08-20 10:00', result: '理赔到账58万元' },
  { id: 'RA-004', disasterId: 'DIS-002', phase: '灾中处置', unit: '涡阳县农业农村局', action: '调配移动泵站开展农田排水', time: '2026-07-28 14:00', result: '完成排水2100亩' }
]
