<template>
  <div class="space-y-5 mt-3">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold text-gray-900">Business Types</h1>
        <p class="text-xs text-gray-400 mt-0.5">Manage business type categories for company onboarding</p>
      </div>
      <button @click="openCreate"
        class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
        <PlusIcon class="w-3.5 h-3.5" />
        New Business Type
      </button>
    </div>

    <!-- Error banner -->
    <div v-if="loadError" class="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
      {{ loadError }}
    </div>

    <!-- Table card -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <!-- Loading skeleton -->
      <template v-if="loading">
        <div class="divide-y divide-gray-50">
          <div v-for="n in 5" :key="n" class="flex items-center gap-4 px-5 py-3.5 animate-pulse">
            <div class="w-8 h-8 bg-gray-100 rounded-full shrink-0"></div>
            <div class="flex-1 space-y-1.5">
              <div class="h-3.5 bg-gray-100 rounded w-40"></div>
              <div class="h-2.5 bg-gray-100 rounded w-24"></div>
            </div>
            <div class="flex gap-2">
              <div class="w-14 h-6 bg-gray-100 rounded-lg"></div>
              <div class="w-14 h-6 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <template v-else-if="!businessTypes.length">
        <div class="py-16 text-center">
          <BuildingStorefrontIcon class="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p class="text-sm font-medium text-gray-500">No business types yet</p>
          <p class="text-xs text-gray-400 mt-1">Create your first business type to get started.</p>
          <button @click="openCreate"
            class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
            <PlusIcon class="w-3.5 h-3.5" />
            New Business Type
          </button>
        </div>
      </template>

      <!-- List -->
      <template v-else>
        <div class="divide-y divide-gray-50">
          <div v-for="bt in businessTypes" :key="bt.id"
            class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group">
            <!-- Icon circle -->
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BuildingStorefrontIcon class="w-4 h-4 text-primary" />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ bt.name_en }}</p>
              <p v-if="bt.name_km" class="text-xs text-gray-400 truncate">{{ bt.name_km }}</p>
              <p v-if="bt.description" class="text-xs text-gray-400 truncate mt-0.5">{{ bt.description }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="openEdit(bt)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <PencilIcon class="w-3.5 h-3.5" />
                Edit
              </button>
              <button @click="promptDelete(bt)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
                <TrashIcon class="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="meta.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p class="text-xs text-gray-500">
            Showing {{ meta.from }}–{{ meta.to }} of {{ meta.total }}
          </p>
          <div class="flex items-center gap-1">
            <button @click="changePage(meta.current_page - 1)" :disabled="meta.current_page <= 1"
              class="px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
            <button @click="changePage(meta.current_page + 1)" :disabled="meta.current_page >= meta.last_page"
              class="px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </template>
    </div>

    <!--  Create / Edit Modal  -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click.self="closeModal">
          <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <BuildingStorefrontIcon class="w-4 h-4 text-gray-600" />
                <h3 class="text-sm font-semibold text-gray-900">
                  {{ editTarget ? 'Edit Business Type' : 'New Business Type' }}
                </h3>
              </div>
              <button @click="closeModal" class="p-1 text-gray-400 hover:text-gray-600 rounded">
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
              <div v-if="formError" class="px-3 py-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {{ formError }}
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-700">
                  Name (English) <span class="text-red-500">*</span>
                </label>
                <input v-model="form.name_en" type="text" placeholder="e.g. Sole Proprietorship" :class="['w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
                  errors.name_en ? 'border-red-400 bg-red-50' : 'border-gray-300']" />
                <p v-if="errors.name_en" class="text-xs text-red-500">{{ errors.name_en }}</p>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-700">
                  Name (Khmer) <span class="text-red-500">*</span>
                </label>
                <input v-model="form.name_km" type="text" placeholder="ឧ. អាជីវកម្មឯកបុគ្គល" :class="['w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
                  errors.name_km ? 'border-red-400 bg-red-50' : 'border-gray-300']" />
                <p v-if="errors.name_km" class="text-xs text-red-500">{{ errors.name_km }}</p>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-700">Description</label>
                <textarea v-model="form.description" rows="2" placeholder="Short description (optional)"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none" />
              </div>
            </form>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
              <button @click="closeModal"
                class="px-4 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button @click="handleSubmit" :disabled="saving"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors">
                <ArrowDownTrayIcon class="w-3.5 h-3.5" />
                {{ saving ? 'Saving...' : (editTarget ? 'Update' : 'Create') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!--  Delete Confirm Modal  -->
    <ConfirmModal :open="showDeleteModal" title="Delete Business Type"
      :message="`Are you sure you want to delete '${deleteTarget?.name_en}'? This action cannot be undone.`"
      confirm-text="Delete" type="danger" @confirm="confirmDelete" @cancel="showDeleteModal = false" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline'
import { BuildingStorefrontIcon } from '@heroicons/vue/24/outline'
import { businessTypeService } from '@/modules/shared/services/businessTypeService.js'
import { useToast } from '@/modules/shared/composables/useToast.js'
import { useSettingsStore } from '@/modules/shared/store/settings'
import ConfirmModal from '@/modules/shared/components/ConfirmModal.vue'

const toast = useToast()
const settingsStore = useSettingsStore()

//  State
const loading = ref(false)
const loadError = ref(null)
const businessTypes = ref([])
const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1, from: 0, to: 0 })
const currentPage = ref(1)

// Modal state
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const editTarget = ref(null)
const deleteTarget = ref(null)
const saving = ref(false)
const formError = ref(null)

const form = reactive({ name_en: '', name_km: '', description: '' })
const errors = reactive({ name_en: '', name_km: '' })

//  Data Loading 
async function load(page = 1) {
  loading.value = true
  loadError.value = null
  try {
    const res = await businessTypeService.getAll({ page, per_page: settingsStore.settings?.items_per_page || 15 })
    businessTypes.value = res.data || []
    if (res.meta) meta.value = res.meta
  } catch (err) {
    loadError.value = err?.response?.data?.message || 'Failed to load business types.'
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page < 1 || page > meta.value.last_page) return
  currentPage.value = page
  load(page)
}

//  Form Helpers 
function resetForm() {
  form.name_en = ''
  form.name_km = ''
  form.description = ''
  errors.name_en = ''
  errors.name_km = ''
  formError.value = null
}

function openCreate() {
  editTarget.value = null
  resetForm()
  showFormModal.value = true
}

function openEdit(bt) {
  editTarget.value = bt
  form.name_en = bt.name_en || ''
  form.name_km = bt.name_km || ''
  form.description = bt.description || ''
  errors.name_en = ''
  errors.name_km = ''
  formError.value = null
  showFormModal.value = true
}

function closeModal() {
  showFormModal.value = false
  editTarget.value = null
}

function validate() {
  errors.name_en = ''
  errors.name_km = ''
  let valid = true
  if (!form.name_en.trim()) { errors.name_en = 'English name is required.'; valid = false }
  if (!form.name_km.trim()) { errors.name_km = 'Khmer name is required.'; valid = false }
  return valid
}

async function handleSubmit() {
  if (!validate()) return
  saving.value = true
  formError.value = null

  let saved = false
  try {
    const payload = {
      name_en: form.name_en.trim(),
      name_km: form.name_km.trim(),
      description: form.description.trim() || undefined,
    }
    if (editTarget.value) {
      await businessTypeService.update(editTarget.value.id, payload)
      toast.success('Business type updated.')
    } else {
      await businessTypeService.create(payload)
      toast.success('Business type created.')
    }
    saved = true
    closeModal()
  } catch (err) {
    formError.value = err?.response?.data?.message || 'Failed to save business type.'
  } finally {
    saving.value = false
  }

  if (saved) {
    currentPage.value = 1
    await load(1)
  }
}

//  Delete 
function promptDelete(bt) {
  deleteTarget.value = bt
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  let deleted = false
  try {
    await businessTypeService.remove(deleteTarget.value.id)
    toast.success('Business type deleted.')
    deleted = true
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to delete business type.')
  } finally {
    showDeleteModal.value = false
    deleteTarget.value = null
  }
  if (deleted) {
    currentPage.value = 1
    await load(1)
  }
}

onMounted(async () => {
  if (!settingsStore.settings) await settingsStore.fetchSettings()
  load()
})
</script>
