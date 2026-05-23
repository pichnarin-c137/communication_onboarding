<template>
  <div>
    <div class="flex items-center justify-between text-[11px] mb-0.5">
      <span class="text-gray-500">{{ label }}</span>
      <span class="font-medium tabular-nums" :class="textClass">
        {{ value }}<span class="text-gray-400 font-normal">/{{ cap }}</span>
      </span>
    </div>
    <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all"
        :class="barClass"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, default: 0 },
  cap: { type: Number, default: 1 },
})

const percent = computed(() => {
  if (!props.cap) return 0
  return Math.min(100, Math.round((props.value / props.cap) * 100))
})

const isAtCap = computed(() => props.value >= props.cap)
const isWarn = computed(() => percent.value >= 70 && !isAtCap.value)

const barClass = computed(() => {
  if (isAtCap.value) return 'bg-red-500'
  if (isWarn.value) return 'bg-amber-500'
  return 'bg-primary'
})

const textClass = computed(() => {
  if (isAtCap.value) return 'text-red-600'
  if (isWarn.value) return 'text-amber-700'
  return 'text-gray-700'
})
</script>
