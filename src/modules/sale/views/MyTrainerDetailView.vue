<template>
  <div class="space-y-5 mt-3">
    <!-- Back + header -->
    <div class="flex items-center gap-3">
      <button @click="router.push('/sales/trainers')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Trainer Detail</h1>
        <p class="text-sm text-gray-500">Workload, schedule, appointments & onboardings</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.overviewLoading && !store.currentOverview" class="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div class="flex items-start gap-4">
        <div class="w-16 h-16 rounded-full bg-gray-200" />
        <div class="flex-1 space-y-2">
          <div class="h-5 bg-gray-200 rounded w-48" />
          <div class="h-4 bg-gray-100 rounded w-32" />
        </div>
      </div>
    </div>

    <template v-else-if="store.currentOverview">
      <!-- Header card -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="relative flex-shrink-0">
              <Avatar :name="trainer.full_name" :src="trainer.avatar_url || ''" size="xl" />
              <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white" :class="liveDotClass" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ trainer.full_name }}</h2>
              <p class="text-sm text-gray-500">{{ trainer.email }}</p>
              <p class="text-sm text-gray-500" v-if="trainer.phone_number">{{ trainer.phone_number }}</p>
              <div class="mt-2 flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" :class="livePillClass">
                  <span class="w-1.5 h-1.5 rounded-full" :class="liveDotClass" />
                  {{ liveLabel }}
                </span>
                <span class="text-xs text-gray-400">
                  Assigned {{ formatAssignedAt(trainer.assigned_at) }}
                </span>
              </div>
            </div>
          </div>

          <router-link
            :to="`/sales/appointments/create?trainer_id=${trainer.trainer_user_id}`"
            class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm flex-shrink-0"
          >
            <PlusIcon class="w-4 h-4" />
            Book Appointment
          </router-link>
        </div>

        <!-- Workload meters -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RosterMeter
            label="Active Onboardings"
            :value="workload.active_onboardings ?? 0"
            :cap="workload.max_concurrent_active_onboardings_per_trainer ?? 5"
          />
          <RosterMeter
            label="Pending Appointments"
            :value="workload.pending_appointments ?? 0"
            :cap="workload.max_pending_appointments_per_trainer ?? 10"
          />
          <div class="flex items-end">
            <div class="w-full">
              <p class="text-[11px] text-gray-500 mb-0.5">Current Session</p>
              <span
                v-if="workload.in_progress_appointment"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In progress now
              </span>
              <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Not in a session
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="flex gap-6">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'pb-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >{{ tab.label }}</button>
        </nav>
      </div>

      <!-- Tab content -->
      <div>
        <TrainerOverviewPanel
          v-if="activeTab === 'overview'"
          :overview="store.currentOverview"
        />
        <TrainerLiveActivityPanel
          v-else-if="activeTab === 'live'"
          :trainer-id="trainerId"
        />
        <TrainerAppointmentsPanel
          v-else-if="activeTab === 'appointments'"
          :trainer-id="trainerId"
        />
        <TrainerOnboardingsPanel
          v-else-if="activeTab === 'onboardings'"
          :trainer-id="trainerId"
        />
      </div>
    </template>

    <div v-else-if="!store.overviewLoading" class="text-center py-12 text-gray-400">
      Trainer not found.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { useMyTrainersStore } from '@/modules/sale/store/myTrainers.js'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { usePusher } from '@/modules/shared/composables/usePusher.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { extractErrorMessage, getErrorCode } from '@core/services/error.handler'
import Avatar from '@/modules/shared/components/Avatar.vue'
import RosterMeter from '@/modules/sale/components/RosterMeter.vue'
import TrainerOverviewPanel from '@/modules/sale/components/TrainerOverviewPanel.vue'
import TrainerLiveActivityPanel from '@/modules/sale/components/TrainerLiveActivityPanel.vue'
import TrainerAppointmentsPanel from '@/modules/sale/components/TrainerAppointmentsPanel.vue'
import TrainerOnboardingsPanel from '@/modules/sale/components/TrainerOnboardingsPanel.vue'

const route = useRoute()
const router = useRouter()
const store = useMyTrainersStore()
const authStore = useAuthStore()
const toast = useToast()
const { connect } = usePusher()

const trainerId = computed(() => route.params.id)
const activeTab = ref('overview')

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'live', label: 'Live Activity' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'onboardings', label: 'Onboardings' },
]

const trainer = computed(() => store.currentOverview?.trainer || {})
const live = computed(() => store.currentOverview?.live || {})
const workload = computed(() => store.currentOverview?.workload || {})

const liveLabel = computed(() => {
  const map = {
    at_office: 'At office',
    available: 'Available',
    leave_office: 'Out',
    in_progress: 'In session',
    off_duty: 'Off duty',
  }
  return map[live.value?.status] || (live.value?.status || 'Unknown').replace(/_/g, ' ')
})

const liveDotClass = computed(() => ({
  at_office: 'bg-emerald-500',
  available: 'bg-emerald-500',
  leave_office: 'bg-amber-500',
  in_progress: 'bg-blue-500',
  off_duty: 'bg-gray-400',
}[live.value?.status] || 'bg-gray-300'))

const livePillClass = computed(() => ({
  at_office: 'bg-emerald-50 text-emerald-700',
  available: 'bg-emerald-50 text-emerald-700',
  leave_office: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-blue-50 text-blue-700',
  off_duty: 'bg-gray-100 text-gray-600',
}[live.value?.status] || 'bg-gray-100 text-gray-500'))

function formatAssignedAt(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

// Load overview on mount + when id changes
async function load() {
  try {
    await store.fetchOverview(trainerId.value)
  } catch (err) {
    if (getErrorCode(err) === 'TRAINER_NOT_IN_SALE_ROSTER') {
      toast.error('You no longer have access to this trainer.')
      store.fetchRoster().catch(() => {})
      router.replace('/sales/trainers')
      return
    }
    toast.error(extractErrorMessage(err))
  }
}

watch(trainerId, load)

// Pusher live status patches
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
    /* optional */
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
  load()
  setupPusher()
})

onUnmounted(() => {
  store.resetOverview()
  teardownPusher()
})
</script>
