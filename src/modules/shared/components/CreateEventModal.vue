<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="eventStore.isCreateModalOpen"
        class="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop"
        @click.self="close">
        <div
          class="bg-white w-full sm:rounded-2xl sm:shadow-2xl sm:max-w-lg max-h-[95vh] overflow-y-auto rounded-t-2xl">
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
            <h3 class="text-base font-semibold text-gray-900">New Appointment</h3>
            <button @click="close"
              class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="submit" class="p-5 space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">
                {{ form.appointment_type === 'demo' ? 'Title *' : 'Title (optional)' }}
              </label>
              <input v-model="form.title" type="text" :required="form.appointment_type === 'demo'"
                placeholder="e.g. Initial Training Session"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <!-- Type + Location -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Type *</label>
                <select v-model="form.appointment_type" required
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="training">Training</option>
                  <option v-if="!authStore.isTrainer" value="demo">Demo</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Location *</label>
                <select v-model="form.location_type" required
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="physical">Physical</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <!-- Client -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Client *</label>
              <select v-model="form.client_id" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Select client...</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.company_name }}</option>
              </select>
            </div>

            <!-- Trainer (sale role only) -->
            <div v-if="!authStore.isTrainer">
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Trainer (optional)</label>
              <select v-model="form.trainer_id"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Assign later...</option>
                <option v-for="t in trainers" :key="t.id" :value="t.id">{{ t.first_name }} {{ t.last_name }}</option>
              </select>
            </div>

            <!-- Date + Times -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Date *</label>
              <input v-model="form.scheduled_date" type="date" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Start *</label>
                <input v-model="form.scheduled_start_time" type="time" required
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">End *</label>
                <input v-model="form.scheduled_end_time" type="time" required
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <!-- Meeting link -->
            <div v-if="form.location_type !== 'physical'">
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Meeting Link</label>
              <input v-model="form.meeting_link" type="url" placeholder="https://meet.google.com/..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <!-- Physical location -->
            <div v-if="form.location_type !== 'online'">
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Physical Location</label>
              <input v-model="form.physical_location" type="text" placeholder="Address or location name"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea v-model="form.notes" rows="2" placeholder="Additional notes..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
            </div>

            <!-- Error -->
            <div v-if="error" class="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{{
              error }}</div>

            <!-- Submit -->
            <div class="flex gap-3 pt-1">
              <button type="button" @click="close"
                class="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="submitting"
                class="flex-1 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60">
                {{ submitting ? 'Creating...' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useEventStore } from '@/modules/shared/store/events.js'
import { saleService } from '@/modules/sale/services/saleService.js'
import { trainerService } from '@/modules/trainer/services/trainerService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'

const authStore = useAuthStore()
const eventStore = useEventStore()
const toast = useToast()

const clients = ref([])
const trainers = ref([])
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

function getClientById(clientId) {
  return clients.value.find(client => String(client.id) === String(clientId))
}

function computeDefaultTimes() {
  const d = new Date()
  d.setSeconds(0, 0)
  // round up to next 30-min boundary
  const rem = d.getMinutes() % 30
  if (rem > 0) d.setMinutes(d.getMinutes() + (30 - rem))
  const start = new Date(d)
  start.setHours(start.getHours() + 1)
  const end = new Date(start)
  end.setHours(end.getHours() + 2)
  const pad = n => String(n).padStart(2, '0')
  return {
    startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`
  }
}

function resetForm() {
  const defaults = eventStore.createModalDefaults || {}
  const today = new Date().toISOString().split('T')[0]
  const times = (defaults.startTime && defaults.endTime)
    ? { startTime: defaults.startTime, endTime: defaults.endTime }
    : computeDefaultTimes()
  Object.assign(form, {
    title: '',
    appointment_type: 'training',
    location_type: 'physical',
    client_id: '',
    trainer_id: '',
    scheduled_date: defaults.date || today,
    scheduled_start_time: times.startTime,
    scheduled_end_time: times.endTime,
    meeting_link: '',
    physical_location: '',
    notes: ''
  })
  error.value = null
}

watch(() => form.client_id, (clientId) => {
  if (!clientId) return
  const selectedClient = getClientById(clientId)
  if (selectedClient?.link_address) {
    form.physical_location = selectedClient.link_address
  }
})

// Load dropdowns when modal opens
watch(() => eventStore.isCreateModalOpen, async (open) => {
  if (!open) return
  resetForm()
  try {
    const c = await saleService.listClients({ limit: 100 })
    clients.value = c.data?.data || c.data || []
    if (!authStore.isTrainer) {
      const t = await saleService.listTrainers({ limit: 50 })
      trainers.value = t.data?.data || t.data || []
    }
  } catch {
    // dropdowns fail silently
  }
})

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
    if (form.title) payload.title = form.title
    if (form.trainer_id) payload.trainer_id = form.trainer_id
    if (form.meeting_link) payload.meeting_link = form.meeting_link
    if (form.physical_location) payload.physical_location = form.physical_location
    if (form.notes) payload.notes = form.notes

    // Both services use getAppointments but only saleService has createAppointment
    // Use saleService for creation regardless (same endpoint POST /appointments)
    await saleService.createAppointment(payload)
    toast.success('Appointment created!')
    eventStore.closeModals()
    await eventStore.refresh()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create appointment.'
  } finally {
    submitting.value = false
  }
}

function close() {
  eventStore.closeModals()
}
</script>
