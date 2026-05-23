<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop" @click.self="$emit('cancel')">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <TrashIcon class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">{{ hard ? 'Permanently Delete User' : 'Delete User' }}</h3>
          </div>

          <p class="text-sm text-gray-600 mb-2">
            <span v-if="hard">
              This will <strong>permanently remove</strong> <span class="font-medium text-gray-900">{{ userName }}</span> and all their data. This action cannot be undone.
            </span>
            <span v-else>
              Are you sure you want to delete <span class="font-medium text-gray-900">{{ userName }}</span>? They can be restored later.
            </span>
          </p>

          <div v-if="hard" class="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            This is irreversible. All associated data will be permanently removed.
          </div>

          <div class="flex gap-3 justify-end">
            <button @click="$emit('cancel')"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button @click="$emit('confirm')" :disabled="loading"
              class="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ hard ? 'Delete Permanently' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { TrashIcon } from '@heroicons/vue/24/outline'

defineProps({
  open: { type: Boolean, default: false },
  hard: { type: Boolean, default: false },
  userName: { type: String, default: 'this user' },
  loading: { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel'])
</script>
