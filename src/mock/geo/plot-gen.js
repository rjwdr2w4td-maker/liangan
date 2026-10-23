// 地块生成器：围绕县中心点确定性生成地块多边形（每次刷新一致）
import { circlePolygon, offsetPoint, polygonAreaMu } from '@/map/geoUtils'

// 确定性伪随机（LCG）
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// 种植主体（演示数据，SUB-0001 为演示主角陈勇的合作社）
export const GROW_SUBJECTS = [
  { id: 'SUB-0001', name: '太和县丰乐种植专业合作社', type: 'cooperative', owner: '陈勇', phone: '139****6688', regionCode: '341222', area: 3200 },
  { id: 'SUB-0002', name: '太和县绿源家庭农场', type: 'family_farm', owner: '王建国', phone: '138****2345', regionCode: '341222', area: 850 },
  { id: 'SUB-0003', name: '太和县宏发农业发展有限公司', type: 'enterprise', owner: '李宏', phone: '137****9012', regionCode: '341222', area: 2100 },
  { id: 'SUB-0004', name: '旧县镇赵多种植大户', type: 'big_household', owner: '赵多', phone: '136****3456', regionCode: '341222104', area: 420 },
  { id: 'SUB-0005', name: '旧县镇田乐家庭农场', type: 'family_farm', owner: '田乐', phone: '135****7890', regionCode: '341222104', area: 380 },
  { id: 'SUB-0006', name: '太和县税镇镇兴农合作社', type: 'cooperative', owner: '孙兴', phone: '139****1122', regionCode: '341222108', area: 1560 },
  { id: 'SUB-0007', name: '涡阳县丰收种植合作社', type: 'cooperative', owner: '马丰', phone: '138****5566', regionCode: '341622', area: 2800 },
  { id: 'SUB-0008', name: '涡阳县刘桥家庭农场', type: 'family_farm', owner: '刘桥', phone: '137****8899', regionCode: '341622', area: 620 },
  { id: 'SUB-0009', name: '肥西县三河现代农业公司', type: 'enterprise', owner: '张三河', phone: '136****4477', regionCode: '340123', area: 3500 },
  { id: 'SUB-0010', name: '肥西县严店种粮大户集群', type: 'big_household', owner: '严店', phone: '135****2233', regionCode: '340123', area: 980 },
  { id: 'SUB-0011', name: '长丰县下塘龙虾稻田农场', type: 'family_farm', owner: '王塘', phone: '139****9911', regionCode: '340121', area: 760 },
  { id: 'SUB-0012', name: '长丰县水湖草莓粮经合作社', type: 'cooperative', owner: '李水湖', phone: '138****3344', regionCode: '340121', area: 1200 }
]

export const SUBJECT_MAP = Object.fromEntries(GROW_SUBJECTS.map((s) => [s.id, s]))

// 县中心点（用于生成地块）
const COUNTY_SEEDS = {
  '341222': { center: [115.622, 33.16], name: '太和县' },
  '341222104': { center: [115.544, 33.148], name: '旧县镇' },
  '341222108': { center: [115.451, 33.196], name: '税镇镇' },
  '341622': { center: [116.216, 33.493], name: '涡阳县' },
  '340123': { center: [116.854, 31.708], name: '肥西县' },
  '340121': { center: [117.167, 32.479], name: '长丰县' }
}

const CROP_POOL = ['wheat', 'wheat', 'wheat', 'corn', 'corn', 'rice', 'soybean', 'silage_corn']

// 生成全部地块（模块级单例）
function buildPlots() {
  const plots = []
  let id = 1
  const rand = seededRandom(20260918)

  GROW_SUBJECTS.forEach((subject) => {
    const seed = COUNTY_SEEDS[subject.regionCode]
    if (!seed) return
    const plotCount = subject.area > 1500 ? 4 : subject.area > 800 ? 3 : 2

    for (let i = 0; i < plotCount; i++) {
      const center = offsetPoint(seed.center, (rand() - 0.5) * 22, (rand() - 0.5) * 18)
      const ring = circlePolygon(center, 1.2 + rand() * 1.8, 6 + Math.floor(rand() * 3))
      const crop = CROP_POOL[Math.floor(rand() * CROP_POOL.length)]
      const areaMu = polygonAreaMu(ring)
      plots.push({
        id: `PL-${String(id).padStart(4, '0')}`,
        name: `${seed.name}${['东', '西', '南', '北', '中', '新'][i % 6]}${Math.floor(rand() * 90 + 10)}号地块`,
        subjectId: subject.id,
        regionCode: subject.regionCode,
        center,
        geometry: { type: 'Polygon', coordinates: [ring] },
        areaMu,
        crop,
        // 是否青贮备案地块（数字围栏）
        silageFiled: crop === 'silage_corn' && rand() > 0.3,
        // 计划落实状态
        implemented: rand() > 0.35
      })
      id++
    }
  })
  plots.push(
    { id: 'PL-9001', name: '太和县东湖示范地块', subjectId: '', regionCode: '341222', regionName: '太和县', unitName: '太和县农业农村局', center: [115.638, 33.172], geometry: null, areaMu: 186.5, crop: 'wheat', source: '确权', plotType: '确权地块', implemented: false },
    { id: 'PL-9002', name: '太和县高标准农田一号地块', subjectId: '', regionCode: '341222', regionName: '太和县', unitName: '太和县农业农村局', center: [115.651, 33.154], geometry: null, areaMu: 235.8, crop: 'corn', source: '确权', plotType: '确权地块', implemented: false },
    { id: 'PL-9003', name: '旧县镇南部流转地块', subjectId: '', regionCode: '341222104', regionName: '旧县镇', unitName: '旧县镇人民政府', center: [115.557, 33.137], geometry: null, areaMu: 128.6, crop: 'soybean', source: '流转', plotType: '流转地块', implemented: false },
    { id: 'PL-9004', name: '旧县镇粮食生产示范地块', subjectId: '', regionCode: '341222104', regionName: '旧县镇', unitName: '旧县镇人民政府', center: [115.532, 33.159], geometry: null, areaMu: 316.2, crop: 'wheat', source: '确权', plotType: '确权地块', implemented: false },
    { id: 'PL-9005', name: '颍上县润河镇水稻地块', subjectId: '', regionCode: '341226106', regionName: '润河镇', unitName: '润河镇人民政府', center: [116.201, 32.532], geometry: null, areaMu: 268.4, crop: 'rice', source: '流转', plotType: '流转地块', implemented: false },
    { id: 'PL-9006', name: '肥西县三河镇现代农业地块', subjectId: '', regionCode: '340123101', regionName: '三河镇', unitName: '三河镇人民政府', center: [117.251, 31.512], geometry: null, areaMu: 420.7, crop: 'rice', source: '确权', plotType: '确权地块', implemented: false }
  )
  return plots
}

export const PLOTS = buildPlots()
export const PLOT_MAP = Object.fromEntries(PLOTS.map((p) => [p.id, p]))

// 按主体取地块
export const plotsOfSubject = (subjectId) => PLOTS.filter((p) => p.subjectId === subjectId)
// 按区划取地块
export const plotsOfRegion = (regionCode) => {
  if (!regionCode || regionCode === '340000') return PLOTS
  return PLOTS.filter((p) => p.regionCode.startsWith(regionCode.slice(0, 6)))
}
