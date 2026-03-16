<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-40 h-16">
    <div class="flex items-center h-full">

      <!-- Logo: width matches sidebar exactly -->
      <div
        :class="[
          'flex-shrink-0 flex items-center justify-center h-full border-r border-gray-100 transition-all duration-300',
          sidebarCollapsed ? 'w-16 lg:w-16' : 'w-64 lg:w-64'
        ]"
      >
        <router-link :to="homeRoute" class="flex items-center gap-2.5 px-3">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span class="text-white font-bold text-sm">CM</span>
          </div>
          <div v-if="!sidebarCollapsed" class="hidden lg:block">
            <span class="text-base font-bold text-gray-900 leading-tight">COMS</span>
            <span class="text-xs text-gray-500 block -mt-0.5">CheckinMe</span>
          </div>
        </router-link>
      </div>

      <!-- Middle: nav links (desktop) -->
      <div class="flex-1 flex items-center px-4 sm:px-6 overflow-hidden">
        <nav class="hidden lg:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            :class="isActive(item.to)
              ? 'bg-primary/10 text-primary'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <div class="flex items-center gap-2">
              <component :is="item.icon" class="w-4 h-4" />
              {{ item.label }}
            </div>
          </router-link>
        </nav>
      </div>

      <!-- Right: notification + user + mobile hamburger -->
      <div class="flex items-center gap-1 px-3 sm:px-4">

        <!-- Notification bell -->
        <div class="relative">
          <button
            @click="toggleNotifications"
            class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <BellIcon class="w-5 h-5" />
            <span
              v-if="notificationStore.unreadCount > 0"
              class="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white text-[10px] text-white font-bold flex items-center justify-center px-0.5"
            >
              {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
            </span>
          </button>

          <!-- Notification dropdown — anchored to bell button -->
          <Transition name="slide-down">
            <div
              v-if="showNotifications"
              class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
                <button
                  v-if="notificationStore.unreadCount > 0"
                  @click.stop="notificationStore.markAllAsRead()"
                  class="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div v-if="notificationStore.loading" class="p-4 space-y-2">
                <div v-for="i in 3" :key="i" class="h-12 bg-gray-100 rounded animate-pulse"></div>
              </div>
              <div v-else-if="notificationStore.notifications.length === 0" class="py-8 text-center">
                <BellIcon class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p class="text-sm text-gray-500">No notifications yet</p>
              </div>
              <div v-else class="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                <div
                  v-for="n in notificationStore.notifications"
                  :key="n.id"
                  :class="[
                    'px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 transition-colors',
                    n.is_read ? 'text-gray-500' : 'bg-blue-50/30 text-gray-900'
                  ]"
                  @click="handleNotificationClick(n)"
                >
                  <div class="flex items-start gap-2">
                    <span
                      v-if="!n.is_read"
                      class="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"
                    ></span>
                    <div :class="n.is_read ? 'pl-3.5' : ''">
                      <p class="font-medium leading-snug">{{ n.title }}</p>
                      <p class="text-xs mt-0.5 line-clamp-2 text-gray-500">{{ n.message }}</p>
                      <p class="text-xs text-gray-400 mt-1">{{ formatTime(n.created_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- User menu -->
        <div class="relative">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Avatar :name="userDisplayName" size="sm" />
            <div class="hidden md:block text-left">
              <div class="text-sm font-medium text-gray-900 leading-tight">{{ userDisplayName }}</div>
              <div class="text-xs text-gray-500 capitalize leading-tight">{{ user?.role }}</div>
            </div>
            <ChevronDownIcon class="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          <!-- User dropdown -->
          <Transition name="slide-down">
            <div
              v-if="showUserMenu"
              class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
              @click="showUserMenu = false"
            >
              <div class="px-4 py-2.5 border-b border-gray-100">
                <div class="text-sm font-semibold text-gray-900">{{ userDisplayName }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ user?.email }}</div>
              </div>
              <router-link
                :to="profileRoute"
                class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <UserIcon class="w-4 h-4 text-gray-400" />
                Profile Settings
              </router-link>
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
              >
                <ArrowRightOnRectangleIcon class="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </Transition>
        </div>

        <!-- Mobile hamburger -->
        <button
          class="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg ml-1"
          @click="$emit('toggle-sidebar')"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Click-outside dismiss overlay (below header) -->
    <div
      v-if="showUserMenu || showNotifications"
      class="fixed inset-0 z-40"
      @click="showUserMenu = false; showNotifications = false"
    ></div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BellIcon, Bars3Icon, ChevronDownIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import Avatar from './Avatar.vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useNotificationStore } from '@/modules/shared/store/notifications.js'

const props = defineProps({
  user: { type: Object, default: null },
  navItems: { type: Array, default: () => [] },
  role: { type: String, default: 'sales' },
  sidebarCollapsed: { type: Boolean, default: false }
})

defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const showUserMenu = ref(false)
const showNotifications = ref(false)

const homeRoute = computed(() => props.role === 'trainer' ? '/trainer' : '/sales')
const profileRoute = computed(() => props.role === 'trainer' ? '/trainer/profile' : '/sales/profile')

const userDisplayName = computed(() => {
  const u = props.user
  if (!u) return ''
  return u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || ''
})

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
  if (showNotifications.value) {
    await notificationStore.fetchNotifications()
  }
}

function resolveNotificationRoute(n) {
  const entityType = n.related_entity_type
  const entityId = n.related_entity_id
  if (!entityType || !entityId) return null
  if (entityType === 'appointment') {
    return authStore.isTrainer ? `/trainer/appointments/${entityId}` : `/sales/appointments/${entityId}`
  }
  if (entityType === 'onboarding') {
    return authStore.isTrainer ? `/trainer/onboarding/${entityId}` : `/sales/onboarding/${entityId}`
  }
  return null
}

async function handleNotificationClick(n) {
  if (!n.is_read) {
    await notificationStore.markAsRead(n.id)
  }
  showNotifications.value = false
  const dest = resolveNotificationRoute(n)
  if (dest) {
    router.push(dest)
  }
}

async function handleLogout() {
  showUserMenu.value = false
  router.replace('/login')
  await authStore.logout()
}

onMounted(() => {
  notificationStore.fetchUnreadCount()
})
</script>
