<template>
  <div class="flex items-center gap-1">
    <button v-for="n in 5" :key="n" type="button" :disabled="readonly" class="focus:outline-none transition-transform"
      :class="[readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110']"
      @click="!readonly && emit('update:modelValue', n)" @mouseenter="!readonly && (hovered = n)"
      @mouseleave="!readonly && (hovered = 0)">
      <div class="relative w-7 h-7">
        <svg class="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <div class="absolute inset-0 overflow-hidden transition-all" :style="{ width: `${fillPercent(n)}%` }">
          <svg class="w-7 h-7 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const hovered = ref(0)

const normalizedValue = computed(() => {
  const value = Number(props.modelValue)
  if (!Number.isFinite(value)) return 0
  return Math.min(5, Math.max(0, value))
})

function fillPercent(starIndex) {
  if (!props.readonly) {
    const value = hovered.value || normalizedValue.value
    return value >= starIndex ? 100 : 0
  }

  const raw = normalizedValue.value - (starIndex - 1)
  if (raw <= 0) return 0
  if (raw >= 1) return 100
  return Math.round(raw * 100)
}
</script>
