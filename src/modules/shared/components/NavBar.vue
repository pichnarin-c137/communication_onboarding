<template>
  <header class="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-16">
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

          <!-- Notification dropdown — enhanced Facebook style -->
          <Transition name="slide-down">
            <div
              v-if="showNotifications"
              class="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col"
              style="max-height: 520px"
            >
              <!-- Dropdown header -->
              <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <h3 class="text-base font-bold text-gray-900">Notifications</h3>
                <button
                  v-if="notificationStore.unreadCount > 0"
                  @click.stop="notificationStore.markAllAsRead()"
                  class="text-xs font-medium text-primary hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <!-- Loading skeleton -->
              <div v-if="notificationStore.loading" class="p-4 space-y-3 overflow-y-auto">
                <div v-for="i in 4" :key="i" class="flex items-start gap-3">
                  <div class="w-8 h-8 bg-gray-100 rounded-lg animate-pulse flex-shrink-0"></div>
                  <div class="flex-1 space-y-1.5">
                    <div class="h-3.5 bg-gray-100 rounded animate-pulse w-3/4"></div>
                    <div class="h-3 bg-gray-100 rounded animate-pulse w-full"></div>
                    <div class="h-2.5 bg-gray-100 rounded animate-pulse w-1/3"></div>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-else-if="notificationStore.notifications.length === 0" class="py-12 text-center flex-1">
                <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BellIcon class="w-7 h-7 text-gray-400" />
                </div>
                <p class="text-sm font-medium text-gray-700">No notifications yet</p>
                <p class="text-xs text-gray-400 mt-1">We'll notify you when something arrives</p>
              </div>

              <!-- Grouped notification list -->
              <div v-else class="overflow-y-auto flex-1">
                <template v-for="group in groupedNotifications" :key="group.label">
                  <!-- Date group label -->
                  <div class="px-4 py-2 bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                    <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{{ group.label }}</span>
                  </div>
                  <!-- Items in this group -->
                  <div
                    v-for="n in group.items"
                    :key="n.id"
                    :class="[
                      'px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50',
                      !n.is_read ? 'bg-blue-50/30' : ''
                    ]"
                    @click="handleNotificationClick(n)"
                  >
                    <div class="flex items-start gap-3">
                      <!-- Type icon -->
                      <div
                        :class="notificationMeta(n.type).bgClass"
                        class="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      >
                        <component :is="notificationMeta(n.type).icon" :class="notificationMeta(n.type).iconClass" class="w-4 h-4" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                          <p :class="['text-sm leading-snug', n.is_read ? 'font-normal text-gray-600' : 'font-semibold text-gray-900']">
                            {{ n.title }}
                          </p>
                          <span v-if="!n.is_read" class="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                        </div>
                        <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ formatRelativeTime(n.created_at) }}</p>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Sticky footer: see all -->
              <div class="flex-shrink-0 border-t border-gray-100 bg-white">
                <router-link
                  :to="notificationsRoute"
                  class="flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                  @click="showNotifications = false"
                >
                  See all notifications
                  <ChevronRightIcon class="w-4 h-4" />
                </router-link>
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
import {
  BellIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  PlayCircleIcon,
  ArrowPathIcon,
  XCircleIcon,
  UsersIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  FlagIcon,
  TrophyIcon,
  StarIcon,
  MapPinIcon,
} from '@heroicons/vue/24/outline'
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
const notificationsRoute = computed(() => props.role === 'trainer' ? '/trainer/notifications' : '/sales/configurations/notifications')

const userDisplayName = computed(() => {
  const u = props.user
  if (!u) return ''
  return u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || ''
})

// ── Notification type map ──────────────────────────────────────────────────
const notificationTypeMap = {
  appointment_assigned:         { icon: BriefcaseIcon,    bgClass: 'bg-blue-100',    iconClass: 'text-blue-600' },
  appointment_leave_office:     { icon: MapPinIcon,        bgClass: 'bg-amber-100',   iconClass: 'text-amber-600' },
  appointment_started:          { icon: PlayCircleIcon,   bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  appointment_completed:        { icon: CheckCircleIcon,  bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  appointment_cancelled:        { icon: XCircleIcon,      bgClass: 'bg-red-100',     iconClass: 'text-red-600' },
  appointment_rescheduled:      { icon: ArrowPathIcon,    bgClass: 'bg-amber-100',   iconClass: 'text-amber-600' },
  session_created:              { icon: CalendarDaysIcon, bgClass: 'bg-blue-100',    iconClass: 'text-blue-600' },
  session_started:              { icon: PlayCircleIcon,   bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  session_completed:            { icon: CheckCircleIcon,  bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  session_rescheduled:          { icon: ArrowPathIcon,    bgClass: 'bg-amber-100',   iconClass: 'text-amber-600' },
  session_cancelled:            { icon: XCircleIcon,      bgClass: 'bg-red-100',     iconClass: 'text-red-600' },
  student_attendance_submitted: { icon: UsersIcon,        bgClass: 'bg-purple-100',  iconClass: 'text-purple-600' },
  assignment_created:           { icon: BriefcaseIcon,    bgClass: 'bg-blue-100',    iconClass: 'text-blue-600' },
  assignment_accepted:          { icon: CheckCircleIcon,  bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  assignment_rejected:          { icon: XCircleIcon,      bgClass: 'bg-red-100',     iconClass: 'text-red-600' },
  stage_completed:              { icon: FlagIcon,         bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  training_completed:           { icon: TrophyIcon,       bgClass: 'bg-yellow-100',  iconClass: 'text-yellow-600' },
  onboarding_completed:         { icon: StarIcon,         bgClass: 'bg-yellow-100',  iconClass: 'text-yellow-600' },
}

function notificationMeta(type) {
  return notificationTypeMap[type] || { icon: BellIcon, bgClass: 'bg-gray-100', iconClass: 'text-gray-500' }
}

// ── Date grouping ──────────────────────────────────────────────────────────
function groupByDate(items) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups = { Today: [], Yesterday: [], Earlier: [] }
  for (const item of items) {
    const d = new Date(item.created_at)
    d.setHours(0, 0, 0, 0)
    if (d.getTime() === today.getTime()) {
      groups.Today.push(item)
    } else if (d.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(item)
    } else {
      groups.Earlier.push(item)
    }
  }

  return [
    { label: 'Today', items: groups.Today },
    { label: 'Yesterday', items: groups.Yesterday },
    { label: 'Earlier', items: groups.Earlier },
  ].filter(g => g.items.length > 0)
}

const groupedNotifications = computed(() => groupByDate(notificationStore.notifications))

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
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
