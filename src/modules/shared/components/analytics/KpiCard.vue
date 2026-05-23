<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    class="group bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-2 transition-colors"
    :class="to ? 'hover:border-gray-300 hover:bg-gray-50/50 cursor-pointer' : ''"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {{ label }}
      </span>
      <ArrowUpRightIcon
        v-if="to"
        class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors"
      />
    </div>
    <div class="flex items-end justify-between gap-2">
      <div class="text-2xl font-semibold text-gray-900 leading-tight">
        {{ displayValue }}
      </div>
    </div>
    <div class="flex items-center gap-2 text-xs text-gray-500">
      <ComparisonPill :delta-pct="deltaPct" :good-direction="goodDirection" />
      <span v-if="previous !== null && previous !== undefined" class="text-gray-400">
        vs {{ formatValue(previous) }}
      </span>
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowUpRightIcon } from '@heroicons/vue/20/solid'
import ComparisonPill from './ComparisonPill.vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: null },
  previous: { type: [Number, String], default: null },
  deltaPct: { type: Number, default: null },
  goodDirection: { type: String, default: 'up' },
  format: { type: String, default: 'number' }, // number | percent | rating | duration | currency
  decimals: { type: Number, default: null },
  to: { type: [String, Object], default: null },
})

function formatValue(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—'
  const n = Number(v)
  switch (props.format) {
    case 'percent': {
      const dp = props.decimals ?? 1
      return `${(n * 100).toFixed(dp)}%`
    }
    case 'rating': {
      const dp = props.decimals ?? 2
      return n.toFixed(dp)
    }
    case 'duration': {
      if (n < 1) return `${Math.round(n * 60)}m`
      if (n < 48) return `${n.toFixed(1)}h`
      return `${(n / 24).toFixed(1)}d`
    }
    case 'number':
    default: {
      const dp = props.decimals ?? 0
      return Number.isInteger(n) && dp === 0
        ? n.toLocaleString()
        : n.toFixed(dp)
    }
  }
}

const displayValue = computed(() => formatValue(props.value))
</script>
