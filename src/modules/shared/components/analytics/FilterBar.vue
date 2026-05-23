<template>
  <div>
    <!-- Desktop / tablet: inline bar -->
    <div class="hidden sm:flex bg-white border border-gray-200 rounded-xl px-4 py-3 flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <DateRangeFilter :from="filters.from" :to="filters.to" @change="onRangeChange" />
        <div class="h-5 w-px bg-gray-200 hidden sm:block" />
        <!-- Compare -->
        <div class="flex items-center gap-1.5">
          <label class="text-xs text-gray-500">Compare:</label>
          <select
            :value="filters.compare"
            @change="onChange('compare', $event.target.value)"
            class="px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-primary"
          >
            <option value="prev">Previous period</option>
            <option value="yoy">Same period last year</option>
            <option value="none">None</option>
          </select>
        </div>
        <!-- Group by -->
        <div v-if="showGroupBy" class="flex items-center gap-1.5">
          <label class="text-xs text-gray-500">Group:</label>
          <div class="inline-flex bg-gray-100 rounded-lg p-0.5">
            <button
              v-for="opt in ['day', 'week', 'month']"
              :key="opt"
              type="button"
              @click="onChange('group_by', opt)"
              :class="[
                'px-2 py-1 text-xs font-medium rounded-md capitalize transition-colors',
                filters.group_by === opt
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
            >
              {{ opt }}
            </button>
          </div>
        </div>
        <!-- Location type -->
        <div v-if="showLocation" class="flex items-center gap-1.5">
          <label class="text-xs text-gray-500">Type:</label>
          <select
            :value="filters.location_type || ''"
            @change="onChange('location_type', $event.target.value || null)"
            class="px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-primary"
          >
            <option value="">All</option>
            <option value="online">Online</option>
            <option value="physical">Physical</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <button
        v-if="hasOverrides"
        @click="$emit('reset')"
        type="button"
        class="text-xs text-primary hover:underline"
      >
        Reset filters
      </button>
    </div>

    <!-- Mobile: summary + Filters button -->
    <div class="sm:hidden flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
      <div class="min-w-0">
        <p class="text-xs font-medium text-gray-900 truncate">{{ rangeSummary }}</p>
        <p class="text-[11px] text-gray-400">{{ compareSummary }}</p>
      </div>
      <button
        type="button"
        @click="sheetOpen = true"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg flex-shrink-0"
      >
        <AdjustmentsHorizontalIcon class="w-4 h-4" />
        Filters
        <span v-if="activeCount" class="ml-0.5 px-1.5 py-px bg-primary text-white rounded-full text-[10px]">
          {{ activeCount }}
        </span>
      </button>
    </div>

    <!-- Mobile sheet -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="sheetOpen"
          class="fixed inset-0 z-[95] flex items-end sm:hidden modal-backdrop"
          @click.self="sheetOpen = false"
        >
          <div class="bg-white rounded-t-2xl w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-gray-900">Filters</h3>
              <button type="button" @click="sheetOpen = false" class="p-1 text-gray-400 hover:text-gray-700">
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Date range</label>
              <DateRangeFilter :from="filters.from" :to="filters.to" @change="onRangeChange" />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Compare</label>
              <select
                :value="filters.compare"
                @change="onChange('compare', $event.target.value)"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-primary"
              >
                <option value="prev">Previous period</option>
                <option value="yoy">Same period last year</option>
                <option value="none">None</option>
              </select>
            </div>

            <div v-if="showGroupBy">
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Group by</label>
              <div class="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  v-for="opt in ['day', 'week', 'month']"
                  :key="opt"
                  type="button"
                  @click="onChange('group_by', opt)"
                  :class="[
                    'py-2 text-sm font-medium rounded-md capitalize transition-colors',
                    filters.group_by === opt ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600',
                  ]"
                >
                  {{ opt }}
                </button>
              </div>
            </div>

            <div v-if="showLocation">
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Appointment type</label>
              <select
                :value="filters.location_type || ''"
                @change="onChange('location_type', $event.target.value || null)"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-primary"
              >
                <option value="">All</option>
                <option value="online">Online</option>
                <option value="physical">Physical</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div class="flex gap-2 pt-2">
              <button
                v-if="hasOverrides"
                @click="$emit('reset')"
                type="button"
                class="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg"
              >
                Reset
              </button>
              <button
                @click="sheetOpen = false"
                type="button"
                class="flex-1 py-2.5 text-sm font-medium text-white bg-primary rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import DateRangeFilter from './DateRangeFilter.vue'

const props = defineProps({
  filters: { type: Object, required: true },
  showGroupBy: { type: Boolean, default: false },
  showLocation: { type: Boolean, default: true },
})

const emit = defineEmits(['change', 'range-change', 'reset'])

const sheetOpen = ref(false)

const hasOverrides = computed(
  () =>
    props.filters.compare !== 'prev' ||
    props.filters.group_by !== 'week' ||
    props.filters.location_type,
)

const activeCount = computed(() => {
  let n = 0
  if (props.filters.compare !== 'prev') n++
  if (props.filters.group_by !== 'week') n++
  if (props.filters.location_type) n++
  return n
})

const rangeSummary = computed(() => `${props.filters.from} → ${props.filters.to}`)

const compareSummary = computed(() => {
  const map = { prev: 'vs previous period', yoy: 'vs last year', none: 'no comparison' }
  return map[props.filters.compare] || ''
})

function onChange(key, value) {
  emit('change', { key, value })
}

function onRangeChange(range) {
  emit('range-change', range)
}
</script>
