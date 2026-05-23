<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop"
        @click.self="onClose"
      >
        <div class="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Edit Dedicated Trainers</h2>
              <p class="text-xs text-gray-500 mt-0.5">
                Atomically replaces the entire roster. Minimum {{ MIN_TRAINERS }} required.
              </p>
            </div>
            <button @click="onClose" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-4">
            <DedicatedTrainerPicker
              v-model="trainerIds"
              :min="MIN_TRAINERS"
              :invalid="showInvalid"
              :hint="showInvalid ? `Select at least ${MIN_TRAINERS} trainer.` : ''"
              :initial-trainers="seedTrainers"
              :flagged-ids="flaggedIds"
              @change="touched = true"
            />

            <!-- Workload error context -->
            <div
              v-if="workloadError"
              class="px-3 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 space-y-1"
            >
              <p class="font-medium">Workload cap reached</p>
              <p class="text-xs">
                {{ workloadCapLabel(workloadError.cap) }} — currently
                <strong>{{ workloadError.current }}</strong>
                of <strong>{{ workloadError.threshold }}</strong>.
              </p>
              <p class="text-xs text-red-600/80">
                The offending trainer is highlighted in the picker. Remove or replace them, then try again.
              </p>
            </div>

            <p v-else-if="error" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {{ error }}
            </p>
          </div>

          <!-- Footer -->
          <div class="flex gap-3 justify-end px-6 pb-5">
            <button
              type="button"
              @click="onClose"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="submit"
              :disabled="loading || isInvalid"
              class="px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ loading ? 'Saving…' : 'Save Roster' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import DedicatedTrainerPicker from '@/modules/shared/components/DedicatedTrainerPicker.vue'

const MIN_TRAINERS = 1

const props = defineProps({
  open: { type: Boolean, default: false },
  currentTrainers: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'submit'])

const trainerIds = ref([])
const loading = ref(false)
const error = ref('')
const workloadError = ref(null)
const touched = ref(false)
const submitAttempted = ref(false)

const seedTrainers = computed(() =>
  props.currentTrainers.map((t) => ({
    id: t.trainer_user_id,
    first_name: t.first_name,
    last_name: t.last_name,
    full_name: t.full_name,
  })),
)

const flaggedIds = computed(() =>
  workloadError.value?.trainer_user_id ? [workloadError.value.trainer_user_id] : [],
)

const isInvalid = computed(() => trainerIds.value.length < MIN_TRAINERS)
const showInvalid = computed(() => isInvalid.value && (touched.value || submitAttempted.value))

watch(
  () => props.open,
  (val) => {
    if (val) {
      trainerIds.value = props.currentTrainers.map((t) => t.trainer_user_id)
      error.value = ''
      workloadError.value = null
      touched.value = false
      submitAttempted.value = false
    }
  },
)

function onClose() {
  if (loading.value) return
  emit('close')
}

function submit() {
  submitAttempted.value = true
  if (isInvalid.value) return
  loading.value = true
  error.value = ''
  workloadError.value = null
  emit('submit', trainerIds.value)
}

function workloadCapLabel(cap) {
  const labels = {
    max_concurrent_active_onboardings_per_trainer: 'Max concurrent active onboardings',
    max_sales_per_trainer: 'Max sales per trainer',
    block_if_in_progress_appointment: 'In-progress appointment block',
    max_pending_appointments_per_trainer: 'Max pending appointments',
  }
  return labels[cap] || cap || 'Workload cap'
}

defineExpose({
  setLoading: (v) => { loading.value = v },
  setError: (msg) => { error.value = msg },
  setWorkloadError: (ctx) => { workloadError.value = ctx },
})
</script>
