<template>
  <div class="max-w-3xl mx-auto space-y-5 mt-3">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="router.back()" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-gray-900">{{ onboarding?.request_code || 'Onboarding' }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ onboarding?.client?.company_name }}</p>
      </div>
      <StatusBadge v-if="onboarding" :status="onboarding.status" />
    </div>

    <SkeletonLoader v-if="loading" type="cards" :count="2" />

    <template v-else-if="onboarding">
      <!-- Banners -->
      <div
        v-if="onboarding?.status === 'on_hold'"
        class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        <svg class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <div><span class="font-semibold">On Hold:</span> {{ onboarding.hold_reason }}</div>
      </div>
      <div
        v-if="onboarding?.status === 'revision_requested'"
        class="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800"
      >
        <svg class="mt-0.5 h-4 w-4 shrink-0 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <div><span class="font-semibold">Revision Requested:</span> {{ onboarding.revision_note }}</div>
      </div>
      <div
        v-if="onboarding?.cycle > 1"
        class="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
      >
        <svg class="h-4 w-4 shrink-0 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
        </svg>
        <span>This is <strong>Cycle {{ onboarding.cycle }}</strong> for {{ onboarding.client_name }}.</span>
        <button class="ml-auto text-blue-600 hover:text-blue-800 font-medium text-xs" @click="showCycleDrawer = true">
          View previous cycles →
        </button>
      </div>

      <!-- Info strip — visible above the fold -->
      <OnboardingInfoStrip
        :onboarding-id="onboarding.id"
        @open="openPanelDrawer"
      />

      <!-- Progress bar -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-semibold text-gray-900">Overall Progress</h2>
          <span class="text-sm font-bold text-primary">{{ Math.round(onboarding.progress_percentage) }}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-3">
          <div class="bg-primary h-3 rounded-full transition-all" :style="{ width: `${onboarding.progress_percentage}%` }"></div>
        </div>
        <p class="text-xs text-gray-400 mt-2">Minimum 90% required to complete onboarding</p>
      </div>

      <!-- Details -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-4">Details</h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-xs text-gray-500">System</dt>
            <dd class="font-medium text-gray-900">{{ onboarding.system?.name }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">Trainer</dt>
            <dd class="font-medium text-gray-900">
              {{ onboarding.trainer ? `${onboarding.trainer.first_name} ${onboarding.trainer.last_name}` : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">Started</dt>
            <dd class="font-medium text-gray-900">{{ formatDate(onboarding.created_at) }}</dd>
          </div>
          <div v-if="onboarding.completed_at">
            <dt class="text-xs text-gray-500">Completed</dt>
            <dd class="font-medium text-gray-900">{{ formatDate(onboarding.completed_at) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Policies -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Policies</h2>
        <div v-if="!onboarding.policies?.length" class="py-4 text-center text-sm text-gray-400">No policies defined</div>
        <div v-else class="space-y-2">
          <div v-for="p in onboarding.policies" :key="p.id" class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <CheckCircleIcon v-if="p.is_checked" class="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div v-else class="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
            <span :class="['text-sm', p.is_checked ? 'line-through text-gray-400' : 'text-gray-800']">{{ p.policy_name }}</span>
            <span v-if="p.is_default" class="ml-auto text-xs text-gray-400">default</span>
          </div>
        </div>
      </div>

      <!-- Lessons -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Lessons</h2>
        <div v-if="!onboarding.lessons?.length" class="py-4 text-center text-sm text-gray-400">No lessons added yet</div>
        <div v-else class="space-y-2">
          <div v-for="l in onboarding.lessons" :key="l.id" class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{{ l.path }}</span>
              <span class="text-sm text-gray-800">{{ l.lesson_video_url ? 'Video Lesson' : 'Document Lesson' }}</span>
            </div>
            <span v-if="l.is_sent" class="text-xs text-emerald-600 font-medium">Sent</span>
            <span v-else class="text-xs text-gray-400">Not sent</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-if="onboarding.status === 'in_progress'"
          @click="showCancelModal = true"
          class="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          Cancel Onboarding
        </button>
        <AppButton v-if="onboarding?.status === 'cancelled'" variant="primary" size="sm" @click="showReopenModal = true">Reopen Onboarding</AppButton>
        <AppButton v-if="onboarding?.status === 'in_progress'" variant="secondary" size="sm" @click="showRevisionModal = true">Request Revision</AppButton>
        <AppButton v-if="onboarding && !['completed', 'cancelled'].includes(onboarding.status)" variant="ghost" size="sm" @click="openReassignModal">Reassign Trainer</AppButton>
        <button class="text-xs text-primary hover:underline" @click="showTrainerHistory = true">Trainer History</button>
      </div>
    </template>

    <div v-else-if="!loading" class="text-center py-12">
      <p class="text-sm text-gray-500">Onboarding not found.</p>
    </div>

    <!-- Cancel Modal -->
    <ConfirmModal
      :open="showCancelModal"
      title="Cancel Onboarding"
      message="Are you sure you want to cancel this onboarding? This cannot be undone."
      confirm-text="Cancel Onboarding"
      type="danger"
      @confirm="handleCancel"
      @cancel="showCancelModal = false"
    />

    <!-- Reopen Modal -->
    <ConfirmModal
      :open="showReopenModal"
      title="Reopen Onboarding"
      message="This will restore the onboarding to in_progress. All existing data will be kept. Continue?"
      confirm-text="Reopen"
      type="warning"
      @confirm="handleReopen"
      @cancel="showReopenModal = false"
    />

    <!-- Revision Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showRevisionModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div class="absolute inset-0 bg-black/40" @click="showRevisionModal = false" />
          <div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h2 class="font-semibold text-gray-900 mb-1">Request Revision</h2>
            <p class="text-sm text-gray-500 mb-4">Describe what needs to be corrected. The trainer will see this note.</p>
            <textarea
              v-model="revisionNote"
              rows="4"
              placeholder="Describe what needs to be revised..."
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-4"
            />
            <div class="flex justify-end gap-2">
              <AppButton variant="secondary" size="sm" @click="showRevisionModal = false">Cancel</AppButton>
              <AppButton
                variant="primary"
                size="sm"
                :disabled="!revisionNote.trim() || revisionSubmitting"
                :loading="revisionSubmitting"
                @click="handleRequestRevision"
              >
                Send Request
              </AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reassign Trainer Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showReassignModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div class="absolute inset-0 bg-black/40" @click="showReassignModal = false" />
          <div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h2 class="font-semibold text-gray-900 mb-1">Reassign Trainer</h2>
            <p class="text-sm text-gray-500 mb-4">Select a new trainer to take over this onboarding.</p>

            <label class="block text-sm font-medium text-gray-700 mb-1.5">Trainer</label>
            <select
              v-model="selectedTrainerId"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4"
            >
              <option :value="null" disabled>Select a trainer...</option>
              <option v-for="t in availableTrainers" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>

            <label class="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
            <textarea
              v-model="reassignNotes"
              rows="3"
              placeholder="Handover notes..."
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-4"
            />

            <div class="flex justify-end gap-2">
              <AppButton variant="secondary" size="sm" @click="showReassignModal = false">Cancel</AppButton>
              <AppButton
                variant="primary"
                size="sm"
                :disabled="!selectedTrainerId || reassignSubmitting"
                :loading="reassignSubmitting"
                @click="handleReassign"
              >
                Reassign
              </AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Drawers -->
    <CycleHistoryDrawer
      :open="showCycleDrawer"
      :onboarding-id="onboarding?.id"
      role="sale"
      @close="showCycleDrawer = false"
    />

    <TrainerHistoryDrawer
      :open="showTrainerHistory"
      :onboarding-id="onboarding?.id"
      @close="showTrainerHistory = false"
    />

    <!-- Sessions / Feedback / Revisions drawer -->
    <OnboardingPanelsDrawer
      v-if="onboarding"
      :open="showPanelDrawer"
      :onboarding-id="onboarding.id"
      :initial-section="panelSection"
      @close="showPanelDrawer = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import { onboardingService } from '@/modules/shared/services/onboardingService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import { extractErrorMessage } from '@core/services/error.handler'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import ConfirmModal from '@/modules/shared/components/ConfirmModal.vue'
import AppButton from '@/modules/shared/components/AppButton.vue'
import OnboardingInfoStrip from '@/modules/shared/components/OnboardingInfoStrip.vue'
import OnboardingPanelsDrawer from '@/modules/shared/components/OnboardingPanelsDrawer.vue'
import CycleHistoryDrawer from '@/modules/shared/components/CycleHistoryDrawer.vue'
import TrainerHistoryDrawer from '@/modules/shared/components/TrainerHistoryDrawer.vue'

const route = useRoute()
const router = useRouter()
const { success, error } = useToast()
const { formatDateMed: formatDate } = useDateTime()

const onboarding = ref(null)
const loading = ref(true)
const cancelling = ref(false)
const showCancelModal = ref(false)

const showReopenModal = ref(false)

const showRevisionModal = ref(false)
const revisionNote = ref('')
const revisionSubmitting = ref(false)

const showReassignModal = ref(false)
const availableTrainers = ref([])
const selectedTrainerId = ref(null)
const reassignNotes = ref('')
const reassignSubmitting = ref(false)
const showTrainerHistory = ref(false)

const showCycleDrawer = ref(false)
const showPanelDrawer = ref(false)
const panelSection = ref('sessions')

function openPanelDrawer(section) {
  panelSection.value = section
  showPanelDrawer.value = true
}

async function load() {
  loading.value = true
  try {
    const response = await onboardingService.getOnboarding(route.params.id)
    onboarding.value = response.data
  } catch {
    onboarding.value = null
  } finally {
    loading.value = false
  }
}

async function handleCancel() {
  cancelling.value = true
  try {
    await onboardingService.cancelOnboarding(onboarding.value.id)
    success('Onboarding cancelled.')
    showCancelModal.value = false
    await load()
  } catch (err) {
    error(extractErrorMessage(err))
  } finally {
    cancelling.value = false
  }
}

async function handleReopen() {
  try {
    await onboardingService.reopenOnboarding(onboarding.value.id)
    showReopenModal.value = false
    await load()
    success('Onboarding reopened successfully.')
  } catch (err) {
    error(extractErrorMessage(err))
  }
}

async function handleRequestRevision() {
  if (!revisionNote.value.trim()) return
  revisionSubmitting.value = true
  try {
    await onboardingService.requestRevision(onboarding.value.id, revisionNote.value.trim())
    showRevisionModal.value = false
    revisionNote.value = ''
    await load()
    success('Revision requested. The trainer has been notified.')
  } catch (err) {
    error(extractErrorMessage(err))
  } finally {
    revisionSubmitting.value = false
  }
}

async function openReassignModal() {
  showReassignModal.value = true
  if (availableTrainers.value.length) return
  try {
    availableTrainers.value = await onboardingService.getAvailableTrainers()
  } catch (err) {
    error(extractErrorMessage(err))
  }
}

async function handleReassign() {
  if (!selectedTrainerId.value) return
  reassignSubmitting.value = true
  try {
    await onboardingService.reassignTrainer(onboarding.value.id, selectedTrainerId.value, reassignNotes.value || undefined)
    showReassignModal.value = false
    selectedTrainerId.value = null
    reassignNotes.value = ''
    await load()
    success('Trainer reassigned. Both trainers have been notified.')
  } catch (err) {
    error(extractErrorMessage(err))
  } finally {
    reassignSubmitting.value = false
  }
}

onMounted(load)
</script>
