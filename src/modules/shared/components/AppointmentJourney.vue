<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5">
    <div class="w-full">
      <div class="flex items-start w-full">
        <template v-for="(step, idx) in steps" :key="step.key">

          <!-- Step node — flex-1 so all steps share width equally -->
          <div
            class="flex flex-col items-center flex-1 min-w-0"
            :data-step-key="step.key"
            @mouseenter="hasDetails(step) && showPopover(step, $event)"
            @mouseleave="scheduleHide"
          >
            <!-- Circle — pointer cursor when details exist -->
            <div class="relative">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-shadow',
                hasDetails(step) ? 'cursor-pointer' : '',
                step.state === 'done'   ? 'border-green-500' :
                step.state === 'active' ? 'border-primary'   :
                step.state === 'error'  ? 'border-red-400'   :
                                          'border-gray-200'
              ]">
                <CheckIcon  v-if="step.state === 'done'"   class="w-3.5 h-3.5 text-green-500" />
                <span       v-else-if="step.state === 'active'" class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <XMarkIcon  v-else-if="step.state === 'error'"  class="w-3.5 h-3.5 text-red-400" />
                <span       v-else class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              </div>
              <!-- Detail indicator dot -->
              <span v-if="hasDetails(step)" class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary/70 ring-1 ring-white"></span>
            </div>

            <!-- Label -->
            <p :class="[
              'text-xs font-semibold text-center mt-2 leading-tight px-1',
              step.state === 'done'   ? 'text-gray-900' :
              step.state === 'active' ? 'text-primary'  :
              step.state === 'error'  ? 'text-red-600'  :
                                        'text-gray-400'
            ]">{{ step.label }}</p>

            <!-- Timestamp -->
            <p v-if="step.timestamp" class="text-[10px] text-gray-400 text-center mt-0.5 px-1 leading-tight">
              {{ step.timestamp }}
            </p>
            <!-- Scheduled window (Scheduled step only) -->
            <p v-if="step.window" class="text-[10px] text-gray-400 text-center px-1 leading-tight">
              {{ step.window }}
            </p>
          </div>

          <!-- Horizontal connector — flex-1 stretches to fill space between steps -->
          <div v-if="idx < steps.length - 1" :class="[
            'h-px mt-4 shrink-0',
            step.state === 'done' ? 'bg-green-300' : 'bg-gray-200'
          ]" style="min-width: 16px; width: 48px; flex: 1 1 0%;"></div>

        </template>
      </div>
    </div>

    <!-- Popover (Teleported to body, fixed position) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="activeStep"
          data-journey-popover
          :style="popoverStyle"
          class="fixed z-[60] w-52 bg-white rounded-xl border border-gray-200 shadow-xl p-3 space-y-2.5"
          @mouseenter="cancelHide"
          @mouseleave="scheduleHide"
        >
          <!-- Arrow -->
          <div :style="arrowStyle" class="absolute -top-1.5 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"></div>

          <!-- Step label inside popover -->
          <p class="text-xs font-semibold text-gray-900 leading-tight">{{ activeStep.label }}</p>

          <!-- Location -->
          <a v-if="activeStep.locationUrl" :href="activeStep.locationUrl" target="_blank"
            class="flex items-center gap-1.5 text-xs text-primary hover:underline">
            <MapPinIcon class="w-3.5 h-3.5 shrink-0" />
            View location
          </a>

          <!-- Student count -->
          <div v-if="activeStep.studentCount != null" class="flex items-center gap-1.5 text-xs text-gray-600">
            <UserGroupIcon class="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span><span class="font-medium text-gray-800">{{ activeStep.studentCount }}</span> {{ activeStep.studentCount !== 1 ? 'students' : 'student' }} attended</span>
          </div>

          <!-- Note / reason -->
          <p v-if="activeStep.note" class="text-xs text-gray-500 italic leading-relaxed">{{ activeStep.note }}</p>

          <!-- Rescheduled to -->
          <div v-if="activeStep.rescheduledTo" class="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
            <span class="font-medium">→ </span>{{ activeStep.rescheduledTo }}
          </div>

          <!-- Proof photo -->
          <div v-if="activeStep.proofs?.length" class="space-y-1">
            <p class="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Proof</p>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="proof in activeStep.proofs"
                :key="proof.id"
                class="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-primary/50 transition-colors"
                @click="openLightbox(proof)"
              >
                <img :src="proof.url" :alt="proof.label" class="w-full h-full object-cover" />
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                  <ArrowsPointingOutIcon class="w-4 h-4 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="lightboxProof"
          class="fixed inset-0 bg-black/80 z-[70] flex flex-col items-center justify-center p-4"
          @click.self="lightboxProof = null">
          <div class="bg-white rounded-xl overflow-hidden shadow-2xl max-w-lg w-full">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span class="text-sm font-semibold text-gray-900">{{ lightboxProof.label }}</span>
              <button @click="lightboxProof = null" class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <XMarkIcon class="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div class="bg-gray-50 flex items-center justify-center min-h-[200px] max-h-[70vh]">
              <img :src="lightboxProof.url" :alt="lightboxProof.label"
                class="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CheckIcon, XMarkIcon, MapPinIcon, UserGroupIcon, ArrowsPointingOutIcon } from '@heroicons/vue/24/outline'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'

const props = defineProps({
  appointment: { type: Object, required: true }
})

const { formatDateMed, formatTime, formatDateTimeFromISO } = useDateTime()

//  Lightbox
const lightboxProof = ref(null)
function openLightbox(proof) {
  lightboxProof.value = proof
  activeStep.value = null
}

//  Popover 
const activeStep = ref(null)
const popoverX   = ref(0)
const popoverY   = ref(0)
let hideTimer    = null

const POPOVER_WIDTH = 208 // w-52

const popoverStyle = computed(() => {
  const x = Math.min(
    Math.max(popoverX.value - POPOVER_WIDTH / 2, 8),
    window.innerWidth - POPOVER_WIDTH - 8
  )
  return { left: `${x}px`, top: `${popoverY.value}px` }
})

// Arrow offset relative to popover left edge
const arrowStyle = computed(() => {
  const x = Math.min(
    Math.max(popoverX.value - POPOVER_WIDTH / 2, 8),
    window.innerWidth - POPOVER_WIDTH - 8
  )
  const arrowLeft = popoverX.value - x - 6
  return { left: `${arrowLeft}px` }
})

function showPopover(step, event) {
  cancelHide()
  const rect = event.currentTarget.getBoundingClientRect()
  popoverX.value = rect.left + rect.width / 2
  popoverY.value = rect.bottom + 10
  activeStep.value = step
}

function scheduleHide() {
  hideTimer = setTimeout(() => { activeStep.value = null }, 120)
}

function cancelHide() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
}

function hasDetails(step) {
  return !!(step.locationUrl || step.proofs?.length || step.studentCount != null || step.note || step.rescheduledTo)
}

//  Helpers 
function mapsUrl(lat, lng) {
  if (!lat || !lng) return null
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

const isPhysical = computed(() =>
  ['physical', 'hybrid'].includes(props.appointment?.location_type)
)

//  Steps 
const steps = computed(() => {
  const a = props.appointment
  if (!a) return []

  const isCancelled   = a.status === 'cancelled'
  const isRescheduled = a.status === 'rescheduled'
  const isDone        = a.status === 'done'
  const isInProgress  = a.status === 'in_progress'
  const isLeaveOffice = a.status === 'leave_office'

  const ORDER = isPhysical.value
    ? ['pending', 'leave_office', 'in_progress', 'done']
    : ['pending', 'in_progress', 'done']

  const currentIdx = (isCancelled || isRescheduled) ? ORDER.length : ORDER.indexOf(a.status)

  function stepState(key) {
    if (isCancelled && key === 'cancelled') return 'error'
    if (isRescheduled && key === 'rescheduled') return 'error'
    const idx = ORDER.indexOf(key)
    if (idx === -1) return 'pending'
    if (idx < currentIdx) return 'done'
    if (idx === currentIdx) return isDone ? 'done' : 'active'
    return 'pending'
  }

  const list = []

  // Scheduled
  list.push({
    key: 'pending',
    label: 'Scheduled',
    state: currentIdx > 0 ? 'done' : 'active',
    timestamp: formatDateMed(a.scheduled_date),
    window: `${formatTime(a.scheduled_start_time)} – ${formatTime(a.scheduled_end_time)}`,
    proofs: [],
  })

  // Left Office (physical only)
  if (isPhysical.value) {
    list.push({
      key: 'leave_office',
      label: 'Left Office',
      state: a.leave_office_at ? 'done' : (isLeaveOffice ? 'active' : 'pending'),
      timestamp: a.leave_office_at ? formatDateTimeFromISO(a.leave_office_at) : null,
      locationUrl: mapsUrl(a.leave_office_lat, a.leave_office_lng),
      proofs: [],
    })
  }

  // Session Started
  const startProofs = a.start_proof?.file_url
    ? [{ id: a.start_proof.id, url: a.start_proof.file_url, label: 'Arrival Proof' }]
    : []
  list.push({
    key: 'in_progress',
    label: 'Session Started',
    state: a.actual_start_time ? (isInProgress ? 'active' : 'done') : (isInProgress ? 'active' : 'pending'),
    timestamp: a.actual_start_time ? formatDateTimeFromISO(a.actual_start_time) : null,
    locationUrl: mapsUrl(a.start_lat, a.start_lng),
    proofs: startProofs,
  })

  // Terminal: Completed / Cancelled / Rescheduled
  if (isCancelled) {
    list.push({
      key: 'cancelled',
      label: 'Cancelled',
      state: 'error',
      timestamp: a.cancelled_at ? formatDateTimeFromISO(a.cancelled_at) : null,
      note: a.cancellation_reason || null,
      proofs: [],
    })
  } else if (isRescheduled) {
    let rescheduledTo = null
    if (a.reschedule_to_date) {
      const d = formatDateMed(a.reschedule_to_date)
      const t = a.reschedule_to_start_time && a.reschedule_to_end_time
        ? `${formatTime(a.reschedule_to_start_time)} – ${formatTime(a.reschedule_to_end_time)}`
        : ''
      rescheduledTo = t ? `${d}, ${t}` : d
    }
    list.push({
      key: 'rescheduled',
      label: 'Rescheduled',
      state: 'error',
      timestamp: a.reschedule_at ? formatDateTimeFromISO(a.reschedule_at) : null,
      note: a.reschedule_reason || null,
      rescheduledTo,
      proofs: [],
    })
  } else {
    const endProofs = a.end_proof?.file_url
      ? [{ id: a.end_proof.id, url: a.end_proof.file_url, label: 'Completion Proof' }]
      : []
    list.push({
      key: 'done',
      label: 'Session Completed',
      state: a.actual_end_time ? 'done' : 'pending',
      timestamp: a.actual_end_time ? formatDateTimeFromISO(a.actual_end_time) : null,
      locationUrl: mapsUrl(a.end_lat, a.end_lng),
      studentCount: a.actual_end_time != null ? (a.student_count ?? 0) : null,
      note: a.completion_notes || null,
      proofs: endProofs,
    })
  }

  return list
})
</script>
