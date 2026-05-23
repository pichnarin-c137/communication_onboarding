<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="totalCount === 0" class="h-48 flex items-center justify-center text-xs text-gray-400">
      No feedback in this range
    </div>
    <div v-else class="space-y-2">
      <div v-for="bin in bins" :key="bin.rating" class="flex items-center gap-3">
        <div class="flex items-center gap-1 w-14 flex-shrink-0">
          <StarIcon class="w-3.5 h-3.5 text-amber-400" />
          <span class="text-xs font-medium text-gray-700">{{ bin.rating }}</span>
        </div>
        <div class="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="binColor(bin.rating)"
            :style="{ width: `${bin.pct}%` }"
          />
        </div>
        <div class="w-20 text-right text-xs">
          <span class="font-medium text-gray-900">{{ bin.count }}</span>
          <span class="text-gray-400 ml-1">({{ bin.pct.toFixed(0) }}%)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { StarIcon } from '@heroicons/vue/20/solid'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  distribution: { type: Array, default: () => [] }, // [{ rating, count }]
})

const totalCount = computed(() =>
  (props.distribution || []).reduce((s, b) => s + (b.count || 0), 0),
)

const bins = computed(() => {
  const ratings = [5, 4, 3, 2, 1]
  return ratings.map((r) => {
    const item = (props.distribution || []).find((b) => b.rating === r)
    const count = item?.count || 0
    const pct = totalCount.value > 0 ? (count / totalCount.value) * 100 : 0
    return { rating: r, count, pct }
  })
})

function binColor(rating) {
  if (rating >= 5) return 'bg-emerald-500'
  if (rating === 4) return 'bg-emerald-400'
  if (rating === 3) return 'bg-amber-400'
  if (rating === 2) return 'bg-orange-400'
  return 'bg-rose-500'
}
</script>
