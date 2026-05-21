<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Activity Logs</h1>
      <p class="text-sm text-gray-500 mt-0.5">Audit trail of all admin actions across the system</p>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-700">Filters</span>
        <button v-if="hasActiveFilters" @click="resetFilters" class="text-xs text-primary hover:underline">Reset all</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Action type -->
        <select v-model="store.filters.action" @change="load(1)"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">All Actions</option>
          <optgroup label="User">
            <option value="USER_CREATED">User Created</option>
            <option value="USER_UPDATED">User Updated</option>
            <option value="USER_SUSPENDED">User Suspended</option>
            <option value="USER_UNSUSPENDED">User Unsuspended</option>
            <option value="USER_SOFT_DELETED">User Deleted</option>
            <option value="USER_HARD_DELETED">User Permanently Deleted</option>
            <option value="USER_RESTORED">User Restored</option>
          </optgroup>
          <optgroup label="Auth">
            <option value="PASSWORD_CHANGED">Password Changed</option>
            <option value="PASSWORD_RESET">Password Reset</option>
            <option value="FORGOT_PASSWORD">Forgot Password</option>
          </optgroup>
          <optgroup label="Appointment">
            <option value="APPOINTMENT_CREATED">Appointment Created</option>
            <option value="APPOINTMENT_UPDATED">Appointment Updated</option>
            <option value="APPOINTMENT_STARTED">Appointment Started</option>
          </optgroup>
          <optgroup label="Onboarding">
            <option value="ONBOARDING_STARTED">Onboarding Started</option>
            <option value="ONBOARDING_COMPLETED">Onboarding Completed</option>
          </optgroup>
        </select>

        <!-- User ID (free text for now) -->
        <input v-model="store.filters.user_id" @input="debouncedLoad" placeholder="Filter by User ID..."
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary" />

        <!-- Date from -->
        <div class="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 bg-white">
          <CalendarDaysIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input v-model="store.filters.from" @change="load(1)" type="date"
            class="flex-1 text-sm outline-none bg-transparent text-gray-700" />
        </div>

        <!-- Date to -->
        <div class="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 bg-white">
          <CalendarDaysIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input v-model="store.filters.to" @change="load(1)" type="date"
            class="flex-1 text-sm outline-none bg-transparent text-gray-700" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <ActivityLogTable :logs="store.logs" :loading="store.loading" :show-user="true" />

    <!-- Pagination -->
    <div v-if="store.meta.last_page > 1" class="flex items-center justify-between">
      <p class="text-sm text-gray-500">
        {{ store.meta.from }}–{{ store.meta.to }} of {{ store.meta.total }} entries
      </p>
      <div class="flex gap-1">
        <button
          v-for="p in store.meta.last_page"
          :key="p"
          @click="load(p)"
          :class="[
            'w-8 h-8 text-sm rounded-lg transition-colors',
            p === store.meta.current_page
              ? 'bg-primary text-white font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >{{ p }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'
import { useActivityLogStore } from '@/modules/admin/store/activity-log.store.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { extractErrorMessage } from '@core/services/error.handler'
import ActivityLogTable from '@/modules/admin/components/ActivityLogTable.vue'

const store = useActivityLogStore()
const toast = useToast()

let debounceTimer = null

onMounted(() => load(1))

async function load(page = 1) {
  try {
    await store.fetchLogs(page)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => load(1), 400)
}

function resetFilters() {
  store.resetFilters()
  load(1)
}

const hasActiveFilters = computed(() => {
  const f = store.filters
  return f.user_id || f.action || f.from || f.to
})
</script>
