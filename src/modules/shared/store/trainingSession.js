import { defineStore } from 'pinia'

export const useTrainingSessionStore = defineStore('trainingSession', {
  state: () => ({
    sessionStatuses: {}
  }),

  getters: {
    isLocked: (state) => (eventId) => {
      return state.sessionStatuses[eventId] === 'end'
    }
  },

  actions: {
    setEnd(eventId) {
      this.sessionStatuses[eventId] = 'end'
    }
  }
})
