<template>
  <div class="space-y-5">
    <br>
    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
      <h2 class="text-sm font-semibold text-gray-700">Filters</h2>

      <div class="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <select v-model="typeFilter" @change="load()"
          class="w-full sm:w-44 px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Types</option>
          <option value="training">Training</option>
          <option value="demo">Demo</option>
        </select>

        <select v-model="statusFilter" @change="load()"
          class="w-full sm:w-44 px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="leave_office">Leave Office</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
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

    <!-- Table -->
    <SkeletonLoader v-if="loading" type="list" :count="5" />

    <div v-else-if="appointments.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-200">
      <CalendarDaysIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-sm font-medium text-gray-500">No appointments found</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50">
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3">Title</th>
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3">Code</th>
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3">Client</th>
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3">Type</th>
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3">Date / Time</th>
            <th class="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
            <th class="px-4 py-3 w-8"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="appt in appointments" :key="appt.id" class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="router.push(`/trainer/appointments/${appt.id}`)">
            <td class="px-4 py-3 font-medium text-gray-900">
              <p class="max-w-[180px] truncate" @mouseenter="showTitleTooltip($event, appt.title || '—')"
                @mousemove="moveTitleTooltip" @mouseleave="hideTitleTooltip">
                {{ appt.title || '—' }}
              </p>
            </td>
            <td class="px-4 py-3 text-gray-600">
              {{ appt.appointment_code || '—' }}
            </td>
            <td class="px-4 py-3 text-gray-600" :title="appt.client?.company_name || '—'">{{ appt.client?.company_name
              || '—' }}</td>
            <td class="px-4 py-3">
              <span
                :class="['text-xs font-medium px-1.5 py-0.5 rounded capitalize', appt.appointment_type === 'demo' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700']">
                {{ appt.appointment_type }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
              {{ formatDate(appt.scheduled_date) }}<br />
              <span class="text-xs text-gray-400">{{ formatTime(appt.scheduled_start_time) }}</span>
            </td>
            <td class="px-4 py-3">
              <StatusBadge :status="appt.status" />
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
        <button @click="goToPage(meta.current_page - 1)" :disabled="meta.current_page === 1"
          class="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Prev</button>
        <button @click="goToPage(meta.current_page + 1)" :disabled="meta.current_page === meta.last_page"
          class="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRightIcon, CalendarDaysIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { trainerService } from '@/modules/trainer/services/trainerService.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const router = useRouter()
const { formatDateMed: formatDate, formatTime } = useDateTime()

const loading = ref(true)
const appointments = ref([])
const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1, from: 0, to: 0 })
const statusFilter = ref('')
const typeFilter = ref('')
const searchQuery = ref('')
let searchDebounceTimer = null
const tooltip = ref({ visible: false, text: '', x: 0, y: 0 })

async function load(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 15 }
    if (statusFilter.value) params.status = statusFilter.value
    if (typeFilter.value) params.appointment_type = typeFilter.value
    if (searchQuery.value) params.search = searchQuery.value
    const response = await trainerService.getAppointments(params)
    appointments.value = response.data || []
    if (response.meta) meta.value = response.meta
  } catch {
    appointments.value = []
  } finally {
    loading.value = false
  }
}

function goToPage(page) { load(page) }

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

onMounted(() => load())
</script>
