// 地图瓦片源配置：默认无需 key 的 GeoQ 政务灰底
export const TILE_PROVIDERS = {
  geoq_gray: {
    name: '政务灰底',
    // 注意 GeoQ 瓦片 URL 顺序为 {z}/{y}/{x}
    url: 'http://cache1.arcgiscache.com/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}',
    crs: 'gcj02'
  },
  geoq_color: {
    name: '彩色底图',
    url: 'http://cache1.arcgiscache.com/arcgis/rest/services/ChinaOnlineStreetColor/MapServer/tile/{z}/{y}/{x}',
    crs: 'gcj02'
  },
  amap: {
    name: '高德底图',
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    subdomains: ['1', '2', '3', '4'],
    crs: 'gcj02'
  },
  tdt: {
    name: '天地图（需key）',
    url: 'https://t{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&z={z}&tk={key}',
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    needsKey: true,
    crs: 'wgs84'
  }
}

export const DEFAULT_PROVIDER = import.meta.env.VITE_TILE_PROVIDER || 'geoq_gray'
