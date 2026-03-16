<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">System</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="item in items"
            :key="item.id"
            class="hover:bg-gray-50/50 transition-colors cursor-pointer"
            @click="$emit('view', item)"
          >
            <td class="px-4 py-3.5">
              <span class="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{{ item.request_code }}</span>
            </td>
            <td class="px-4 py-3.5">
              <p class="text-sm font-medium text-gray-900">{{ item.client?.company_name || '—' }}</p>
            </td>
            <td class="px-4 py-3.5">
              <span class="text-sm text-gray-700">{{ item.system?.name || '—' }}</span>
            </td>
            <td class="px-4 py-3.5">
              <span :class="priorityClass(item.priority)" class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                {{ item.priority }}
              </span>
            </td>
            <td class="px-4 py-3.5">
              <StatusBadge :status="item.status" />
            </td>
            <td class="px-4 py-3.5 min-w-[140px]">
              <ProgressBar :percentage="item.overall_progress || 0" :show-label="false" :height="4" />
              <span class="text-xs text-gray-500 mt-1 block">{{ Math.round(item.overall_progress || 0) }}%</span>
            </td>
            <td class="px-4 py-3.5 text-right" @click.stop>
              <div class="flex items-center justify-end gap-1">
                <button
                  v-if="item.status === 'pending'"
                  @click="$emit('assign', item)"
                  class="px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Assign
                </button>
                <button
                  @click="$emit('view', item)"
                  class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <EyeIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden divide-y divide-gray-100">
      <div
        v-for="item in items"
        :key="item.id"
        class="p-4 hover:bg-gray-50/50 active:bg-gray-100 transition-colors cursor-pointer"
        @click="$emit('view', item)"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ item.client?.company_name || '—' }}</p>
            <p class="text-xs text-gray-500">{{ item.system?.name || '—' }}</p>
          </div>
          <StatusBadge :status="item.status" />
        </div>
        <div class="flex items-center justify-between mt-3">
          <span class="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{ item.request_code }}</span>
          <span :class="priorityClass(item.priority)" class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">
            {{ item.priority }}
          </span>
        </div>
        <ProgressBar :percentage="item.overall_progress || 0" :show-label="false" :height="4" class="mt-2.5" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="py-12 text-center">
      <ClipboardDocumentListIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-sm font-medium text-gray-500">No onboarding requests found</p>
      <p class="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
    </div>

    <!-- Footer count -->
    <div v-if="items.length > 0" class="px-4 py-3 border-t border-gray-200 bg-gray-50/50">
      <p class="text-xs text-gray-500">
        Showing <span class="font-medium">{{ items.length }}</span> result{{ items.length !== 1 ? 's' : '' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { EyeIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import ProgressBar from '@/modules/shared/components/ProgressBar.vue'

defineProps({
  items: { type: Array, required: true }
})

defineEmits(['view', 'assign'])

function priorityClass(priority) {
  const map = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-blue-100 text-blue-700',
    low: 'bg-gray-100 text-gray-600'
  }
  return map[priority] || 'bg-gray-100 text-gray-600'
}
</script>
