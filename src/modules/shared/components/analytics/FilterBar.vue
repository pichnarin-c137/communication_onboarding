<template>
  <div class="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
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
</template>

<script setup>
import { computed } from 'vue'
import DateRangeFilter from './DateRangeFilter.vue'

const props = defineProps({
  filters: { type: Object, required: true },
  showGroupBy: { type: Boolean, default: false },
  showLocation: { type: Boolean, default: true },
})

const emit = defineEmits(['change', 'range-change', 'reset'])

const hasOverrides = computed(
  () =>
    props.filters.compare !== 'prev' ||
    props.filters.group_by !== 'week' ||
    props.filters.location_type,
)

function onChange(key, value) {
  emit('change', { key, value })
}

function onRangeChange(range) {
  emit('range-change', range)
}
</script>
