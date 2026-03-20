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
    <!--  Logo header  -->
    <div
      :class="[
        'h-16 flex items-center px-3 border-b border-gray-100 flex-shrink-0',
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

    <!--  Scrollable body: nav items  -->
    <div class="flex-1 overflow-y-auto custom-scrollbar min-h-0">
      <div class="p-2">
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
    </div>

    <!--  Bottom section  -->
    <div class="flex-shrink-0 border-t border-gray-100">
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
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import Avatar from './Avatar.vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const props = defineProps({
  open: { type: Boolean, default: true },
  navGroups: { type: Array, default: () => [] },
  isMobile: { type: Boolean, default: false },
  collapsed: { type: Boolean, default: false },
  homeRoute: { type: String, default: '/' }
})

defineEmits(['close', 'toggle-collapse'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

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

async function handleLogout() {
  router.replace('/login')
  await authStore.logout()
}
</script>
