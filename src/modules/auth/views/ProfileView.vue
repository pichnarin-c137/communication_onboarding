<template>
  <div class="space-y-6 max-w-3xl mx-auto mt-3  ">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Profile Settings</h1>
      <p class="text-sm text-gray-500 mt-0.5">Manage your account information and preferences</p>
    </div>

    <!-- Profile Information -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-base font-semibold text-gray-900">Profile Information</h2>
        <p class="text-sm text-gray-500 mt-0.5">Update your personal details and public profile</p>
      </div>
      <div class="p-6">
        <!-- Avatar -->
        <div class="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div class="relative">
            <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-md">
              <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" alt="Avatar" />
              <span v-else class="text-2xl font-semibold text-primary">{{ initials }}</span>
            </div>
            <label
              class="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm transition-colors"
              for="avatar-upload"
            >
              <CameraIcon class="w-3.5 h-3.5 text-gray-600" />
            </label>
            <input id="avatar-upload" type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ authStore.user?.full_name || fullName }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ authStore.user?.email }}</p>
            <span
              class="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
              :class="authStore.isTrainer ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
            >
              {{ authStore.user?.role || '—' }}
            </span>
          </div>
        </div>

        <!-- Form Fields -->
        <div v-if="profileSaveError" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {{ profileSaveError }}
        </div>
        <div v-if="profileSaveSuccess" class="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Profile updated successfully.
        </div>

        <form @submit.prevent="saveProfile" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input
                v-model="profileForm.first_name"
                type="text"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="First name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input
                v-model="profileForm.last_name"
                type="text"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div class="relative">
              <input
                :value="authStore.user?.email"
                type="email"
                disabled
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2">
                <LockClosedIcon class="w-4 h-4 text-gray-400" />
              </span>
            </div>
            <p class="mt-1 text-xs text-gray-400">Email cannot be changed. Contact support if needed.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input
              v-model="profileForm.phone_number"
              type="tel"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="+1 234 567 890"
            />
          </div>

          <!-- Trainer-only bio -->
          <div v-if="authStore.isTrainer">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea
              v-model="profileForm.bio"
              rows="3"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              placeholder="Tell clients a little about yourself and your expertise..."
            ></textarea>
            <p class="mt-1 text-xs text-gray-400">Shown to clients when you are assigned as their trainer.</p>
          </div>

          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="profileSaving"
              class="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="profileSaving" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ profileSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Account Security -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-base font-semibold text-gray-900">Account Security</h2>
        <p class="text-sm text-gray-500 mt-0.5">Manage your password and security settings</p>
      </div>
      <div class="divide-y divide-gray-100">
        <!-- Change Password -->
        <div class="px-6 py-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <KeyIcon class="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Password</p>
              <p class="text-xs text-gray-500">Last changed: never</p>
            </div>
          </div>
          <button
            @click="showPasswordModal = true"
            class="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
          >
            Change
          </button>
        </div>

        <!-- 2FA Status -->
        <div class="px-6 py-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheckIcon class="w-4.5 h-4.5 text-green-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
              <p class="text-xs text-gray-500">OTP via email is active on your account</p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Enabled
          </span>
        </div>

        <!-- Last Login -->
        <div class="px-6 py-4 flex items-center gap-3">
          <div class="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
            <ClockIcon class="w-4.5 h-4.5 text-gray-500" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Last Login</p>
            <p class="text-xs text-gray-500">Member since {{ memberSince }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Connected Accounts -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-base font-semibold text-gray-900">Connected Accounts</h2>
        <p class="text-sm text-gray-500 mt-0.5">Link third-party services to enhance your experience</p>
      </div>

      <div v-if="googleStatusError" class="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        {{ googleStatusError }}
      </div>
      <div v-if="googleConnectFeedback" class="mx-6 mt-4 px-4 py-3 rounded-lg text-sm"
        :class="googleConnectFeedback.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'">
        {{ googleConnectFeedback.message }}
      </div>

      <div class="px-6 py-4">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <!-- Google logo -->
            <div class="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center shrink-0 bg-white">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Google</p>
              <p v-if="googleStatusLoading" class="text-xs text-gray-400">Checking status...</p>
              <p v-else-if="googleConnected" class="text-xs text-green-600 flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                Connected · Calendar access enabled
              </p>
              <p v-else class="text-xs text-gray-500">Connect to sync your Google Calendar</p>
            </div>
          </div>

          <div class="shrink-0">
            <button
              v-if="googleStatusLoading"
              disabled
              class="px-4 py-2 text-sm font-medium text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed"
            >
              Loading...
            </button>
            <button
              v-else-if="googleConnected"
              @click="disconnectGoogle"
              :disabled="googleActionLoading"
              class="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="googleActionLoading" class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ googleActionLoading ? 'Disconnecting...' : 'Disconnect' }}
            </button>
            <button
              v-else
              @click="connectGoogle"
              :disabled="googleActionLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="googleActionLoading" class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ googleActionLoading ? 'Redirecting...' : 'Connect' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Preferences -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-base font-semibold text-gray-900">Preferences</h2>
        <p class="text-sm text-gray-500 mt-0.5">Customize your application experience</p>
      </div>
      <div class="divide-y divide-gray-100">
        <div class="px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-gray-900">Email Notifications</p>
            <p class="text-xs text-gray-500">Receive updates about your assignments and sessions</p>
          </div>
          <button
            @click="prefs.emailNotifications = !prefs.emailNotifications"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
            :class="prefs.emailNotifications ? 'bg-primary' : 'bg-gray-200'"
            role="switch"
            :aria-checked="prefs.emailNotifications"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200"
              :class="prefs.emailNotifications ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
        <div class="px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-gray-900">Session Reminders</p>
            <p class="text-xs text-gray-500">Get notified before upcoming sessions</p>
          </div>
          <button
            @click="prefs.sessionReminders = !prefs.sessionReminders"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
            :class="prefs.sessionReminders ? 'bg-primary' : 'bg-gray-200'"
            role="switch"
            :aria-checked="prefs.sessionReminders"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200"
              :class="prefs.sessionReminders ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <Transition name="fade">
      <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closePasswordModal"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Change Password</h3>
          <p class="text-sm text-gray-500 mb-5">Enter your current password, then choose a new one.</p>

          <div v-if="passwordError" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {{ passwordError }}
          </div>

          <form @submit.prevent="submitPasswordChange" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input
                v-model="passwordForm.current"
                type="password"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                v-model="passwordForm.next"
                type="password"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="••••••••"
                required
                minlength="8"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input
                v-model="passwordForm.confirm"
                type="password"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="closePasswordModal"
                class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="passwordChanging"
                class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="passwordChanging" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ passwordChanging ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  CameraIcon,
  LockClosedIcon,
  KeyIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'
import api from '@core/services/api'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const ENDPOINTS = {
  PROFILE: import.meta.env.VITE_USER_PROFILE,
  GOOGLE_STATUS: import.meta.env.VITE_GOOGLE_STATUS,
  GOOGLE_REDIRECT: import.meta.env.VITE_GOOGLE_REDIECT,
  GOOGLE_DISCONNECT: import.meta.env.VITE_GOOGLE_DISCONNECT,
}

const route = useRoute()
const authStore = useAuthStore()

const profileForm = ref({
  first_name: authStore.user?.first_name ?? '',
  last_name: authStore.user?.last_name ?? '',
  phone_number: authStore.user?.phone_number ?? '',
  bio: '',
})
const avatarFile = ref(null)
const avatarPreview = ref(null)
const profileSaving = ref(false)
const profileSaveError = ref(null)
const profileSaveSuccess = ref(false)

const initials = computed(() => {
  const f = profileForm.value.first_name?.charAt(0) ?? ''
  const l = profileForm.value.last_name?.charAt(0) ?? ''
  return (f + l).toUpperCase() || authStore.user?.username?.charAt(0).toUpperCase() || '?'
})

const fullName = computed(() =>
  [profileForm.value.first_name, profileForm.value.last_name].filter(Boolean).join(' ')
)

function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

async function saveProfile() {
  profileSaving.value = true
  profileSaveError.value = null
  profileSaveSuccess.value = false
  try {
    const payload = {
      first_name: profileForm.value.first_name,
      last_name: profileForm.value.last_name,
      phone_number: profileForm.value.phone_number,
    }
    if (authStore.isTrainer) {
      payload.bio = profileForm.value.bio
    }
    await api.put(ENDPOINTS.PROFILE, payload)
    await authStore.fetchProfile()
    profileSaveSuccess.value = true
    setTimeout(() => { profileSaveSuccess.value = false }, 4000)
  } catch (err) {
    profileSaveError.value = err?.response?.data?.message ?? 'Failed to save profile. Please try again.'
  } finally {
    profileSaving.value = false
  }
}

const memberSince = computed(() => {
  const d = authStore.user?.created_at
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

const showPasswordModal = ref(false)
const passwordForm = ref({ current: '', next: '', confirm: '' })
const passwordChanging = ref(false)
const passwordError = ref(null)

function closePasswordModal() {
  showPasswordModal.value = false
  passwordForm.value = { current: '', next: '', confirm: '' }
  passwordError.value = null
}

async function submitPasswordChange() {
  if (passwordForm.value.next !== passwordForm.value.confirm) {
    passwordError.value = 'New passwords do not match.'
    return
  }
  passwordChanging.value = true
  passwordError.value = null
  try {
    await api.post('/auth/change-password', {
      current_password: passwordForm.value.current,
      new_password: passwordForm.value.next,
    })
    closePasswordModal()
  } catch (err) {
    passwordError.value = err?.response?.data?.message ?? 'Failed to change password. Please check your current password.'
  } finally {
    passwordChanging.value = false
  }
}

const googleConnected = ref(false)
const googleStatusLoading = ref(true)
const googleActionLoading = ref(false)
const googleStatusError = ref(null)
const googleConnectFeedback = ref(null)

async function fetchGoogleStatus() {
  googleStatusLoading.value = true
  googleStatusError.value = null
  try {
    const res = await api.get(ENDPOINTS.GOOGLE_STATUS)
    googleConnected.value = res.data?.data?.connected === true
  } catch {
    googleStatusError.value = 'Unable to check Google connection status.'
  } finally {
    googleStatusLoading.value = false
  }
}

async function connectGoogle() {
  googleActionLoading.value = true
  googleConnectFeedback.value = null
  try {
    const res = await api.get(ENDPOINTS.GOOGLE_REDIRECT)
    const redirectUrl = res.data?.data?.redirect_url
    if (redirectUrl) {
      window.location.href = redirectUrl
    } else {
      googleConnectFeedback.value = { type: 'error', message: 'Could not get Google authorization URL.' }
      googleActionLoading.value = false
    }
  } catch {
    googleConnectFeedback.value = { type: 'error', message: 'Failed to initiate Google connection.' }
    googleActionLoading.value = false
  }
}

async function disconnectGoogle() {
  googleActionLoading.value = true
  googleConnectFeedback.value = null
  try {
    await api.delete(ENDPOINTS.GOOGLE_DISCONNECT)
    googleConnected.value = false
    googleConnectFeedback.value = { type: 'success', message: 'Google account disconnected successfully.' }
    setTimeout(() => { googleConnectFeedback.value = null }, 4000)
  } catch {
    googleConnectFeedback.value = { type: 'error', message: 'Failed to disconnect Google account.' }
  } finally {
    googleActionLoading.value = false
  }
}

function handleGoogleCallback() {
  const googleParam = route.query.google
  const errorParam = route.query.error
  if (googleParam === 'connected') {
    googleConnected.value = true
    googleConnectFeedback.value = { type: 'success', message: 'Google account connected successfully.' }
    setTimeout(() => { googleConnectFeedback.value = null }, 5000)
  } else if (googleParam === 'failed') {
    googleConnectFeedback.value = {
      type: 'error',
      message: errorParam ? `Google connection failed: ${errorParam}` : 'Google connection failed. Please try again.',
    }
  }
}

const prefs = ref({
  emailNotifications: true,
  sessionReminders: true,
})

onMounted(() => {
  if (authStore.user) {
    profileForm.value.first_name = authStore.user.first_name ?? ''
    profileForm.value.last_name = authStore.user.last_name ?? ''
    profileForm.value.phone_number = authStore.user.phone_number ?? ''
  }
  fetchGoogleStatus()
  handleGoogleCallback()
})
</script>
