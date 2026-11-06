import { ref, onUnmounted } from 'vue'
import L from 'leaflet'
import { TILE_PROVIDERS, DEFAULT_PROVIDER } from './tileConfig'

// Leaflet 组合式封装：初始化 / 瓦片 / 飞行 / 图层管理
export function useMap() {
  const map = ref(null)
  const layers = {} // id → L.Layer

  const initMap = (el, options = {}) => {
    if (map.value) return map.value
    map.value = L.map(el, {
      center: options.center || [32.3, 117.2],
      zoom: options.zoom || 7,
      zoomControl: false,
      attributionControl: false,
      ...options.leafletOptions
    })
    L.control.zoom({ position: 'bottomright' }).addTo(map.value)
    setTile(DEFAULT_PROVIDER)
    return map.value
  }

  const setTile = (providerKey) => {
    const p = TILE_PROVIDERS[providerKey]
    if (!p || !map.value) return
    if (layers.__tile) map.value.removeLayer(layers.__tile)
    layers.__tile = L.tileLayer(p.url, {
      subdomains: p.subdomains || 'abc',
      maxZoom: 18,
      key: import.meta.env.VITE_TDT_KEY || ''
    }).addTo(map.value)
  }

  const flyTo = (center, zoom, duration = 0.8) => {
    map.value?.flyTo(center, zoom, { duration })
  }

  const fitBounds = (bounds, padding = [30, 30]) => {
    map.value?.fitBounds(bounds, { paddingTopLeft: padding, paddingBottomRight: padding })
  }

  // GeoJSON 图层注册（含样式与事件）
  const addGeoJSON = (id, geojson, options = {}) => {
    removeLayer(id)
    if (!map.value || !geojson) return null
    const layer = L.geoJSON(geojson, {
      style: options.style || {},
      pointToLayer: options.pointToLayer,
      onEachFeature: (feature, lyr) => {
        if (options.onEachFeature) options.onEachFeature(feature, lyr)
      }
    }).addTo(map.value)
    layers[id] = layer
    return layer
  }

  const addLayer = (id, layer) => {
    removeLayer(id)
    if (map.value && layer) {
      layer.addTo(map.value)
      layers[id] = layer
    }
    return layer
  }

  const removeLayer = (id) => {
    if (layers[id] && map.value) {
      map.value.removeLayer(layers[id])
      delete layers[id]
    }
  }

  const getLayer = (id) => layers[id]

  const clearAll = () => {
    Object.keys(layers).forEach((id) => id !== '__tile' && removeLayer(id))
  }

  const startPolygonDraw = (options = {}) => {
    if (!map.value) return null
    removeLayer('__draw')
    const points = []
    const markers = []
    let polygon = null
    const finish = () => {
      if (points.length < 3) return null
      const ring = points.map((p) => [p[1], p[0]])
      ring.push([...ring[0]])
      const geometry = { type: 'Polygon', coordinates: [ring] }
      options.onFinish?.(geometry)
      return geometry
    }
    const redraw = () => {
      if (polygon) map.value.removeLayer(polygon)
      if (points.length >= 2) polygon = L.polygon(points, { color: '#168c86', weight: 2, fillOpacity: 0.22 }).addTo(map.value)
    }
    const click = (e) => {
      points.push([e.latlng.lat, e.latlng.lng])
      markers.push(L.circleMarker(e.latlng, { radius: 5, color: '#168c86', fillColor: '#fff', fillOpacity: 1 }).addTo(map.value))
      redraw()
      options.onChange?.(points.map((p) => [p[1], p[0]]))
    }
    map.value.on('click', click)
    layers.__draw = { remove: () => { map.value?.off('click', click); markers.forEach((m) => map.value?.removeLayer(m)); if (polygon) map.value?.removeLayer(polygon); delete layers.__draw } }
    return { finish, undo: () => { points.pop(); const marker = markers.pop(); marker?.remove(); redraw(); }, clear: () => { points.splice(0); markers.splice(0).forEach((m) => m.remove()); redraw() }, getPoints: () => points.map((p) => [p[1], p[0]]), stop: () => layers.__draw?.remove() }
  }

  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  })

  return { map, initMap, setTile, flyTo, fitBounds, addGeoJSON, addLayer, removeLayer, getLayer, clearAll, startPolygonDraw }
}
