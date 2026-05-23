import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

function loadWidgets(storageKey, defaults) {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaults, ...parsed }
    }
  } catch {
    // ignore corrupt storage
  }
  return { ...defaults }
}

export const useUiPreferences = defineStore('uiPreferences', () => {
  const density = ref(localStorage.getItem('coms_density') || 'comfortable')

  const saleWidgets = reactive(loadWidgets('coms_sale_widgets', {
    stats: true,
    upcoming: true,
    onboarding: true,
    charts: true,
    myTrainers: true,
  }))

  const trainerWidgets = reactive(loadWidgets('coms_trainer_widgets', {
    stats: true,
    schedule: true,
    onboarding: true,
    upcoming: true,
  }))

  function setDensity(val) {
    density.value = val
    localStorage.setItem('coms_density', val)
  }

  function toggleSaleWidget(key) {
    saleWidgets[key] = !saleWidgets[key]
    localStorage.setItem('coms_sale_widgets', JSON.stringify({ ...saleWidgets }))
  }

  function toggleTrainerWidget(key) {
    trainerWidgets[key] = !trainerWidgets[key]
    localStorage.setItem('coms_trainer_widgets', JSON.stringify({ ...trainerWidgets }))
  }

  function resetSaleWidgets() {
    Object.assign(saleWidgets, { stats: true, upcoming: true, onboarding: true, charts: true, myTrainers: true })
    localStorage.removeItem('coms_sale_widgets')
  }

  function resetTrainerWidgets() {
    Object.assign(trainerWidgets, { stats: true, schedule: true, onboarding: true, upcoming: true })
    localStorage.removeItem('coms_trainer_widgets')
  }

  return {
    density,
    saleWidgets,
    trainerWidgets,
    setDensity,
    toggleSaleWidget,
    toggleTrainerWidget,
    resetSaleWidgets,
    resetTrainerWidgets,
  }
})
