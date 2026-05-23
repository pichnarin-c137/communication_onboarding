<template>
  <div class="space-y-5">
    <!-- Top KPIs -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">Performance summary</h2>
        <p class="text-xs text-gray-500">vs previous period</p>
      </header>

      <SkeletonLoader v-if="overview.loading && !overview.data" type="cards" :count="4" />

      <EmptyAnalyticsState
        v-else-if="overview.error"
        :title="overview.error"
        description="Check your connection or widen the date range."
      />

      <KpiCardGrid v-else-if="kpis" :cols="4">
        <KpiCard
          v-for="card in kpiCards"
          :key="card.key"
          :label="card.label"
          :value="kpis[card.key]?.value"
          :previous="kpis[card.key]?.previous"
          :delta-pct="kpis[card.key]?.delta_pct"
          :good-direction="kpis[card.key]?.good_direction || card.goodDirection"
          :format="card.format"
        />
      </KpiCardGrid>
    </section>

    <!-- Trend chart -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">Trend</h2>
        <div class="inline-flex bg-gray-100 rounded-lg p-0.5">
          <button
            v-for="opt in metricOptions"
            :key="opt.value"
            type="button"
            @click="setMetric(opt.value)"
            :class="[
              'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
              metric === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </header>

      <SkeletonLoader v-if="trends.loading && !trends.data" type="cards" :count="1" />

      <TrendLineChart
        v-else
        exportable
        :title="activeMetricLabel"
        :subtitle="metricSubtitle"
        :series="trends.data?.series || []"
        :compare-series="store.filters.compare === 'none' ? [] : trends.data?.compare_series || []"
        :format="activeMetricFormat"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import KpiCard from '@/modules/shared/components/analytics/KpiCard.vue'
import KpiCardGrid from '@/modules/shared/components/analytics/KpiCardGrid.vue'
import TrendLineChart from '@/modules/shared/components/analytics/TrendLineChart.vue'
import EmptyAnalyticsState from '@/modules/shared/components/analytics/EmptyAnalyticsState.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const props = defineProps({
  role: { type: String, default: 'admin' }, // admin | sale | trainer
})

const store = useAnalyticsStore()
const overview = computed(() => store.slots.overview)
const trends = computed(() => store.slots.trends)

const kpis = computed(() => overview.value.data?.kpis)

const kpiCards = computed(() => {
  const base = [
    { key: 'appointments_completed', label: 'Appointments completed', format: 'number', goodDirection: 'up' },
    { key: 'completion_rate', label: 'Completion rate', format: 'percent', goodDirection: 'up' },
    { key: 'avg_rating', label: 'Avg rating', format: 'rating', goodDirection: 'up' },
    { key: 'cancellation_rate', label: 'Cancellation rate', format: 'percent', goodDirection: 'down' },
    { key: 'onboardings_active', label: 'Active onboardings', format: 'number', goodDirection: 'up' },
    { key: 'onboardings_completed', label: 'Onboardings completed', format: 'number', goodDirection: 'up' },
    { key: 'avg_onboarding_duration_h', label: 'Avg onboarding duration', format: 'duration', goodDirection: 'down' },
  ]
  if (props.role === 'trainer') {
    base.push({ key: 'on_time_start_rate', label: 'On-time start rate', format: 'percent', goodDirection: 'up' })
  } else {
    base.push({ key: 'feedback_response_rate', label: 'Feedback response rate', format: 'percent', goodDirection: 'up' })
  }
  return base
})

const metricOptions = [
  { value: 'completion_rate', label: 'Completion %' },
  { value: 'appointments_completed', label: 'Completed' },
  { value: 'cancellation_rate', label: 'Cancellation %' },
  { value: 'onboardings_completed', label: 'Onboardings' },
  { value: 'avg_rating', label: 'Avg rating' },
]

const metric = ref('completion_rate')

const activeMetricLabel = computed(
  () => metricOptions.find((m) => m.value === metric.value)?.label || 'Trend',
)

const activeMetricFormat = computed(() => {
  switch (metric.value) {
    case 'completion_rate':
    case 'cancellation_rate':
      return 'percent'
    case 'avg_rating':
      return 'rating'
    default:
      return 'number'
  }
})

const metricSubtitle = computed(() => {
  const map = {
    completion_rate: 'Percentage of appointments marked done out of total per bucket',
    cancellation_rate: 'Percentage of appointments cancelled per bucket',
    appointments_completed: 'Count of completed appointments per bucket',
    onboardings_completed: 'Count of onboardings marked complete per bucket',
    avg_rating: 'Average feedback rating per bucket',
  }
  return map[metric.value] || ''
})

function setMetric(m) {
  metric.value = m
  void store.fetchTrends(m)
}

async function loadAll() {
  await Promise.allSettled([store.fetchOverview(), store.fetchTrends(metric.value)])
}

onMounted(loadAll)

watch(
  () => store.filters,
  () => loadAll(),
  { deep: true },
)
</script>
