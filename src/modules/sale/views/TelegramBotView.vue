<template>
  <div class="space-y-5 mt-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Telegram Bot</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage Telegram bot groups and configurations</p>
      </div>
      <button
        @click="openSetupModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
      >
        <PlusIcon class="w-4 h-4" />
        Generate Setup Token
      </button>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1">Connected Groups</p>
        <p class="text-2xl font-bold text-green-600">{{ connectedCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1">Removed Groups</p>
        <p class="text-2xl font-bold text-red-500">{{ removedCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 mb-1">Total Messages</p>
        <p class="text-2xl font-bold text-gray-800">{{ totalMessages }}</p>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by group name or client..."
          class="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      <div class="w-full sm:w-44">
        <AppSelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="All Statuses"
          :clearable="true"
        />
      </div>
    </div>

    <!-- Loading skeleton -->
    <SkeletonLoader v-if="loading" type="table" :count="5" />

    <!-- Groups table -->
    <template v-else-if="filteredGroups.length > 0">
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Group Name</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Language</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Connected At</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="group in filteredGroups" :key="group.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-medium text-gray-900">{{ group.group_name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ group.client_name ?? '—' }}</td>
              <td class="px-4 py-3">
                <StatusBadge :status="group.bot_status" />
              </td>
              <td class="px-4 py-3 text-gray-600">{{ group.language === 'km' ? 'ខ្មែរ' : 'English' }}</td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ group.connected_at ? formatDateTimeFromISO(group.connected_at) : '—' }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  @click="router.push(`/sales/configurations/telegram-bot/${group.id}`)"
                  class="px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="!loading" class="bg-white rounded-xl border border-gray-200 p-10 text-center">
      <div class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <ChatBubbleLeftEllipsisIcon class="w-7 h-7 text-blue-500" />
      </div>
      <h3 class="text-base font-semibold text-gray-900 mb-1">No Telegram groups connected</h3>
      <p class="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Connect a Telegram group to start sending automated notifications.</p>
      <div class="text-left max-w-xs mx-auto space-y-2 mb-6">
        <div class="flex items-start gap-2 text-sm text-gray-600">
          <span class="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">1</span>
          Add @COMSTetrisBot to your Telegram group
        </div>
        <div class="flex items-start gap-2 text-sm text-gray-600">
          <span class="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">2</span>
          Generate a setup token below
        </div>
        <div class="flex items-start gap-2 text-sm text-gray-600">
          <span class="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">3</span>
          Run <code class="bg-gray-100 px-1 mt-1 rounded text-xs">/setup &lt;token&gt;</code> in the group
        </div>
      </div>
      <button
        @click="openSetupModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
      >
        <PlusIcon class="w-4 h-4" />
        Generate Setup Token
      </button>
    </div>

    <!-- Setup Token Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSetupModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeSetupModal"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Generate Setup Token</h3>
              <button @click="closeSetupModal" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Client selector -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Select Client <span class="text-red-500">*</span></label>
              <AppSelect
                v-model="selectedClientId"
                :options="clientOptions"
                :loading="clientsLoading"
                placeholder="Search for a client..."
                :remote="true"
                @search="onClientSearch"
              />
            </div>

            <!-- Generated token display -->
            <template v-if="generatedToken">
              <div class="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                <div>
                  <p class="text-xs font-medium text-gray-500 mb-1.5">Setup Token</p>
                  <div class="flex items-center gap-2">
                    <code class="flex-1 text-sm font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 truncate text-gray-800">{{ generatedToken.token }}</code>
                    <button
                      @click="copyToken(generatedToken.token)"
                      class="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      title="Copy token"
                    >
                      <ClipboardDocumentIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 mb-1.5">Telegram Command</p>
                  <div class="flex items-center gap-2">
                    <code class="flex-1 text-sm font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 text-primary">/setup {{ generatedToken.token }}</code>
                    <button
                      @click="copyToken(`/setup ${generatedToken.token}`)"
                      class="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      title="Copy command"
                    >
                      <ClipboardDocumentIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p v-if="generatedToken.expires_at" class="text-xs text-amber-600">
                  Expires: {{ formatDateTimeFromISO(generatedToken.expires_at) }}
                </p>
              </div>
            </template>

            <div v-if="tokenError" class="text-sm text-red-600">{{ tokenError }}</div>

            <div class="flex gap-3 justify-end pt-1">
              <button @click="closeSetupModal" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Close
              </button>
              <button
                v-if="generatedToken"
                @click="handleGenerateToken"
                :disabled="!selectedClientId || generatingToken"
                class="px-4 py-2 text-sm font-medium text-white border border-primary bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors"
              >
                {{ generatingToken ? 'Generating...' : 'Regenerate' }}
              </button>
              <button
                v-else
                @click="handleGenerateToken"
                :disabled="!selectedClientId || generatingToken"
                class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors"
              >
                {{ generatingToken ? 'Generating...' : 'Generate Token' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/vue/24/outline'
import { telegramService } from '@/modules/sale/services/telegramService.js'
import { saleService } from '@/modules/sale/services/saleService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import { extractErrorMessage } from '@core/services/error.handler'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import AppSelect from '@/modules/shared/components/AppSelect.vue'

const router = useRouter()
const { success, error: toastError } = useToast()
const { formatDateTimeFromISO } = useDateTime()

// Groups data
const groups = ref([])
const loading = ref(false)
const totalMessages = ref(0)

// Filters
const searchQuery = ref('')
const statusFilter = ref(null)

const statusOptions = [
  { value: 'connected', label: 'Connected' },
  { value: 'removed', label: 'Removed' }
]

// Computed stats
const connectedCount = computed(() => groups.value.filter(g => g.status === 'connected').length)
const removedCount = computed(() => groups.value.filter(g => g.status === 'removed').length)

// Filtered groups (client-side)
const filteredGroups = computed(() => {
  let list = groups.value
  if (statusFilter.value) {
    list = list.filter(g => g.status === statusFilter.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(g => {
      const name = (g.name ?? '').toLowerCase()
      const client = (g.client?.company_name ?? g.client_name ?? '').toLowerCase()
      return name.includes(q) || client.includes(q)
    })
  }
  return list
})

// Setup token modal
const showSetupModal = ref(false)
const selectedClientId = ref(null)
const clientOptions = ref([])
const clientsLoading = ref(false)
const generatedToken = ref(null)
const generatingToken = ref(false)
const tokenError = ref(null)

async function loadGroups() {
  loading.value = true
  try {
    const res = await telegramService.listGroups({ per_page: 100 })
    groups.value = res.data ?? []
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

async function loadTotalMessages() {
  try {
    const res = await telegramService.listMessages({ per_page: 1 })
    totalMessages.value = res.meta?.total ?? 0
  } catch {
    totalMessages.value = groups.value.length
  }
}

async function loadClients(search = '') {
  clientsLoading.value = true
  try {
    const res = await saleService.listClients({ search, limit: 20 })
    clientOptions.value = (res.data ?? []).map(c => ({
      value: c.id,
      label: c.company_name ?? c.name ?? c.id
    }))
  } catch {
    clientOptions.value = []
  } finally {
    clientsLoading.value = false
  }
}

function onClientSearch(q) {
  loadClients(q)
}

function openSetupModal() {
  showSetupModal.value = true
  generatedToken.value = null
  tokenError.value = null
  selectedClientId.value = null
  loadClients()
}

function closeSetupModal() {
  showSetupModal.value = false
  generatedToken.value = null
  tokenError.value = null
  selectedClientId.value = null
}

async function handleGenerateToken() {
  if (!selectedClientId.value) return
  generatingToken.value = true
  tokenError.value = null
  try {
    generatedToken.value = await telegramService.generateSetupToken(selectedClientId.value)
  } catch (err) {
    tokenError.value = extractErrorMessage(err)
  } finally {
    generatingToken.value = false
  }
}

async function copyToken(text) {
  try {
    await navigator.clipboard.writeText(text)
    success('Copied to clipboard')
  } catch {
    toastError('Failed to copy')
  }
}

onMounted(async () => {
  await loadGroups()
  loadTotalMessages()
})
</script>
