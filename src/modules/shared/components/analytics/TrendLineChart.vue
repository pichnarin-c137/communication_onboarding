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
          v-if="exportable && series && series.length"
          type="button"
          @click="exportPng"
          title="Download PNG"
          class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowDownTrayIcon class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div v-if="!series || series.length === 0" class="h-56 flex items-center justify-center text-xs text-gray-400">
      No data in this range
    </div>
    <div v-else class="relative" style="height: 240px">
      <Line ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
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
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  series: { type: Array, default: () => [] },
  compareSeries: { type: Array, default: () => [] },
  format: { type: String, default: 'number' }, // number | percent | rating
  color: { type: String, default: '#2563EB' },
  exportable: { type: Boolean, default: false },
})

const chartRef = ref(null)
function exportPng() {
  const slug = props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  downloadChartPng(chartRef, `${slug || 'trend'}.png`)
}

function formatY(v) {
  if (v === null || v === undefined) return ''
  switch (props.format) {
    case 'percent':
      return `${(v * 100).toFixed(0)}%`
    case 'rating':
      return v.toFixed(1)
    default:
      return v.toLocaleString()
  }
}

const chartData = computed(() => {
  const labels = props.series.map((p) => p.bucket)
  const dsets = [
    {
      label: 'Current',
      data: props.series.map((p) => p.value),
      borderColor: props.color,
      backgroundColor: `${props.color}1a`,
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2,
    },
  ]
  if (props.compareSeries && props.compareSeries.length) {
    dsets.push({
      label: 'Previous',
      data: props.compareSeries.map((p) => p.value),
      borderColor: '#9CA3AF',
      borderDash: [4, 4],
      fill: false,
      tension: 0.35,
      pointRadius: 0,
      borderWidth: 1.5,
    })
  }
  return { labels, datasets: dsets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: {
      display: props.compareSeries && props.compareSeries.length > 0,
      position: 'top',
      align: 'end',
      labels: { boxWidth: 8, boxHeight: 8, font: { size: 11 }, color: '#6B7280' },
    },
    tooltip: {
      backgroundColor: '#111827',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 10,
      cornerRadius: 6,
      callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatY(ctx.parsed.y)}` },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 }, color: '#9CA3AF', maxRotation: 0 },
    },
    y: {
      beginAtZero: true,
      grid: { color: '#F3F4F6', drawBorder: false },
      ticks: { font: { size: 10 }, color: '#9CA3AF', callback: (v) => formatY(v) },
    },
  },
}))
</script>
