<template>
  <Transition name="slide-up">
    <div v-if="isVisible" class="bg-white rounded-xl border border-gray-200 mt-4 overflow-hidden">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900">
          {{ formattedDate }}
        </h3>
        <span class="text-xs font-medium text-gray-400">
          {{ dayEvents.length }} event{{ dayEvents.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Event List -->
      <div v-if="dayEvents.length" class="divide-y divide-gray-50">
        <div
          v-for="event in dayEvents"
          :key="event.id"
          @click="eventStore.openDetailsModal(event)"
          class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <!-- Status color bar -->
          <div
            class="w-1 self-stretch rounded-full shrink-0 mt-0.5"
            :style="{ backgroundColor: event.borderColor || '#9CA3AF' }"
          ></div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span :class="[
                'text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide',
                event.type === 'demo' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              ]">{{ event.type }}</span>
              <StatusBadge v-if="event.status" :status="event.status" />
            </div>
            <p class="text-sm font-medium text-gray-900 truncate">{{ event.title }}</p>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <ClockIcon class="w-3 h-3" />
                {{ formatTime(event.start) }}<template v-if="event.end"> — {{ formatTime(event.end) }}</template>
              </span>
              <span class="capitalize">{{ event.format || 'physical' }}</span>
            </div>
            <div v-if="event.clientName || event.trainerName" class="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
              <span v-if="event.clientName">{{ event.clientName }}</span>
              <span v-if="event.trainerName">· {{ event.trainerName }}</span>
            </div>
          </div>

          <ChevronRightIcon class="w-4 h-4 text-gray-300 shrink-0 mt-2" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="px-4 py-8 text-center">
        <p class="text-sm text-gray-500">No events on this day</p>
        <button
          @click="eventStore.openCreateModal({ date: calendarStore.selectedDate })"
          class="mt-2 text-sm text-primary hover:text-primary-dark font-medium"
        >
          Create an appointment
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { ClockIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useCalendarStore } from '@/modules/shared/store/calendar.js'
import { useEventStore } from '@/modules/shared/store/events.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'

const calendarStore = useCalendarStore()
const eventStore = useEventStore()

const isVisible = computed(() => {
  return calendarStore.currentView === 'dayGridMonth' && calendarStore.selectedDate
})

const dayEvents = computed(() => {
  if (!calendarStore.selectedDate) return []
  const dateStr = calendarStore.selectedDate
  return eventStore.filteredEvents
    .filter(e => e.start && e.start.startsWith(dateStr))
    .sort((a, b) => a.start.localeCompare(b.start))
})

const { formatDateFull, formatTimeFromISO } = useDateTime()

const formattedDate = computed(() => {
  if (!calendarStore.selectedDate) return ''
  return formatDateFull(calendarStore.selectedDate)
})

function formatTime(isoStr) {
  if (!isoStr) return ''
  return formatTimeFromISO(isoStr)
}
</script>
