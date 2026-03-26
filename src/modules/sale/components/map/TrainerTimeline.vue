<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        {{ isToday ? "Today's Timeline" : 'Timeline' }}
      </h2>
      <input
        type="date"
        :value="selectedDate"
        :max="today"
        class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
        @input="$emit('date-change', $event.target.value)"
      />
    </div>

    <div v-if="!events?.length" class="py-8 text-center">
      <p class="text-sm text-gray-400">No activity for this date</p>
    </div>

    <div v-else class="relative ml-2">
      <div class="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
      <div
        v-for="(event, idx) in events"
        :key="idx"
        class="relative pl-7 pb-5 last:pb-0"
      >
        <div
          class="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white"
          :style="{ backgroundColor: statusColor(event.status), boxShadow: `0 0 0 2px ${statusColor(event.status)}33` }"
        ></div>
        <div class="text-xs text-gray-400">{{ formatEventTime(event.timestamp) }}</div>
        <div class="text-sm text-gray-800 mt-0.5">
          {{ event.description }}
          <span v-if="event.duration" class="text-gray-400 ml-1">({{ event.duration }})</span>
          <span v-if="event.detection_method === 'geofence'" class="text-xs text-gray-400 ml-1">(geofence)</span>
          <span v-if="event.detection_method === 'manual'" class="text-xs text-gray-400 ml-1">(manual)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { STATUS_COLORS } from '@/modules/shared/composables/useMap.js'

const props = defineProps({
  events: { type: Array, default: () => [] },
  selectedDate: { type: String, required: true }
})

defineEmits(['date-change'])

const today = new Date().toISOString().split('T')[0]
const isToday = computed(() => props.selectedDate === today)

function statusColor(status) {
  return STATUS_COLORS[status] || '#9CA3AF'
}

function formatEventTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}
</script>
