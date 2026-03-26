<template>
  <div class="max-w-5xl mx-auto mt-3 space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Trainer Activity</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ trainers.length }} trainers</p>
      </div>
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Search trainer..."
          class="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-52 focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        @click="activeFilter = tab.key"
        :class="[
          'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
          activeFilter === tab.key
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ tab.label }} ({{ tab.count }})
      </button>
    </div>

    <!-- Loading -->
    <SkeletonLoader v-if="loading" type="list" :count="5" />

    <!-- Trainer list -->
    <div v-else-if="filteredTrainers.length" class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      <div
        v-for="trainer in filteredTrainers"
        :key="trainer.id"
        @click="router.push(`/sales/trainers/${trainer.id}`)"
        :class="[
          'flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors',
          trainer.has_alert ? 'bg-red-50/50' : ''
        ]"
      >
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          :style="{ backgroundColor: statusColor(trainer.status) }"
        >
          {{ initials(trainer.name) }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-900">{{ trainer.name }}</span>
            <span
              v-if="trainer.has_alert"
              class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white uppercase"
            >
              {{ trainer.alert_type || 'Alert' }}
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5 truncate">{{ trainerSubtext(trainer) }}</p>
        </div>

        <StatusBadge :status="trainer.status" />
        <ChevronRightIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-sm text-gray-400">No trainers found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { MagnifyingGlassIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { trackingService } from '@/modules/sale/services/trackingService.js'
import { usePusher } from '@/modules/shared/composables/usePusher.js'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { STATUS_COLORS } from '@/modules/shared/composables/useMap.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const router = useRouter()
const authStore = useAuthStore()

const trainers = ref([])
const loading = ref(true)
const search = ref('')
const activeFilter = ref('all')

const { connect } = usePusher()
let channel = null

const urgencyOrder = { alert: 0, en_route: 1, leave_office: 1, in_session: 2, in_progress: 2, arrived: 3, completed: 4, done: 4, at_office: 5 }

function statusColor(status) {
  return STATUS_COLORS[status] || '#9CA3AF'
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function trainerSubtext(t) {
  if (t.customer_name && t.eta_minutes != null) return `${t.customer_name} — ETA ${t.eta_minutes} min`
  if (t.customer_name && t.time_in_status) return `${t.customer_name} — ${t.time_in_status}`
  if (t.customer_name) return t.customer_name
  if (t.time_in_status) return t.time_in_status
  return ''
}

const filterTabs = computed(() => {
  const counts = { all: trainers.value.length, en_route: 0, in_session: 0, arrived: 0, completed: 0, alert: 0, at_office: 0 }
  trainers.value.forEach(t => {
    if (t.has_alert) counts.alert++
    const s = t.status
    if (s === 'en_route' || s === 'leave_office') counts.en_route++
    else if (s === 'in_session' || s === 'in_progress') counts.in_session++
    else if (s === 'arrived') counts.arrived++
    else if (s === 'completed' || s === 'done') counts.completed++
    else if (s === 'at_office') counts.at_office++
  })
  return [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'en_route', label: 'En route', count: counts.en_route },
    { key: 'in_session', label: 'In session', count: counts.in_session },
    { key: 'alert', label: 'Alerts', count: counts.alert },
    { key: 'arrived', label: 'Arrived', count: counts.arrived },
    { key: 'completed', label: 'Completed', count: counts.completed },
    { key: 'at_office', label: 'At office', count: counts.at_office },
  ]
})

const filteredTrainers = computed(() => {
  let result = [...trainers.value]

  if (activeFilter.value !== 'all') {
    if (activeFilter.value === 'alert') {
      result = result.filter(t => t.has_alert)
    } else if (activeFilter.value === 'en_route') {
      result = result.filter(t => ['en_route', 'leave_office'].includes(t.status))
    } else if (activeFilter.value === 'in_session') {
      result = result.filter(t => ['in_session', 'in_progress'].includes(t.status))
    } else if (activeFilter.value === 'completed') {
      result = result.filter(t => ['completed', 'done'].includes(t.status))
    } else {
      result = result.filter(t => t.status === activeFilter.value)
    }
  }

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(t => t.name?.toLowerCase().includes(q))
  }

  result.sort((a, b) => {
    const aU = a.has_alert ? 0 : (urgencyOrder[a.status] ?? 9)
    const bU = b.has_alert ? 0 : (urgencyOrder[b.status] ?? 9)
    return aU - bU
  })

  return result
})

async function fetchTrainers() {
  loading.value = true
  try {
    const res = await trackingService.getLiveStatus()
    trainers.value = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : [])
  } catch {
    trainers.value = []
  } finally {
    loading.value = false
  }
}

function setupPusher() {
  const pusher = connect(() => authStore.accessToken)
  channel = pusher.subscribe('presence-trainers')

  channel.bind('trainer.status.changed', (data) => {
    const t = trainers.value.find(t => t.id === data.trainer_id)
    if (!t) return
    if (t.status !== data.status) t.status = data.status
    if (data.customer_name && t.customer_name !== data.customer_name) t.customer_name = data.customer_name
  })

  channel.bind('trainer.eta.updated', (data) => {
    const t = trainers.value.find(t => t.id === data.trainer_id)
    if (t && t.eta_minutes !== data.eta_minutes) t.eta_minutes = data.eta_minutes
  })

  channel.bind('anomaly.detected', (data) => {
    const t = trainers.value.find(t => t.id === data.trainer_id)
    if (t && !t.has_alert) {
      t.has_alert = true
      t.alert_type = data.type
    }
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
  fetchTrainers()
  setupPusher()
})

onUnmounted(teardownPusher)
</script>
