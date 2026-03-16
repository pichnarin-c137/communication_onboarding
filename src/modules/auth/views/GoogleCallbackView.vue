<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-lg shadow-primary/25 mb-4">
        <svg class="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <p class="text-sm text-gray-500">Redirecting you back...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  const google = route.query.google
  const error = route.query.error

  const query = {}
  if (google) query.google = google
  if (error) query.error = error

  // Store is reset after the full-page OAuth redirect.
  // Re-hydrate the user before deciding which profile route to go to.
  if (!authStore.user) {
    await authStore.bootstrapSession()
    if (!authStore.user) {
      return router.replace('/login')
    }
  }

  const role = authStore.user?.role
  if (role === 'trainer') {
    router.replace({ path: '/trainer/profile', query })
  } else {
    router.replace({ path: '/sales/profile', query })
  }
})
</script>
