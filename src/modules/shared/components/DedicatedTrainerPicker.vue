<template>
  <div ref="wrapperRef" class="relative">
    <!-- Anchor / chip area (div, not button — chips contain their own clickable removers) -->
    <div
      role="combobox"
      tabindex="0"
      :aria-disabled="disabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
      class="w-full flex items-start justify-between gap-2 px-3 py-2 border rounded-xl text-sm bg-white transition-colors focus:outline-none"
      :class="[
        isOpen
          ? 'border-primary ring-2 ring-primary/20'
          : invalid
            ? 'border-red-300'
            : 'border-gray-300 hover:border-gray-400',
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 pointer-events-none' : 'cursor-pointer'
      ]"
    >
      <div class="flex flex-wrap gap-1.5 flex-1 min-w-0 min-h-[26px] items-center">
        <template v-if="selectedTrainers.length > 0">
          <span
            v-for="t in selectedTrainers"
            :key="t.id"
            class="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-md max-w-full"
          >
            <span class="truncate">{{ trainerLabel(t) }}</span>
            <span
              role="button"
              tabindex="0"
              class="p-0.5 hover:bg-primary/20 rounded transition-colors cursor-pointer flex-shrink-0"
              :aria-label="`Remove ${trainerLabel(t)}`"
              @click.stop="removeId(t.id)"
              @keydown.enter.stop.prevent="removeId(t.id)"
              @keydown.space.stop.prevent="removeId(t.id)"
            >
              <XMarkIcon class="w-3 h-3" />
            </span>
          </span>
        </template>
        <span v-else class="text-gray-400">{{ placeholder }}</span>
      </div>
      <ChevronDownIcon
        class="w-4 h-4 text-gray-400 transition-transform duration-200 mt-1 flex-shrink-0"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </div>

    <!-- Helper / error line -->
    <p v-if="hint" class="mt-1 text-xs" :class="invalid ? 'text-red-600' : 'text-gray-500'">
      {{ hint }}
    </p>

    <!-- Dropdown (teleported so it escapes modal overflow clipping) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 scale-95 translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-1"
      >
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="fixed z-[110] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          :style="dropdownStyle"
          role="listbox"
        >
        <div class="p-2 border-b border-gray-100">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              @keydown.escape.prevent="close"
            />
          </div>
        </div>

        <div class="max-h-72 overflow-y-auto py-1">
          <template v-if="loading">
            <div v-for="i in 4" :key="i" class="mx-2 my-1 h-9 bg-gray-100 rounded-lg animate-pulse" />
          </template>

          <template v-else>
            <button
              v-for="t in filteredOptions"
              :key="t.id"
              type="button"
              role="option"
              :aria-selected="isSelected(t.id)"
              :disabled="isOptionDisabled(t)"
              class="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors"
              :class="optionClass(t)"
              @click="toggleId(t.id, t)"
            >
              <span class="flex items-center gap-2 min-w-0">
                <span class="truncate">{{ trainerLabel(t) }}</span>
                <span
                  v-if="t.is_suspended"
                  class="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-medium rounded uppercase tracking-wider"
                >
                  Suspended
                </span>
              </span>
              <CheckIcon v-if="isSelected(t.id)" class="w-4 h-4 flex-shrink-0 text-primary" />
            </button>

            <div v-if="filteredOptions.length === 0" class="px-3 py-6 text-center">
              <p class="text-sm text-gray-400">
                {{ searchQuery.trim() ? `No results for "${searchQuery}"` : emptyText }}
              </p>
            </div>
          </template>
        </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline'
import { saleService } from '@/modules/sale/services/saleService.js'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select dedicated trainers…' },
  searchPlaceholder: { type: String, default: 'Search by name…' },
  emptyText: { type: String, default: 'No trainers available' },
  disabled: { type: Boolean, default: false },
  min: { type: Number, default: 1 },
  invalid: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  // Optional preloaded trainer objects to seed the chip display
  // (when parent already has these — e.g., on Edit Roster).
  initialTrainers: { type: Array, default: () => [] },
  // Trainer IDs to flag as having a workload violation (server-returned).
  flaggedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'change'])

const wrapperRef = ref(null)
const searchInputRef = ref(null)
const dropdownRef = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')
const loading = ref(false)
const options = ref([])
// id → trainer object — used so chips render for ids whose objects aren't in the
// current search-filtered options list anymore.
const knownTrainers = ref(new Map())
const dropdownStyle = ref({ top: '0px', left: '0px', width: '0px' })

let searchTimer = null

watch(
  () => props.initialTrainers,
  (list) => {
    if (Array.isArray(list)) {
      list.forEach((t) => {
        const id = t.id || t.trainer_user_id
        if (id) knownTrainers.value.set(id, normalizeTrainer(t))
      })
    }
  },
  { immediate: true, deep: true },
)

const selectedIds = computed(() => props.modelValue || [])

const selectedTrainers = computed(() =>
  selectedIds.value.map((id) => knownTrainers.value.get(id) || { id, first_name: '', last_name: '', _stub: true }),
)

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return options.value
  return options.value.filter((t) => trainerLabel(t).toLowerCase().includes(q))
})

function normalizeTrainer(t) {
  return {
    id: t.id || t.trainer_user_id,
    first_name: t.first_name || '',
    last_name: t.last_name || '',
    full_name: t.full_name || `${t.first_name || ''} ${t.last_name || ''}`.trim(),
    is_suspended: !!t.is_suspended,
    is_deleted: !!t.is_deleted,
  }
}

function trainerLabel(t) {
  if (!t) return ''
  if (t.full_name) return t.full_name
  const n = `${t.first_name || ''} ${t.last_name || ''}`.trim()
  return n || (t.id ? t.id.slice(0, 8) : 'Unknown')
}

function isSelected(id) {
  return selectedIds.value.includes(id)
}

function isOptionDisabled(t) {
  return !!t.is_suspended || !!t.is_deleted
}

function optionClass(t) {
  if (isOptionDisabled(t) && !isSelected(t.id)) {
    return 'text-gray-400 cursor-not-allowed bg-gray-50/50'
  }
  if (props.flaggedIds.includes(t.id)) {
    return 'bg-red-50 text-red-700 hover:bg-red-100'
  }
  if (isSelected(t.id)) {
    return 'bg-primary/10 text-primary font-medium'
  }
  return 'text-gray-700 hover:bg-gray-50'
}

function toggleId(id, t) {
  if (!isSelected(id) && isOptionDisabled(t)) return
  if (t) knownTrainers.value.set(id, normalizeTrainer(t))
  const next = isSelected(id)
    ? selectedIds.value.filter((x) => x !== id)
    : [...selectedIds.value, id]
  emit('update:modelValue', next)
  emit('change', next)
}

function removeId(id) {
  const next = selectedIds.value.filter((x) => x !== id)
  emit('update:modelValue', next)
  emit('change', next)
}

async function loadOptions(query = '') {
  loading.value = true
  try {
    const res = await saleService.listTrainers({ search: query, limit: 30 })
    const list = res?.data || res || []
    options.value = list.map(normalizeTrainer)
    options.value.forEach((t) => knownTrainers.value.set(t.id, t))
  } catch {
    options.value = []
  } finally {
    loading.value = false
  }
}

watch(searchQuery, (q) => {
  if (!isOpen.value) return
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadOptions(q.trim()), 300)
})

function updateDropdownPosition() {
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const PANEL_MAX_H = 360 // search bar + max-h-72 options
  const GAP = 6
  const spaceBelow = window.innerHeight - rect.bottom
  const placeAbove = spaceBelow < PANEL_MAX_H && rect.top > spaceBelow
  const top = placeAbove
    ? Math.max(8, rect.top - GAP - PANEL_MAX_H)
    : rect.bottom + GAP
  dropdownStyle.value = {
    top: `${top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  searchQuery.value = ''
  loadOptions('')
  nextTick(() => {
    updateDropdownPosition()
    searchInputRef.value?.focus()
  })
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
}

function toggle() {
  isOpen.value ? close() : open()
}

function onClickOutside(e) {
  if (!isOpen.value) return
  const inWrapper = wrapperRef.value && wrapperRef.value.contains(e.target)
  const inDropdown = dropdownRef.value && dropdownRef.value.contains(e.target)
  if (!inWrapper && !inDropdown) close()
}

function onScrollOrResize() {
  if (isOpen.value) updateDropdownPosition()
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  window.addEventListener('resize', onScrollOrResize)
  window.addEventListener('scroll', onScrollOrResize, true)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('resize', onScrollOrResize)
  window.removeEventListener('scroll', onScrollOrResize, true)
  clearTimeout(searchTimer)
})
</script>
