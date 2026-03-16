<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/25">
          <ShieldCheckIcon class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mt-4">Verify your identity</h1>
        <p class="text-gray-500 mt-1 text-sm">
          We sent a one-time code to
          <span class="font-medium text-gray-700">{{ authStore.pendingIdentifier }}</span>
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
        <div v-if="authStore.error" class="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {{ authStore.error }}
        </div>

        <form @submit.prevent="handleVerify" class="space-y-5">
          <div>
            <label for="otp" class="block text-sm font-medium text-gray-700 mb-1.5">One-time code</label>
            <input
              id="otp"
              v-model="otp"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="Enter OTP"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
              autocomplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading || otp.length < 4"
            class="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg v-if="authStore.loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ authStore.loading ? 'Verifying...' : 'Verify & Sign In' }}
          </button>
        </form>

        <div class="mt-5 text-center">
          <button @click="goBack" class="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            &larr; Back to login
          </button>
        </div>
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">&copy; 2025 CheckinMe. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ShieldCheckIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const otp = ref('')

if (!authStore.pendingIdentifier) {
  router.replace('/login')
}

async function handleVerify() {
  authStore.clearError()
  try {
    await authStore.verifyOtp(otp.value)
    const role = authStore.user?.role
    if (role === 'trainer') {
      router.push('/trainer')
    } else if (role === 'sale' || role === 'admin') {
      router.push('/sales')
    } else {
      authStore.error = `Account role "${role}" is not supported in this application.`
      authStore.user = null;
      router.push('/login')
    }
  } catch (error) {
    authStore.error = 'Invalid OTP. Please try again.'
  }
}

function goBack() {
  authStore.clearError()
  router.push('/login')
}
</script>
