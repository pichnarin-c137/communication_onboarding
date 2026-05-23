<template>
  <div class="space-y-5">
    <!-- Heatmap -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">Appointment density</h2>
        <p class="text-xs text-gray-500">Find scheduling hot-spots across the week</p>
      </header>

      <SkeletonLoader v-if="heatmapSlot.loading && !heatmapSlot.data" type="cards" :count="1" />
      <EmptyAnalyticsState
        v-else-if="heatmapSlot.error"
        :title="heatmapSlot.error"
        description="Couldn't load the density map for this range."
      />
      <HeatmapGrid
        v-else
        :cells="heatmap?.cells || []"
        :max-count="heatmap?.max_count || 0"
        :total="heatmap?.total || 0"
      />
    </section>

    <!-- Engagement -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">Engagement</h2>
        <p class="text-xs text-gray-500">Telegram delivery & lesson activity</p>
      </header>

      <SkeletonLoader v-if="engagementSlot.loading && !engagementSlot.data" type="cards" :count="4" />

      <template v-else-if="engagement">
        <!-- Telegram stat cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div
            v-for="card in telegramCards"
            :key="card.label"
            class="bg-white border border-gray-200 rounded-xl px-4 py-3"
          >
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ card.label }}</p>
            <p class="text-2xl font-semibold mt-1" :class="card.tone || 'text-gray-900'">{{ card.value }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ card.caption }}</p>
          </div>
        </div>

        <!-- Composition doughnuts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DistributionDoughnut
            title="Telegram messages by type"
            :segments="telegramTypeSegments"
            center-label="messages"
          />
          <DistributionDoughnut
            title="Lessons by path"
            :segments="lessonPathSegments"
            center-label="lessons"
          />
        </div>

        <!-- Lessons summary strip -->
        <div class="grid grid-cols-2 gap-3 mt-4">
          <div class="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Lessons sent</p>
            <p class="text-2xl font-semibold text-gray-900 mt-1">{{ (engagement.lessons?.sent ?? 0).toLocaleString() }}</p>
          </div>
          <div class="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg per onboarding</p>
            <p class="text-2xl font-semibold text-gray-900 mt-1">{{ engagement.lessons?.per_onboarding_avg ?? '—' }}</p>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import HeatmapGrid from '@/modules/shared/components/analytics/HeatmapGrid.vue'
import DistributionDoughnut from '@/modules/shared/components/analytics/DistributionDoughnut.vue'
import EmptyAnalyticsState from '@/modules/shared/components/analytics/EmptyAnalyticsState.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const store = useAnalyticsStore()

const heatmapSlot = computed(() => store.slots.heatmap)
const engagementSlot = computed(() => store.slots.engagement)
const heatmap = computed(() => heatmapSlot.value.data)
const engagement = computed(() => engagementSlot.value.data)

const PALETTE = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#A78BFA', '#F87171', '#14B8A6']

function toSegments(obj) {
  if (!obj) return []
  return Object.entries(obj).map(([key, value], i) => ({
    label: humanize(key),
    value: value || 0,
    color: PALETTE[i % PALETTE.length],
  }))
}

function humanize(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const telegramCards = computed(() => {
  const t = engagement.value?.telegram || {}
  return [
    { label: 'Messages sent', value: (t.messages_sent ?? 0).toLocaleString(), caption: `${t.messages_failed ?? 0} failed` },
    {
      label: 'Delivery rate',
      value: t.delivery_rate != null ? `${(t.delivery_rate * 100).toFixed(1)}%` : '—',
      caption: 'Sent vs failed',
      tone: (t.delivery_rate ?? 1) < 0.9 ? 'text-rose-600' : 'text-emerald-600',
    },
    { label: 'Active groups', value: (t.groups_active ?? 0).toLocaleString(), caption: 'Connected now' },
    { label: 'Removed groups', value: (t.groups_removed ?? 0).toLocaleString(), caption: 'Bot kicked / left' },
  ]
})

const telegramTypeSegments = computed(() => toSegments(engagement.value?.telegram?.by_type))
const lessonPathSegments = computed(() => toSegments(engagement.value?.lessons?.by_path))

function loadAll() {
  void store.fetchHeatmap()
  void store.fetchEngagement()
}

onMounted(loadAll)
watch(() => store.filters, loadAll, { deep: true })
</script>
