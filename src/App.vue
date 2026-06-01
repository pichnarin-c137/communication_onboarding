<template>
  <div class="min-h-screen" :data-density="uiPrefs.density">

    <template v-if="currentLayout === 'none'">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component v-if="Component" :is="Component" :key="route.fullPath" />
        </Transition>
      </router-view>
    </template>

    <template v-else-if="currentLayout === 'sales'">
      <NavBar
        :user="authStore.user"
        role="sales"
        :sidebar-collapsed="sidebarCollapsed"
        :nav-items="[]"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <Sidebar
        :open="sidebarOpen"
        :nav-groups="salesNavGroups"
        :is-mobile="isMobile"
        :collapsed="sidebarCollapsed"
        home-route="/sales"
        @close="sidebarOpen = false"
        @toggle-collapse="toggleCollapse"
      />
      <main
        :class="[
          'transition-all duration-300 pt-16 pb-6 px-4 sm:px-6 lg:px-6',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        ]"
      >
        <div class="w-full">
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component v-if="Component" :is="Component" :key="route.fullPath" />
            </Transition>
          </router-view>
        </div>
      </main>
    </template>

    <!-- Admin Layout -->
    <template v-else-if="currentLayout === 'admin'">
      <NavBar
        :user="authStore.user"
        role="sales"
        :sidebar-collapsed="sidebarCollapsed"
        :nav-items="[]"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <Sidebar
        :open="sidebarOpen"
        :nav-groups="salesNavGroups"
        :is-mobile="isMobile"
        :collapsed="sidebarCollapsed"
        home-route="/admin/users"
        @close="sidebarOpen = false"
        @toggle-collapse="toggleCollapse"
      />
      <main
        :class="[
          'transition-all duration-300 pt-16 pb-6 px-4 sm:px-6 lg:px-6',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        ]"
      >
        <div class="w-full">
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component v-if="Component" :is="Component" :key="route.fullPath" />
            </Transition>
          </router-view>
        </div>
      </main>
    </template>

    <!-- Trainer Layout -->
    <template v-else-if="currentLayout === 'trainer'">
      <NavBar
        :user="authStore.user"
        role="trainer"
        :sidebar-collapsed="sidebarCollapsed"
        :nav-items="[]"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <Sidebar
        :open="sidebarOpen"
        :nav-groups="trainerNavGroups"
        :is-mobile="isMobile"
        :collapsed="sidebarCollapsed"
        home-route="/trainer"
        @close="sidebarOpen = false"
        @toggle-collapse="toggleCollapse"
      />
      <main
        :class="[
          'transition-all duration-300 pt-16 pb-28 lg:pb-6 px-4 sm:px-6 lg:px-6',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        ]"
      >
        <div class="w-full">
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component v-if="Component" :is="Component" :key="route.fullPath" />
            </Transition>
          </router-view>
        </div>
      </main>
      <MobileNav :tabs="trainerBottomTabs" />
    </template>

    <!-- Impersonation pill — floats above content, no layout shift.
         Raised on mobile to clear the trainer bottom nav. -->
    <div
      v-if="authStore.impersonating"
      class="fixed right-4 bottom-20 lg:bottom-4 z-[70] flex items-center gap-2.5 rounded-full bg-gray-900 text-white pl-3.5 pr-2 py-1.5 shadow-lg ring-1 ring-black/5"
    >
      <span class="relative flex h-2 w-2 flex-shrink-0">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
        <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-400"></span>
      </span>
      <span class="text-sm whitespace-nowrap">
        Viewing as <span class="font-semibold">{{ impersonatedName }}</span>
        <span class="capitalize text-gray-400">· {{ authStore.user?.role }}</span>
      </span>
      <button
        @click="exitImpersonation"
        class="inline-flex items-center rounded-full bg-white/15 hover:bg-white/25 px-3 py-1 text-xs font-semibold transition-colors"
      >
        Exit
      </button>
    </div>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  FilmIcon,
  UsersIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  BriefcaseIcon,
} from '@heroicons/vue/24/outline'
import {
  Circle
} from 'lucide-vue-next'
import Sidebar from '@/modules/shared/components/Sidebar.vue'
import NavBar from '@/modules/shared/components/NavBar.vue'
import MobileNav from '@/modules/shared/components/MobileNav.vue'
import ToastContainer from '@/modules/shared/components/ToastContainer.vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useNotificationStore } from '@/modules/shared/store/notifications'
import { useTrainerTracking } from '@/modules/shared/composables/useTrainerTracking'
import { useUiPreferences } from '@/modules/shared/store/uiPreferences'
import { useToast } from '@/modules/shared/composables/useToast'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const uiPrefs = useUiPreferences()
const toast = useToast()
const { resumeIfActive } = useTrainerTracking()

const impersonatedName = computed(() => {
  const u = authStore.user
  if (!u) return ''
  return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || 'user'
})

async function exitImpersonation() {
  await authStore.stopImpersonation()
  toast.success('Exited impersonation.')
  router.push('/admin/users')
}

// The api.ts 401 interceptor fires this when an impersonation token expires.
async function onImpersonationExpired() {
  if (!authStore.impersonating) return
  await authStore.stopImpersonation()
  toast.warning('Impersonation session expired.')
  router.push('/admin/users')
}

// Watch userId (not isAuthenticated): admin force-login swaps the user without
// the auth boolean ever flipping, so a boolean watch would leave realtime stuck
// on the admin's notification channel. connectRealtime() switches channels when
// the id changes; a null id (logout) tears the connection down.
watch(
  () => authStore.userId,
  (userId) => {
    if (userId) {
      notificationStore.connectRealtime()
      if (authStore.isTrainer) resumeIfActive()
    } else {
      notificationStore.disconnectRealtime()
    }
  },
  { immediate: true }
)

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true')
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

const isMobile = computed(() => windowWidth.value < 1024)
const currentLayout = computed(() => route.meta?.layout || 'none')

function toggleCollapse() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebar_collapsed', sidebarCollapsed.value)
}

const salesNavGroups = computed(() => {
  const isAdmin = authStore.user?.role === 'admin'

  // Admins get a slim, admin-scoped menu — not the full sales sidebar.
  // This computed is bound to both the 'sales' and 'admin' layouts, so an admin
  // sees the same focused menu whether they're on /admin/* or /crm (sales layout).
  if (isAdmin) {
    return [
      {
        label: 'Admin',
        items: [
          { to: '/admin/users', label: 'User Management', icon: UsersIcon },
          { to: '/crm', label: 'CRM', icon: BriefcaseIcon },
          { to: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
          { to: '/admin/activity-logs', label: 'Activity Logs', icon: ClipboardDocumentCheckIcon },
        ],
      },
      {
        label: 'Account',
        items: [
          { to: '/sales/profile', label: t('nav.profile'), icon: UserIcon },
          { to: '/sales/settings', label: t('nav.settings'), icon: Cog6ToothIcon },
        ],
      },
    ]
  }

  return [
    {
      label: 'Main',
      items: [
        { to: '/sales', label: t('nav.dashboard'), icon: HomeIcon },
        { to: '/crm', label: 'CRM', icon: BriefcaseIcon },
        { to: '/sales/analytics', label: 'Analytics', icon: ChartBarIcon },
        { to: '/sales/appointments', label: t('nav.appointments'), icon: ClipboardDocumentListIcon },
        { to: '/sales/onboarding', label: t('nav.onboarding'), icon: AcademicCapIcon },
        { to: '/sales/trainers', label: 'My Trainers', icon: UserGroupIcon },
        { to: '/sales/calendar', label: t('nav.calendar'), icon: CalendarDaysIcon },
        {
          label: t('nav.configurations'),
          icon: Cog6ToothIcon,
          children: [
            { to: '/sales/configurations/telegram-bot', label: t('nav.telegramBot'), icon: Circle },
            { to: '/sales/configurations/business-types', label: t('nav.businessTypes'), icon: Circle },
          ],
        },
      ],
    },
    {
      label: 'Account',
      items: [
        { to: '/sales/profile', label: t('nav.profile'), icon: UserIcon },
        { to: '/sales/settings', label: t('nav.settings'), icon: Cog6ToothIcon },
      ],
    },
  ]
})

const trainerNavGroups = computed(() => [
  {
    label: 'Main',
    items: [
      { to: '/trainer', label: t('nav.dashboard'), icon: HomeIcon },
      { to: '/trainer/analytics', label: 'My Scorecard', icon: ChartBarIcon },
      { to: '/trainer/appointments', label: t('nav.appointments'), icon: ClipboardDocumentListIcon },
      { to: '/trainer/onboarding', label: t('nav.onboarding'), icon: AcademicCapIcon },
      { to: '/trainer/lessons', label: t('nav.lessons'), icon: FilmIcon },
      { to: '/trainer/calendar', label: t('nav.calendar'), icon: CalendarDaysIcon },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/trainer/profile', label: t('nav.profile'), icon: UserIcon },
      { to: '/trainer/settings', label: t('nav.settings'), icon: Cog6ToothIcon },
    ],
  },
])

const trainerBottomTabs = computed(() => [
  { to: '/trainer', label: t('nav.dashboard'), icon: HomeIcon },
  { to: '/trainer/appointments', label: t('nav.appointments'), icon: ClipboardDocumentListIcon },
  { to: '/trainer/onboarding', label: t('nav.onboarding'), icon: AcademicCapIcon },
  { to: '/trainer/profile', label: t('nav.profile'), icon: UserIcon },
])

function handleResize() {
  windowWidth.value = window.innerWidth
  if (windowWidth.value < 1024) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('impersonation-expired', onImpersonationExpired)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('impersonation-expired', onImpersonationExpired)
})
</script>
