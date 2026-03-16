<template>
  <div class="min-h-screen">

    <template v-if="currentLayout === 'none'">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </router-view>
    </template>

    <template v-else-if="currentLayout === 'sales'">
      <div class="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center gap-3 px-4">
        <button
          @click="sidebarOpen = true"
          class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xs">CM</span>
          </div>
          <span class="text-base font-bold text-gray-900">COMS</span>
        </div>
      </div>

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
          'transition-all duration-300 pt-14   lg:pt-0 pb-6 px-4 sm:px-6 lg:px-6',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        ]"
      >
        <div class="w-full">
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </Transition>
          </router-view>
        </div>
      </main>
    </template>

    <!-- Trainer Layout -->
    <template v-else-if="currentLayout === 'trainer'">
      <!-- Mobile-only top bar -->
      <div class="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center gap-3 px-4">
        <button
          @click="sidebarOpen = true"
          class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xs">CM</span>
          </div>
          <span class="text-base font-bold text-gray-900">COMS</span>
        </div>
      </div>

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
          'transition-all duration-300 pt-14 lg:pt-0 pb-28 lg:pb-6 px-4 sm:px-6 lg:px-6',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        ]"
      >
        <div class="w-full">
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserIcon,
  Bars3Icon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline'
import {
  Circle
} from 'lucide-vue-next'
import Sidebar from '@/modules/shared/components/Sidebar.vue'
import MobileNav from '@/modules/shared/components/MobileNav.vue'
import ToastContainer from '@/modules/shared/components/ToastContainer.vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const route = useRoute()
const authStore = useAuthStore()

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
      { to: '/sales/calendar', label: 'Calendar', icon: CalendarDaysIcon },
      // { to: '/sales/appointments', label: 'Appointments', icon: ClipboardDocumentListIcon },
      // { to: '/sales/onboarding', label: 'Onboarding', icon: AcademicCapIcon },
      {
        label: 'Reports',
        icon: ChartBarIcon,
        children: [
          { to: '/sales/report/appointments', label: 'Appointments', icon: Circle },
          // { to: '/sales/reports/onboarding', label: 'Onboarding', icon: Circle },
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
