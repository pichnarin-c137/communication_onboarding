<template>
  <!-- Bottom Tab Navigation -->
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe lg:hidden">
    <div class="flex items-center justify-around h-16">
      <router-link
        v-for="item in tabs"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center gap-0.5 w-full h-full touch-target transition-colors"
        :class="isActive(item.to)
          ? 'text-primary'
          : 'text-gray-400 hover:text-gray-600'"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineProps({
  tabs: { type: Array, required: true }
})

const route = useRoute()

function isActive(path) {
  return route.path === path || (path !== '/trainer' && path !== '/sales' && route.path.startsWith(path))
}
</script>
