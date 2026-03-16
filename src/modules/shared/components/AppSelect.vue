<template>
  <div ref="wrapperRef" class="relative">
    <button
      type="button"
      :disabled="disabled"
      @click="toggle"
      class="w-full flex items-center justify-between gap-2 px-3 py-2.5 border rounded-xl text-sm bg-white transition-colors"
      :class="[
        isOpen
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-gray-300 hover:border-gray-400',
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
      ]"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      <span class="truncate" :class="selectedOption ? 'text-gray-900' : 'text-gray-400'">
        {{ selectedOption?.label ?? placeholder }}
      </span>
      <span class="flex items-center gap-1 flex-shrink-0">
        <button
          v-if="clearable && selectedOption"
          type="button"
          class="p-0.5 text-gray-400 hover:text-gray-600 rounded"
          @click.stop="clear"
          aria-label="Clear selection"
        >
          <XMarkIcon class="w-3.5 h-3.5" />
        </button>
        <ChevronDownIcon
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="isOpen ? 'rotate-180' : ''"
        />
      </span>
    </button>

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
        class="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
        role="listbox"
      >
        <!-- Search input -->
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
              @keydown.enter.prevent="selectFirst"
            />
          </div>
        </div>

        <!-- Option list -->
        <div class="max-h-56 overflow-y-auto py-1">

          <!-- Loading skeletons -->
          <template v-if="loading">
            <div v-for="i in 4" :key="i" class="mx-2 my-1 h-8 bg-gray-100 rounded-lg animate-pulse" />
          </template>

          <template v-else>
            <button
              v-for="option in filteredOptions"
              :key="option.value"
              type="button"
              role="option"
              :aria-selected="modelValue === option.value"
              class="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors"
              :class="modelValue === option.value
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-gray-700 hover:bg-gray-50'"
              @click="select(option.value)"
            >
              <span class="truncate">{{ option.label }}</span>
              <CheckIcon v-if="modelValue === option.value" class="w-4 h-4 flex-shrink-0" />
            </button>

            <!-- Empty state -->
            <div v-if="filteredOptions.length === 0" class="px-3 py-6 text-center">
              <p class="text-sm text-gray-400">
                {{ searchQuery.trim() ? `No results for "${searchQuery}"` : emptyText }}
              </p>
            </div>
          </template>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: String, default: null },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select…' },
  searchPlaceholder: { type: String, default: 'Search…' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  emptyText: { type: String, default: 'No options available' },
  remote: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'search'])

const wrapperRef    = ref(null)
const searchInputRef = ref(null)
const isOpen        = ref(false)
const searchQuery   = ref('')

const selectedOption = computed(() =>
  props.options.find(o => o.value === props.modelValue) ?? null
)

const filteredOptions = computed(() => {
  if (props.remote) return props.options
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

watch(searchQuery, (q) => { if (isOpen.value) emit('search', q.trim()) })

function open() {
  if (props.disabled) return
  isOpen.value = true
  searchQuery.value = ''
  nextTick(() => searchInputRef.value?.focus())
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
}

function toggle() {
  isOpen.value ? close() : open()
}

function select(value) {
  emit('update:modelValue', value)
  close()
}

function clear() {
  emit('update:modelValue', null)
}

function selectFirst() {
  if (filteredOptions.value.length > 0) {
    select(filteredOptions.value[0].value)
  }
}

function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) close()
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>
