<template>
  <div class="max-w-2xl mx-auto space-y-6 mt-3">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="router.back()" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">New Appointment</h1>
        <p class="text-sm text-gray-500 mt-0.5">Schedule a training or demo appointment</p>
      </div>
    </div>

    <form @submit.prevent="submit" class="space-y-5">
      <!-- Title -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 class="text-sm font-semibold text-gray-900">Appointment Details</h2>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">
            {{ form.appointment_type === 'demo' ? 'Title *' : 'Title (optional)' }}
          </label>
          <input
            v-model="form.title"
            type="text"
            :required="form.appointment_type === 'demo'"
            placeholder="e.g. Initial Training Session"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Type *</label>
            <select v-model="form.appointment_type" required class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="training">Training</option>
              <option value="demo">Demo</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Location Type *</label>
            <select v-model="form.location_type" required class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="physical">Physical</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Client + Trainer -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 class="text-sm font-semibold text-gray-900">Assignment</h2>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Client *</label>
          <select v-model="form.client_id" required class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="">Select client...</option>
            <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.company_name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Trainer (optional)</label>
          <select v-model="form.trainer_id" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="">Assign later...</option>
            <option v-for="t in trainers" :key="t.id" :value="t.id">
              {{ t.first_name }} {{ t.last_name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Schedule -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 class="text-sm font-semibold text-gray-900">Schedule</h2>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Date *</label>
          <input
            v-model="form.scheduled_date"
            type="date"
            required
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Start Time *</label>
            <input
              v-model="form.scheduled_start_time"
              type="time"
              required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">End Time *</label>
            <input
              v-model="form.scheduled_end_time"
              type="time"
              required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      <!-- Location details (optional) -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 class="text-sm font-semibold text-gray-900">Location Details</h2>

        <div v-if="form.location_type !== 'physical'">
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Meeting Link</label>
          <input
            v-model="form.meeting_link"
            type="url"
            placeholder="https://meet.google.com/..."
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div v-if="form.location_type !== 'online'">
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Physical Location</label>
          <input
            v-model="form.physical_location"
            type="text"
            placeholder="Address or location name"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="Additional notes..."
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end">
        <button type="button" @click="router.back()" class="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          <span v-if="submitting">Creating...</span>
          <span v-else>Create Appointment</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { useSaleStore } from '@/modules/sale/store/sale.js'
import { useEventStore } from '@/modules/shared/store/events.js'
import { useToast } from '@/modules/shared/composables/useToast.js'

const router = useRouter()
const saleStore = useSaleStore()
const eventStore = useEventStore()
const toast = useToast()

const submitting = ref(false)
const error = ref(null)

const form = reactive({
  title: '',
  appointment_type: 'training',
  location_type: 'physical',
  client_id: '',
  trainer_id: '',
  scheduled_date: '',
  scheduled_start_time: '',
  scheduled_end_time: '',
  meeting_link: '',
  physical_location: '',
  notes: ''
})

const clients = computed(() => saleStore.clients)
const trainers = computed(() => saleStore.trainers)

async function submit() {
  submitting.value = true
  error.value = null
  try {
    const payload = {
      appointment_type: form.appointment_type,
      location_type: form.location_type,
      client_id: form.client_id,
      scheduled_date: form.scheduled_date,
      scheduled_start_time: form.scheduled_start_time,
      scheduled_end_time: form.scheduled_end_time
    }
    if (form.title || form.appointment_type === 'demo') payload.title = form.title
    if (form.trainer_id) payload.trainer_id = form.trainer_id
    if (form.meeting_link) payload.meeting_link = form.meeting_link
    if (form.physical_location) payload.physical_location = form.physical_location
    if (form.notes) payload.notes = form.notes

    const response = await saleStore.createAppointment(payload)
    eventStore.refresh()
    toast.success('Appointment created successfully!')
    router.push(`/sales/appointments/${response.data?.id || response.id || ''}`)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create appointment.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    saleStore.fetchClients(),
    saleStore.fetchTrainers()
  ])
})
</script>
