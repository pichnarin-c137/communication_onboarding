<template>
  <div class="max-w-3xl mx-auto space-y-5 mt-3">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button
        @click="router.push('/sales/configurations/telegram-bot')"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronLeftIcon class="w-5 h-5" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-gray-900 truncate">{{ group?.group_name ?? 'Telegram Group' }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ group?.client_name ?? '' }}</p>
      </div>
      <StatusBadge v-if="group?.bot_status" :status="group.bot_status" />
    </div>

    <SkeletonLoader v-if="loading" type="cards" :count="2" />

    <template v-else-if="group">
      <!-- Group info card -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-4">Group Info</h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-xs text-gray-500">Group Name</dt>
            <dd class="font-medium text-gray-900">{{ group.group_name }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">Chat ID</dt>
            <dd class="font-mono text-gray-900 text-xs">{{ group.chat_id ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">Client</dt>
            <dd class="font-medium text-gray-900">{{ group.client_name ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">Status</dt>
            <dd><StatusBadge v-if="group.bot_status" :status="group.bot_status" /></dd>
          </div>
          <div v-if="group.connected_at && group.bot_status === 'connected'">
            <dt class="text-xs text-gray-500">Connected At</dt>
            <dd class="font-medium text-gray-900">{{ formatDateTimeFromISO(group.connected_at) }}</dd>
          </div>
          <div v-if="group.disconnected_at && group.bot_status === 'removed'">
            <dt class="text-xs text-gray-500">Disconnected At</dt>
            <dd class="font-medium text-gray-900">{{ formatDateTimeFromISO(group.disconnected_at) }}</dd>
          </div>
          <div v-if="group.reconnected_at && group.bot_status === 'reconnected'">
            <dt class="text-xs text-gray-500">Reconnected At</dt>
            <dd class="font-medium text-gray-900">{{ formatDateTimeFromISO(group.reconnected_at) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Language settings -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-4">Language</h2>
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Bot Response Language</label>
            <AppSelect
              v-model="selectedLanguage"
              :options="languageOptions"
              placeholder="Select language..."
            />
          </div>
          <button
            @click="handleUpdateLanguage"
            :disabled="savingLanguage || selectedLanguage === group.language"
            class="px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors"
          >
            {{ savingLanguage ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          @click="handleSendTestMessage"
          :disabled="group.bot_status === 'removed' || sendingTest"
          :title="group.bot_status === 'removed' ? 'Group is disconnected' : ''"
          class="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ sendingTest ? 'Sending...' : 'Send Test Message' }}
        </button>
        <button
          v-if="group.bot_status === 'connected' || group.bot_status === 'reconnected'"
          @click="showDisconnectModal = true"
          :disabled="disconnecting"
          class="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ disconnecting ? 'Disconnecting...' : 'Disconnect Group' }}
        </button>
        <button
          v-if="group.bot_status === 'removed'"
          @click="showReconnectModal = true"
          :disabled="disconnecting"
          class="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ disconnecting ? 'Reconnecting...' : 'Reconnect Group' }}
        </button>
      </div>

      <!-- Recent Messages -->
      <!-- <div class="bg-white rounded-xl border border-gray-200 p-5" v-if="group.recent_messages?.length">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Recent Messages</h2>
        <div class="divide-y divide-gray-50">
          <div
            v-for="msg in group.recent_messages.slice(0, 10)"
            :key="msg.id"
            class="py-3 flex items-start justify-between gap-3"
          >
            <div class="flex-1 min-w-0">
              <div class="relative group cursor-default">
                <p class="text-sm text-gray-800">{{ shortContent(msg.content) }}</p>
                <div v-if="msg.content" class="absolute z-50 hidden group-hover:block left-0 top-full mt-1 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl whitespace-pre-wrap break-words leading-relaxed">
                  {{ msg.content }}
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">{{ msg.sent_at ? formatDateTimeFromISO(msg.sent_at) : '' }}</p>
            </div>
            <StatusBadge v-if="msg.status" :status="msg.status" />
          </div>
        </div>
      </div> -->

      <!-- Message History -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-4">Message History</h2>

        <!-- History filters -->
        <div class="flex flex-col sm:flex-row gap-3 mb-4">
          <div class="w-full sm:w-40">
            <AppSelect
              v-model="msgStatusFilter"
              :options="msgStatusOptions"
              placeholder="All Statuses"
              :clearable="true"
            />
          </div>
          <div class="w-full sm:w-44">
            <AppSelect
              v-model="msgTypeFilter"
              :options="msgTypeOptions"
              placeholder="All Types"
              :clearable="true"
            />
          </div>
          <div class="flex gap-2 flex-1">
            <input
              v-model="msgDateFrom"
              type="date"
              class="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              v-model="msgDateTo"
              type="date"
              class="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            @click="loadMessages(1)"
            class="px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            Filter
          </button>
        </div>

        <!-- Messages table -->
        <SkeletonLoader v-if="messagesLoading" type="table" :count="4" />

        <template v-else-if="messages.length > 0">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</th>
                <th class="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th class="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th class="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sent At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="msg in messages" :key="msg.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-3 py-2.5 text-gray-800 max-w-xs">
                  <div class="relative group cursor-default">
                    <span class="block">{{ shortContent(msg.content) }}</span>
                    <div v-if="msg.content" class="absolute z-50 hidden group-hover:block left-0 top-full mt-1 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl whitespace-pre-wrap break-words leading-relaxed">
                      {{ msg.content }}
                    </div>
                  </div>
                </td>
                <td class="px-3 py-2.5 text-gray-500 capitalize">{{ msg.message_type ?? '—' }}</td>
                <td class="px-3 py-2.5">
                  <StatusBadge v-if="msg.status" :status="msg.status" />
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-3 py-2.5 text-gray-500 text-xs">{{ msg.sent_at ? formatDateTimeFromISO(msg.sent_at) : '—' }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p class="text-xs text-gray-500">
              Showing {{ msgMeta.from ?? 1 }}–{{ msgMeta.to ?? messages.length }} of {{ msgMeta.total ?? messages.length }}
            </p>
            <div class="flex gap-2">
              <button
                @click="loadMessages(msgPage - 1)"
                :disabled="msgPage <= 1"
                class="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                @click="loadMessages(msgPage + 1)"
                :disabled="msgPage >= (msgMeta.last_page ?? 1)"
                class="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </template>

        <div v-else class="py-8 text-center text-sm text-gray-400">
          No messages found.
        </div>
      </div>
    </template>

    <!-- Error state -->
    <div v-else-if="!loading" class="text-center py-12">
      <p class="text-sm text-gray-500">Group not found.</p>
    </div>

    <!-- Disconnect Confirm Modal -->
    <ConfirmModal
      :open="showDisconnectModal"
      title="Disconnect Group"
      message="Are you sure you want to disconnect this Telegram group? The bot will stop sending notifications to this group."
      confirm-text="Disconnect"
      type="danger"
      @confirm="handleDisconnect"
      @cancel="showDisconnectModal = false"
    />

    <!-- Reconnect Confirm Modal -->
    <ConfirmModal
      :open="showReconnectModal"
      title="Reconnect Group"
      message="Are you sure you want to reconnect this Telegram group? The bot will resume sending notifications to this group."
      confirm-text="Reconnect"
      type="success"
      @confirm="handleReconnect"
      @cancel="showReconnectModal = false"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { telegramService } from '@/modules/sale/services/telegramService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import { extractErrorMessage } from '@core/services/error.handler'
import StatusBadge from '@/modules/shared/components/StatusBadge.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import AppSelect from '@/modules/shared/components/AppSelect.vue'
import ConfirmModal from '@/modules/shared/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const { success, error: toastError } = useToast()
const { formatDateTimeFromISO } = useDateTime()

const group = ref(null)
const loading = ref(false)

// Language
const selectedLanguage = ref('en')
const savingLanguage = ref(false)

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'km', label: 'ខ្មែរ' }
]

// Actions
const sendingTest = ref(false)
const showDisconnectModal = ref(false)
const showReconnectModal = ref(false)
const disconnecting = ref(false)

// Message history
const messages = ref([])
const messagesLoading = ref(false)
const msgPage = ref(1)
const msgMeta = ref({})
const msgStatusFilter = ref(null)
const msgTypeFilter = ref(null)
const msgDateFrom = ref('')
const msgDateTo = ref('')

const msgStatusOptions = [
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' }
]

const msgTypeOptions = [
  { value: 'appointment_reminder', label: 'Appointment Reminder' },
  { value: 'onboarding_update', label: 'Onboarding Update' },
  { value: 'test', label: 'Test' }
]

function shortContent(content, limit = 40) {
  if (!content) return '—'
  return content.length > limit ? content.slice(0, limit) + '…' : content
}

async function loadGroup() {
  loading.value = true
  try {
    group.value = await telegramService.getGroup(route.params.id)
    selectedLanguage.value = group.value?.language ?? 'en'
  } catch (err) {
    toastError(extractErrorMessage(err))
    group.value = null
  } finally {
    loading.value = false
  }
}

async function loadMessages(page = 1) {
  messagesLoading.value = true
  msgPage.value = page
  try {
    const params = {
      telegram_group_id: route.params.id,
      page,
      per_page: 10
    }
    if (msgStatusFilter.value) params.status = msgStatusFilter.value
    if (msgTypeFilter.value) params.message_type = msgTypeFilter.value
    if (msgDateFrom.value) params.date_from = msgDateFrom.value
    if (msgDateTo.value) params.date_to = msgDateTo.value

    const res = await telegramService.listMessages(params)
    messages.value = res.data ?? []
    msgMeta.value = res.meta ?? {}
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    messagesLoading.value = false
  }
}

async function handleUpdateLanguage() {
  savingLanguage.value = true
  try {
    await telegramService.updateLanguage(route.params.id, selectedLanguage.value)
    group.value.language = selectedLanguage.value
    success('Language updated successfully.')
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    savingLanguage.value = false
  }
}

async function handleSendTestMessage() {
  sendingTest.value = true
  try {
    await telegramService.sendTestMessage(route.params.id)
    success('Test message sent successfully.')
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    sendingTest.value = false
  }
}

async function handleDisconnect() {
  disconnecting.value = true
  try {
    await telegramService.disconnectGroup(route.params.id)
    success('Group disconnected.')
    showDisconnectModal.value = false
    await loadGroup()
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    disconnecting.value = false
  }
}

async function handleReconnect() {
  disconnecting.value = true
  try {
    await telegramService.reconnectGroup(route.params.id)
    success('Group reconnected.')
    showReconnectModal.value = false
    await loadGroup()
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    disconnecting.value = false
  }
}

onMounted(async () => {
  await loadGroup()
  loadMessages(1)
})
</script>
