<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Trainers</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ rosterCount }} dedicated trainer{{ rosterCount === 1 ? '' : 's' }} assigned to you
        </p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            v-model="searchModel"
            type="text"
            placeholder="Search by name or phone…"
            class="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-60 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          v-model="sortModel"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="name">Sort: Name</option>
          <option value="current_workload">Sort: Workload</option>
          <option value="last_interaction">Sort: Last interaction</option>
        </select>
      </div>
    </div>

    <!-- Status filter pills -->
    <div class="flex gap-1.5 flex-wrap">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        @click="statusModel = tab.value"
        :class="[
          'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5',
          statusModel === tab.value
            ? 'bg-primary text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        ]"
      >
        <span v-if="tab.dot" class="w-1.5 h-1.5 rounded-full" :class="tab.dot" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.rosterLoading && store.roster.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
        <div class="flex gap-3">
          <div class="w-12 h-12 rounded-full bg-gray-200" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-32" />
            <div class="h-3 bg-gray-100 rounded w-24" />
          </div>
        </div>
        <div class="mt-4 space-y-2">
          <div class="h-1.5 bg-gray-100 rounded w-full" />
          <div class="h-1.5 bg-gray-100 rounded w-full" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!store.rosterLoading && store.roster.length === 0"
      class="bg-white border border-gray-200 rounded-xl p-10 text-center"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-3">
        <UserGroupIcon class="w-6 h-6 text-amber-500" />
      </div>
      <h3 class="text-sm font-semibold text-gray-900">No dedicated trainers yet</h3>
      <p class="text-xs text-gray-500 mt-1 max-w-md mx-auto">
        Your admin hasn't assigned any dedicated trainers to you. You won't be able to assign trainers to appointments until at least one is on your roster — ask your admin to set this up.
      </p>
    </div>

    <!-- Roster grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <TrainerRosterCard
        v-for="t in store.roster"
        :key="t.trainer_user_id"
        :trainer="t"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import { useMyTrainersStore } from '@/modules/sale/store/myTrainers.js'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { usePusher } from '@/modules/shared/composables/usePusher.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { extractErrorMessage } from '@core/services/error.handler'
import TrainerRosterCard from '@/modules/sale/components/TrainerRosterCard.vue'

const store = useMyTrainersStore()
const authStore = useAuthStore()
const toast = useToast()
const { connect } = usePusher()

const rosterCount = computed(() => store.roster.length)

const statusTabs = [
  { value: '', label: 'All', dot: '' },
  { value: 'at_office', label: 'At office', dot: 'bg-emerald-500' },
  { value: 'leave_office', label: 'Out', dot: 'bg-amber-500' },
  { value: 'in_progress', label: 'In session', dot: 'bg-blue-500' },
  { value: 'off_duty', label: 'Off duty', dot: 'bg-gray-400' },
]

// Two-way bindings to store filters with debounced search
const searchModel = ref(store.rosterFilters.search)
const statusModel = ref(store.rosterFilters.status)
const sortModel = ref(store.rosterFilters.sort_by || 'name')

let searchTimer = null
watch(searchModel, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    store.setFilter('search', val.trim())
    refresh()
  }, 300)
})

watch(statusModel, (val) => {
  store.setFilter('status', val)
  refresh()
})

watch(sortModel, (val) => {
  store.setFilter('sort_by', val)
  refresh()
})

async function refresh() {
  try {
    await store.fetchRoster()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

// Pusher live updates
let channel = null
function setupPusher() {
  try {
    const pusher = connect(() => authStore.accessToken)
    channel = pusher.subscribe('presence-trainers')
    channel.bind('trainer.status.changed', (data) => {
      store.patchLiveStatus({
        trainer_id: data.trainer_id,
        status: data.status,
        status_updated_at: data.timestamp || new Date().toISOString(),
      })
    })
  } catch {
    // Pusher optional — silently degrade
  }
}

function teardownPusher() {
  if (channel) {
    channel.unbind_all()
    channel.unsubscribe()
    channel = null
  }
}

onMounted(() => {
  refresh()
  setupPusher()
})

onUnmounted(() => {
  clearTimeout(searchTimer)
  teardownPusher()
})
</script>
