<template>
  <div class="relative" ref="containerRef">
    <button
      type="button"
      @click="open = !open"
      class="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <FunnelIcon class="w-4 h-4" />
      Status
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
        class="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1"
      >
        <div class="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Visible Statuses</span>
          <button
            v-if="hiddenCount > 0"
            type="button"
            @click="onReset"
            class="text-xs text-primary hover:underline"
          >Show all</button>
        </div>

        <ul class="py-1">
          <li
            v-for="status in allStatuses"
            :key="status.key"
            class="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="onToggle(status.key)"
          >
            <!-- Colored status dot -->
            <span :class="['w-2 h-2 rounded-full flex-shrink-0', statusDot(status.key)]"></span>
            <span class="flex-1 text-sm text-gray-700">{{ status.label }}</span>
            <!-- Checkbox -->
            <div
              class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
              :class="isVisible(status.key)
                ? 'bg-primary border-primary'
                : 'bg-white border-gray-300'"
            >
              <CheckIcon v-if="isVisible(status.key)" class="w-2.5 h-2.5 text-white" />
            </div>
          </li>
        </ul>

        <div v-if="hiddenCount > 0" class="px-3 py-2 border-t border-gray-100">
          <p class="text-xs text-gray-400">{{ hiddenCount }} status{{ hiddenCount > 1 ? 'es' : '' }} hidden from list</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { FunnelIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  allStatuses: { type: Array, required: true },
  hiddenCount: { type: Number, default: 0 },
  isVisible: { type: Function, required: true },
})

const emit = defineEmits(['toggle', 'reset'])

const open = ref(false)
const containerRef = ref(null)

const dotMap = {
  pending: 'bg-blue-400',
  leave_office: 'bg-amber-400',
  in_progress: 'bg-emerald-400',
  done: 'bg-purple-400',
  cancelled: 'bg-red-400',
  rescheduled: 'bg-gray-400',
}

function statusDot(key) {
  return dotMap[key] || 'bg-gray-300'
}

function onToggle(key) { emit('toggle', key) }
function onReset() { emit('reset') }

function handleClickOutside(e) {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>
