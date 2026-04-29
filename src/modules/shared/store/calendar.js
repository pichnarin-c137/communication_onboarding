import { defineStore } from 'pinia'

const STORAGE_KEY = 'coms_calendar_view'
const TRAINER_FILTER_KEY = 'coms_calendar_trainer_filter'

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

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    currentView: localStorage.getItem(STORAGE_KEY) || 'dayGridMonth',
    selectedDate: new Date().toISOString().split('T')[0],
    selectedTrainerId: loadTrainerFilter(),
    selectedClientId: null,
    eventTypeFilter: null, // 'demo' | 'training' | null (all)
    loading: false
  }),

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
      } catch {
        // ignore storage failures
      }
    },
    setClientFilter(clientId) {
      this.selectedClientId = clientId
    },
    setEventTypeFilter(type) {
      this.eventTypeFilter = type
    },
    resetFilters() {
      this.selectedTrainerId = null
      this.selectedClientId = null
      this.eventTypeFilter = null
      try {
        localStorage.removeItem(TRAINER_FILTER_KEY)
      } catch {
        // ignore storage failures
      }
    }
  }
})
