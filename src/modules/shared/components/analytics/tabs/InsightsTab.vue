<template>
  <div class="space-y-8">
    <!-- ============ Sentiment ============ -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-sm font-semibold text-gray-900">Comment sentiment</h2>
          <p class="text-xs text-gray-500">What clients are actually saying in their feedback</p>
        </div>
      </header>

      <SkeletonLoader v-if="sentimentSlot.loading && !sentiment" type="cards" :count="3" />

      <EmptyAnalyticsState
        v-else-if="sentimentSlot.error"
        :title="sentimentSlot.error"
        description="Couldn't load sentiment for this range."
      />

      <EmptyAnalyticsState
        v-else-if="sentiment && !sentiment.summary?.analyzed_count"
        title="No analyzed comments yet"
        description="Once clients leave written feedback in this range, sentiment appears here."
      />

      <template v-else-if="sentiment">
        <!-- Summary strip -->
        <KpiCardGrid :cols="3">
          <!-- Sentiment score (custom — score is [-1, 1]) -->
          <div class="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-2">
            <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Sentiment score</span>
            <div class="flex items-end gap-2">
              <span class="text-2xl font-semibold leading-tight" :class="scoreTone">
                {{ formatScore(sentiment.summary.sentiment_score) }}
              </span>
              <span class="text-xs font-medium mb-0.5" :class="scoreTone">{{ scoreLabel }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <ComparisonPill :delta-pct="sentiment.summary.delta_pct" good-direction="up" />
              <span class="text-gray-400">scale −1 to +1</span>
            </div>
          </div>

          <KpiCard
            label="Comments analyzed"
            :value="sentiment.summary.analyzed_count"
            format="number"
          />

          <!-- Mix bar -->
          <div class="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-2.5">
            <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Sentiment mix</span>
            <div class="flex items-center gap-1 h-2.5">
              <div class="h-full rounded-l-full bg-emerald-500" :style="{ width: `${(sentiment.summary.positive_pct || 0) * 100}%` }" />
              <div class="h-full bg-amber-400" :style="{ width: `${(sentiment.summary.neutral_pct || 0) * 100}%` }" />
              <div class="h-full rounded-r-full bg-rose-500" :style="{ width: `${(sentiment.summary.negative_pct || 0) * 100}%` }" />
            </div>
            <div class="flex items-center justify-between text-[10px] text-gray-500">
              <span>{{ pct(sentiment.summary.positive_pct) }} positive</span>
              <span>{{ pct(sentiment.summary.neutral_pct) }} neutral</span>
              <span>{{ pct(sentiment.summary.negative_pct) }} negative</span>
            </div>
          </div>
        </KpiCardGrid>

        <!-- Themes + representative quotes -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <!-- Themes -->
          <div class="bg-white border border-gray-200 rounded-xl p-5">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Recurring themes</h3>
            <ul v-if="sentiment.themes?.length" class="space-y-3">
              <li v-for="t in sentiment.themes" :key="t.theme" class="flex items-start gap-3">
                <span class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" :style="{ backgroundColor: themeColor(t.sentiment) }" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900">{{ t.label }}</span>
                    <span class="text-[10px] text-gray-400">{{ t.mentions }} {{ t.mentions === 1 ? 'mention' : 'mentions' }}</span>
                    <component :is="trendIcon(t.trend)" class="w-3 h-3" :class="trendTone(t.trend)" />
                  </div>
                  <p v-if="t.sample_quote" class="text-xs text-gray-500 italic mt-0.5 truncate">"{{ t.sample_quote }}"</p>
                </div>
              </li>
            </ul>
            <p v-else class="text-xs text-gray-400 py-6 text-center">No recurring themes detected.</p>
          </div>

          <!-- Representative quotes -->
          <div class="space-y-3">
            <div class="bg-white border border-gray-200 rounded-xl p-4">
              <h3 class="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">What's working</h3>
              <div v-if="positiveQuotes.length" class="space-y-2.5">
                <div v-for="(q, i) in positiveQuotes" :key="`p-${i}`" class="flex items-start gap-2">
                  <div class="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                    <StarIcon v-for="n in 5" :key="n" class="w-3 h-3" :class="n <= q.rating ? 'text-amber-400' : 'text-gray-200'" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs text-gray-700">"{{ q.comment || 'No comment' }}"</p>
                    <p class="text-[10px] text-gray-400 mt-0.5">{{ q.client_name || '—' }}{{ quoteDate(q.submitted_at) }}</p>
                  </div>
                </div>
              </div>
              <p v-else class="text-xs text-gray-400">No standout positive comments yet.</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-xl p-4">
              <h3 class="text-xs font-semibold text-rose-700 uppercase tracking-wide mb-2">Needs attention</h3>
              <div v-if="negativeQuotes.length" class="space-y-2.5">
                <div v-for="(q, i) in negativeQuotes" :key="`n-${i}`" class="flex items-start gap-2">
                  <div class="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                    <StarIcon v-for="n in 5" :key="n" class="w-3 h-3" :class="n <= q.rating ? 'text-amber-400' : 'text-gray-200'" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs text-gray-700">"{{ q.comment || 'No comment' }}"</p>
                    <p class="text-[10px] text-gray-400 mt-0.5">{{ q.client_name || '—' }}{{ quoteDate(q.submitted_at) }}</p>
                  </div>
                </div>
              </div>
              <p v-else class="text-xs text-gray-400">No negative comments in this range.</p>
            </div>
          </div>
        </div>
      </template>
    </section>

    <!-- ============ Anomalies ============ -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-sm font-semibold text-gray-900">Anomaly detection</h2>
          <p class="text-xs text-gray-500">Metrics that drifted off their recent baseline</p>
        </div>
      </header>

      <SkeletonLoader v-if="anomaliesSlot.loading && !anomalies" type="cards" :count="3" />

      <EmptyAnalyticsState
        v-else-if="anomaliesSlot.error"
        :title="anomaliesSlot.error"
        description="Couldn't run anomaly detection for this range."
      />

      <template v-else-if="anomalies">
        <div
          v-if="!anomalies.anomalies?.length"
          class="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl"
        >
          <CheckCircleIcon class="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p class="text-sm text-emerald-700">
            All monitored metrics are within their normal range. Nothing needs attention.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnomalyCard v-for="(a, i) in anomalies.anomalies" :key="`${a.metric}-${a.bucket}-${i}`" :anomaly="a" />
        </div>

        <p class="text-[11px] text-gray-400 mt-2">
          Baseline: {{ anomalies.baseline_window?.buckets || 0 }} prior {{ store.filters.group_by }}s · monitoring
          {{ (anomalies.metrics_monitored || []).length }} metrics
        </p>
      </template>
    </section>

    <!-- ============ Cohorts ============ -->
    <section>
      <header class="flex items-center justify-between mb-3 gap-3">
        <div>
          <h2 class="text-sm font-semibold text-gray-900">Onboarding cohorts</h2>
          <p class="text-xs text-gray-500">How fast each cohort reaches completion</p>
        </div>
        <div class="inline-flex bg-gray-100 rounded-lg p-0.5">
          <button
            v-for="opt in ['month', 'week']"
            :key="opt"
            type="button"
            @click="cohortBy = opt"
            :class="[
              'px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors',
              cohortBy === opt ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            {{ opt }}
          </button>
        </div>
      </header>

      <SkeletonLoader v-if="cohortsSlot.loading && !cohorts" type="cards" :count="1" />
      <EmptyAnalyticsState
        v-else-if="cohortsSlot.error"
        :title="cohortsSlot.error"
        description="Couldn't build cohorts for this range."
      />
      <CohortGrid v-else :cohorts="cohorts?.cohorts || []" :cohort-by="cohorts?.cohort_by || cohortBy" />
    </section>

    <!-- ============ Forecast ============ -->
    <section>
      <header class="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div>
          <h2 class="text-sm font-semibold text-gray-900">Forecast</h2>
          <p class="text-xs text-gray-500">Projection for the next few periods, with a confidence band</p>
        </div>
        <select
          v-model="forecastMetric"
          class="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-primary"
        >
          <option v-for="m in forecastMetrics" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </header>

      <SkeletonLoader v-if="forecastSlot.loading && !forecast" type="cards" :count="1" />
      <EmptyAnalyticsState
        v-else-if="forecastSlot.error"
        :title="forecastSlot.error"
        description="Couldn't generate a forecast for this metric."
      />
      <ForecastChart
        v-else
        exportable
        :title="activeForecastMetric.label"
        :subtitle="`Next ${forecast?.horizon || 4} ${store.filters.group_by}s projected`"
        :history="forecast?.history || []"
        :forecast="forecast?.forecast || []"
        :model="forecast?.model || {}"
        :method="forecast?.method || ''"
        :format="activeForecastMetric.format"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusSmallIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/vue/20/solid'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import KpiCard from '@/modules/shared/components/analytics/KpiCard.vue'
import KpiCardGrid from '@/modules/shared/components/analytics/KpiCardGrid.vue'
import ComparisonPill from '@/modules/shared/components/analytics/ComparisonPill.vue'
import AnomalyCard from '@/modules/shared/components/analytics/AnomalyCard.vue'
import CohortGrid from '@/modules/shared/components/analytics/CohortGrid.vue'
import ForecastChart from '@/modules/shared/components/analytics/ForecastChart.vue'
import EmptyAnalyticsState from '@/modules/shared/components/analytics/EmptyAnalyticsState.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

defineProps({ role: { type: String, default: 'admin' } })

const store = useAnalyticsStore()

const sentimentSlot = computed(() => store.slots.sentiment)
const anomaliesSlot = computed(() => store.slots.anomalies)
const cohortsSlot = computed(() => store.slots.cohorts)
const forecastSlot = computed(() => store.slots.forecast)

const sentiment = computed(() => sentimentSlot.value.data)
const anomalies = computed(() => anomaliesSlot.value.data)
const cohorts = computed(() => cohortsSlot.value.data)
const forecast = computed(() => forecastSlot.value.data)

// ---- Sentiment helpers ----
function pct(v) {
  return `${Math.round((v || 0) * 100)}%`
}
function formatScore(v) {
  if (v === null || v === undefined) return '—'
  return (v > 0 ? '+' : '') + Number(v).toFixed(2)
}
const scoreLabel = computed(() => {
  const s = sentiment.value?.summary?.sentiment_score ?? 0
  if (s > 0.2) return 'Positive'
  if (s < -0.2) return 'Negative'
  return 'Neutral'
})
const scoreTone = computed(() => {
  const s = sentiment.value?.summary?.sentiment_score ?? 0
  if (s > 0.2) return 'text-emerald-600'
  if (s < -0.2) return 'text-rose-600'
  return 'text-gray-600'
})
function themeColor(s) {
  if (s > 0.2) return '#10B981'
  if (s < -0.2) return '#F43F5E'
  return '#9CA3AF'
}
function trendIcon(trend) {
  if (trend === 'up') return ArrowTrendingUpIcon
  if (trend === 'down') return ArrowTrendingDownIcon
  return MinusSmallIcon
}
function trendTone(trend) {
  if (trend === 'up') return 'text-gray-400'
  if (trend === 'down') return 'text-gray-400'
  return 'text-gray-300'
}
const positiveQuotes = computed(() => sentiment.value?.representative?.positive || [])
const negativeQuotes = computed(() => sentiment.value?.representative?.negative || [])

// Backend timestamps are "YYYY-MM-DD HH:mm:ss" — normalise before parsing.
function quoteDate(submittedAt) {
  if (!submittedAt) return ''
  const d = new Date(String(submittedAt).replace(' ', 'T'))
  return Number.isNaN(d.getTime()) ? '' : ` · ${d.toLocaleDateString()}`
}

// ---- Cohort control ----
const cohortBy = ref('month')

// ---- Forecast control ----
const forecastMetrics = [
  { value: 'onboardings_completed', label: 'Onboardings completed', format: 'number' },
  { value: 'onboardings_created', label: 'Onboardings created', format: 'number' },
  { value: 'appointments_completed', label: 'Appointments completed', format: 'number' },
  { value: 'appointments_created', label: 'Appointments created', format: 'number' },
  { value: 'completion_rate', label: 'Completion rate', format: 'percent' },
  { value: 'avg_rating', label: 'Average rating', format: 'rating' },
]
const forecastMetric = ref('onboardings_completed')
const activeForecastMetric = computed(
  () => forecastMetrics.find((m) => m.value === forecastMetric.value) || forecastMetrics[0],
)

// ---- Loaders ----
function loadCohorts() {
  void store.fetchCohorts({ cohort_by: cohortBy.value })
}
function loadForecast() {
  void store.fetchForecast({ metric: forecastMetric.value })
}
function loadAll() {
  void store.fetchSentiment()
  void store.fetchAnomalies()
  loadCohorts()
  loadForecast()
}

onMounted(loadAll)
watch(() => store.filters, loadAll, { deep: true })
watch(cohortBy, loadCohorts)
watch(forecastMetric, loadForecast)
</script>
