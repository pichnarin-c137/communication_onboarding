<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/30" @click="emit('close')" />
        <div class="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 class="font-semibold text-gray-900">Trainer Reassignment History</h2>
            <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-4">
            <div v-if="loading" class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <div v-else-if="history.length === 0" class="py-12 text-center text-sm text-gray-400">
              No reassignment history
            </div>
            <ol v-else class="relative border-l border-gray-200 ml-3 space-y-6">
              <li v-for="entry in history" :key="entry.id" class="ml-6">
                <span class="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white">
                  <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </span>
                <p class="text-sm text-gray-900">
                  <span class="font-medium">{{ entry.from_trainer_name }}</span>
                  <span class="text-gray-400 mx-1">→</span>
                  <span class="font-medium">{{ entry.to_trainer_name }}</span>
                </p>
                <p class="text-xs text-gray-500 mt-0.5">
                  By {{ entry.assigned_by_name }} · {{ formatDate(entry.assigned_at) }}
                </p>
                <p v-if="entry.notes" class="text-xs text-gray-600 mt-1 italic">"{{ entry.notes }}"</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onboardingService } from '@/modules/shared/services/onboardingService'
import { useDateTime } from '@/modules/shared/composables/useDateTime'
import { useToast } from '@/modules/shared/composables/useToast'
import { extractErrorMessage } from '@core/services/error.handler'

const props = defineProps({
  open: { type: Boolean, default: false },
  onboardingId: { type: [String, Number], required: true }
})
const emit = defineEmits(['close'])
const { formatDate } = useDateTime()
const { error } = useToast()
const history = ref([])
const loading = ref(false)

watch(() => props.open, async (val) => {
  if (!val || history.value.length) return
  loading.value = true
  try {
    history.value = await onboardingService.getTrainerHistory(props.onboardingId)
  } catch (err) {
    error(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active { transition: opacity 0.2s ease; }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; }
</style>
