<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo / brand -->
      <div class="text-center mb-8">
        <h1 class="text-xl font-bold text-gray-900">CheckinMe</h1>
        <p class="text-sm text-gray-500 mt-1">Onboarding Feedback</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <!-- Loading -->
        <div v-if="state === 'loading'" class="space-y-4">
          <div class="h-6 bg-gray-100 rounded animate-pulse w-3/4 mx-auto" />
          <div class="h-4 bg-gray-100 rounded animate-pulse w-1/2 mx-auto" />
          <div class="h-10 bg-gray-100 rounded-lg animate-pulse mt-6" />
        </div>

        <!-- Valid: show form -->
        <div v-else-if="state === 'valid'">
          <h2 class="text-lg font-semibold text-gray-900 text-center">Rate Your Experience</h2>
          <p class="text-sm text-gray-500 text-center mt-1 mb-6">
            How was your onboarding experience with <span class="font-medium text-gray-700">{{ clientName }}</span>?
          </p>

          <div class="flex justify-center mb-6">
            <StarRating v-model="rating" />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Comments (optional)</label>
            <textarea
              v-model="comment"
              rows="4"
              placeholder="Tell us what went well or what could be improved..."
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <button
            :disabled="!rating || submitting"
            class="w-full py-2.5 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            @click="submit"
          >
            <svg v-if="submitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ submitting ? 'Submitting...' : 'Submit Feedback' }}
          </button>
        </div>

        <!-- Expired -->
        <div v-else-if="state === 'expired'" class="text-center py-4">
          <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="font-semibold text-gray-900">Link Expired</h2>
          <p class="text-sm text-gray-500 mt-2">This link has expired. Please ask your trainer for a new one.</p>
        </div>

        <!-- Already used -->
        <div v-else-if="state === 'used'" class="text-center py-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="font-semibold text-gray-900">Already Submitted</h2>
          <p class="text-sm text-gray-500 mt-2">You have already submitted your feedback. Thank you!</p>
        </div>

        <!-- Submitted -->
        <div v-else-if="state === 'submitted'" class="text-center py-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="font-semibold text-gray-900">Thank You!</h2>
          <p class="text-sm text-gray-500 mt-2">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StarRating from '@/modules/shared/components/StarRating.vue'
import { feedbackService } from '@/modules/shared/services/onboardingService'

const route = useRoute()
const state = ref('loading')
const clientName = ref('')
const rating = ref(0)
const comment = ref('')
const submitting = ref(false)

onMounted(async () => {
  try {
    const data = await feedbackService.getFeedbackForm(route.params.token)
    clientName.value = data.client_name ?? ''
    state.value = 'valid'
  } catch (err) {
    const status = err.response?.status
    const code = err.response?.data?.code
    if (code === 'token_expired' || status === 410) {
      state.value = 'expired'
    } else if (code === 'already_submitted' || status === 409) {
      state.value = 'used'
    } else {
      state.value = 'expired'
    }
  }
})

async function submit() {
  if (!rating.value || submitting.value) return
  submitting.value = true
  try {
    await feedbackService.submitClientFeedback(route.params.token, {
      rating: rating.value,
      comment: comment.value || undefined
    })
    state.value = 'submitted'
  } catch {
    state.value = 'expired'
  } finally {
    submitting.value = false
  }
}
</script>
