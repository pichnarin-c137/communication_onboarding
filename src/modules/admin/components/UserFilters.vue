<template>
  <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-700">Filters</span>
      <button v-if="hasActive" @click="$emit('reset')" class="text-xs text-primary hover:underline">Reset all</button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- Role -->
      <select v-model="localFilters.role" @change="emit('change')"
        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="sale">Sale</option>
        <option value="trainer">Trainer</option>
      </select>

      <!-- Status -->
      <select v-model="statusMode" @change="onStatusChange"
        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
        <option value="">All Statuses</option>
        <option value="active">Active only</option>
        <option value="suspended">Suspended</option>
        <option value="deleted">Deleted</option>
      </select>

      <!-- Gender -->
      <select v-model="localFilters.gender" @change="emit('change')"
        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
        <option value="">All Genders</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      <!-- Nationality -->
      <input v-model="localFilters.nationality" @input="emit('change')" placeholder="Nationality..."
        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary" />
    </div>

    <!-- Search -->
    <div class="relative">
      <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input v-model="localFilters.search" @input="emit('change')" placeholder="Search by name, email, username..."
        class="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary" />
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue', 'change', 'reset'])

const localFilters = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const statusMode = ref('')

watch(() => props.modelValue, (val) => {
  if (val.only_trashed) statusMode.value = 'deleted'
  else if (val.is_suspended === true || val.is_suspended === 'true') statusMode.value = 'suspended'
  else if (val.only_active) statusMode.value = 'active'
  else statusMode.value = ''
}, { immediate: true })

function onStatusChange() {
  localFilters.value.only_trashed = statusMode.value === 'deleted'
  localFilters.value.only_active = statusMode.value === 'active'
  localFilters.value.is_suspended = statusMode.value === 'suspended' ? true : ''
  emit('change')
}

const hasActive = computed(() => {
  const f = props.modelValue
  return f.search || f.role || f.gender || f.nationality || f.only_trashed || f.only_active || f.is_suspended !== ''
})
</script>
