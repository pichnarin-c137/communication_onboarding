<template>
  <div class="space-y-5 mt-3">
    <!-- Greeting Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Avatar :name="authStore.user?.first_name + ' ' + authStore.user?.last_name" size="xl" />
        <div>
          <p class="text-sm text-gray-500">Welcome back,</p>
          <h1 class="text-xl font-bold text-gray-900">{{ authStore.user?.first_name }}</h1>
        </div>
      </div>
      <button
        @click="loadNotifications"
        class="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <BellIcon class="w-6 h-6" />
        <span v-if="notificationStore.unreadCount > 0" class="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white text-[10px] text-white font-bold flex items-center justify-center px-0.5">
          {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
        </span>
      </button>
    </div>

    <!-- Notifications Panel -->
    <div v-if="showNotifications" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
        <div class="flex items-center gap-2">
          <button v-if="notificationStore.unreadCount > 0" @click="notificationStore.markAllAsRead()" class="text-xs text-primary hover:underline">
            Mark all read
          </button>
          <button @click="showNotifications = false" class="p-1 text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
      <div v-if="notificationStore.loading" class="p-4 space-y-2">
        <div v-for="i in 3" :key="i" class="h-12 bg-gray-100 rounded animate-pulse"></div>
      </div>
      <div v-else-if="notificationStore.notifications.length === 0" class="py-8 text-center">
        <p class="text-sm text-gray-500">No notifications</p>
      </div>
      <div v-else class="divide-y divide-gray-50 max-h-64 overflow-y-auto">
        <div
          v-for="n in notificationStore.notifications"
          :key="n.id"
          :class="['px-4 py-3 text-sm transition-colors cursor-pointer', n.is_read ? 'text-gray-500' : 'bg-blue-50/50 text-gray-900']"
          @click="notificationStore.markAsRead(n.id)"
        >
          <p class="font-medium">{{ n.title }}</p>
          <p class="text-xs mt-0.5 line-clamp-2">{{ n.message }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ formatNotificationTime(n.created_at) }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
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

    <!-- Two-column: Today's Schedule + Active Onboardings -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Today's Schedule -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-900">Today's Schedule</h2>
          <router-link to="/trainer/appointments" class="text-xs text-primary hover:underline">View all</router-link>
        </div>
        <SkeletonLoader v-if="loading" type="list" :count="3" />
        <div v-else-if="todayAppointments.length === 0" class="py-8 text-center">
          <CalendarDaysIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-400">No appointments today</p>
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
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-900">Active Onboardings</h2>
          <router-link to="/trainer/onboarding" class="text-xs text-primary hover:underline">View all</router-link>
        </div>
        <SkeletonLoader v-if="loading" type="list" :count="3" />
        <div v-else-if="onboardingProgress.length === 0" class="py-8 text-center">
          <ClipboardDocumentListIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-400">No active onboardings</p>
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
            <p class="text-xs text-gray-400 mt-1">{{ ob.system?.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Appointments (full list, below 2-col grid) -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
        <router-link to="/trainer/appointments" class="text-sm text-primary hover:underline">View all</router-link>
      </div>
      <SkeletonLoader v-if="loading" type="list" :count="3" />
      <div v-else-if="upcomingAppointments.length === 0" class="text-center py-12 bg-white rounded-xl border border-gray-200">
        <CalendarDaysIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-sm font-medium text-gray-500">No upcoming appointments</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="appt in upcomingAppointments"
          :key="appt.id"
          class="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          @click="router.push(`/trainer/appointments/${appt.id}`)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-gray-900 truncate">{{ appt.title }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ formatDate(appt.scheduled_date) }} · {{ formatTime(appt.scheduled_start_time) }}
                · <span class="capitalize">{{ appt.location_type }}</span>
              </p>
              <p class="text-xs text-gray-400 truncate mt-0.5">{{ appt.client?.company_name }}</p>
            </div>
            <StatusBadge :status="appt.status" />
          </div>
        </div>
      </div>
    </div>

    <div class="h-20 lg:hidden"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BellIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'
import { CheckBadgeIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useTrainerStore } from '@/modules/trainer/store/trainer.js'
import { useNotificationStore } from '@/modules/shared/store/notifications.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import Avatar from '@/modules/shared/components/Avatar.vue'
import StatsCard from '@/modules/trainer/components/StatsCard.vue'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const router = useRouter()
const authStore = useAuthStore()
const trainerStore = useTrainerStore()
const notificationStore = useNotificationStore()
const { formatDateMed: formatDate, formatTime, formatDateTimeFromISO } = useDateTime()

const showNotifications = ref(false)
const loading = ref(true)

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

function formatNotificationTime(isoStr) {
  return formatDateTimeFromISO(isoStr)
}

async function loadNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    await notificationStore.fetchNotifications()
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      trainerStore.fetchDashboard(),
      notificationStore.fetchUnreadCount()
    ])
  } finally {
    loading.value = false
  }
})
</script>
