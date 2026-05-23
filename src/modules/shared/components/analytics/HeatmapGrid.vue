<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <div v-if="total" class="text-right">
        <p class="text-xs text-gray-400">Busiest</p>
        <p class="text-sm font-medium text-gray-900">{{ peakLabel }}</p>
      </div>
    </div>

    <div v-if="!cells.length" class="h-40 flex items-center justify-center text-xs text-gray-400">
      No appointment activity in this range
    </div>

    <div v-else class="overflow-x-auto">
      <div class="inline-block min-w-full">
        <!-- Hour axis -->
        <div class="flex pl-10 mb-1">
          <div
            v-for="h in hours"
            :key="`h-${h}`"
            class="text-[10px] text-gray-400 text-center"
            :style="{ width: cellSize + 'px' }"
          >
            <span v-if="h % 2 === 0">{{ h }}</span>
          </div>
        </div>

        <!-- Rows -->
        <div v-for="(day, di) in weekdays" :key="day" class="flex items-center mb-1">
          <div class="w-10 text-[11px] text-gray-500 pr-2 text-right">{{ day }}</div>
          <div
            v-for="h in hours"
            :key="`${di}-${h}`"
            class="rounded-sm m-px transition-colors"
            :style="cellStyle(di, h)"
            :title="cellTitle(di, h)"
          />
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-2 pl-10 mt-3">
          <span class="text-[10px] text-gray-400">Less</span>
          <div
            v-for="step in legendSteps"
            :key="step"
            class="w-4 h-4 rounded-sm"
            :style="{ backgroundColor: colorFor(step) }"
          />
          <span class="text-[10px] text-gray-400">More</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Appointment density' },
  subtitle: { type: String, default: 'When sessions happen — weekday × hour' },
  cells: { type: Array, default: () => [] }, // [{ weekday, hour, count }] weekday 0=Mon..6=Sun
  maxCount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const cellSize = 22

// Map "weekday-hour" -> count for O(1) lookup.
const lookup = computed(() => {
  const m = {}
  for (const c of props.cells) m[`${c.weekday}-${c.hour}`] = c.count
  return m
})

const max = computed(() => props.maxCount || Math.max(1, ...props.cells.map((c) => c.count)))

// Always render at least a typical business-hours window (8:00–18:00) so the
// grid reads as a heatmap even when data is sparse, then widen it to include
// any activity that falls outside those hours.
const BASE_LO = 8
const BASE_HI = 18
const hours = computed(() => {
  if (!props.cells.length) return []
  const present = props.cells.map((c) => c.hour)
  const lo = Math.min(BASE_LO, ...present)
  const hi = Math.max(BASE_HI, ...present)
  const out = []
  for (let h = lo; h <= hi; h++) out.push(h)
  return out
})

function countAt(di, h) {
  return lookup.value[`${di}-${h}`] || 0
}

function colorFor(intensity) {
  if (intensity <= 0) return '#F3F4F6'
  return `rgba(37, 99, 235, ${0.12 + 0.88 * intensity})`
}

function cellStyle(di, h) {
  const count = countAt(di, h)
  return {
    width: cellSize + 'px',
    height: cellSize + 'px',
    backgroundColor: colorFor(count / max.value),
  }
}

function cellTitle(di, h) {
  const count = countAt(di, h)
  return `${weekdays[di]} ${h}:00 — ${count} appointment${count === 1 ? '' : 's'}`
}

const legendSteps = [0, 0.25, 0.5, 0.75, 1]

const peakLabel = computed(() => {
  if (!props.cells.length) return '—'
  const peak = props.cells.reduce((a, b) => (b.count > a.count ? b : a), props.cells[0])
  return `${weekdays[peak.weekday]} ${peak.hour}:00`
})
</script>
