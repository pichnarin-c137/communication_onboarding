<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />

      <!-- Panel -->
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <!-- Header -->
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrophyIcon class="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900">Mark deal as Won?</h2>
              <p class="text-sm text-gray-600 mt-1 leading-relaxed">
                Marking this deal as Won will sync
                <span class="font-medium text-gray-900">{{ companyName }}</span>
                as a real client in COMS. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <!-- Detail strip -->
        <div class="mx-6 mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div class="flex items-center gap-2 text-sm">
            <CheckCircleIcon class="w-4 h-4 text-emerald-600 shrink-0" />
            <span class="text-emerald-800 font-medium">{{ companyName }}</span>
            <span class="text-emerald-600">will be available in the Clients dropdown for appointment creation.</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="$emit('confirm')"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            <TrophyIcon v-else class="w-4 h-4" />
            Mark as Won &amp; Sync
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { TrophyIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

defineProps({
  companyName: {
    type: String,
    default: 'this company'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])
</script>
