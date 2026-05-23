<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="headerIconBg">
          <svg class="w-4 h-4" :class="headerIconColor" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Client Feedback</h3>
          <p class="text-xs text-gray-400">Post-onboarding satisfaction rating</p>
        </div>
      </div>
      <span
        v-if="!loading && feedback"
        class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
        :class="statusBadgeClass"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-5 space-y-3">
      <div class="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
      <div class="h-10 bg-gray-100 rounded-lg animate-pulse" />
      <div class="h-8 bg-gray-100 rounded-lg animate-pulse w-1/3" />
    </div>

    <!-- Not requested -->
    <div v-else-if="feedback?.status === 'not_requested'" class="p-5">
      <div class="flex flex-col items-center text-center py-3">
        <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-700">No feedback collected yet</p>
        <p class="text-xs text-gray-400 mt-0.5 mb-4">Send a link to the client so they can rate their experience</p>
        <div class="flex flex-col items-center gap-2 w-full max-w-xs">
          <AppButton variant="primary" size="sm" class="w-full" :loading="requesting" @click="handleRequest">
            Request Feedback
          </AppButton>
          <button class="text-xs text-primary hover:underline transition-colors" @click="showManualForm = !showManualForm">
            {{ showManualForm ? 'Cancel manual entry' : 'Enter manually instead' }}
          </button>
        </div>
      </div>

      <div v-if="showManualForm" class="mt-4 pt-4 border-t border-gray-100">
        <p class="text-xs font-semibold text-gray-700 mb-3">Manual Entry</p>
        <div class="flex justify-center mb-3">
          <StarRating v-model="manualRating" />
        </div>
        <textarea
          v-model="manualComment"
          rows="3"
          placeholder="Client comments (optional)..."
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-3"
        />
        <div class="flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="showManualForm = false">Cancel</AppButton>
          <AppButton
            variant="primary"
            size="sm"
            :disabled="!manualRating || submitting"
            :loading="submitting"
            @click="handleManualSubmit"
          >
            Save Feedback
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Sent / pending -->
    <div v-else-if="feedback?.status === 'sent'" class="p-5">
      <div class="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
        <svg class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-amber-800">Awaiting client response</p>
          <p v-if="feedback.sent_at" class="text-xs text-amber-600 mt-0.5">
            Sent {{ formatDateTimeFromISO(feedback.sent_at) }}
          </p>
        </div>
        <button
          class="text-xs font-medium text-amber-700 hover:text-amber-900 shrink-0 transition-colors"
          :class="{ 'opacity-50 pointer-events-none': requesting }"
          @click="handleRequest"
        >
          {{ requesting ? 'Sending…' : 'Resend' }}
        </button>
      </div>

      <button
        class="mt-3 text-xs text-primary hover:underline transition-colors"
        @click="showManualForm = !showManualForm"
      >
        {{ showManualForm ? 'Cancel manual entry' : 'Enter feedback manually' }}
      </button>

      <div v-if="showManualForm" class="mt-3 pt-3 border-t border-gray-100">
        <div class="flex justify-center mb-3">
          <StarRating v-model="manualRating" />
        </div>
        <textarea
          v-model="manualComment"
          rows="3"
          placeholder="Client comments (optional)..."
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-3"
        />
        <div class="flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="showManualForm = false">Cancel</AppButton>
          <AppButton
            variant="primary"
            size="sm"
            :disabled="!manualRating || submitting"
            :loading="submitting"
            @click="handleManualSubmit"
          >
            Save Feedback
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Submitted -->
    <div v-else-if="feedback?.status === 'submitted'" class="p-5">
      <div class="flex flex-col items-center text-center py-2">
        <StarRating :model-value="feedback.rating" :readonly="true" />
        <p class="text-2xl font-bold text-gray-900 mt-2">
          {{ feedback.rating }}<span class="text-base font-normal text-gray-400">/5</span>
        </p>
        <div v-if="feedback.comment" class="mt-3 px-4 py-3 bg-gray-50 rounded-lg text-left w-full max-w-sm">
          <p class="text-sm text-gray-600 italic">"{{ feedback.comment }}"</p>
        </div>
        <p v-if="feedback.submitted_at" class="text-xs text-gray-400 mt-3">
          Submitted {{ formatDateTimeFromISO(feedback.submitted_at) }}
        </p>
      </div>
    </div>

    <!-- Error fallback -->
    <div v-else-if="!loading" class="px-5 py-8 text-center">
      <p class="text-sm text-gray-400">Unable to load feedback status</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StarRating from './StarRating.vue'
import AppButton from './AppButton.vue'
import { onboardingService } from '@/modules/shared/services/onboardingService'
import { useDateTime } from '@/modules/shared/composables/useDateTime'
import { useToast } from '@/modules/shared/composables/useToast'
import { extractErrorMessage } from '@core/services/error.handler'

const props = defineProps({ onboardingId: { type: [String, Number], required: true } })
const { formatDateTimeFromISO } = useDateTime()
const { success, error } = useToast()

const feedback = ref(null)
const loading = ref(false)
const requesting = ref(false)
const submitting = ref(false)
const showManualForm = ref(false)
const manualRating = ref(0)
const manualComment = ref('')

const statusLabel = computed(() => {
  const map = { not_requested: 'Not Requested', sent: 'Pending', submitted: 'Received' }
  return map[feedback.value?.status] ?? '—'
})

const statusBadgeClass = computed(() => {
  const map = {
    not_requested: 'bg-gray-100 text-gray-600',
    sent: 'bg-amber-100 text-amber-700',
    submitted: 'bg-emerald-100 text-emerald-700',
  }
  return map[feedback.value?.status] ?? 'bg-gray-100 text-gray-600'
})

const headerIconBg = computed(() => {
  const map = { submitted: 'bg-amber-50', sent: 'bg-amber-50', not_requested: 'bg-gray-100' }
  return map[feedback.value?.status] ?? 'bg-gray-100'
})

const headerIconColor = computed(() => {
  const map = { submitted: 'text-amber-500', sent: 'text-amber-400', not_requested: 'text-gray-400' }
  return map[feedback.value?.status] ?? 'text-gray-400'
})

async function load() {
  loading.value = true
  try {
    feedback.value = await onboardingService.getFeedbackStatus(props.onboardingId)
  } catch {
    feedback.value = { status: 'not_requested' }
  } finally {
    loading.value = false
  }
}

async function handleRequest() {
  requesting.value = true
  try {
    await onboardingService.requestFeedbackEmail(props.onboardingId)
    success('Feedback request sent to client.')
    await load()
  } catch (err) {
    error(extractErrorMessage(err))
  } finally {
    requesting.value = false
  }
}

async function handleManualSubmit() {
  if (!manualRating.value) return
  submitting.value = true
  try {
    await onboardingService.submitManualFeedback(props.onboardingId, manualRating.value, manualComment.value || undefined)
    success('Feedback recorded successfully.')
    showManualForm.value = false
    manualRating.value = 0
    manualComment.value = ''
    await load()
  } catch (err) {
    error(extractErrorMessage(err))
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>
