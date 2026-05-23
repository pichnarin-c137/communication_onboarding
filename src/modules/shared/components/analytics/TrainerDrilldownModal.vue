<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[90] flex items-start justify-center p-4 sm:p-8 overflow-y-auto modal-backdrop"
        @click.self="$emit('close')"
      >
        <div class="bg-white rounded-xl shadow-lg w-full max-w-3xl my-4">
          <!-- Header -->
          <div class="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3 min-w-0">
              <Avatar :name="trainerName" :src="trainer?.avatar_url || ''" size="lg" />
              <div class="min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 truncate">{{ trainerName }}</h3>
                <p class="text-xs text-gray-500">
                  <span v-if="trainer?.live_status" class="capitalize">{{ trainer.live_status }}</span>
                  <span v-else>Trainer scorecard</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="$emit('close')"
              class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-5">
            <SkeletonLoader v-if="loading && !data" type="cards" :count="3" />

            <EmptyAnalyticsState
              v-else-if="slot.error"
              :title="slot.error"
              description="Couldn't load this trainer's scorecard."
            />

            <template v-else-if="data">
              <!-- KPIs -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div
                  v-for="card in kpiCards"
                  :key="card.key"
                  class="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5"
                >
                  <p class="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{{ card.label }}</p>
                  <p class="text-lg font-semibold text-gray-900 mt-0.5">
                    {{ formatKpi(kpis[card.key]?.value, card.format) }}
                  </p>
                  <ComparisonPill
                    :delta-pct="kpis[card.key]?.delta_pct"
                    :good-direction="card.goodDirection"
                  />
                </div>
              </div>

              <!-- Charts -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <StackedBarChart
                  title="Appointment outcomes"
                  subtitle="By week"
                  :buckets="data.appointment_outcomes_by_week || []"
                  :stacks="outcomeStacks"
                />
                <TrendLineChart
                  title="Rating trend"
                  subtitle="Average client rating per week"
                  :series="ratingSeries"
                  :compare-series="[]"
                  format="rating"
                  color="#10B981"
                />
              </div>

              <!-- Recent feedback -->
              <div>
                <h4 class="text-sm font-semibold text-gray-900 mb-2">Recent feedback</h4>
                <EmptyAnalyticsState
                  v-if="!recentFeedback.length"
                  title="No feedback yet"
                  description="No rated sessions in this range."
                />
                <div v-else class="space-y-2">
                  <div
                    v-for="(fb, i) in recentFeedback"
                    :key="i"
                    class="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3"
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
                      <p class="text-xs text-gray-400 mt-0.5">
                        {{ fb.client_name || '—' }} · {{ formatDate(fb.submitted_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { StarIcon } from '@heroicons/vue/20/solid'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import Avatar from '@/modules/shared/components/Avatar.vue'
import ComparisonPill from './ComparisonPill.vue'
import StackedBarChart from './StackedBarChart.vue'
import TrendLineChart from './TrendLineChart.vue'
import EmptyAnalyticsState from './EmptyAnalyticsState.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  trainerId: { type: String, default: null },
  fallbackName: { type: String, default: '' },
})

defineEmits(['close'])

const store = useAnalyticsStore()
const slot = computed(() => store.slots.trainerDetail)
const data = computed(() => slot.value.data)
const loading = computed(() => slot.value.loading)
const kpis = computed(() => data.value?.kpis || {})
const trainer = computed(() => data.value?.trainer)

const trainerName = computed(
  () => trainer.value?.full_name || props.fallbackName || 'Trainer',
)

const kpiCards = [
  { key: 'completed_count', label: 'Completed', format: 'number', goodDirection: 'up' },
  { key: 'completion_rate', label: 'Completion', format: 'percent', goodDirection: 'up' },
  { key: 'avg_rating', label: 'Avg rating', format: 'rating', goodDirection: 'up' },
  { key: 'on_time_rate', label: 'On-time', format: 'percent', goodDirection: 'up' },
  { key: 'active_onboardings', label: 'Active', format: 'number', goodDirection: 'up' },
]

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

function formatKpi(v, format) {
  if (v === null || v === undefined) return '—'
  const n = Number(v)
  if (format === 'percent') return `${(n * 100).toFixed(0)}%`
  if (format === 'rating') return n.toFixed(2)
  return n.toLocaleString()
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString()
}

// Fetch whenever the modal opens for a trainer, or the id changes while open.
watch(
  () => [props.open, props.trainerId],
  ([open, id]) => {
    if (open && id) void store.fetchTrainerDetail(id)
  },
  { immediate: true },
)
</script>
