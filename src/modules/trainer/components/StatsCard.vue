<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500">{{ label }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-0.5">{{ value }}</p>
      </div>
      <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', iconBgClass]">
        <component :is="icon" :class="['w-5 h-5', iconClass]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [String, Number],
  icon: [Object, Function],
  color: { type: String, default: 'blue' }
})

const iconBgClass = computed(() => {
  const m = {
    blue: 'bg-blue-50',
    green: 'bg-emerald-50',
    purple: 'bg-purple-50',
    yellow: 'bg-amber-50',
    red: 'bg-red-50'
  }
  return m[props.color] || m.blue
})

const iconClass = computed(() => {
  const m = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
    yellow: 'text-amber-600',
    red: 'text-red-600'
  }
  return m[props.color] || m.blue
})
</script>
