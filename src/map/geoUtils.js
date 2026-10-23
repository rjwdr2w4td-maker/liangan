// 空间计算工具：点位判定、面积、坐标格式化

// 射线法判断点是否在多边形内
export function pointInPolygon(pt, polygon) {
  const [x, y] = pt
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

// 对 MultiPolygon/Polygon GeoJSON 判定点位
export function pointInGeoJSON(pt, geometry) {
  if (!geometry) return false
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  for (const poly of polys) {
    if (pointInPolygon(pt, poly[0])) return true
  }
  return false
}

// 简易球面面积计算（km²），演示精度足够
export function polygonAreaKm2(ring) {
  const R = 6371
  const rad = (d) => (d * Math.PI) / 180
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[i + 1]
    area += rad(x2 - x1) * (2 + Math.sin(rad(y1)) + Math.sin(rad(y2)))
  }
  area = (area * R * R) / 2
  return Math.abs(area)
}

export function polygonAreaMu(ring) {
  return Math.round(polygonAreaKm2(ring) * 1500) // 1 km² = 1500 亩
}

// 坐标格式化：[lng, lat] → "117.227000, 31.820000"
export function formatCoord(pt, digits = 6) {
  return `${pt[0].toFixed(digits)}, ${pt[1].toFixed(digits)}`
}

// 围绕中心点生成近似圆形多边形（演示地块/图斑）
export function circlePolygon(center, radiusKm = 2, points = 8) {
  const coords = []
  const [lng, lat] = center
  const dLat = radiusKm / 111
  const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2
    coords.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)])
  }
  return coords
}

// 偏移中心点（km）
export function offsetPoint(center, dxKm, dyKm) {
  const dLat = dyKm / 111
  const dLng = dxKm / (111 * Math.cos((center[1] * Math.PI) / 180))
  return [center[0] + dLng, center[1] + dLat]
}
