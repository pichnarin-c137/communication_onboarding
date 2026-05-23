<template>
  <div>
  <div class="space-y-5 mt-3">
    <!-- Back + Header -->
    <div class="flex items-center gap-3">
      <button @click="router.push('/admin/users')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Detail</h1>
        <p class="text-sm text-gray-500">Manage user profile and activity</p>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.loadingUser" class="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-16 h-16 rounded-full bg-gray-200"></div>
        <div class="space-y-2">
          <div class="h-5 bg-gray-200 rounded w-40"></div>
          <div class="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>

    <template v-else-if="store.currentUser">
      <!-- Profile header card -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <!-- Avatar + name -->
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span class="text-xl font-bold text-primary">{{ initials(store.currentUser) }}</span>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ displayName(store.currentUser) }}</h2>
              <p class="text-sm text-gray-500">@{{ store.currentUser.username }}</p>
              <div class="flex items-center gap-2 mt-1.5">
                <span :class="roleBadgeClass(store.currentUser.role)" class="px-2 py-0.5 rounded text-xs font-medium capitalize">
                  {{ store.currentUser.role }}
                </span>
                <UserStatusBadge :user="store.currentUser" />
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div v-if="!isDeleted" class="flex flex-wrap gap-2">
            <button @click="showEditInfo = true"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Edit Info
            </button>
            <button @click="showEditCreds = true"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Edit Credentials
            </button>
            <button @click="onSuspendToggle"
              :class="store.currentUser.is_suspended
                ? 'text-green-700 border-green-300 hover:bg-green-50'
                : 'text-orange-700 border-orange-300 hover:bg-orange-50'"
              class="px-3 py-2 text-sm font-medium bg-white border rounded-lg transition-colors">
              {{ store.currentUser.is_suspended ? 'Unsuspend' : 'Suspend' }}
            </button>
            <button @click="onForceReset"
              class="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
              Force Reset
            </button>
            <button @click="showDelete = true; deleteHard = false"
              class="px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
              Delete
            </button>
          </div>

          <div v-else class="flex gap-2">
            <button @click="onRestore"
              class="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors">
              Restore
            </button>
            <button @click="showDelete = true; deleteHard = true"
              class="px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
              Permanently Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="flex gap-6">
          <button
            v-for="tab in visibleTabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'pb-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >{{ tab.label }}</button>
        </nav>
      </div>

      <!-- Profile tab -->
      <div v-if="activeTab === 'profile'" class="bg-white border border-gray-200 rounded-xl p-6">
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div v-for="field in profileFields" :key="field.label">
            <dt class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{{ field.label }}</dt>
            <dd class="text-sm text-gray-900">{{ field.value || '—' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Dedicated Trainers tab (sale only) -->
      <div v-if="activeTab === 'roster'" class="bg-white border border-gray-200 rounded-xl p-6">
        <RosterTab
          :trainers="rosterStore.roster"
          :loading="rosterStore.loading"
          :readonly="isDeleted"
          @edit="showEditRoster = true"
        />
      </div>

      <!-- Activity Logs tab -->
      <div v-if="activeTab === 'logs'" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">Recent activity for this user</p>
        </div>
        <ActivityLogTable
          :logs="logStore.logs"
          :loading="logStore.loading"
          :show-user="false"
        />
        <!-- Log pagination -->
        <div v-if="logStore.meta.last_page > 1" class="flex justify-end gap-1">
          <button
            v-for="p in logStore.meta.last_page"
            :key="p"
            @click="loadLogs(p)"
            :class="[
              'w-8 h-8 text-sm rounded-lg transition-colors',
              p === logStore.meta.current_page
                ? 'bg-primary text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >{{ p }}</button>
        </div>
      </div>
    </template>

    <div v-else-if="!store.loadingUser" class="text-center py-12 text-gray-400">User not found.</div>
  </div>

  <!-- Modals -->
  <EditUserInfoModal
    :open="showEditInfo"
    :user="store.currentUser"
    ref="editInfoRef"
    @close="showEditInfo = false"
    @submit="onEditInfoSubmit"
  />

  <EditCredentialsModal
    :open="showEditCreds"
    :user="store.currentUser"
    ref="editCredsRef"
    @close="showEditCreds = false"
    @submit="onEditCredsSubmit"
  />

  <DeleteUserModal
    :open="showDelete"
    :hard="deleteHard"
    :user-name="store.currentUser ? displayName(store.currentUser) : ''"
    :loading="deleteLoading"
    @confirm="onDeleteConfirm"
    @cancel="showDelete = false"
  />

  <EditRosterModal
    :open="showEditRoster"
    :current-trainers="rosterStore.roster"
    ref="editRosterRef"
    @close="showEditRoster = false"
    @submit="onRosterSubmit"
  />

  <BlockedActionModal
    :open="showBlockedAction"
    :action="blockedAction"
    :context="blockedContext"
    @close="showBlockedAction = false"
  />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useUserAdminStore } from '@/modules/admin/store/user-admin.store.js'
import { useActivityLogStore } from '@/modules/admin/store/activity-log.store.js'
import { useRosterStore } from '@/modules/admin/store/roster.store.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { extractErrorMessage, getErrorCode, getErrorContext } from '@core/services/error.handler'
import UserStatusBadge from '@/modules/admin/components/UserStatusBadge.vue'
import EditUserInfoModal from '@/modules/admin/components/EditUserInfoModal.vue'
import EditCredentialsModal from '@/modules/admin/components/EditCredentialsModal.vue'
import DeleteUserModal from '@/modules/admin/components/DeleteUserModal.vue'
import ActivityLogTable from '@/modules/admin/components/ActivityLogTable.vue'
import RosterTab from '@/modules/admin/components/RosterTab.vue'
import EditRosterModal from '@/modules/admin/components/EditRosterModal.vue'
import BlockedActionModal from '@/modules/admin/components/BlockedActionModal.vue'

const route = useRoute()
const router = useRouter()
const store = useUserAdminStore()
const logStore = useActivityLogStore()
const rosterStore = useRosterStore()
const toast = useToast()

const activeTab = ref('profile')
const tabs = [
  { key: 'profile', label: 'Profile' },
  { key: 'roster', label: 'Dedicated Trainers', saleOnly: true },
  { key: 'logs', label: 'Activity Logs' },
]

const showEditInfo = ref(false)
const showEditCreds = ref(false)
const showDelete = ref(false)
const showEditRoster = ref(false)
const showBlockedAction = ref(false)
const blockedAction = ref('suspend')
const blockedContext = ref({})
const deleteHard = ref(false)
const deleteLoading = ref(false)

const editInfoRef = ref(null)
const editCredsRef = ref(null)
const editRosterRef = ref(null)

const isDeleted = computed(() => !!store.currentUser?.is_deleted || !!store.currentUser?.deleted_at)
const isSaleUser = computed(() => store.currentUser?.role === 'sale')

const visibleTabs = computed(() => tabs.filter((t) => !t.saleOnly || isSaleUser.value))

onMounted(async () => {
  try {
    await store.fetchUser(route.params.id)
    if (isSaleUser.value) loadRoster()
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
})

watch(activeTab, (tab) => {
  if (tab === 'logs') loadLogs(1)
  if (tab === 'roster' && rosterStore.roster.length === 0 && !rosterStore.loading) loadRoster()
})

watch(isSaleUser, (sale) => {
  if (sale) loadRoster()
  else rosterStore.reset()
})

async function loadRoster() {
  try {
    await rosterStore.fetch(route.params.id)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

async function onRosterSubmit(trainerIds) {
  editRosterRef.value?.setLoading(true)
  try {
    const data = await rosterStore.save(route.params.id, trainerIds)
    showEditRoster.value = false
    const added = data?.added?.length || 0
    const removed = data?.removed?.length || 0
    if (added || removed) {
      toast.success(`Roster updated — added ${added}, removed ${removed}.`)
    } else {
      toast.success('Roster updated.')
    }
  } catch (err) {
    const code = getErrorCode(err)
    if (code === 'TRAINER_WORKLOAD_EXCEEDED') {
      const ctx = getErrorContext(err)
      editRosterRef.value?.setWorkloadError(ctx)
    } else {
      editRosterRef.value?.setError(extractErrorMessage(err))
    }
  } finally {
    editRosterRef.value?.setLoading(false)
  }
}

async function loadLogs(page = 1) {
  try {
    await logStore.fetchUserLogs(route.params.id, page)
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

async function onSuspendToggle() {
  try {
    await store.toggleSuspend(route.params.id)
    const action = store.currentUser?.is_suspended ? 'suspended' : 'unsuspended'
    toast.success(`User ${action} successfully.`)
  } catch (err) {
    if (getErrorCode(err) === 'TRAINER_HAS_ACTIVE_COMMITMENTS') {
      blockedAction.value = 'suspend'
      blockedContext.value = getErrorContext(err) || {}
      showBlockedAction.value = true
      return
    }
    toast.error(extractErrorMessage(err))
  }
}

async function onForceReset() {
  try {
    await store.forcePasswordReset(route.params.id)
    toast.success('Password reset email sent.')
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

async function onRestore() {
  try {
    await store.restoreUser(route.params.id)
    await store.fetchUser(route.params.id)
    toast.success('User restored successfully.')
  } catch (err) {
    toast.error(extractErrorMessage(err))
  }
}

async function onEditInfoSubmit(data) {
  editInfoRef.value?.setLoading(true)
  try {
    await store.updateUserInfo(route.params.id, data)
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
    await store.updateCredentials(route.params.id, data)
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
      await store.hardDelete(route.params.id)
      toast.success('User permanently deleted.')
      router.push('/admin/users')
    } else {
      await store.softDelete(route.params.id)
      await store.fetchUser(route.params.id)
      toast.success('User deleted.')
    }
    showDelete.value = false
  } catch (err) {
    if (getErrorCode(err) === 'TRAINER_HAS_ACTIVE_COMMITMENTS') {
      showDelete.value = false
      blockedAction.value = 'delete'
      blockedContext.value = getErrorContext(err) || {}
      showBlockedAction.value = true
      return
    }
    toast.error(extractErrorMessage(err))
  } finally {
    deleteLoading.value = false
  }
}

const profileFields = computed(() => {
  const u = store.currentUser
  if (!u) return []
  return [
    { label: 'Email', value: u.email },
    { label: 'Username', value: u.username },
    { label: 'Phone', value: u.phone_number },
    { label: 'First Name', value: u.first_name },
    { label: 'Last Name', value: u.last_name },
    { label: 'Gender', value: u.gender },
    { label: 'Date of Birth', value: u.dob },
    { label: 'Nationality', value: u.nationality },
    { label: 'Address', value: u.address },
    { label: 'Created', value: u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : null },
  ]
})

function initials(user) {
  const f = user.first_name?.[0] || ''
  const l = user.last_name?.[0] || ''
  return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || '?'
}

function displayName(user) {
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown'
}

function roleBadgeClass(role) {
  if (role === 'admin') return 'bg-purple-100 text-purple-700'
  if (role === 'sale') return 'bg-blue-100 text-blue-700'
  if (role === 'trainer') return 'bg-teal-100 text-teal-700'
  return 'bg-gray-100 text-gray-600'
}
</script>
