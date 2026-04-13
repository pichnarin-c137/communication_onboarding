<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Onboarding</h1>
        <p class="text-sm text-gray-500 mt-0.5">Track client onboarding progress across your assignments</p>
      </div>
      <button @click="exportCSV"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        <ArrowDownTrayIcon class="w-4 h-4" />
        Export Excel
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-700">Filters</h2>
        <button v-if="hasActiveFilters" @click="resetFilters" class="text-xs text-primary hover:underline">Reset
          all</button>
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <select v-model="statusFilter" @change="load(1)"
          class="sm:w-44 px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div class="relative flex-1 min-w-0">
          <MagnifyingGlassIcon
            class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input v-model="searchQuery" @input="onSearchInput" @keyup.enter="load(1)" type="text"
            placeholder="Search by client or code"
            class="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          <button v-if="searchQuery" type="button" @click="clearSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <SkeletonLoader v-if="loading" type="table" :count="4" />

    <div v-else-if="onboardings.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-200">
      <ClipboardDocumentListIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-sm font-medium text-gray-500">No onboarding records found</p>
      <p class="text-xs text-gray-500 mt-1">Try adjusting your filters</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
              Client</th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
              System</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[140px]">
              Progress</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="ob in onboardings" :key="ob.id" class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="handleRowClick(ob)">
            <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ ob.request_code }}</td>
            <td class="px-4 py-3 hidden sm:table-cell font-medium text-gray-900">{{ ob.client?.company_name || '—' }}
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-gray-600">{{ ob.system?.name || '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[80px]">
                  <div class="bg-primary h-1.5 rounded-full" :style="{ width: `${ob.progress_percentage}%` }"></div>
                </div>
                <span class="text-xs font-semibold text-gray-700 w-9 text-right shrink-0">
                  {{ Math.round(ob.progress_percentage) }}%
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <StatusBadge :status="ob.status" />
            </td>
            <td class="px-4 py-3 text-right" @click.stop>
              <button @click="goToDetail(ob.id)" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open onboarding details">
                <ChevronRightIcon class="w-4 h-4 text-gray-400" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p class="text-xs text-gray-500">Showing {{ meta.from }}–{{ meta.to }} of {{ meta.total }}</p>
        <div class="flex gap-1">
          <button @click="load(meta.current_page - 1)" :disabled="meta.current_page === 1"
            class="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Prev</button>
          <button @click="load(meta.current_page + 1)" :disabled="meta.current_page === meta.last_page"
            class="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showStartModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeStartModal">
          <div class="bg-white rounded-xl shadow-md max-w-md w-full p-6 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Start Onboarding</h3>
            <p class="text-sm text-gray-600">
              Start onboarding for
              <span class="font-medium text-gray-900">{{ selectedOnboarding?.client?.company_name || 'this client'
              }}</span>
              now?
            </p>
            <div class="flex gap-3 justify-end">
              <button @click="closeStartModal" :disabled="starting"
                class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60">
                Cancel
              </button>
              <button @click="handleStart" :disabled="starting"
                class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-60">
                {{ starting ? 'Starting...' : 'Start Onboarding' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRightIcon, ClipboardDocumentListIcon, MagnifyingGlassIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { onboardingService } from '@/modules/shared/services/onboardingService.js'
import { downloadCSV } from '@/modules/shared/composables/useCSVExport.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import { useSettingsStore } from '@/modules/shared/store/settings'

const router = useRouter()
const settingsStore = useSettingsStore()
const toast = useToast()
const loading = ref(true)
const onboardings = ref([])
const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1, from: 0, to: 0 })
const statusFilter = ref('')
const searchQuery = ref('')
const showStartModal = ref(false)
const selectedOnboarding = ref(null)
const starting = ref(false)
let searchDebounceTimer = null

const hasActiveFilters = computed(() => !!statusFilter.value || !!searchQuery.value)

async function load(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: settingsStore.settings?.items_per_page || 15 }
    if (statusFilter.value) params.status = statusFilter.value
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
    const response = await onboardingService.getOnboardings(params)
    onboardings.value = response.data || []
    if (response.meta) meta.value = response.meta
  } catch {
    onboardings.value = []
  } finally {
    loading.value = false
  }
}

function goToDetail(id) {
  router.push(`/trainer/onboarding/${id}`)
}

function openStartModal(onboarding) {
  selectedOnboarding.value = onboarding
  showStartModal.value = true
}

function closeStartModal() {
  if (starting.value) return
  showStartModal.value = false
  selectedOnboarding.value = null
}

function handleRowClick(onboarding) {
  if (onboarding.status === 'pending') {
    openStartModal(onboarding)
    return
  }
  goToDetail(onboarding.id)
}

async function handleStart() {
  if (!selectedOnboarding.value?.id) return

  const onboardingId = selectedOnboarding.value.id
  starting.value = true
  try {
    await onboardingService.startOnboarding(onboardingId)
    toast.success('Onboarding started!')
    closeStartModal()
    await load(meta.value.current_page || 1)
    goToDetail(onboardingId)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to start onboarding.')
  } finally {
    starting.value = false
  }
}

function resetFilters() {
  statusFilter.value = ''
  searchQuery.value = ''
  load(1)
}

function onSearchInput() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => load(1), 300)
}

function clearSearch() {
  if (searchDebounceTimer) { clearTimeout(searchDebounceTimer); searchDebounceTimer = null }
  searchQuery.value = ''
  load(1)
}

// Export CSV
function exportCSV() {
  const headers = ['Code', 'Client', 'System', 'Progress (%)', 'Status']
  const rows = onboardings.value.map(ob => [
    ob.request_code || '',
    ob.client?.company_name || '',
    ob.system?.name || '',
    Math.round(ob.progress_percentage ?? 0),
    ob.status || ''
  ])
  downloadCSV([headers, ...rows], `onboardings_${new Date().toISOString().slice(0, 10)}.csv`)
}

onBeforeUnmount(() => { if (searchDebounceTimer) clearTimeout(searchDebounceTimer) })

onMounted(async () => {
  if (!settingsStore.settings) await settingsStore.fetchSettings()
  load()
})
</script>
