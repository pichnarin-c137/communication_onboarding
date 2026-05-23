<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
    </div>

    <div v-if="!hasData" class="h-44 flex items-center justify-center text-xs text-gray-400">
      No data in this range
    </div>

    <div v-else class="flex items-center gap-5">
      <div class="relative flex-shrink-0" style="width: 132px; height: 132px">
        <Doughnut :data="chartData" :options="chartOptions" />
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-lg font-semibold text-gray-900 leading-none">{{ total.toLocaleString() }}</span>
          <span class="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{{ centerLabel }}</span>
        </div>
      </div>
      <ul class="flex-1 space-y-1.5 min-w-0">
        <li v-for="seg in segments" :key="seg.label" class="flex items-center gap-2 text-xs">
          <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" :style="{ backgroundColor: seg.color }" />
          <span class="text-gray-600 truncate flex-1">{{ seg.label }}</span>
          <span class="text-gray-900 font-medium tabular-nums">{{ seg.value.toLocaleString() }}</span>
          <span class="text-gray-400 tabular-nums w-10 text-right">{{ pct(seg.value) }}%</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  segments: { type: Array, default: () => [] }, // [{ label, value, color }]
  centerLabel: { type: String, default: 'total' },
})

const total = computed(() => props.segments.reduce((sum, s) => sum + (s.value || 0), 0))
const hasData = computed(() => total.value > 0)

function pct(v) {
  if (!total.value) return '0'
  return ((v / total.value) * 100).toFixed(0)
}

const chartData = computed(() => ({
  labels: props.segments.map((s) => s.label),
  datasets: [
    {
      data: props.segments.map((s) => s.value || 0),
      backgroundColor: props.segments.map((s) => s.color),
      borderWidth: 0,
      cutout: '70%',
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#111827',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 8,
      cornerRadius: 6,
    },
  },
}
</script>
