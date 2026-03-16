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

      <!-- Info -->
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
        <div v-if="!onboarding.policies?.length" class="py-4 text-center text-sm text-gray-400">
          No policies defined
        </div>
        <div v-else class="space-y-2">
          <div v-for="p in onboarding.policies" :key="p.id" class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <CheckCircleIcon v-if="p.is_checked" class="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div v-else class="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
            <span :class="['text-sm', p.is_checked ? 'line-through text-gray-400' : 'text-gray-800']">
              {{ p.policy_name }}
            </span>
            <span v-if="p.is_default" class="ml-auto text-xs text-gray-400">default</span>
          </div>
        </div>
      </div>

      <!-- Lessons -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Lessons</h2>
        <div v-if="!onboarding.lessons?.length" class="py-4 text-center text-sm text-gray-400">
          No lessons added yet
        </div>
        <div v-else class="space-y-2">
          <div v-for="l in onboarding.lessons" :key="l.id" class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {{ l.path }}
              </span>
              <span class="text-sm text-gray-800">{{ l.lesson_video_url ? 'Video Lesson' : 'Document Lesson' }}</span>
            </div>
            <span v-if="l.is_sent" class="text-xs text-emerald-600 font-medium">Sent</span>
            <span v-else class="text-xs text-gray-400">Not sent</span>
          </div>
        </div>
      </div>

      <!-- Sale actions -->
      <div v-if="onboarding.status === 'in_progress'" class="flex gap-3">
        <button
          @click="showCancelModal = true"
          class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          Cancel Onboarding
        </button>
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
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import ConfirmModal from '@/modules/shared/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { formatDateMed: formatDate } = useDateTime()

const onboarding = ref(null)
const loading = ref(true)
const cancelling = ref(false)
const showCancelModal = ref(false)

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
    toast.success('Onboarding cancelled.')
    showCancelModal.value = false
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to cancel.')
  } finally {
    cancelling.value = false
  }
}

onMounted(load)
</script>
