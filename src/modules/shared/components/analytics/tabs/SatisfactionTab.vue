<template>
  <div class="space-y-5">
    <!-- Summary KPIs -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">Client satisfaction</h2>
        <p class="text-xs text-gray-500">Based on submitted feedback</p>
      </header>

      <SkeletonLoader v-if="loading && !data" type="cards" :count="4" />

      <KpiCardGrid v-else-if="summary" :cols="4">
        <KpiCard
          label="Average rating"
          :value="summary.avg_rating?.value"
          :previous="summary.avg_rating?.previous"
          :delta-pct="summary.avg_rating?.delta_pct"
          :good-direction="summary.avg_rating?.good_direction || 'up'"
          format="rating"
        />
        <KpiCard
          label="Feedback received"
          :value="summary.feedback_count?.value"
          :previous="summary.feedback_count?.previous"
          :delta-pct="summary.feedback_count?.delta_pct"
          good-direction="up"
          format="number"
        />
        <KpiCard
          label="Response rate"
          :value="summary.response_rate?.value"
          :previous="summary.response_rate?.previous"
          :delta-pct="summary.response_rate?.delta_pct"
          good-direction="up"
          format="percent"
        />
        <div class="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-2.5">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Sentiment mix
          </span>
          <div class="flex items-center gap-1 h-2.5">
            <div class="h-full rounded-l-full bg-emerald-500" :style="{ width: `${(summary.promoter_pct || 0) * 100}%` }" />
            <div class="h-full bg-amber-400" :style="{ width: `${(summary.passive_pct || 0) * 100}%` }" />
            <div class="h-full rounded-r-full bg-rose-500" :style="{ width: `${(summary.detractor_pct || 0) * 100}%` }" />
          </div>
          <div class="flex items-center justify-between text-[10px] text-gray-500">
            <span>{{ Math.round((summary.promoter_pct || 0) * 100) }}% promoter</span>
            <span>{{ Math.round((summary.passive_pct || 0) * 100) }}% passive</span>
            <span>{{ Math.round((summary.detractor_pct || 0) * 100) }}% detractor</span>
          </div>
        </div>
      </KpiCardGrid>
    </section>

    <!-- Distribution + Trend -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <HistogramChart
        title="Rating distribution"
        subtitle="How feedback breaks down by stars"
        :distribution="data?.distribution || []"
      />

      <TrendLineChart
        title="Average rating trend"
        subtitle="Weekly average of submitted ratings"
        :series="trendSeries"
        :compare-series="[]"
        format="rating"
        color="#10B981"
      />
    </section>

    <!-- Low rating alerts -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">Low-rating alerts</h2>
        <p class="text-xs text-gray-500">
          Last 7 days · feedback {{ '≤ 2' }} stars
        </p>
      </header>

      <SkeletonLoader v-if="loading && !data" type="list" :count="2" />

      <EmptyAnalyticsState
        v-else-if="!alerts.length"
        title="No low-rating feedback"
        description="Nothing below 2 stars in the last 7 days. Keep it up."
      />

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <LowRatingAlertCard v-for="alert in alerts" :key="alert.feedback_id" :alert="alert" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import KpiCard from '@/modules/shared/components/analytics/KpiCard.vue'
import KpiCardGrid from '@/modules/shared/components/analytics/KpiCardGrid.vue'
import HistogramChart from '@/modules/shared/components/analytics/HistogramChart.vue'
import TrendLineChart from '@/modules/shared/components/analytics/TrendLineChart.vue'
import LowRatingAlertCard from '@/modules/shared/components/analytics/LowRatingAlertCard.vue'
import EmptyAnalyticsState from '@/modules/shared/components/analytics/EmptyAnalyticsState.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const store = useAnalyticsStore()
const slot = computed(() => store.slots.satisfaction)
const data = computed(() => slot.value.data)
const loading = computed(() => slot.value.loading)
const summary = computed(() => data.value?.summary)
const alerts = computed(() => data.value?.low_rating_alerts || [])

const trendSeries = computed(() =>
  (data.value?.trend || []).map((p) => ({
    bucket: p.bucket,
    value: p.avg_rating,
    sample_size: p.count,
  })),
)

onMounted(() => void store.fetchSatisfaction())
watch(
  () => store.filters,
  () => void store.fetchSatisfaction(),
  { deep: true },
)
</script>
