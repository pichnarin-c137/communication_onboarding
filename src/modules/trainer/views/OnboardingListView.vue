<template>
  <div class="space-y-6 mt-3">
    <br>
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Onboarding</h1>
      <p class="text-sm text-gray-500 mt-0.5">Manage onboarding progress for your clients</p>
    </div>

    <!-- Filters -->
    <div class="flex gap-3">
      <select v-model="statusFilter" @change="load()" class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
        <option value="">All Statuses</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Table -->
    <SkeletonLoader v-if="loading" type="list" :count="4" />

    <div v-else-if="onboardings.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-200">
      <ClipboardDocumentListIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-sm font-medium text-gray-500">No onboarding records found</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50">
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3">Code</th>
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3">Client</th>
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3">System</th>
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3 min-w-[140px]">Progress</th>
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
            <th class="px-4 py-3 w-8"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="ob in onboardings"
            :key="ob.id"
            class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="router.push(`/trainer/onboarding/${ob.id}`)"
          >
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ ob.request_code }}</td>
            <td class="px-4 py-3 font-medium text-gray-900">{{ ob.client?.company_name || '—' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ ob.system?.name || '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[80px]">
                  <div class="bg-primary h-1.5 rounded-full" :style="{ width: `${ob.progress_percentage}%` }"></div>
                </div>
                <span class="text-xs font-semibold text-gray-700 w-9 text-right shrink-0">{{ Math.round(ob.progress_percentage) }}%</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <StatusBadge :status="ob.status" />
            </td>
            <td class="px-4 py-3 text-right">
              <ChevronRightIcon class="w-4 h-4 text-gray-400 inline-block" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="meta.last_page > 1" class="flex items-center justify-between">
      <p class="text-xs text-gray-500">{{ meta.from }}–{{ meta.to }} of {{ meta.total }}</p>
      <div class="flex gap-1">
        <button @click="load(meta.current_page - 1)" :disabled="meta.current_page === 1" class="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
        <button @click="load(meta.current_page + 1)" :disabled="meta.current_page === meta.last_page" class="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRightIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import { onboardingService } from '@/modules/shared/services/onboardingService.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const router = useRouter()
const loading = ref(true)
const onboardings = ref([])
const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1, from: 0, to: 0 })
const statusFilter = ref('')

async function load(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 15 }
    if (statusFilter.value) params.status = statusFilter.value
    const response = await onboardingService.getOnboardings(params)
    onboardings.value = response.data || []
    if (response.meta) meta.value = response.meta
  } catch {
    onboardings.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>
