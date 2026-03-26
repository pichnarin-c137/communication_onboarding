<template>
  <div class="max-w-5xl mx-auto mt-3 space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button
        @click="router.push('/sales/trainers')"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-gray-900 truncate">{{ trainerName }}</h1>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span v-if="isLive" class="flex items-center gap-1 text-emerald-600">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live
        </span>
        <span class="text-gray-400">{{ isLive ? 'Today' : selectedDate }}</span>
      </div>
    </div>

    <SkeletonLoader v-if="loading" type="cards" :count="4" />

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { trackingService } from '@/modules/sale/services/trackingService.js'
import { usePusher } from '@/modules/shared/composables/usePusher.js'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBar from '@/modules/sale/components/map/StatusBar.vue'
import TrainerMap from '@/modules/sale/components/map/TrainerMap.vue'
import TrainerTimeline from '@/modules/sale/components/map/TrainerTimeline.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { formatTime: fmtTime } = useDateTime()

const trainerId = computed(() => route.params.id)
const today = new Date().toISOString().split('T')[0]

const loading = ref(true)
const trainerName = ref('')
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
const DEFAULT_GEOFENCE_RADIUS = 200
const geofenceRadius = ref(DEFAULT_GEOFENCE_RADIUS)
const trail = ref([])
const routeGeometry = ref(null)
const events = ref([])
const selectedDate = ref(today)
const mapRef = ref(null)
let cachedCustomers = null

const isLive = computed(() => selectedDate.value === today)

const { connect } = usePusher()
let channel = null

async function loadActivity() {
  loading.value = true
  try {
    let res
    if (isLive.value) {
      res = await trackingService.getTodayActivity(trainerId.value)
    } else {
      res = await trackingService.getActivityLog(trainerId.value, selectedDate.value)
    }
    const data = res.data || res
    trainerName.value = data.trainer_name || data.name || 'Trainer'
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
    const customer = cachedCustomers.find(c => c.id === id)
    if (customer) {
      customerLat.value = customer.lat
      customerLng.value = customer.lng
      geofenceRadius.value = customer.geofence_radius || DEFAULT_GEOFENCE_RADIUS
    }
  } catch {
    // Silently fail
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
  const pusher = connect(() => authStore.accessToken)
  channel = pusher.subscribe('presence-trainers')

  channel.bind('trainer.location.updated', (data) => {
    if (!isLive.value || String(data.trainer_id) !== String(trainerId.value)) return
    trainerLat.value = data.lat
    trainerLng.value = data.lng
    trail.value.push({ lat: data.lat, lng: data.lng })
    if (trail.value.length > 500) trail.value.splice(0, trail.value.length - 500)
  })

  channel.bind('trainer.status.changed', (data) => {
    if (String(data.trainer_id) !== String(trainerId.value) || !isLive.value) return
    currentStatus.value = data.status
    if (data.customer_name) customerName.value = data.customer_name
    events.value = [{
      status: data.status,
      timestamp: data.timestamp || new Date().toISOString(),
      description: data.description || `Status changed to ${data.status}`,
      detection_method: data.detection_method || null
    }, ...events.value]
  })

  channel.bind('trainer.eta.updated', (data) => {
    if (!isLive.value || String(data.trainer_id) !== String(trainerId.value)) return
    etaMinutes.value = data.eta_minutes
    if (data.route_geometry) routeGeometry.value = data.route_geometry
  })
}

function teardownPusher() {
  if (channel) {
    channel.unbind_all()
    channel.unsubscribe()
    channel = null
  }
}

onMounted(() => {
  loadActivity()
  setupPusher()
})

onUnmounted(teardownPusher)
</script>
