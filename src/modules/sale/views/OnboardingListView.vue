<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Onboarding</h1>
        <p class="text-sm text-gray-500 mt-0.5">Track onboarding progress for completed training appointments</p>
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
        <button v-if="hasActiveFilters" @click="resetFilters"
          class="text-xs text-primary hover:underline">Reset all</button>
      </div>
      <!-- Row 1: Status + Search -->
      <div class="flex flex-col sm:flex-row gap-3">
        <select v-model="statusFilter" @change="load(1)"
          class="sm:w-44 px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Statuses</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="revision_requested">Revision Requested</option>
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
      <!-- Row 2: Date range -->
      <div class="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 bg-white w-full sm:w-80">
        <CalendarDaysIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input v-model="dateFrom" @change="load(1)" type="date"
          class="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 min-w-0" />
        <span class="text-gray-300 px-1 flex-shrink-0">–</span>
        <input v-model="dateTo" @change="load(1)" type="date"
          class="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 min-w-0" />
      </div>
    </div>

    <!-- List -->
    <SkeletonLoader v-if="loading" type="table" :count="5" />

    <div v-else-if="onboardings.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-200">
      <ClipboardDocumentListIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-sm font-medium text-gray-500">No onboarding records found</p>
      <p class="text-xs text-gray-500 mt-1">Onboardings are auto-created when a training appointment is completed</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Client</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">System</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="ob in onboardings" :key="ob.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="router.push(`/sales/onboarding/${ob.id}`)">
            <td class="px-4 py-3">
              <p class="font-mono text-xs font-medium text-gray-900">
                {{ ob.request_code }}
                <span
                  v-if="ob.cycle > 1"
                  class="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                >
                  Cycle {{ ob.cycle }}
                </span>
              </p>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell text-gray-600">{{ ob.client?.company_name || '—' }}</td>
            <td class="px-4 py-3 hidden md:table-cell text-gray-600">{{ ob.system?.name || '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-24 bg-gray-100 rounded-full h-1.5 hidden sm:block">
                  <div class="bg-primary h-1.5 rounded-full" :style="{ width: `${ob.progress_percentage}%` }"></div>
                </div>
                <span class="text-xs font-semibold text-gray-700">{{ Math.round(ob.progress_percentage) }}%</span>
              </div>
            </td>
            <td class="px-4 py-3"><StatusBadge :status="ob.status" /></td>
            <td class="px-4 py-3 text-right">
              <ChevronRightIcon class="w-4 h-4 text-gray-400" />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p class="text-xs text-gray-500">Showing {{ meta.from }}–{{ meta.to }} of {{ meta.total }}</p>
        <div class="flex gap-1">
          <button @click="goToPage(meta.current_page - 1)" :disabled="meta.current_page === 1"
            class="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Prev</button>
          <button @click="goToPage(meta.current_page + 1)" :disabled="meta.current_page === meta.last_page"
            class="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRightIcon, ClipboardDocumentListIcon, MagnifyingGlassIcon, XMarkIcon, ArrowDownTrayIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'
import { onboardingService } from '@/modules/shared/services/onboardingService.js'
import { downloadCSV } from '@/modules/shared/composables/useCSVExport.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import { useSettingsStore } from '@/modules/shared/store/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

const loading = ref(true)
const onboardings = ref([])
const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1, from: 0, to: 0 })
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const searchQuery = ref('')
let searchDebounceTimer = null

const hasActiveFilters = computed(() =>
  !!statusFilter.value || !!dateFrom.value || !!dateTo.value || !!searchQuery.value
)

async function load(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: settingsStore.settings?.items_per_page || 15 }
    if (statusFilter.value) params.status = statusFilter.value
    if (dateFrom.value) params.date_from = dateFrom.value
    if (dateTo.value) params.date_to = dateTo.value
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

function resetFilters() {
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  searchQuery.value = ''
  load(1)
}

function goToPage(page) { load(page) }

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
