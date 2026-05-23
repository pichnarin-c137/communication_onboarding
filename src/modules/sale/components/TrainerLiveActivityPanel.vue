<template>
  <div class="space-y-4">
    <SkeletonLoader v-if="loading" type="cards" :count="3" />

    <template v-else>
      <StatusBar
        :status="currentStatus"
        :customer-name="customerName"
        :eta-minutes="etaMinutes"
        :session-duration="sessionDuration"
        :time-label="timeLabel"
        :time-value="timeValue"
      />

      <TrainerMap
        ref="mapRef"
        :trainer-lat="trainerLat"
        :trainer-lng="trainerLng"
        :trainer-status="currentStatus"
        :customer-lat="customerLat"
        :customer-lng="customerLng"
        :customer-name="customerName"
        :geofence-radius="geofenceRadius"
        :trail="trail"
        :route-geometry="routeGeometry"
      />

      <TrainerTimeline
        :events="events"
        :selected-date="selectedDate"
        @date-change="handleDateChange"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { trackingService } from '@/modules/sale/services/trackingService.js'
import { usePusher } from '@/modules/shared/composables/usePusher.js'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBar from '@/modules/sale/components/map/StatusBar.vue'
import TrainerMap from '@/modules/sale/components/map/TrainerMap.vue'
import TrainerTimeline from '@/modules/sale/components/map/TrainerTimeline.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const props = defineProps({
  trainerId: { type: String, required: true },
})

const authStore = useAuthStore()
const { formatTime: fmtTime } = useDateTime()
const { connect } = usePusher()

const today = new Date().toISOString().split('T')[0]
const DEFAULT_GEOFENCE_RADIUS = 200

const loading = ref(true)
const currentStatus = ref(null)
const customerName = ref(null)
const etaMinutes = ref(null)
const sessionDuration = ref(null)
const timeLabel = ref('Last Update')
const timeValue = ref(null)
const trainerLat = ref(null)
const trainerLng = ref(null)
const customerLat = ref(null)
const customerLng = ref(null)
const geofenceRadius = ref(DEFAULT_GEOFENCE_RADIUS)
const trail = ref([])
const routeGeometry = ref(null)
const events = ref([])
const selectedDate = ref(today)
const mapRef = ref(null)
let cachedCustomers = null
let channel = null

const isLive = computed(() => selectedDate.value === today)

async function loadActivity() {
  loading.value = true
  try {
    const res = isLive.value
      ? await trackingService.getTodayActivity(props.trainerId)
      : await trackingService.getActivityLog(props.trainerId, selectedDate.value)
    const data = res.data || res
    currentStatus.value = data.current_status || data.status || null
    customerName.value = data.customer?.name || data.customer_name || null
    etaMinutes.value = data.eta?.eta_minutes ?? data.eta_minutes ?? null
    sessionDuration.value = data.session_duration || null
    trainerLat.value = data.current_location?.lat ?? data.lat ?? null
    trainerLng.value = data.current_location?.lng ?? data.lng ?? null
    trail.value = data.trail || []
    routeGeometry.value = data.route_geometry || data.eta?.route_geometry || null
    events.value = data.events || data.activity_logs || []

    if (data.left_office_at) {
      timeLabel.value = 'Left office'
      timeValue.value = formatTimeFromISO(data.left_office_at)
    } else if (data.last_status_change) {
      timeLabel.value = 'Status changed'
      timeValue.value = formatTimeFromISO(data.last_status_change)
    } else {
      timeLabel.value = 'Last Update'
      timeValue.value = null
    }

    if (data.customer?.lat && data.customer?.lng) {
      customerLat.value = data.customer.lat
      customerLng.value = data.customer.lng
      geofenceRadius.value = data.customer.geofence_radius || DEFAULT_GEOFENCE_RADIUS
    } else if (data.customer_id || data.customer?.id) {
      await loadCustomerLocation(data.customer_id || data.customer.id)
    }
  } catch {
    events.value = []
  } finally {
    loading.value = false
  }
}

async function loadCustomerLocation(customerId) {
  try {
    if (!cachedCustomers) {
      const res = await trackingService.getCustomerLocations()
      cachedCustomers = res.data || res || []
    }
    const id = parseInt(customerId)
    const customer = cachedCustomers.find((c) => c.id === id)
    if (customer) {
      customerLat.value = customer.lat
      customerLng.value = customer.lng
      geofenceRadius.value = customer.geofence_radius || DEFAULT_GEOFENCE_RADIUS
    }
  } catch {
    /* silent */
  }
}

function formatTimeFromISO(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  return fmtTime(`${h}:${m}`)
}

function handleDateChange(date) {
  selectedDate.value = date
  mapRef.value?.clearAll()
  loadActivity()
}

function setupPusher() {
  try {
    const pusher = connect(() => authStore.accessToken)
    channel = pusher.subscribe('presence-trainers')

    channel.bind('trainer.location.updated', (data) => {
      if (!isLive.value || String(data.trainer_id) !== String(props.trainerId)) return
      trainerLat.value = data.lat
      trainerLng.value = data.lng
      trail.value.push({ lat: data.lat, lng: data.lng })
      if (trail.value.length > 500) trail.value.splice(0, trail.value.length - 500)
    })

    channel.bind('trainer.status.changed', (data) => {
      if (String(data.trainer_id) !== String(props.trainerId) || !isLive.value) return
      currentStatus.value = data.status
      if (data.customer_name) customerName.value = data.customer_name
      events.value = [{
        status: data.status,
        timestamp: data.timestamp || new Date().toISOString(),
        description: data.description || `Status changed to ${data.status}`,
        detection_method: data.detection_method || null,
      }, ...events.value]
    })

    channel.bind('trainer.eta.updated', (data) => {
      if (!isLive.value || String(data.trainer_id) !== String(props.trainerId)) return
      etaMinutes.value = data.eta_minutes
      if (data.route_geometry) routeGeometry.value = data.route_geometry
    })
  } catch {
    /* optional */
  }
}

function teardownPusher() {
  if (channel) {
    channel.unbind_all()
    channel.unsubscribe()
    channel = null
  }
}

watch(() => props.trainerId, () => {
  selectedDate.value = today
  loadActivity()
})

onMounted(() => {
  loadActivity()
  setupPusher()
})

onUnmounted(teardownPusher)
</script>
