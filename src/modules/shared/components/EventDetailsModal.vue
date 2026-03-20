<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="eventStore.isDetailsModalOpen"
        class="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop"
        @click.self="close"
      >
        <div class="bg-white w-full sm:rounded-2xl sm:shadow-2xl sm:max-w-lg max-h-[95vh] overflow-y-auto rounded-t-2xl">

          <!-- Status colour bar -->
          <div class="h-1.5 rounded-t-2xl transition-colors" :style="{ backgroundColor: statusBarColor }"></div>

          <!-- Loading state -->
          <div v-if="fetching" class="p-8 flex items-center justify-center">
            <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <template v-else-if="appt">
            <!-- Header -->
            <div class="flex items-start gap-3 px-5 pt-4 pb-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full capitalize', appt.appointment_type === 'demo' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700']">
                    {{ appt.appointment_type }}
                  </span>
                  <StatusBadge :status="appt.status" />
                </div>
                <h3 v-if="appt.title" class="text-base font-bold text-gray-900 leading-snug">{{ appt.title }}</h3>
              </div>
              <button @click="close" class="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Details section (view mode or non-edit modes) -->
            <div v-if="mode !== 'edit'" class="px-5 pb-3 space-y-2.5">
              <DetailRow :icon="CalendarIcon">{{ formatDate(appt.scheduled_date) }}</DetailRow>
              <DetailRow :icon="ClockIcon">
                {{ formatTime(appt.scheduled_start_time) }} – {{ formatTime(appt.scheduled_end_time) }}
              </DetailRow>
              <DetailRow :icon="MapPinIcon">
                <span class="capitalize">{{ appt.location_type }}</span>
                <span v-if="appt.physical_location" class="text-gray-500 ml-1">· {{ appt.physical_location }}</span>
              </DetailRow>
              <DetailRow v-if="appt.meeting_link" :icon="LinkIcon">
                <a :href="appt.meeting_link" target="_blank" class="text-primary hover:underline truncate block max-w-[280px]">
                  {{ appt.meeting_link }}
                </a>
              </DetailRow>
              <DetailRow :icon="BuildingOfficeIcon">{{ appt.client?.company_name }}</DetailRow>
              <DetailRow :icon="ComputerDesktopIcon">{{ appt.system?.name }}</DetailRow>
              <DetailRow v-if="appt.trainer" :icon="UserIcon">
                {{ appt.trainer.first_name }} {{ appt.trainer.last_name }}
              </DetailRow>
              <DetailRow v-if="appt.notes" :icon="ClipboardDocumentIcon">{{ appt.notes }}</DetailRow>
            </div>

            <!--  TRAINER ACTIONS  -->
            <template v-if="authStore.isTrainer">

              <!-- VIEW MODE — show action buttons -->
              <div v-if="mode === 'view'" class="px-5 pb-5 space-y-3">
                <div class="border-t border-gray-100 pt-3">
                  <!-- Status-driven primary actions -->
                  <div class="grid gap-2">

                    <!-- Leave Office: physical/hybrid pending -->
                    <button
                      v-if="canLeaveOffice"
                      @click="mode = 'leave_office'"
                      class="w-full py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Leave Office
                    </button>

                    <!-- Start: online pending OR after leave_office -->
                    <button
                      v-if="canStart"
                      @click="mode = 'start'"
                      class="w-full py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      Start Appointment
                    </button>

                    <!-- Complete: in_progress -->
                    <button
                      v-if="canComplete"
                      @click="mode = 'complete'"
                      class="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      Complete Appointment
                    </button>

                    <!-- Add Students: in_progress -->
                    <button
                      v-if="canComplete"
                      @click="mode = 'students'"
                      class="w-full py-2.5 text-sm font-medium text-emerald-700 border border-emerald-300 rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      Add / Mark Students
                    </button>
                  </div>

                  <!-- Secondary actions -->
                  <div v-if="canEdit || canReschedule || canCancel" class="grid grid-cols-3 gap-2 mt-2">
                    <button v-if="canEdit" @click="initEdit()" class="py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Edit</button>
                    <button v-if="canReschedule" @click="mode = 'reschedule'" class="py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Reschedule</button>
                    <button v-if="canCancel" @click="mode = 'cancel'" class="py-2 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Cancel</button>
                  </div>
                </div>

                <!-- Students list (read) -->
                <div v-if="appt.students?.length" class="border-t border-gray-100 pt-3">
                  <p class="text-xs font-semibold text-gray-700 mb-2">Students ({{ appt.students.length }})</p>
                  <div class="space-y-1.5 max-h-40 overflow-y-auto">
                    <div v-for="s in appt.students" :key="s.id" class="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-gray-50">
                      <div>
                        <span class="font-medium text-gray-900">{{ s.name }}</span>
                        <span class="text-gray-400 ml-1.5">{{ s.profession }}</span>
                      </div>
                      <span v-if="s.attendance_status" :class="['font-medium px-1.5 py-0.5 rounded-full text-[10px]', s.attendance_status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                        {{ s.attendance_status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ---- LEAVE OFFICE sub-panel ---- -->
              <ActionPanel v-if="mode === 'leave_office'" title="Leave Office" @back="mode = 'view'">
                <p class="text-xs text-gray-500 mb-3">Your current GPS location will be recorded when you confirm.</p>
                <GpsCapture v-model:lat="action.lat" v-model:lng="action.lng" />
                <div v-if="actionError" class="text-sm text-red-600 mt-2">{{ actionError }}</div>
                <div class="flex gap-2 mt-4">
                  <button @click="mode = 'view'" class="flex-1 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50">Back</button>
                  <button @click="doLeaveOffice" :disabled="actionLoading" class="flex-1 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 disabled:opacity-60">
                    {{ actionLoading ? 'Confirming...' : 'Confirm' }}
                  </button>
                </div>
              </ActionPanel>

              <!-- ---- START sub-panel ---- -->
              <ActionPanel v-if="mode === 'start'" title="Start Appointment" @back="mode = 'view'">
                <ProofUpload label="Start proof photo *" v-model:media-id="action.proofMediaId" :service="trainerService" />
                <GpsCapture v-model:lat="action.lat" v-model:lng="action.lng" class="mt-3" />
                <div v-if="actionError" class="text-sm text-red-600 mt-2">{{ actionError }}</div>
                <div class="flex gap-2 mt-4">
                  <button @click="mode = 'view'" class="flex-1 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50">Back</button>
                  <button @click="doStart" :disabled="actionLoading || !action.proofMediaId" class="flex-1 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark disabled:opacity-60">
                    {{ actionLoading ? 'Starting...' : 'Start' }}
                  </button>
                </div>
              </ActionPanel>

              <!-- ---- COMPLETE sub-panel ---- -->
              <ActionPanel v-if="mode === 'complete'" title="Complete Appointment" @back="mode = 'view'">
                <ProofUpload label="End proof photo *" v-model:media-id="action.proofMediaId" :service="trainerService" />
                <GpsCapture v-model:lat="action.lat" v-model:lng="action.lng" class="mt-3" />
                <div class="mt-3">
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">Number of students *</label>
                  <input v-model.number="action.studentCount" type="number" min="0"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div class="mt-3">
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                  <textarea v-model="action.notes" rows="2"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
                </div>
                <div v-if="actionError" class="text-sm text-red-600 mt-2">{{ actionError }}</div>
                <div class="flex gap-2 mt-4">
                  <button @click="mode = 'view'" class="flex-1 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50">Back</button>
                  <button @click="doComplete" :disabled="actionLoading || !action.proofMediaId" class="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-60">
                    {{ actionLoading ? 'Completing...' : 'Complete' }}
                  </button>
                </div>
              </ActionPanel>

              <!-- ---- ADD/MARK STUDENTS sub-panel ---- -->
              <ActionPanel v-if="mode === 'students'" title="Students" @back="mode = 'view'">
                <!-- Existing students with attendance -->
                <div v-if="appt.students?.length" class="space-y-2 mb-3">
                  <div v-for="s in appt.students" :key="s.id" class="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 text-xs">
                    <div>
                      <p class="font-medium text-gray-900">{{ s.name }}</p>
                      <p class="text-gray-400">{{ s.profession }} · {{ s.phone_number }}</p>
                    </div>
                    <div v-if="!s.attendance_status" class="flex gap-1">
                      <button @click="doMarkAttendance(s.id, 'present')" class="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Present</button>
                      <button @click="doMarkAttendance(s.id, 'absent')"  class="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Absent</button>
                    </div>
                    <span v-else :class="['font-medium px-2 py-0.5 rounded-full text-[10px]', s.attendance_status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                      {{ s.attendance_status }}
                    </span>
                  </div>
                </div>

                <!-- Add new students -->
                <p class="text-xs font-semibold text-gray-700 mb-2">Add Students</p>
                <div v-for="(s, idx) in newStudents" :key="idx" class="grid grid-cols-2 gap-2 mb-2 p-2.5 bg-gray-50 rounded-lg">
                  <input v-model="s.name" placeholder="Full name *" class="col-span-2 px-2.5 py-2 border border-gray-300 rounded-lg text-xs" />
                  <input v-model="s.phone_number" placeholder="Phone *" class="px-2.5 py-2 border border-gray-300 rounded-lg text-xs" />
                  <input v-model="s.profession" placeholder="Profession" class="px-2.5 py-2 border border-gray-300 rounded-lg text-xs" />
                  <button v-if="newStudents.length > 1" @click="newStudents.splice(idx, 1)" class="col-span-2 text-xs text-red-500 hover:underline text-left">Remove</button>
                </div>
                <button @click="newStudents.push({ name:'', phone_number:'', profession:'' })" class="text-xs text-primary hover:underline mb-3">+ Add another</button>

                <div v-if="actionError" class="text-sm text-red-600">{{ actionError }}</div>
                <div class="flex gap-2 mt-2">
                  <button @click="mode = 'view'" class="flex-1 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50">Back</button>
                  <button @click="doAddStudents" :disabled="actionLoading" class="flex-1 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl disabled:opacity-60">
                    {{ actionLoading ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </ActionPanel>

            </template>

            <!--  SALE TRACKING + ACTIONS  -->
            <template v-else>
              <div class="px-5 pb-5 space-y-4">
                <!-- Status timeline -->
                <div class="border-t border-gray-100 pt-3">
                  <p class="text-xs font-semibold text-gray-700 mb-3">Status Timeline</p>
                  <div class="space-y-2">
                    <TimelineStep
                      v-for="step in statusTimeline"
                      :key="step.status"
                      :label="step.label"
                      :timestamp="step.timestamp"
                      :done="step.done"
                      :active="step.active"
                    />
                  </div>
                </div>

                <!-- Linked onboarding -->
                <div v-if="appt.onboarding" class="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs font-semibold text-emerald-900">Onboarding Created</p>
                      <p class="text-[10px] text-emerald-700 mt-0.5">{{ appt.onboarding.request_code }}</p>
                    </div>
                    <router-link
                      :to="`/sales/onboarding/${appt.onboarding.id}`"
                      @click="close"
                      class="text-xs text-emerald-700 font-medium hover:underline"
                    >
                      View →
                    </router-link>
                  </div>
                </div>

                <!-- Sale action buttons -->
                <div v-if="mode === 'view' && (canEdit || canReschedule || canCancel)" class="grid grid-cols-3 gap-2 pt-1">
                  <button v-if="canEdit" @click="initEdit()" class="py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Edit</button>
                  <button v-if="canReschedule" @click="mode = 'reschedule'" class="py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Reschedule</button>
                  <button v-if="canCancel" @click="mode = 'cancel'" class="py-2 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Cancel</button>
                </div>
              </div>
            </template>

            <!--  SHARED ACTION PANELS (sale + trainer)  -->

            <!-- ---- CANCEL sub-panel ---- -->
            <ActionPanel v-if="mode === 'cancel'" title="Cancel Appointment" @back="mode = 'view'">
              <p class="text-xs text-gray-500 mb-3">This action cannot be undone.</p>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Reason (optional)</label>
              <input v-model="action.reason" type="text" placeholder="e.g. Client rescheduled"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
              <div v-if="actionError" class="text-sm text-red-600 mt-2">{{ actionError }}</div>
              <div class="flex gap-2 mt-4">
                <button @click="mode = 'view'" class="flex-1 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50">Back</button>
                <button @click="doCancel" :disabled="actionLoading" class="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-60">
                  {{ actionLoading ? 'Cancelling...' : 'Confirm Cancel' }}
                </button>
              </div>
            </ActionPanel>

            <!-- ---- RESCHEDULE sub-panel ---- -->
            <ActionPanel v-if="mode === 'reschedule'" title="Reschedule" @back="mode = 'view'">
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">New Date *</label>
                  <input v-model="action.date" type="date" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1.5">Start *</label>
                    <input v-model="action.startTime" type="time" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1.5">End *</label>
                    <input v-model="action.endTime" type="time" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">Reason</label>
                  <input v-model="action.reason" type="text" placeholder="Optional"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div v-if="actionError" class="text-sm text-red-600 mt-2">{{ actionError }}</div>
              <div class="flex gap-2 mt-4">
                <button @click="mode = 'view'" class="flex-1 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50">Back</button>
                <button @click="doReschedule" :disabled="actionLoading" class="flex-1 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl disabled:opacity-60">
                  {{ actionLoading ? 'Saving...' : 'Confirm' }}
                </button>
              </div>
            </ActionPanel>

            <!-- ---- EDIT sub-panel ---- -->
            <ActionPanel v-if="mode === 'edit'" title="Edit Appointment" @back="mode = 'view'">
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">Title *</label>
                  <input v-model="editForm.title" type="text" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">Location Type</label>
                  <select v-model="editForm.location_type" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="physical">Physical</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1.5">Start time</label>
                    <input v-model="editForm.scheduled_start_time" type="time" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1.5">End time</label>
                    <input v-model="editForm.scheduled_end_time" type="time" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div v-if="editForm.location_type !== 'physical'">
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">Meeting Link</label>
                  <input v-model="editForm.meeting_link" type="url" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div v-if="editForm.location_type !== 'online'">
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">Physical Location</label>
                  <input v-model="editForm.physical_location" type="text" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea v-model="editForm.notes" rows="2" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
                </div>
              </div>
              <div v-if="actionError" class="text-sm text-red-600 mt-2">{{ actionError }}</div>
              <div class="flex gap-2 mt-4">
                <button @click="mode = 'view'" class="flex-1 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50">Back</button>
                <button @click="doEdit" :disabled="actionLoading" class="flex-1 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl disabled:opacity-60">
                  {{ actionLoading ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </ActionPanel>

          </template>

          <!-- Error fallback -->
          <div v-else-if="!fetching" class="p-8 text-center text-sm text-gray-400">
            Could not load appointment.
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  LinkIcon,
  BuildingOfficeIcon,
  UserIcon,
  ClipboardDocumentIcon,
  ComputerDesktopIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useEventStore } from '@/modules/shared/store/events.js'
import { trainerService } from '@/modules/trainer/services/trainerService.js'
import { saleService } from '@/modules/sale/services/saleService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'

// Inline sub-components (render functions — no runtime template compilation)

const DetailRow = (props, { slots }) =>
  h('div', { class: 'flex items-start gap-3 text-sm' }, [
    h(props.icon, { class: 'w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5' }),
    h('span', { class: 'text-gray-700 leading-snug' }, slots.default?.())
  ])
DetailRow.props = ['icon']

const ActionPanel = (props, { slots }) =>
  h('div', { class: 'px-5 pb-5 border-t border-gray-100 pt-4' }, [
    h('p', { class: 'text-sm font-semibold text-gray-900 mb-3' }, props.title),
    ...(slots.default?.() || [])
  ])
ActionPanel.props = ['title']
ActionPanel.emits = ['back']

const TimelineStep = (props) =>
  h('div', { class: 'flex items-center gap-3' }, [
    h('div', {
      class: ['w-3 h-3 rounded-full flex-shrink-0',
        props.done ? 'bg-primary' : props.active ? 'bg-primary/40 ring-2 ring-primary/20' : 'bg-gray-200']
    }),
    h('div', { class: 'flex-1 flex items-center justify-between' }, [
      h('span', {
        class: ['text-xs', (props.done || props.active) ? 'font-medium text-gray-900' : 'text-gray-400']
      }, props.label),
      props.timestamp ? h('span', { class: 'text-[10px] text-gray-400' }, props.timestamp) : null
    ])
  ])
TimelineStep.props = ['label', 'timestamp', 'done', 'active']

// GPS capture
const GpsCapture = {
  props: { lat: Number, lng: Number },
  emits: ['update:lat', 'update:lng'],
  setup(props, { emit }) {
    const getting = ref(false)
    const err = ref(null)
    function onSuccess(p) {
      emit('update:lat', p.coords.latitude)
      emit('update:lng', p.coords.longitude)
      getting.value = false
      err.value = null
    }
    function onFinalError() {
      getting.value = false
      err.value = 'Auto-detect failed. Please enter coordinates manually.'
    }
    function get() {
      if (!navigator.geolocation) { err.value = 'Geolocation not supported'; return }
      getting.value = true; err.value = null
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        () => {
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            onFinalError,
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          )
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      )
    }
    return () => h('div', [
      h('div', { class: 'flex items-center justify-between mb-1.5' }, [
        h('span', { class: 'text-xs font-medium text-gray-700' }, 'GPS Location *'),
        h('button', {
          type: 'button', onClick: get, disabled: getting.value,
          class: 'text-xs text-primary hover:underline disabled:opacity-40'
        }, getting.value ? 'Getting...' : 'Auto-detect')
      ]),
      h('div', { class: 'grid grid-cols-2 gap-2' }, [
        h('input', { value: props.lat, onInput: (e) => emit('update:lat', +e.target.value), type: 'number', step: 'any', placeholder: 'Latitude', class: 'px-2.5 py-2 border border-gray-300 rounded-lg text-xs' }),
        h('input', { value: props.lng, onInput: (e) => emit('update:lng', +e.target.value), type: 'number', step: 'any', placeholder: 'Longitude', class: 'px-2.5 py-2 border border-gray-300 rounded-lg text-xs' })
      ]),
      err.value
        ? h('p', { class: 'text-xs text-amber-600 mt-1' }, err.value)
        : (props.lat && props.lng ? h('p', { class: 'text-xs text-emerald-600 mt-1' }, '📍 Location captured') : null)
    ])
  }
}

// Proof photo upload
const ProofUpload = {
  props: { label: String, mediaId: String, service: Object },
  emits: ['update:mediaId'],
  setup(props, { emit }) {
    const uploading = ref(false)
    const err = ref(null)
    const done = ref(false)
    async function onChange(e) {
      const file = e.target.files[0]
      if (!file) return
      uploading.value = true; err.value = null; done.value = false
      try {
        const result = await props.service.uploadProofPhoto(file)
        emit('update:mediaId', result.id)
        done.value = true
      } catch (ex) {
        err.value = ex.message || 'Upload failed'
      } finally {
        uploading.value = false
      }
    }
    return () => h('div', [
      h('label', { class: 'block text-xs font-medium text-gray-700 mb-1.5' }, props.label),
      h('input', {
        type: 'file', accept: 'image/*', onChange,
        class: 'block w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark'
      }),
      uploading.value
        ? h('p', { class: 'text-xs text-gray-400 mt-1' }, 'Uploading...')
        : done.value
          ? h('p', { class: 'text-xs text-emerald-600 mt-1' }, '✓ Photo uploaded')
          : err.value
            ? h('p', { class: 'text-xs text-red-500 mt-1' }, err.value)
            : null
    ])
  }
}

// Main component
const router = useRouter()
const authStore = useAuthStore()
const eventStore = useEventStore()
const toast = useToast()
const { formatDateMed: formatDate, formatTime, formatDateTimeFromISO } = useDateTime()

const appt = ref(null)
const fetching = ref(false)
const mode = ref('view') // 'view' | 'leave_office' | 'start' | 'complete' | 'students' | 'cancel' | 'reschedule' | 'edit'
const actionLoading = ref(false)
const actionError = ref(null)

const action = reactive({
  lat: null, lng: null,
  proofMediaId: null,
  studentCount: 0,
  notes: '',
  reason: '',
  date: '', startTime: '', endTime: ''
})

const editForm = reactive({
  title: '', location_type: '', scheduled_start_time: '', scheduled_end_time: '',
  meeting_link: '', physical_location: '', notes: ''
})

const newStudents = ref([{ name: '', phone_number: '', profession: '' }])

// Status bar colour
const STATUS_COLORS = {
  pending: '#3B82F6', leave_office: '#F59E0B', in_progress: '#10B981',
  done: '#8B5CF6', cancelled: '#EF4444', rescheduled: '#6B7280'
}
const statusBarColor = computed(() => STATUS_COLORS[appt.value?.status] || '#E5E7EB')

// Computed permission guards
const canLeaveOffice = computed(() =>
  appt.value?.status === 'pending' && ['physical', 'hybrid'].includes(appt.value?.location_type)
)
const canStart = computed(() =>
  appt.value?.status === 'leave_office' ||
  (appt.value?.status === 'pending' && appt.value?.location_type === 'online')
)
const canComplete   = computed(() => appt.value?.status === 'in_progress')
const canEdit       = computed(() => appt.value?.status === 'pending')
const canReschedule = computed(() => appt.value?.status === 'pending')
const canCancel     = computed(() => {
  if (!['pending', 'leave_office', 'in_progress'].includes(appt.value?.status)) return false
  if (authStore.isTrainer && appt.value?.creator_id !== authStore.userId) return false
  return true
})

// Status timeline for sale
const TIMELINE = [
  { status: 'pending',      label: 'Appointment Scheduled' },
  { status: 'leave_office', label: 'Trainer Left Office' },
  { status: 'in_progress',  label: 'Session In Progress' },
  { status: 'done',         label: 'Appointment Done' }
]
const STATUS_ORDER = ['pending', 'leave_office', 'in_progress', 'done']

const statusTimeline = computed(() => {
  if (!appt.value) return []
  const current = appt.value.status
  const currentIdx = STATUS_ORDER.indexOf(current)

  // For online appointments, skip leave_office
  const steps = appt.value.location_type === 'online'
    ? TIMELINE.filter(s => s.status !== 'leave_office')
    : TIMELINE

  return steps.map((step) => {
    const idx = STATUS_ORDER.indexOf(step.status)
    const done   = currentIdx > idx
    const active = currentIdx === idx && current !== 'cancelled' && current !== 'rescheduled'
    let timestamp = null
    if (step.status === 'leave_office' && appt.value.leave_office_at) timestamp = formatDateTimeFromISO(appt.value.leave_office_at)
    if (step.status === 'in_progress'  && appt.value.actual_start_time) timestamp = formatDateTimeFromISO(appt.value.actual_start_time)
    if (step.status === 'done'         && appt.value.actual_end_time)   timestamp = formatDateTimeFromISO(appt.value.actual_end_time)
    return { ...step, done, active, timestamp }
  })
})

// Fetch appointment when modal opens
watch(() => eventStore.isDetailsModalOpen, async (open) => {
  if (!open) { appt.value = null; return }
  const event = eventStore.selectedEvent
  const id = event?.appointmentId
  if (!id) { appt.value = null; return }
  mode.value = 'view'
  actionError.value = null

  // Pre-populate immediately from calendar event data so modal shows without delay
  if (event.title || event.status) {
    const startStr = typeof event.start === 'string' ? event.start : event.start?.toISOString?.() || ''
    const endStr   = typeof event.end   === 'string' ? event.end   : event.end?.toISOString?.()   || ''
    appt.value = {
      id,
      title:                  event.title         || '',
      appointment_type:       event.type          || '',
      status:                 event.status        || '',
      scheduled_date:         startStr.split('T')[0] || null,
      scheduled_start_time:   startStr.split('T')[1]?.slice(0, 5) || null,
      scheduled_end_time:     endStr.split('T')[1]?.slice(0, 5)   || null,
      location_type:          event.format        || null,
      physical_location:      event.location      || null,
      meeting_link:           event.meetingLink   || null,
      notes:                  event.notes         || null,
      client:   event.clientName  ? { company_name: event.clientName }  : null,
      system:   event.systemName  ? { name: event.systemName }          : null,
      trainer:  event.trainerName ? { first_name: event.trainerName, last_name: '' } : null,
      students: [],
      onboarding: null
    }
  }

  // Fetch full data in background (adds students, onboarding link, actual timestamps)
  fetching.value = !appt.value
  try {
    const service = authStore.isTrainer ? trainerService : saleService
    const res = await service.getAppointment(id)
    if (res.data) appt.value = res.data
  } catch {
    if (!appt.value) appt.value = null
  } finally {
    fetching.value = false
  }
})

// Reset action state when switching modes
watch(mode, () => {
  actionError.value = null
  action.lat = null; action.lng = null
  action.proofMediaId = null; action.studentCount = 0
  action.notes = ''; action.reason = ''
  action.date = ''; action.startTime = ''; action.endTime = ''
  newStudents.value = [{ name: '', phone_number: '', profession: '' }]
})

function initEdit() {
  Object.assign(editForm, {
    title: appt.value.title,
    location_type: appt.value.location_type,
    scheduled_start_time: appt.value.scheduled_start_time,
    scheduled_end_time: appt.value.scheduled_end_time,
    meeting_link: appt.value.meeting_link || '',
    physical_location: appt.value.physical_location || '',
    notes: appt.value.notes || ''
  })
  mode.value = 'edit'
}

// Actions
async function doLeaveOffice() {
  actionLoading.value = true; actionError.value = null
  try {
    await trainerService.leaveOffice(appt.value.id, action.lat || 0, action.lng || 0)
    toast.success('Marked as left office.')
    await reloadAndRefresh()
  } catch (e) {
    actionError.value = e.response?.data?.message || 'Failed.'
  } finally { actionLoading.value = false }
}

async function doStart() {
  actionLoading.value = true; actionError.value = null
  try {
    await trainerService.startAppointment(appt.value.id, {
      start_proof_media_id: action.proofMediaId,
      start_latitude: action.lat || 0,
      start_longitude: action.lng || 0
    })
    toast.success('Appointment started!')
    await reloadAndRefresh()
  } catch (e) {
    actionError.value = e.response?.data?.message || 'Failed.'
  } finally { actionLoading.value = false }
}

async function doComplete() {
  actionLoading.value = true; actionError.value = null
  try {
    await trainerService.completeAppointment(appt.value.id, {
      end_proof_media_id: action.proofMediaId,
      end_latitude: action.lat || 0,
      end_longitude: action.lng || 0,
      student_count: action.studentCount,
      completion_notes: action.notes || null
    })
    toast.success('Appointment completed!')
    await reloadAndRefresh()
  } catch (e) {
    actionError.value = e.response?.data?.message || 'Failed.'
  } finally { actionLoading.value = false }
}

async function doCancel() {
  actionLoading.value = true; actionError.value = null
  try {
    const service = authStore.isTrainer ? trainerService : saleService
    await service.cancelAppointment(appt.value.id, action.reason)
    toast.success('Appointment cancelled.')
    await reloadAndRefresh()
  } catch (e) {
    actionError.value = e.response?.data?.message || 'Failed.'
  } finally { actionLoading.value = false }
}

async function doReschedule() {
  if (!action.date || !action.startTime || !action.endTime) {
    actionError.value = 'Date and times are required.'
    return
  }
  actionLoading.value = true; actionError.value = null
  try {
    const service = authStore.isTrainer ? trainerService : saleService
    const res = await service.rescheduleAppointment(appt.value.id, {
      scheduled_date: action.date,
      scheduled_start_time: action.startTime,
      scheduled_end_time: action.endTime,
      reschedule_reason: action.reason || null
    })
    toast.success('Appointment rescheduled.')
    eventStore.closeModals()
    await eventStore.refresh()
    const newId = res.data?.new_appointment_id
    if (newId) {
      router.push(authStore.isTrainer
        ? `/trainer/appointments/${newId}`
        : `/sales/appointments/${newId}`)
    }
  } catch (e) {
    actionError.value = e.response?.data?.message || 'Failed.'
  } finally { actionLoading.value = false }
}

async function doEdit() {
  actionLoading.value = true; actionError.value = null
  try {
    await saleService.updateAppointment(appt.value.id, editForm)
    toast.success('Appointment updated.')
    await reloadAndRefresh()
  } catch (e) {
    actionError.value = e.response?.data?.message || 'Failed.'
  } finally { actionLoading.value = false }
}

async function doMarkAttendance(studentId, status) {
  try {
    await trainerService.markAttendance(appt.value.id, studentId, status)
    await reloadAppt()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed.')
  }
}

async function doAddStudents() {
  const valid = newStudents.value.filter(s => s.name && s.phone_number)
  if (!valid.length) { actionError.value = 'At least one student with name and phone required.'; return }
  actionLoading.value = true; actionError.value = null
  try {
    await trainerService.addStudents(appt.value.id, valid)
    toast.success('Students added.')
    newStudents.value = [{ name: '', phone_number: '', profession: '' }]
    await reloadAppt()
  } catch (e) {
    actionError.value = e.response?.data?.message || 'Failed.'
  } finally { actionLoading.value = false }
}

// Helpers
async function reloadAppt() {
  const service = authStore.isTrainer ? trainerService : saleService
  const res = await service.getAppointment(appt.value.id)
  appt.value = res.data
}

async function reloadAndRefresh() {
  await reloadAppt()
  mode.value = 'view'
  await eventStore.refresh()
}

function close() {
  eventStore.closeModals()
}
</script>
