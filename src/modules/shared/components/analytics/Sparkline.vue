<template>
  <svg
    v-if="points.length > 1"
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    class="overflow-visible"
    preserveAspectRatio="none"
  >
    <polyline
      :points="polyline"
      fill="none"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle :cx="lastPoint.x" :cy="lastPoint.y" r="1.8" :fill="color" />
  </svg>
  <span v-else class="text-xs text-gray-300">—</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  points: { type: Array, default: () => [] }, // array of numbers
  color: { type: String, default: '#2563EB' },
  width: { type: Number, default: 72 },
  height: { type: Number, default: 24 },
})

const coords = computed(() => {
  const vals = props.points.filter((v) => typeof v === 'number' && !Number.isNaN(v))
  if (vals.length < 2) return []
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const stepX = props.width / (vals.length - 1)
  const pad = 2
  return vals.map((v, i) => ({
    x: i * stepX,
    y: pad + (props.height - pad * 2) * (1 - (v - min) / range),
  }))
})

const polyline = computed(() => coords.value.map((c) => `${c.x},${c.y}`).join(' '))
const lastPoint = computed(() => coords.value[coords.value.length - 1] || { x: 0, y: 0 })
</script>
