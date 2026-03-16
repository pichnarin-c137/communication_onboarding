<template>
  <div class="space-y-0 lg:space-y-4 mt-3">
    <div class="flex flex-col lg:flex-row gap-4 min-h-0">
      <!-- Appointment sidebar (month view only) -->
      <div v-if="isMonthView" class="w-full lg:w-60 xl:w-64 flex-shrink-0">
        <AppointmentSidebar />
      </div>

      <!-- Calendar + day list -->
      <div class="flex-1 min-w-0 space-y-1">
        <CalendarToolbar :calendar-api="calendarApi" />
        <CalendarBase @api-ready="onApiReady" />
      </div>
    </div>

    <!-- Modals -->
    <CreateEventModal />
    <EventDetailsModal />

    <div class="h-20 lg:hidden"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventStore } from '@/modules/shared/store/events.js'
import { useCalendarStore } from '@/modules/shared/store/calendar.js'
import CalendarToolbar from '@/modules/shared/components/CalendarToolbar.vue'
import CalendarBase from '@/modules/shared/components/CalendarBase.vue'
import DayEventList from '@/modules/shared/components/DayEventList.vue'
import AppointmentSidebar from '@/modules/shared/components/AppointmentSidebar.vue'
import CreateEventModal from '@/modules/shared/components/CreateEventModal.vue'
import EventDetailsModal from '@/modules/shared/components/EventDetailsModal.vue'

const eventStore = useEventStore()
const calendarStore = useCalendarStore()
const calendarApi = ref(null)

const isMonthView = computed(() => calendarStore.currentView === 'dayGridMonth')

function onApiReady(api) { calendarApi.value = api }

onMounted(async () => {
  await Promise.all([eventStore.loadEvents(), eventStore.loadSidebar()])
})
</script>
