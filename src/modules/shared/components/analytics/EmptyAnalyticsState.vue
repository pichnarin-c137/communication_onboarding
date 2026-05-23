<template>
  <div class="bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center text-center">
    <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <ChartBarIcon class="w-6 h-6 text-gray-400" />
    </div>
    <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
    <p class="text-sm text-gray-500 mt-1 max-w-sm">{{ description }}</p>
    <button
      v-if="actionLabel"
      type="button"
      @click="$emit('action')"
      class="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
import { ChartBarIcon } from '@heroicons/vue/24/outline'

defineProps({
  title: { type: String, default: 'No data in this range' },
  description: {
    type: String,
    default: 'Try widening the date range or removing filters to see analytics.',
  },
  actionLabel: { type: String, default: '' },
})

defineEmits(['action'])
</script>
