<template>
  <div class="space-y-5 mt-3">
    <!-- Greeting Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Avatar :name="authStore.user?.first_name + ' ' + authStore.user?.last_name" size="xl" />
        <div>
          <p class="text-sm text-gray-500">{{ t('dashboard.trainer.welcome') }}</p>
          <h1 class="text-xl font-bold text-gray-900">{{ authStore.user?.first_name }}</h1>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- Widget Customize -->
        <div class="relative" ref="customizeRef">
          <button
            type="button"
            @click="customizeOpen = !customizeOpen"
            class="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AdjustmentsHorizontalIcon class="w-4 h-4" />
            {{ t('dashboard.trainer.customize') }}
          </button>

          <Transition
            enter-active-class="transition-all duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="customizeOpen"
              class="absolute right-0 top-full mt-1.5 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1"
            >
              <div class="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Widgets</span>
                <button
                  type="button"
                  @click="uiPrefs.resetTrainerWidgets()"
                  class="text-xs text-primary hover:underline"
                >Reset</button>
              </div>
              <ul class="py-1">
                <li
                  v-for="widget in trainerWidgetList"
                  :key="widget.key"
                  class="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                  @click="uiPrefs.toggleTrainerWidget(widget.key)"
                >
                  <span class="text-sm text-gray-700">{{ widget.label }}</span>
                  <button
                    type="button"
                    class="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 pointer-events-none"
                    :class="uiPrefs.trainerWidgets[widget.key] ? 'bg-primary' : 'bg-gray-200'"
                  >
                    <span
                      class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200"
                      :class="uiPrefs.trainerWidgets[widget.key] ? 'translate-x-4' : 'translate-x-0'"
                    />
                  </button>
                </li>
              </ul>
            </div>
          </Transition>
        </div>

        <router-link
          to="/trainer/appointments"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <PlusIcon class="w-4 h-4" />
          {{ t('dashboard.trainer.newAppointment') }}
        </router-link>
      </div>
    </div>

    <!-- Quick Stats -->
    <template v-if="uiPrefs.trainerWidgets.stats">
      <SkeletonLoader v-if="loading" type="cards" :count="4" />
      <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          label="Total Appts"
          :value="summary.total_appointments"
          :icon="CalendarDaysIcon"
          color="blue"
        />
        <StatsCard
          label="Today"
          :value="summary.appointments_today"
          :icon="ClockIcon"
          color="yellow"
        />
        <StatsCard
          label="In Progress"
          :value="summary.onboarding_in_progress"
          :icon="ClipboardDocumentListIcon"
          color="green"
        />
        <StatsCard
          label="Lessons Sent"
          :value="summary.lessons_sent_this_month"
          :icon="CheckBadgeIcon"
          color="purple"
        />
      </div>
    </template>

    <!-- Two-column: Today's Schedule + Active Onboardings -->
    <div
      v-if="uiPrefs.trainerWidgets.schedule || uiPrefs.trainerWidgets.onboarding"
      class="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      <!-- Today's Schedule -->
      <div v-if="uiPrefs.trainerWidgets.schedule" class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-900">{{ t('dashboard.trainer.todaySchedule') }}</h2>
          <router-link to="/trainer/appointments" class="text-xs text-primary hover:underline">{{ t('common.viewAll') }}</router-link>
        </div>
        <SkeletonLoader v-if="loading" type="list" :count="3" />
        <div v-else-if="todayAppointments.length === 0" class="py-8 text-center">
          <CalendarDaysIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-500">{{ t('dashboard.trainer.noToday') }}</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="appt in todayAppointments"
            :key="appt.id"
            class="flex gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            @click="router.push(`/trainer/appointments/${appt.id}`)"
          >
            <!-- Time column -->
            <div class="flex flex-col items-center pt-0.5">
              <span class="text-xs font-semibold text-gray-700 whitespace-nowrap">
                {{ formatTime(appt.scheduled_start_time) }}
              </span>
              <div class="w-px flex-1 bg-gray-200 my-1"></div>
            </div>
            <!-- Info column -->
            <div class="flex-1 min-w-0 pb-1">
              <h3 class="text-sm font-medium text-gray-900 truncate">{{ appt.title }}</h3>
              <p class="text-xs text-gray-500 truncate mt-0.5">{{ appt.client?.company_name }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span :class="['text-xs px-1.5 py-0.5 rounded capitalize font-medium', appt.location_type === 'online' ? 'bg-blue-100 text-blue-700' : appt.location_type === 'hybrid' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700']">
                  {{ appt.location_type }}
                </span>
                <StatusBadge :status="appt.status" size="xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Onboardings -->
      <div v-if="uiPrefs.trainerWidgets.onboarding" class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-900">{{ t('dashboard.trainer.activeOnboardings') }}</h2>
          <router-link to="/trainer/onboarding" class="text-xs text-primary hover:underline">{{ t('common.viewAll') }}</router-link>
        </div>
        <SkeletonLoader v-if="loading" type="list" :count="3" />
        <div v-else-if="onboardingProgress.length === 0" class="py-8 text-center">
          <ClipboardDocumentListIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-500">{{ t('dashboard.trainer.noOnboardings') }}</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="ob in onboardingProgress"
            :key="ob.id"
            class="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            @click="router.push(`/trainer/onboarding/${ob.id}`)"
          >
            <div class="flex items-center justify-between mb-1">
              <p class="text-sm font-medium text-gray-900 truncate max-w-[70%]">
                {{ ob.client?.company_name || ob.request_code }}
              </p>
              <span class="text-xs font-bold text-gray-700">{{ Math.round(ob.progress_percentage) }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="bg-primary h-2 rounded-full transition-all" :style="{ width: `${ob.progress_percentage}%` }"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ ob.system?.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Appointments (full list, below 2-col grid) -->
<!--    <div v-if="uiPrefs.trainerWidgets.upcoming">-->
<!--      <div class="flex items-center justify-between mb-3">-->
<!--        <h2 class="text-lg font-semibold text-gray-900">{{ t('dashboard.trainer.upcoming') }}</h2>-->
<!--        <router-link to="/trainer/appointments" class="text-sm text-primary hover:underline">{{ t('common.viewAll') }}</router-link>-->
<!--      </div>-->
<!--      <SkeletonLoader v-if="loading" type="list" :count="3" />-->
<!--      <div v-else-if="upcomingAppointments.length === 0" class="text-center py-12 bg-white rounded-xl border border-gray-200">-->
<!--        <CalendarDaysIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />-->
<!--        <p class="text-sm font-medium text-gray-500">{{ t('dashboard.trainer.noUpcoming') }}</p>-->
<!--      </div>-->
<!--      <div v-else class="space-y-3">-->
<!--        <div-->
<!--          v-for="appt in upcomingAppointments"-->
<!--          :key="appt.id"-->
<!--          class="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"-->
<!--          @click="router.push(`/trainer/appointments/${appt.id}`)"-->
<!--        >-->
<!--          <div class="flex items-start justify-between">-->
<!--            <div class="flex-1 min-w-0">-->
<!--              <h3 class="text-sm font-semibold text-gray-900 truncate">{{ appt.title }}</h3>-->
<!--              <p class="text-xs text-gray-500 mt-0.5">-->
<!--                {{ formatDate(appt.scheduled_date) }} · {{ formatTime(appt.scheduled_start_time) }}-->
<!--                · <span class="capitalize">{{ appt.location_type }}</span>-->
<!--              </p>-->
<!--              <p class="text-xs text-gray-500 truncate mt-0.5">{{ appt.client?.company_name }}</p>-->
<!--            </div>-->
<!--            <StatusBadge :status="appt.status" />-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

    <div class="h-20 lg:hidden"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  PlusIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/vue/24/outline'
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useTrainerStore } from '@/modules/trainer/store/trainer.js'
import { useUiPreferences } from '@/modules/shared/store/uiPreferences.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import Avatar from '@/modules/shared/components/Avatar.vue'
import StatsCard from '@/modules/trainer/components/StatsCard.vue'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const trainerStore = useTrainerStore()
const uiPrefs = useUiPreferences()
const { formatDateMed: formatDate, formatTime } = useDateTime()

const loading = ref(true)
const customizeOpen = ref(false)
const customizeRef = ref(null)

const trainerWidgetList = computed(() => [
  { key: 'stats', label: t('dashboard.trainer.widgets.stats') },
  { key: 'schedule', label: t('dashboard.trainer.widgets.schedule') },
  { key: 'onboarding', label: t('dashboard.trainer.widgets.onboarding') },
  { key: 'upcoming', label: t('dashboard.trainer.widgets.upcoming') },
])

function handleClickOutside(e) {
  if (customizeRef.value && !customizeRef.value.contains(e.target)) {
    customizeOpen.value = false
  }
}

const summary = computed(() => trainerStore.dashboardData?.summary || {
  total_appointments: 0,
  appointments_today: 0,
  onboarding_in_progress: 0,
  lessons_sent_this_month: 0
})
const upcomingAppointments = computed(() => trainerStore.dashboardData?.upcoming_appointments || [])
const onboardingProgress = computed(() => trainerStore.dashboardData?.onboarding_progress || [])

const todayAppointments = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return upcomingAppointments.value
    .filter(a => a.scheduled_date === today)
    .sort((a, b) => (a.scheduled_start_time || '').localeCompare(b.scheduled_start_time || ''))
})

onMounted(async () => {
  document.addEventListener('mousedown', handleClickOutside)
  try {
    await trainerStore.fetchDashboard()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>
