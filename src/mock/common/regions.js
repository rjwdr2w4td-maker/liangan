// 行政区划树：16 地市 + 代表县区（含中心点坐标，用于地图定位）
// 演示原型仅细化部分县，其他县仅作区划节点

const CITY_CENTER = {
  340100: [117.227, 31.82], 340200: [118.376, 31.326], 340300: [117.389, 32.916],
  340400: [117.018, 32.647], 340500: [118.508, 31.689], 340600: [116.798, 33.972],
  340700: [117.812, 30.945], 340800: [117.061, 30.533], 341000: [118.338, 29.715],
  341100: [118.317, 32.302], 341200: [115.82, 32.901], 341300: [116.965, 33.646],
  341500: [116.523, 31.753], 341600: [115.783, 33.845], 341700: [117.491, 30.661],
  341800: [118.759, 30.941]
}

const CITIES = [
  { code: '340100', name: '合肥市' }, { code: '340200', name: '芜湖市' },
  { code: '340300', name: '蚌埠市' }, { code: '340400', name: '淮南市' },
  { code: '340500', name: '马鞍山市' }, { code: '340600', name: '淮北市' },
  { code: '340700', name: '铜陵市' }, { code: '340800', name: '安庆市' },
  { code: '341000', name: '黄山市' }, { code: '341100', name: '滁州市' },
  { code: '341200', name: '阜阳市' }, { code: '341300', name: '宿州市' },
  { code: '341500', name: '六安市' }, { code: '341600', name: '亳州市' },
  { code: '341700', name: '池州市' }, { code: '341800', name: '宣城市' }
]

// 各市代表县（演示用，标注 hasGeo 的县有 GeoJSON 边界可下钻）
const COUNTY_MAP = {
  '340100': [
    { code: '340123', name: '肥西县', center: [116.854, 31.708], hasGeo: true },
    { code: '340121', name: '长丰县', center: [117.167, 32.479], hasGeo: true },
    { code: '340122', name: '肥东县', center: [117.46, 31.887] },
    { code: '340181', name: '巢湖市', center: [117.875, 31.605] }
  ],
  '341200': [
    { code: '341222', name: '太和县', center: [115.622, 33.16], hasGeo: true },
    { code: '341202', name: '颍州区', center: [115.806, 32.88] },
    { code: '341221', name: '临泉县', center: [115.25, 33.064] },
    { code: '341224', name: '阜南县', center: [115.59, 32.616] }
  ],
  '341600': [
    { code: '341622', name: '涡阳县', center: [116.216, 33.493], hasGeo: true },
    { code: '341621', name: '蒙城县', center: [116.56, 33.265] },
    { code: '341623', name: '利辛县', center: [116.2, 33.144] }
  ],
  '341100': [
    { code: '341182', name: '明光市', center: [117.998, 32.781] },
    { code: '341181', name: '天长市', center: [119.004, 32.696] }
  ],
  '341500': [
    { code: '341522', name: '霍邱县', center: [116.278, 32.353] },
    { code: '341524', name: '金寨县', center: [115.934, 31.728] }
  ],
  '341300': [
    { code: '341322', name: '萧县', center: [116.946, 34.057] },
    { code: '341321', name: '砀山县', center: [116.363, 34.427] }
  ]
}

// 乡镇（仅细化太和县旧县镇片区，用于乡镇角色演示）
const TOWNS = {
  '341222': [
    { code: '341222104', name: '旧县镇', center: [115.544, 33.148] },
    { code: '341222103', name: '大新镇', center: [115.532, 33.074] },
    { code: '341222108', name: '税镇镇', center: [115.451, 33.196] },
    { code: '341222112', name: '皮条孙镇', center: [115.501, 33.109] },
    { code: '341222113', name: '原墙镇', center: [115.782, 33.218] }
  ]
}

// 构建完整区划树
export const REGION_TREE = [
  {
    code: '340000',
    name: '安徽省',
    center: [117.227, 31.82],
    children: CITIES.map((city) => ({
      code: city.code,
      name: city.name,
      center: CITY_CENTER[city.code],
      children: (COUNTY_MAP[city.code] || []).map((c) => ({
        code: c.code,
        name: c.name,
        center: c.center,
        hasGeo: c.hasGeo || false,
        children: (TOWNS[c.code] || []).map((t) => ({
          code: t.code,
          name: t.name,
          center: t.center,
          children: []
        }))
      }))
    }))
  }
]

// 扁平化区划节点表（code → node，含路径）
const flatMap = {}
const walk = (nodes, path) => {
  nodes.forEach((n) => {
    flatMap[n.code] = { ...n, path: [...path, n.name].join('/') }
    if (n.children) walk(n.children, [...path, n.name])
  })
}
walk(REGION_TREE, [])
export const REGION_MAP = flatMap

export const getRegion = (code) => flatMap[code]
export const listCities = () => CITIES.map((c) => ({ ...c, center: CITY_CENTER[c.code] }))

// 判断 code 是否在 regionCode 范围内（前缀匹配，同级行政区划编码规则）
export const inRegion = (dataRegionCode, userRegionCode) => {
  if (!userRegionCode || userRegionCode === '340000') return true
  if (!dataRegionCode) return false
  return String(dataRegionCode).startsWith(userRegionCode)
}
