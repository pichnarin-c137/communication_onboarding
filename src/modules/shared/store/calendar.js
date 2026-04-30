import { defineStore } from 'pinia'

const STORAGE_KEY = 'coms_calendar_view'
const TRAINER_FILTER_KEY = 'coms_calendar_trainer_filter'
const STATUS_FILTER_KEY = 'coms_calendar_hidden_statuses'

const ALL_STATUSES = ['pending', 'leave_office', 'in_progress', 'done', 'cancelled', 'rescheduled']

function loadTrainerFilter() {
  try {
    const stored = localStorage.getItem(TRAINER_FILTER_KEY)
    if (stored == null) return null
    const parsed = JSON.parse(stored)
    return parsed == null ? null : String(parsed)
  } catch {
    return null
  }
}

function loadHiddenStatuses() {
  try {
    const stored = localStorage.getItem(STATUS_FILTER_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    currentView: localStorage.getItem(STORAGE_KEY) || 'dayGridMonth',
    selectedDate: new Date().toISOString().split('T')[0],
    selectedTrainerId: loadTrainerFilter(),
    selectedClientId: null,
    eventTypeFilter: null,
    hiddenStatuses: loadHiddenStatuses(),
    loading: false
  }),

  getters: {
    statusHiddenCount(state) {
      return state.hiddenStatuses.length
    }
  },

  actions: {
    setView(view) {
      this.currentView = view
      localStorage.setItem(STORAGE_KEY, view)
    },

    setTrainerFilter(trainerId) {
      const id = trainerId == null ? null : String(trainerId)
      this.selectedTrainerId = id
      try {
        if (id == null) {
          localStorage.removeItem(TRAINER_FILTER_KEY)
        } else {
          localStorage.setItem(TRAINER_FILTER_KEY, JSON.stringify(id))
        }
      } catch {}
    },

    setClientFilter(clientId) {
      this.selectedClientId = clientId
    },

    setEventTypeFilter(type) {
      this.eventTypeFilter = type
    },

    isStatusVisible(key) {
      return !this.hiddenStatuses.includes(key)
    },

    toggleStatusFilter(key) {
      const idx = this.hiddenStatuses.indexOf(key)
      if (idx !== -1) {
        this.hiddenStatuses.splice(idx, 1)
      } else {
        if (ALL_STATUSES.length - this.hiddenStatuses.length <= 1) return
        this.hiddenStatuses.push(key)
      }
      try {
        localStorage.setItem(STATUS_FILTER_KEY, JSON.stringify([...this.hiddenStatuses]))
      } catch {}
    },

    resetStatusFilter() {
      this.hiddenStatuses = []
      try {
        localStorage.removeItem(STATUS_FILTER_KEY)
      } catch {}
    },

    resetFilters() {
      this.selectedTrainerId = null
      this.selectedClientId = null
      this.eventTypeFilter = null
      try {
        localStorage.removeItem(TRAINER_FILTER_KEY)
      } catch {}
    }
  }
})
