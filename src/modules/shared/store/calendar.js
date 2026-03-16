import { defineStore } from 'pinia'

const STORAGE_KEY = 'coms_calendar_view'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    currentView: localStorage.getItem(STORAGE_KEY) || 'dayGridMonth',
    selectedDate: new Date().toISOString().split('T')[0],
    selectedTrainerId: null,
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
      this.selectedTrainerId = trainerId
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
    }
  }
})
