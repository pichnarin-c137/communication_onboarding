<template>
  <div class="space-y-5 mt-3">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">CRM Pipeline</h1>
        <p class="text-sm text-gray-500 mt-0.5">Track deals from prospect to close</p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink
          to="/crm/contacts"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <UsersIcon class="w-4 h-4" />
          Contacts
        </RouterLink>
        <button
          @click="showDealModal = true"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <PlusIcon class="w-4 h-4" />
          New Deal
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="i in 4"
        :key="i"
        class="flex-1 min-w-64 bg-gray-100 rounded-xl p-3 space-y-2 animate-pulse"
      >
        <div class="h-4 bg-gray-200 rounded w-3/4" />
        <div class="h-20 bg-gray-200 rounded" />
        <div class="h-20 bg-gray-200 rounded" />
      </div>
    </div>

    <!-- Kanban board -->
    <div v-else class="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      <div
        v-for="col in kanbanColumns"
        :key="col.stage"
        class="flex-1 min-w-64 flex flex-col gap-2"
      >
        <!-- Column header -->
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-700">{{ col.label }}</span>
            <span class="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-gray-200 text-gray-600 rounded-full">
              {{ dealsForStage(col.stage).length }}
            </span>
          </div>
          <span class="text-xs text-gray-400">{{ stageTotalValue(col.stage) }}</span>
        </div>

        <!-- Column body -->
        <div class="bg-gray-50 rounded-xl p-2 space-y-2 min-h-40">
          <DealCard
            v-for="deal in dealsForStage(col.stage)"
            :key="deal.id"
            :deal="deal"
            @advance="handleAdvance"
            @regress="handleRegress"
            @mark-won="handleWon"
            @mark-lost="handleLost"
          />
          <p
            v-if="dealsForStage(col.stage).length === 0"
            class="text-xs text-gray-400 text-center py-4"
          >
            No deals
          </p>
        </div>
      </div>
    </div>

    <!-- Won / Lost summary row -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
          <TrophyIcon class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-0.5">Won</p>
          <p class="text-xl font-bold text-gray-900 leading-none">{{ dealsForStage('won').length }}</p>
          <p class="text-xs text-emerald-600 mt-1">{{ stageTotalValue('won') }} total</p>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
          <XCircleIcon class="w-5 h-5 text-red-500" />
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-0.5">Lost</p>
          <p class="text-xl font-bold text-gray-900 leading-none">{{ dealsForStage('lost').length }}</p>
          <p class="text-xs text-red-500 mt-1">{{ stageTotalValue('lost') }} total</p>
        </div>
      </div>
    </div>

    <!-- Mark Lost modal -->
    <Teleport to="body">
      <div v-if="showLostModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showLostModal = false" />
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
          <h2 class="text-base font-semibold text-gray-900">Mark Deal as Lost</h2>
          <p class="text-sm text-gray-600">
            Provide a reason why this deal was lost (optional).
          </p>
          <textarea
            v-model="lostReason"
            rows="3"
            placeholder="e.g. Budget constraints, chose competitor..."
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
          <div class="flex items-center justify-end gap-3">
            <button
              @click="showLostModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
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

    <!-- Mark Won modal -->
    <WonDealModal
      v-if="showWonModal && targetDeal"
      :company-name="targetDeal.contact_name || targetDeal.contact?.name || targetDeal.title"
      :loading="markingWon"
      @close="showWonModal = false"
      @confirm="confirmWon"
    />

    <!-- New Deal modal -->
    <DealFormModal
      v-if="showDealModal"
      :saving="creatingDeal"
      @close="showDealModal = false"
      @submit="handleCreateDeal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { PlusIcon, UsersIcon, TrophyIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { useCrmStore } from '@/modules/crm/store/crm.js'
import { extractErrorMessage } from '@/core/services/error.handler'
import { useToast } from '@/modules/shared/composables/useToast'
import DealCard from '@/modules/crm/components/DealCard.vue'
import DealFormModal from '@/modules/crm/components/DealFormModal.vue'
import WonDealModal from '@/modules/crm/components/WonDealModal.vue'

const crmStore = useCrmStore()
const { success, error: toastError } = useToast()

const loading = ref(false)
const showDealModal = ref(false)
const creatingDeal = ref(false)
const showLostModal = ref(false)
const markingLost = ref(false)
const lostReason = ref('')
const targetDeal = ref(null)
const showWonModal = ref(false)
const markingWon = ref(false)

const kanbanColumns = [
  { stage: 'prospect', label: 'Prospect' },
  { stage: 'demo_scheduled', label: 'Demo Scheduled' },
  { stage: 'proposal_sent', label: 'Proposal Sent' },
  { stage: 'negotiating', label: 'Negotiating' }
]

// Movable stages only. Winning a deal is NOT a plain stage advance — it goes through
// the /won endpoint (creates a COMS client), so 'won' is intentionally excluded here.
const ACTIVE_STAGES = ['prospect', 'demo_scheduled', 'proposal_sent', 'negotiating']

function dealsForStage(stage) {
  return crmStore.deals.filter(d => d.stage === stage)
}

function stageTotalValue(stage) {
  const total = dealsForStage(stage).reduce((sum, d) => sum + (Number(d.value) || 0), 0)
  if (!total) return '$0'
  return '$' + total.toLocaleString('en-US')
}

function stepStage(current, dir) {
  const idx = ACTIVE_STAGES.indexOf(current)
  if (idx === -1) return null
  const next = idx + dir
  if (next < 0 || next >= ACTIVE_STAGES.length) return null
  return ACTIVE_STAGES[next]
}

async function moveStage(deal, dir) {
  const target = stepStage(deal.stage, dir)
  if (!target) return
  try {
    await crmStore.updateDeal(deal.id, { stage: target })
    success(`Deal moved to ${target.replace(/_/g, ' ')}`)
  } catch (err) {
    toastError(extractErrorMessage(err))
  }
}

function handleAdvance(deal) {
  moveStage(deal, 1)
}

function handleRegress(deal) {
  moveStage(deal, -1)
}

function handleWon(deal) {
  targetDeal.value = deal
  showWonModal.value = true
}

async function confirmWon() {
  if (!targetDeal.value) return
  markingWon.value = true
  try {
    await crmStore.markWon(targetDeal.value.id)
    success('Deal won — client synced to COMS!')
    showWonModal.value = false
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    markingWon.value = false
  }
}

function handleLost(deal) {
  targetDeal.value = deal
  lostReason.value = ''
  showLostModal.value = true
}

async function confirmLost() {
  if (!targetDeal.value) return
  markingLost.value = true
  try {
    await crmStore.markLost(targetDeal.value.id, lostReason.value)
    success('Deal marked as lost')
    showLostModal.value = false
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    markingLost.value = false
  }
}

async function handleCreateDeal(payload) {
  creatingDeal.value = true
  try {
    const { contact, ...dealData } = payload
    // If the modal supplied an inline contact, create it first, then the deal.
    if (contact) {
      const newContact = await crmStore.createContact(contact)
      const contactId = newContact?.id
      if (!contactId) throw new Error('Could not create the contact for this deal')
      await crmStore.createDeal({ ...dealData, contact_id: contactId })
    } else {
      await crmStore.createDeal(dealData)
    }
    success('Deal created')
    showDealModal.value = false
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    creatingDeal.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await crmStore.fetchDeals({ per_page: 100 })
  } finally {
    loading.value = false
  }
})
</script>
