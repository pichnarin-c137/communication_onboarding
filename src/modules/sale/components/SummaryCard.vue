<template>
  <div class="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</p>
        <p v-if="subtitle" class="text-xs mt-1" :class="subtitleColor">
          <span v-if="trend" class="inline-flex items-center gap-0.5">
            <ArrowUpIcon v-if="trend === 'up'" class="w-3 h-3" />
            <ArrowDownIcon v-else class="w-3 h-3" />
            {{ subtitle }}
          </span>
          <span v-else>{{ subtitle }}</span>
        </p>
      </div>
      <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', iconBg]">
        <component :is="icon" :class="['w-5 h-5', iconColor]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/20/solid'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subtitle: { type: String, default: '' },
  icon: { type: [Object, Function], required: true },
  color: { type: String, default: 'blue' },
  trend: { type: String, default: '' }
})

const iconBg = computed(() => {
  const colors = {
    blue: 'bg-blue-50',
    green: 'bg-emerald-50',
    red: 'bg-red-50',
    yellow: 'bg-amber-50',
    purple: 'bg-purple-50'
  }
  return colors[props.color] || colors.blue
})

const iconColor = computed(() => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    red: 'text-red-600',
    yellow: 'text-amber-600',
    purple: 'text-purple-600'
  }
  return colors[props.color] || colors.blue
})

const subtitleColor = computed(() => {
  if (props.trend === 'up') return 'text-emerald-600'
  if (props.trend === 'down') return 'text-red-500'
  return 'text-gray-400'
})
</script>
