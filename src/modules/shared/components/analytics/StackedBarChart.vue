<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <button
        v-if="exportable && labels.length"
        type="button"
        @click="exportPng"
        title="Download PNG"
        class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowDownTrayIcon class="w-3.5 h-3.5" />
      </button>
    </div>
    <div v-if="!labels.length" class="h-56 flex items-center justify-center text-xs text-gray-400">
      No data in this range
    </div>
    <div v-else class="relative" style="height: 240px">
      <Bar ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import { ArrowDownTrayIcon } from '@heroicons/vue/20/solid'
import { downloadChartPng } from '@/modules/shared/composables/useChartPng.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  buckets: { type: Array, default: () => [] }, // [{ bucket, [key]: count, ... }]
  stacks: { type: Array, required: true }, // [{ key, label, color }]
  exportable: { type: Boolean, default: false },
})

const labels = computed(() => props.buckets.map((b) => b.bucket))

const chartRef = ref(null)
function exportPng() {
  const slug = props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  downloadChartPng(chartRef, `${slug || 'chart'}.png`)
}

const chartData = computed(() => ({
  labels: labels.value,
  datasets: props.stacks.map((s) => ({
    label: s.label,
    backgroundColor: s.color,
    borderRadius: 4,
    barThickness: 16,
    data: props.buckets.map((b) => b[s.key] || 0),
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
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
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { font: { size: 10 }, color: '#9CA3AF', maxRotation: 0 },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: { color: '#F3F4F6', drawBorder: false },
      ticks: { font: { size: 10 }, color: '#9CA3AF' },
    },
  },
}))
</script>
