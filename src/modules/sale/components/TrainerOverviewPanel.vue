<template>
  <div class="space-y-5">
    <!-- Today's schedule -->
    <div class="bg-white border border-gray-200 rounded-xl p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900">Today's Schedule</h3>
        <span class="text-xs text-gray-500">
          {{ today.appointments_count ?? 0 }} appointment{{ (today.appointments_count ?? 0) === 1 ? '' : 's' }}
        </span>
      </div>

      <div v-if="today.next_appointment" class="bg-gray-50 border border-gray-100 rounded-lg p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs uppercase tracking-wider text-gray-500 font-semibold">Next up</p>
            <p class="text-sm font-medium text-gray-900 mt-1 truncate">
              {{ today.next_appointment.client_name || 'Appointment' }}
            </p>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ formatTimeRange(today.next_appointment.scheduled_start_time, today.next_appointment.scheduled_end_time) }}
              <span class="ml-1 text-gray-400">·</span>
              <span class="ml-1 capitalize">{{ today.next_appointment.location_type }}</span>
            </p>
          </div>
          <StatusBadge :status="today.next_appointment.status" size="xs" />
        </div>
        <router-link
          v-if="today.next_appointment.id"
          :to="`/sales/appointments/${today.next_appointment.id}`"
          class="inline-block mt-3 text-xs text-primary hover:underline"
        >
          View appointment →
        </router-link>
      </div>

      <div v-else class="py-6 text-center">
        <CalendarDaysIcon class="w-9 h-9 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">Nothing scheduled for today.</p>
      </div>
    </div>

    <!-- 30-day summary -->
    <div class="bg-white border border-gray-200 rounded-xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-900">Last 30 days</h3>
        <span class="text-xs text-gray-500">Filtered to your work</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatTile
          label="Completed"
          :value="summary.completed_appointments ?? 0"
          icon="check"
          tone="emerald"
        />
        <StatTile
          label="Cancelled"
          :value="summary.cancelled_appointments ?? 0"
          icon="x"
          tone="red"
        />
        <StatTile
          label="Rescheduled"
          :value="summary.rescheduled_appointments ?? 0"
          icon="arrow"
          tone="amber"
        />
        <StatTile
          label="No-shows"
          :value="summary.no_show_appointments ?? 0"
          icon="user-minus"
          tone="gray"
        />
        <StatTile
          label="Active onboardings"
          :value="summary.active_onboardings_for_this_sale ?? 0"
          icon="academic"
          tone="blue"
        />
        <StatTile
          label="Done onboardings"
          :value="summary.completed_onboardings_for_this_sale ?? 0"
          icon="academic"
          tone="emerald"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import {
  CalendarDaysIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  UserMinusIcon,
  AcademicCapIcon,
} from '@heroicons/vue/24/outline'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'

const props = defineProps({
  overview: { type: Object, required: true },
})

const { formatTime } = useDateTime()

const today = computed(() => props.overview?.today || {})
const summary = computed(() => props.overview?.summary_30d || {})

function formatTimeRange(start, end) {
  if (!start) return ''
  const s = formatTime(start)
  const e = end ? formatTime(end) : ''
  return e ? `${s} – ${e}` : s
}

// Local inline component for stat tiles
const StatTile = (props) => {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-50 text-blue-700',
  }
  const icons = {
    check: CheckIcon,
    x: XMarkIcon,
    arrow: ArrowPathIcon,
    'user-minus': UserMinusIcon,
    academic: AcademicCapIcon,
  }
  const Icon = icons[props.icon] || CheckIcon
  return h(
    'div',
    { class: 'border border-gray-100 bg-gray-50/40 rounded-lg p-3' },
    [
      h('div', { class: 'flex items-center gap-2' }, [
        h(
          'div',
          { class: `w-7 h-7 rounded-md flex items-center justify-center ${tones[props.tone] || tones.gray}` },
          [h(Icon, { class: 'w-4 h-4' })],
        ),
        h('p', { class: 'text-[11px] uppercase tracking-wide text-gray-500 font-semibold' }, props.label),
      ]),
      h('p', { class: 'text-2xl font-bold text-gray-900 mt-2 tabular-nums' }, String(props.value)),
    ],
  )
}
StatTile.props = ['label', 'value', 'icon', 'tone']
</script>
