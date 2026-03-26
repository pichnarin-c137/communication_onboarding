<template>
  <div class="mt-3">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 mb-5 px-4">
      <div class="flex items-center gap-3 min-w-0">
        <button @click="router.back()"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        <div class="min-w-0">
          <h1 class="text-xl font-bold text-gray-900 truncate">{{ appt?.title || 'Appointment' }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ appt?.client?.company_name }}</p>
        </div>
      </div>
      <StatusBadge v-if="appt" :status="appt.status" class="shrink-0" />
    </div>

    <div class="max-w-3xl mx-auto">
      <SkeletonLoader v-if="loading" type="cards" :count="2" />
    </div>

    <template v-if="!loading && appt">
      <div v-if="hasTravelMap" class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div class="lg:sticky lg:top-4 bg-white rounded-xl border border-gray-200 overflow-hidden relative">
          <div ref="mapContainer" class="w-full h-72 lg:h-[520px]"></div>
           <button @click="isMapFullscreen = true"
              class="absolute top-3 left-3 p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50 transition-colors z-50 pointer-events-auto"
              title="View fullscreen" style="position: absolute; top: 12px; left: 12px; z-index: 1000;">
              <ArrowsPointingOutIcon class="w-4 h-4 text-gray-700" />
            </button>
          <span v-if="currentEstimate?.source" :class="['absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm z-[500]',
            currentEstimate.source === 'osrm' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
            {{ currentEstimate.source === 'osrm' ? 'Route-based' : 'Straight-line' }}
          </span>
          <div class="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 text-xs">
            <div class="flex items-center gap-1.5 min-w-0">
              <span :class="['w-2 h-2 rounded-full shrink-0', trainerStatusDot]"></span>
              <span class="text-gray-600 truncate">
                {{ trainerPosition?.name || 'Trainer' }}
                <template v-if="trainerPosition?.status"> &middot;
                  <span class="capitalize">{{ trainerPosition.status }}</span>
                </template>
              </span>
            </div>
            <span v-if="trainerPosition?.active && trainerPosition?.updated_at" class="text-gray-400 shrink-0 ml-2">
              {{ formatTimeFromISO(trainerPosition.updated_at) }}
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-gray-900">Travel Estimate</h2>
              <span class="text-xs text-primary font-semibold">{{ formatEta(currentEstimate?.eta_minutes) }}</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ formatDistance(currentEstimate?.distance_meters) }}
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-900 mb-4">Details</h2>
            <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500">Type</dt>
                <dd class="font-medium text-gray-900 capitalize">{{ appt.appointment_type }}</dd>
              </div>
              <dd class="font-medium text-gray-900 capitalize">
                  <a :href="appt.client.link_address" class="text-primary hover:underline" target="_blank">
                    {{ appt.location_type }}
                  </a>
                </dd>
              <div>
                <dt class="text-xs text-gray-500">Date</dt>
                <dd class="font-medium text-gray-900">{{ formatDate(appt.scheduled_date) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">Time</dt>
                <dd class="font-medium text-gray-900">
                  {{ formatTime(appt.scheduled_start_time) }} – {{ formatTime(appt.scheduled_end_time) }}
                </dd>
              </div>

              <div v-if="appt.meeting_link" class="col-span-2">
                <dt class="text-xs text-gray-500">Meeting Link</dt>
                <dd>
                  <a :href="appt.meeting_link" target="_blank" class="text-primary text-sm hover:underline">{{
                    appt.meeting_link
                    }}</a>
                </dd>
              </div>
              <div v-if="appt.notes" class="col-span-2">
                <dt class="text-xs text-gray-500">Notes</dt>
                <dd class="text-gray-700">{{ appt.notes }}</dd>
              </div>
            </dl>
          </div>

          <div v-if="appt.status === 'rescheduled'" class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-900 mb-4">Rescheduled Details</h2>
            <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-red-500">Reason</dt>
                <dd class="font-medium text-red-500">{{ appt.reschedule_reason }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">New Date</dt>
                <dd class="font-medium text-gray-900">{{ formatDate(appt.reschedule_to_date) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">Reschedule At</dt>
                <dd class="font-medium text-gray-900">{{ formatDate(appt.reschedule_at) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">New Time</dt>
                <dd class="font-medium text-gray-900">
                  {{ formatTime(appt.reschedule_to_start_time) }} – {{ formatTime(appt.reschedule_to_end_time) }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold text-gray-900">Students</h2>
              <button v-if="appt.status === 'in_progress'" @click="showAddStudentModal = true"
                class="text-xs text-primary hover:underline">
                + Add students
              </button>
            </div>
            <div v-if="!appt.students?.length" class="py-4 text-center text-sm text-gray-400">No students yet</div>
            <div v-else class="divide-y divide-gray-50">
              <div v-for="s in appt.students" :key="s.id" class="py-2.5 flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ s.name }}</p>
                  <p class="text-xs text-gray-500">{{ s.profession }} · {{ s.phone_number }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="s.attendance_status"
                    :class="['text-xs font-medium px-2 py-0.5 rounded-full', s.attendance_status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                    {{ s.attendance_status }}
                  </span>
                  <div v-else-if="appt.status === 'in_progress'" class="flex gap-1">
                    <button @click="markAttendance(s.id, 'present')"
                      class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200">Present</button>
                    <button @click="markAttendance(s.id, 'absent')"
                      class="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200">Absent</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <button v-if="['physical', 'hybrid'].includes(appt.location_type) && appt.status === 'pending'"
              @click="handleLeaveOffice" :disabled="actionLoading"
              class="w-full py-3 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60">
              {{ actionLoading ? 'Processing...' : 'Leave Office' }}
            </button>

            <button
              v-if="['pending', 'leave_office'].includes(appt.status) && (appt.location_type === 'online' || appt.status === 'leave_office')"
              @click="router.push(`/trainer/appointments/${appt.id}/complete?step=start`)"
              class="w-full py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors">
              Start Appointment
            </button>

            <button v-if="appt.status === 'in_progress'"
              @click="router.push(`/trainer/appointments/${appt.id}/complete`)"
              class="w-full py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
              Complete Appointment
            </button>

            <button v-if="['pending', 'leave_office', 'in_progress'].includes(appt.status)"
              @click="showCancelModal = true"
              class="w-full py-3 text-sm font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>

      <div v-else class="space-y-5">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-sm font-semibold text-gray-900 mb-4">Details</h2>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt class="text-xs text-gray-500">Type</dt>
              <dd class="font-medium text-gray-900 capitalize">{{ appt.appointment_type }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Location</dt>
              <dd class="font-medium text-gray-900 capitalize">{{ appt.location_type }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Date</dt>
              <dd class="font-medium text-gray-900">{{ formatDate(appt.scheduled_date) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Time</dt>
              <dd class="font-medium text-gray-900">
                {{ formatTime(appt.scheduled_start_time) }} – {{ formatTime(appt.scheduled_end_time) }}
              </dd>
            </div>
          </dl>
        </div>

        <div class="space-y-3">
          <button v-if="['physical', 'hybrid'].includes(appt.location_type) && appt.status === 'pending'"
            @click="handleLeaveOffice" :disabled="actionLoading"
            class="w-full py-3 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60">
            {{ actionLoading ? 'Processing...' : 'Leave Office' }}
          </button>

          <button
            v-if="['pending', 'leave_office'].includes(appt.status) && (appt.location_type === 'online' || appt.status === 'leave_office')"
            @click="router.push(`/trainer/appointments/${appt.id}/complete?step=start`)"
            class="w-full py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors">
            Start Appointment
          </button>

          <button v-if="appt.status === 'in_progress'" @click="router.push(`/trainer/appointments/${appt.id}/complete`)"
            class="w-full py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
            Complete Appointment
          </button>

          <button v-if="['pending', 'leave_office', 'in_progress'].includes(appt.status)"
            @click="showCancelModal = true"
            class="w-full py-3 text-sm font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel Appointment
          </button>
        </div>
      </div>
    </template>

    <div v-if="!loading && !appt" class="text-center py-12">
      <p class="text-sm text-gray-500">Appointment not found.</p>
    </div>

    <!-- Cancel Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCancelModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showCancelModal = false">
          <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Cancel Appointment</h3>
            <p class="text-sm text-gray-600">Are you sure you want to cancel this appointment?</p>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Reason (optional)</label>
              <textarea v-model="cancelReason" rows="3" placeholder="Enter reason..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
            </div>
            <div class="flex gap-3 justify-end">
              <button @click="showCancelModal = false"
                class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Back</button>
              <button @click="handleCancel" :disabled="actionLoading"
                class="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
                {{ actionLoading ? 'Cancelling...' : 'Cancel Appointment' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isMapFullscreen" class="fixed inset-0 bg-gray-900 z-50 flex flex-col">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
            <h3 class="text-lg font-semibold text-white">{{ appt?.title || 'Appointment Map' }}</h3>
            <button @click="isMapFullscreen = false" class="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <XMarkIcon class="w-5 h-5 text-white" />
            </button>
          </div>
          <div ref="fullscreenMapContainer" class="flex-1 w-full"></div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add Student Modal -->
    <div v-if="showAddStudentModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl w-full max-w-md p-5 space-y-4">
        <h3 class="text-sm font-semibold text-gray-900">Add Students</h3>
        <div v-for="(s, idx) in newStudents" :key="idx" class="space-y-2 p-3 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 gap-2">
            <input v-model="s.name" placeholder="Full Name *"
              class="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input v-model="s.phone_number" placeholder="Phone *"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input v-model="s.profession" placeholder="Profession"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <button v-if="newStudents.length > 1" @click="newStudents.splice(idx, 1)"
            class="text-xs text-red-500 hover:underline">Remove</button>
        </div>
        <button @click="newStudents.push({ name: '', phone_number: '', profession: '' })"
          class="text-xs text-primary hover:underline">+ Add another</button>
        <div v-if="studentError" class="text-sm text-red-600">{{ studentError }}</div>
        <div class="flex gap-3 justify-end">
          <button @click="showAddStudentModal = false; newStudents = [{ name: '', phone_number: '', profession: '' }]"
            class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button @click="submitStudents" :disabled="addingStudents"
            class="px-4 py-2 text-sm text-white bg-primary rounded-lg disabled:opacity-60">
            {{ addingStudents ? 'Saving...' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon, ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { trainerService } from '@/modules/trainer/services/trainerService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { getCurrentLocation } from '@/modules/shared/composables/useGeolocation.js'
import { extractErrorMessage } from '@core/services/error.handler'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import { useTrainerTracking } from '@/modules/shared/composables/useTrainerTracking.js'
import { useMap } from '@/modules/shared/composables/useMap.js'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { formatDateMed: formatDate, formatTime, formatTimeFromISO } = useDateTime()
const { startTracking, stopTracking, resumeIfActive } = useTrainerTracking()

const appt = ref(null)
const travelEstimates = ref(null)
const loading = ref(true)
const actionLoading = ref(false)

const mapContainer = ref(null)
const fullscreenMapContainer = ref(null)
const routeMap = useMap()
const routeMapFullscreen = useMap()
const isMapFullscreen = ref(false)

// Cancel
const showCancelModal = ref(false)
const cancelReason = ref('')

// Students
const showAddStudentModal = ref(false)
const newStudents = ref([{ name: '', phone_number: '', profession: '' }])
const addingStudents = ref(false)
const studentError = ref(null)

const hasTravelMap = computed(() => !!currentEstimate.value)
const trainerPosition = computed(() => travelEstimates.value?.trainer_position ?? null)
const currentEstimate = computed(() => travelEstimates.value?.current ?? null)
const trainerStatusDot = computed(() => {
  const s = trainerPosition.value?.status
  if (s === 'at_office') return 'bg-blue-500'
  if (s === 'traveling') return 'bg-amber-500'
  if (s === 'active') return 'bg-green-500'
  return 'bg-gray-400'
})

async function load() {
  loading.value = true
  try {
    const response = await trainerService.getAppointment(route.params.id)
    appt.value = response.data
    travelEstimates.value = response.travel_estimates ?? null
  } catch {
    appt.value = null
    travelEstimates.value = null
  } finally {
    loading.value = false
  }
}

function formatEta(minutes) {
  if (!minutes && minutes !== 0) return '—'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDistance(meters) {
  if (!meters && meters !== 0) return '—'
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

async function handleLeaveOffice() {
  actionLoading.value = true
  try {
    let lat = 0, lng = 0
    try {
      const pos = await getCurrentLocation()
      lat = pos.latitude
      lng = pos.longitude
    } catch {
      // GPS unavailable — proceed with 0,0
    }
    await trainerService.leaveOffice(appt.value.id, lat, lng)
    toast.success('Marked as left office.')
    startTracking(appt.value.id, appt.value.client?.id)
    await load()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    actionLoading.value = false
  }
}

async function handleCancel() {
  actionLoading.value = true
  try {
    await trainerService.cancelAppointment(appt.value.id, cancelReason.value)
    toast.success('Appointment cancelled.')
    stopTracking()
    showCancelModal.value = false
    cancelReason.value = ''
    await load()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    actionLoading.value = false
  }
}

async function markAttendance(studentId, status) {
  try {
    await trainerService.markAttendance(appt.value.id, studentId, status)
    await load()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to mark attendance.')
  }
}

async function submitStudents() {
  studentError.value = null
  const valid = newStudents.value.filter(s => s.name && s.phone_number)
  if (!valid.length) { studentError.value = 'At least one student with name and phone required.'; return }
  addingStudents.value = true
  try {
    await trainerService.addStudents(appt.value.id, valid)
    toast.success('Students added.')
    showAddStudentModal.value = false
    newStudents.value = [{ name: '', phone_number: '', profession: '' }]
    await load()
  } catch (err) {
    studentError.value = extractErrorMessage(err)
  } finally {
    addingStudents.value = false
  }
}

watch(currentEstimate, async (est) => {
  if (!est) return
  await nextTick()
  if (!mapContainer.value) return

  routeMap.destroy()
  routeMap.init(mapContainer.value, { zoomControl: false, attributionControl: false })
  routeMap.invalidateSize()

  const tp = trainerPosition.value
  const trainerName = tp?.name || 'Trainer'
  if (tp?.active) {
    routeMap.setTrainerPin(tp.lat, tp.lng, tp.status, trainerName)
    if (tp.status === 'traveling' && tp.branch_lat && tp.branch_lng) {
      routeMap.setBranchPin(tp.branch_lat, tp.branch_lng, tp.branch_name)
    }
  } else {
    routeMap.setTrainerPin(est.origin.lat, est.origin.lng, 'at_office', trainerName)
  }

  routeMap.setCustomerPin(est.destination.lat, est.destination.lng, est.destination.label, 0)
  if (est.route_geometry) {
    routeMap.drawRoute(est.route_geometry)
  }
  routeMap.fitToContent()
})

watch(isMapFullscreen, async (fullscreen) => {
  if (fullscreen) {
    await nextTick()
    if (!fullscreenMapContainer.value || !currentEstimate.value) return

    routeMapFullscreen.destroy()
    routeMapFullscreen.init(fullscreenMapContainer.value, { zoomControl: true, attributionControl: false })

    await new Promise(resolve => setTimeout(resolve, 300))
    routeMapFullscreen.invalidateSize()

    const est = currentEstimate.value
    const tp = trainerPosition.value
    const trainerName = tp?.name || 'Trainer'
    if (tp?.active) {
      routeMapFullscreen.setTrainerPin(tp.lat, tp.lng, tp.status, trainerName)
      if (tp.status === 'traveling' && tp.branch_lat && tp.branch_lng) {
        routeMapFullscreen.setBranchPin(tp.branch_lat, tp.branch_lng, tp.branch_name)
      }
    } else {
      routeMapFullscreen.setTrainerPin(est.origin.lat, est.origin.lng, 'at_office', trainerName)
    }

    routeMapFullscreen.setCustomerPin(est.destination.lat, est.destination.lng, est.destination.label, 0)
    if (est.route_geometry) {
      routeMapFullscreen.drawRoute(est.route_geometry)
    }
    routeMapFullscreen.fitToContent()
  } else {
    routeMapFullscreen.destroy()
  }
}, { flush: 'post' })

onMounted(async () => {
  await load()
  resumeIfActive()
})

onBeforeUnmount(() => {
  routeMap.destroy()
  routeMapFullscreen.destroy()
})
</script>
