<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop"
        @click.self="$emit('close')"
      >
        <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon class="w-5 h-5 text-orange-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ title }}
            </h3>
          </div>

          <p class="text-sm text-gray-600 mb-4">
            This trainer has active commitments that block this action. Resolve each item below, then try again.
          </p>

          <div class="space-y-2 mb-5">
            <div
              v-for="item in items"
              :key="item.label"
              class="flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <component :is="item.icon" class="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span class="text-sm text-gray-700">{{ item.label }}</span>
              </div>
              <span
                class="px-2 py-0.5 text-xs font-semibold rounded"
                :class="item.count > 0
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-500'"
              >
                {{ item.count }}
              </span>
            </div>
          </div>

          <div class="px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 mb-5">
            <p class="font-medium mb-0.5">How to resolve</p>
            <p>
              Remove this trainer from each sale's roster, reassign or complete their active onboardings and
              in-progress appointments, then retry.
            </p>
          </div>

          <div class="flex justify-end">
            <button
              @click="$emit('close')"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import {
  ExclamationTriangleIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  open: { type: Boolean, default: false },
  action: { type: String, default: 'suspend' }, // 'suspend' | 'delete'
  context: { type: Object, default: () => ({}) },
})

defineEmits(['close'])

const title = computed(() =>
  props.action === 'delete' ? 'Cannot Delete Trainer' : 'Cannot Suspend Trainer',
)

const items = computed(() => [
  {
    label: 'Active onboardings',
    count: props.context.active_onboardings ?? 0,
    icon: AcademicCapIcon,
  },
  {
    label: 'In-progress appointments',
    count: props.context.in_progress_appointments ?? 0,
    icon: CalendarDaysIcon,
  },
  {
    label: 'Sales relying on this trainer',
    count: props.context.roster_memberships ?? 0,
    icon: UsersIcon,
  },
])
</script>
