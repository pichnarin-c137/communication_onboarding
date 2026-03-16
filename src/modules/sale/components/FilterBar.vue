<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
    <!-- Search -->
    <div class="relative flex-1 w-full sm:max-w-xs">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        :value="search"
        @input="$emit('update:search', $event.target.value)"
        type="text"
        placeholder="Search customers..."
        class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      />
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <select
        :value="statusFilter"
        @change="$emit('update:statusFilter', $event.target.value)"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="assigned">Assigned</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="delayed">Delayed</option>
      </select>

      <select
        :value="trainerFilter"
        @change="$emit('update:trainerFilter', $event.target.value)"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option value="">All Trainers</option>
        <option v-for="t in trainers" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

defineProps({
  search: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  trainerFilter: { type: [String, Number], default: '' },
  trainers: { type: Array, default: () => [] }
})

defineEmits(['update:search', 'update:statusFilter', 'update:trainerFilter'])
</script>
