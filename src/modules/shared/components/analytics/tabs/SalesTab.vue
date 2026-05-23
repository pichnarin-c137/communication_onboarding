<template>
  <div class="space-y-5">
    <LeaderboardTable
      title="Sales leaderboard"
      subtitle="Conversion and roster health per sale rep"
      :rows="rows"
      :columns="columns"
      id-key="sale_user_id"
      :loading="loading"
      :sort="sort"
      :order="order"
      :meta="meta"
      empty-title="No sales activity"
      empty-description="No appointments or onboardings created in this date range."
      :export-filename="exportFilename"
      @sort-change="onSortChange"
      @page-change="onPageChange"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import LeaderboardTable from '@/modules/shared/components/analytics/LeaderboardTable.vue'

const store = useAnalyticsStore()
const slot = computed(() => store.slots.sales)
const loading = computed(() => slot.value.loading)
const rows = computed(() => slot.value.data?.rows || [])
const meta = computed(() => slot.value.data?.meta || null)

const sort = ref('onboardings_completed')
const order = ref('desc')
const page = ref(1)

const exportFilename = computed(
  () => `sales-${store.filters.from}-to-${store.filters.to}.csv`,
)

const columns = [
  { key: 'full_name', label: 'Sale rep', type: 'name' },
  { key: 'appointments_created', label: 'Appts created', format: 'number', sortable: true, align: 'right' },
  { key: 'onboardings_started', label: 'Started', format: 'number', sortable: true, align: 'right' },
  { key: 'onboardings_completed', label: 'Completed', format: 'number', sortable: true, align: 'right' },
  { key: 'conversion_pct', label: 'Conversion', format: 'percent', sortable: true, align: 'right' },
  { key: 'avg_time_to_schedule_days', label: 'Time to schedule', format: 'duration', align: 'right' },
  { key: 'roster_size', label: 'Roster', format: 'number', align: 'right' },
  { key: 'roster_avg_rating', label: 'Roster rating', format: 'rating', align: 'right' },
  { key: 'roster_utilization_pct', label: 'Utilization', format: 'percent', sortable: true, align: 'right' },
]

function load() {
  return store.fetchSales({
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
