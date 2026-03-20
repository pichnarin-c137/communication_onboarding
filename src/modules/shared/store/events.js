import { defineStore } from 'pinia'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useCalendarStore } from '@/modules/shared/store/calendar.js'
import { trainerService } from '@/modules/trainer/services/trainerService.js'
import { saleService } from '@/modules/sale/services/saleService.js'

const STATUS_COLORS = {
  pending:      { bg: '#DBEAFE', border: '#3B82F6' },
  leave_office: { bg: '#FEF3C7', border: '#F59E0B' },
  in_progress:  { bg: '#D1FAE5', border: '#10B981' },
  done:         { bg: '#EDE9FE', border: '#8B5CF6' },
  cancelled:    { bg: '#FEE2E2', border: '#EF4444' },
  rescheduled:  { bg: '#F3F4F6', border: '#6B7280' }
}

export function appointmentToEvent(appt) {
  const date  = typeof appt.scheduled_date === 'string' && appt.scheduled_date.includes('T')
    ? appt.scheduled_date.split('T')[0]
    : appt.scheduled_date
  // Normalise to HH:MM:SS — backend may return "HH:MM" or "HH:MM:SS"
  const toHMS = t => t ? t.substring(0, 5) + ':00' : null
  const start = `${date}T${toHMS(appt.scheduled_start_time) || '09:00:00'}`
  const end   = `${date}T${toHMS(appt.scheduled_end_time)   || '10:00:00'}`
  const colors = STATUS_COLORS[appt.status] || STATUS_COLORS.pending

  return {
    id:              `appt-${appt.id}`,
    appointmentId:   appt.id,
    title:           appt.title || null,
    start,
    end,
    type:            appt.appointment_type,
    format:          appt.location_type,
    meetingLink:     appt.meeting_link   || null,
    location:        appt.physical_location || null,
    notes:           appt.notes          || '',
    status:          appt.status,
    clientName:      appt.client?.company_name  || '',
    systemName:      appt.system?.name          || '',
    trainerName:     appt.trainer
      ? `${appt.trainer.first_name} ${appt.trainer.last_name}`
      : '',
    trainerId:       appt.trainer?.id || null,
    backgroundColor: colors.bg,
    borderColor:     colors.border,
    classNames:      ['fc-event-appointment', `fc-event-${appt.status}`]
  }
}

export const useEventStore = defineStore('events', {
  state: () => ({
    events: [],
    sidebarAppointments: [],
    sidebarLoading: false,
    selectedEvent: null,
    isDetailsModalOpen: false,
    isCreateModalOpen: false,
    createModalDefaults: {}
  }),

  getters: {
    filteredEvents(state) {
      const calendarStore = useCalendarStore()
      let result = [...state.events]
      if (calendarStore.selectedTrainerId) {
        result = result.filter(e => e.trainerId === calendarStore.selectedTrainerId)
      }
      return result
    }
  },

  actions: {
    // Load calendar events (FullCalendar data source)
    async loadEvents() {
      const authStore = useAuthStore()
      try {
        const service  = authStore.isTrainer ? trainerService : saleService
        const response = await service.getAppointments({ per_page: 200 })
        const appts    = response.data || []
        this.events    = appts.map(appointmentToEvent)
      } catch {
        this.events = []
      }
    },

    // Load sidebar appointments (upcoming + recent, ordered by date desc)
    async loadSidebar(params = {}) {
      const authStore = useAuthStore()
      this.sidebarLoading = true
      try {
        const service  = authStore.isTrainer ? trainerService : saleService
        const response = await service.getAppointments({ per_page: 50, ...params })
        this.sidebarAppointments = response.data || []
      } catch {
        this.sidebarAppointments = []
      } finally {
        this.sidebarLoading = false
      }
    },

    // Refresh both calendar events and sidebar after any mutation
    async refresh() {
      await Promise.all([this.loadEvents(), this.loadSidebar()])
    },

    // Modal management
    openCreateModal(defaults = {}) {
      this.createModalDefaults = defaults
      this.selectedEvent = null
      this.isCreateModalOpen = true
    },

    openDetailsModal(event) {
      this.selectedEvent = event
      this.isDetailsModalOpen = true
    },

    // Open details modal by appointment id only (sidebar click, no full event obj needed)
    openDetailsById(appointmentId) {
      this.selectedEvent = { appointmentId }
      this.isDetailsModalOpen = true
    },

    closeModals() {
      this.isCreateModalOpen = false
      this.isDetailsModalOpen = false
      this.selectedEvent = null
      this.createModalDefaults = {}
    }
  }
})
