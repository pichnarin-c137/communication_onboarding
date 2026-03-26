<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Appointments</h1>
        <p class="text-sm text-gray-500 mt-0.5">Create and track all customer appointments</p>
      </div>
      <router-link to="/sales/appointments/create"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
        <PlusIcon class="w-4 h-4" />
        New Appointment
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
      <h2 class="text-sm font-semibold text-gray-700">Filters</h2>
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="sm:w-52">
          <AppSelect v-model="trainerFilter" :options="trainerOptions" placeholder="Select a Trainer"
            search-placeholder="Search trainers..." :loading="saleStore.loadingTrainers" :remote="true" clearable
            @search="onTrainerSearch" />
        </div>
        <select v-model="statusFilter"
          class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="leave_office">Leave Office</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
        <select v-model="typeFilter"
          class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Types</option>
          <option value="training">Training</option>
          <option value="demo">Demo</option>
        </select>
        <div class="relative w-full sm:w-72 md:w-80 lg:w-96 sm:ml-auto">
          <MagnifyingGlassIcon
            class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input v-model="searchQuery" @input="onSearchInput" @keyup.enter="load(1)" type="text"
            placeholder="Search by client or code"
            class="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          <button v-if="searchQuery" type="button" @click="clearSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            aria-label="Clear search">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>


    <!-- List -->
    <SkeletonLoader v-if="loading" type="table" :count="5" />

    <div v-else-if="displayedAppointments.length === 0"
      class="text-center py-16 bg-white rounded-xl border border-gray-200">
      <CalendarDaysIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-sm font-medium text-gray-500">No appointments found</p>
      <p class="text-xs text-gray-400 mt-1">Create a new appointment to get started</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
              Client</th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
              Type</th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
              Date</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trainer</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="appt in displayedAppointments" :key="appt.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="router.push(`/sales/appointments/${appt.id}`)">
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900 truncate max-w-[200px]"
                @mouseenter="showTitleTooltip($event, appt.title || '—')" @mousemove="moveTitleTooltip"
                @mouseleave="hideTitleTooltip">
                {{ appt.title || '—' }}
              </p>
              <p class="text-xs text-gray-400 sm:hidden" :title="appt.client?.company_name || '—'">{{
                appt.client?.company_name || '—' }}</p>
            </td>
            <td class="px-4 py-3 text-gray-600">
              {{ appt.appointment_code || '—' }}
            </td>
            <td class="px-4 py-3 hidden sm:table-cell text-gray-600 truncate max-w-[160px]"
              :title="appt.client?.company_name || '—'">
              {{ appt.client?.company_name || '—' }}
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <span
                :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', appt.appointment_type === 'demo' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700']">
                {{ appt.appointment_type }}
              </span>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-gray-600 text-xs">
              {{ formatDate(appt.scheduled_date) }}
              <br>
              {{ formatTime(appt.scheduled_start_time) }} – {{ formatTime(appt.scheduled_end_time) }}
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-gray-600">
              {{ appt.trainer?.first_name }} {{ appt.trainer?.last_name }}
            </td>
            <td class="px-4 py-3">
              <StatusBadge :status="appt.status" />
            </td>
            <td class="px-4 py-3 text-right">
              <ChevronRightIcon class="w-4 h-4 text-gray-400" />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p class="text-xs text-gray-500">
          Showing {{ meta.from }}–{{ meta.to }} of {{ meta.total }}
        </p>
        <div class="flex gap-1">
          <button @click="goToPage(meta.current_page - 1)" :disabled="meta.current_page === 1"
            class="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">
            Prev
          </button>
          <button @click="goToPage(meta.current_page + 1)" :disabled="meta.current_page === meta.last_page"
            class="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>

    <div v-if="tooltip.visible"
      class="fixed z-[9999] pointer-events-none max-w-xs whitespace-normal break-words rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }">
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, ChevronRightIcon, CalendarDaysIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useSaleStore } from '@/modules/sale/store/sale.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import AppSelect from '@/modules/shared/components/AppSelect.vue'

const router = useRouter()
const saleStore = useSaleStore()
const { formatDateMed: formatDate, formatTime } = useDateTime()

const loading = ref(true)
const meta = computed(() => saleStore.meta)
const searchQuery = ref('')
let searchDebounceTimer = null
const tooltip = ref({ visible: false, text: '', x: 0, y: 0 })
  
const trainerOptions = computed(() =>
  saleStore.trainers.map(t => ({ value: String(t.id), label: `${t.first_name} ${t.last_name}` }))
)

const statusFilter = computed({
  get: () => saleStore.statusFilter,
  set: (v) => { saleStore.statusFilter = v }
})

const typeFilter = computed({
  get: () => saleStore.typeFilter,
  set: (v) => { saleStore.typeFilter = v }
})

const trainerFilter = computed({
  get: () => saleStore.trainerFilter,
  set: (v) => { saleStore.trainerFilter = v ?? '' }
})

const displayedAppointments = computed(() => saleStore.filteredAppointments)

async function onTrainerSearch(query) {
  await saleStore.fetchTrainers(query)
}

function buildParams(extra = {}) {
  const params = { per_page: 15, ...extra }
  if (saleStore.trainerFilter) params.trainer_id = saleStore.trainerFilter
  if (saleStore.statusFilter) params.status = saleStore.statusFilter
  if (saleStore.typeFilter) params.appointment_type = saleStore.typeFilter
  if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
  return params
}

async function load(page = 1) {
  loading.value = true
  try {
    await saleStore.fetchAppointments(buildParams({ page }))
  } finally {
    loading.value = false
  }
}

watch(() => saleStore.trainerFilter, async () => {
  loading.value = true
  try {
    await saleStore.fetchAppointments(buildParams())
  } finally {
    loading.value = false
  }
})

async function goToPage(page) {
  await load(page)
}

function onSearchInput() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => load(1), 300)
}

function clearSearch() {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }
  searchQuery.value = ''
  load(1)
}

function showTitleTooltip(event, text) {
  tooltip.value = {
    visible: true,
    text,
    x: event.clientX + 12,
    y: event.clientY + 16
  }
}

function moveTitleTooltip(event) {
  if (!tooltip.value.visible) return
  tooltip.value.x = event.clientX + 12
  tooltip.value.y = event.clientY + 16
}

function hideTitleTooltip() {
  tooltip.value.visible = false
}

onBeforeUnmount(() => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})

onMounted(async () => {
  try {
    await Promise.all([
      saleStore.fetchAppointments({ per_page: 15 }),
      saleStore.fetchTrainers()
    ])
  } finally {
    loading.value = false
  }
})
</script>
