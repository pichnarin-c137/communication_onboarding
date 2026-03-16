<template>
  <div :class="['rounded-xl p-4 border', bgClass]">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-medium" :class="labelClass">{{ label }}</p>
        <p class="text-2xl font-bold mt-0.5" :class="valueClass">{{ value }}</p>
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

const bgClass = computed(() => {
  const m = { blue: 'bg-blue-50 border-blue-100', green: 'bg-emerald-50 border-emerald-100', purple: 'bg-purple-50 border-purple-100' }
  return m[props.color] || m.blue
})
const labelClass = computed(() => {
  const m = { blue: 'text-blue-600', green: 'text-emerald-600', purple: 'text-purple-600' }
  return m[props.color] || m.blue
})
const valueClass = computed(() => {
  const m = { blue: 'text-blue-900', green: 'text-emerald-900', purple: 'text-purple-900' }
  return m[props.color] || m.blue
})
const iconBgClass = computed(() => {
  const m = { blue: 'bg-blue-100', green: 'bg-emerald-100', purple: 'bg-purple-100' }
  return m[props.color] || m.blue
})
const iconClass = computed(() => {
  const m = { blue: 'text-blue-600', green: 'text-emerald-600', purple: 'text-purple-600' }
  return m[props.color] || m.blue
})
</script>
