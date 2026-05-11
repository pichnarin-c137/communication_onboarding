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
          <h1 class="text-xl font-bold text-gray-900 truncate mt-1">{{ appt?.title || 'Appointment' }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ appt?.client?.company_name }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <StatusBadge v-if="appt" :status="appt.status" class="shrink-0" />

        <button v-if="appt && ['physical', 'hybrid'].includes(appt.location_type) && appt.status === 'pending'"
          @click="handleLeaveOffice" :disabled="actionLoading"
          class="px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-60">
          {{ actionLoading ? 'Processing...' : 'Leave Office' }}
        </button>
        <button
          v-if="appt && ['pending', 'leave_office'].includes(appt.status) && (appt.location_type === 'online' || appt.status === 'leave_office')"
          @click="openActionModal('start')"
          class="px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
          Start Appointment
        </button>
        <button v-if="appt && appt.status === 'in_progress'" @click="openActionModal('complete')"
          class="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
          Complete Appointment
        </button>
        <button v-if="appt && appt.status === 'pending'" @click="openRescheduleModal"
          class="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Reschedule
        </button>
        <button v-if="appt && ['pending', 'leave_office', 'in_progress'].includes(appt.status)"
          @click="showCancelModal = true"
          class="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>

    <div class="max-w-3xl mx-auto">
      <SkeletonLoader v-if="loading" type="cards" :count="2" />
    </div>

    <template v-if="!loading && appt">

      <!-- === Session Journey — full-width, always first === -->
      <div v-if="['leave_office', 'in_progress', 'done', 'cancelled', 'rescheduled'].includes(appt.status)"
        class="mb-5">
        <AppointmentJourney :appointment="appt" />
      </div>

      <div v-if="hasTravelMap" class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <!-- isolate creates a stacking context so Leaflet z-indices stay contained -->
        <div class="lg:sticky lg:top-4 bg-white rounded-xl border border-gray-200 overflow-hidden relative isolate">
          <div ref="mapContainer" class="w-full h-72 lg:h-[520px] relative">
            <!-- Fullscreen button overlay -->
            <button @click="isMapFullscreen = true"
              class="absolute top-3 left-3 p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50 transition-colors z-50 pointer-events-auto"
              title="View fullscreen" style="position: absolute; top: 12px; left: 12px; z-index: 1000;">
              <ArrowsPointingOutIcon class="w-4 h-4 text-gray-700" />
            </button>
          </div>
          <span v-if="currentEstimate?.source" :class="['absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm z-[500]',
            currentEstimate.source === 'osrm' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
            {{ currentEstimate.source === 'osrm' ? 'Route-based' : 'Straight-line' }}
          </span>
          <div class="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 text-xs">
            <div class="flex items-center gap-1.5 min-w-0">
              <span :class="['w-2 h-2 rounded-full shrink-0', trainerStatusDot]"></span>
              <span class="text-gray-600 truncate">
                Current Location
                <template v-if="trainerPosition?.status === 'at_office'"> &middot;
                  <span class="text-blue-600">At office</span>
                  <span v-if="trainerPosition.branch_name" class="text-gray-400"> ({{ trainerPosition.branch_name
                    }})</span>
                </template>
              </span>
            </div>
            <span v-if="trainerPosition?.active && trainerPosition?.updated_at" class="text-gray-400 shrink-0 ml-2">
              {{ formatTimeFromISO(trainerPosition.updated_at) }}
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-gray-900">Travel Estimate</h2>
              <span v-if="currentEstimate?.source" :class="['text-[10px] font-medium px-2 py-0.5 rounded-full',
                currentEstimate.source === 'osrm' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
                {{ currentEstimate.source === 'osrm' ? 'Route-based' : 'Straight-line' }}
              </span>
            </div>

            <!-- ETA hero -->
            <div class="text-center py-1">
              <p class="text-3xl font-bold text-primary">{{ formatEta(currentEstimate?.eta_minutes) }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDistance(currentEstimate?.distance_meters) }}</p>
            </div>

            <!-- From (trainer's current position) → To (client) -->
            <div class="space-y-2">
              <div class="flex items-start gap-3">
                <div class="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 ring-2 ring-blue-100"></div>
                <div class="min-w-0">
                  <p class="text-[10px] uppercase tracking-wide text-gray-400">My Location</p>
                  <p class="text-sm font-medium text-gray-900 truncate">
                    <template v-if="trainerPosition?.active && trainerPosition?.status === 'traveling'">
                      En Route
                      <span v-if="trainerPosition.distance_from_branch_m" class="text-xs text-gray-400 font-normal">
                        · {{ formatDistance(trainerPosition.distance_from_branch_m) }} from office
                      </span>
                    </template>
                    <template v-else-if="trainerPosition?.active">
                      {{ trainerPosition.branch_name || currentEstimate?.origin?.label || 'Current location' }}
                    </template>
                    <template v-else>
                      {{ currentEstimate?.origin?.label || 'Office' }}
                    </template>
                  </p>
                </div>
              </div>
              <div class="ml-[5px] w-px h-3 bg-gray-200"></div>
              <div class="flex items-start gap-3">
                <div class="mt-1 w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 ring-2 ring-red-100"></div>
                <div class="min-w-0">
                  <p class="text-[10px] uppercase tracking-wide text-gray-400">Client</p>
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ currentEstimate?.destination?.label || appt?.client?.company_name }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Session duration -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-100 text-sm">
              <span class="text-gray-500">Session Duration</span>
              <span class="font-medium text-gray-900">{{ computeSessionDuration() }}</span>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-900 mb-4">Details</h2>
            <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500">Type</dt>
                <dd class="font-medium text-gray-900 capitalize">{{ appt.appointment_type }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500">Location</dt>
                <dd class="font-medium text-gray-900 capitalize">
                  <a :href="appt.client.link_address" class="text-primary hover:underline" target="_blank">
                    {{ appt.location_type }}
                  </a>
                </dd>
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

          <!-- <div class="bg-white rounded-xl border border-gray-200 p-5">
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
          </div> -->

          <!-- Session Analytics -->
          <div v-if="analyticsData" class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 class="text-sm font-semibold text-gray-900">Session Analytics</h2>

            <!-- Health flag banner — critical -->
            <div v-if="analyticsData.health?.severity === 'critical'"
              class="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              <ExclamationTriangleIcon class="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p class="font-semibold">{{ detailFlagLabel(analyticsData.health.flag) }}</p>
                <p v-if="analyticsData.health.detail" class="text-xs mt-0.5">{{ analyticsData.health.detail }}</p>
              </div>
            </div>
            <!-- warning -->
            <div v-else-if="analyticsData.health?.severity === 'warning'"
              class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
              <ExclamationTriangleIcon class="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p class="font-semibold">{{ detailFlagLabel(analyticsData.health.flag) }}</p>
                <p v-if="analyticsData.health.detail" class="text-xs mt-0.5">{{ analyticsData.health.detail }}</p>
              </div>
            </div>
            <!-- info positive — subtle green/blue -->
            <div v-else-if="['completed_on_time', 'in_session', 'en_route'].includes(analyticsData.health?.flag)"
              class="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
              <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <p class="font-medium">{{ detailFlagLabel(analyticsData.health.flag) }}<span
                  v-if="analyticsData.health.detail" class="font-normal text-xs text-emerald-600 ml-1">— {{
                    analyticsData.health.detail }}</span></p>
            </div>

            <!-- Stats grid -->
            <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500">Scheduled Duration</dt>
                <dd class="font-medium text-gray-900 mt-0.5">{{ formatMinutes(analyticsData.scheduled_duration_minutes)
                }}</dd>
              </div>
              <div v-if="analyticsData.actual_duration_minutes !== null">
                <dt class="text-xs text-gray-500">Actual Duration</dt>
                <dd class="font-medium text-gray-900 mt-0.5">{{ formatMinutes(analyticsData.actual_duration_minutes) }}
                </dd>
              </div>
              <div v-if="analyticsData.started_on_time !== null">
                <dt class="text-xs text-gray-500">Started On Time</dt>
                <dd
                  :class="['font-medium mt-0.5', analyticsData.started_on_time ? 'text-emerald-600' : 'text-red-600']">
                  {{ analyticsData.started_on_time ? 'Yes' : 'No' }}
                </dd>
              </div>
              <div v-if="analyticsData.start_variance_minutes !== null && analyticsData.start_variance_minutes !== 0">
                <dt class="text-xs text-gray-500">Start Variance</dt>
                <dd
                  :class="['font-medium mt-0.5', analyticsData.start_variance_minutes > 0 ? 'text-red-600' : 'text-emerald-600']">
                  {{ analyticsData.start_variance_minutes > 0 ? `+${analyticsData.start_variance_minutes} min late` :
                    `${Math.abs(analyticsData.start_variance_minutes)} min early` }}
                </dd>
              </div>
            </dl>
          </div>

          <div v-if="showFeedbackSection" class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-gray-900">Client Feedback</h2>
              <span v-if="hasFeedback" class="text-xs text-gray-500">{{ feedbackRespondentData.length }} responses</span>
            </div>
            <div v-if="!hasFeedback" class="text-sm text-gray-400">No feedback yet.</div>
            <div v-else class="space-y-4">
              <div v-for="item in feedbackRespondentData" :key="item.id"
                   class="p-3 border border-gray-100 rounded-lg">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.respondent?.name || 'Respondent' }}</p>
                    <p class="text-xs text-gray-500">{{ item.respondent?.email || '—' }}</p>
                    <p v-if="item.respondent?.position || item.respondent?.phone_number" class="text-xs text-gray-400">
                      <span v-if="item.respondent?.position">{{ item.respondent.position }}</span>
                      <span v-if="item.respondent?.position && item.respondent?.phone_number" class="text-gray-300">·</span>
                      <span v-if="item.respondent?.phone_number">{{ item.respondent.phone_number }}</span>
                    </p>
                  </div>
                  <div class="text-xs text-gray-400 shrink-0">{{ formatFeedbackTimestamp(item.submitted_at || item.created_at) }}</div>
                </div>
                <div class="flex items-center gap-2 mt-2">
                  <StarRating :model-value="item.rating ?? 0" readonly />
                  <span class="text-xs text-gray-500">{{ item.rating ?? 0 }}/5</span>
                </div>
                <p v-if="item.comment" class="text-sm text-gray-700 mt-2">{{ item.comment }}</p>
                <p v-else class="text-xs text-gray-400 mt-2">No comment provided.</p>
              </div>
            </div>
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

        <!-- Session Analytics -->
        <div v-if="analyticsData" class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-900">Session Analytics</h2>

          <!-- Health flag banner — critical -->
          <div v-if="analyticsData.health?.severity === 'critical'"
            class="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <ExclamationTriangleIcon class="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold">{{ detailFlagLabel(analyticsData.health.flag) }}</p>
              <p v-if="analyticsData.health.detail" class="text-xs mt-0.5">{{ analyticsData.health.detail }}</p>
            </div>
          </div>
          <!-- warning -->
          <div v-else-if="analyticsData.health?.severity === 'warning'"
            class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
            <ExclamationTriangleIcon class="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold">{{ detailFlagLabel(analyticsData.health.flag) }}</p>
              <p v-if="analyticsData.health.detail" class="text-xs mt-0.5">{{ analyticsData.health.detail }}</p>
            </div>
          </div>
          <!-- info positive — subtle green/blue -->
          <div v-else-if="['completed_on_time', 'in_session', 'en_route'].includes(analyticsData.health?.flag)"
            class="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <p class="font-medium">{{ detailFlagLabel(analyticsData.health.flag) }}<span
                v-if="analyticsData.health.detail" class="font-normal text-xs text-emerald-600 ml-1">— {{
                  analyticsData.health.detail }}</span></p>
          </div>

          <!-- Stats grid -->
          <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt class="text-xs text-gray-500">Scheduled Duration</dt>
              <dd class="font-medium text-gray-900 mt-0.5">{{ formatMinutes(analyticsData.scheduled_duration_minutes) }}
              </dd>
            </div>
            <div v-if="analyticsData.actual_duration_minutes !== null">
              <dt class="text-xs text-gray-500">Actual Duration</dt>
              <dd class="font-medium text-gray-900 mt-0.5">{{ formatMinutes(analyticsData.actual_duration_minutes) }}
              </dd>
            </div>
            <div v-if="analyticsData.started_on_time !== null">
              <dt class="text-xs text-gray-500">Started On Time</dt>
              <dd :class="['font-medium mt-0.5', analyticsData.started_on_time ? 'text-emerald-600' : 'text-red-600']">
                {{ analyticsData.started_on_time ? 'Yes' : 'No' }}
              </dd>
            </div>
            <div v-if="analyticsData.start_variance_minutes !== null && analyticsData.start_variance_minutes !== 0">
              <dt class="text-xs text-gray-500">Start Variance</dt>
              <dd
                :class="['font-medium mt-0.5', analyticsData.start_variance_minutes > 0 ? 'text-red-600' : 'text-emerald-600']">
                {{ analyticsData.start_variance_minutes > 0 ? `+${analyticsData.start_variance_minutes} min late` :
                  `${Math.abs(analyticsData.start_variance_minutes)} min early` }}
              </dd>
            </div>
          </dl>
        </div>

        <div v-if="showFeedbackSection" class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-gray-900">Client Feedback</h2>
            <div class="flex items-center gap-3">
              <span v-if="hasFeedback" class="text-xs text-gray-500">{{ feedbackRespondentData.length }}
                responses</span>
              <button v-if="hasFeedback && feedbackRespondentData.length > visibleFeedback.length"
                class="text-xs text-primary hover:underline" @click="showPanelDrawer = true">View all responses</button>
            </div>
          </div>
          <div v-if="!hasFeedback" class="text-sm text-gray-400">No feedback yet.</div>
          <div v-else class="space-y-4">
            <div v-for="item in visibleFeedback" :key="item.id" class="p-3 border border-gray-100 rounded-lg">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ item.respondent?.name || 'Respondent' }}</p>
                  <p class="text-xs text-gray-500">{{ item.respondent?.email || '—' }}</p>
                  <p v-if="item.respondent?.position || item.respondent?.phone_number" class="text-xs text-gray-400">
                    <span v-if="item.respondent?.position">{{ item.respondent.position }}</span>
                    <span v-if="item.respondent?.position && item.respondent?.phone_number"
                      class="text-gray-300">·</span>
                    <span v-if="item.respondent?.phone_number">{{ item.respondent.phone_number }}</span>
                  </p>
                </div>
                <div class="text-xs text-gray-400 shrink-0">{{ formatFeedbackTimestamp(item.submitted_at ||
                  item.created_at)
                }}</div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <StarRating :model-value="item.rating ?? 0" readonly />
                <span class="text-xs text-gray-500">{{ item.rating ?? 0 }}/5</span>
              </div>
              <p v-if="item.comment" class="text-sm text-gray-700 mt-2">{{ item.comment }}</p>
              <p v-else class="text-xs text-gray-400 mt-2">No comment provided.</p>
            </div>
          </div>
          <OnboardingPanelsDrawer v-if="appt?.onboarding" :open="showPanelDrawer" :onboarding-id="appt.onboarding.id"
            initial-section="feedback" @close="showPanelDrawer = false" />
        </div>
      </div>
    </template>

    <div v-if="!loading && !appt" class="text-center py-12">
      <p class="text-sm text-gray-500">Appointment not found.</p>
    </div>

    <!-- Action Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showActionModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeActionModal">
          <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ actionTitle }}</h3>
                <p class="text-xs text-gray-500 mt-0.5">{{ appt?.title || 'Appointment' }}</p>
              </div>
              <button @click="closeActionModal"
                class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <div class="flex items-center gap-2">
              <div
                :class="['flex items-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-center justify-center', isStartAction ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500']">
                <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  :class="isStartAction ? 'border-white' : 'border-gray-400'">1</span>
                Start
              </div>
              <div class="w-8 h-px bg-gray-300"></div>
              <div
                :class="['flex items-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-center justify-center', !isStartAction ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500']">
                <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  :class="!isStartAction ? 'border-white' : 'border-gray-400'">2</span>
                Complete
              </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="px-5 pt-5 pb-3">
                <div class="flex items-center justify-between">
                  <h2 class="text-sm font-semibold text-gray-900">Proof Photo</h2>
                  <span v-if="proofMedia" class="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <span class="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
                    Captured
                  </span>
                </div>
              </div>

              <div v-if="cameraError" class="px-5 pb-5 space-y-3">
                <div
                  class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  <ExclamationTriangleIcon class="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Camera not available. Please upload a photo instead.</span>
                </div>
                <input type="file" accept="image/*" @change="onFileChange"
                  class="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark" />
              </div>

              <template v-else-if="photoTaken && proofMedia">
                <div class="relative">
                  <img :src="proofMedia" alt="Proof photo" class="w-full max-h-72 object-cover" />
                  <button type="button" @click="retakePhoto"
                    class="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/75 text-white text-xs font-medium rounded-lg transition-colors backdrop-blur-sm">
                    <ArrowPathIcon class="w-3.5 h-3.5" />
                    Retake
                  </button>
                </div>
              </template>

              <template v-else>
                <div class="relative bg-black">
                  <video ref="videoEl" autoplay playsinline muted class="w-full max-h-72 object-cover"
                    :class="cameraReady ? 'opacity-100' : 'opacity-0'"></video>
                  <div v-if="!cameraReady"
                    class="absolute inset-0 flex flex-col items-center justify-center gap-2 min-h-48">
                    <svg class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p class="text-white/70 text-xs">Starting camera…</p>
                  </div>
                  <button v-if="cameraReady" type="button" @click="capturePhoto"
                    class="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
                    <CameraIcon class="w-7 h-7 text-gray-800" />
                  </button>
                </div>
                <canvas ref="canvasEl" class="hidden"></canvas>
              </template>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <h2 class="text-sm font-semibold text-gray-900 mb-3">GPS Location</h2>
              <div v-if="gettingLocation" class="flex items-center gap-2 text-sm text-gray-500">
                <svg class="w-4 h-4 animate-spin text-primary shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Detecting your location…
              </div>
              <div v-else-if="actionForm.latitude && actionForm.longitude" class="space-y-1">
                <div class="flex items-center gap-2">
                  <CheckCircleIcon class="w-4 h-4 text-emerald-500 shrink-0" />
                  <span class="text-sm font-medium text-gray-900">Location detected</span>
                </div>
                <p class="text-xs text-gray-400 pl-6 font-mono">{{ actionForm.latitude.toFixed(6) }}, {{
                  actionForm.longitude.toFixed(6) }}</p>
                <button type="button" @click="getLocation" class="pl-6 text-xs text-primary hover:underline">
                  Refresh
                </button>
              </div>
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

            <template v-if="!isStartAction">
              <!-- <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h2 class="text-sm font-semibold text-gray-900">Session Summary</h2>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">Number of Students *</label>
                  <input v-model.number="actionForm.student_count" type="number" min="0" required
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div> -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Completion Notes</label>
                <textarea v-model="actionForm.completion_notes" rows="3" placeholder="Summary of what was covered…"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
              </div>
              <!-- </div> -->
            </template>

            <div v-if="actionSubmitError"
              class="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {{ actionSubmitError }}
            </div>

            <div class="flex gap-3 justify-end">
              <button @click="closeActionModal" type="button"
                class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button @click="submitAction" type="button"
                :disabled="actionSubmitting || !proofMedia || !actionForm.latitude || !actionForm.longitude || gettingLocation"
                class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60">
                <span v-if="uploadingPhoto">Uploading photo…</span>
                <span v-else-if="actionSubmitting">{{ isStartAction ? 'Starting…' : 'Completing…' }}</span>
                <span v-else-if="!proofMedia">Take a photo first</span>
                <span v-else-if="gettingLocation">Getting your location…</span>
                <span v-else-if="!actionForm.latitude || !actionForm.longitude">Location required</span>
                <span v-else>{{ isStartAction ? 'Start Appointment' : 'Complete Appointment' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reschedule Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showRescheduleModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeRescheduleModal">
          <div class="bg-white rounded-lg shadow-md max-w-md w-full p-6 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Reschedule Appointment</h3>
            <p class="text-sm text-gray-600">Update the new schedule for this appointment.</p>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">New Date *</label>
                <input v-model="rescheduleForm.scheduled_date" type="date"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">Start Time *</label>
                  <input v-model="rescheduleForm.scheduled_start_time" type="time"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1.5">End Time *</label>
                  <input v-model="rescheduleForm.scheduled_end_time" type="time"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Reason *</label>
                <textarea v-model="rescheduleForm.reschedule_reason" rows="3" required
                  placeholder="Why are you rescheduling?"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
              </div>
            </div>

            <div v-if="rescheduleError" class="text-sm text-red-600">{{ rescheduleError }}</div>

            <div class="flex gap-3 justify-end">
              <button @click="closeRescheduleModal"
                class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button @click="handleReschedule"
                :disabled="rescheduling || !rescheduleForm.scheduled_date || !rescheduleForm.scheduled_start_time || !rescheduleForm.scheduled_end_time || !rescheduleForm.reschedule_reason?.trim()"
                class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60">
                {{ rescheduling ? 'Rescheduling...' : 'Confirm Reschedule' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Cancel Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCancelModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showCancelModal = false">
          <div class="bg-white rounded-lg shadow-md max-w-sm w-full p-6 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Cancel Appointment</h3>
            <p class="text-sm text-gray-600">Are you sure you want to cancel this appointment?</p>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Reason *</label>
              <textarea v-model="cancelReason" rows="3" required placeholder="Enter reason..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none"></textarea>
            </div>
            <div class="flex gap-3 justify-end">
              <button @click="showCancelModal = false"
                class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Back</button>
              <button @click="handleCancel" :disabled="actionLoading || !cancelReason?.trim()"
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
        <div v-if="isMapFullscreen" class="fixed inset-0 bg-gray-900 z-[60] flex flex-col">
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
import { ChevronLeftIcon, ArrowsPointingOutIcon, XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, CameraIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { trainerService } from '@/modules/trainer/services/trainerService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { getCurrentLocation } from '@/modules/shared/composables/useGeolocation.js'
import { extractErrorMessage } from '@core/services/error.handler'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import { useTrainerTracking } from '@/modules/shared/composables/useTrainerTracking.js'
import { useMap } from '@/modules/shared/composables/useMap.js'
import StarRating from '@/modules/shared/components/StarRating.vue'
import OnboardingPanelsDrawer from '@/modules/shared/components/OnboardingPanelsDrawer.vue'
import AppointmentJourney from "@/modules/shared/components/AppointmentJourney.vue";

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { formatDateMed: formatDate, formatTime, formatTimeFromISO } = useDateTime()
const { startTracking, stopTracking } = useTrainerTracking()

const appt = ref(null)
const travelEstimates = ref(null)
const analyticsData = ref(null)
const feedbackRespondentData = ref(null)
const showPanelDrawer = ref(false)
const visibleFeedback = computed(() => (Array.isArray(feedbackRespondentData.value) ? feedbackRespondentData.value.slice(0, 2) : []))
const loading = ref(true)
const actionLoading = ref(false)
const showActionModal = ref(false)
const actionMode = ref('start')
const actionSubmitting = ref(false)
const actionSubmitError = ref(null)
const showRescheduleModal = ref(false)
const rescheduling = ref(false)
const rescheduleError = ref(null)

const mapContainer = ref(null)
const fullscreenMapContainer = ref(null)
const routeMap = useMap()
const routeMapFullscreen = useMap()
const isMapFullscreen = ref(false)
const videoEl = ref(null)
const canvasEl = ref(null)
const cameraReady = ref(false)
const cameraError = ref(false)
const photoTaken = ref(false)
const proofMedia = ref(null)   // base64 data URI — preview only
const proofBlob = ref(null)    // raw Blob — used for R2 upload
const uploadingPhoto = ref(false)
const gettingLocation = ref(false)
const locationError = ref(null)
let mediaStream = null

const actionForm = reactive({
  latitude: null,
  longitude: null,
  student_count: 0,
  completion_notes: ''
})

const rescheduleForm = reactive({
  scheduled_date: '',
  scheduled_start_time: '',
  scheduled_end_time: '',
  reschedule_reason: ''
})

const isStartAction = computed(() => actionMode.value === 'start')
const actionTitle = computed(() => isStartAction.value ? 'Start Appointment' : 'Complete Appointment')

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
const hasFeedback = computed(() => Array.isArray(feedbackRespondentData.value) && feedbackRespondentData.value.length > 0)
const showFeedbackSection = computed(() => !!appt.value && (hasFeedback.value || appt.value.status === 'completed'))
const trainerStatusDot = computed(() => {
  const s = trainerPosition.value?.status
  if (s === 'at_office') return 'bg-blue-500'
  if (s === 'traveling') return 'bg-amber-500'
  if (s === 'active') return 'bg-green-500'
  return 'bg-gray-400'
})

const statusLabel = computed(() => appt.value?.status ? String(appt.value.status).replace(/_/g, ' ') : 'Unknown')
const statusBannerClass = computed(() => {
  const s = appt.value?.status
  if (['completed', 'in_progress'].includes(s)) return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  if (['pending', 'leave_office'].includes(s)) return 'bg-amber-50 text-amber-700 border border-amber-100'
  if (['cancelled', 'rescheduled'].includes(s)) return 'bg-red-50 text-red-700 border border-red-100'
  return 'bg-gray-50 text-gray-600 border border-gray-200'
})

function resetActionForm() {
  actionForm.latitude = null
  actionForm.longitude = null
  actionForm.student_count = 0
  actionForm.completion_notes = ''
  actionSubmitError.value = null
  cameraReady.value = false
  cameraError.value = false
  photoTaken.value = false
  proofMedia.value = null
  proofBlob.value = null
  uploadingPhoto.value = false
  locationError.value = null
}

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

    if (!videoEl.value) return
    videoEl.value.srcObject = mediaStream
    videoEl.value.onloadedmetadata = () => { cameraReady.value = true }
  } catch {
    cameraError.value = true
  }
}

function stopCamera() {
  mediaStream?.getTracks().forEach(track => track.stop())
  mediaStream = null
}

function capturePhoto() {
  const video = videoEl.value
  const canvas = canvasEl.value
  if (!video || !canvas) return
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0)
  proofMedia.value = canvas.toDataURL('image/jpeg', 0.85)
  photoTaken.value = true
  stopCamera()
  canvas.toBlob(blob => { proofBlob.value = blob }, 'image/jpeg', 0.85)
}

function retakePhoto() {
  proofMedia.value = null
  photoTaken.value = false
  startCamera()
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  proofBlob.value = file
  const reader = new FileReader()
  reader.onload = () => {
    proofMedia.value = reader.result
    photoTaken.value = true
  }
  reader.readAsDataURL(file)
}

async function getLocation() {
  gettingLocation.value = true
  locationError.value = null
  try {
    const { latitude, longitude } = await getCurrentLocation()
    actionForm.latitude = latitude
    actionForm.longitude = longitude
  } catch (err) {
    locationError.value = err.message || 'Could not get location. Please enable location access and try again.'
  } finally {
    gettingLocation.value = false
  }
}

function openActionModal(mode) {
  actionMode.value = mode
  resetActionForm()
  showActionModal.value = true
}

function closeActionModal() {
  showActionModal.value = false
  stopCamera()
  resetActionForm()
}

function normalizeDateForInput(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    const isoDate = value.match(/^\d{4}-\d{2}-\d{2}/)
    if (isoDate) return isoDate[0]
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

function openRescheduleModal() {
  const current = appt.value
  rescheduleError.value = null
  if (current) {
    rescheduleForm.scheduled_date = normalizeDateForInput(current.scheduled_date)
    rescheduleForm.scheduled_start_time = current.scheduled_start_time || ''
    rescheduleForm.scheduled_end_time = current.scheduled_end_time || ''
    rescheduleForm.reschedule_reason = current.reschedule_reason || ''
  }
  showRescheduleModal.value = true
}

function closeRescheduleModal() {
  showRescheduleModal.value = false
  rescheduleError.value = null
}

async function load() {
  loading.value = true
  try {
    const response = await trainerService.getAppointment(route.params.id)
    appt.value = response.data
    travelEstimates.value = response.travel_estimates ?? null
    analyticsData.value = response.analytics ?? null
    feedbackRespondentData.value = response.respondent_feedback ?? null
  } catch {
    appt.value = null
    travelEstimates.value = null
  } finally {
    loading.value = false
  }
}

async function submitAction() {
  actionSubmitError.value = null
  actionSubmitting.value = true
  uploadingPhoto.value = true

  try {
    const folder = isStartAction.value ? 'start_proof' : 'end_proof'
    const mediaId = await trainerService.uploadProofToR2(proofBlob.value, folder)
    uploadingPhoto.value = false

    if (isStartAction.value) {
      await trainerService.startAppointment(appt.value.id, {
        start_proof_media_id: mediaId,
        start_latitude: actionForm.latitude,
        start_longitude: actionForm.longitude,
      })
      toast.success('Appointment started!')
    } else {
      await trainerService.completeAppointment(appt.value.id, {
        end_proof_media_id: mediaId,
        end_latitude: actionForm.latitude,
        end_longitude: actionForm.longitude,
        student_count: actionForm.student_count,
        completion_notes: actionForm.completion_notes || null,
      })
      toast.success('Appointment completed!')
    }

    closeActionModal()
    await load()
  } catch (err) {
    actionSubmitError.value = extractErrorMessage(err)
    uploadingPhoto.value = false
  } finally {
    actionSubmitting.value = false
  }
}

async function handleReschedule() {
  rescheduleError.value = null
  if (!rescheduleForm.reschedule_reason?.trim()) {
    rescheduleError.value = 'Reason is required.'
    return
  }
  rescheduling.value = true
  try {
    await trainerService.rescheduleAppointment(appt.value.id, {
      ...rescheduleForm,
      reschedule_reason: rescheduleForm.reschedule_reason.trim()
    })
    toast.success('Appointment rescheduled.')
    closeRescheduleModal()
    await load()
  } catch (err) {
    rescheduleError.value = extractErrorMessage(err)
  } finally {
    rescheduling.value = false
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

function computeSessionDuration() {
  const a = appt.value
  if (!a?.scheduled_start_time || !a?.scheduled_end_time) return '—'
  const [sh, sm] = a.scheduled_start_time.split(':').map(Number)
  const [eh, em] = a.scheduled_end_time.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return '—'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const FLAG_LABELS_DETAIL = { overdue: 'Overdue', starting_late: 'Starting Late', pending_too_long: 'Stale Pending', upcoming: 'Upcoming', late_to_client: 'Late to Client', en_route: 'En Route', running_overtime: 'Running Overtime', started_late: 'Started Late', in_session: 'In Session', completed_late: 'Ended Late', completed_on_time: 'On Time', cancelled: 'Cancelled', rescheduled: 'Rescheduled' }
function detailFlagLabel(flag) { return FLAG_LABELS_DETAIL[flag] || flag }
function formatMinutes(mins) {
  if (!mins && mins !== 0) return '—'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60); const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatFeedbackTimestamp(iso) {
  if (!iso) return '—'
  return `${formatDate(iso)} · ${formatTimeFromISO(iso)}`
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
  if (!cancelReason.value?.trim()) {
    toast.error('Reason is required.')
    return
  }
  actionLoading.value = true
  try {
    await trainerService.cancelAppointment(appt.value.id, cancelReason.value.trim())
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

watch(currentEstimate, async (est) => {
  if (!est) return
  await nextTick()
  if (!mapContainer.value) return

  routeMap.init(mapContainer.value, { zoomControl: false, attributionControl: false })

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

    await new Promise(resolve => setTimeout(resolve, 500))
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

watch(showActionModal, async (open) => {
  if (!open) {
    stopCamera()
    return
  }

  await nextTick()
  startCamera()
  getLocation()
})

onMounted(async () => {
  await load()
})

onBeforeUnmount(() => {
  stopCamera()
  routeMap.destroy()
  routeMapFullscreen.destroy()
})
</script>
