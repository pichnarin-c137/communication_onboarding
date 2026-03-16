<template>
  <div class="relative">

    <!-- Styled trigger: always shows dd/mm/yyyy regardless of browser locale -->
    <button
      type="button"
      :disabled="disabled"
      @click="openPicker"
      class="w-full flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm bg-white transition-colors text-left"
      :class="[
        focused
          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
          : 'border-gray-300 hover:border-gray-400',
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
      ]"
    >
      <CalendarIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
      <span class="flex-1 mt-1" :class="modelValue ? 'text-gray-900' : 'text-gray-400'">
        {{ modelValue ? formatDate(modelValue) : placeholder }}
      </span>
    </button>

    <!-- Hidden native date input — provides the OS calendar picker via showPicker() -->
    <input
      ref="nativeInput"
      type="date"
      :value="nativeValue"
      :min="min"
      :max="max"
      class="sr-only"
      tabindex="-1"
      @focus="focused = true"
      @blur="focused = false"
      @change="onNativeChange"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CalendarIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  /** v-model value: YYYY-MM-DD (empty string when nothing selected). */
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Select date…' },
  disabled: { type: Boolean, default: false },
  /** ISO date string for the minimum selectable date (YYYY-MM-DD). */
  min: { type: String, default: '' },
  /** ISO date string for the maximum selectable date (YYYY-MM-DD). */
  max: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const nativeInput = ref(null)
const focused = ref(false)

/**
 * Strip any time/timezone portion from an ISO string or plain YYYY-MM-DD,
 * returning only the "YYYY-MM-DD" date part that <input type="date"> needs.
 */
function toDateOnly(str) {
  if (!str) return ''
  return str.split('T')[0]
}

/**
 * YYYY-MM-DD (or ISO datetime) → "dd/mm/yyyy"
 * Handles ISO strings like "2026-02-24T00:00:00.000000Z" correctly.
 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const clean = toDateOnly(dateStr)         // "2026-02-24"
  const parts = clean.split('-')
  if (parts.length < 3) return clean
  const [y, m, d] = parts
  return `${d}/${m}/${y}`                   // "24/02/2026"
}

// The value fed to <input type="date"> must be YYYY-MM-DD only.
const nativeValue = computed(() => toDateOnly(props.modelValue))

function onNativeChange(e) {
  emit('update:modelValue', e.target.value)  // always emits YYYY-MM-DD
}

function openPicker() {
  if (props.disabled) return
  try {
    // showPicker() is supported in Chrome 99+, Firefox 101+, Safari 16+
    nativeInput.value?.showPicker()
  } catch {
    nativeInput.value?.click()
  }
}
</script>
