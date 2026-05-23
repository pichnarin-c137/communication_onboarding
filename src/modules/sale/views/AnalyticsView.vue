<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Analytics</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          Performance across your trainers and the appointments you created
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
    <component :is="activeTabComponent" role="sale" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'
import FilterBar from '@/modules/shared/components/analytics/FilterBar.vue'
import OverviewTab from '@/modules/shared/components/analytics/tabs/OverviewTab.vue'
import SatisfactionTab from '@/modules/shared/components/analytics/tabs/SatisfactionTab.vue'

const store = useAnalyticsStore()
const activeTab = ref('overview')

const tabs = [
  { key: 'overview', label: 'Overview', component: OverviewTab },
  { key: 'satisfaction', label: 'Satisfaction', component: SatisfactionTab },
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
