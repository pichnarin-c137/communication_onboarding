<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Appointments</h1>
        <p class="text-sm text-gray-500 mt-0.5">Create and track all customer appointments</p>
      </div>
      <div class="flex items-center gap-2">
        <StatusFilterToggle :all-statuses="allStatuses" :hidden-count="hiddenStatusCount" :is-visible="isStatusVisible"
          @toggle="toggleStatus" @reset="resetStatuses" />
        <ColumnsToggle :all-columns="allColumns" :hidden-count="hiddenCount" :is-visible="isVisible"
          @toggle="toggleColumn" @reset="resetColumns" />
        <button @click="exportCSV"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowDownTrayIcon class="w-4 h-4" />
          Export
        </button>
        <button @click="eventStore.openCreateModal()"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
          <PlusIcon class="w-4 h-4" />
          New Appointment
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-700">Filters</span>
        <button v-if="hasActiveFilters" @click="resetFilters" class="text-xs text-primary hover:underline">
          Reset all
        </button>
      </div>

      <!-- Row 1: Dropdowns grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <AppSelect v-model="trainerFilter" :options="trainerOptions" placeholder="All Trainers"
            search-placeholder="Search trainers..." :loading="saleStore.loadingTrainers" :remote="true" clearable
            @search="onTrainerSearch" />
        </div>
        <select v-model="statusFilter" @change="load(1)"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="leave_office">Leave Office</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
        <select v-model="typeFilter" @change="load(1)"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Types</option>
          <option value="training">Training</option>
          <option value="demo">Demo</option>
        </select>
        <select v-model="locationFilter" @change="load(1)"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Locations</option>
          <option value="online">Online</option>
          <option value="physical">Physical</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <!-- Row 2: Date range + Search -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 bg-white sm:w-72">
          <CalendarDaysIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input v-model="dateFrom" @change="load(1)" type="date"
            class="flex-1 text-sm outline-none bg-transparent min-w-0 text-gray-700" />
          <span class="text-gray-300 px-1">–</span>
          <input v-model="dateTo" @change="load(1)" type="date"
            class="flex-1 text-sm outline-none bg-transparent min-w-0 text-gray-700" />
        </div>
        <div class="relative flex-1">
          <MagnifyingGlassIcon
            class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input v-model="searchQuery" @input="onSearchInput" @keyup.enter="load(1)" type="text"
            placeholder="Search by client or code…"
            class="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          <button v-if="searchQuery" type="button" @click="clearSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Analytics Panel -->
    <div v-if="analytics && !loading" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <!-- Alert strip — only when there are flagged appointments -->
      <div v-if="analytics.health_summary.critical > 0 || analytics.health_summary.warning > 0"
        class="flex items-center gap-2 px-4 py-2 border-b border-gray-100 text-xs"
        :class="analytics.health_summary.critical > 0 ? 'text-red-600' : 'text-amber-600'">
        <span class="w-1.5 h-1.5 rounded-full shrink-0"
          :class="analytics.health_summary.critical > 0 ? 'bg-red-500' : 'bg-amber-400'"></span>
        <span v-if="analytics.health_summary.critical > 0" class="font-medium">
          {{ analytics.health_summary.critical }} overdue — review required
        </span>
        <span v-else class="font-medium">
          {{ analytics.health_summary.warning }} appointment{{ analytics.health_summary.warning > 1 ? 's' : '' }} need
          attention
        </span>
      </div>

      <!-- Status stats row -->
      <div class="grid grid-cols-3 sm:grid-cols-6 divide-x divide-gray-100">
        <div class="px-4 py-4">
          <p class="text-xs text-gray-400 mb-1.5">Total</p>
          <p class="text-xl font-semibold text-gray-900 leading-none">{{ analyticsTotal }}</p>
          <p class="text-xs text-gray-400 mt-1.5">{{ analytics.this_month }} this month</p>
        </div>
        <div class="px-4 py-4">
          <p class="text-xs text-gray-400 mb-1.5">Completed</p>
          <p class="text-xl font-semibold text-gray-900 leading-none">{{ analytics.by_status.done }}</p>
          <p class="text-xs mt-1.5"
            :class="(analytics.completion_rate ?? 0) >= 70 ? 'text-emerald-600' : 'text-amber-600'">
            {{ analytics.completion_rate ?? '—' }}% rate
          </p>
        </div>
        <div class="px-4 py-4">
          <p class="text-xs text-gray-400 mb-1.5">Pending</p>
          <p class="text-xl font-semibold text-gray-900 leading-none">{{ analytics.by_status.pending }}</p>
          <p class="text-xs text-gray-400 mt-1.5">{{ analytics.today }} today</p>
        </div>
        <div class="px-4 py-4">
          <p class="text-xs text-gray-400 mb-1.5">Active</p>
          <p class="text-xl font-semibold text-gray-900 leading-none">
            {{ (analytics.by_status.in_progress ?? 0) + (analytics.by_status.leave_office ?? 0) }}
          </p>
          <p class="text-xs text-gray-400 mt-1.5">in progress</p>
        </div>
        <div class="px-4 py-4">
          <p class="text-xs text-gray-400 mb-1.5">Cancelled</p>
          <p class="text-xl font-semibold leading-none"
            :class="analytics.by_status.cancelled > 0 ? 'text-red-600' : 'text-gray-900'">
            {{ analytics.by_status.cancelled }}
          </p>
        </div>
        <div class="px-4 py-4">
          <p class="text-xs text-gray-400 mb-1.5">Rescheduled</p>
          <p class="text-xl font-semibold text-gray-900 leading-none">{{ analytics.by_status.rescheduled }}</p>
        </div>
      </div>

      <!-- Coverage row — sale-specific -->
      <div v-if="analytics.by_type"
        class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 border-t border-gray-100">
        <div class="px-4 py-3 flex items-center justify-between">
          <span class="text-xs text-gray-400">Training</span>
          <span class="text-sm font-semibold text-gray-800">{{ analytics.by_type.training }}</span>
        </div>
        <div class="px-4 py-3 flex items-center justify-between">
          <span class="text-xs text-gray-400">Demo</span>
          <span class="text-sm font-semibold text-gray-800">{{ analytics.by_type.demo }}</span>
        </div>
        <div class="px-4 py-3 flex items-center justify-between">
          <span class="text-xs text-gray-400">Clients</span>
          <span class="text-sm font-semibold text-gray-800">{{ analytics.unique_clients }}</span>
        </div>
        <div class="px-4 py-3 flex items-center justify-between">
          <span class="text-xs text-gray-400">Trainers</span>
          <span class="text-sm font-semibold text-gray-800">{{ analytics.unique_trainers }}</span>
        </div>
      </div>
    </div>

    <!-- List -->
    <SkeletonLoader v-if="loading" type="table" :count="5" />

    <div v-else-if="visibleAppointments.length === 0"
      class="text-center py-16 bg-white rounded-xl border border-gray-200">
      <CalendarDaysIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-sm font-semibold text-gray-700">No appointments found</p>
      <p class="text-xs text-gray-500 mt-1">
        <template v-if="hiddenStatusCount > 0 && displayedAppointments.length > 0">
          Some appointments are hidden by your status filter.
        </template>
        <template v-else>Try adjusting your filters or create a new appointment.</template>
      </p>
      <div class="mt-4 flex items-center justify-center gap-2">
        <button v-if="hiddenStatusCount > 0" @click="resetStatuses"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Show all statuses
        </button>
        <button v-if="hasActiveFilters" @click="resetFilters"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Reset Filters
        </button>
        <button @click="eventStore.openCreateModal()"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
          <PlusIcon class="w-4 h-4" />
          New Appointment
        </button>
      </div>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
            <th v-if="isVisible('code')"
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
            <th v-if="isVisible('client')"
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
            <th v-if="isVisible('type')"
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
            <th v-if="isVisible('location')"
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
            <th v-if="isVisible('date')"
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date / Time</th>
            <th v-if="isVisible('trainer')"
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trainer</th>
            <th v-if="isVisible('status')"
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th v-if="isVisible('feedback')"
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Feedback</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="appt in visibleAppointments" :key="appt.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="router.push(`/sales/appointments/${appt.id}`)">
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900 truncate max-w-[200px]"
                @mouseenter="showTitleTooltip($event, appt.title || '—')" @mousemove="moveTitleTooltip"
                @mouseleave="hideTitleTooltip">
                {{ appt.title || '—' }}
              </p>
              <span v-if="appt.health && appt.health.severity !== 'info'"
                :class="['mt-0.5 inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full', healthBadgeClass(appt.health)]">
                {{ healthFlagLabel(appt.health.flag) }}
              </span>
            </td>
            <td v-if="isVisible('code')" class="px-4 py-3 text-gray-600">{{ appt.appointment_code || '—' }}</td>
            <td v-if="isVisible('client')" class="px-4 py-3 text-gray-600 max-w-[160px] truncate"
              :title="appt.client?.company_name || '—'">
              {{ appt.client?.company_name || '—' }}
            </td>
            <td v-if="isVisible('type')" class="px-4 py-3">
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                appt.appointment_type === 'demo' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700']">
                {{ appt.appointment_type }}
              </span>
            </td>
            <td v-if="isVisible('location')" class="px-4 py-3">
              <span :class="['text-xs font-medium px-2.5 py-0.5 rounded-full capitalize',
                appt.location_type === 'online' ? 'bg-blue-50 text-blue-600'
                  : appt.location_type === 'hybrid' ? 'bg-purple-50 text-purple-600'
                    : 'bg-gray-100 text-gray-600']">
                {{ appt.location_type || '—' }}
              </span>
            </td>
            <td v-if="isVisible('date')" class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
              {{ formatDate(appt.scheduled_date) }}<br>
              {{ formatTime(appt.scheduled_start_time) }} – {{ formatTime(appt.scheduled_end_time) }}
            </td>
            <td v-if="isVisible('trainer')" class="px-4 py-3 text-gray-600">
              {{ appt.trainer ? `${appt.trainer.first_name} ${appt.trainer.last_name}` : '—' }}
            </td>
            <td v-if="isVisible('status')" class="px-4 py-3">
              <StatusBadge :status="appt.status" />
            </td>
            <td v-if="isVisible('feedback')" class="px-4 py-3">
              <div v-if="normalizedFeedback(appt) !== null" class="min-w-[120px]">
                <StarRating :model-value="normalizedFeedback(appt)" readonly class="scale-[0.48] origin-left" />
              </div>
              <span v-else class="text-xs text-gray-400">—</span>
            </td>
            <td class="px-4 py-3 text-right">
              <ChevronRightIcon class="w-4 h-4 text-gray-400" />
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="meta.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p class="text-xs text-gray-500">Showing {{ meta.from }}–{{ meta.to }} of {{ meta.total }}</p>
        <div class="flex gap-1.5">
          <button @click="goToPage(meta.current_page - 1)" :disabled="meta.current_page === 1"
            class="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
          <button @click="goToPage(meta.current_page + 1)" :disabled="meta.current_page === meta.last_page"
            class="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
        </div>
      </div>
    </div>

    <div v-if="tooltip.visible"
      class="fixed z-[9999] pointer-events-none max-w-xs whitespace-normal break-words rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }">
      {{ tooltip.text }}
    </div>

    <CreateEventModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, ChevronRightIcon, CalendarDaysIcon, MagnifyingGlassIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { useSaleStore } from '@/modules/sale/store/sale.js'
import { useSettingsStore } from '@/modules/shared/store/settings'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import { downloadCSV } from '@/modules/shared/composables/useCSVExport.js'
import { useTableColumns } from '@/modules/shared/composables/useTableColumns.js'
import { useStatusFilter } from '@/modules/shared/composables/useStatusFilter.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import AppSelect from '@/modules/shared/components/AppSelect.vue'
import ColumnsToggle from '@/modules/shared/components/ColumnsToggle.vue'
import StatusFilterToggle from '@/modules/shared/components/StatusFilterToggle.vue'
import { useEventStore } from '@/modules/shared/store/events.js'
import CreateEventModal from '@/modules/shared/components/CreateEventModal.vue'
import StarRating from '@/modules/shared/components/StarRating.vue'


const router = useRouter()
const saleStore = useSaleStore()
const eventStore = useEventStore()
const settingsStore = useSettingsStore()
const { formatDateMed: formatDate, formatTime } = useDateTime()

const analytics = computed(() => saleStore.analytics)
const analyticsTotal = computed(() => {
  if (!analytics.value?.by_status) return 0
  return Object.values(analytics.value.by_status).reduce((a, b) => a + b, 0)
})

const FLAG_LABELS = { overdue: 'Overdue', starting_late: 'Starting Late', pending_too_long: 'Stale', upcoming: 'Upcoming', late_to_client: 'Late to Client', en_route: 'En Route', running_overtime: 'Overtime', started_late: 'Started Late', in_session: 'In Session', completed_late: 'Ended Late', completed_on_time: 'On Time', cancelled: 'Cancelled', rescheduled: 'Rescheduled' }
function healthBadgeClass(h) { return h?.severity === 'critical' ? 'bg-red-100 text-red-700' : h?.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500' }
function healthFlagLabel(flag) { return FLAG_LABELS[flag] || flag }

function normalizedFeedback(appt) {
  if (appt?.status !== 'done') return null
  const rating = Number(appt?.overall_rating)
  if (!Number.isFinite(rating) || rating <= 0) return null
  return Math.min(5, Math.max(0, rating))
}

const allColumns = [
  { key: 'code', label: 'Code' },
  { key: 'client', label: 'Client' },
  { key: 'type', label: 'Type' },
  { key: 'location', label: 'Location' },
  { key: 'date', label: 'Date / Time' },
  { key: 'trainer', label: 'Trainer' },
  { key: 'status', label: 'Status' },
  { key: 'feedback', label: 'Feedback' },
]

const { isVisible, toggleColumn, resetColumns, hiddenCount } = useTableColumns('sale-appointment', allColumns)

const allStatuses = [
  { key: 'pending', label: 'Pending' },
  { key: 'leave_office', label: 'Leave Office' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'rescheduled', label: 'Rescheduled' },
]
const { isStatusVisible, toggleStatus, resetStatuses, hiddenCount: hiddenStatusCount, filterByStatus } = useStatusFilter('sale-appointment', allStatuses)

const loading = ref(true)
const meta = computed(() => saleStore.meta)
const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const locationFilter = ref('')
let searchDebounceTimer = null
const tooltip = ref({ visible: false, text: '', x: 0, y: 0 })

const trainerOptions = computed(() =>
  saleStore.trainers.map(t => ({ value: String(t.id), label: `${t.first_name} ${t.last_name}` }))
)
const statusFilter = computed({ get: () => saleStore.statusFilter, set: v => { saleStore.statusFilter = v } })
const typeFilter = computed({ get: () => saleStore.typeFilter, set: v => { saleStore.typeFilter = v } })
const trainerFilter = computed({ get: () => saleStore.trainerFilter, set: v => { saleStore.trainerFilter = v ?? '' } })
const displayedAppointments = computed(() => saleStore.filteredAppointments)
const visibleAppointments = computed(() => filterByStatus(displayedAppointments.value))

const hasActiveFilters = computed(() =>
  !!saleStore.trainerFilter || !!saleStore.statusFilter || !!saleStore.typeFilter ||
  !!locationFilter.value || !!searchQuery.value || !!dateFrom.value || !!dateTo.value
)

async function onTrainerSearch(query) { await saleStore.fetchTrainers(query) }

function buildParams(extra = {}) {
  const params = { per_page: settingsStore.settings?.items_per_page || 15, ...extra }
  if (saleStore.trainerFilter) params.trainer_id = saleStore.trainerFilter
  if (saleStore.statusFilter) params.status = saleStore.statusFilter
  if (saleStore.typeFilter) params.appointment_type = saleStore.typeFilter
  if (locationFilter.value) params.location_type = locationFilter.value
  if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
  if (dateFrom.value) params.date_from = dateFrom.value
  if (dateTo.value) params.date_to = dateTo.value
  return params
}

async function load(page = 1) {
  loading.value = true
  try { await saleStore.fetchAppointments(buildParams({ page })) }
  finally { loading.value = false }
}

function resetFilters() {
  saleStore.statusFilter = ''; saleStore.typeFilter = ''; saleStore.trainerFilter = ''
  locationFilter.value = ''; searchQuery.value = ''; dateFrom.value = ''; dateTo.value = ''
  load(1)
}

watch(() => saleStore.trainerFilter, () => load(1))
watch(() => eventStore.isCreateModalOpen, (isOpen, wasOpen) => {
  if (!isOpen && wasOpen) load(1)
})
function goToPage(page) { load(page) }

function onSearchInput() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => load(1), 300)
}
function clearSearch() {
  if (searchDebounceTimer) { clearTimeout(searchDebounceTimer); searchDebounceTimer = null }
  searchQuery.value = ''; load(1)
}

function showTitleTooltip(event, text) {
  tooltip.value = { visible: true, text, x: event.clientX + 12, y: event.clientY + 16 }
}
function moveTitleTooltip(event) {
  if (!tooltip.value.visible) return
  tooltip.value.x = event.clientX + 12; tooltip.value.y = event.clientY + 16
}
function hideTitleTooltip() { tooltip.value.visible = false }

function exportCSV() {
  const headers = ['Title', 'Code', 'Client', 'Type', 'Location', 'Date', 'Start Time', 'End Time', 'Trainer', 'Status', 'Feedback Rating']
  const rows = visibleAppointments.value.map(a => [
    a.title || '', a.appointment_code || '', a.client?.company_name || '',
    a.appointment_type || '', a.location_type || '', a.scheduled_date || '',
    a.scheduled_start_time || '', a.scheduled_end_time || '',
    a.trainer ? `${a.trainer.first_name} ${a.trainer.last_name}` : '', a.status || '',
    normalizedFeedback(a) !== null ? normalizedFeedback(a).toFixed(1) : ''
  ])
  downloadCSV([headers, ...rows], `appointments_${new Date().toISOString().slice(0, 10)}.csv`)
}

onBeforeUnmount(() => { if (searchDebounceTimer) clearTimeout(searchDebounceTimer) })
onMounted(async () => {
  try {
    if (!settingsStore.settings) await settingsStore.fetchSettings()
    await Promise.all([
      saleStore.fetchAppointments({ per_page: settingsStore.settings?.items_per_page || 15 }),
      saleStore.fetchTrainers()
    ])
  } finally { loading.value = false }
})
</script>
