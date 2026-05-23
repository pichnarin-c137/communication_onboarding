<template>
  <div class="space-y-5 mt-3">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ t('dashboard.sale.title') }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ t('dashboard.sale.subtitle') }}</p>
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
            {{ t('dashboard.sale.customize') }}
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
                  @click="uiPrefs.resetSaleWidgets()"
                  class="text-xs text-primary hover:underline"
                >Reset</button>
              </div>
              <ul class="py-1">
                <li
                  v-for="widget in saleWidgetList"
                  :key="widget.key"
                  class="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                  @click="uiPrefs.toggleSaleWidget(widget.key)"
                >
                  <span class="text-sm text-gray-700">{{ widget.label }}</span>
                  <button
                    type="button"
                    class="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 pointer-events-none"
                    :class="uiPrefs.saleWidgets[widget.key] ? 'bg-primary' : 'bg-gray-200'"
                  >
                    <span
                      class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200"
                      :class="uiPrefs.saleWidgets[widget.key] ? 'translate-x-4' : 'translate-x-0'"
                    />
                  </button>
                </li>
              </ul>
            </div>
          </Transition>
        </div>

        <router-link
          to="/sales/appointments/create"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <PlusIcon class="w-4 h-4" />
          {{ t('dashboard.sale.newAppointment') }}
        </router-link>
      </div>
    </div>

    <!-- Summary Cards -->
    <template v-if="uiPrefs.saleWidgets.stats">
      <SkeletonLoader v-if="loading" type="cards" :count="4" />
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Appointments"
          :value="summary.total_appointments"
          subtitle="all time"
          :icon="CalendarDaysIcon"
          color="blue"
        />
        <SummaryCard
          title="Demo Appointments"
          :value="summary.demo_appointments"
          subtitle="product demos"
          :icon="PresentationChartLineIcon"
          color="yellow"
        />
        <SummaryCard
          title="Training Appointments"
          :value="summary.training_appointments"
          subtitle="training sessions"
          :icon="AcademicCapIcon"
          color="purple"
        />
        <SummaryCard
          title="Onboardings Completed"
          :value="summary.onboarding_completed"
          subtitle="fully onboarded clients"
          :icon="CheckCircleIcon"
          color="green"
        />
      </div>
    </template>

    <!-- Charts Row -->
    <div v-if="!loading && uiPrefs.saleWidgets.charts" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Bar Chart: Appointments by Type -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ t('dashboard.sale.appointmentsByType') }}</h3>
        <Bar :data="barChartData" :options="barChartOptions" class="max-h-52" />
      </div>

      <!-- Donut Chart: Onboarding Status -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ t('dashboard.sale.onboardingStatus') }}</h3>
        <div class="flex items-center justify-center">
          <Doughnut :data="donutChartData" :options="donutChartOptions" class="max-h-52" />
        </div>
      </div>
    </div>

    <!-- My Trainers widget -->
    <MyTrainersDashboardWidget v-if="!loading && uiPrefs.saleWidgets.myTrainers" />

    <!-- Two-column section: Upcoming + Onboarding Progress -->
    <div
        v-if="uiPrefs.saleWidgets.upcoming || uiPrefs.saleWidgets.onboarding"
        class="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      <!-- Upcoming Appointments -->
      <div v-if="uiPrefs.saleWidgets.upcoming" class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">{{ t('dashboard.sale.upcoming') }}</h3>
          <router-link to="/sales/appointments" class="text-xs text-primary hover:underline">
            {{ t('common.viewAll') }}
          </router-link>
        </div>
        <SkeletonLoader v-if="loading" type="list" :count="3" />
        <div v-else-if="upcomingAppointments.length === 0" class="py-8 text-center">
          <CalendarDaysIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-500">{{ t('dashboard.sale.noUpcoming') }}</p>
        </div>
        <div v-else class="space-y-3">
          <div
              v-for="appt in upcomingAppointments"
              :key="appt.id"
              class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              @click="router.push(`/sales/appointments/${appt.id}`)"
          >
            <div class="mt-0.5">
              <CalendarDaysIcon class="w-4 h-4 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ appt.title }}</p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ formatDate(appt.scheduled_date) }}
                · {{ formatTime(appt.scheduled_start_time) }}
              </p>
              <p class="text-xs text-gray-500 truncate">{{ appt.client?.company_name }}</p>
            </div>
            <StatusBadge :status="appt.status" size="xs" />
          </div>
        </div>
      </div>

      <!-- Onboarding Progress -->
      <div v-if="uiPrefs.saleWidgets.onboarding" class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">{{ t('dashboard.sale.activeOnboardings') }}</h3>
          <router-link to="/sales/onboarding" class="text-xs text-primary hover:underline">
            {{ t('common.viewAll') }}
          </router-link>
        </div>
        <SkeletonLoader v-if="loading" type="list" :count="3" />
        <div v-else-if="onboardingProgress.length === 0" class="py-8 text-center">
          <ChartBarIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-500">{{ t('dashboard.sale.noOnboardings') }}</p>
        </div>
        <div v-else class="space-y-4">
          <div
              v-for="ob in onboardingProgress"
              :key="ob.id"
              class="cursor-pointer"
              @click="router.push(`/sales/onboarding/${ob.id}`)"
          >
            <div class="flex items-center justify-between mb-1">
              <p class="text-sm font-medium text-gray-900 truncate max-w-[70%]">
                {{ ob.client?.company_name || ob.request_code }}
              </p>
              <span class="text-xs font-semibold text-gray-700">
                {{ Math.round(ob.progress_percentage) }}%
              </span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                  class="bg-primary h-2 rounded-full transition-all"
                  :style="{ width: `${ob.progress_percentage}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ ob.system?.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  PlusIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  AcademicCapIcon,
  PresentationChartLineIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'
import { useSaleStore } from '@/modules/sale/store/sale.js'
import { useUiPreferences } from '@/modules/shared/store/uiPreferences.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import SummaryCard from '@/modules/sale/components/SummaryCard.vue'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import MyTrainersDashboardWidget from '@/modules/sale/components/MyTrainersDashboardWidget.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const router = useRouter()
const { t } = useI18n()
const saleStore = useSaleStore()
const uiPrefs = useUiPreferences()
const { formatDateMed: formatDate, formatTime } = useDateTime()

const loading = ref(true)
const customizeOpen = ref(false)
const customizeRef = ref(null)

const saleWidgetList = computed(() => [
  { key: 'stats', label: t('dashboard.sale.widgets.stats') },
  { key: 'upcoming', label: t('dashboard.sale.widgets.upcoming') },
  { key: 'onboarding', label: t('dashboard.sale.widgets.onboarding') },
  { key: 'charts', label: t('dashboard.sale.widgets.charts') },
  { key: 'myTrainers', label: 'My Trainers' },
])

function handleClickOutside(e) {
  if (customizeRef.value && !customizeRef.value.contains(e.target)) {
    customizeOpen.value = false
  }
}

const summary = computed(() => saleStore.dashboardData?.summary || {
  total_appointments: 0,
  demo_appointments: 0,
  training_appointments: 0,
  onboarding_completed: 0
})
const upcomingAppointments = computed(() => saleStore.dashboardData?.upcoming_appointments || [])
const onboardingProgress = computed(() => saleStore.dashboardData?.onboarding_progress || [])

const barChartData = computed(() => ({
  labels: ['Demo', 'Training'],
  datasets: [{
    label: 'Appointments',
    data: [summary.value.demo_appointments, summary.value.training_appointments],
    backgroundColor: ['#F59E0B', '#3B82F6'],
    borderRadius: 6,
    borderSkipped: false,
  }]
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#F3F4F6' } },
    x: { grid: { display: false } }
  }
}

const donutChartData = computed(() => {
  const progress = onboardingProgress.value
  const inProgress = progress.filter(o => o.status === 'in_progress').length
  const completed = progress.filter(o => o.status === 'completed').length
  const cancelled = progress.filter(o => o.status === 'cancelled').length
  const total = inProgress + completed + cancelled
  return {
    labels: ['In Progress', 'Completed', 'Cancelled'],
    datasets: [{
      data: total > 0 ? [inProgress, completed, cancelled] : [1, 0, 0],
      backgroundColor: ['#3B82F6', '#10B981', '#EF4444'],
      borderWidth: 0,
    }]
  }
})

const donutChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } }
  },
  cutout: '65%'
}

onMounted(async () => {
  document.addEventListener('mousedown', handleClickOutside)
  try {
    await saleStore.fetchDashboard()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>
