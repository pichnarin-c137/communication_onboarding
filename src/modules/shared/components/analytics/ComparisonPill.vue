<template>
  <span
    v-if="!hidden"
    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium"
    :class="toneClasses"
    :title="tooltip"
  >
    <component :is="icon" class="w-3 h-3" />
    {{ formatted }}
  </span>
  <span v-else class="inline-flex items-center text-xs text-gray-400">
    —
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/vue/20/solid'

const props = defineProps({
  deltaPct: { type: Number, default: null },
  goodDirection: { type: String, default: 'up' },
})

const hidden = computed(
  () => props.deltaPct === null || props.deltaPct === undefined || Number.isNaN(props.deltaPct),
)

const isFlat = computed(() => !hidden.value && Math.abs(props.deltaPct) < 0.5)

const isUp = computed(() => !hidden.value && props.deltaPct > 0)

const icon = computed(() => {
  if (isFlat.value) return MinusIcon
  return isUp.value ? ArrowUpIcon : ArrowDownIcon
})

const isGood = computed(() => {
  if (isFlat.value) return null
  if (props.goodDirection === 'up') return isUp.value
  if (props.goodDirection === 'down') return !isUp.value
  return null
})

const toneClasses = computed(() => {
  if (isFlat.value) return 'bg-gray-100 text-gray-600'
  if (isGood.value === true) return 'bg-emerald-50 text-emerald-700'
  if (isGood.value === false) return 'bg-rose-50 text-rose-700'
  return 'bg-gray-100 text-gray-600'
})

const formatted = computed(() => {
  if (hidden.value) return ''
  const abs = Math.abs(props.deltaPct).toFixed(1)
  if (isFlat.value) return `${abs}%`
  return `${abs}%`
})

const tooltip = computed(() => {
  if (hidden.value) return ''
  return `${props.deltaPct >= 0 ? '+' : ''}${props.deltaPct.toFixed(1)}% vs previous period`
})
</script>
