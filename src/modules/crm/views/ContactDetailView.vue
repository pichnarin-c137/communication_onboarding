<template>
  <div class="space-y-5 mt-3">
    <!-- Back + header -->
    <div class="flex items-center gap-3">
      <button
        @click="$router.back()"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold text-gray-900 truncate">
          {{ contact?.company_name || 'Contact' }}
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ contact?.contact_name }}</p>
      </div>
      <span
        v-if="contact?.status"
        :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', statusClass(contact.status)]"
      >
        {{ formatStatus(contact.status) }}
      </span>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-pulse">
      <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div class="h-4 bg-gray-200 rounded w-1/2" />
        <div class="h-4 bg-gray-200 rounded w-3/4" />
        <div class="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      <div class="lg:col-span-2 space-y-3">
        <div class="h-32 bg-gray-200 rounded-xl" />
        <div class="h-32 bg-gray-200 rounded-xl" />
      </div>
    </div>

    <!-- Two-column layout -->
    <div v-else-if="contact" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Left: Contact info card -->
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Info</p>
            <button
              @click="showEditModal = true"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PencilSquareIcon class="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          <!-- Avatar + names -->
          <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span class="text-primary font-bold text-sm">{{ initials }}</span>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 text-sm truncate">{{ contact.company_name }}</p>
              <p v-if="contact.company_name_kh" class="text-xs text-gray-400 truncate">{{ contact.company_name_kh }}</p>
            </div>
          </div>

          <!-- Detail rows -->
          <dl class="space-y-3">
            <div>
              <dt class="text-xs text-gray-400 mb-0.5">Contact Person</dt>
              <dd class="text-sm font-medium text-gray-800">{{ contact.contact_name || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-400 mb-0.5">Phone</dt>
              <dd class="text-sm text-gray-800">{{ contact.phone || '—' }}</dd>
            </div>
            <div v-if="contact.email">
              <dt class="text-xs text-gray-400 mb-0.5">Email</dt>
              <dd class="text-sm text-gray-800 truncate">{{ contact.email }}</dd>
            </div>
            <div v-if="contact.address">
              <dt class="text-xs text-gray-400 mb-0.5">Address</dt>
              <dd class="text-sm text-gray-800">{{ contact.address }}</dd>
            </div>
            <div v-if="contact.business_type">
              <dt class="text-xs text-gray-400 mb-0.5">Business Type</dt>
              <dd class="text-sm text-gray-800 capitalize">{{ contact.business_type?.name || contact.business_type }}</dd>
            </div>
            <div v-if="contact.source">
              <dt class="text-xs text-gray-400 mb-0.5">Source</dt>
              <dd class="text-sm text-gray-800 capitalize">{{ formatSource(contact.source) }}</dd>
            </div>
            <div v-if="contact.notes" class="pt-2 border-t border-gray-100">
              <dt class="text-xs text-gray-400 mb-1">Notes</dt>
              <dd class="text-sm text-gray-700 leading-relaxed">{{ contact.notes }}</dd>
            </div>
            <div class="pt-2 border-t border-gray-100">
              <dt class="text-xs text-gray-400 mb-0.5">Created by</dt>
              <dd class="text-sm text-gray-700">{{ contact.created_by?.name || '—' }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Right: Deals section -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-base font-semibold text-gray-900">Deals</p>
          <button
            @click="showDealModal = true"
            class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            <PlusIcon class="w-4 h-4" />
            New Deal
          </button>
        </div>

        <!-- Deal loading -->
        <div v-if="loadingDeals" class="space-y-3">
          <div v-for="i in 2" :key="i" class="bg-white rounded-xl border border-gray-200 p-4 animate-pulse space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/3" />
            <div class="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>

        <!-- Empty deals -->
        <div v-else-if="deals.length === 0" class="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <BriefcaseIcon class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p class="text-sm font-medium text-gray-700">No deals yet</p>
          <p class="text-xs text-gray-500 mt-1">Create a deal to start tracking this contact's pipeline stage.</p>
          <button
            @click="showDealModal = true"
            class="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            <PlusIcon class="w-3.5 h-3.5" />
            New Deal
          </button>
        </div>

        <!-- Deal list -->
        <div v-else class="space-y-3">
          <div
            v-for="deal in deals"
            :key="deal.id"
            class="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
          >
            <!-- Deal header -->
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 text-sm">{{ deal.title }}</p>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', stageClass(deal.stage)]">
                    {{ formatStage(deal.stage) }}
                  </span>
                  <span v-if="deal.value" class="text-xs text-gray-500">${{ Number(deal.value).toLocaleString() }}</span>
                  <span v-if="deal.expected_close_date" class="text-xs text-gray-400">
                    Close: {{ formatDate(deal.expected_close_date) }}
                  </span>
                  <span
                    v-if="deal.demo_completed_at"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"
                  >
                    <CheckCircleIcon class="w-3.5 h-3.5" />
                    Demo done {{ formatDate(deal.demo_completed_at) }}
                  </span>
                </div>
              </div>

              <!-- Won sync badge -->
              <div v-if="deal.stage === 'won'" class="shrink-0 text-right">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  <CheckCircleIcon class="w-3.5 h-3.5" />
                  Synced to COMS
                </span>
                <div v-if="deal.client_id || contact.client_id" class="mt-1.5">
                  <RouterLink
                    :to="`/sales/appointments/create?client_id=${deal.client_id || contact.client_id}`"
                    class="text-xs text-primary hover:underline font-medium"
                  >
                    Create Appointment →
                  </RouterLink>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <p v-if="deal.notes" class="text-xs text-gray-600 leading-relaxed">{{ deal.notes }}</p>

            <!-- Ownership -->
            <div class="flex items-center gap-3 text-xs text-gray-400">
              <span v-if="deal.created_by">Created by {{ deal.created_by.name }}</span>
              <span v-if="deal.assigned_to">· Owner {{ deal.assigned_to.name }}</span>
            </div>

            <!-- Action row — only for active deals -->
            <div
              v-if="deal.stage !== 'won' && deal.stage !== 'lost'"
              class="flex items-center gap-2 pt-2 border-t border-gray-100"
            >
              <button
                v-if="nextStage(deal.stage)"
                @click="handleAdvance(deal)"
                :disabled="advancingId === deal.id"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ArrowRightIcon class="w-3.5 h-3.5" />
                Advance
              </button>
              <RouterLink
                :to="scheduleDemoLink(deal)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 border border-violet-200 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
              >
                <CalendarDaysIcon class="w-3.5 h-3.5" />
                Schedule Demo
              </RouterLink>
              <button
                @click="openWonModal(deal)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-300 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <TrophyIcon class="w-3.5 h-3.5" />
                Mark Won
              </button>
              <button
                @click="openLostModal(deal)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <XMarkIcon class="w-3.5 h-3.5" />
                Mark Lost
              </button>
            </div>

            <!-- Lost reason -->
            <div v-if="deal.stage === 'lost' && deal.lost_reason" class="flex items-start gap-2 pt-2 border-t border-gray-100">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Lost</span>
              <p class="text-xs text-gray-500 leading-relaxed">{{ deal.lost_reason }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 404 -->
    <div v-else-if="!loading" class="text-center py-20">
      <p class="text-sm font-medium text-gray-700">Contact not found.</p>
      <RouterLink to="/crm/contacts" class="mt-2 text-xs text-primary hover:underline">Back to Contacts</RouterLink>
    </div>

    <!-- Won modal -->
    <WonDealModal
      v-if="showWonModal && targetDeal"
      :company-name="contact?.company_name"
      :loading="markingWon"
      @close="showWonModal = false"
      @confirm="confirmWon"
    />

    <!-- Lost modal -->
    <Teleport to="body">
      <div v-if="showLostModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showLostModal = false" />
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
          <h2 class="text-base font-semibold text-gray-900">Mark Deal as Lost</h2>
          <p class="text-sm text-gray-600">Provide a reason why this deal was lost (optional).</p>
          <textarea
            v-model="lostReason"
            rows="3"
            placeholder="e.g. Budget constraints, chose competitor..."
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
          <div class="flex items-center justify-end gap-3">
            <button @click="showLostModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
            <button
              @click="confirmLost"
              :disabled="markingLost"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              <span v-if="markingLost" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Mark as Lost
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit contact modal -->
    <ContactFormModal
      v-if="showEditModal && contact"
      :contact="contact"
      :saving="savingContact"
      @close="showEditModal = false"
      @submit="handleUpdateContact"
    />

    <!-- New deal modal -->
    <DealFormModal
      v-if="showDealModal"
      :contact-id="contactId"
      :saving="creatingDeal"
      @close="showDealModal = false"
      @submit="handleCreateDeal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  ArrowLeftIcon, PlusIcon, PencilSquareIcon,
  TrophyIcon, XMarkIcon, ArrowRightIcon,
  CheckCircleIcon, BriefcaseIcon, CalendarDaysIcon
} from '@heroicons/vue/24/outline'
import { crmService } from '@/modules/crm/services/crmService.js'
import { useCrmStore } from '@/modules/crm/store/crm.js'
import { extractErrorMessage } from '@/core/services/error.handler'
import { useToast } from '@/modules/shared/composables/useToast'
import ContactFormModal from '@/modules/crm/components/ContactFormModal.vue'
import DealFormModal from '@/modules/crm/components/DealFormModal.vue'
import WonDealModal from '@/modules/crm/components/WonDealModal.vue'

const route = useRoute()
const crmStore = useCrmStore()
const { success, error: toastError } = useToast()

const contactId = computed(() => route.params.id)
const contact = ref(null)
const deals = ref([])
const loading = ref(false)
const loadingDeals = ref(false)
const showEditModal = ref(false)
const showDealModal = ref(false)
const showWonModal = ref(false)
const showLostModal = ref(false)
const savingContact = ref(false)
const creatingDeal = ref(false)
const markingWon = ref(false)
const markingLost = ref(false)
const advancingId = ref(null)
const targetDeal = ref(null)
const lostReason = ref('')

// Movable stages only — winning goes through the /won endpoint (Mark Won button),
// never a plain stage advance, so 'won' is excluded.
const STAGE_ORDER = ['prospect', 'demo_scheduled', 'proposal_sent', 'negotiating']

const initials = computed(() => {
  const name = contact.value?.company_name || ''
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
})

function statusClass(status) {
  const map = {
    prospect: 'bg-blue-100 text-blue-700',
    deal_active: 'bg-amber-100 text-amber-700',
    won: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-gray-100 text-gray-500'
  }
  return map[status] || 'bg-gray-100 text-gray-500'
}

function formatStatus(s) {
  const map = { prospect: 'Prospect', deal_active: 'Deal Active', won: 'Won', lost: 'Lost' }
  return map[s] || s || '—'
}

function formatSource(source) {
  if (!source) return '—'
  return source.replace(/_/g, ' ')
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function stageClass(stage) {
  const map = {
    prospect: 'bg-blue-100 text-blue-700',
    demo_scheduled: 'bg-violet-100 text-violet-700',
    proposal_sent: 'bg-amber-100 text-amber-700',
    negotiating: 'bg-orange-100 text-orange-700',
    won: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-gray-100 text-gray-500'
  }
  return map[stage] || 'bg-gray-100 text-gray-500'
}

function formatStage(stage) {
  const map = {
    prospect: 'Prospect',
    demo_scheduled: 'Demo Scheduled',
    proposal_sent: 'Proposal Sent',
    negotiating: 'Negotiating',
    won: 'Won',
    lost: 'Lost'
  }
  return map[stage] || stage
}

function nextStage(current) {
  const idx = STAGE_ORDER.indexOf(current)
  if (idx === -1 || idx >= STAGE_ORDER.length - 1) return null
  return STAGE_ORDER[idx + 1]
}

// Book a demo for this prospect — sends crm_contact_id (+ crm_deal_id) to the
// appointment API instead of client_id.
function scheduleDemoLink(deal) {
  const params = new URLSearchParams({
    crm_contact_id: contactId.value,
    crm_deal_id: deal.id,
    crm_contact_name: contact.value?.company_name || ''
  })
  return `/sales/appointments/create?${params.toString()}`
}

async function loadContact() {
  loading.value = true
  try {
    contact.value = await crmService.getContact(contactId.value)
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}

async function loadDeals() {
  loadingDeals.value = true
  try {
    deals.value = await crmService.getContactDeals(contactId.value)
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    loadingDeals.value = false
  }
}

async function handleUpdateContact(data) {
  savingContact.value = true
  try {
    contact.value = await crmService.updateContact(contactId.value, data)
    success('Contact updated')
    showEditModal.value = false
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    savingContact.value = false
  }
}

async function handleCreateDeal(payload) {
  creatingDeal.value = true
  try {
    // Through the store so assigned_to defaults to the current user (scoped board).
    await crmStore.createDeal({ ...payload, contact_id: contactId.value })
    success('Deal created')
    showDealModal.value = false
    await loadDeals()
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    creatingDeal.value = false
  }
}

async function handleAdvance(deal) {
  const next = nextStage(deal.stage)
  if (!next) return
  advancingId.value = deal.id
  try {
    const updated = await crmService.updateDeal(deal.id, { stage: next })
    const idx = deals.value.findIndex(d => d.id === deal.id)
    if (idx !== -1) {
      deals.value[idx] = updated && updated.stage
        ? updated
        : { ...deals.value[idx], stage: next }
    }
    success(`Deal moved to ${formatStage(next)}`)
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    advancingId.value = null
  }
}

function openWonModal(deal) {
  targetDeal.value = deal
  showWonModal.value = true
}

async function confirmWon() {
  if (!targetDeal.value) return
  markingWon.value = true
  try {
    // Returns sync info { deal_id, client_id, ... }, not a full deal — merge the
    // stage into the existing deal so its title/value/notes stay intact.
    const result = await crmService.markDealWon(targetDeal.value.id)
    const idx = deals.value.findIndex(d => d.id === targetDeal.value.id)
    if (idx !== -1) {
      deals.value[idx] = {
        ...deals.value[idx],
        stage: 'won',
        ...(result?.client_id ? { client_id: result.client_id } : {})
      }
    }
    success(`${contact.value?.company_name || 'Company'} synced to COMS!`)
    showWonModal.value = false
    // Refresh contact to get updated status + client_id
    await loadContact()
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    markingWon.value = false
  }
}

function openLostModal(deal) {
  targetDeal.value = deal
  lostReason.value = ''
  showLostModal.value = true
}

async function confirmLost() {
  if (!targetDeal.value) return
  markingLost.value = true
  try {
    await crmService.markDealLost(targetDeal.value.id, lostReason.value)
    const idx = deals.value.findIndex(d => d.id === targetDeal.value.id)
    if (idx !== -1) {
      deals.value[idx] = {
        ...deals.value[idx],
        stage: 'lost',
        lost_reason: lostReason.value || deals.value[idx].lost_reason
      }
    }
    success('Deal marked as lost')
    showLostModal.value = false
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    markingLost.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadContact(), loadDeals()])
})
</script>
