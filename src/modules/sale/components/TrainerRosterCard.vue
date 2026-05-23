<template>
  <router-link
    :to="`/sales/trainers/${trainer.trainer_user_id}`"
    class="block bg-white border border-gray-200 rounded-xl hover:border-primary/40 hover:shadow-sm transition-all"
    :class="compact ? 'p-3 min-w-[260px]' : 'p-5'"
  >
    <!-- Header: avatar + name + live dot -->
    <div class="flex items-start gap-3">
      <div class="relative flex-shrink-0">
        <Avatar
          :name="trainer.full_name || fullName"
          :src="trainer.avatar_url || ''"
          :size="compact ? 'md' : 'lg'"
        />
        <span
          class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
          :class="liveStatusDotClass"
          :title="liveStatusLabel"
        />
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900 truncate">{{ trainer.full_name || fullName }}</p>
        <p class="text-xs text-gray-500 truncate" :class="compact ? '' : 'mt-0.5'">
          <span v-if="trainer.phone_number">{{ trainer.phone_number }}</span>
          <span v-else class="text-gray-400">No phone on file</span>
        </p>

        <div class="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
             :class="liveStatusPillClass">
          <span class="w-1.5 h-1.5 rounded-full" :class="liveStatusDotClass" />
          {{ liveStatusLabel }}
        </div>
      </div>
    </div>

    <!-- Workload meters -->
    <div :class="compact ? 'mt-3 space-y-2' : 'mt-4 space-y-2.5'">
      <RosterMeter
        label="Onboardings"
        :value="trainer.workload?.active_onboardings ?? 0"
        :cap="caps.onboardings"
      />
      <RosterMeter
        label="Pending appts"
        :value="trainer.workload?.pending_appointments ?? 0"
        :cap="caps.pendingAppointments"
      />
    </div>

    <!-- Footer: today + last interaction -->
    <div :class="compact ? 'mt-3' : 'mt-4'"
         class="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
      <div class="flex items-center gap-1.5 text-xs text-gray-600">
        <CalendarDaysIcon class="w-3.5 h-3.5 text-gray-400" />
        <span>{{ trainer.workload?.today_appointments ?? 0 }} today</span>
        <span v-if="trainer.workload?.in_progress_appointment" class="ml-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wide">
          Now
        </span>
      </div>
      <p class="text-[11px] text-gray-400">
        {{ lastInteractionLabel }}
      </p>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'
import Avatar from '@/modules/shared/components/Avatar.vue'
import RosterMeter from '@/modules/sale/components/RosterMeter.vue'

const props = defineProps({
  trainer: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  // Optional cap overrides — fall back to safe defaults that match config/coms.php
  caps: {
    type: Object,
    default: () => ({
      onboardings: 5,
      pendingAppointments: 10,
    }),
  },
})

const fullName = computed(() =>
  `${props.trainer.first_name || ''} ${props.trainer.last_name || ''}`.trim() || 'Trainer',
)

const liveStatusLabel = computed(() => {
  const map = {
    at_office: 'At office',
    leave_office: 'Out',
    in_progress: 'In session',
    off_duty: 'Off duty',
    available: 'Available',
  }
  const key = props.trainer.live_status
  return map[key] || (key ? key.replace(/_/g, ' ') : 'Unknown')
})

const liveStatusDotClass = computed(() => {
  const map = {
    at_office: 'bg-emerald-500',
    available: 'bg-emerald-500',
    leave_office: 'bg-amber-500',
    in_progress: 'bg-blue-500',
    off_duty: 'bg-gray-400',
  }
  return map[props.trainer.live_status] || 'bg-gray-300'
})

const liveStatusPillClass = computed(() => {
  const map = {
    at_office: 'bg-emerald-50 text-emerald-700',
    available: 'bg-emerald-50 text-emerald-700',
    leave_office: 'bg-amber-50 text-amber-700',
    in_progress: 'bg-blue-50 text-blue-700',
    off_duty: 'bg-gray-100 text-gray-600',
  }
  return map[props.trainer.live_status] || 'bg-gray-100 text-gray-500'
})

const lastInteractionLabel = computed(() => {
  const iso = props.trainer.last_interaction_at
  if (!iso) return 'No interactions yet'
  const diff = Date.now() - new Date(iso).getTime()
  const m = 60_000
  if (diff < m) return 'just now'
  if (diff < 60 * m) return `${Math.floor(diff / m)}m ago`
  if (diff < 24 * 60 * m) return `${Math.floor(diff / (60 * m))}h ago`
  if (diff < 7 * 24 * 60 * m) return `${Math.floor(diff / (24 * 60 * m))}d ago`
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
})
</script>
