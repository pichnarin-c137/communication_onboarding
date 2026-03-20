<template>
  <div class="space-y-5 mt-3">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
        <p class="text-sm text-gray-500 mt-0.5">Stay up to date with your latest activity</p>
      </div>
      <button
        v-if="notificationStore.unreadCount > 0"
        @click="notificationStore.markAllAsRead()"
        class="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
      >
        Mark all read
      </button>
    </div>

    <!-- Tab bar -->
    <div class="flex items-center gap-1 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
          activeTab === tab.key
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        {{ tab.label }}
        <span
          v-if="tab.key === 'unread' && notificationStore.unreadCount > 0"
          class="ml-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-4.5 px-1 rounded-full inline-flex items-center justify-center"
        >
          {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
        </span>
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="notificationStore.loading" class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      <div v-for="i in 6" :key="i" class="px-5 py-4 flex items-start gap-4">
        <div class="w-10 h-10 bg-gray-100 rounded-xl animate-pulse flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-100 rounded animate-pulse w-2/3"></div>
          <div class="h-3 bg-gray-100 rounded animate-pulse w-full"></div>
          <div class="h-3 bg-gray-100 rounded animate-pulse w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="filteredNotifications.length === 0"
      class="bg-white rounded-xl border border-gray-200 py-20 text-center"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BellIcon class="w-8 h-8 text-gray-400" />
      </div>
      <p class="text-base font-semibold text-gray-700">
        {{ emptyStateMessage }}
      </p>
      <p class="text-sm text-gray-400 mt-1">
        {{ emptyStateSubMessage }}
      </p>
    </div>

    <!-- Grouped notification list -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <template v-for="group in groupedNotifications" :key="group.label">
        <!-- Date group label -->
        <div class="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">{{ group.label }}</span>
        </div>
        <!-- Items in this group -->
        <div
          v-for="n in group.items"
          :key="n.id"
          :class="[
            'px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0',
            !n.is_read ? 'bg-blue-50/20' : ''
          ]"
          @click="handleNotificationClick(n)"
        >
          <!-- Type icon -->
          <div
            :class="notificationMeta(n.type).bgClass"
            class="mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <component :is="notificationMeta(n.type).icon" :class="notificationMeta(n.type).iconClass" class="w-5 h-5" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <p :class="['text-sm leading-snug', n.is_read ? 'font-normal text-gray-600' : 'font-semibold text-gray-900']">
                {{ n.title }}
              </p>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ formatRelativeTime(n.created_at) }}</span>
                <span v-if="!n.is_read" class="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BellIcon,
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
import { useNotificationStore } from '@/modules/shared/store/notifications.js'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const activeTab = ref('all')

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
]

const filteredNotifications = computed(() => {
  const all = notificationStore.notifications
  if (activeTab.value === 'unread') return all.filter(n => !n.is_read)
  if (activeTab.value === 'read') return all.filter(n => n.is_read)
  return all
})

const emptyStateMessage = computed(() => {
  if (activeTab.value === 'unread') return 'All caught up!'
  if (activeTab.value === 'read') return 'No read notifications'
  return 'No notifications yet'
})

const emptyStateSubMessage = computed(() => {
  if (activeTab.value === 'unread') return 'You have no unread notifications'
  if (activeTab.value === 'read') return 'Notifications you have read will appear here'
  return "We'll notify you when something arrives"
})

//  Notification type map
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

//  Date grouping 
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

const groupedNotifications = computed(() => groupByDate(filteredNotifications.value))

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
    router.push(dest)
  }
}

onMounted(async () => {
  await notificationStore.fetchNotifications(50)
})
</script>
