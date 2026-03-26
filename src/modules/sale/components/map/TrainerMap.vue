<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div ref="mapContainer" class="h-72 sm:h-80 lg:h-96 w-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useMap } from '@/modules/shared/composables/useMap.js'

const props = defineProps({
  trainerLat: { type: Number, default: null },
  trainerLng: { type: Number, default: null },
  trainerStatus: { type: String, default: null },
  customerLat: { type: Number, default: null },
  customerLng: { type: Number, default: null },
  customerName: { type: String, default: '' },
  geofenceRadius: { type: Number, default: 200 },
  trail: { type: Array, default: () => [] },
  routeGeometry: { type: Object, default: null }
})

const mapContainer = ref(null)
const { init, setTrainerPin, setCustomerPin, drawTrail, drawRoute, fitToContent, clearAll, destroy } = useMap()

function renderAll() {
  if (props.trainerLat != null && props.trainerLng != null) {
    setTrainerPin(props.trainerLat, props.trainerLng, props.trainerStatus)
  }
  if (props.customerLat != null && props.customerLng != null) {
    setCustomerPin(props.customerLat, props.customerLng, props.customerName, props.geofenceRadius)
  }
  if (props.trail?.length) drawTrail(props.trail)
  if (props.routeGeometry) drawRoute(props.routeGeometry)
  fitToContent()
}

onMounted(() => {
  if (mapContainer.value) {
    init(mapContainer.value)
    renderAll()
  }
})

watch(() => [props.trainerLat, props.trainerLng, props.trainerStatus], () => {
  if (props.trainerLat != null && props.trainerLng != null) {
    setTrainerPin(props.trainerLat, props.trainerLng, props.trainerStatus)
  }
})

watch(() => props.trail.length, () => {
  if (props.trail?.length) drawTrail(props.trail)
})

watch(() => props.routeGeometry, (geo) => {
  if (geo) drawRoute(geo)
})

watch(() => [props.customerLat, props.customerLng], () => {
  if (props.customerLat != null && props.customerLng != null) {
    setCustomerPin(props.customerLat, props.customerLng, props.customerName, props.geofenceRadius)
    fitToContent()
  }
})

defineExpose({ clearAll, fitToContent, renderAll })

onUnmounted(destroy)
</script>
