<template>
  <div class="space-y-5 mt-3">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage your appointments and onboarding progress</p>
      </div>
      <router-link
        to="/sales/appointments/create"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
      >
        <PlusIcon class="w-4 h-4" />
        New Appointment
      </router-link>
    </div>

    <!-- Summary Cards -->
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

    <!-- Two-column section: Upcoming + Onboarding Progress -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Upcoming Appointments -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">Upcoming Appointments</h3>
          <router-link to="/sales/appointments" class="text-xs text-primary hover:underline">
            View all
          </router-link>
        </div>
        <SkeletonLoader v-if="loading" type="list" :count="3" />
        <div v-else-if="upcomingAppointments.length === 0" class="py-8 text-center">
          <CalendarDaysIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-400">No upcoming appointments</p>
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
              <p class="text-xs text-gray-400 truncate">{{ appt.client?.company_name }}</p>
            </div>
            <StatusBadge :status="appt.status" size="xs" />
          </div>
        </div>
      </div>

      <!-- Onboarding Progress -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">Active Onboardings</h3>
          <router-link to="/sales/onboarding" class="text-xs text-primary hover:underline">
            View all
          </router-link>
        </div>
        <SkeletonLoader v-if="loading" type="list" :count="3" />
        <div v-else-if="onboardingProgress.length === 0" class="py-8 text-center">
          <ChartBarIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-400">No active onboardings</p>
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
            <p class="text-xs text-gray-400 mt-1">{{ ob.system?.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Bar Chart: Appointments by Type -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Appointments by Type</h3>
        <Bar :data="barChartData" :options="barChartOptions" class="max-h-52" />
      </div>

      <!-- Donut Chart: Onboarding Status -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Onboarding Status</h3>
        <div class="flex items-center justify-center">
          <Doughnut :data="donutChartData" :options="donutChartOptions" class="max-h-52" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  PlusIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  AcademicCapIcon,
  PresentationChartLineIcon
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
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import SummaryCard from '@/modules/sale/components/SummaryCard.vue'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const router = useRouter()
const saleStore = useSaleStore()
const { formatDateMed: formatDate, formatTime } = useDateTime()

const loading = ref(true)
const summary = computed(() => saleStore.dashboardData?.summary || {
  total_appointments: 0,
  demo_appointments: 0,
  training_appointments: 0,
  onboarding_completed: 0
})
const upcomingAppointments = computed(() => saleStore.dashboardData?.upcoming_appointments || [])
const onboardingProgress = computed(() => saleStore.dashboardData?.onboarding_progress || [])

// Bar chart: demo vs training counts
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

// Donut chart: onboarding statuses derived from list
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
  try {
    await saleStore.fetchDashboard()
  } finally {
    loading.value = false
  }
})
</script>
