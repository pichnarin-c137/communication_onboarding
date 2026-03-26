<template>
  <div class="min-h-screen">

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
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  MapIcon
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

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

watch(
  () => authStore.isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      notificationStore.connectRealtime()
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

const salesNavGroups = [
  {
    label: 'Main',
    items: [
      { to: '/sales', label: 'Dashboard', icon: HomeIcon },
      { to: '/sales/trainers', label: 'Trainers', icon: MapIcon },
      { to: '/sales/appointments', label: 'Appointments', icon: ClipboardDocumentListIcon },
      { to: '/sales/calendar', label: 'Calendar', icon: CalendarDaysIcon },
      {
        label: 'Reports',
        icon: ChartBarIcon,
        children: [
          { to: '/sales/report/appointments', label: 'Appointments', icon: Circle },
        ],
      },
      {
        label: 'Configurations',
        icon: Cog6ToothIcon,
        children: [
          { to: '/sales/configurations/telegram-bot', label: 'Telegram Bot', icon: Circle },
          { to: '/sales/configurations/notifications', label: 'Notifications', icon: Circle },
        ],
      },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/sales/profile', label: 'Profile', icon: UserIcon },
    ],
  },
]

const trainerNavGroups = [
  {
    label: 'Main',
    items: [
      { to: '/trainer', label: 'Dashboard', icon: HomeIcon },
      { to: '/trainer/appointments', label: 'Appointments', icon: ClipboardDocumentListIcon },
      { to: '/trainer/onboarding', label: 'Onboarding', icon: AcademicCapIcon },
      { to: '/trainer/calendar', label: 'Calendar', icon: CalendarDaysIcon },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/trainer/profile', label: 'Profile', icon: UserIcon },
    ],
  },
]

const trainerBottomTabs = [
  { to: '/trainer', label: 'Home', icon: HomeIcon },
  { to: '/trainer/appointments', label: 'Appointments', icon: ClipboardDocumentListIcon },
  { to: '/trainer/onboarding', label: 'Onboarding', icon: AcademicCapIcon },
  { to: '/trainer/profile', label: 'Profile', icon: UserIcon },
]

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
