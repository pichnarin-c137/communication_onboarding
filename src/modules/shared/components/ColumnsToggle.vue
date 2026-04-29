<template>
  <div class="relative" ref="containerRef">
    <button
      type="button"
      @click="open = !open"
      class="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <Squares2X2Icon class="w-4 h-4" />
      Columns
      <span
        v-if="hiddenCount > 0"
        class="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-primary rounded-full"
      >{{ hiddenCount }}</span>
    </button>

    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1"
      >
        <div class="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Columns</span>
          <button
            v-if="hiddenCount > 0"
            type="button"
            @click="onReset"
            class="text-xs text-primary hover:underline"
          >Reset</button>
        </div>

        <ul class="py-1">
          <li
            v-for="col in allColumns"
            :key="col.key"
            class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
            :class="col.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
            @click="!col.required && onToggle(col.key)"
          >
            <div
              class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
              :class="isVisible(col.key)
                ? 'bg-primary border-primary'
                : 'bg-white border-gray-300'"
            >
              <CheckIcon v-if="isVisible(col.key)" class="w-2.5 h-2.5 text-white" />
            </div>
            <span class="text-sm text-gray-700">{{ col.label }}</span>
            <span v-if="col.required" class="ml-auto text-xs text-gray-400">Always</span>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Squares2X2Icon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  allColumns: { type: Array, required: true },
  hiddenCount: { type: Number, default: 0 },
  isVisible: { type: Function, required: true },
})

const emit = defineEmits(['toggle', 'reset'])

const open = ref(false)
const containerRef = ref(null)

function onToggle(key) {
  emit('toggle', key)
}

function onReset() {
  emit('reset')
}

function handleClickOutside(e) {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>
