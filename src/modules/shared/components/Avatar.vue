<template>
  <div
    :class="[
      'rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0',
      sizeClasses
    ]"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover"
      @error="handleError"
    />
    <span v-else :class="['font-semibold text-gray-600', textSize]">
      {{ initials }}
    </span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: String, default: 'md' } // sm, md, lg, xl
})

const imgFailed = ref(false)

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizes[props.size] || sizes.md
})

const textSize = computed(() => {
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-lg' }
  return sizes[props.size] || sizes.md
})

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

function handleError() {
  imgFailed.value = true
}
</script>
