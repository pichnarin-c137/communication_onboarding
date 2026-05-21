<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop" @click.self="$emit('close')">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Edit Credentials</h2>
            <button @click="$emit('close')" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="px-4 py-3 mx-6 my-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            Updating credentials will revoke all active sessions for this user.
          </div>

          <form @submit.prevent="handleSubmit" class="px-6 pb-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="form.email" type="email"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input v-model="form.username" type="text"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input v-model="form.phone_number" type="tel"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <p v-if="error" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ error }}</p>

            <div class="flex gap-3 justify-end pt-1">
              <button type="button" @click="$emit('close')"
                class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="loading"
                class="px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2">
                <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  open: { type: Boolean, default: false },
  user: { type: Object, default: null }
})

const emit = defineEmits(['close', 'submit'])

const loading = ref(false)
const error = ref('')
const form = ref({ email: '', username: '', phone_number: '' })

watch(() => props.user, (u) => {
  if (u) {
    form.value = { email: u.email || '', username: u.username || '', phone_number: u.phone_number || '' }
  }
}, { immediate: true })

watch(() => props.open, (val) => { if (val) error.value = '' })

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    const data = { ...form.value }
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k] })
    emit('submit', data)
  } finally {
    loading.value = false
  }
}

defineExpose({ setLoading: (v) => { loading.value = v }, setError: (v) => { error.value = v } })
</script>
