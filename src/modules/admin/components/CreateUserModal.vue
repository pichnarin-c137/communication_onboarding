<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop" @click.self="$emit('close')">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Create User</h2>
            <button @click="$emit('close')" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-4">
            <!-- Credentials section -->
            <div class="space-y-1">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credentials</p>
              <p class="text-xs text-gray-500 leading-relaxed">
                These details will be used by the user to sign in. Email and phone must be unique, username should not contain spaces, and password must be at least 8 characters. Share these credentials securely with the user after creation.
              </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
                <input v-model="form.email" type="email" required
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username <span class="text-red-500">*</span></label>
                <input v-model="form.username" type="text" required
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone <span class="text-red-500">*</span></label>
                <input v-model="form.phone_number" type="tel" required
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password <span class="text-red-500">*</span></label>
                <input v-model="form.password" type="password" required minlength="8"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role <span class="text-red-500">*</span></label>
              <select v-model="form.role" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Select role...</option>
                <option value="sale">Sale</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <!-- Dedicated Trainers (sale only) -->
            <div v-if="form.role === 'sale'" class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Dedicated Trainers <span class="text-red-500">*</span>
              </label>
              <p class="text-xs text-gray-500 leading-relaxed mb-1.5">
                Pick the trainers this sale is allowed to assign to appointments. At least {{ MIN_TRAINERS }} required.
              </p>
              <DedicatedTrainerPicker
                v-model="form.trainer_ids"
                :min="MIN_TRAINERS"
                :invalid="rosterInvalid"
                :hint="rosterInvalid ? `Select at least ${MIN_TRAINERS} trainer${MIN_TRAINERS > 1 ? 's' : ''}.` : ''"
              />
            </div>

            <!-- Profile section -->
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">Profile (optional)</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input v-model="form.first_name" type="text"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input v-model="form.last_name" type="text"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select v-model="form.gender"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input v-model="form.dob" type="date"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input v-model="form.nationality" type="text"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input v-model="form.address" type="text"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <!-- Error -->
            <p v-if="error" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ error }}</p>

            <!-- Actions -->
            <div class="flex gap-3 justify-end pt-2">
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
                {{ loading ? 'Creating...' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import DedicatedTrainerPicker from '@/modules/shared/components/DedicatedTrainerPicker.vue'

const MIN_TRAINERS = 1

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'submit'])

const loading = ref(false)
const error = ref('')
const rosterTouched = ref(false)

const emptyForm = () => ({
  email: '', username: '', phone_number: '', password: '',
  role: '', first_name: '', last_name: '', gender: '',
  dob: '', nationality: '', address: '', trainer_ids: []
})

const form = ref(emptyForm())

const rosterInvalid = computed(() =>
  form.value.role === 'sale'
    && rosterTouched.value
    && (form.value.trainer_ids?.length || 0) < MIN_TRAINERS
)

watch(() => props.open, (val) => {
  if (val) { form.value = emptyForm(); error.value = ''; rosterTouched.value = false }
})

watch(() => form.value.role, (role) => {
  if (role !== 'sale') form.value.trainer_ids = []
})

async function handleSubmit() {
  if (form.value.role === 'sale') {
    rosterTouched.value = true
    if ((form.value.trainer_ids?.length || 0) < MIN_TRAINERS) {
      error.value = `Select at least ${MIN_TRAINERS} dedicated trainer.`
      return
    }
  }

  loading.value = true
  error.value = ''
  try {
    const data = { ...form.value }
    // Drop trainer_ids for non-sale roles, drop other empty fields.
    if (data.role !== 'sale') delete data.trainer_ids
    Object.keys(data).forEach(k => {
      if (k === 'trainer_ids') return
      if (data[k] === '') delete data[k]
    })
    emit('submit', data)
  } finally {
    loading.value = false
  }
}

defineExpose({ setLoading: (v) => { loading.value = v }, setError: (v) => { error.value = v } })
</script>
