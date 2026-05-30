<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />

      <!-- Panel -->
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 class="text-base font-semibold text-gray-900">New Deal</h2>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ contactId ? 'Add a deal to this contact' : 'Create a new contact and deal' }}
            </p>
          </div>
          <button @click="$emit('close')" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Form body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Contact fields — only shown when no contact_id provided -->
          <template v-if="!contactId">
            <div class="space-y-3">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
              <div class="grid grid-cols-2 gap-3">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Company Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.company_name"
                    type="text"
                    placeholder="e.g. TechCorp Ltd."
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    :class="{ 'border-red-300': errors.company_name }"
                  />
                  <p v-if="errors.company_name" class="mt-1 text-xs text-red-600">{{ errors.company_name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.contact_name"
                    type="text"
                    placeholder="Full name"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    :class="{ 'border-red-300': errors.contact_name }"
                  />
                  <p v-if="errors.contact_name" class="mt-1 text-xs text-red-600">{{ errors.contact_name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="+855 12 345 678"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    :class="{ 'border-red-300': errors.phone }"
                  />
                  <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
                </div>
              </div>
            </div>
          </template>

          <!-- Deal fields -->
          <div class="space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deal</p>
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Deal Title <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="e.g. Q3 Software License"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  :class="{ 'border-red-300': errors.title }"
                />
                <p v-if="errors.title" class="mt-1 text-xs text-red-600">{{ errors.title }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <AppSelect
                  v-model="form.stage"
                  :options="STAGE_OPTIONS"
                  placeholder="Select stage…"
                  search-placeholder="Search stages…"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Deal Value ($)</label>
                <input
                  v-model.number="form.value"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                <input
                  v-model="form.expected_close_date"
                  type="date"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  v-model="form.notes"
                  rows="3"
                  placeholder="Any relevant context about this deal..."
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="saving"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors"
          >
            <span v-if="saving" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Create Deal
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import AppSelect from '@/modules/shared/components/AppSelect.vue'

const STAGE_OPTIONS = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'demo_scheduled', label: 'Demo Scheduled' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiating', label: 'Negotiating' }
]

const props = defineProps({
  contactId: {
    type: [String, Number],
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  company_name: '',
  contact_name: '',
  phone: '',
  title: '',
  stage: 'prospect',
  value: null,
  expected_close_date: '',
  notes: ''
})

const errors = ref({})

function validate() {
  errors.value = {}
  if (!props.contactId) {
    if (!form.value.company_name.trim()) errors.value.company_name = 'Company name is required'
    if (!form.value.contact_name.trim()) errors.value.contact_name = 'Contact name is required'
    if (!form.value.phone.trim()) errors.value.phone = 'Phone is required'
  }
  if (!form.value.title.trim()) errors.value.title = 'Deal title is required'
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return
  const payload = {
    title: form.value.title,
    stage: form.value.stage,
    value: form.value.value || null,
    expected_close_date: form.value.expected_close_date || null,
    notes: form.value.notes || null
  }
  if (props.contactId) {
    payload.contact_id = props.contactId
  } else {
    payload.contact = {
      company_name: form.value.company_name,
      contact_name: form.value.contact_name,
      phone: form.value.phone
    }
  }
  emit('submit', payload)
}
</script>
