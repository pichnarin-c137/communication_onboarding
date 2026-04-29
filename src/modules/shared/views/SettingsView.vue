<template>
  <div class="max-w-3xl mx-auto space-y-6">

    <!-- Page header -->
    <div>
      <h1 class="text-xl font-semibold text-gray-900">Settings</h1>
      <p class="mt-1 text-sm text-gray-500">Manage your notification preferences, display options, and more.</p>
    </div>

    <!-- Skeleton while loading -->
    <template v-if="store.loading">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <SkeletonLoader class="h-5 w-40 rounded" />
        <SkeletonLoader class="h-4 w-full rounded" />
        <SkeletonLoader class="h-4 w-3/4 rounded" />
      </div>
    </template>

    <template v-else-if="store.settings">

      <!-- 1. Notifications -->
      <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div class="px-6 py-4">
          <div class="flex items-center gap-2">
            <BellIcon class="w-5 h-5 text-primary" />
            <h2 class="text-base font-semibold text-gray-900">Notifications</h2>
          </div>
          <p class="mt-1 text-sm text-gray-500">Choose which channels deliver notifications to you.</p>
        </div>

        <div class="px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-gray-800">In-App Notifications</p>
            <p class="text-xs text-gray-500 mt-0.5">Receive real-time alerts inside the app.</p>
          </div>
          <button
            type="button"
            @click="form.in_app_notifications = !form.in_app_notifications"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            :class="form.in_app_notifications ? 'bg-primary' : 'bg-gray-200'"
            role="switch"
            :aria-checked="form.in_app_notifications"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="form.in_app_notifications ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <div class="px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-gray-800">Telegram Notifications</p>
            <p class="text-xs text-gray-500 mt-0.5">Receive notifications via the Telegram bot.</p>
          </div>
          <button
            type="button"
            @click="form.telegram_notifications = !form.telegram_notifications"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            :class="form.telegram_notifications ? 'bg-primary' : 'bg-gray-200'"
            role="switch"
            :aria-checked="form.telegram_notifications"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="form.telegram_notifications ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <!-- 2. Language & Region -->
      <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div class="px-6 py-4">
          <div class="flex items-center gap-2">
            <GlobeAltIcon class="w-5 h-5 text-primary" />
            <h2 class="text-base font-semibold text-gray-900">Language & Region</h2>
          </div>
          <p class="mt-1 text-sm text-gray-500">Set your preferred language and local timezone.</p>
        </div>

        <div class="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
            <select
              v-model="form.language"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="en">English</option>
              <option value="km">ខ្មែរ (Khmer)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
            <select
              v-model="form.timezone"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <optgroup label="Southeast Asia">
                <option value="Asia/Phnom_Penh">Asia/Phnom_Penh (GMT+7)</option>
                <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                <option value="Asia/Vientiane">Asia/Vientiane (GMT+7)</option>
                <option value="Asia/Rangoon">Asia/Rangoon (GMT+6:30)</option>
                <option value="Asia/Jakarta">Asia/Jakarta (GMT+7)</option>
                <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (GMT+8)</option>
                <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
              </optgroup>
              <optgroup label="East Asia">
                <option value="Asia/Shanghai">Asia/Shanghai (GMT+8)</option>
                <option value="Asia/Hong_Kong">Asia/Hong_Kong (GMT+8)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                <option value="Asia/Seoul">Asia/Seoul (GMT+9)</option>
              </optgroup>
              <optgroup label="South Asia">
                <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
              </optgroup>
              <optgroup label="Europe">
                <option value="Europe/London">Europe/London (GMT+0/+1)</option>
                <option value="Europe/Paris">Europe/Paris (GMT+1/+2)</option>
                <option value="Europe/Berlin">Europe/Berlin (GMT+1/+2)</option>
              </optgroup>
              <optgroup label="Americas">
                <option value="America/New_York">America/New_York (GMT-5/-4)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (GMT-8/-7)</option>
                <option value="America/Chicago">America/Chicago (GMT-6/-5)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      <!-- 3. Display -->
      <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div class="px-6 py-4">
          <div class="flex items-center gap-2">
            <SwatchIcon class="w-5 h-5 text-primary" />
            <h2 class="text-base font-semibold text-gray-900">Display</h2>
          </div>
          <p class="mt-1 text-sm text-gray-500">Customize the look and feel of your interface.</p>
        </div>

        <!-- Theme -->
<!--        <div class="px-6 py-5">-->
<!--          <label class="block text-sm font-medium text-gray-700 mb-3">Theme</label>-->
<!--          <div class="flex gap-3">-->
<!--            <button-->
<!--              type="button"-->
<!--              @click="form.theme = 'light'"-->
<!--              class="flex-1 flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all"-->
<!--              :class="form.theme === 'light'-->
<!--                ? 'border-primary bg-primary/5 text-primary'-->
<!--                : 'border-gray-200 text-gray-500 hover:border-gray-300'"-->
<!--            >-->
<!--              <SunIcon class="w-5 h-5" />-->
<!--              <span class="text-sm font-medium">Light</span>-->
<!--            </button>-->
<!--            <button-->
<!--              type="button"-->
<!--              @click="form.theme = 'dark'"-->
<!--              class="flex-1 flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all"-->
<!--              :class="form.theme === 'dark'-->
<!--                ? 'border-primary bg-primary/5 text-primary'-->
<!--                : 'border-gray-200 text-gray-500 hover:border-gray-300'"-->
<!--            >-->
<!--              <MoonIcon class="w-5 h-5" />-->
<!--              <span class="text-sm font-medium">Dark</span>-->
<!--            </button>-->
<!--          </div>-->
<!--        </div>-->

        <!-- Items per page -->
        <div class="px-6 py-5">
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-sm font-medium text-gray-700">Items per Page</label>
            <span class="text-sm font-semibold text-primary">{{ form.items_per_page }}</span>
          </div>
          <p class="text-xs text-gray-500 mb-3">Controls how many records appear in paginated lists (5–100).</p>
          <input
            type="range"
            v-model.number="form.items_per_page"
            min="5"
            max="100"
            step="5"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>5</span>
            <span>100</span>
          </div>
        </div>

        <!-- Display Density -->
        <div class="px-6 py-5 border-t border-gray-100">
          <label class="block text-sm font-medium text-gray-700 mb-1">Display Density</label>
          <p class="text-xs text-gray-500 mb-3">Controls table and card padding. Applied instantly — no save needed.</p>
          <div class="flex gap-2">
            <button
              type="button"
              @click="uiPrefs.setDensity('comfortable')"
              class="flex-1 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium"
              :class="uiPrefs.density === 'comfortable'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >
              <ViewColumnsIcon class="w-5 h-5" />
              Comfortable
            </button>
            <button
              type="button"
              @click="uiPrefs.setDensity('compact')"
              class="flex-1 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium"
              :class="uiPrefs.density === 'compact'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >
              <Bars3Icon class="w-5 h-5" />
              Compact
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Quiet Hours -->
      <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div class="px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <MoonIcon class="w-5 h-5 text-primary" />
              <h2 class="text-base font-semibold text-gray-900">Quiet Hours</h2>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Suppress all notifications during a set time window. Supports overnight ranges (e.g. 22:00–07:00).
            </p>
          </div>
          <button
            type="button"
            @click="form.quiet_hours_enabled = !form.quiet_hours_enabled"
            class="mt-0.5 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            :class="form.quiet_hours_enabled ? 'bg-primary' : 'bg-gray-200'"
            role="switch"
            :aria-checked="form.quiet_hours_enabled"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="form.quiet_hours_enabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div v-if="form.quiet_hours_enabled" class="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
              <AppTimePicker v-model="form.quiet_hours_start" placeholder="Select start time…" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
              <AppTimePicker v-model="form.quiet_hours_end" placeholder="Select end time…" />
            </div>
            <p class="sm:col-span-2 text-xs text-gray-400 flex items-start gap-1.5">
              <InformationCircleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
              Times use your configured timezone ({{ form.timezone }}).
              Overnight ranges (e.g. 22:00–07:00) are fully supported.
            </p>
          </div>
        </Transition>
      </div>

      <!-- Save / Error -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6">
        <p v-if="store.error" class="text-sm text-red-600 flex items-center gap-1.5">
          <ExclamationCircleIcon class="w-4 h-4 flex-shrink-0" />
          {{ store.error }}
        </p>
        <span v-else />
        <AppButton
          :loading="store.saving"
          :disabled="!hasChanges || store.saving"
          @click="save"
          class="sm:ml-auto"
        >
          Save Changes
        </AppButton>
      </div>

    </template>

    <!-- Error state -->
    <div v-else-if="store.error" class="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
      <ExclamationCircleIcon class="mx-auto w-10 h-10 text-red-400 mb-3" />
      <p class="text-sm text-gray-600">{{ store.error }}</p>
      <button @click="store.fetchSettings()" class="mt-4 text-sm text-primary hover:underline">Try again</button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  BellIcon,
  GlobeAltIcon,
  SwatchIcon,
  SunIcon,
  MoonIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  ViewColumnsIcon,
  Bars3Icon,
} from '@heroicons/vue/24/outline'

import { useSettingsStore } from '@/modules/shared/store/settings'
import { useUiPreferences } from '@/modules/shared/store/uiPreferences'
import { useToast } from '@/modules/shared/composables/useToast'
import { i18n } from '@/core/i18n/index.js'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import AppTimePicker from '@/modules/shared/components/AppTimePicker.vue'
import AppButton from '@/modules/shared/components/AppButton.vue'

const store = useSettingsStore()
const uiPrefs = useUiPreferences()
const { success, error: toastError } = useToast()

const DEFAULTS = {
  in_app_notifications: true,
  telegram_notifications: true,
  language: 'en',
  timezone: 'Asia/Phnom_Penh',
  items_per_page: 15,
  theme: 'light',
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
}

const form = reactive({ ...DEFAULTS })
const original = ref({ ...DEFAULTS })

function syncForm(settings) {
  const keys = Object.keys(DEFAULTS)
  keys.forEach((k) => {
    form[k] = settings[k] ?? DEFAULTS[k]
  })
  original.value = { ...form }
}

onMounted(async () => {
  await store.fetchSettings()
  if (store.settings) syncForm(store.settings)
})

watch(() => store.settings, (s) => {
  if (s) syncForm(s)
})

const hasChanges = computed(() => {
  return Object.keys(DEFAULTS).some((k) => form[k] !== original.value[k])
})

async function save() {
  const patch = {}
  Object.keys(DEFAULTS).forEach((k) => {
    if (form[k] !== original.value[k]) patch[k] = form[k]
  })
  if (Object.keys(patch).length === 0) return

  const ok = await store.saveSettings(patch)
  if (ok) {
    if (patch.language) {
      i18n.global.locale.value = patch.language
      localStorage.setItem('coms_locale', patch.language)
    }
    success('Settings saved successfully.')
  } else {
    toastError(store.error || 'Failed to save settings.')
  }
}
</script>
