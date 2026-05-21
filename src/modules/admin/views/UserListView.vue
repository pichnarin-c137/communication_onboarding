<template>
  <div>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="text-sm text-gray-500 mt-0.5">Create and manage all system users</p>
      </div>
      <button
        @click="showCreate = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
      >
        <PlusIcon class="w-4 h-4" />
        New User
      </button>
    </div>

    <!-- Filters -->
    <UserFilters v-model="store.filters" @change="load(1)" @reset="onReset" />

    <!-- Table -->
    <UserTable
      :users="store.users"
      :loading="store.loading"
      @view="goToDetail"
      @editInfo="openEditInfo"
      @editCredentials="openEditCredentials"
      @suspend="onSuspend"
      @forceReset="onForceReset"
      @softDelete="onSoftDelete"
      @hardDelete="onHardDelete"
      @restore="onRestore"
    />

    <!-- Pagination -->
    <div v-if="store.meta.last_page > 1" class="flex items-center justify-between">
      <p class="text-sm text-gray-500">
        {{ store.meta.from }}–{{ store.meta.to }} of {{ store.meta.total }} users
      </p>
      <div class="flex gap-1">
        <button
          v-for="p in store.meta.last_page"
          :key="p"
          @click="load(p)"
          :class="[
            'w-8 h-8 text-sm rounded-lg transition-colors',
            p === store.meta.current_page
              ? 'bg-primary text-white font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >{{ p }}</button>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <CreateUserModal
    :open="showCreate"
    ref="createModalRef"
    @close="showCreate = false"
    @submit="onCreateSubmit"
  />

  <EditUserInfoModal
    :open="showEditInfo"
    :user="selectedUser"
    ref="editInfoRef"
    @close="showEditInfo = false"
    @submit="onEditInfoSubmit"
  />

  <EditCredentialsModal
    :open="showEditCreds"
    :user="selectedUser"
    ref="editCredsRef"
    @close="showEditCreds = false"
    @submit="onEditCredsSubmit"
  />

  <DeleteUserModal
    :open="showDelete"
    :hard="deleteHard"
    :user-name="selectedUser ? displayName(selectedUser) : ''"
    :loading="deleteLoading"
    @confirm="onDeleteConfirm"
    @cancel="showDelete = false"
  />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useUserAdminStore } from '@/modules/admin/store/user-admin.store.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { extractErrorMessage } from '@core/services/error.handler'
import UserFilters from '@/modules/admin/components/UserFilters.vue'
import UserTable from '@/modules/admin/components/UserTable.vue'
import CreateUserModal from '@/modules/admin/components/CreateUserModal.vue'
import EditUserInfoModal from '@/modules/admin/components/EditUserInfoModal.vue'
import EditCredentialsModal from '@/modules/admin/components/EditCredentialsModal.vue'
import DeleteUserModal from '@/modules/admin/components/DeleteUserModal.vue'

const router = useRouter()
const store = useUserAdminStore()
const toast = useToast()

const showCreate = ref(false)
const showEditInfo = ref(false)
const showEditCreds = ref(false)
const showDelete = ref(false)
const deleteHard = ref(false)
const deleteLoading = ref(false)
const selectedUser = ref(null)

const createModalRef = ref(null)
const editInfoRef = ref(null)
const editCredsRef = ref(null)

onMounted(() => load(1))

async function load(page = 1) {
  try {
    await store.fetchUsers(page)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

function onReset() {
  store.resetFilters()
  load(1)
}

function goToDetail(user) {
  router.push(`/admin/users/${user.id}`)
}

function openEditInfo(user) {
  selectedUser.value = user
  showEditInfo.value = true
}

function openEditCredentials(user) {
  selectedUser.value = user
  showEditCreds.value = true
}

function onSoftDelete(user) {
  selectedUser.value = user
  deleteHard.value = false
  showDelete.value = true
}

function onHardDelete(user) {
  selectedUser.value = user
  deleteHard.value = true
  showDelete.value = true
}

function onRestore(user) {
  selectedUser.value = user
  handleRestore()
}

async function handleRestore() {
  try {
    await store.restoreUser(selectedUser.value.id)
    toast.success('User restored successfully.')
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

async function onSuspend(user) {
  try {
    await store.toggleSuspend(user.id)
    const action = user.is_suspended ? 'unsuspended' : 'suspended'
    toast.success(`User ${action} successfully.`)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

async function onForceReset(user) {
  try {
    await store.forcePasswordReset(user.id)
    toast.success('Password reset email sent.')
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

async function onCreateSubmit(data) {
  createModalRef.value?.setLoading(true)
  try {
    await store.createUser(data)
    showCreate.value = false
    toast.success('User created successfully.')
  } catch (err) {
    createModalRef.value?.setError(extractErrorMessage(err))
  } finally {
    createModalRef.value?.setLoading(false)
  }
}

async function onEditInfoSubmit(data) {
  editInfoRef.value?.setLoading(true)
  try {
    await store.updateUserInfo(selectedUser.value.id, data)
    showEditInfo.value = false
    toast.success('Profile updated successfully.')
  } catch (err) {
    editInfoRef.value?.setError(extractErrorMessage(err))
  } finally {
    editInfoRef.value?.setLoading(false)
  }
}

async function onEditCredsSubmit(data) {
  editCredsRef.value?.setLoading(true)
  try {
    await store.updateCredentials(selectedUser.value.id, data)
    showEditCreds.value = false
    toast.success('Credentials updated. User sessions have been revoked.')
  } catch (err) {
    editCredsRef.value?.setError(extractErrorMessage(err))
  } finally {
    editCredsRef.value?.setLoading(false)
  }
}

async function onDeleteConfirm() {
  deleteLoading.value = true
  try {
    if (deleteHard.value) {
      await store.hardDelete(selectedUser.value.id)
      toast.success('User permanently deleted.')
    } else {
      await store.softDelete(selectedUser.value.id)
      toast.success('User deleted.')
    }
    showDelete.value = false
  } catch (err) {
    toast.error(extractErrorMessage(err))
  } finally {
    deleteLoading.value = false
  }
}

function displayName(user) {
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown'
}
</script>
