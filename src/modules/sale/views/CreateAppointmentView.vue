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
            <AppSelect
              v-model="form.appointment_type"
              :options="TYPE_OPTIONS"
              :disabled="isProspectDemo"
              placeholder="Select type…"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Location Type *</label>
            <AppSelect
              v-model="form.location_type"
              :options="LOCATION_OPTIONS"
              placeholder="Select location…"
            />
          </div>
        </div>
      </div>

      <!-- Client + Trainer -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 class="text-sm font-semibold text-gray-900">Assignment</h2>

        <!-- CRM prospect (demo booked from the pipeline) -->
        <div v-if="isProspectDemo">
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Prospect</label>
          <div class="flex items-center gap-2 px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700">
              CRM Prospect
            </span>
            <span class="text-sm font-medium text-gray-800">{{ crmContactName || 'Prospect' }}</span>
          </div>
          <p class="mt-1 text-xs text-gray-500">This demo is booked against a CRM prospect — it converts to a client when the deal is won.</p>
        </div>

        <!-- Existing client -->
        <div v-else>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Client *</label>
          <AppSelect
            v-model="form.client_id"
            :options="clientOptions"
            :loading="saleStore.loadingClients"
            remote
            clearable
            placeholder="Select client…"
            search-placeholder="Search clients…"
            empty-text="No clients found"
            @search="onClientSearch"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Trainer (optional)</label>
          <AppSelect
            v-model="form.trainer_id"
            :options="trainerOptions"
            :loading="saleStore.loadingTrainers"
            remote
            clearable
            placeholder="Assign later…"
            search-placeholder="Search trainers…"
            empty-text="No trainers found"
            @search="onTrainerSearch"
          />
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
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import AppSelect from '@/modules/shared/components/AppSelect.vue'
import { useSaleStore } from '@/modules/sale/store/sale.js'
import { useEventStore } from '@/modules/shared/store/events.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { extractErrorMessage, getErrorCode } from '@core/services/error.handler'

const route = useRoute()
const router = useRouter()
const saleStore = useSaleStore()
const eventStore = useEventStore()
const toast = useToast()

const submitting = ref(false)
const error = ref(null)

// CRM prospect-demo context (passed from the pipeline's "Schedule Demo" action).
// When present, the appointment is booked against a CRM contact instead of a client.
const crmContactId = route.query.crm_contact_id || ''
const crmDealId = route.query.crm_deal_id || ''
const crmContactName = route.query.crm_contact_name || ''
const isProspectDemo = computed(() => !!crmContactId)

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

const TYPE_OPTIONS = [
  { value: 'training', label: 'Training' },
  { value: 'demo', label: 'Demo' }
]
const LOCATION_OPTIONS = [
  { value: 'physical', label: 'Physical' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Hybrid' }
]
const clientOptions = computed(() =>
  clients.value.map((c) => ({ value: c.id, label: c.company_name + (c.from_crm ? ' • CRM' : '') }))
)
const trainerOptions = computed(() =>
  trainers.value.map((t) => ({ value: t.id, label: `${t.first_name} ${t.last_name}`.trim() }))
)

function onClientSearch(q) {
  saleStore.fetchClients(q)
}
function onTrainerSearch(q) {
  saleStore.fetchTrainers(q)
}

async function submit() {
  if (!isProspectDemo.value && !form.client_id) {
    error.value = 'Please select a client.'
    return
  }
  submitting.value = true
  error.value = null
  try {
    const payload = {
      appointment_type: form.appointment_type,
      location_type: form.location_type,
      scheduled_date: form.scheduled_date,
      scheduled_start_time: form.scheduled_start_time,
      scheduled_end_time: form.scheduled_end_time
    }
    // A demo must carry exactly one of crm_contact_id or client_id; training only ever
    // carries client_id (CRM fields on training are rejected by the API).
    if (isProspectDemo.value) {
      payload.crm_contact_id = crmContactId
      if (crmDealId) payload.crm_deal_id = crmDealId
    } else {
      payload.client_id = form.client_id
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
    if (getErrorCode(err) === 'TRAINER_NOT_IN_SALE_ROSTER') {
      form.trainer_id = ''
      error.value = 'This trainer is not in your assigned roster. Leave the field blank or contact an admin to update your roster.'
      toast.error('Trainer is not in your roster.')
    } else {
      error.value = extractErrorMessage(err)
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  // A prospect demo locks the type to "demo" and books against the CRM contact.
  if (isProspectDemo.value) form.appointment_type = 'demo'

  await Promise.all([
    saleStore.fetchClients(),
    saleStore.fetchTrainers()
  ])
  const preselect = route.query.trainer_id
  if (preselect && saleStore.trainers.some((t) => t.id === preselect)) {
    form.trainer_id = preselect
  }
  const preClient = route.query.client_id
  if (!isProspectDemo.value && preClient && saleStore.clients.some((c) => c.id === preClient)) {
    form.client_id = preClient
  }
})
</script>
