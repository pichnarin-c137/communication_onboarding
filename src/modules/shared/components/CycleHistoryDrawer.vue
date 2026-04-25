<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/30" @click="emit('close')" />
        <div class="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 class="font-semibold text-gray-900">Onboarding Cycle History</h2>
            <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <div v-if="loading" class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-20 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <div v-else-if="cycles.length === 0" class="py-12 text-center text-sm text-gray-400">
              No cycle history found
            </div>
            <div v-else class="space-y-3">
              <RouterLink
                v-for="cycle in cycles"
                :key="cycle.id"
                :to="cycleRoute(cycle)"
                class="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                @click="emit('close')"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Cycle {{ cycle.cycle }}
                  </span>
                  <StatusBadge :status="cycle.status" />
                </div>
                <p class="text-sm font-medium text-gray-900 mt-2">{{ cycle.trainer_name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ formatDate(cycle.started_at) }} –
                  {{ cycle.completed_at ? formatDate(cycle.completed_at) : 'Ongoing' }}
                </p>
                <div class="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary rounded-full"
                    :style="{ width: `${cycle.progress}%` }"
                  />
                </div>
                <p class="text-xs text-gray-400 mt-1">{{ cycle.progress }}% complete</p>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import StatusBadge from './StatusBadge.vue'
import { onboardingService } from '@/modules/shared/services/onboardingService'
import { useDateTime } from '@/modules/shared/composables/useDateTime'
import { useToast } from '@/modules/shared/composables/useToast'
import { extractErrorMessage } from '@core/services/error.handler'

const props = defineProps({
  open: { type: Boolean, default: false },
  onboardingId: { type: [String, Number], required: true },
  role: { type: String, default: 'trainer' }
})
const emit = defineEmits(['close'])
const { formatDate } = useDateTime()
const { error } = useToast()
const cycles = ref([])
const loading = ref(false)

function cycleRoute(cycle) {
  return props.role === 'trainer'
    ? `/trainer/onboarding/${cycle.id}`
    : `/sales/onboarding/${cycle.id}`
}

watch(() => props.open, async (val) => {
  if (!val || cycles.value.length) return
  loading.value = true
  try {
    cycles.value = await onboardingService.getCycleHistory(props.onboardingId)
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
