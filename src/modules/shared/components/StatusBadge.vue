<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
    :style="{ backgroundColor: config.bg, color: config.text }"
  >
    <span
      class="w-1.5 h-1.5 rounded-full"
      :style="{ backgroundColor: config.dot }"
    ></span>
    {{ config.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const statusMap = {
  // Onboarding request statuses
  pending:     { label: 'Pending',     bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
  assigned:    { label: 'Assigned',    bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  in_progress: { label: 'In Progress', bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  completed:   { label: 'Completed',   bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  cancelled:   { label: 'Cancelled',   bg: '#FEE2E2', text: '#DC2626', dot: '#F87171' },
  // Assignment statuses
  accepted:    { label: 'Accepted',    bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  rejected:    { label: 'Rejected',    bg: '#FEE2E2', text: '#DC2626', dot: '#F87171' },
  // Appointment statuses
  leave_office: { label: 'Leave Office', bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  done:        { label: 'Done',        bg: '#EDE9FE', text: '#6D28D9', dot: '#8B5CF6' },
  // Session statuses
  scheduled:   { label: 'Scheduled',   bg: '#DBEAFE', text: '#1D4ED8', dot: '#60A5FA' },
  rescheduled: { label: 'Rescheduled', bg: '#FEF9C3', text: '#A16207', dot: '#EAB308' },
  // Attendance statuses
  invited:     { label: 'Invited',     bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF' },
  confirmed:   { label: 'Confirmed',   bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  attended:    { label: 'Attended',    bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  absent:      { label: 'Absent',      bg: '#FEE2E2', text: '#DC2626', dot: '#F87171' },
  // Stage progress statuses
  not_started: { label: 'Not Started', bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF' },
  skipped:     { label: 'Skipped',     bg: '#E5E7EB', text: '#6B7280', dot: '#9CA3AF' },
  // Priority
  low:         { label: 'Low',         bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF' },
  medium:      { label: 'Medium',      bg: '#DBEAFE', text: '#1D4ED8', dot: '#60A5FA' },
  high:        { label: 'High',        bg: '#FFEDD5', text: '#C2410C', dot: '#FB923C' },
  urgent:      { label: 'Urgent',      bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
  delayed:     { label: 'Delayed',     bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
  // Telegram group statuses
  connected:   { label: 'Connected',   bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  removed:     { label: 'Removed',     bg: '#FEE2E2', text: '#DC2626', dot: '#F87171' },
  reconnected: { label: 'Reconnected', bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  // Telegram message statuses
  sent:        { label: 'Sent',        bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  failed:      { label: 'Failed',      bg: '#FEE2E2', text: '#DC2626', dot: '#F87171' },
}

const config = computed(() =>
  statusMap[props.status] || { label: props.status, bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF' }
)
</script>
