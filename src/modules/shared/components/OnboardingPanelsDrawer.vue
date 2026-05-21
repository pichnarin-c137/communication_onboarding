<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/30" @click="emit('close')" />

        <div class="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full">
          <!-- Tab bar + close button -->
          <div class="flex items-center border-b border-gray-200 px-1 pr-3 shrink-0">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors"
              :class="activeTab === tab.key ? 'text-primary' : 'text-gray-500 hover:text-gray-700'"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
              <span
                v-if="activeTab === tab.key"
                class="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full"
              />
            </button>
            <div class="flex-1" />
            <button
              class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              @click="emit('close')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto p-5">

            <!-- Sessions -->
            <template v-if="activeTab === 'sessions'">
              <div v-if="sessionsLoading" class="space-y-3">
                <div v-for="i in 2" :key="i" class="h-20 animate-pulse rounded-lg bg-gray-100" />
              </div>

              <div v-else-if="sessions.length === 0" class="flex flex-col items-center justify-center py-10 text-center">
                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p class="text-sm font-medium text-gray-600">No linked sessions yet</p>
                <p class="text-xs text-gray-400 mt-0.5">Appointments linked to this onboarding will appear here</p>
              </div>

              <div v-else class="space-y-0 -mx-5">
                <div
                  v-for="session in sessions"
                  :key="session.id"
                  class="flex items-start gap-4 px-5 py-4 border-b border-gray-100 last:border-0 border-l-4"
                  :class="getSessionBorderClass(session.session_type)"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="getSessionTypeClass(session.session_type)">
                        {{ getSessionTypeLabel(session.session_type) }}
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {{ getAppointmentTypeLabel(session.appointment?.appointment_type) }}
                      </span>
                    </div>
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ session.appointment?.title || 'Untitled appointment' }}</p>
                    <div class="flex flex-wrap items-center gap-1 mt-1">
                      <span class="text-xs font-medium text-gray-700">{{ getTrainerName(session) }}</span>
                      <span class="text-xs text-gray-300">·</span>
                      <span class="text-xs text-gray-500">{{ formatDate(session.appointment?.scheduled_date) }}</span>
                    </div>
                  </div>
                  <div class="shrink-0 mt-0.5">
                    <StatusBadge :status="session.appointment?.status || 'unknown'" />
                  </div>
                </div>
              </div>
            </template>

            <!-- Feedback -->
            <template v-if="activeTab === 'feedback'">
              <div v-if="feedbackLoading" class="space-y-3">
                <div class="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                <div class="h-14 bg-gray-100 rounded-lg animate-pulse" />
              </div>

              <template v-else-if="feedback?.status === 'not_requested'">
                <div class="flex flex-col items-center text-center py-4">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-gray-700">No feedback collected yet</p>
                  <p class="text-xs text-gray-400 mt-0.5 mb-4">Send a link to the client to rate their experience</p>
                  <div class="flex flex-col items-center gap-2 w-full max-w-xs">
                    <AppButton variant="primary" size="sm" class="w-full" :loading="requesting" @click="handleRequestFeedback">Request Feedback</AppButton>
                    <button class="text-xs text-primary hover:underline" @click="showManualForm = !showManualForm">
                      {{ showManualForm ? 'Cancel' : 'Enter manually instead' }}
                    </button>
                  </div>
                </div>
                <div v-if="showManualForm" class="mt-3 pt-4 border-t border-gray-100">
                  <div class="flex justify-center mb-3"><StarRating v-model="manualRating" /></div>
                  <textarea v-model="manualComment" rows="3" placeholder="Client comments (optional)..." class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-3" />
                  <div class="flex justify-end gap-2">
                    <AppButton variant="secondary" size="sm" @click="showManualForm = false">Cancel</AppButton>
                    <AppButton variant="primary" size="sm" :disabled="!manualRating || submitting" :loading="submitting" @click="handleManualSubmit">Save Feedback</AppButton>
                  </div>
                </div>
              </template>

              <template v-else-if="feedback?.status === 'sent'">
                <div class="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                  <svg class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-amber-800">Awaiting client response</p>
                    <p v-if="feedback.sent_at" class="text-xs text-amber-600 mt-0.5">Sent {{ formatDateTimeFromISO(feedback.sent_at) }}</p>
                  </div>
                  <button class="text-xs font-medium text-amber-700 hover:text-amber-900 shrink-0" :class="{ 'opacity-50 pointer-events-none': requesting }" @click="handleRequestFeedback">
                    {{ requesting ? 'Sending…' : 'Resend' }}
                  </button>
                </div>
                <button class="mt-3 text-xs text-primary hover:underline" @click="showManualForm = !showManualForm">
                  {{ showManualForm ? 'Cancel manual entry' : 'Enter feedback manually' }}
                </button>
                <div v-if="showManualForm" class="mt-3 pt-3 border-t border-gray-100">
                  <div class="flex justify-center mb-3"><StarRating v-model="manualRating" /></div>
                  <textarea v-model="manualComment" rows="3" placeholder="Client comments (optional)..." class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-3" />
                  <div class="flex justify-end gap-2">
                    <AppButton variant="secondary" size="sm" @click="showManualForm = false">Cancel</AppButton>
                    <AppButton variant="primary" size="sm" :disabled="!manualRating || submitting" :loading="submitting" @click="handleManualSubmit">Save Feedback</AppButton>
                  </div>
                </div>
              </template>

              <template v-else-if="feedback?.status === 'submitted'">
                <div class="flex flex-col items-center text-center py-3">
                  <StarRating :model-value="feedback.rating" :readonly="true" />
                  <p class="text-3xl font-bold text-gray-900 mt-2 leading-none">
                    {{ feedback.rating }}<span class="text-base font-normal text-gray-400">/5</span>
                  </p>
                  <div v-if="feedback.comment" class="mt-4 px-4 py-3 bg-gray-50 rounded-lg text-left w-full">
                    <p class="text-sm text-gray-600 italic leading-relaxed">"{{ feedback.comment }}"</p>
                  </div>
                  <p v-if="feedback.submitted_at" class="text-xs text-gray-400 mt-3">Submitted {{ formatDateTimeFromISO(feedback.submitted_at) }}</p>
                </div>
              </template>
            </template>

            <!-- Revisions -->
            <template v-if="activeTab === 'revisions'">
              <div v-if="revisionsLoading" class="space-y-4">
                <div v-for="i in 2" :key="i" class="flex gap-3">
                  <div class="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1.5 shrink-0" />
                  <div class="flex-1 space-y-2 pb-4">
                    <div class="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                    <div class="h-4 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              <div v-else-if="revisions.length === 0" class="flex flex-col items-center justify-center py-10 text-center">
                <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mb-2.5">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm font-medium text-gray-600">No revisions requested</p>
                <p class="text-xs text-gray-400 mt-0.5">All clear — no corrections have been submitted</p>
              </div>

              <ol v-else class="relative ml-1.5">
                <li v-for="(rev, idx) in revisions" :key="rev.id" class="relative pl-6 pb-5 last:pb-0">
                  <span v-if="idx < revisions.length - 1" class="absolute left-[4px] top-3 bottom-0 w-px bg-gray-200" />
                  <span class="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white" :class="rev.acknowledged_at ? 'bg-emerald-400' : 'bg-amber-400'" />
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="text-xs text-gray-400">{{ formatDateTimeFromISO(rev.created_at || rev.requested_at) }}</span>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium" :class="rev.acknowledged_at ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                      {{ rev.acknowledged_at ? 'Acknowledged' : 'Pending' }}
                    </span>
                    <span v-if="rev.requested_by" class="text-xs text-gray-400">
                      by {{ rev.requested_by.first_name }} {{ rev.requested_by.last_name }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-800 leading-relaxed">{{ rev.note }}</p>
                  <p v-if="rev.acknowledged_at && rev.acknowledged_by" class="text-xs text-gray-400 mt-1">
                    Acknowledged by {{ rev.acknowledged_by.first_name }} {{ rev.acknowledged_by.last_name }} · {{ formatDateTimeFromISO(rev.acknowledged_at) }}
                  </p>
                </li>
              </ol>
            </template>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import StatusBadge from './StatusBadge.vue'
import StarRating from './StarRating.vue'
import AppButton from './AppButton.vue'
import { onboardingService } from '@/modules/shared/services/onboardingService'
import { useDateTime } from '@/modules/shared/composables/useDateTime'
import { useToast } from '@/modules/shared/composables/useToast'
import { extractErrorMessage } from '@core/services/error.handler'

const props = defineProps({
  open: { type: Boolean, default: false },
  onboardingId: { type: [String, Number], required: true },
  initialSection: { type: String, default: 'sessions' },
})
const emit = defineEmits(['close', 'feedback-updated'])

const { formatDate, formatTime, formatDateTimeFromISO } = useDateTime()
const { success, error } = useToast()

const activeTab = ref(props.initialSection)

const tabs = [
  { key: 'sessions', label: 'Sessions' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'revisions', label: 'Revisions' },
]

// Sessions
const sessions = ref([])
const sessionsLoading = ref(false)

// Feedback
const feedback = ref(null)
const feedbackLoading = ref(false)
const requesting = ref(false)
const submitting = ref(false)
const showManualForm = ref(false)
const manualRating = ref(0)
const manualComment = ref('')

// Revisions
const revisions = ref([])
const revisionsLoading = ref(false)

// Session helpers
const getSessionTypeLabel = (t) => ({ primary: 'Primary', supplemental: 'Supplemental', incoming: 'Incoming' })[t] ?? 'Unknown'
const getSessionTypeClass = (t) => ({ primary: 'bg-blue-100 text-blue-700', supplemental: 'bg-purple-100 text-purple-700', incoming: 'bg-amber-100 text-amber-700' })[t] ?? 'bg-gray-100 text-gray-700'
const getSessionBorderClass = (t) => ({ primary: 'border-l-blue-400', supplemental: 'border-l-purple-400', incoming: 'border-l-amber-400' })[t] ?? 'border-l-gray-300'
const getAppointmentTypeLabel = (t) => t ? String(t).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown'
const getTrainerName = (s) => {
  const t = s?.appointment?.trainer
  if (!t) return 'Unassigned'
  return [t.first_name, t.last_name].filter(Boolean).join(' ').trim() || 'Unassigned'
}

async function loadAll() {
  sessionsLoading.value = true
  feedbackLoading.value = true
  revisionsLoading.value = true

  const [s, f, r] = await Promise.all([
    onboardingService.getLinkedSessions(props.onboardingId).catch(() => []),
    onboardingService.getFeedbackStatus(props.onboardingId).catch(() => ({ status: 'not_requested' })),
    onboardingService.getRevisionHistory(props.onboardingId).catch(() => []),
  ])

  sessions.value = Array.isArray(s) ? s : []
  feedback.value = f
  revisions.value = Array.isArray(r) ? r : []

  sessionsLoading.value = false
  feedbackLoading.value = false
  revisionsLoading.value = false
}

async function handleRequestFeedback() {
  requesting.value = true
  try {
    await onboardingService.requestFeedbackEmail(props.onboardingId)
    success('Feedback request sent to client.')
    feedback.value = await onboardingService.getFeedbackStatus(props.onboardingId).catch(() => feedback.value)
    emit('feedback-updated', feedback.value)
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
    success('Feedback recorded.')
    showManualForm.value = false
    manualRating.value = 0
    manualComment.value = ''
    feedback.value = await onboardingService.getFeedbackStatus(props.onboardingId).catch(() => feedback.value)
    emit('feedback-updated', feedback.value)
  } catch (err) {
    error(extractErrorMessage(err))
  } finally {
    submitting.value = false
  }
}

watch(() => props.open, (val) => {
  if (val) {
    activeTab.value = props.initialSection
    loadAll()
  }
})

watch(() => props.initialSection, (val) => {
  activeTab.value = val
})
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; transform: translateX(100%); }
</style>
