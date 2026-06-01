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
  let activeUserId = null

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
    const authStore = useAuthStore()
    const userId = authStore.userId
    if (!userId) return
    // Already subscribed to the right user's channel — nothing to do.
    if (activeChannel && activeUserId === userId) return

    const pusher = connect(() => authStore.accessToken)

    // The identity changed (e.g. admin force-login / exit impersonation): the
    // socket is alive, so drop the previous user's channel before subscribing
    // to the new one. Without this we stay on private-notifications.{adminId}
    // and never receive the impersonated user's notifications.
    if (activeChannel) {
      activeChannel.unbind('NotificationCreated')
      pusher.unsubscribe(`private-notifications.${activeUserId}`)
      activeChannel = null
      // Clear the previous identity's in-memory list so it isn't shown as the
      // new user's; consumers refetch via fetchNotifications().
      notifications.value = []
      unreadCount.value = 0
    }

    activeChannel = pusher.subscribe(`private-notifications.${userId}`)
    activeUserId = userId

    activeChannel.bind('NotificationCreated', (data) => {
      notifications.value.unshift(data)
      if (notifications.value.length > 100) notifications.value.length = 100
      unreadCount.value++
      if (data.title) info(data.title)
    })
  }

  function disconnectRealtime() {
    if (activeChannel) {
      // Only unbind locally — do NOT call unsubscribe() here. unsubscribe()
      // writes a `pusher:unsubscribe` frame to the socket, and disconnect()
      // below closes the socket anyway. Sending that frame mid-teardown is what
      // logs "WebSocket is already in CLOSING or CLOSED state".
      activeChannel.unbind('NotificationCreated')
      activeChannel = null
    }
    activeUserId = null
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
