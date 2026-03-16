<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/25 mb-4">
          <span class="text-white font-bold text-2xl">CM</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Welcome to COMS</h1>
        <p class="text-gray-500 mt-1">Communication Onboarding Management System</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Sign in to your account</h2>

        <!-- Error Banner -->
        <div v-if="authStore.error" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {{ authStore.error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="identifier" class="block text-sm font-medium text-gray-700 mb-1.5">Email address or Username</label>
            <div class="relative">
              <EnvelopeIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="identifier"
                v-model="identifier"
                type="text"
                placeholder="email or username"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
                autocomplete="none"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div class="relative">
              <LockClosedIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
                autocomplete="none"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="rememberMe" type="checkbox" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
              <span class="text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" class="text-sm text-primary hover:text-primary-dark font-medium">Forgot password?</a>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg v-if="authStore.loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ authStore.loading ? 'Sending OTP...' : 'Continue' }}
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">
        &copy; 2025 CheckinMe. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const identifier = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  authStore.clearError()
  try {
    await authStore.login({ identifier: identifier.value, password: password.value })
    router.push('/otp')
  } catch {
    // error is set in the store
  }
}
</script>
