<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
        <p class="text-xs text-gray-500 mt-0.5">
          Cumulative completion by {{ unitWord }} since the cohort started
        </p>
      </div>
    </div>

    <div v-if="!cohorts.length" class="h-32 flex items-center justify-center text-xs text-gray-400">
      Not enough onboarding history to build cohorts yet
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full border-separate" style="border-spacing: 3px">
        <thead>
          <tr>
            <th class="text-left text-[11px] font-medium text-gray-500 px-2 pb-1 sticky left-0 bg-white">
              Cohort
            </th>
            <th
              v-for="e in elapsedCols"
              :key="`h-${e}`"
              class="text-[10px] font-medium text-gray-400 text-center px-1 pb-1"
              style="min-width: 46px"
            >
              {{ e === 0 ? 'Start' : `+${e}${unitAbbr}` }}
            </th>
            <th class="text-right text-[11px] font-medium text-gray-500 px-2 pb-1">
              Median
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in cohorts" :key="c.cohort">
            <td class="px-2 sticky left-0 bg-white">
              <p class="text-xs font-medium text-gray-900 whitespace-nowrap">{{ c.label }}</p>
              <p class="text-[10px] text-gray-400">{{ c.started }} started</p>
            </td>
            <td
              v-for="e in elapsedCols"
              :key="`${c.cohort}-${e}`"
              class="text-center align-middle"
            >
              <div
                v-if="cellFor(c, e)"
                class="rounded-md py-1.5 text-[11px] font-semibold tabular-nums"
                :style="cellStyle(cellFor(c, e).completed_pct)"
                :title="`${cellFor(c, e).completed_cum} of ${c.started} completed`"
              >
                {{ Math.round(cellFor(c, e).completed_pct * 100) }}%
              </div>
              <div v-else class="py-1.5 text-[11px] text-gray-300">·</div>
            </td>
            <td class="text-right px-2 text-xs text-gray-600 tabular-nums whitespace-nowrap">
              {{ c.median_days_to_complete != null ? `${c.median_days_to_complete}d` : '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Onboarding completion cohorts' },
  cohorts: { type: Array, default: () => [] }, // [{ cohort, label, started, periods:[{elapsed,completed_cum,completed_pct}], median_days_to_complete }]
  cohortBy: { type: String, default: 'month' }, // month | week
})

const unitWord = computed(() => (props.cohortBy === 'week' ? 'week' : 'month'))
const unitAbbr = computed(() => (props.cohortBy === 'week' ? 'w' : 'mo'))

// Union of elapsed indexes present across all cohorts, so every row aligns.
const elapsedCols = computed(() => {
  let max = 0
  for (const c of props.cohorts) {
    for (const p of c.periods || []) max = Math.max(max, p.elapsed)
  }
  return Array.from({ length: max + 1 }, (_, i) => i)
})

function cellFor(cohort, elapsed) {
  return (cohort.periods || []).find((p) => p.elapsed === elapsed) || null
}

function cellStyle(pct) {
  const p = Math.max(0, Math.min(1, pct || 0))
  return {
    backgroundColor: `rgba(16, 185, 129, ${0.1 + 0.82 * p})`,
    color: p > 0.5 ? '#fff' : '#065F46',
  }
}
</script>
