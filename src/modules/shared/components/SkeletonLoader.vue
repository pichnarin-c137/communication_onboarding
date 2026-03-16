<template>
  <div class="animate-pulse space-y-4">
    <!-- Card skeleton -->
    <div v-if="type === 'cards'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in count" :key="i" class="bg-white rounded-xl p-6 border border-gray-100">
        <div class="skeleton h-4 w-24 mb-3"></div>
        <div class="skeleton h-8 w-16 mb-2"></div>
        <div class="skeleton h-3 w-32"></div>
      </div>
    </div>

    <!-- Table skeleton -->
    <div v-else-if="type === 'table'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <div class="skeleton h-5 w-48"></div>
      </div>
      <div v-for="i in count" :key="i" class="flex items-center gap-4 px-4 py-4 border-b border-gray-50">
        <div class="skeleton w-10 h-10 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-4 w-40"></div>
          <div class="skeleton h-3 w-24"></div>
        </div>
        <div class="skeleton h-6 w-20 rounded-full"></div>
        <div class="skeleton h-3 w-32"></div>
      </div>
    </div>

    <!-- List skeleton -->
    <div v-else class="space-y-3">
      <div v-for="i in count" :key="i" class="bg-white rounded-xl p-4 border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="skeleton w-10 h-10 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-3/4"></div>
            <div class="skeleton h-3 w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'list' },
  count: { type: Number, default: 4 }
})
</script>
