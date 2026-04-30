<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Appointments</h1>
        <p class="text-sm text-gray-500 mt-0.5">View and manage your assigned appointments</p>
      </div>
      <div class="flex items-center gap-2">
        <StatusFilterToggle
          :all-statuses="allStatuses"
          :hidden-count="hiddenStatusCount"
          :is-visible="isStatusVisible"
          @toggle="toggleStatus"
          @reset="resetStatuses"
        />
        <ColumnsToggle
          :all-columns="allColumns"
          :hidden-count="hiddenCount"
          :is-visible="isVisible"
          @toggle="toggleColumn"
          @reset="resetColumns"
        />
        <button @click="exportCSV"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowDownTrayIcon class="w-4 h-4" />
          Export Excel
        </button>
        <button @click="eventStore.openCreateModal()"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
          <PlusIcon class="w-4 h-4" />
          New Appointment
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-700">Filters</h2>
        <button v-if="hasActiveFilters" @click="resetFilters"
          class="text-xs text-primary hover:underline">Reset all</button>
      </div>
      <!-- Row 1: Dropdowns grid -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <select v-model="typeFilter" @change="load(1)"
          class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Types</option>
          <option value="training">Training</option>
          <option value="demo">Demo</option>
        </select>
        <select v-model="statusFilter" @change="load(1)"
          class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="leave_office">Leave Office</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
        <select v-model="locationFilter" @change="load(1)"
          class="col-span-2 lg:col-span-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Locations</option>
          <option value="online">Online</option>
          <option value="physical">Physical</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>
      <!-- Row 2: Date range + Search -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 bg-white w-full sm:w-80">
          <CalendarDaysIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input v-model="dateFrom" @change="load(1)" type="date"
            class="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 min-w-0" />
          <span class="text-gray-300 px-1 flex-shrink-0">–</span>
          <input v-model="dateTo" @change="load(1)" type="date"
            class="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 min-w-0" />
        </div>
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
    <SkeletonLoader v-if="loading" type="table" :count="5" />

    <div v-else-if="visibleAppointments.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-200">
      <CalendarDaysIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-sm font-semibold text-gray-700">No appointments found</p>
      <p class="text-xs text-gray-500 mt-1">
        <template v-if="hiddenStatusCount > 0 && appointments.length > 0">
          Some appointments are hidden by your status filter.
        </template>
        <template v-else>Try adjusting your filters or schedule a new appointment.</template>
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
            <th v-if="isVisible('code')" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
            <th v-if="isVisible('client')" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
            <th v-if="isVisible('type')" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
            <th v-if="isVisible('location')" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
            <th v-if="isVisible('due_date')" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date / Time</th>
            <th v-if="isVisible('status')" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th class="px-4 py-3 w-8"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="appt in visibleAppointments" :key="appt.id"
            class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="router.push(`/trainer/appointments/${appt.id}`)">
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900 max-w-[180px] truncate"
                @mouseenter="showTitleTooltip($event, appt.title || '—')"
                @mousemove="moveTitleTooltip"
                @mouseleave="hideTitleTooltip">
                {{ appt.title || '—' }}
              </p>
            </td>
            <td v-if="isVisible('code')" class="px-4 py-3 text-gray-600">{{ appt.appointment_code || '—' }}</td>
            <td v-if="isVisible('client')" class="px-4 py-3 text-gray-600" :title="appt.client?.company_name || '—'">
              {{ appt.client?.company_name || '—' }}
            </td>
            <td v-if="isVisible('type')" class="px-4 py-3">
              <span :class="['text-xs font-medium px-2.5 py-0.5 rounded-full capitalize',
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
            <td v-if="isVisible('due_date')" class="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
              {{ formatDate(appt.scheduled_date) }}<br>
              {{ formatTime(appt.scheduled_start_time) }}
            </td>
            <td v-if="isVisible('status')" class="px-4 py-3"><StatusBadge :status="appt.status" /></td>
            <td class="px-4 py-3 text-right">
              <ChevronRightIcon class="w-4 h-4 text-gray-400" />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
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

    <!-- Tooltip -->
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
import { ChevronRightIcon, CalendarDaysIcon, MagnifyingGlassIcon, XMarkIcon, ArrowDownTrayIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { trainerService } from '@/modules/trainer/services/trainerService.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import { downloadCSV } from '@/modules/shared/composables/useCSVExport.js'
import { useTableColumns } from '@/modules/shared/composables/useTableColumns.js'
import { useStatusFilter } from '@/modules/shared/composables/useStatusFilter.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import ColumnsToggle from '@/modules/shared/components/ColumnsToggle.vue'
import StatusFilterToggle from '@/modules/shared/components/StatusFilterToggle.vue'
import { useSettingsStore } from '@/modules/shared/store/settings'
import { useEventStore } from '@/modules/shared/store/events.js'
import CreateEventModal from '@/modules/shared/components/CreateEventModal.vue'

const router = useRouter()
const settingsStore = useSettingsStore()
const eventStore = useEventStore()
const { formatDateMed: formatDate, formatTime } = useDateTime()

const allColumns = [
  { key: 'code', label: 'Code' },
  { key: 'client', label: 'Client' },
  { key: 'type', label: 'Type' },
  { key: 'location', label: 'Location' },
  { key: 'due_date', label: 'Date / Time' },
  { key: 'status', label: 'Status' },
]
const { isVisible, toggleColumn, resetColumns, hiddenCount } = useTableColumns('trainer-appointment', allColumns)

const allStatuses = [
  { key: 'pending', label: 'Pending' },
  { key: 'leave_office', label: 'Leave Office' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'rescheduled', label: 'Rescheduled' },
]
const { isStatusVisible, toggleStatus, resetStatuses, hiddenCount: hiddenStatusCount, filterByStatus } = useStatusFilter('trainer-appointment', allStatuses)

const loading = ref(true)
const appointments = ref([])
const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1, from: 0, to: 0 })
const statusFilter = ref('')
const typeFilter = ref('')
const locationFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const searchQuery = ref('')
let searchDebounceTimer = null
const tooltip = ref({ visible: false, text: '', x: 0, y: 0 })

const visibleAppointments = computed(() => filterByStatus(appointments.value))

const hasActiveFilters = computed(() =>
  !!statusFilter.value || !!typeFilter.value || !!locationFilter.value ||
  !!dateFrom.value || !!dateTo.value || !!searchQuery.value
)

async function load(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: settingsStore.settings?.items_per_page || 15 }
    if (statusFilter.value) params.status = statusFilter.value
    if (typeFilter.value) params.appointment_type = typeFilter.value
    if (locationFilter.value) params.location_type = locationFilter.value
    if (dateFrom.value) params.date_from = dateFrom.value
    if (dateTo.value) params.date_to = dateTo.value
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
    const response = await trainerService.getAppointments(params)
    appointments.value = response.data || []
    if (response.meta) meta.value = response.meta
  } catch {
    appointments.value = []
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  statusFilter.value = ''
  typeFilter.value = ''
  locationFilter.value = ''
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

function showTitleTooltip(event, text) {
  tooltip.value = { visible: true, text, x: event.clientX + 12, y: event.clientY + 16 }
}
function moveTitleTooltip(event) {
  if (!tooltip.value.visible) return
  tooltip.value.x = event.clientX + 12
  tooltip.value.y = event.clientY + 16
}
function hideTitleTooltip() { tooltip.value.visible = false }

function exportCSV() {
  const headers = ['Title', 'Code', 'Client', 'Type', 'Location', 'Date', 'Start Time', 'Status']
  const rows = visibleAppointments.value.map(a => [
    a.title || '',
    a.appointment_code || '',
    a.client?.company_name || '',
    a.appointment_type || '',
    a.location_type || '',
    a.scheduled_date || '',
    a.scheduled_start_time || '',
    a.status || ''
  ])
  downloadCSV([headers, ...rows], `appointments_${new Date().toISOString().slice(0, 10)}.csv`)
}

onBeforeUnmount(() => { if (searchDebounceTimer) clearTimeout(searchDebounceTimer) })

watch(() => eventStore.isCreateModalOpen, (isOpen, wasOpen) => {
  if (!isOpen && wasOpen) load(1)
})

onMounted(async () => {
  if (!settingsStore.settings) await settingsStore.fetchSettings()
  load()
})
</script>
