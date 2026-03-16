<template>
  <div class="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4">
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <!-- Navigation -->
      <div class="flex items-center gap-2">
        <button
          @click="onToday"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Today
        </button>
        <button
          @click="onPrev"
          class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        <button
          @click="onNext"
          class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRightIcon class="w-5 h-5" />
        </button>
        <h2 class="text-base sm:text-lg font-semibold text-gray-900 ml-1">{{ title }}</h2>
      </div>

      <div class="flex items-center gap-2 sm:ml-auto flex-wrap">
        <!-- View buttons -->
        <div class="inline-flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            v-for="v in views"
            :key="v.key"
            @click="onChangeView(v.key)"
            :class="[
              'px-3 py-1.5 text-sm font-medium transition-colors',
              calendarStore.currentView === v.key
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            {{ v.label }}
          </button>
        </div>

        <!-- New appointment button -->
        <button
          @click="eventStore.openCreateModal()"
          class="p-1.5 text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          title="New appointment"
        >
          <PlusIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { useCalendarStore } from '@/modules/shared/store/calendar.js'
import { useEventStore } from '@/modules/shared/store/events.js'

const props = defineProps({
  calendarApi: { type: Object, default: null }
})

const calendarStore = useCalendarStore()
const eventStore = useEventStore()

const title = ref('')

const views = [
  { key: 'dayGridMonth', label: 'Month' },
  { key: 'timeGridWeek', label: 'Week' },
  { key: 'timeGridDay', label: 'Day' }
]

function updateTitle() {
  if (props.calendarApi) {
    title.value = props.calendarApi.view.title
  }
}

function onToday() {
  if (props.calendarApi) {
    props.calendarApi.today()
    updateTitle()
  }
}

function onPrev() {
  if (props.calendarApi) {
    props.calendarApi.prev()
    updateTitle()
  }
}

function onNext() {
  if (props.calendarApi) {
    props.calendarApi.next()
    updateTitle()
  }
}

function onChangeView(viewName) {
  calendarStore.setView(viewName)
  if (props.calendarApi) {
    props.calendarApi.changeView(viewName)
    updateTitle()
  }
}

watch(() => props.calendarApi, (api) => {
  if (api) updateTitle()
}, { immediate: true })
</script>
