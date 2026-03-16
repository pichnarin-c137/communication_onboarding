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
      <!-- Proof Photo -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 class="text-sm font-semibold text-gray-900">Proof Photo *</h2>
        <div>
          <input
            type="file"
            accept="image/*"
            @change="onFileChange"
            class="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark"
          />
          <p v-if="uploadError" class="text-xs text-red-500 mt-1">{{ uploadError }}</p>
          <p v-if="uploading" class="text-xs text-gray-400 mt-1">Uploading photo...</p>
          <p v-if="proofMediaId" class="text-xs text-emerald-600 mt-1">Photo uploaded successfully.</p>
        </div>
      </div>

      <!-- GPS Location -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-gray-900">GPS Location *</h2>
          <button type="button" @click="getLocation" :disabled="gettingLocation" class="text-xs text-primary hover:underline disabled:opacity-40">
            {{ gettingLocation ? 'Getting location...' : 'Use current location' }}
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
            <input v-model.number="form.latitude" type="number" step="any" required placeholder="0.000000" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
            <input v-model.number="form.longitude" type="number" step="any" required placeholder="0.000000" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
        <p v-if="locationError" class="text-xs text-red-500">{{ locationError }}</p>
      </div>

      <!-- Complete-specific fields -->
      <template v-if="!isStartStep">
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-900">Session Summary</h2>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Number of Students *</label>
            <input v-model.number="form.student_count" type="number" min="0" required class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Completion Notes</label>
            <textarea v-model="form.completion_notes" rows="3" placeholder="Summary of what was covered..." class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
          </div>
        </div>
      </template>

      <!-- Error -->
      <div v-if="submitError" class="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        {{ submitError }}
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="submitting || uploading || !proofMediaId"
        class="w-full py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        <span v-if="submitting">{{ isStartStep ? 'Starting...' : 'Completing...' }}</span>
        <span v-else-if="!proofMediaId">Upload a proof photo first</span>
        <span v-else>{{ isStartStep ? 'Start Appointment' : 'Complete Appointment' }}</span>
      </button>
    </form>

    <div v-else-if="!loading" class="text-center py-12">
      <p class="text-sm text-gray-500">Appointment not found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { trainerService } from '@/modules/trainer/services/trainerService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { getCurrentLocation } from '@/modules/shared/composables/useGeolocation.js'
import { extractErrorMessage } from '@core/services/error.handler'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// step=start → start appointment; otherwise → complete
const isStartStep = computed(() => route.query.step === 'start')

const appt = ref(null)
const loading = ref(true)

const proofMediaId = ref(null)
const uploading = ref(false)
const uploadError = ref(null)

const gettingLocation = ref(false)
const locationError = ref(null)

const form = reactive({
  latitude: null,
  longitude: null,
  student_count: 0,
  completion_notes: ''
})

const submitting = ref(false)
const submitError = ref(null)

async function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  uploadError.value = null
  proofMediaId.value = null
  try {
    const result = await trainerService.uploadProofPhoto(file)
    proofMediaId.value = result.id
  } catch (err) {
    uploadError.value = err.message || 'Upload failed.'
  } finally {
    uploading.value = false
  }
}

async function getLocation() {
  gettingLocation.value = true
  locationError.value = null
  try {
    const { latitude, longitude } = await getCurrentLocation()
    form.latitude = latitude
    form.longitude = longitude
  } catch (err) {
    locationError.value = err.message
  } finally {
    gettingLocation.value = false
  }
}

async function submit() {
  submitError.value = null
  submitting.value = true
  try {
    if (isStartStep.value) {
      await trainerService.startAppointment(appt.value.id, {
        start_proof_media_id: proofMediaId.value,
        start_latitude: form.latitude,
        start_longitude: form.longitude
      })
      toast.success('Appointment started!')
    } else {
      await trainerService.completeAppointment(appt.value.id, {
        end_proof_media_id: proofMediaId.value,
        end_latitude: form.latitude,
        end_longitude: form.longitude,
        student_count: form.student_count,
        completion_notes: form.completion_notes || null
      })
      toast.success('Appointment completed!')
    }
    router.push(`/trainer/appointments/${appt.value.id}`)
  } catch (err) {
    submitError.value = extractErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const response = await trainerService.getAppointment(route.params.id)
    appt.value = response.data
  } catch {
    appt.value = null
  } finally {
    loading.value = false
  }
})
</script>
