<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-1.5">
        <slot name="actions" />
        <button
          v-if="exportable && history.length"
          type="button"
          @click="exportPng"
          title="Download PNG"
          class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowDownTrayIcon class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div v-if="!history.length" class="h-56 flex items-center justify-center text-xs text-gray-400">
      No data in this range
    </div>
    <template v-else>
      <div class="relative" style="height: 240px">
        <Line ref="chartRef" :data="chartData" :options="chartOptions" />
      </div>
      <p v-if="insufficient" class="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        Not enough history to project yet — need at least 4 data points. Showing actuals only.
      </p>
      <p v-else-if="modelCaption" class="mt-3 text-[11px] text-gray-400">{{ modelCaption }}</p>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import { ArrowDownTrayIcon } from '@heroicons/vue/20/solid'
import { downloadChartPng } from '@/modules/shared/composables/useChartPng.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps({
  title: { type: String, default: 'Forecast' },
  subtitle: { type: String, default: '' },
  history: { type: Array, default: () => [] }, // [{ bucket, value }]
  forecast: { type: Array, default: () => [] }, // [{ bucket, value, lower, upper }]
  model: { type: Object, default: () => ({}) },
  method: { type: String, default: '' },
  format: { type: String, default: 'number' }, // number | percent | rating
  exportable: { type: Boolean, default: false },
})

const insufficient = computed(
  () => props.model?.note === 'insufficient_history' || props.forecast.length === 0,
)

function formatY(v) {
  if (v === null || v === undefined) return ''
  switch (props.format) {
    case 'percent':
      return `${(v * 100).toFixed(0)}%`
    case 'rating':
      return v.toFixed(1)
    default:
      return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(1)
  }
}

const chartData = computed(() => {
  const h = props.history
  const f = props.forecast
  const n = h.length
  const m = f.length
  const lastVal = n ? h[n - 1].value : null
  const lead = Array(Math.max(0, n - 1)).fill(null)

  const labels = [...h.map((p) => p.bucket), ...f.map((p) => p.bucket)]

  const datasets = []

  if (m) {
    // Confidence band (drawn first → behind the lines). Anchored at the last
    // actual so it grows out of the history line.
    datasets.push({
      label: '_upper',
      data: [...lead, lastVal, ...f.map((p) => p.upper)],
      borderColor: 'transparent',
      backgroundColor: 'rgba(99, 102, 241, 0.12)',
      fill: '+1',
      pointRadius: 0,
      borderWidth: 0,
      tension: 0.3,
    })
    datasets.push({
      label: '_lower',
      data: [...lead, lastVal, ...f.map((p) => p.lower)],
      borderColor: 'transparent',
      fill: false,
      pointRadius: 0,
      borderWidth: 0,
      tension: 0.3,
    })
  }

  datasets.push({
    label: 'Actual',
    data: [...h.map((p) => p.value), ...Array(m).fill(null)],
    borderColor: '#2563EB',
    backgroundColor: '#2563EB1a',
    fill: false,
    tension: 0.3,
    pointRadius: 3,
    pointHoverRadius: 5,
    borderWidth: 2,
  })

  if (m) {
    datasets.push({
      label: 'Forecast',
      data: [...lead, lastVal, ...f.map((p) => p.value)],
      borderColor: '#6366F1',
      borderDash: [5, 4],
      fill: false,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2,
    })
  }

  return { labels, datasets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        boxWidth: 8,
        boxHeight: 8,
        font: { size: 11 },
        color: '#6B7280',
        filter: (item) => !item.text.startsWith('_'),
      },
    },
    tooltip: {
      backgroundColor: '#111827',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 10,
      cornerRadius: 6,
      filter: (ctx) => !ctx.dataset.label.startsWith('_'),
      callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatY(ctx.parsed.y)}` },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9CA3AF', maxRotation: 0 } },
    y: {
      beginAtZero: props.format !== 'rating',
      grid: { color: '#F3F4F6', drawBorder: false },
      ticks: { font: { size: 10 }, color: '#9CA3AF', callback: (v) => formatY(v) },
    },
  },
}))

const METHOD_LABELS = { holt: "Holt's linear", linear: 'Least-squares', moving_avg: 'Moving average' }

const modelCaption = computed(() => {
  const m = props.model || {}
  const parts = []
  if (props.method) parts.push(METHOD_LABELS[props.method] || props.method)
  if (m.mape != null) parts.push(`MAPE ${(m.mape * 100).toFixed(0)}%`)
  if (m.confidence_level != null) parts.push(`${Math.round(m.confidence_level * 100)}% band`)
  return parts.join(' · ')
})

const chartRef = ref(null)
function exportPng() {
  const slug = props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  downloadChartPng(chartRef, `${slug || 'forecast'}.png`)
}
</script>
