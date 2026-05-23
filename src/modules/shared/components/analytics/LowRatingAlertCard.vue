<template>
  <div class="bg-white border border-rose-200 rounded-xl p-4 flex items-start gap-3">
    <div class="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
      <ExclamationTriangleIcon class="w-4 h-4 text-rose-600" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1 flex-wrap">
        <div class="flex items-center gap-0.5">
          <StarIcon
            v-for="n in 5"
            :key="n"
            class="w-3.5 h-3.5"
            :class="n <= alert.rating ? 'text-amber-400' : 'text-gray-200'"
          />
        </div>
        <span
          class="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
          :class="alert.source === 'onboarding' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'"
        >
          {{ alert.source === 'onboarding' ? 'Onboarding' : 'Appointment' }}
        </span>
        <span class="text-xs text-gray-400">{{ formattedTime }}</span>
      </div>
      <p class="text-sm text-gray-900 line-clamp-2 mb-1.5">
        "{{ alert.comment || 'No comment provided' }}"
      </p>
      <div class="flex items-center gap-3 text-xs text-gray-500">
        <span class="truncate">
          <span class="text-gray-400">Client:</span>
          <span class="text-gray-700 ml-1">{{ alert.client_name || '—' }}</span>
        </span>
        <span class="truncate">
          <span class="text-gray-400">Trainer:</span>
          <span class="text-gray-700 ml-1">{{ alert.trainer_name || '—' }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { StarIcon } from '@heroicons/vue/20/solid'

const props = defineProps({
  alert: { type: Object, required: true },
})

const formattedTime = computed(() => {
  if (!props.alert.submitted_at) return ''
  const date = new Date(props.alert.submitted_at)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now - date
  const diffH = diffMs / 1000 / 60 / 60
  if (diffH < 1) return `${Math.round(diffH * 60)}m ago`
  if (diffH < 24) return `${Math.round(diffH)}h ago`
  const diffD = diffH / 24
  if (diffD < 7) return `${Math.round(diffD)}d ago`
  return date.toLocaleDateString()
})
</script>
