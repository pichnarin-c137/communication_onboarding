<template>
  <!-- Mobile backdrop -->
  <Transition name="fade">
    <div
      v-if="open && isMobile"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="$emit('close')"
    ></div>
  </Transition>

  <!-- Sidebar panel -->
  <aside
    :class="[
      'fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-gray-200',
      'transition-all duration-300 ease-in-out flex flex-col lg:z-30',
      open ? 'translate-x-0' : '-translate-x-full',
      collapsed ? 'w-64 lg:w-16 lg:translate-x-0' : 'w-64 lg:translate-x-0',
    ]"
  >
    <!-- ── Logo header ── -->
    <div
      :class="[
        'h-14 flex items-center px-3 border-b border-gray-100 flex-shrink-0',
        showLabels ? 'justify-between' : 'justify-center'
      ]"
    >
      <router-link :to="homeRoute" class="flex items-center gap-2.5 min-w-0" @click="$emit('close')">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <span class="text-white font-bold text-sm">CM</span>
        </div>
        <div v-if="showLabels" class="min-w-0">
          <span class="text-base font-bold text-gray-900 leading-tight">COMS</span>
          <span class="text-xs text-gray-500 block -mt-0.5">CheckinMe</span>
        </div>
      </router-link>
      <!-- Mobile close button -->
      <button
        v-if="showLabels"
        @click="$emit('close')"
        class="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- ── Scrollable body: nav items OR notifications ── -->
    <div class="flex-1 overflow-y-auto custom-scrollbar min-h-0">

      <!-- Nav view -->
      <div v-if="!showNotifications" class="p-2">
        <nav class="space-y-5">
          <div v-for="group in navGroups" :key="group.label">
            <h3
              v-if="showLabels"
              class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-3"
            >
              {{ group.label }}
            </h3>
            <div v-else class="mb-1.5 h-4"></div>
            <div class="space-y-0.5">
              <template v-for="item in group.items" :key="item.label || item.to">
                <!-- Dropdown item (has children) -->
                <template v-if="item.children">
                  <button
                    :title="!showLabels ? item.label : undefined"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                    :class="[
                      isChildActive(item.children)
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                      !showLabels ? 'justify-center' : ''
                    ]"
                    @click="toggleDropdown(item.label)"
                  >
                    <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                    <span v-if="showLabels" class="flex-1 text-left truncate">{{ item.label }}</span>
                    <ChevronDownIcon
                      v-if="showLabels"
                      class="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                      :class="openDropdowns[item.label] ? 'rotate-180' : ''"
                    />
                  </button>
                  <div v-if="openDropdowns[item.label] && showLabels" class="ml-4 mt-0.5 space-y-0.5 border-l border-gray-100 pl-3">
                    <router-link
                      v-for="child in item.children"
                      :key="child.to"
                      :to="child.to"
                      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                      :class="
                        isActive(child.to)
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      "
                      @click="$emit('close')"
                    >
                      <component :is="child.icon" class="w-4 h-4 flex-shrink-0" />
                      <span class="flex-1 truncate">{{ child.label }}</span>
                    </router-link>
                  </div>
                </template>

                <!-- Regular flat item -->
                <router-link
                  v-else
                  :to="item.to"
                  :title="!showLabels ? item.label : undefined"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                  :class="[
                    isActive(item.to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                    !showLabels ? 'justify-center' : ''
                  ]"
                  @click="$emit('close')"
                >
                  <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                  <span v-if="showLabels" class="flex-1 truncate">{{ item.label }}</span>
                  <span
                    v-if="item.badge && showLabels"
                    class="ml-auto bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full"
                  >{{ item.badge }}</span>
                </router-link>
              </template>
            </div>
          </div>
        </nav>
      </div>

      <!-- Notifications view -->
      <div v-else>
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
          <div class="flex items-center gap-2">
            <button
              v-if="notificationStore.unreadCount > 0"
              @click="notificationStore.markAllAsRead()"
              class="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
            <button
              @click="showNotifications = false"
              class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div v-if="notificationStore.loading" class="p-4 space-y-3">
          <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
        <div v-else-if="notificationStore.notifications.length === 0" class="py-14 text-center">
          <BellIcon class="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p class="text-sm text-gray-400">No notifications yet</p>
        </div>
        <div v-else class="divide-y divide-gray-50">
          <div
            v-for="n in notificationStore.notifications"
            :key="n.id"
            :class="[
              'px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors',
              !n.is_read ? 'bg-blue-50/40' : ''
            ]"
            @click="handleNotificationClick(n)"
          >
            <div class="flex items-start gap-2.5">
              <!-- Type icon -->
              <div
                :class="notificationMeta(n.type).bgClass"
                class="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <component :is="notificationMeta(n.type).icon" :class="notificationMeta(n.type).iconClass" class="w-3.5 h-3.5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <p class="text-sm font-semibold text-gray-900 leading-snug truncate">{{ n.title }}</p>
                  <span v-if="!n.is_read" class="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ formatTime(n.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Bottom section ── -->
    <div class="flex-shrink-0 border-t border-gray-100">

      <!-- Notification toggle button -->
      <div class="p-2">
        <button
          @click="toggleNotifications"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
            showNotifications
              ? 'bg-primary/10 text-primary'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
            !showLabels ? 'justify-center' : ''
          ]"
          :title="!showLabels ? 'Notifications' : undefined"
        >
          <BellIcon class="w-5 h-5 flex-shrink-0" />
          <span v-if="showLabels" class="flex-1 text-left">Notifications</span>
          <!-- Badge - expanded -->
          <span
            v-if="notificationStore.unreadCount > 0 && showLabels"
            class="ml-auto bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center"
          >
            {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
          </span>
          <!-- Badge - collapsed icon dot -->
          <span
            v-if="notificationStore.unreadCount > 0 && !showLabels"
            class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
          ></span>
        </button>
      </div>

      <!-- User card (expanded) -->
      <div v-if="showLabels" class="px-3 pb-3">
        <div class="flex items-center gap-2.5 px-2.5 py-2.5 bg-gray-50 rounded-xl">
          <Avatar :name="userDisplayName" size="sm" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate leading-tight">{{ userDisplayName }}</p>
            <p class="text-xs text-gray-500 capitalize leading-tight mt-0.5">{{ authStore.user?.role }}</p>
          </div>
          <button
            @click="handleLogout"
            title="Sign Out"
            class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowRightOnRectangleIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- User icon (collapsed) -->
      <div v-else class="px-2 pb-2">
        <button
          @click="handleLogout"
          title="Sign Out"
          class="w-full flex items-center justify-center py-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Collapse toggle (desktop only) -->
      <div class="hidden lg:block p-2 border-t border-gray-100">
        <button
          @click="$emit('toggle-collapse')"
          :class="[
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors',
            !showLabels ? 'justify-center' : ''
          ]"
          :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <ChevronLeftIcon v-if="!collapsed" class="w-4 h-4 flex-shrink-0" />
          <ChevronRightIcon v-else class="w-4 h-4 flex-shrink-0" />
          <span v-if="!collapsed" class="text-xs font-medium">Collapse</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  XMarkIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
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
  open: { type: Boolean, default: true },
  navGroups: { type: Array, default: () => [] },
  isMobile: { type: Boolean, default: false },
  collapsed: { type: Boolean, default: false },
  homeRoute: { type: String, default: '/' }
})

const emit = defineEmits(['close', 'toggle-collapse'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const showNotifications = ref(false)
const openDropdowns = reactive({})

function toggleDropdown(label) {
  openDropdowns[label] = !openDropdowns[label]
}

function isChildActive(children) {
  return children.some(child => isActive(child.to))
}

// Labels are shown when expanded OR on mobile (mobile sidebar is always full-width)
const showLabels = computed(() => !props.collapsed || props.isMobile)

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return ''
  return u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || ''
})

function isActive(path) {
  if (route.path === path) return true
  const exactOnly = ['/sales', '/trainer', '/sales/onboardings/create', '/trainer/schedule']
  if (exactOnly.includes(path)) return false
  return route.path.startsWith(path + '/')
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const notificationTypeMap = {
  // Appointment lifecycle — bidirectional between sale & trainer
  appointment_assigned:         { icon: BriefcaseIcon,      bgClass: 'bg-blue-100',    iconClass: 'text-blue-600' },
  appointment_leave_office:     { icon: MapPinIcon,          bgClass: 'bg-amber-100',   iconClass: 'text-amber-600' },
  appointment_started:          { icon: PlayCircleIcon,     bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  appointment_completed:        { icon: CheckCircleIcon,    bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  appointment_cancelled:        { icon: XCircleIcon,        bgClass: 'bg-red-100',     iconClass: 'text-red-600' },
  appointment_rescheduled:      { icon: ArrowPathIcon,      bgClass: 'bg-amber-100',   iconClass: 'text-amber-600' },
  // Session lifecycle (legacy types)
  session_created:              { icon: CalendarDaysIcon,   bgClass: 'bg-blue-100',    iconClass: 'text-blue-600' },
  session_started:              { icon: PlayCircleIcon,     bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  session_completed:            { icon: CheckCircleIcon,    bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  session_rescheduled:          { icon: ArrowPathIcon,      bgClass: 'bg-amber-100',   iconClass: 'text-amber-600' },
  session_cancelled:            { icon: XCircleIcon,        bgClass: 'bg-red-100',     iconClass: 'text-red-600' },
  student_attendance_submitted: { icon: UsersIcon,          bgClass: 'bg-purple-100',  iconClass: 'text-purple-600' },
  // Assignment
  assignment_created:           { icon: BriefcaseIcon,      bgClass: 'bg-blue-100',    iconClass: 'text-blue-600' },
  assignment_accepted:          { icon: CheckCircleIcon,    bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  assignment_rejected:          { icon: XCircleIcon,        bgClass: 'bg-red-100',     iconClass: 'text-red-600' },
  // Progress milestones
  stage_completed:              { icon: FlagIcon,           bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  training_completed:           { icon: TrophyIcon,         bgClass: 'bg-yellow-100',  iconClass: 'text-yellow-600' },
  onboarding_completed:         { icon: StarIcon,           bgClass: 'bg-yellow-100',  iconClass: 'text-yellow-600' },
}

function notificationMeta(type) {
  return notificationTypeMap[type] || { icon: BellIcon, bgClass: 'bg-gray-100', iconClass: 'text-gray-500' }
}

async function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value && !notificationStore.notifications.length) {
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
  const dest = resolveNotificationRoute(n)
  if (dest) {
    showNotifications.value = false
    emit('close')
    router.push(dest)
  }
}

async function handleLogout() {
  router.replace('/login')
  await authStore.logout()
}

onMounted(() => {
  notificationStore.fetchUnreadCount()
})
</script>
