<template>
  <span :class="badgeClass" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium">
    <span :class="dotClass" class="w-1.5 h-1.5 rounded-full"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: { type: Object, required: true }
})

const isDeleted = computed(() => !!props.user.is_deleted || !!props.user.deleted_at)
const isSuspended = computed(() => !!props.user.is_suspended)

const label = computed(() => {
  if (isDeleted.value) return 'Deleted'
  if (isSuspended.value) return 'Suspended'
  return 'Active'
})

const badgeClass = computed(() => {
  if (isDeleted.value) return 'bg-gray-100 text-gray-600'
  if (isSuspended.value) return 'bg-red-50 text-red-700'
  return 'bg-green-50 text-green-700'
})

const dotClass = computed(() => {
  if (isDeleted.value) return 'bg-gray-400'
  if (isSuspended.value) return 'bg-red-500'
  return 'bg-green-500'
})
</script>
