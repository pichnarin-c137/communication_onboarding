<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Revision History</h3>
          <p class="text-xs text-gray-400">Requested corrections and trainer responses</p>
        </div>
      </div>
      <span v-if="!loading" class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
        {{ revisions.length }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="px-5 py-5 space-y-4">
      <div v-for="i in 2" :key="i" class="flex gap-4">
        <div class="flex flex-col items-center shrink-0">
          <div class="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1" />
          <div v-if="i < 2" class="w-px flex-1 bg-gray-100 mt-1.5" />
        </div>
        <div class="flex-1 pb-4 space-y-2">
          <div class="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
          <div class="h-4 bg-gray-100 rounded animate-pulse w-full" />
          <div class="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="revisions.length === 0" class="flex flex-col items-center justify-center py-9 px-5 text-center">
      <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mb-2.5">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-gray-600">No revisions requested</p>
      <p class="text-xs text-gray-400 mt-0.5">All clear — no corrections have been submitted</p>
    </div>

    <!-- Timeline -->
    <div v-else class="px-5 py-4">
      <ol class="relative ml-1.5">
        <li
          v-for="(rev, idx) in revisions"
          :key="rev.id"
          class="relative pl-6 pb-5 last:pb-0"
        >
          <!-- Vertical connector line -->
          <span
            v-if="idx < revisions.length - 1"
            class="absolute left-[4px] top-3 bottom-0 w-px bg-gray-200"
          />
          <!-- Status dot -->
          <span
            class="absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2 border-white"
            :class="rev.acknowledged_at ? 'bg-emerald-400' : 'bg-amber-400'"
          />

          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="text-xs text-gray-400">
                  {{ formatDateTime(rev.created_at || rev.requested_at) }}
                </span>
                <span
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                  :class="rev.acknowledged_at ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                >
                  {{ rev.acknowledged_at ? 'Acknowledged' : 'Pending' }}
                </span>
              </div>
              <p class="text-sm text-gray-800 leading-relaxed">{{ rev.note }}</p>
              <p v-if="rev.acknowledged_at" class="text-xs text-gray-400 mt-1">
                Acknowledged {{ formatDateTime(rev.acknowledged_at) }}
              </p>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onboardingService } from '@/modules/shared/services/onboardingService'
import { useDateTime } from '@/modules/shared/composables/useDateTime'
import { useToast } from '@/modules/shared/composables/useToast'
import { extractErrorMessage } from '@core/services/error.handler'

const props = defineProps({ onboardingId: { type: [String, Number], required: true } })
const { formatDateTimeFromISO } = useDateTime()
const { error } = useToast()

const revisions = ref([])
const loading = ref(false)

const formatDateTime = (iso) => formatDateTimeFromISO(iso) ?? '—'

async function load() {
  loading.value = true
  try {
    const data = await onboardingService.getRevisionHistory(props.onboardingId)
    revisions.value = Array.isArray(data) ? data : []
  } catch (err) {
    revisions.value = []
    error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
