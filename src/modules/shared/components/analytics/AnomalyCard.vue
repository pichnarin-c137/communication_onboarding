<template>
  <div
    class="bg-white border rounded-xl p-4 flex flex-col gap-2"
    :class="accent.border"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-gray-900 truncate">{{ anomaly.label }}</p>
        <p class="text-[11px] text-gray-400 mt-0.5">Week of {{ bucketLabel }}</p>
      </div>
      <span
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
        :class="accent.badge"
      >
        <component :is="directionIcon" class="w-3 h-3" />
        {{ severityLabel }}
      </span>
    </div>

    <div class="flex items-end gap-2">
      <span class="text-2xl font-semibold leading-none" :class="accent.value">
        {{ formatMetric(anomaly.value) }}
      </span>
      <span class="text-xs text-gray-400 mb-0.5">
        vs {{ formatMetric(anomaly.baseline_mean) }} avg
      </span>
    </div>

    <p class="text-xs" :class="accent.text">
      {{ summaryLine }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/vue/20/solid'

const props = defineProps({
  anomaly: { type: Object, required: true },
})

const PERCENT_METRICS = ['completion_rate', 'cancellation_rate', 'no_show_rate']

function formatMetric(v) {
  if (v === null || v === undefined) return '—'
  const n = Number(v)
  if (PERCENT_METRICS.includes(props.anomaly.metric)) return `${(n * 100).toFixed(1)}%`
  if (props.anomaly.metric === 'avg_rating') return n.toFixed(2)
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(1)
}

const bucketLabel = computed(() => {
  const d = new Date(props.anomaly.bucket)
  return Number.isNaN(d.getTime()) ? props.anomaly.bucket : d.toLocaleDateString()
})

const directionIcon = computed(() =>
  props.anomaly.direction === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon,
)

const severityLabel = computed(() => {
  const z = Math.abs(props.anomaly.z_score ?? 0)
  return `${z.toFixed(1)}σ ${props.anomaly.direction === 'up' ? 'above' : 'below'}`
})

// Concerning anomalies get a warm/alarm tint scaled by severity; a move in the
// healthy direction is shown calmly in emerald.
const accent = computed(() => {
  if (!props.anomaly.is_concerning) {
    return {
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      value: 'text-emerald-700',
      text: 'text-emerald-600',
    }
  }
  if (props.anomaly.severity === 'high') {
    return {
      border: 'border-rose-300',
      badge: 'bg-rose-100 text-rose-700',
      value: 'text-rose-700',
      text: 'text-rose-600',
    }
  }
  return {
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    value: 'text-amber-700',
    text: 'text-amber-600',
  }
})

const summaryLine = computed(() => {
  const a = props.anomaly
  if (!a.is_concerning) {
    return `Moved in a healthy direction — ${formatMetric(a.value)} vs a typical ${formatMetric(a.baseline_mean)}.`
  }
  return `Off baseline by ${Math.abs(a.z_score ?? 0).toFixed(1)} standard deviations — worth a look.`
})
</script>
