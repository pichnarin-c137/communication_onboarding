<template>
  <div class="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium',
          toastClasses(toast.type)
        ]"
      >
        <component :is="toastIcon(toast.type)" class="w-5 h-5 flex-shrink-0" />
        <span class="flex-1">{{ toast.message }}</span>
        <button
          @click="removeToast(toast.id)"
          class="text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/solid'
import { useToast } from '@/modules/shared/composables/useToast.js'

const { toasts, removeToast } = useToast()

function toastClasses(type) {
  const classes = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  }
  return classes[type] || classes.info
}

function toastIcon(type) {
  const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  return icons[type] || icons.info
}
</script>
