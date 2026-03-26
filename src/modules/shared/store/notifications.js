import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificationService } from '@/modules/shared/services/notificationService.js'
import { usePusher } from '@/modules/shared/composables/usePusher'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useToast } from '@/modules/shared/composables/useToast'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

  // Composables that don't depend on other stores are safe at factory level
  const { connect, disconnect } = usePusher()
  const { info } = useToast()

  let activeChannel = null

  async function fetchNotifications(limit = 20) {
    loading.value = true
    try {
      const response = await notificationService.getNotifications(limit)
      notifications.value = response.data?.data || response.data || []
    } catch (err) {
      // Silently fail if notifications can't be loaded
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    try {
      const response = await notificationService.getUnreadCount()
      const countData = response.data?.data || response.data
      unreadCount.value = countData?.unread_count ?? countData ?? 0
    } catch (err) {
      // Silently fail
    }
  }

  async function markAsRead(id) {
    try {
      await notificationService.markAsRead(id)
      const n = notifications.value.find(n => n.id === id)
      if (n) {
        n.is_read = true
        n.read_at = new Date().toISOString()
      }
      if (unreadCount.value > 0) unreadCount.value--
    } catch (err) {
      // Silently fail
    }
  }

  async function markAllAsRead() {
    try {
      await notificationService.markAllAsRead()
      notifications.value.forEach(n => {
        n.is_read = true
        n.read_at = new Date().toISOString()
      })
      unreadCount.value = 0
    } catch (err) {
      // Silently fail
    }
  }

  function connectRealtime() {
    if (activeChannel) return
    const authStore = useAuthStore()
    if (!authStore.userId) return

    const pusher = connect(() => authStore.accessToken)
    activeChannel = pusher.subscribe(`private-notifications.${authStore.userId}`)

    activeChannel.bind('NotificationCreated', (data) => {
      notifications.value.unshift(data)
      if (notifications.value.length > 100) notifications.value.length = 100
      unreadCount.value++
      if (data.title) info(data.title)
    })
  }

  function disconnectRealtime() {
    if (activeChannel) {
      try {
        activeChannel.unbind('NotificationCreated')
        activeChannel.unsubscribe()
      } catch {
        // WebSocket may already be closing — safe to ignore
      }
      activeChannel = null
    }
    disconnect()
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    connectRealtime,
    disconnectRealtime,
  }
})
