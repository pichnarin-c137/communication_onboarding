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
            <h2 class="text-base font-semibold text-gray-900">
              {{ contact ? 'Edit Contact' : 'New Contact' }}
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ contact ? 'Update contact information' : 'Add a new prospect to your CRM' }}
            </p>
          </div>
          <button @click="$emit('close')" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Form body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Company section -->
          <div class="space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</p>
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
                  :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-200': errors.company_name }"
                />
                <p v-if="errors.company_name" class="mt-1 text-xs text-red-600">{{ errors.company_name }}</p>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Company Name (Khmer)</label>
                <input
                  v-model="form.company_name_kh"
                  type="text"
                  placeholder="ឈ្មោះក្រុមហ៊ុន"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <!-- Contact person section -->
          <div class="space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Person</p>
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2 sm:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.contact_name"
                  type="text"
                  placeholder="e.g. Sokha Chan"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  :class="{ 'border-red-300': errors.contact_name }"
                />
                <p v-if="errors.contact_name" class="mt-1 text-xs text-red-600">{{ errors.contact_name }}</p>
              </div>
              <div class="col-span-2 sm:col-span-1">
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
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="contact@company.com"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <!-- Details section -->
          <div class="space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</p>
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  v-model="form.address"
                  type="text"
                  placeholder="Street, city, province"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <AppSelect
                  v-model="form.source"
                  :options="SOURCE_OPTIONS"
                  clearable
                  placeholder="Select source"
                  search-placeholder="Search sources…"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <AppSelect
                  v-model="form.business_type_id"
                  :options="businessTypeOptions"
                  :loading="loadingTypes"
                  clearable
                  placeholder="Select business type"
                  search-placeholder="Search business types…"
                  empty-text="No business types"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  v-model="form.notes"
                  rows="3"
                  placeholder="Any relevant notes about this contact..."
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
            {{ contact ? 'Save Changes' : 'Create Contact' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import AppSelect from '@/modules/shared/components/AppSelect.vue'
import { businessTypeService } from '@/modules/shared/services/businessTypeService.js'

const SOURCE_OPTIONS = [
  { value: 'referral', label: 'Referral' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'website', label: 'Website' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' }
]

const props = defineProps({
  contact: {
    type: Object,
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
  company_name_kh: '',
  contact_name: '',
  phone: '',
  email: '',
  address: '',
  source: '',
  business_type_id: '',
  notes: ''
})

const errors = ref({})

const businessTypes = ref([])
const loadingTypes = ref(false)

const businessTypeOptions = computed(() =>
  businessTypes.value.map((bt) => ({ value: bt.id, label: bt.name_en }))
)

onMounted(async () => {
  loadingTypes.value = true
  try {
    const res = await businessTypeService.getAll({ per_page: 100 })
    businessTypes.value = res.data || []
  } catch {
    businessTypes.value = []
  } finally {
    loadingTypes.value = false
  }
})

watch(
  () => props.contact,
  (val) => {
    if (val) {
      form.value = {
        company_name: val.company_name || '',
        company_name_kh: val.company_name_kh || '',
        contact_name: val.contact_name || '',
        phone: val.phone || '',
        email: val.email || '',
        address: val.address || '',
        source: val.source || '',
        business_type_id: val.business_type?.id || val.business_type_id || '',
        notes: val.notes || ''
      }
    }
  },
  { immediate: true }
)

function validate() {
  errors.value = {}
  if (!form.value.company_name.trim()) errors.value.company_name = 'Company name is required'
  if (!form.value.contact_name.trim()) errors.value.contact_name = 'Contact name is required'
  if (!form.value.phone.trim()) errors.value.phone = 'Phone is required'
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', {
    ...form.value,
    business_type_id: form.value.business_type_id || null
  })
}
</script>
