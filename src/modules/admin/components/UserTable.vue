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

            <!-- Actions — single ⋮ trigger; menu is teleported (see below) -->
            <td class="px-4 py-3 text-right" @click.stop>
              <button
                @click="toggleMenu(user, $event)"
                :class="[
                  'p-1.5 rounded-lg transition-colors',
                  activeUser?.id === user.id
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                ]"
              >
                <EllipsisVerticalIcon class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Actions menu — teleported to body so it floats above the table and is
         never clipped by the card's overflow. Flips up/down based on space. -->
    <Teleport to="body">
      <template v-if="activeUser">
        <div class="fixed inset-0 z-[60]" @click="closeMenu"></div>
        <div
          class="fixed z-[61] w-52 bg-white border border-gray-200 rounded-xl shadow-lg ring-1 ring-black/5 py-1.5"
          :style="menuStyle"
        >
          <button @click="action('view', activeUser)" :class="menuItem">
            <EyeIcon class="w-4 h-4 text-gray-400" /> View detail
          </button>
          <button v-if="canImpersonate(activeUser)" @click="action('forceLogin', activeUser)" :class="menuItem">
            <ArrowRightOnRectangleIcon class="w-4 h-4 text-gray-400" /> Force login
          </button>

          <template v-if="!isDeleted(activeUser)">
            <button @click="action('editInfo', activeUser)" :class="menuItem">
              <PencilSquareIcon class="w-4 h-4 text-gray-400" /> Edit info
            </button>
            <button @click="action('editCredentials', activeUser)" :class="menuItem">
              <KeyIcon class="w-4 h-4 text-gray-400" /> Edit credentials
            </button>

            <div class="my-1.5 border-t border-gray-100"></div>

            <button @click="action('suspend', activeUser)" :class="[menuItem, activeUser.is_suspended ? 'text-green-600' : 'text-orange-600']">
              <component :is="activeUser.is_suspended ? PlayCircleIcon : PauseCircleIcon" class="w-4 h-4" />
              {{ activeUser.is_suspended ? 'Unsuspend' : 'Suspend' }}
            </button>
            <button @click="action('forceReset', activeUser)" :class="[menuItem, 'text-blue-600']">
              <ArrowPathIcon class="w-4 h-4" /> Reset password
            </button>

            <div class="my-1.5 border-t border-gray-100"></div>

            <button @click="action('softDelete', activeUser)" :class="[menuItem, 'text-red-600']">
              <TrashIcon class="w-4 h-4" /> Delete
            </button>
          </template>

          <template v-else>
            <button @click="action('restore', activeUser)" :class="[menuItem, 'text-green-600']">
              <ArrowUturnLeftIcon class="w-4 h-4" /> Restore
            </button>
            <button @click="action('hardDelete', activeUser)" :class="[menuItem, 'text-red-700 font-medium']">
              <FireIcon class="w-4 h-4" /> Permanently delete
            </button>
          </template>
        </div>
      </template>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilSquareIcon,
  KeyIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowRightOnRectangleIcon,
  FireIcon,
} from '@heroicons/vue/24/outline'
import UserStatusBadge from './UserStatusBadge.vue'

defineProps({
  users: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['view', 'editInfo', 'editCredentials', 'suspend', 'forceReset', 'forceLogin', 'softDelete', 'hardDelete', 'restore'])

// Shared menu-item styling
const menuItem = 'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'

const activeUser = ref(null)
const menuStyle = ref({})

const MENU_WIDTH = 208 // matches w-52
const MENU_HEIGHT = 360

function toggleMenu(user, event) {
  if (activeUser.value?.id === user.id) {
    activeUser.value = null
    return
  }
  const rect = event.currentTarget.getBoundingClientRect()
  const left = `${Math.max(8, rect.right - MENU_WIDTH)}px`
  const openUp = window.innerHeight - rect.bottom < MENU_HEIGHT
  menuStyle.value = openUp
    ? { left, bottom: `${window.innerHeight - rect.top + 6}px` }
    : { left, top: `${rect.bottom + 6}px` }
  activeUser.value = user
}

function closeMenu() { activeUser.value = null }

function action(type, user) {
  activeUser.value = null
  emit(type, user)
}

onMounted(() => {
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

onUnmounted(() => {
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
})

function isDeleted(user) { return !!user.is_deleted || !!user.deleted_at }

// Force-login is only allowed for active sale/trainer accounts (the API rejects
// admin/user targets and suspended/deleted users).
function canImpersonate(user) {
  return (user.role === 'sale' || user.role === 'trainer') && !user.is_suspended && !isDeleted(user)
}

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
</script>

