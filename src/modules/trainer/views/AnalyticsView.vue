<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-3">
        <Avatar :name="trainerName" size="lg" />
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My scorecard</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Your personal performance — only you can see this
          </p>
        </div>
      </div>
    </div>

    <!-- Date range -->
    <FilterBar
      :filters="store.filters"
      :show-group-by="false"
      :show-location="false"
      @range-change="onRangeChange"
      @change="onFilterChange"
      @reset="store.resetFilters"
    />

    <SkeletonLoader v-if="loading && !data" type="cards" :count="4" />

    <EmptyAnalyticsState
      v-else-if="slot.error"
      :title="slot.error"
      description="We couldn't load your scorecard. Try again in a moment."
    />

    <template v-else-if="data">
      <!-- KPIs -->
      <KpiCardGrid :cols="5">
        <KpiCard
          label="Completed"
          :value="kpis.completed_count?.value"
          :previous="kpis.completed_count?.previous"
          :delta-pct="kpis.completed_count?.delta_pct"
          good-direction="up"
          format="number"
        />
        <KpiCard
          label="Completion rate"
          :value="kpis.completion_rate?.value"
          :previous="kpis.completion_rate?.previous"
          :delta-pct="kpis.completion_rate?.delta_pct"
          good-direction="up"
          format="percent"
        />
        <KpiCard
          label="Avg rating"
          :value="kpis.avg_rating?.value"
          :previous="kpis.avg_rating?.previous"
          :delta-pct="kpis.avg_rating?.delta_pct"
          good-direction="up"
          format="rating"
        />
        <KpiCard
          label="On-time rate"
          :value="kpis.on_time_rate?.value"
          :previous="kpis.on_time_rate?.previous"
          :delta-pct="kpis.on_time_rate?.delta_pct"
          good-direction="up"
          format="percent"
        />
        <KpiCard
          label="Active onboardings"
          :value="kpis.active_onboardings?.value"
          :previous="kpis.active_onboardings?.previous"
          :delta-pct="kpis.active_onboardings?.delta_pct"
          good-direction="up"
          format="number"
        />
      </KpiCardGrid>

      <!-- Suggestions -->
      <div
        v-if="suggestions.length"
        class="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-1.5"
      >
        <div class="flex items-center gap-2">
          <SparklesIcon class="w-4 h-4 text-primary" />
          <span class="text-sm font-semibold text-gray-900">Suggestions</span>
        </div>
        <ul class="text-sm text-gray-600 space-y-1 pl-6 list-disc">
          <li v-for="(s, i) in suggestions" :key="i">{{ s }}</li>
        </ul>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StackedBarChart
          exportable
          title="My appointment outcomes"
          subtitle="By week — done, cancelled, rescheduled, no-show"
          :buckets="data.appointment_outcomes_by_week || []"
          :stacks="outcomeStacks"
        />
        <TrendLineChart
          exportable
          title="My rating trend"
          subtitle="Average client rating per week"
          :series="ratingSeries"
          :compare-series="[]"
          format="rating"
          color="#10B981"
        />
      </div>

      <!-- Recent feedback -->
      <section>
        <header class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-900">Recent feedback</h2>
          <p class="text-xs text-gray-500">Your latest rated sessions</p>
        </header>

        <EmptyAnalyticsState
          v-if="!recentFeedback.length"
          title="No feedback yet"
          description="Once clients rate your sessions, their comments appear here."
        />

        <div v-else class="space-y-2">
          <div
            v-for="(fb, i) in recentFeedback"
            :key="i"
            class="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3"
          >
            <div class="flex items-center gap-0.5 flex-shrink-0">
              <StarIcon
                v-for="n in 5"
                :key="n"
                class="w-3.5 h-3.5"
                :class="n <= fb.rating ? 'text-amber-400' : 'text-gray-200'"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">"{{ fb.comment || 'No comment provided' }}"</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ fb.client_name || '—' }} · {{ formatDate(fb.submitted_at) }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { SparklesIcon } from '@heroicons/vue/24/outline'
import { StarIcon } from '@heroicons/vue/20/solid'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import { useAuthStore } from '@/modules/auth/store/auth.store.ts'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { extractErrorMessage } from '@core/services/error.handler'
import Avatar from '@/modules/shared/components/Avatar.vue'
import FilterBar from '@/modules/shared/components/analytics/FilterBar.vue'
import KpiCard from '@/modules/shared/components/analytics/KpiCard.vue'
import KpiCardGrid from '@/modules/shared/components/analytics/KpiCardGrid.vue'
import StackedBarChart from '@/modules/shared/components/analytics/StackedBarChart.vue'
import TrendLineChart from '@/modules/shared/components/analytics/TrendLineChart.vue'
import EmptyAnalyticsState from '@/modules/shared/components/analytics/EmptyAnalyticsState.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const store = useAnalyticsStore()
const authStore = useAuthStore()
const toast = useToast()

const slot = computed(() => store.slots.trainerDetail)
const data = computed(() => slot.value.data)
const loading = computed(() => slot.value.loading)
const kpis = computed(() => data.value?.kpis || {})

const trainerName = computed(
  () =>
    data.value?.trainer?.full_name ||
    authStore.user?.full_name ||
    [authStore.user?.first_name, authStore.user?.last_name].filter(Boolean).join(' ') ||
    'Trainer',
)

const outcomeStacks = [
  { key: 'done', label: 'Done', color: '#8B5CF6' },
  { key: 'cancelled', label: 'Cancelled', color: '#F87171' },
  { key: 'rescheduled', label: 'Rescheduled', color: '#9CA3AF' },
  { key: 'no_show', label: 'No-show', color: '#FBBF24' },
]

const ratingSeries = computed(() =>
  (data.value?.rating_trend || []).map((p) => ({
    bucket: p.bucket,
    value: p.avg_rating,
    sample_size: p.count,
  })),
)

const recentFeedback = computed(() => data.value?.recent_feedback || [])

const suggestions = computed(() => {
  const out = []
  const k = kpis.value
  if (k.on_time_rate?.value !== undefined && k.on_time_rate.value < 0.8) {
    out.push('Your on-time start rate is below 80%. Try leaving for sessions a little earlier.')
  }
  if (k.completion_rate?.value !== undefined && k.completion_rate.value < 0.75) {
    out.push('Some appointments are not being completed. Sending reminders 24h prior can help.')
  }
  if (k.avg_rating?.value !== undefined && k.avg_rating.value >= 4.5) {
    out.push('Clients rate you highly — keep up the great work!')
  }
  return out
})

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString()
}

async function load() {
  const id = authStore.userId
  if (!id) return
  try {
    await store.fetchTrainerDetail(id)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

onMounted(load)
watch(
  () => store.filters,
  () => load(),
  { deep: true },
)

function onRangeChange(range) {
  store.setRange(range)
}

function onFilterChange({ key, value }) {
  store.setFilter(key, value)
}
</script>
