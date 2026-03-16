<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop" @click.self="$emit('cancel')">
        <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
          <div class="flex items-center gap-3 mb-4">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center', iconBg]">
              <ExclamationTriangleIcon v-if="type === 'warning'" class="w-5 h-5 text-amber-600" />
              <TrashIcon v-else-if="type === 'danger'" class="w-5 h-5 text-red-600" />
              <InformationCircleIcon v-else class="w-5 h-5 text-blue-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          </div>
          <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
          <div class="flex gap-3 justify-end">
            <button
              @click="$emit('cancel')"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="$emit('confirm')"
              :class="[
                'px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors',
                type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'
              ]"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { ExclamationTriangleIcon, TrashIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  type: { type: String, default: 'warning' }
})

defineEmits(['confirm', 'cancel'])

const iconBg = computed(() => {
  if (props.type === 'danger') return 'bg-red-100'
  if (props.type === 'warning') return 'bg-amber-100'
  return 'bg-blue-100'
})
</script>
