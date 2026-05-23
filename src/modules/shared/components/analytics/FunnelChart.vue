<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>

    <div v-if="!stages.length" class="h-40 flex items-center justify-center text-xs text-gray-400">
      No funnel data in this range
    </div>

    <ol v-else class="space-y-2">
      <li v-for="(stage, i) in stages" :key="stage.key || i" class="group">
        <div class="flex items-center justify-between gap-3 mb-1">
          <span class="text-xs font-medium text-gray-700">{{ stage.label }}</span>
          <span class="text-xs text-gray-400 tabular-nums">
            {{ (stage.conversion_pct_from_top ?? 0).toFixed(1) }}% of top
          </span>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex-1 h-7 bg-gray-50 rounded-md overflow-hidden">
            <div
              class="h-full rounded-md flex items-center px-2 transition-all"
              :style="{
                width: `${Math.max(stage.conversion_pct_from_top ?? 0, 3)}%`,
                backgroundColor: barColor(i),
              }"
            >
              <span class="text-xs font-semibold text-white tabular-nums">
                {{ (stage.count ?? 0).toLocaleString() }}
              </span>
            </div>
          </div>
          <span
            v-if="stage.drop_pct_from_prev !== null && stage.drop_pct_from_prev !== undefined"
            class="w-16 text-right text-xs tabular-nums"
            :class="stage.drop_pct_from_prev > 20 ? 'text-rose-600 font-medium' : 'text-gray-400'"
          >
            ↓{{ stage.drop_pct_from_prev.toFixed(0) }}%
          </span>
          <span v-else class="w-16" />
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  stages: { type: Array, default: () => [] }, // [{ key, label, count, drop_pct_from_prev, conversion_pct_from_top }]
})

// Blue → indigo gradient that darkens as the funnel narrows.
const palette = ['#3B82F6', '#3B7DEB', '#3B6FE0', '#4F5FD6', '#5B52CC', '#6344C2', '#6D38B8']

function barColor(i) {
  return palette[Math.min(i, palette.length - 1)]
}
</script>
