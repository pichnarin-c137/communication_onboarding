<template>
  <div class="grid grid-cols-3 gap-3">

    <!-- Sessions -->
    <button
      class="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-left hover:border-blue-300 hover:bg-blue-50/40 transition-colors group"
      @click="emit('open', 'sessions')"
    >
      <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-gray-500 mb-0.5">Sessions</p>
        <div v-if="loading" class="h-3.5 w-16 bg-gray-100 rounded animate-pulse" />
        <p v-else class="text-sm font-semibold text-gray-900 truncate">
          {{ sessionsCount > 0 ? `${sessionsCount} linked` : 'None yet' }}
        </p>
      </div>
      <svg class="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Feedback -->
    <button
      class="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-left hover:border-amber-300 hover:bg-amber-50/40 transition-colors group"
      @click="emit('open', 'feedback')"
    >
      <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="feedbackIconBg">
        <svg class="w-4 h-4" :class="feedbackIconColor" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-gray-500 mb-0.5">Feedback</p>
        <div v-if="loading" class="h-3.5 w-20 bg-gray-100 rounded animate-pulse" />
        <div v-else class="flex items-center gap-1.5">
          <span
            v-if="feedbackStatus !== 'not_requested'"
            class="w-1.5 h-1.5 rounded-full shrink-0"
            :class="feedbackStatus === 'submitted' ? 'bg-emerald-400' : 'bg-amber-400'"
          />
          <p class="text-sm font-semibold text-gray-900 truncate">{{ feedbackLabel }}</p>
        </div>
      </div>
      <svg class="w-4 h-4 text-gray-300 group-hover:text-amber-400 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Revisions -->
    <button
      class="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-left hover:border-orange-300 hover:bg-orange-50/40 transition-colors group"
      @click="emit('open', 'revisions')"
    >
      <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="revisionsIconBg">
        <svg class="w-4 h-4" :class="revisionsIconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-gray-500 mb-0.5">Revisions</p>
        <div v-if="loading" class="h-3.5 w-16 bg-gray-100 rounded animate-pulse" />
        <div v-else class="flex items-center gap-1.5">
          <span
            v-if="pendingRevisions > 0"
            class="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"
          />
          <p class="text-sm font-semibold text-gray-900 truncate">
            {{ revisionsCount > 0 ? `${revisionsCount} request${revisionsCount > 1 ? 's' : ''}` : 'None yet' }}
          </p>
        </div>
      </div>
      <svg class="w-4 h-4 text-gray-300 group-hover:text-orange-400 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onboardingService } from '@/modules/shared/services/onboardingService'

const props = defineProps({
  onboardingId: { type: [String, Number], required: true },
})

const emit = defineEmits(['open'])

const loading = ref(true)
const sessionsCount = ref(0)
const feedbackStatus = ref('not_requested')
const feedbackRating = ref(null)
const revisionsCount = ref(0)
const pendingRevisions = ref(0)

const feedbackLabel = computed(() => {
  if (feedbackStatus.value === 'submitted') return feedbackRating.value ? `Rated ${feedbackRating.value}/5` : 'Received'
  if (feedbackStatus.value === 'sent') return 'Pending'
  return 'Not requested'
})

const feedbackIconBg = computed(() => {
  if (feedbackStatus.value === 'submitted') return 'bg-emerald-50'
  if (feedbackStatus.value === 'sent') return 'bg-amber-50'
  return 'bg-gray-100'
})

const feedbackIconColor = computed(() => {
  if (feedbackStatus.value === 'submitted') return 'text-emerald-500'
  if (feedbackStatus.value === 'sent') return 'text-amber-400'
  return 'text-gray-400'
})

const revisionsIconBg = computed(() =>
  pendingRevisions.value > 0 ? 'bg-orange-50' : 'bg-gray-100'
)

const revisionsIconColor = computed(() =>
  pendingRevisions.value > 0 ? 'text-orange-500' : 'text-gray-400'
)

onMounted(async () => {
  try {
    const [sessions, feedback, revisions] = await Promise.all([
      onboardingService.getLinkedSessions(props.onboardingId).catch(() => []),
      onboardingService.getFeedbackStatus(props.onboardingId).catch(() => ({ status: 'not_requested' })),
      onboardingService.getRevisionHistory(props.onboardingId).catch(() => []),
    ])

    sessionsCount.value = Array.isArray(sessions) ? sessions.length : 0
    feedbackStatus.value = feedback?.status ?? 'not_requested'
    feedbackRating.value = feedback?.rating ?? null

    const revList = Array.isArray(revisions) ? revisions : []
    revisionsCount.value = revList.length
    pendingRevisions.value = revList.filter(r => !r.acknowledged_at).length
  } finally {
    loading.value = false
  }
})
</script>
