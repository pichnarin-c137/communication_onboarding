<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full">

        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Assign Trainer</h2>
            <p class="text-sm text-gray-500 mt-0.5">
              For {{ request.client?.company_name }} — {{ request.system?.name }}
            </p>
          </div>
          <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-4">

          <!-- Trainer selector (shown while loading OR when trainers are available) -->
          <div v-if="loadingTrainers || trainers.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Trainer <span class="text-red-500">*</span>
            </label>
            <AppSelect
              v-model="selectedTrainerId"
              :options="trainers"
              :loading="loadingTrainers"
              placeholder="Select a trainer…"
              search-placeholder="Search by name or phone…"
              empty-text="No trainers found"
              clearable
              remote
              @search="onTrainerSearch"
            />
          </div>

          <!-- Fallback UUID input (only when loading finished with zero trainers) -->
          <div v-else>
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p class="text-xs text-amber-700">
                No trainer list available. Enter the trainer's UUID to assign them directly.
              </p>
            </div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Trainer ID (UUID)</label>
            <input
              v-model="manualTrainerId"
              type="text"
              placeholder="e.g. bbbbbbbb-0000-0000-0000-000000000002"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Assignment Notes <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              v-model="notes"
              rows="2"
              placeholder="Any special instructions for the trainer…"
              class="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex gap-3 justify-end px-5 pb-5">
          <button
            @click="$emit('close')"
            class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmAssign"
            :disabled="!effectiveTrainerId || isAssigning"
            class="px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="isAssigning" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ isAssigning ? 'Assigning…' : 'Assign Trainer' }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import AppSelect from '@/modules/shared/components/AppSelect.vue'
import { useSaleStore } from '@/modules/sale/store/sale.js'

const props = defineProps({
  request: { type: Object, required: true },
  trainers: { type: Array, default: () => [] },
  loadingTrainers: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'assign'])

const saleStore = useSaleStore()

const existingTrainerId = props.request.trainer_id ?? props.request.trainer?.id ?? null

const selectedTrainerId = ref(existingTrainerId)
const manualTrainerId   = ref('')
const notes             = ref('')
const isAssigning       = ref(false)

const effectiveTrainerId = computed(() =>
  props.trainers.length > 0
    ? selectedTrainerId.value || null
    : manualTrainerId.value.trim() || null
)

let _searchTimer = null
function onTrainerSearch(query) {
  clearTimeout(_searchTimer)
  _searchTimer = setTimeout(() => saleStore.fetchTrainers(query), 300)
}
onUnmounted(() => clearTimeout(_searchTimer))

function confirmAssign() {
  if (!effectiveTrainerId.value) return
  isAssigning.value = true
  emit('assign', {
    requestId: props.request.id,
    trainerId: effectiveTrainerId.value,
    notes: notes.value
  })
}
</script>
