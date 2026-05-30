<template>
  <div class="space-y-5 mt-3">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Contacts</h1>
        <p class="text-sm text-gray-500 mt-0.5">All prospects and clients in your pipeline</p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink
          to="/crm"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ViewColumnsIcon class="w-4 h-4" />
          Pipeline
        </RouterLink>
        <button
          @click="showContactModal = true"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <PlusIcon class="w-4 h-4" />
          New Contact
        </button>
      </div>
    </div>

    <!-- Filters bar -->
    <div class="flex flex-col sm:flex-row gap-3">
      <!-- Search -->
      <div class="relative flex-1 max-w-sm">
        <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          type="text"
          placeholder="Search company or contact..."
          class="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <!-- Status pills -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="setStatusFilter(filter.value)"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            activeStatus === filter.value
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <!-- Loading -->
      <div v-if="loading" class="divide-y divide-gray-100">
        <div v-for="i in 6" :key="i" class="px-4 py-3.5 flex items-center gap-4 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/4" />
          <div class="h-4 bg-gray-200 rounded w-1/5" />
          <div class="h-4 bg-gray-200 rounded w-1/6" />
          <div class="h-4 bg-gray-200 rounded w-1/6" />
          <div class="h-5 bg-gray-200 rounded-full w-16" />
          <div class="h-4 bg-gray-200 rounded w-20 ml-auto" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="crmStore.contacts.length === 0" class="text-center py-16">
        <UsersIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-sm font-semibold text-gray-700">No contacts found</p>
        <p class="text-xs text-gray-500 mt-1">Add your first prospect to start building your pipeline.</p>
        <button
          @click="showContactModal = true"
          class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
        >
          <PlusIcon class="w-4 h-4" />
          New Contact
        </button>
      </div>

      <!-- Data table -->
      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Person</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Source</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Created By</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Created</th>
            <th class="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="contact in crmStore.contacts"
            :key="contact.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="$router.push(`/crm/contacts/${contact.id}`)"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900 truncate max-w-[180px]">{{ contact.company_name || '—' }}</p>
              <p v-if="contact.company_name_kh" class="text-xs text-gray-400 truncate">{{ contact.company_name_kh }}</p>
            </td>
            <td class="px-4 py-3 text-gray-700">{{ contact.contact_name || '—' }}</td>
            <td class="px-4 py-3 text-gray-600 text-xs">{{ contact.phone || '—' }}</td>
            <td class="px-4 py-3 hidden sm:table-cell">
              <span class="text-xs text-gray-500 capitalize">{{ formatSource(contact.source) }}</span>
            </td>
            <td class="px-4 py-3">
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusClass(contact.status)]">
                {{ formatStatus(contact.status) }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600 text-xs hidden lg:table-cell whitespace-nowrap">
              {{ contact.created_by?.name || '—' }}
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell whitespace-nowrap">
              {{ formatDate(contact.created_at) }}
            </td>
            <td class="px-4 py-3">
              <ChevronRightIcon class="w-4 h-4 text-gray-400" />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
        v-if="!loading && crmStore.contactsMeta.last_page > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100"
      >
        <p class="text-xs text-gray-500">
          Showing {{ crmStore.contactsMeta.from }}–{{ crmStore.contactsMeta.to }} of {{ crmStore.contactsMeta.total }}
        </p>
        <div class="flex gap-1.5">
          <button
            @click="goToPage(crmStore.contactsMeta.current_page - 1)"
            :disabled="crmStore.contactsMeta.current_page === 1"
            class="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Prev
          </button>
          <button
            @click="goToPage(crmStore.contactsMeta.current_page + 1)"
            :disabled="crmStore.contactsMeta.current_page === crmStore.contactsMeta.last_page"
            class="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Contact form modal -->
    <ContactFormModal
      v-if="showContactModal"
      :saving="savingContact"
      @close="showContactModal = false"
      @submit="handleCreateContact"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { PlusIcon, MagnifyingGlassIcon, ChevronRightIcon, UsersIcon, ViewColumnsIcon } from '@heroicons/vue/24/outline'
import { useCrmStore } from '@/modules/crm/store/crm.js'
import { extractErrorMessage } from '@/core/services/error.handler'
import { useToast } from '@/modules/shared/composables/useToast'
import ContactFormModal from '@/modules/crm/components/ContactFormModal.vue'

const router = useRouter()
const crmStore = useCrmStore()
const { success, error: toastError } = useToast()

const loading = ref(false)
const showContactModal = ref(false)
const savingContact = ref(false)
const searchQuery = ref('')
const activeStatus = ref('')
let searchTimer = null

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'deal_active', label: 'Deal Active' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' }
]

function statusClass(status) {
  const map = {
    prospect: 'bg-blue-100 text-blue-700',
    deal_active: 'bg-amber-100 text-amber-700',
    won: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-gray-100 text-gray-500'
  }
  return map[status] || 'bg-gray-100 text-gray-500'
}

function formatStatus(status) {
  const map = {
    prospect: 'Prospect',
    deal_active: 'Deal Active',
    won: 'Won',
    lost: 'Lost'
  }
  return map[status] || status || '—'
}

function formatSource(source) {
  if (!source) return '—'
  return source.replace(/_/g, ' ')
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function buildParams(page = 1) {
  const params = { page, per_page: 20 }
  if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
  if (activeStatus.value) params.status = activeStatus.value
  return params
}

async function load(page = 1) {
  loading.value = true
  try {
    await crmStore.fetchContacts(buildParams(page))
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

function setStatusFilter(val) {
  activeStatus.value = val
  load(1)
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => load(1), 300)
}

function goToPage(page) {
  load(page)
}

async function handleCreateContact(data) {
  savingContact.value = true
  try {
    await crmStore.createContact(data)
    success('Contact created')
    showContactModal.value = false
    await load(1)
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    savingContact.value = false
  }
}

onMounted(() => load(1))
</script>
