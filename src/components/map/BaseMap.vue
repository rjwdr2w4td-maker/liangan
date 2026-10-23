<template>
  <div ref="mapEl" class="base-map" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMap } from '@/map/useMap'

const props = defineProps({
  center: { type: Array, default: () => [32.3, 117.2] },
  zoom: { type: Number, default: 7 }
})

const mapEl = ref(null)
const mapApi = useMap()

onMounted(() => {
  mapApi.initMap(mapEl.value, { center: props.center, zoom: props.zoom })
})

defineExpose({
  map: mapApi.map,
  flyTo: mapApi.flyTo,
  fitBounds: mapApi.fitBounds,
  addGeoJSON: mapApi.addGeoJSON,
  addLayer: mapApi.addLayer,
  removeLayer: mapApi.removeLayer,
  getLayer: mapApi.getLayer,
  clearAll: mapApi.clearAll,
  setTile: mapApi.setTile
})
</script>

<style lang="scss" scoped>
.base-map {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #d8e4ee;

  :global(.leaflet-container) { background: #d8e4ee; font-family: inherit; }
}
</style>
