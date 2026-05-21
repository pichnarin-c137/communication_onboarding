import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userAdminService } from '@/modules/admin/services/user-admin.service.js'

export const useUserAdminStore = defineStore('userAdmin', () => {
  const users = ref([])
  const currentUser = ref(null)
  const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1 })
  const loading = ref(false)
  const loadingUser = ref(false)
  const error = ref(null)

  const filters = ref({
    search: '',
    role: '',
    gender: '',
    is_suspended: '',
    nationality: '',
    only_trashed: false,
    only_active: false,
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  async function fetchUsers(page = 1) {
    loading.value = true
    error.value = null
    try {
      const params = { page, per_page: meta.value.per_page }
      if (filters.value.search) params.search = filters.value.search
      if (filters.value.role) params.role = filters.value.role
      if (filters.value.gender) params.gender = filters.value.gender
      if (filters.value.is_suspended !== '') params.is_suspended = filters.value.is_suspended
      if (filters.value.nationality) params.nationality = filters.value.nationality
      if (filters.value.only_trashed) params.only_trashed = true
      if (filters.value.only_active) params.only_active = true
      params.sort_by = filters.value.sort_by
      params.sort_order = filters.value.sort_order

      const response = await userAdminService.getUsers(params)
      users.value = response.data || []
      if (response.meta) meta.value = response.meta
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUser(id) {
    loadingUser.value = true
    currentUser.value = null
    error.value = null
    try {
      const response = await userAdminService.getUserDetail(id)
      currentUser.value = response.data || null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loadingUser.value = false
    }
  }

  async function createUser(data) {
    const response = await userAdminService.createUser(data)
    await fetchUsers(meta.value.current_page)
    return response
  }

  async function updateUserInfo(id, data) {
    const response = await userAdminService.updateUserInfo(id, data)
    if (currentUser.value?.id === id) await fetchUser(id)
    await fetchUsers(meta.value.current_page)
    return response
  }

  async function updateCredentials(id, data) {
    const response = await userAdminService.updateCredentials(id, data)
    if (currentUser.value?.id === id) await fetchUser(id)
    return response
  }

  async function toggleSuspend(id) {
    const response = await userAdminService.toggleSuspend(id)
    await fetchUsers(meta.value.current_page)
    if (currentUser.value?.id === id) await fetchUser(id)
    return response
  }

  async function forcePasswordReset(id) {
    const response = await userAdminService.forcePasswordReset(id)
    return response
  }

  async function softDelete(id) {
    const response = await userAdminService.softDelete(id)
    await fetchUsers(meta.value.current_page)
    return response
  }

  async function hardDelete(id) {
    const response = await userAdminService.hardDelete(id)
    await fetchUsers(meta.value.current_page)
    return response
  }

  async function restoreUser(id) {
    const response = await userAdminService.restoreUser(id)
    await fetchUsers(meta.value.current_page)
    return response
  }

  function resetFilters() {
    filters.value = {
      search: '',
      role: '',
      gender: '',
      is_suspended: '',
      nationality: '',
      only_trashed: false,
      only_active: false,
      sort_by: 'created_at',
      sort_order: 'desc',
    }
  }

  return {
    users,
    currentUser,
    meta,
    loading,
    loadingUser,
    error,
    filters,
    fetchUsers,
    fetchUser,
    createUser,
    updateUserInfo,
    updateCredentials,
    toggleSuspend,
    forcePasswordReset,
    softDelete,
    hardDelete,
    restoreUser,
    resetFilters,
  }
})
