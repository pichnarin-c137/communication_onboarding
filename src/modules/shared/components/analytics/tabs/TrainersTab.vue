<template>
  <div class="space-y-5">
    <LeaderboardTable
      :title="title"
      :subtitle="subtitle"
      :rows="rows"
      :columns="columns"
      id-key="trainer_user_id"
      :loading="loading"
      :sort="sort"
      :order="order"
      :meta="meta"
      clickable
      :empty-title="emptyTitle"
      empty-description="No trainer activity for this date range yet."
      :export-filename="exportFilename"
      @sort-change="onSortChange"
      @page-change="onPageChange"
      @row-click="openDrilldown"
    />

    <TrainerDrilldownModal
      :open="drilldownOpen"
      :trainer-id="selectedTrainerId"
      :fallback-name="selectedTrainerName"
      @close="drilldownOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import LeaderboardTable from '@/modules/shared/components/analytics/LeaderboardTable.vue'
import TrainerDrilldownModal from '@/modules/shared/components/analytics/TrainerDrilldownModal.vue'

const props = defineProps({
  role: { type: String, default: 'admin' }, // admin | sale
})

const store = useAnalyticsStore()
const slot = computed(() => store.slots.trainers)
const loading = computed(() => slot.value.loading)
const rows = computed(() => slot.value.data?.rows || [])
const meta = computed(() => slot.value.data?.meta || null)

const sort = ref('completion_rate')
const order = ref('desc')
const page = ref(1)

const isMyRoster = computed(() => props.role === 'sale')
const title = computed(() => (isMyRoster.value ? 'My trainers' : 'Trainer leaderboard'))
const subtitle = computed(() =>
  isMyRoster.value
    ? 'Performance across the trainers in your roster'
    : 'Ranked across all trainers · click a row for the full scorecard',
)
const emptyTitle = computed(() =>
  isMyRoster.value ? 'No trainers in your roster' : 'No trainers found',
)
const exportFilename = computed(
  () => `trainers-${store.filters.from}-to-${store.filters.to}.csv`,
)

const columns = [
  { key: 'full_name', label: 'Trainer', type: 'name' },
  { key: 'completed_count', label: 'Completed', format: 'number', sortable: true, align: 'right' },
  { key: 'completion_rate', label: 'Completion', format: 'percent', sortable: true, align: 'right' },
  { key: 'on_time_rate', label: 'On-time', format: 'percent', sortable: true, align: 'right' },
  { key: 'avg_rating', label: 'Avg rating', format: 'rating', sortable: true, align: 'right' },
  { key: 'feedback_count', label: 'Reviews', format: 'number', align: 'right' },
  { key: 'active_onboardings', label: 'Active', format: 'number', align: 'right' },
  { key: 'workload_pct', label: 'Workload', format: 'percent', sortable: true, align: 'right' },
  { key: 'lessons_sent', label: 'Lessons', format: 'number', align: 'right' },
]

const drilldownOpen = ref(false)
const selectedTrainerId = ref(null)
const selectedTrainerName = ref('')

function openDrilldown(row) {
  selectedTrainerId.value = row.trainer_user_id
  selectedTrainerName.value = row.full_name || ''
  drilldownOpen.value = true
}

function load() {
  return store.fetchTrainers({
    sort: sort.value,
    order: order.value,
    page: page.value,
    per_page: 20,
  })
}

function onSortChange({ sort: s, order: o }) {
  sort.value = s
  order.value = o
  page.value = 1
  void load()
}

function onPageChange(p) {
  page.value = p
  void load()
}

onMounted(load)
watch(
  () => store.filters,
  () => {
    page.value = 1
    void load()
  },
  { deep: true },
)
</script>
