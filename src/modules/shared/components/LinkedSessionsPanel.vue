<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Linked Sessions</h3>
          <p class="text-xs text-gray-400">Connected onboarding appointments</p>
        </div>
      </div>
      <span v-if="!loading" class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
        {{ sessions.length }}
      </span>
    </div>

    <div v-if="loading" class="p-5 space-y-3">
      <div v-for="i in 2" :key="i" class="h-20 animate-pulse rounded-lg bg-gray-100" />
    </div>

    <div v-else-if="sessions.length === 0" class="flex flex-col items-center justify-center py-10 px-5 text-center">
      <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-gray-600">No linked sessions yet</p>
      <p class="text-xs text-gray-400 mt-0.5">Appointments linked to this onboarding will appear here</p>
    </div>

    <div v-else class="divide-y divide-gray-100">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="flex items-start gap-4 px-5 py-4 border-l-4"
        :class="getSessionBorderClass(session.session_type)"
      >
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              :class="getSessionTypeClass(session.session_type)"
            >
              {{ getSessionTypeLabel(session.session_type) }}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {{ getAppointmentTypeLabel(session.appointment?.appointment_type) }}
            </span>
          </div>
          <p class="text-sm font-semibold text-gray-900 truncate">
            {{ session.appointment?.title || 'Untitled appointment' }}
          </p>
          <div class="flex flex-wrap items-center gap-1 mt-1">
            <span class="text-xs text-gray-700 font-medium">{{ getTrainerName(session) }}</span>
            <span class="text-xs text-gray-300">·</span>
            <span class="text-xs text-gray-500">{{ formatDate(session.appointment?.scheduled_date) }}</span>
            <span class="text-xs text-gray-300">·</span>
            <span class="text-xs text-gray-500">{{ getScheduleTimeRange(session.appointment?.scheduled_start_time, session.appointment?.scheduled_end_time) }}</span>
          </div>
        </div>
        <div class="shrink-0 mt-0.5">
          <StatusBadge :status="session.appointment?.status || 'unknown'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import StatusBadge from './StatusBadge.vue'
import { onboardingService } from '@/modules/shared/services/onboardingService'
import { useDateTime } from '@/modules/shared/composables/useDateTime'
import { useToast } from '@/modules/shared/composables/useToast'
import { extractErrorMessage } from '@core/services/error.handler'

const props = defineProps({ onboardingId: { type: [String, Number], required: true } })
const { formatDate, formatTime } = useDateTime()
const { error } = useToast()
const sessions = ref([])
const loading = ref(false)

const getSessionTypeLabel = (type) => {
  const labels = { primary: 'Primary', supplemental: 'Supplemental', incoming: 'Incoming' }
  return labels[type] ?? 'Unknown'
}

const getSessionTypeClass = (type) => {
  const classes = {
    primary: 'bg-blue-100 text-blue-700',
    supplemental: 'bg-purple-100 text-purple-700',
    incoming: 'bg-amber-100 text-amber-700',
  }
  return classes[type] ?? 'bg-gray-100 text-gray-700'
}

const getSessionBorderClass = (type) => {
  const classes = {
    primary: 'border-l-blue-400',
    supplemental: 'border-l-purple-400',
    incoming: 'border-l-amber-400',
  }
  return classes[type] ?? 'border-l-gray-300'
}

const getAppointmentTypeLabel = (type) => {
  if (!type) return 'Unknown'
  return String(type).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const getTrainerName = (session) => {
  const t = session?.appointment?.trainer
  if (!t) return 'Unassigned'
  return [t.first_name, t.last_name].filter(Boolean).join(' ').trim() || 'Unassigned'
}

const getScheduleTimeRange = (startTime, endTime) => {
  const start = formatTime(startTime)
  const end = formatTime(endTime)
  if (start === '—' && end === '—') return 'Time unavailable'
  if (start === '—') return `Ends ${end}`
  if (end === '—') return `Starts ${start}`
  return `${start} – ${end}`
}

const loadSessions = async () => {
  loading.value = true
  try {
    const response = await onboardingService.getLinkedSessions(props.onboardingId)
    sessions.value = Array.isArray(response) ? response : []
  } catch (err) {
    sessions.value = []
    error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

watch(() => props.onboardingId, loadSessions, { immediate: true })
</script>
