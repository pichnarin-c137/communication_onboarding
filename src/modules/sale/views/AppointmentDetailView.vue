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
          <h1 class="text-xl font-bold text-gray-900 truncate">{{ appointment?.title || 'Appointment' }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ appointment?.client?.company_name }}</p>
        </div>
      </div>
      <StatusBadge v-if="appointment" :status="appointment.status" class="shrink-0" />
    </div>

    <div class="max-w-3xl mx-auto">
      <SkeletonLoader v-if="loading" type="cards" :count="2" />
    </div>

    <template v-if="!loading && appointment">
      <!-- === Two-column layout when map is available === -->
      <div v-if="hasTravelMap" class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <!-- LEFT: Sticky map — isolate creates a stacking context so Leaflet z-indices stay contained -->
        <div class="lg:sticky lg:top-4 bg-white rounded-xl border border-gray-200 overflow-hidden relative isolate">
          <div ref="mapContainer" class="w-full h-72 lg:h-[520px] relative">
            <!-- Fullscreen button overlay -->
            <button @click="isMapFullscreen = true"
              class="absolute top-3 left-3 p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50 transition-colors z-50 pointer-events-auto"
              title="View fullscreen" style="position: absolute; top: 12px; left: 12px; z-index: 1000;">
              <ArrowsPointingOutIcon class="w-4 h-4 text-gray-700" />
            </button>
          </div>
          <!-- Source badge overlay -->
          <span v-if="currentEstimate?.source" :class="['absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm z-[500]',
            currentEstimate.source === 'osrm' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
            {{ currentEstimate.source === 'osrm' ? 'Route-based' : 'Straight-line' }}
          </span>
          <!-- Trainer status bar below map -->
          <div class="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 text-xs">
            <div class="flex items-center gap-1.5 min-w-0">
              <span :class="['w-2 h-2 rounded-full shrink-0', trainerStatusDot]"></span>
              <span class="text-gray-600 truncate">
                {{ trainerPosition?.name || 'Trainer' }}
                <template v-if="trainerPosition?.status === 'at_office'"> &middot;
                  <span class="text-blue-600">At office</span>
                  <span v-if="trainerPosition.branch_name" class="text-gray-400"> ({{ trainerPosition.branch_name
                  }})</span>
                </template>
                <template v-else-if="trainerPosition?.status === 'traveling'"> &middot;
                  <span class="text-amber-600">Traveling</span>
                  <span v-if="trainerPosition.distance_from_branch_m" class="text-gray-400">
                    &middot; {{ formatDistance(trainerPosition.distance_from_branch_m) }} from office
                  </span>
                </template>
                <template v-else-if="trainerPosition?.status === 'active'"> &middot;
                  <span class="text-green-600">Active</span>
                </template>
                <template v-else> &middot;
                  <span class="text-gray-400">Offline</span>
                </template>
              </span>
            </div>
            <span v-if="trainerPosition?.active && trainerPosition?.updated_at" class="text-gray-400 shrink-0 ml-2">
              {{ formatTimeFromISO(trainerPosition.updated_at) }}
            </span>
          </div>
        </div>

        <!-- RIGHT: All detail cards stacked -->
        <div class="space-y-4">
          <!-- Travel Estimate summary -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-gray-900">Travel Estimate</h2>
              <span v-if="currentEstimate?.source" :class="['text-[10px] font-medium px-2 py-0.5 rounded-full',
                currentEstimate.source === 'osrm' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
                {{ currentEstimate.source === 'osrm' ? 'Route-based' : 'Straight-line' }}
              </span>
            </div>

            <!-- ETA hero -->
            <div class="text-center py-1">
              <p class="text-3xl font-bold text-primary">{{ formatEta(currentEstimate.eta_minutes) }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDistance(currentEstimate.distance_meters) }}</p>
            </div>

            <!-- Origin → Destination timeline -->
            <div class="space-y-2">
              <div class="flex items-start gap-3">
                <div class="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 ring-2 ring-blue-100"></div>
                <div class="min-w-0">
                  <p class="text-[10px] uppercase tracking-wide text-gray-400">From</p>
                  <p class="text-sm font-medium text-gray-900 truncate">{{ currentEstimate.origin?.label }}</p>
                </div>
              </div>
              <div class="ml-[5px] w-px h-3 bg-gray-200"></div>
              <div class="flex items-start gap-3">
                <div class="mt-1 w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 ring-2 ring-red-100"></div>
                <div class="min-w-0">
                  <p class="text-[10px] uppercase tracking-wide text-gray-400">To</p>
                  <p class="text-sm font-medium text-gray-900 truncate">{{ currentEstimate.destination?.label }}</p>
                </div>
              </div>
            </div>

            <!-- Session duration -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-100 text-sm">
              <span class="text-gray-500">Session Duration</span>
              <span class="font-medium text-gray-900">{{ computeSessionDuration() }}</span>
            </div>
          </div>

          <!-- Appointment Info -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-900 mb-4">Appointment Info</h2>
            <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500">Type</dt>
                <dd class="font-medium text-gray-900 capitalize">{{ appointment.appointment_type }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">Location</dt>
                <dd class="font-medium text-gray-900 capitalize">
                  <a :href="appointment.client.link_address" class="text-primary hover:underline" target="_blank">
                    {{ appointment.location_type }}
                  </a>
                </dd>
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
              <div v-if="appointment.meeting_link" class="col-span-2">
                <dt class="text-xs text-gray-500">Meeting Link</dt>
                <dd>
                  <a :href="appointment.meeting_link" target="_blank"
                    class="text-primary text-sm hover:underline truncate block">
                    {{ appointment.meeting_link }}
                  </a>
                </dd>
              </div>
              <div v-if="appointment.notes" class="col-span-2">
                <dt class="text-xs text-gray-500">Notes</dt>
                <dd class="text-gray-700">{{ appointment.notes }}</dd>
              </div>
            </dl>
          </div>

          <!-- Other pending appointments -->
          <div v-if="otherEstimates.length" class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-sm font-semibold text-gray-900 mb-3">Other Pending ({{ otherEstimates.length }})</p>
            <div class="space-y-2">
              <div v-for="est in otherEstimates" :key="est.appointment_id"
                class="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                @click="router.push(`/sales/appointments/${est.appointment_id}`)">
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ est.client_name }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(est.scheduled_date) }} {{
                    formatTime(est.scheduled_start_time)
                  }}</p>
                </div>
                <div class="text-right shrink-0 ml-3">
                  <p class="font-semibold text-primary">{{ formatEta(est.eta_minutes) }}</p>
                  <p class="text-[10px] text-gray-500">{{ formatDistance(est.distance_meters) }}</p>
                </div>
              </div>
            </div>
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
                <span v-if="s.attendance_status"
                  :class="['text-xs font-medium px-2 py-0.5 rounded-full', s.attendance_status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
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
              <router-link :to="`/sales/onboarding/${appointment.onboarding.id}`"
                class="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline">
                View onboarding
                <ChevronRightIcon class="w-3.5 h-3.5" />
              </router-link>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="appointment.status === 'pending'" class="flex gap-3">
            <button @click="showRescheduleModal = true"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Reschedule
            </button>
            <button @click="showCancelModal = true"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- === Single-column fallback (no map / non-pending / error) === -->
      <div v-else class="max-w-3xl mx-auto space-y-5">
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
              <dd class="font-medium text-gray-900 capitalize">
                <a :href="appointment.client.link_address" class="text-primary hover:underline" target="_blank">
                  {{ appointment.location_type }}
                </a>
              </dd>
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
            <div v-if="appointment.meeting_link" class="col-span-2">
              <dt class="text-xs text-gray-500">Meeting Link</dt>
              <dd>
                <a :href="appointment.meeting_link" target="_blank"
                  class="text-primary text-sm hover:underline truncate block">
                  {{ appointment.meeting_link }}
                </a>
              </dd>
            </div>
            <div v-if="appointment.notes" class="col-span-2">
              <dt class="text-xs text-gray-500">Notes</dt>
              <dd class="text-gray-700">{{ appointment.notes }}</dd>
            </div>
          </dl>
        </div>

        <!-- Travel estimate error -->
        <div v-if="appointment.status === 'pending' && travelEstimates && currentEstimateError"
          class="bg-white rounded-xl border border-gray-200 p-5">
          <div
            class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <ExclamationTriangleIcon class="w-4 h-4 shrink-0" />
            <span>{{ estimateErrorMessage(currentEstimateError.reason) }}</span>
          </div>
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
              <span v-if="s.attendance_status"
                :class="['text-xs font-medium px-2 py-0.5 rounded-full', s.attendance_status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
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
            <router-link :to="`/sales/onboarding/${appointment.onboarding.id}`"
              class="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline">
              View onboarding
              <ChevronRightIcon class="w-3.5 h-3.5" />
            </router-link>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="appointment.status === 'pending'" class="flex gap-3">
          <button @click="showRescheduleModal = true"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Reschedule
          </button>
          <button @click="showCancelModal = true"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </template>

    <!-- Error state -->
    <div v-if="!loading && !appointment" class="text-center py-12">
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
              <button @click="handleCancel" :disabled="cancelling"
                class="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
                {{ cancelling ? 'Cancelling...' : 'Cancel Appointment' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Fullscreen Map Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isMapFullscreen" class="fixed inset-0 bg-gray-900 z-[60] flex flex-col">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
            <h3 class="text-lg font-semibold text-white">{{ appointment?.title || 'Appointment Map' }}</h3>
            <button @click="isMapFullscreen = false" class="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <XMarkIcon class="w-5 h-5 text-white" />
            </button>
          </div>
          <div ref="fullscreenMapContainer" class="flex-1 w-full"></div>
        </div>
      </Transition>
    </Teleport>

    <!-- Trainer Info Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showTrainerInfoPopup" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
          @click.self="showTrainerInfoPopup = false">
          <div class="bg-white rounded-xl shadow-lg max-w-sm w-full p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Trainer Information</h3>
              <button @click="showTrainerInfoPopup = false" class="p-1 hover:bg-gray-100 rounded transition-colors">
                <XMarkIcon class="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div v-if="trainerPosition" class="space-y-3">
              <div>
                <p class="text-xs font-medium text-gray-500 uppercase">Name</p>
                <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ trainerPosition?.name || 'Trainer' }}</p>
              </div>
              <div v-if="trainerPosition?.status">
                <p class="text-xs font-medium text-gray-500 uppercase">Status</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span :class="['w-2.5 h-2.5 rounded-full', trainerStatusDot]"></span>
                  <p class="text-sm font-medium text-gray-900 capitalize">{{ trainerPosition.status }}</p>
                </div>
              </div>
              <div v-if="trainerPosition?.branch_name">
                <p class="text-xs font-medium text-gray-500 uppercase">Branch</p>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ trainerPosition.branch_name }}</p>
              </div>
              <div v-if="trainerPosition?.distance_from_branch_m && trainerPosition.status === 'traveling'">
                <p class="text-xs font-medium text-gray-500 uppercase">Distance from Office</p>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{
                  formatDistance(trainerPosition.distance_from_branch_m) }}</p>
              </div>
              <div v-if="trainerPosition?.updated_at">
                <p class="text-xs font-medium text-gray-500 uppercase">Last Updated</p>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ formatTimeFromISO(trainerPosition.updated_at) }}
                </p>
              </div>
            </div>
            <button @click="showTrainerInfoPopup = false"
              class="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Close
            </button>
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
          <input v-model="rescheduleForm.scheduled_date" type="date" required
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
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
          <input v-model="rescheduleForm.reschedule_reason" type="text" placeholder="Optional reason..."
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div v-if="rescheduleError" class="text-sm text-red-600">{{ rescheduleError }}</div>
        <div class="flex gap-3 justify-end">
          <button @click="showRescheduleModal = false"
            class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button @click="handleReschedule" :disabled="rescheduling"
            class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60">
            {{ rescheduling ? 'Saving...' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon, ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { saleService } from '@/modules/sale/services/saleService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { extractErrorMessage } from '@core/services/error.handler'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import AppTimePicker from '@/modules/shared/components/AppTimePicker.vue'
import { useMap } from '@/modules/shared/composables/useMap.js'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { formatDateMed: formatDate, formatTime, formatTimeFromISO } = useDateTime()

const appointment = ref(null)
const travelEstimates = ref(null)
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

const mapContainer = ref(null)
const fullscreenMapContainer = ref(null)
const routeMap = useMap()
const routeMapFullscreen = useMap()
const isMapFullscreen = ref(false)
const showTrainerInfoPopup = ref(false)

const hasTravelMap = computed(() => !!currentEstimate.value)
const trainerPosition = computed(() => travelEstimates.value?.trainer_position ?? null)
const currentEstimate = computed(() => travelEstimates.value?.current ?? null)
const otherEstimates = computed(() => travelEstimates.value?.other_pending ?? [])
const trainerStatusDot = computed(() => {
  const s = trainerPosition.value?.status
  if (s === 'at_office') return 'bg-blue-500'
  if (s === 'traveling') return 'bg-amber-500'
  if (s === 'active') return 'bg-green-500'
  return 'bg-gray-400'
})

const currentEstimateError = computed(() => {
  if (currentEstimate.value) return null
  return travelEstimates.value?.errors?.find(e => e.appointment_id === appointment.value?.id) ?? null
})

function formatEta(minutes) {
  if (!minutes && minutes !== 0) return '—'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDistance(meters) {
  if (!meters && meters !== 0) return ''
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function computeSessionDuration() {
  const appt = appointment.value
  if (!appt?.scheduled_start_time || !appt?.scheduled_end_time) return '—'
  const [sh, sm] = appt.scheduled_start_time.split(':').map(Number)
  const [eh, em] = appt.scheduled_end_time.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return '—'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function estimateErrorMessage(reason) {
  const messages = {
    missing_branch_location: 'Trainer\'s branch has no location set.',
    missing_client_location: 'Client has no headquarters location set.',
    missing_trainer_branch: 'Trainer is not assigned to a branch.',
  }
  return messages[reason] || 'Unable to estimate travel time.'
}

async function loadAppointment() {
  loading.value = true
  try {
    const response = await saleService.getAppointment(route.params.id)
    appointment.value = response.data
    travelEstimates.value = response.travel_estimates ?? null
  } catch {
    appointment.value = null
    travelEstimates.value = null
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

watch(currentEstimate, async (est) => {
  if (!est) return
  await nextTick()
  if (!mapContainer.value) return
  routeMap.init(mapContainer.value, { zoomControl: false, attributionControl: false })

  const tp = trainerPosition.value
  const trainerName = tp?.name || 'Trainer'
  if (tp?.active) {
    routeMap.setTrainerPin(tp.lat, tp.lng, tp.status, trainerName)
    // Show branch HQ marker when trainer is away from office
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

    // Clean up any existing map instance
    routeMapFullscreen.destroy()

    routeMapFullscreen.init(fullscreenMapContainer.value, { zoomControl: true, attributionControl: false })

    // Wait for map to render completely
    await new Promise(resolve => setTimeout(resolve, 500))

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
    // Cleanup when exiting fullscreen
    routeMapFullscreen.destroy()
  }
}, { flush: 'post' })

onMounted(loadAppointment)
onBeforeUnmount(() => {
  routeMap.destroy()
  routeMapFullscreen.destroy()
})
</script>
