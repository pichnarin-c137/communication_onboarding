<template>
  <br>
  <div class="max-w-3xl mx-auto space-y-5 mt-3">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="router.back()" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-gray-900">{{ ob?.request_code || 'Onboarding' }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ ob?.client?.company_name }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button v-if="ob?.status === 'in_progress'" @click="refreshProgress" :disabled="refreshing" class="text-xs text-primary hover:underline disabled:opacity-40">
          {{ refreshing ? 'Refreshing...' : 'Refresh Progress' }}
        </button>
        <StatusBadge v-if="ob" :status="ob.status" />
      </div>
    </div>

    <SkeletonLoader v-if="loading" type="cards" :count="2" />

    <template v-else-if="ob">
      <!-- Progress -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-semibold text-gray-900">Overall Progress</h2>
          <span class="text-sm font-bold text-primary">{{ Math.round(ob.progress_percentage) }}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-3">
          <div class="bg-primary h-3 rounded-full transition-all" :style="{ width: `${ob.progress_percentage}%` }"></div>
        </div>
        <p class="text-xs text-gray-400 mt-2">At least 90% required to mark complete</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button v-for="t in tabs" :key="t.key" @click="activeTab = t.key"
          :class="['flex-1 py-2 text-xs font-medium rounded-lg transition-colors', activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']">
          {{ t.label }}
        </button>
      </div>

      <!-- Company Info Tab -->
      <div v-if="activeTab === 'company'">
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-900">Company Info</h2>
          <textarea
            v-model="companyForm.content"
            rows="4"
            placeholder="Enter company information..."
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          ></textarea>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="companyForm.is_completed" type="checkbox" class="rounded" />
            <span class="text-sm text-gray-700">Mark as completed</span>
          </label>
          <div v-if="companyError" class="text-sm text-red-600">{{ companyError }}</div>
          <button @click="saveCompanyInfo" :disabled="savingCompany" class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60">
            {{ savingCompany ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- System Analysis Tab -->
      <div v-if="activeTab === 'analysis'">
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-900">System Analysis</h2>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Imported Employee Count</label>
            <input v-model.number="analysisForm.import_employee_count" type="number" min="0" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Connected Apps</label>
            <input v-model.number="analysisForm.connected_app_count" type="number" min="0" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Mobile Profiles</label>
            <input v-model.number="analysisForm.profile_mobile_count" type="number" min="0" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div v-if="analysisError" class="text-sm text-red-600">{{ analysisError }}</div>
          <button @click="saveAnalysis" :disabled="savingAnalysis" class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60">
            {{ savingAnalysis ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- Policies Tab -->
      <div v-if="activeTab === 'policies'">
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900">Policies</h2>
            <button @click="showAddPolicy = !showAddPolicy" class="text-xs text-primary hover:underline">+ Add policy</button>
          </div>

          <!-- Add Policy Form -->
          <div v-if="showAddPolicy" class="flex gap-2">
            <input v-model="newPolicyName" placeholder="Policy name..." class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <button @click="addPolicy" :disabled="addingPolicy" class="px-3 py-2 text-sm text-white bg-primary rounded-lg disabled:opacity-60">
              {{ addingPolicy ? '...' : 'Add' }}
            </button>
          </div>

          <!-- Policy List -->
          <div v-if="!ob.policies?.length" class="py-4 text-center text-sm text-gray-400">No policies</div>
          <div v-else class="space-y-2">
            <div v-for="p in ob.policies" :key="p.id" class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <button v-if="!p.is_checked" @click="checkPolicy(p.id)" class="w-4 h-4 rounded-full border-2 border-gray-300 hover:border-primary flex-shrink-0 transition-colors"></button>
              <CheckCircleIcon v-else class="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span :class="['flex-1 text-sm', p.is_checked ? 'line-through text-gray-400' : 'text-gray-800']">{{ p.policy_name }}</span>
              <span v-if="p.is_default" class="text-xs text-gray-400">default</span>
              <button v-if="!p.is_default && !p.is_checked" @click="promptRemovePolicy(p.id)" class="text-xs text-red-400 hover:text-red-600">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lessons Tab -->
      <div v-if="activeTab === 'lessons'">
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900">Lessons</h2>
            <button @click="showAddLesson = !showAddLesson" class="text-xs text-primary hover:underline">+ Add lesson</button>
          </div>

          <!-- Add Lesson Form -->
          <div v-if="showAddLesson" class="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Path *</label>
              <select v-model="newLesson.path" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="1">Path 1</option>
                <option value="2">Path 2</option>
                <option value="3">Path 3</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Video URL</label>
              <input v-model="newLesson.lesson_video_url" placeholder="https://..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div v-if="addLessonError" class="text-sm text-red-600">{{ addLessonError }}</div>
            <button @click="addLesson" :disabled="addingLesson" class="px-3 py-2 text-sm text-white bg-primary rounded-lg disabled:opacity-60">
              {{ addingLesson ? 'Adding...' : 'Add Lesson' }}
            </button>
          </div>

          <!-- Lesson List -->
          <div v-if="!ob.lessons?.length" class="py-4 text-center text-sm text-gray-400">No lessons yet</div>
          <div v-else class="space-y-2">
            <div v-for="l in ob.lessons" :key="l.id" class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{{ l.path }}</span>
                <span class="text-sm text-gray-800">{{ l.lesson_video_url ? 'Video' : 'Document' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="l.is_sent" class="text-xs text-emerald-600 font-medium">Sent</span>
                <template v-else>
                  <button @click="promptSendLesson(l.id)" class="text-xs text-primary hover:underline">Send</button>
                  <button @click="promptDeleteLesson(l.id)" class="text-xs text-red-400 hover:text-red-600">Delete</button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trainer Complete/Cancel Actions -->
      <div v-if="ob.status === 'in_progress'" class="flex gap-3">
        <button
          @click="showCompleteModal = true"
          :disabled="ob.progress_percentage < 90"
          :title="ob.progress_percentage < 90 ? 'Progress must be at least 90% to complete' : ''"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          Mark Complete
        </button>
      </div>
    </template>

    <div v-else-if="!loading" class="text-center py-12">
      <p class="text-sm text-gray-500">Onboarding not found.</p>
    </div>

    <!-- Complete Confirm Modal -->
    <ConfirmModal
      :open="showCompleteModal"
      title="Mark Onboarding Complete"
      message="Are you sure this onboarding is ready to be marked as completed?"
      confirm-text="Mark Complete"
      type="warning"
      @confirm="handleComplete"
      @cancel="showCompleteModal = false"
    />

    <!-- Remove Policy Confirm Modal -->
    <ConfirmModal
      :open="showRemovePolicyModal"
      title="Remove Policy"
      message="Are you sure you want to remove this policy?"
      confirm-text="Remove"
      type="danger"
      @confirm="confirmRemovePolicy"
      @cancel="showRemovePolicyModal = false"
    />

    <!-- Send Lesson Confirm Modal -->
    <ConfirmModal
      :open="showSendLessonModal"
      title="Send Lesson"
      message="Send this lesson to the client via Telegram? The lesson will be locked after sending."
      confirm-text="Send"
      type="warning"
      @confirm="confirmSendLesson"
      @cancel="showSendLessonModal = false"
    />

    <!-- Delete Lesson Confirm Modal -->
    <ConfirmModal
      :open="showDeleteLessonModal"
      title="Delete Lesson"
      message="Are you sure you want to delete this lesson? This cannot be undone."
      confirm-text="Delete"
      type="danger"
      @confirm="confirmDeleteLesson"
      @cancel="showDeleteLessonModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import { onboardingService } from '@/modules/shared/services/onboardingService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import ConfirmModal from '@/modules/shared/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const ob = ref(null)
const loading = ref(true)
const refreshing = ref(false)
const completing = ref(false)

// Modal states
const showCompleteModal = ref(false)
const showRemovePolicyModal = ref(false)
const removePolicyId = ref(null)
const showSendLessonModal = ref(false)
const sendLessonId = ref(null)
const showDeleteLessonModal = ref(false)
const deleteLessonId = ref(null)

const tabs = [
  { key: 'company',  label: 'Company Info' },
  { key: 'analysis', label: 'System Analysis' },
  { key: 'policies', label: 'Policies' },
  { key: 'lessons',  label: 'Lessons' }
]
const activeTab = ref('company')

// Company Info
const companyForm = reactive({ content: '', is_completed: false })
const savingCompany = ref(false)
const companyError = ref(null)

// System Analysis
const analysisForm = reactive({ import_employee_count: 0, connected_app_count: 0, profile_mobile_count: 0 })
const savingAnalysis = ref(false)
const analysisError = ref(null)

// Policies
const showAddPolicy = ref(false)
const newPolicyName = ref('')
const addingPolicy = ref(false)

// Lessons
const showAddLesson = ref(false)
const newLesson = reactive({ path: 1, lesson_video_url: '' })
const addingLesson = ref(false)
const addLessonError = ref(null)

async function load() {
  loading.value = true
  try {
    const response = await onboardingService.getOnboarding(route.params.id)
    ob.value = response.data
    if (ob.value?.companyInfo) {
      companyForm.content = ob.value.companyInfo.content || ''
      companyForm.is_completed = ob.value.companyInfo.is_completed || false
    }
    if (ob.value?.systemAnalysis) {
      analysisForm.import_employee_count = ob.value.systemAnalysis.import_employee_count || 0
      analysisForm.connected_app_count = ob.value.systemAnalysis.connected_app_count || 0
      analysisForm.profile_mobile_count = ob.value.systemAnalysis.profile_mobile_count || 0
    }
  } catch {
    ob.value = null
  } finally {
    loading.value = false
  }
}

async function refreshProgress() {
  refreshing.value = true
  try {
    const response = await onboardingService.refreshProgress(ob.value.id)
    ob.value.progress_percentage = response.data?.progress_percentage ?? ob.value.progress_percentage
    toast.success('Progress refreshed.')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to refresh.')
  } finally {
    refreshing.value = false
  }
}

async function saveCompanyInfo() {
  savingCompany.value = true
  companyError.value = null
  try {
    await onboardingService.updateCompanyInfo(ob.value.id, companyForm)
    toast.success('Company info saved.')
  } catch (err) {
    companyError.value = err.response?.data?.message || 'Failed to save.'
  } finally {
    savingCompany.value = false
  }
}

async function saveAnalysis() {
  savingAnalysis.value = true
  analysisError.value = null
  try {
    await onboardingService.updateSystemAnalysis(ob.value.id, analysisForm)
    toast.success('System analysis saved.')
  } catch (err) {
    analysisError.value = err.response?.data?.message || 'Failed to save.'
  } finally {
    savingAnalysis.value = false
  }
}

async function addPolicy() {
  if (!newPolicyName.value.trim()) return
  addingPolicy.value = true
  try {
    await onboardingService.addPolicy(ob.value.id, newPolicyName.value.trim())
    newPolicyName.value = ''
    showAddPolicy.value = false
    toast.success('Policy added.')
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed.')
  } finally {
    addingPolicy.value = false
  }
}

async function checkPolicy(policyId) {
  try {
    await onboardingService.checkPolicy(ob.value.id, policyId)
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed.')
  }
}

function promptRemovePolicy(policyId) {
  removePolicyId.value = policyId
  showRemovePolicyModal.value = true
}

async function confirmRemovePolicy() {
  try {
    await onboardingService.removePolicy(ob.value.id, removePolicyId.value)
    showRemovePolicyModal.value = false
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed.')
  }
}

async function addLesson() {
  addLessonError.value = null
  if (!newLesson.lesson_video_url) { addLessonError.value = 'Video URL is required.'; return }
  addingLesson.value = true
  try {
    await onboardingService.addLesson(ob.value.id, {
      path: newLesson.path,
      lesson_video_url: newLesson.lesson_video_url
    })
    newLesson.path = 1
    newLesson.lesson_video_url = ''
    showAddLesson.value = false
    toast.success('Lesson added.')
    await load()
  } catch (err) {
    addLessonError.value = err.response?.data?.message || 'Failed.'
  } finally {
    addingLesson.value = false
  }
}

function promptSendLesson(lessonId) {
  sendLessonId.value = lessonId
  showSendLessonModal.value = true
}

async function confirmSendLesson() {
  try {
    await onboardingService.sendLesson(ob.value.id, sendLessonId.value)
    toast.success('Lesson sent!')
    showSendLessonModal.value = false
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to send.')
  }
}

function promptDeleteLesson(lessonId) {
  deleteLessonId.value = lessonId
  showDeleteLessonModal.value = true
}

async function confirmDeleteLesson() {
  try {
    await onboardingService.deleteLesson(ob.value.id, deleteLessonId.value)
    showDeleteLessonModal.value = false
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed.')
  }
}

async function handleComplete() {
  completing.value = true
  try {
    await onboardingService.completeOnboarding(ob.value.id)
    toast.success('Onboarding completed!')
    showCompleteModal.value = false
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to complete.')
  } finally {
    completing.value = false
  }
}

onMounted(load)
</script>
