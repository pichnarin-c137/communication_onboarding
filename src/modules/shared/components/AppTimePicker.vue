<template>
  <div ref="wrapperRef" class="relative">

    <button
      type="button"
      :disabled="disabled"
      @click="toggle"
      class="w-full flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm bg-white transition-colors"
      :class="[
        isOpen
          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
          : 'border-gray-300 hover:border-gray-400',
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
      ]"
    >
      <ClockIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
      <span class="flex-1 text-left mt-0.5" :class="selectedHour !== null ? 'text-gray-900' : 'text-gray-400'">
        {{ displayValue }}
      </span>
      <ChevronDownIcon
        class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

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
          :style="dropdownStyle"
          class="z-[9999] w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
        >
          <!-- Column header -->
          <div class="flex divide-x divide-gray-100 border-b border-gray-100 bg-gray-50">
            <span class="flex-1 py-1.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Hr</span>
            <span class="flex-1 py-1.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Min</span>
            <span class="w-14 py-1.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide">AM/PM</span>
          </div>

          <!-- Scrollable columns -->
          <div class="flex divide-x divide-gray-100">

            <!-- Hours 1–12 -->
            <div ref="hourListRef" class="flex-1 overflow-y-auto max-h-48 py-1">
              <button
                v-for="h in HOURS"
                :key="h"
                type="button"
                @click="setHour(h)"
                class="w-full py-1.5 text-sm text-center transition-colors"
                :class="selectedHour === h
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'"
              >
                {{ String(h).padStart(2, '0') }}
              </button>
            </div>

            <!-- Minutes 00–59 -->
            <div ref="minuteListRef" class="flex-1 overflow-y-auto max-h-48 py-1">
              <button
                v-for="m in MINUTES"
                :key="m"
                type="button"
                @click="setMinute(m)"
                class="w-full py-1.5 text-sm text-center transition-colors"
                :class="selectedMinute === m
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'"
              >
                {{ String(m).padStart(2, '0') }}
              </button>
            </div>

            <!-- AM / PM -->
            <div class="w-14 py-1 flex flex-col">
              <button
                v-for="p in PERIODS"
                :key="p"
                type="button"
                @click="setPeriod(p)"
                class="w-full py-1.5 text-sm text-center transition-colors"
                :class="period === p
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'"
              >
                {{ p }}
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ClockIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

const HOURS   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTES = Array.from({ length: 60 }, (_, i) => i)
const PERIODS = ['AM', 'PM']

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Select time…' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const wrapperRef    = ref(null)
const dropdownRef   = ref(null)
const hourListRef   = ref(null)
const minuteListRef = ref(null)
const isOpen        = ref(false)
const dropdownStyle = ref({})

const selectedHour   = ref(null)
const selectedMinute = ref(0)
const period = ref('AM')

function parseValue(val) {
  if (!val) return { h: null, m: 0, p: 'AM' }
  const [hStr, mStr] = val.split(':')
  const h24 = parseInt(hStr, 10)
  const m   = parseInt(mStr, 10)
  if (isNaN(h24)) return { h: null, m: 0, p: 'AM' }
  return {
    h: h24 % 12 || 12,
    m: isNaN(m) ? 0 : m,
    p: h24 >= 12 ? 'PM' : 'AM'
  }
}

function to24h(h12, m, p) {
  let h24 = h12
  if (p === 'AM' && h12 === 12) h24 = 0
  else if (p === 'PM' && h12 !== 12) h24 = h12 + 12
  return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const init = parseValue(props.modelValue)
selectedHour.value   = init.h
selectedMinute.value = init.m
period.value         = init.p

watch(() => props.modelValue, (val) => {
  const { h, m, p } = parseValue(val)
  selectedHour.value   = h
  selectedMinute.value = m
  period.value         = p
})

const displayValue = computed(() => {
  if (selectedHour.value === null) return props.placeholder
  const h = String(selectedHour.value).padStart(2, '0')
  const m = String(selectedMinute.value).padStart(2, '0')
  return `${h}:${m} ${period.value}`
})

function emitValue() {
  if (selectedHour.value === null) return
  emit('update:modelValue', to24h(selectedHour.value, selectedMinute.value, period.value))
}

function setHour(h)   { selectedHour.value   = h; emitValue() }
function setMinute(m) { selectedMinute.value = m; emitValue() }
function setPeriod(p) { period.value = p; emitValue() }

function updatePosition() {
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const dropH = 220
  const spaceBelow = window.innerHeight - rect.bottom
  const above = spaceBelow < dropH && rect.top > dropH
  dropdownStyle.value = {
    position: 'fixed',
    left: rect.left + 'px',
    width: rect.width + 'px',
    ...(above
      ? { bottom: (window.innerHeight - rect.top) + 'px', top: 'auto' }
      : { top: (rect.bottom + 6) + 'px', bottom: 'auto' })
  }
}

function scrollToSelected() {
  nextTick(() => {
    updatePosition()
    const scrollList = (el, val, list) => {
      if (!el) return
      const idx = list.indexOf(val)
      if (idx < 0) return
      const btns = el.querySelectorAll('button')
      btns[idx]?.scrollIntoView({ block: 'nearest' })
    }
    scrollList(hourListRef.value,   selectedHour.value,   HOURS)
    scrollList(minuteListRef.value, selectedMinute.value, MINUTES)
  })
}

function open() {
  if (props.disabled) return
  if (selectedHour.value === null) {
    selectedHour.value   = 9
    selectedMinute.value = 0
    period.value         = 'AM'
    emitValue()
  }
  updatePosition()
  isOpen.value = true
  scrollToSelected()
}

function close() { isOpen.value = false }
function toggle() { isOpen.value ? close() : open() }

function onScrollOrResize() {
  if (isOpen.value) updatePosition()
}

function onClickOutside(e) {
  const inWrapper  = wrapperRef.value?.contains(e.target)
  const inDropdown = dropdownRef.value?.contains(e.target)
  if (!inWrapper && !inDropdown) close()
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  window.addEventListener('scroll', onScrollOrResize, true)
  window.addEventListener('resize', onScrollOrResize)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
})
</script>
