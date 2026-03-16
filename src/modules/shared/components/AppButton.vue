<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-target',
      variantClasses,
      sizeClasses,
      { 'opacity-50 cursor-not-allowed': disabled || loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

defineEmits(['click'])

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-red-500 shadow-sm',
    success: 'bg-success text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-sm',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
    link: 'text-primary hover:text-primary-dark underline-offset-2 hover:underline'
  }
  return variants[props.variant] || variants.primary
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }
  return sizes[props.size] || sizes.md
})
</script>
