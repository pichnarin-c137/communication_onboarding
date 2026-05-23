<template>
  <div class="space-y-4">
    <!-- Filter pills -->
    <div class="flex gap-1.5 flex-wrap">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        @click="statusFilter = opt.value"
        :class="[
          'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
          statusFilter === opt.value
            ? 'bg-primary text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        ]"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading && onboardings.length === 0" class="bg-white border border-gray-200 rounded-xl p-5">
      <div v-for="i in 4" :key="i" class="py-3 border-b border-gray-100 last:border-b-0 animate-pulse space-y-1.5">
        <div class="h-3 bg-gray-200 rounded w-40" />
        <div class="h-2 bg-gray-100 rounded w-full" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!loading && onboardings.length === 0" class="bg-white border border-gray-200 rounded-xl p-10 text-center">
      <AcademicCapIcon class="w-9 h-9 text-gray-300 mx-auto mb-2" />
      <p class="text-sm text-gray-500">No onboardings {{ statusFilter ? `with this status` : '' }} yet.</p>
    </div>

    <!-- List -->
    <div v-else class="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
      <router-link
        v-for="ob in onboardings"
        :key="ob.id"
        :to="`/sales/onboarding/${ob.id}`"
        class="block px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center justify-between gap-3 mb-1.5">
          <p class="text-sm font-medium text-gray-900 truncate flex-1">
            {{ ob.client?.company_name || ob.request_code || 'Onboarding' }}
          </p>
          <span class="text-xs font-semibold text-gray-700 tabular-nums">
            {{ Math.round(ob.progress_percentage || 0) }}%
          </span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-1.5">
          <div
            class="bg-primary h-1.5 rounded-full transition-all"
            :style="{ width: `${ob.progress_percentage || 0}%` }"
          />
        </div>
        <div class="flex items-center justify-between mt-2 gap-2">
          <p class="text-xs text-gray-500 truncate">{{ ob.system?.name || '—' }}</p>
          <StatusBadge :status="ob.status" size="xs" />
        </div>
      </router-link>
    </div>

    <!-- Pagination -->
    <div v-if="meta.last_page > 1" class="flex items-center justify-between">
      <p class="text-xs text-gray-500">{{ meta.from }}–{{ meta.to }} of {{ meta.total }}</p>
      <div class="flex gap-1">
        <button
          v-for="p in meta.last_page"
          :key="p"
          @click="loadPage(p)"
          :class="[
            'w-7 h-7 text-xs rounded-md transition-colors',
            p === meta.current_page
              ? 'bg-primary text-white font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >{{ p }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { AcademicCapIcon } from '@heroicons/vue/24/outline'
import { onboardingService } from '@/modules/shared/services/onboardingService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { extractErrorMessage, getErrorCode } from '@core/services/error.handler'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'

const props = defineProps({
  trainerId: { type: String, required: true },
})

const toast = useToast()

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const onboardings = ref([])
const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1, from: 0, to: 0 })
const loading = ref(false)
const statusFilter = ref('')

async function loadPage(page = 1) {
  loading.value = true
  try {
    const params = { trainer_id: props.trainerId, page, per_page: 15 }
    if (statusFilter.value) params.status = statusFilter.value
    const res = await onboardingService.getOnboardings(params)
    onboardings.value = res.data || []
    if (res.meta) meta.value = res.meta
  } catch (err) {
    if (getErrorCode(err) === 'TRAINER_NOT_IN_SALE_ROSTER') {
      toast.error('You no longer have access to this trainer.')
      return
    }
    toast.error(extractErrorMessage(err))
    onboardings.value = []
  } finally {
    loading.value = false
  }
}

watch(statusFilter, () => loadPage(1))
watch(() => props.trainerId, () => loadPage(1))

onMounted(() => loadPage(1))
</script>
