<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div
      v-for="card in cards"
      :key="card.label"
      class="bg-white rounded-xl border border-gray-200 p-4 text-center"
    >
      <dt class="text-xs text-gray-500 uppercase tracking-wide">{{ card.label }}</dt>
      <dd
        class="mt-1 text-lg font-bold truncate"
        :style="card.color ? { color: card.color } : {}"
      >
        {{ card.value || '—' }}
      </dd>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { STATUS_COLORS } from '@/modules/shared/composables/useMap.js'

const props = defineProps({
  status: { type: String, default: null },
  customerName: { type: String, default: null },
  etaMinutes: { type: Number, default: null },
  sessionDuration: { type: String, default: null },
  timeLabel: { type: String, default: null },
  timeValue: { type: String, default: null }
})

const statusLabel = computed(() => {
  const map = {
    at_office: 'At Office',
    en_route: 'En Route',
    leave_office: 'En Route',
    arrived: 'Arrived',
    in_session: 'In Session',
    in_progress: 'In Session',
    completed: 'Completed',
    done: 'Completed'
  }
  return map[props.status] || props.status || '—'
})

const etaDisplay = computed(() => {
  if (props.sessionDuration) return props.sessionDuration
  if (props.etaMinutes != null) return `${props.etaMinutes} min`
  return '—'
})

const etaLabel = computed(() => {
  if (props.sessionDuration) return 'Duration'
  if (['in_session', 'in_progress'].includes(props.status)) return 'Duration'
  return 'ETA'
})

const cards = computed(() => [
  { label: 'Status', value: statusLabel.value, color: STATUS_COLORS[props.status] || null },
  { label: 'Customer', value: props.customerName, color: null },
  { label: etaLabel.value, value: etaDisplay.value, color: null },
  { label: props.timeLabel || 'Last Update', value: props.timeValue || '—', color: null }
])
</script>
