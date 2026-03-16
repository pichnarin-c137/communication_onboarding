<template>
  <div class="w-full">
    <div v-if="showLabel" class="flex justify-between items-center mb-1">
      <span class="text-xs font-medium text-gray-600">{{ label }}</span>
      <span class="text-xs font-semibold" :class="progressColor">{{ percentage }}%</span>
    </div>
    <div :class="['w-full rounded-full overflow-hidden', bgClass]" :style="{ height: height + 'px' }">
      <div
        class="h-full rounded-full progress-bar-fill"
        :class="barColor"
        :style="{ width: percentage + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: { type: Number, default: 0 },
  showLabel: { type: Boolean, default: true },
  label: { type: String, default: 'Progress' },
  height: { type: Number, default: 6 },
  size: { type: String, default: 'md' }
})

const bgClass = computed(() => 'bg-gray-200')

const barColor = computed(() => {
  if (props.percentage >= 100) return 'bg-emerald-500'
  if (props.percentage >= 60) return 'bg-primary'
  if (props.percentage >= 30) return 'bg-yellow-500'
  return 'bg-red-400'
})

const progressColor = computed(() => {
  if (props.percentage >= 100) return 'text-emerald-600'
  if (props.percentage >= 60) return 'text-primary'
  if (props.percentage >= 30) return 'text-yellow-600'
  return 'text-red-500'
})
</script>
