<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">My Trainers</h3>
        <p class="text-xs text-gray-500 mt-0.5">Live status and workload at a glance</p>
      </div>
      <router-link to="/sales/trainers" class="text-xs text-primary hover:underline">
        View all →
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="store.rosterLoading && store.roster.length === 0" class="flex gap-3 overflow-hidden">
      <div v-for="i in 3" :key="i" class="min-w-[260px] flex-1 bg-gray-50 rounded-xl p-3 animate-pulse">
        <div class="flex gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-200" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 bg-gray-200 rounded w-24" />
            <div class="h-2 bg-gray-100 rounded w-16" />
          </div>
        </div>
        <div class="mt-3 space-y-1.5">
          <div class="h-1 bg-gray-100 rounded w-full" />
          <div class="h-1 bg-gray-100 rounded w-full" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="store.roster.length === 0" class="py-6 text-center">
      <UserGroupIcon class="w-9 h-9 text-gray-300 mx-auto mb-2" />
      <p class="text-sm text-gray-500">No dedicated trainers yet.</p>
      <p class="text-xs text-gray-400 mt-0.5">Ask your admin to assign one.</p>
    </div>

    <!-- Top trainers — horizontally scrollable -->
    <div v-else class="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
      <div
        v-for="t in topTrainers"
        :key="t.trainer_user_id"
        class="snap-start flex-shrink-0"
      >
        <TrainerRosterCard :trainer="t" compact />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { UserGroupIcon } from '@heroicons/vue/24/outline'
import { useMyTrainersStore } from '@/modules/sale/store/myTrainers.js'
import TrainerRosterCard from '@/modules/sale/components/TrainerRosterCard.vue'

const store = useMyTrainersStore()

const topTrainers = computed(() => {
  return [...store.roster]
    .sort((a, b) => {
      const ta = a.last_interaction_at ? new Date(a.last_interaction_at).getTime() : 0
      const tb = b.last_interaction_at ? new Date(b.last_interaction_at).getTime() : 0
      return tb - ta
    })
    .slice(0, 4)
})

onMounted(() => {
  if (!store.rosterLoaded && !store.rosterLoading) {
    store.fetchRoster().catch(() => {})
  }
})
</script>
