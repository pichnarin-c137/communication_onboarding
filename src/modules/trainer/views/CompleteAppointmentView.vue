<template>
  <div class="max-w-lg mx-auto space-y-5 mt-3">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="router.back()" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ isStartStep ? 'Start Appointment' : 'Complete Appointment' }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ appt?.title }}</p>
      </div>
    </div>

    <!-- Step Indicator -->
    <div class="flex items-center gap-2">
      <div :class="['flex items-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-center justify-center', isStartStep ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500']">
        <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold" :class="isStartStep ? 'border-white' : 'border-gray-400'">1</span>
        Start
      </div>
      <div class="w-8 h-px bg-gray-300"></div>
      <div :class="['flex items-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-center justify-center', !isStartStep ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500']">
        <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold" :class="!isStartStep ? 'border-white' : 'border-gray-400'">2</span>
        Complete
      </div>
    </div>

    <SkeletonLoader v-if="loading" type="cards" :count="1" />

    <form v-else-if="appt" @submit.prevent="submit" class="space-y-5">

      <!--  Proof Photo (Camera)  -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-5 pt-5 pb-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900">Proof Photo</h2>
            <span v-if="proofMedia" class="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircleIcon class="w-3.5 h-3.5" /> Captured
            </span>
          </div>
        </div>

        <!-- Camera unavailable fallback -->
        <div v-if="cameraError" class="px-5 pb-5 space-y-3">
          <div class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <ExclamationTriangleIcon class="w-4 h-4 shrink-0 mt-0.5" />
            <span>Camera not available. Please upload a photo instead.</span>
          </div>
          <input
            type="file"
            accept="image/*"
            @change="onFileChange"
            class="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark"
          />
        </div>

        <!-- Photo preview (after capture) -->
        <template v-else-if="photoTaken && proofMedia">
          <div class="relative">
            <img :src="proofMedia" alt="Proof photo" class="w-full max-h-72 object-cover" />
            <button
              type="button"
              @click="retakePhoto"
              class="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/75 text-white text-xs font-medium rounded-lg transition-colors backdrop-blur-sm"
            >
              <ArrowPathIcon class="w-3.5 h-3.5" />
              Retake
            </button>
          </div>
        </template>

        <!-- Live camera preview -->
        <template v-else>
          <div class="relative bg-black">
            <video
              ref="videoEl"
              autoplay
              playsinline
              muted
              class="w-full max-h-72 object-cover"
              :class="cameraReady ? 'opacity-100' : 'opacity-0'"
            ></video>
            <!-- Loading overlay while camera initialises -->
            <div v-if="!cameraReady" class="absolute inset-0 flex flex-col items-center justify-center gap-2 min-h-48">
              <svg class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p class="text-white/70 text-xs">Starting camera…</p>
            </div>
            <!-- Capture button -->
            <button
              v-if="cameraReady"
              type="button"
              @click="capturePhoto"
              class="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              <CameraIcon class="w-7 h-7 text-gray-800" />
            </button>
          </div>
          <canvas ref="canvasEl" class="hidden"></canvas>
        </template>
      </div>

      <!--  GPS Location (auto)  -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">GPS Location</h2>

        <!-- Detecting -->
        <div v-if="gettingLocation" class="flex items-center gap-2 text-sm text-gray-500">
          <svg class="w-4 h-4 animate-spin text-primary shrink-0" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Detecting your location…
        </div>

        <!-- Success -->
        <div v-else-if="form.latitude && form.longitude" class="space-y-1">
          <div class="flex items-center gap-2">
            <CheckCircleIcon class="w-4 h-4 text-emerald-500 shrink-0" />
            <span class="text-sm font-medium text-gray-900">Location detected</span>
          </div>
          <p class="text-xs text-gray-400 pl-6 font-mono">{{ form.latitude.toFixed(6) }}, {{ form.longitude.toFixed(6) }}</p>
          <button type="button" @click="getLocation" class="pl-6 text-xs text-primary hover:underline">
            Refresh
          </button>
        </div>

        <!-- Error -->
        <div v-else-if="locationError" class="space-y-2">
          <div class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <ExclamationTriangleIcon class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{{ locationError }}</span>
          </div>
          <button type="button" @click="getLocation" class="text-xs text-primary hover:underline">
            Retry location
          </button>
        </div>
      </div>

      <!--  Complete-specific fields  -->
      <template v-if="!isStartStep">
        <!-- <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-900">Session Summary</h2>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Number of Students *</label>
            <input v-model.number="form.student_count" type="number" min="0" required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div> -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Completion Notes</label>
            <textarea v-model="form.completion_notes" rows="3" placeholder="Summary of what was covered…"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
          </div>
        <!-- </div> -->
      </template>

      <!-- Error -->
      <div v-if="submitError" class="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        {{ submitError }}
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="submitting || !proofMedia || !form.latitude || !form.longitude || gettingLocation"
        class="w-full py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        <span v-if="uploadingPhoto">Uploading photo…</span>
        <span v-else-if="submitting">{{ isStartStep ? 'Starting…' : 'Completing…' }}</span>
        <span v-else-if="!proofMedia">Take a photo first</span>
        <span v-else-if="gettingLocation">Getting your location…</span>
        <span v-else-if="!form.latitude || !form.longitude">Location required</span>
        <span v-else>{{ isStartStep ? 'Start Appointment' : 'Complete Appointment' }}</span>
      </button>
    </form>

    <div v-else-if="!loading" class="text-center py-12">
      <p class="text-sm text-gray-500">Appointment not found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'
import { trainerService } from '@/modules/trainer/services/trainerService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { getCurrentLocation } from '@/modules/shared/composables/useGeolocation.js'
import { extractErrorMessage } from '@core/services/error.handler'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const route = useRoute()
const router = useRouter()
const toast  = useToast()

const isStartStep = computed(() => route.query.step === 'start')

//  Appointment
const appt    = ref(null)
const loading = ref(true)

//  Camera
const videoEl    = ref(null)
const canvasEl   = ref(null)
const cameraReady = ref(false)
const cameraError = ref(false)
const photoTaken  = ref(false)
const proofMedia  = ref(null)  // base64 data URI — preview only
const proofBlob   = ref(null)  // raw Blob — used for R2 upload
const uploadingPhoto = ref(false)

let mediaStream = null

async function startCamera() {
  cameraReady.value = false
  cameraError.value = false
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = true
    return
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    })
    videoEl.value.srcObject = mediaStream
    videoEl.value.onloadedmetadata = () => { cameraReady.value = true }
  } catch {
    cameraError.value = true
  }
}

function capturePhoto() {
  const video  = videoEl.value
  const canvas = canvasEl.value
  canvas.width  = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0)
  proofMedia.value = canvas.toDataURL('image/jpeg', 0.85)
  photoTaken.value  = true
  stopCamera()
  canvas.toBlob(blob => { proofBlob.value = blob }, 'image/jpeg', 0.85)
}

function retakePhoto() {
  proofMedia.value  = null
  photoTaken.value  = false
  startCamera()
}

function stopCamera() {
  mediaStream?.getTracks().forEach(t => t.stop())
  mediaStream = null
}

// Fallback: file input when camera unavailable
function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  proofBlob.value = file
  const reader = new FileReader()
  reader.onload = () => {
    proofMedia.value = reader.result
    photoTaken.value = true
  }
  reader.readAsDataURL(file)
}

//  GPS
const gettingLocation = ref(false)
const locationError   = ref(null)

const form = reactive({
  latitude:         null,
  longitude:        null,
  student_count:    0,
  completion_notes: ''
})

async function getLocation() {
  gettingLocation.value = true
  locationError.value   = null
  try {
    const { latitude, longitude } = await getCurrentLocation()
    form.latitude  = latitude
    form.longitude = longitude
  } catch (err) {
    locationError.value = err.message || 'Could not get location. Please enable location access and try again.'
  } finally {
    gettingLocation.value = false
  }
}

//  Submit
const submitting  = ref(false)
const submitError = ref(null)

async function submit() {
  submitError.value = null
  submitting.value  = true
  uploadingPhoto.value = true

  try {
    const folder = isStartStep.value ? 'start_proof' : 'end_proof'
    const mediaId = await trainerService.uploadProofToR2(proofBlob.value, folder)
    uploadingPhoto.value = false

    if (isStartStep.value) {
      await trainerService.startAppointment(appt.value.id, {
        start_proof_media_id: mediaId,
        start_latitude:       form.latitude,
        start_longitude:      form.longitude,
      })
      toast.success('Appointment started!')
    } else {
      await trainerService.completeAppointment(appt.value.id, {
        end_proof_media_id: mediaId,
        end_latitude:       form.latitude,
        end_longitude:      form.longitude,
        student_count:      form.student_count,
        completion_notes:   form.completion_notes || null,
      })
      toast.success('Appointment completed!')
    }
    router.push(`/trainer/appointments/${appt.value.id}`)
  } catch (err) {
    submitError.value = extractErrorMessage(err)
    uploadingPhoto.value = false
  } finally {
    submitting.value = false
  }
}

//  Lifecycle
onMounted(() => {
  // Camera and GPS start immediately — they don't depend on appointment data
  startCamera()
  getLocation()

  loading.value = true
  trainerService.getAppointment(route.params.id)
    .then(response => { appt.value = response.data })
    .catch(() => { appt.value = null })
    .finally(() => { loading.value = false })
})

onBeforeUnmount(stopCamera)
</script>
