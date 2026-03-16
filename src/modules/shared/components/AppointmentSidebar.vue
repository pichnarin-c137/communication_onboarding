<template>
  <aside class="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-100">
      <h2 class="text-sm font-semibold text-gray-900">Appointments</h2>
    </div>

    <!-- Status filter pills -->
    <div class="flex gap-1.5 px-3 py-2.5 border-b border-gray-100 flex-wrap">
      <button
        v-for="f in filters"
        :key="f.key"
        @click="activeFilter = f.key; loadData()"
        :class="[
          'px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
          activeFilter === f.key
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <!-- Loading skeleton -->
      <div v-if="eventStore.sidebarLoading" class="p-3 space-y-2">
        <div v-for="i in 5" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-12 px-4 text-center">
        <CalendarDaysIcon class="w-10 h-10 text-gray-300 mb-2" />
        <p class="text-xs text-gray-500">No appointments found</p>
      </div>

      <!-- Appointment items -->
      <div v-else class="divide-y divide-gray-50">
        <button
          v-for="appt in filtered"
          :key="appt.id"
          @click="eventStore.openDetailsById(appt.id)"
          class="w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start"
        >
          <!-- Status color bar -->
          <div
            class="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
            :style="{ backgroundColor: statusColor(appt.status) }"
          ></div>

          <div class="flex-1 min-w-0">
            <!-- Type chip + time -->
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <span :class="['text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide', appt.appointment_type === 'demo' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700']">
                {{ appt.appointment_type }}
              </span>
              <span class="text-[10px] text-gray-400 flex-shrink-0">
                {{ formatDateShort(appt.scheduled_date) }}
              </span>
            </div>

            <!-- Title -->
            <p class="text-xs font-semibold text-gray-900 truncate">{{ appt.title }}</p>

            <!-- Client + time -->
            <p class="text-[10px] text-gray-400 truncate mt-0.5">
              {{ appt.client?.company_name }}
              <span class="mx-1">·</span>
              {{ formatTime(appt.scheduled_start_time) }}
            </p>

            <!-- Status badge -->
            <div class="mt-1">
              <StatusBadge :status="appt.status" />
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Footer: total count -->
    <div class="px-4 py-2 border-t border-gray-100">
      <p class="text-[10px] text-gray-400">{{ filtered.length }} of {{ eventStore.sidebarAppointments.length }} appointments</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'
import { useEventStore } from '@/modules/shared/store/events.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'

const eventStore = useEventStore()
const { formatDateShort, formatTime } = useDateTime()

const filters = [
  { key: 'all',    label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'done',   label: 'Done' },
  { key: 'other',  label: 'Cancelled' }
]
const activeFilter = ref('all')

const ACTIVE_STATUSES = ['pending', 'leave_office', 'in_progress']

const filtered = computed(() => {
  const list = eventStore.sidebarAppointments
  switch (activeFilter.value) {
    case 'active': return list.filter(a => ACTIVE_STATUSES.includes(a.status))
    case 'done':   return list.filter(a => a.status === 'done')
    case 'other':  return list.filter(a => ['cancelled', 'rescheduled'].includes(a.status))
    default:       return list
  }
})

const STATUS_DOT_COLORS = {
  pending:      '#3B82F6',
  leave_office: '#F59E0B',
  in_progress:  '#10B981',
  done:         '#8B5CF6',
  cancelled:    '#EF4444',
  rescheduled:  '#6B7280'
}

function statusColor(status) {
  return STATUS_DOT_COLORS[status] || '#9CA3AF'
}

async function loadData() {
  await eventStore.loadSidebar()
}

onMounted(loadData)
</script>
