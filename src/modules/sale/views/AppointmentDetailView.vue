<template>
  <div class="max-w-3xl mx-auto space-y-5 mt-3">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="router.back()" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-gray-900 truncate">{{ appointment?.title || 'Appointment' }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ appointment?.client?.company_name }}</p>
      </div>
      <StatusBadge v-if="appointment" :status="appointment.status" />
    </div>

    <SkeletonLoader v-if="loading" type="cards" :count="2" />

    <template v-else-if="appointment">
      <!-- Info Card -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-4">Appointment Info</h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-xs text-gray-500">Type</dt>
            <dd class="font-medium text-gray-900 capitalize">{{ appointment.appointment_type }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">Location</dt>
            <dd class="font-medium text-gray-900 capitalize">{{ appointment.location_type }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">Date</dt>
            <dd class="font-medium text-gray-900">{{ formatDate(appointment.scheduled_date) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">Time</dt>
            <dd class="font-medium text-gray-900">
              {{ formatTime(appointment.scheduled_start_time) }} – {{ formatTime(appointment.scheduled_end_time) }}
            </dd>
          </div>
          <!-- <div>
            <dt class="text-xs text-gray-500">System</dt>
            <dd class="font-medium text-gray-900">{{ appointment.system?.name }}</dd>
          </div> -->
          <div>
            <dt class="text-xs text-gray-500">Trainer</dt>
            <dd class="font-medium text-gray-900">
              {{ appointment.trainer ? `${appointment.trainer.first_name} ${appointment.trainer.last_name}` : '—' }}
            </dd>
          </div>
          <div v-if="appointment.meeting_link" class="col-span-2">
            <dt class="text-xs text-gray-500">Meeting Link</dt>
            <dd>
              <a :href="appointment.meeting_link" target="_blank" class="text-primary text-sm hover:underline truncate block">
                {{ appointment.meeting_link }}
              </a>
            </dd>
          </div>
          <div v-if="appointment.physical_location" class="col-span-2">
            <dt class="text-xs text-gray-500">Location</dt>
            <dd class="font-medium text-gray-900">{{ appointment.physical_location }}</dd>
          </div>
          <div v-if="appointment.notes" class="col-span-2">
            <dt class="text-xs text-gray-500">Notes</dt>
            <dd class="text-gray-700">{{ appointment.notes }}</dd>
          </div>
        </dl>
      </div>

      <!-- Students -->
      <div v-if="appointment.students?.length" class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Students ({{ appointment.students.length }})</h2>
        <div class="divide-y divide-gray-50">
          <div v-for="s in appointment.students" :key="s.id" class="py-2.5 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ s.name }}</p>
              <p class="text-xs text-gray-500">{{ s.profession }} · {{ s.phone_number }}</p>
            </div>
            <span v-if="s.attendance_status" :class="['text-xs font-medium px-2 py-0.5 rounded-full', s.attendance_status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
              {{ s.attendance_status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Linked Onboarding -->
      <div v-if="appointment.onboarding" class="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-emerald-900">Onboarding Created</h2>
            <p class="text-xs text-emerald-700 mt-0.5">{{ appointment.onboarding.request_code }}</p>
          </div>
          <router-link
            :to="`/sales/onboarding/${appointment.onboarding.id}`"
            class="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline"
          >
            View onboarding <ChevronRightIcon class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="appointment.status === 'pending'" class="flex gap-3">
        <button
          @click="showRescheduleModal = true"
          class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reschedule
        </button>
        <button
          @click="showCancelModal = true"
          class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </template>

    <!-- Error state -->
    <div v-else-if="!loading" class="text-center py-12">
      <p class="text-sm text-gray-500">Appointment not found.</p>
    </div>

    <!-- Cancel Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCancelModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showCancelModal = false">
          <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Cancel Appointment</h3>
            <p class="text-sm text-gray-600">Are you sure you want to cancel this appointment?</p>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Reason (optional)</label>
              <textarea v-model="cancelReason" rows="3" placeholder="Enter reason..." class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
            </div>
            <div class="flex gap-3 justify-end">
              <button @click="showCancelModal = false" class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Back</button>
              <button @click="handleCancel" :disabled="cancelling" class="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
                {{ cancelling ? 'Cancelling...' : 'Cancel Appointment' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reschedule Modal -->
    <div v-if="showRescheduleModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl w-full max-w-md p-5 space-y-4">
        <h3 class="text-sm font-semibold text-gray-900">Reschedule Appointment</h3>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">New Date *</label>
          <input v-model="rescheduleForm.scheduled_date" type="date" required class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Start Time *</label>
            <AppTimePicker v-model="rescheduleForm.scheduled_start_time" placeholder="Start time…" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">End Time *</label>
            <AppTimePicker v-model="rescheduleForm.scheduled_end_time" placeholder="End time…" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1.5">Reason</label>
          <input v-model="rescheduleForm.reschedule_reason" type="text" placeholder="Optional reason..." class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div v-if="rescheduleError" class="text-sm text-red-600">{{ rescheduleError }}</div>
        <div class="flex gap-3 justify-end">
          <button @click="showRescheduleModal = false" class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button @click="handleReschedule" :disabled="rescheduling" class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60">
            {{ rescheduling ? 'Saving...' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { saleService } from '@/modules/sale/services/saleService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { extractErrorMessage } from '@core/services/error.handler'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import AppTimePicker from '@/modules/shared/components/AppTimePicker.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { formatDateMed: formatDate, formatTime } = useDateTime()

const appointment = ref(null)
const loading = ref(true)
const cancelling = ref(false)
const showCancelModal = ref(false)
const cancelReason = ref('')
const showRescheduleModal = ref(false)
const rescheduling = ref(false)
const rescheduleError = ref(null)

const rescheduleForm = reactive({
  scheduled_date: '',
  scheduled_start_time: '',
  scheduled_end_time: '',
  reschedule_reason: ''
})

async function loadAppointment() {
  loading.value = true
  try {
    const response = await saleService.getAppointment(route.params.id)
    appointment.value = response.data
  } catch {
    appointment.value = null
  } finally {
    loading.value = false
  }
}

async function handleCancel() {
  cancelling.value = true
  try {
    await saleService.cancelAppointment(appointment.value.id, cancelReason.value)
    toast.success('Appointment cancelled.')
    showCancelModal.value = false
    cancelReason.value = ''
    await loadAppointment()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    cancelling.value = false
  }
}

async function handleReschedule() {
  rescheduleError.value = null
  rescheduling.value = true
  try {
    const result = await saleService.rescheduleAppointment(appointment.value.id, rescheduleForm)
    toast.success('Appointment rescheduled.')
    showRescheduleModal.value = false
    router.push(`/sales/appointments/${result.data?.new_appointment_id}`)
  } catch (err) {
    rescheduleError.value = extractErrorMessage(err)
  } finally {
    rescheduling.value = false
  }
}

onMounted(loadAppointment)
</script>
