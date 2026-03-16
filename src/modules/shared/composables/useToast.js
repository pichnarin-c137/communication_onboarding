import { ref } from 'vue'

const toasts = ref([])
let nextId = 1

export function useToast() {
  function addToast(message, type = 'success', duration = 3000) {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) toasts.value.splice(index, 1)
  }

  function success(message) { addToast(message, 'success') }
  function error(message) { addToast(message, 'error') }
  function warning(message) { addToast(message, 'warning') }
  function info(message) { addToast(message, 'info') }

  return { toasts, addToast, removeToast, success, error, warning, info }
}
