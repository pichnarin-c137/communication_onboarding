<template>
  <div
    class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    @click="goToContact"
  >
    <!-- Header: company + won badge -->
    <div class="flex items-start justify-between gap-2 mb-1">
      <p class="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
        {{ deal.title || deal.company_name || 'Untitled Deal' }}
      </p>
      <span
        v-if="deal.stage === 'won'"
        class="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700"
      >
        Won
      </span>
      <span
        v-else-if="deal.demo_completed_at"
        class="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700"
        title="Demo completed"
      >
        <CheckCircleIcon class="w-3 h-3" />
        Demo
      </span>
    </div>

    <!-- Contact name -->
    <p class="text-xs text-gray-500 mb-0.5">{{ deal.contact_name || deal.contact?.name || '—' }}</p>

    <!-- Owner / creator -->
    <p v-if="ownerName" class="flex items-center gap-1 text-[11px] text-gray-400 mb-2.5">
      <UserIcon class="w-3 h-3" />
      {{ ownerName }}
    </p>
    <div v-else class="mb-2.5" />

    <!-- Value + close date row -->
    <div class="flex items-center gap-2 mb-2.5 flex-wrap">
      <span
        v-if="deal.value"
        class="inline-flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md"
      >
        {{ formatValue(deal.value) }}
      </span>
      <span
        v-if="deal.expected_close_date"
        class="inline-flex items-center gap-1 text-xs text-gray-500"
      >
        <CalendarDaysIcon class="w-3 h-3" />
        {{ formatCloseDate(deal.expected_close_date) }}
      </span>
    </div>

    <!-- Age badge -->
    <div class="flex items-center justify-between">
      <span
        :class="[
          'inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full',
          ageSeverity === 'red'
            ? 'bg-red-100 text-red-700'
            : ageSeverity === 'yellow'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-500'
        ]"
      >
        <ClockIcon class="w-3 h-3" />
        {{ ageDays }}d
      </span>

      <!-- Action buttons (stop propagation so card click doesn't fire) -->
      <div v-if="isActive" class="flex items-center gap-1">
        <!-- Move back a stage -->
        <button
          v-if="canRegress"
          @click.stop="$emit('regress', deal)"
          class="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Move back a stage"
        >
          <ArrowLeftIcon class="w-3.5 h-3.5" />
        </button>
        <!-- Advance to the next stage (stops before Won) -->
        <button
          v-if="canAdvance"
          @click.stop="$emit('advance', deal)"
          class="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
          title="Advance stage"
        >
          <ArrowRightIcon class="w-3.5 h-3.5" />
        </button>
        <!-- At negotiating, the next step is winning the deal (creates a COMS client) -->
        <button
          v-if="isFinalStage"
          @click.stop="$emit('mark-won', deal)"
          class="p-1.5 rounded-md text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          title="Mark as won"
        >
          <TrophyIcon class="w-3.5 h-3.5" />
        </button>
        <button
          @click.stop="$emit('mark-lost', deal)"
          class="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Mark as lost"
        >
          <XMarkIcon class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDaysIcon, ClockIcon, ArrowLeftIcon, ArrowRightIcon, TrophyIcon, XMarkIcon, CheckCircleIcon, UserIcon } from '@heroicons/vue/24/outline'

// Active (movable) stages, in order. Won/lost are terminal and not in this list —
// winning goes through the dedicated /won endpoint, not a plain stage advance.
const ACTIVE_STAGES = ['prospect', 'demo_scheduled', 'proposal_sent', 'negotiating']

const props = defineProps({
  deal: {
    type: Object,
    required: true
  }
})

defineEmits(['advance', 'regress', 'mark-won', 'mark-lost'])

const router = useRouter()

const stageIndex = computed(() => ACTIVE_STAGES.indexOf(props.deal.stage))
const isActive = computed(() => stageIndex.value !== -1)
const canRegress = computed(() => stageIndex.value > 0)
const canAdvance = computed(() => isActive.value && stageIndex.value < ACTIVE_STAGES.length - 1)
const isFinalStage = computed(() => props.deal.stage === 'negotiating')

function goToContact() {
  const contactId = props.deal.contact_id || props.deal.contact?.id
  if (contactId) router.push(`/crm/contacts/${contactId}`)
}

// Prefer the assigned owner; fall back to whoever created the deal.
const ownerName = computed(() =>
  props.deal.assigned_to?.name || props.deal.created_by?.name || ''
)

const ageDays = computed(() => {
  if (!props.deal.created_at) return 0
  const created = new Date(props.deal.created_at)
  const now = new Date()
  return Math.floor((now - created) / (1000 * 60 * 60 * 24))
})

const ageSeverity = computed(() => {
  const d = ageDays.value
  if (d > 30) return 'red'
  if (d > 14) return 'yellow'
  return 'normal'
})

function formatValue(val) {
  const n = Number(val)
  if (!n) return ''
  return '$' + n.toLocaleString('en-US')
}

function formatCloseDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
