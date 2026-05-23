<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">Dedicated Trainers</h3>
        <p class="text-xs text-gray-500 mt-0.5">
          This sale can only assign trainers from this roster when creating appointments.
        </p>
      </div>
      <button
        v-if="!readonly"
        @click="$emit('edit')"
        class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
      >
        Edit Roster
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-6">
      <div class="space-y-3 animate-pulse">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-200"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-40"></div>
            <div class="h-3 bg-gray-100 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="trainers.length === 0"
      class="bg-white border border-gray-200 rounded-xl p-8 text-center"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-3">
        <ExclamationTriangleIcon class="w-6 h-6 text-amber-500" />
      </div>
      <h4 class="text-sm font-semibold text-gray-900">No dedicated trainers</h4>
      <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
        Assign at least one trainer so this sale can create appointments.
      </p>
      <button
        v-if="!readonly"
        @click="$emit('edit')"
        class="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
      >
        <PlusIcon class="w-4 h-4" />
        Assign Trainers
      </button>
    </div>

    <!-- Roster list -->
    <div v-else class="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
      <div
        v-for="t in trainers"
        :key="t.trainer_user_id"
        class="flex items-center gap-3 px-4 py-3"
      >
        <div class="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
          <span class="text-sm font-semibold text-teal-700">{{ initials(t) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ t.full_name || `${t.first_name} ${t.last_name}` }}</p>
          <p class="text-xs text-gray-500 mt-0.5">
            Assigned {{ formatDate(t.assigned_at) }}
            <span v-if="t.assigned_by_id" class="text-gray-400">
              · by {{ shortId(t.assigned_by_id) }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Counter footer -->
    <p v-if="!loading && trainers.length > 0" class="text-xs text-gray-500">
      {{ trainers.length }} trainer{{ trainers.length === 1 ? '' : 's' }} on roster
    </p>
  </div>
</template>

<script setup>
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/vue/24/outline'

defineProps({
  trainers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
})

defineEmits(['edit'])

function initials(t) {
  const f = t.first_name?.[0] || ''
  const l = t.last_name?.[0] || ''
  const out = (f + l).toUpperCase()
  if (out) return out
  return t.full_name?.[0]?.toUpperCase() || '?'
}

function shortId(id) {
  if (!id) return ''
  return id.slice(0, 8)
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}
</script>
