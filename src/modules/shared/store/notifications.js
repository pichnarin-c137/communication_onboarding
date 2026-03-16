import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificationService } from '@/modules/shared/services/notificationService.js'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

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

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  }
})
