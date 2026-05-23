<template>
  <div class="space-y-5">
    <!-- Conversion funnel -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">Conversion funnel</h2>
        <p class="text-xs text-gray-500">Demo → onboarding → feedback</p>
      </header>

      <SkeletonLoader v-if="funnelSlot.loading && !funnelSlot.data" type="cards" :count="1" />
      <EmptyAnalyticsState
        v-else-if="funnelSlot.error"
        :title="funnelSlot.error"
        description="Couldn't load the funnel for this range."
      />
      <FunnelChart
        v-else
        title="Onboarding funnel"
        subtitle="Counts and drop-off at each stage"
        :stages="stages"
      />
    </section>

    <!-- Onboarding lifecycle -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">Onboarding lifecycle</h2>
        <p class="text-xs text-gray-500">Holds, revisions, reassignments & cycle time</p>
      </header>

      <SkeletonLoader v-if="breakdownSlot.loading && !breakdownSlot.data" type="cards" :count="4" />

      <template v-else-if="breakdown">
        <!-- Rate cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div
            v-for="card in rateCards"
            :key="card.label"
            class="bg-white border border-gray-200 rounded-xl px-4 py-3"
          >
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ card.label }}</p>
            <p class="text-2xl font-semibold mt-1" :class="card.tone">{{ card.value }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ card.caption }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Cycle distribution -->
          <div class="bg-white border border-gray-200 rounded-xl p-5">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Re-onboarding cycles</h3>
            <div v-if="!cycleDist.length" class="text-xs text-gray-400 py-6 text-center">No data</div>
            <ul v-else class="space-y-2.5">
              <li v-for="c in cycleDist" :key="c.cycle" class="flex items-center gap-3">
                <span class="text-xs text-gray-500 w-16">Cycle {{ c.cycle }}</span>
                <div class="flex-1 h-5 bg-gray-50 rounded-md overflow-hidden">
                  <div
                    class="h-full bg-primary/80 rounded-md"
                    :style="{ width: `${cyclePct(c.count)}%` }"
                  />
                </div>
                <span class="text-xs font-medium text-gray-700 w-8 text-right tabular-nums">{{ c.count }}</span>
              </li>
            </ul>
          </div>

          <!-- Time in stage -->
          <div class="bg-white border border-gray-200 rounded-xl p-5">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Avg time in stage</h3>
            <div v-if="!timeInStage.length" class="text-xs text-gray-400 py-6 text-center">No data</div>
            <ul v-else class="space-y-2.5">
              <li v-for="s in timeInStage" :key="s.stage" class="flex items-center gap-3">
                <span class="text-xs text-gray-500 w-24 capitalize">{{ s.stage.replace('_', ' ') }}</span>
                <div class="flex-1 h-5 bg-gray-50 rounded-md overflow-hidden">
                  <div
                    class="h-full bg-indigo-400 rounded-md"
                    :style="{ width: `${stagePct(s.hours)}%` }"
                  />
                </div>
                <span class="text-xs font-medium text-gray-700 w-14 text-right tabular-nums">{{ formatHours(s.hours) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </section>

    <!-- Appointment composition -->
    <section>
      <header class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">Appointment breakdown</h2>
        <p class="text-xs text-gray-500">Mix by type, channel & status</p>
      </header>

      <SkeletonLoader v-if="apptSlot.loading && !apptSlot.data" type="cards" :count="2" />

      <template v-else-if="appts">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <DistributionDoughnut
            title="By type"
            :segments="typeSegments"
            center-label="appts"
          />
          <DistributionDoughnut
            title="By channel"
            :segments="locationSegments"
            center-label="appts"
          />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="card in apptStatCards"
            :key="card.label"
            class="bg-white border border-gray-200 rounded-xl px-4 py-3"
          >
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ card.label }}</p>
            <p class="text-2xl font-semibold text-gray-900 mt-1">{{ card.value }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ card.caption }}</p>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import FunnelChart from '@/modules/shared/components/analytics/FunnelChart.vue'
import DistributionDoughnut from '@/modules/shared/components/analytics/DistributionDoughnut.vue'
import EmptyAnalyticsState from '@/modules/shared/components/analytics/EmptyAnalyticsState.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

defineProps({
  role: { type: String, default: 'admin' }, // admin | sale
})

const store = useAnalyticsStore()

const funnelSlot = computed(() => store.slots.onboardingFunnel)
const breakdownSlot = computed(() => store.slots.onboardingsBreakdown)
const apptSlot = computed(() => store.slots.appointments)

const stages = computed(() => funnelSlot.value.data?.stages || [])

// ---- Onboarding breakdown ----
const breakdown = computed(() => breakdownSlot.value.data)

const rateCards = computed(() => {
  const r = breakdown.value?.rates || {}
  const t = breakdown.value?.totals || {}
  return [
    {
      label: 'Completion',
      value: pct(r.completion),
      caption: `${t.completed ?? 0} of ${t.started ?? 0} started`,
      tone: 'text-emerald-600',
    },
    {
      label: 'Hold rate',
      value: pct(r.hold_rate),
      caption: `${t.ever_held ?? 0} ever on hold`,
      tone: (r.hold_rate || 0) > 0.25 ? 'text-rose-600' : 'text-gray-900',
    },
    {
      label: 'Revision rate',
      value: pct(r.revision_rate),
      caption: `${t.ever_revised ?? 0} requested revision`,
      tone: 'text-gray-900',
    },
    {
      label: 'Reassignment',
      value: pct(r.reassignment_rate),
      caption: `${t.ever_reassigned ?? 0} changed trainer`,
      tone: 'text-gray-900',
    },
  ]
})

const cycleDist = computed(() => breakdown.value?.cycle_distribution || [])
const cycleMax = computed(() => Math.max(1, ...cycleDist.value.map((c) => c.count)))
function cyclePct(count) {
  return Math.max((count / cycleMax.value) * 100, 2)
}

const timeInStage = computed(() => {
  const obj = breakdown.value?.avg_time_in_stage_hours || {}
  return Object.entries(obj).map(([stage, hours]) => ({ stage, hours }))
})
const stageMax = computed(() => Math.max(1, ...timeInStage.value.map((s) => s.hours)))
function stagePct(hours) {
  return Math.max((hours / stageMax.value) * 100, 2)
}
function formatHours(h) {
  if (h === null || h === undefined) return '—'
  if (h < 1) return `${Math.round(h * 60)}m`
  if (h < 48) return `${h.toFixed(0)}h`
  return `${(h / 24).toFixed(1)}d`
}

// ---- Appointment breakdown ----
const appts = computed(() => apptSlot.value.data)

const TYPE_COLORS = { demo: '#60A5FA', training: '#6366F1' }
const LOCATION_COLORS = { online: '#34D399', physical: '#FBBF24', hybrid: '#A78BFA' }

function toSegments(obj, colors) {
  if (!obj) return []
  return Object.entries(obj).map(([key, v]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: v.count || 0,
    color: colors[key] || '#9CA3AF',
  }))
}

const typeSegments = computed(() => toSegments(appts.value?.by_type, TYPE_COLORS))
const locationSegments = computed(() => toSegments(appts.value?.by_location, LOCATION_COLORS))

const apptStatCards = computed(() => {
  if (!appts.value) return []
  const conv = appts.value.demo_to_training_conversion || {}
  return [
    { label: 'On-time rate', value: pct(appts.value.on_time_rate?.value), caption: 'Started within grace' },
    { label: 'Avg duration', value: `${appts.value.avg_session_duration_min ?? '—'}m`, caption: 'Per session' },
    { label: 'Avg lead time', value: `${appts.value.avg_lead_time_days ?? '—'}d`, caption: 'Created → scheduled' },
    { label: 'Demo → training', value: pct(conv.rate), caption: `${conv.demos_with_training ?? 0} of ${conv.demos ?? 0} demos` },
  ]
})

// ---- shared ----
function pct(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
  return `${(Number(v) * 100).toFixed(1)}%`
}

function loadAll() {
  void store.fetchOnboardingFunnel()
  void store.fetchOnboardingsBreakdown()
  void store.fetchAppointments()
}

onMounted(loadAll)
watch(() => store.filters, loadAll, { deep: true })
</script>
