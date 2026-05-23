<template>
  <div :class="gridClass">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cols: { type: Number, default: 4 },
})

const gridClass = computed(() => {
  const map = {
    2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
    5: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3',
    6: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3',
  }
  return map[props.cols] || map[4]
})
</script>
