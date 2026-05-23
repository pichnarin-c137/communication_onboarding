<template>
  <div class="flex flex-wrap items-center gap-2">
    <!-- Preset buttons -->
    <div class="inline-flex items-center bg-gray-100 rounded-lg p-0.5">
      <button
        v-for="preset in presets"
        :key="preset.key"
        type="button"
        @click="applyPreset(preset)"
        :class="[
          'px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
          activePreset === preset.key
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900',
        ]"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Custom range pickers -->
    <div class="flex items-center gap-1.5">
      <div class="flex items-center gap-1.5 border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white">
        <CalendarDaysIcon class="w-3.5 h-3.5 text-gray-400" />
        <input
          :value="from"
          @change="onFromChange($event)"
          type="date"
          class="text-xs outline-none bg-transparent text-gray-700 w-28"
        />
      </div>
      <span class="text-xs text-gray-400">→</span>
      <div class="flex items-center gap-1.5 border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white">
        <CalendarDaysIcon class="w-3.5 h-3.5 text-gray-400" />
        <input
          :value="to"
          @change="onToChange($event)"
          type="date"
          class="text-xs outline-none bg-transparent text-gray-700 w-28"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  from: { type: String, required: true },
  to: { type: String, required: true },
})

const emit = defineEmits(['change'])

function toISODate(d) {
  return d.toISOString().slice(0, 10)
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function startOfMonth(offsetMonths = 0) {
  const d = new Date()
  d.setMonth(d.getMonth() - offsetMonths, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfMonth(offsetMonths = 0) {
  const d = new Date()
  d.setMonth(d.getMonth() - offsetMonths + 1, 0)
  return d
}

const presets = [
  { key: '7d', label: 'Last 7 days', build: () => ({ from: toISODate(daysAgo(6)), to: toISODate(new Date()) }) },
  { key: '30d', label: 'Last 30 days', build: () => ({ from: toISODate(daysAgo(29)), to: toISODate(new Date()) }) },
  { key: 'thisMonth', label: 'This month', build: () => ({ from: toISODate(startOfMonth(0)), to: toISODate(new Date()) }) },
  { key: 'lastMonth', label: 'Last month', build: () => ({ from: toISODate(startOfMonth(1)), to: toISODate(endOfMonth(1)) }) },
  { key: '90d', label: 'Last 90 days', build: () => ({ from: toISODate(daysAgo(89)), to: toISODate(new Date()) }) },
]

const activePreset = computed(() => {
  for (const p of presets) {
    const r = p.build()
    if (r.from === props.from && r.to === props.to) return p.key
  }
  return null
})

function applyPreset(preset) {
  const r = preset.build()
  emit('change', r)
}

function onFromChange(e) {
  const v = e.target.value
  if (!v) return
  emit('change', { from: v, to: props.to })
}

function onToChange(e) {
  const v = e.target.value
  if (!v) return
  emit('change', { from: props.from, to: v })
}
</script>
