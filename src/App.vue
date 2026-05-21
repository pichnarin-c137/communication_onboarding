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
        :nav-groups="adminNavGroups"
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

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
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
  ClipboardDocumentCheckIcon,
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

const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const uiPrefs = useUiPreferences()
const { resumeIfActive } = useTrainerTracking()

watch(
  () => authStore.isAuthenticated,
  (authenticated) => {
    if (authenticated) {
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
  const groups = [
    {
      label: 'Main',
      items: [
        { to: '/sales', label: t('nav.dashboard'), icon: HomeIcon },
        { to: '/sales/appointments', label: t('nav.appointments'), icon: ClipboardDocumentListIcon },
        { to: '/sales/onboarding', label: t('nav.onboarding'), icon: AcademicCapIcon },
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

  if (authStore.user?.role === 'admin') {
    groups.unshift({
      label: 'Admin',
      items: [
        { to: '/admin/users', label: 'User Management', icon: UsersIcon },
        { to: '/admin/activity-logs', label: 'Activity Logs', icon: ClipboardDocumentCheckIcon },
      ],
    })
  }

  return groups
})

const adminNavGroups = computed(() => [
  {
    label: 'Admin',
    items: [
      { to: '/admin/users', label: 'User Management', icon: UsersIcon },
      { to: '/admin/activity-logs', label: 'Activity Logs', icon: ClipboardDocumentCheckIcon },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/sales', label: t('nav.dashboard'), icon: HomeIcon },
      { to: '/sales/appointments', label: t('nav.appointments'), icon: ClipboardDocumentListIcon },
      { to: '/sales/onboarding', label: t('nav.onboarding'), icon: AcademicCapIcon },
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
])

const trainerNavGroups = computed(() => [
  {
    label: 'Main',
    items: [
      { to: '/trainer', label: t('nav.dashboard'), icon: HomeIcon },
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
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
