<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Analytics</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          System-wide performance, satisfaction and trends across all roles
        </p>
      </div>
    </div>

    <!-- Filter bar -->
    <FilterBar
      :filters="store.filters"
      :show-group-by="activeTab === 'overview'"
      :show-location="true"
      @range-change="onRangeChange"
      @change="onFilterChange"
      @reset="store.resetFilters"
    />

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          @click="activeTab = tab.key"
          :class="[
            'pb-2.5 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'text-primary border-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab content -->
    <component :is="activeTabComponent" role="admin" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import { useAnalyticsUrlSync } from '@/modules/shared/composables/useAnalyticsUrlSync.js'
import FilterBar from '@/modules/shared/components/analytics/FilterBar.vue'
import OverviewTab from '@/modules/shared/components/analytics/tabs/OverviewTab.vue'
import TrainersTab from '@/modules/shared/components/analytics/tabs/TrainersTab.vue'
import SalesTab from '@/modules/shared/components/analytics/tabs/SalesTab.vue'
import FunnelTab from '@/modules/shared/components/analytics/tabs/FunnelTab.vue'
import SatisfactionTab from '@/modules/shared/components/analytics/tabs/SatisfactionTab.vue'
import OperationsTab from '@/modules/shared/components/analytics/tabs/OperationsTab.vue'
import InsightsTab from '@/modules/shared/components/analytics/tabs/InsightsTab.vue'

const store = useAnalyticsStore()
useAnalyticsUrlSync()
const activeTab = ref('overview')

const tabs = [
  { key: 'overview', label: 'Overview', component: OverviewTab },
  { key: 'trainers', label: 'Trainers', component: TrainersTab },
  { key: 'sales', label: 'Sales', component: SalesTab },
  { key: 'onboarding', label: 'Onboarding', component: FunnelTab },
  { key: 'satisfaction', label: 'Satisfaction', component: SatisfactionTab },
  { key: 'operations', label: 'Operations', component: OperationsTab },
  { key: 'insights', label: 'Insights', component: InsightsTab },
]

const activeTabComponent = computed(
  () => tabs.find((t) => t.key === activeTab.value)?.component,
)

function onRangeChange(range) {
  store.setRange(range)
}

function onFilterChange({ key, value }) {
  store.setFilter(key, value)
}
</script>
