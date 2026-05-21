<template>
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div v-if="loading" class="p-8 text-center text-gray-400 text-sm">Loading users...</div>

    <div v-else-if="!users.length" class="p-8 text-center text-gray-400 text-sm">No users found.</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="user in users"
            :key="user.id"
            :class="[
              'hover:bg-gray-50 transition-colors cursor-pointer',
              isDeleted(user) ? 'opacity-60' : ''
            ]"
            @click="$emit('view', user)"
          >
            <!-- User avatar + name -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-semibold text-primary">{{ initials(user) }}</span>
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ displayName(user) }}</p>
                  <p class="text-xs text-gray-500 truncate">@{{ user.username }}</p>
                </div>
              </div>
            </td>

            <!-- Role badge -->
            <td class="px-4 py-3">
              <span :class="roleBadgeClass(user.role)" class="px-2 py-0.5 rounded text-xs font-medium capitalize">
                {{ user.role }}
              </span>
            </td>

            <!-- Email -->
            <td class="px-4 py-3 text-gray-600 truncate max-w-[200px]">{{ user.email || '—' }}</td>

            <!-- Status -->
            <td class="px-4 py-3">
              <UserStatusBadge :user="user" />
            </td>

            <!-- Created -->
            <td class="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{{ formatDate(user.created_at) }}</td>

            <!-- Actions menu -->
            <td class="px-4 py-3" @click.stop>
              <div class="relative" v-click-outside="() => closeMenu(user.id)">
                <button
                  @click="toggleMenu(user.id)"
                  class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <EllipsisVerticalIcon class="w-4 h-4" />
                </button>

                <div
                  v-if="openMenu === user.id"
                  class="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1"
                >
                  <button @click="action('view', user)" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">View Detail</button>
                  <button v-if="!isDeleted(user)" @click="action('editInfo', user)" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Edit Info</button>
                  <button v-if="!isDeleted(user)" @click="action('editCredentials', user)" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Edit Credentials</button>
                  <div v-if="!isDeleted(user)" class="my-1 border-t border-gray-100"></div>
                  <button v-if="!isDeleted(user)" @click="action('suspend', user)" :class="user.is_suspended ? 'w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-50 transition-colors' : 'w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-50 transition-colors'">
                    {{ user.is_suspended ? 'Unsuspend' : 'Suspend' }}
                  </button>
                  <button v-if="!isDeleted(user)" @click="action('forceReset', user)" class="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 transition-colors">Force Password Reset</button>
                  <div class="my-1 border-t border-gray-100"></div>
                  <button v-if="isDeleted(user)" @click="action('restore', user)" class="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-50 transition-colors">Restore</button>
                  <button v-if="!isDeleted(user)" @click="action('softDelete', user)" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors">Delete</button>
                  <button v-if="isDeleted(user)" @click="action('hardDelete', user)" class="w-full text-left px-4 py-2 text-sm font-medium text-red-700 hover:bg-gray-50 transition-colors">Permanently Delete</button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import UserStatusBadge from './UserStatusBadge.vue'

defineProps({
  users: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['view', 'editInfo', 'editCredentials', 'suspend', 'forceReset', 'softDelete', 'hardDelete', 'restore'])

const openMenu = ref(null)

function toggleMenu(id) { openMenu.value = openMenu.value === id ? null : id }
function closeMenu(id) { if (openMenu.value === id) openMenu.value = null }

function action(type, user) {
  openMenu.value = null
  emit(type, user)
}

function isDeleted(user) { return !!user.is_deleted || !!user.deleted_at }

function initials(user) {
  const f = user.first_name?.[0] || ''
  const l = user.last_name?.[0] || ''
  return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || '?'
}

function displayName(user) {
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim()
  return name || user.username || 'Unknown'
}

function roleBadgeClass(role) {
  if (role === 'admin') return 'bg-purple-100 text-purple-700'
  if (role === 'sale') return 'bg-blue-100 text-blue-700'
  if (role === 'trainer') return 'bg-teal-100 text-teal-700'
  return 'bg-gray-100 text-gray-600'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Simple click-outside directive
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutsideHandler = (event) => {
      if (!el.contains(event.target)) binding.value(event)
    }
    document.addEventListener('click', el._clickOutsideHandler)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutsideHandler)
  }
}
</script>

