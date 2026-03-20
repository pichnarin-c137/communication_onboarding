<template>
  <div class="bg-white rounded-xl border border-gray-200 p-2 sm:p-4">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { useCalendarStore } from '@/modules/shared/store/calendar.js'
import { useEventStore } from '@/modules/shared/store/events.js'
import { all } from 'axios'

const emit = defineEmits(['api-ready'])

const calendarStore = useCalendarStore()
const eventStore = useEventStore()

const calendarRef = ref(null)


const isMonthView = computed(() => calendarStore.currentView === 'dayGridMonth')

function padZero(n) { return String(n).padStart(2, '0') }
function timeFromDate(d) { return `${padZero(d.getHours())}:${padZero(d.getMinutes())}` }

function applySelectedHighlight() {
  document.querySelectorAll('.fc-day-selected').forEach(el => {
    el.classList.remove('fc-day-selected')
  })
  if (calendarStore.selectedDate) {
    const cell = document.querySelector(`.fc-daygrid-day[data-date="${calendarStore.selectedDate}"]`)
    if (cell) cell.classList.add('fc-day-selected')
  }
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: calendarStore.currentView,
  headerToolbar: false,
  editable: false,
  selectable: !isMonthView.value,
  selectMirror: true,
  dayMaxEvents: isMonthView.value ? 3 : false,
  nowIndicator: true,
  scrollTime: '08:00:00',
  height: 'auto',
  eventMinHeight: 30,
  allDaySlot: false,

  moreLinkContent(args) {
    return { html: `<span style="font-size:10px;font-weight:600;color:#6B7280;padding:1px 4px">+${args.num} more</span>` }
  },
  moreLinkClick(info) {
    calendarStore.selectedDate = info.date.toISOString().split('T')[0]
  },

  datesSet() {
    nextTick(() => { applySelectedHighlight() })
  },

  eventClassNames(arg) {
    const event = eventStore.events.find(e => e.id === arg.event.id)
    return event?.classNames || []
  },

  eventContent(arg) {
    const { event, view } = arg
    const ext = event.extendedProps || {}
    const borderColor = event.borderColor || '#9CA3AF'
    const bgColor = event.backgroundColor || '#F3F4F6'

    //  Month view: compact chip
    if (view.type === 'dayGridMonth') {
      const isDemo = ext.type === 'demo'
      const typeColor = isDemo ? '#92400E' : '#1D4ED8'
      const typeBg   = isDemo ? '#FEF3C7' : '#DBEAFE'
      const dot = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${borderColor};flex-shrink:0;margin-top:1px"></span>`
      return {
        html: `<div style="display:flex;align-items:center;gap:4px;padding:1px 5px;border-radius:4px;background:${bgColor};border-left:3px solid ${borderColor};overflow:hidden;width:100%;box-sizing:border-box">
          ${dot}
          <span style="font-size:10px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#111827;flex:1;min-width:0">${ext.clientName}</span>
          <span style="font-size:9px;font-weight:700;padding:0 3px;border-radius:2px;background:${typeBg};color:${typeColor};flex-shrink:0;letter-spacing:.3px">${isDemo ? 'Demo' : 'Training'}</span>
        </div>`
      }
    }

    //  TimeGrid views: card
    if (view.type.startsWith('timeGrid')) {
      const isDemo   = ext.type === 'demo'
      const typeLabel = isDemo ? 'DEMO' : 'TRAINING'
      const typeBg   = isDemo ? '#FEF3C7' : '#DBEAFE'
      const typeColor = isDemo ? '#92400E' : '#1D4ED8'
      const client   = ext.clientName || ''
      const startFmt = event.start
        ? event.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        : ''
      const endFmt = event.end
        ? event.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        : ''
      return {
        html: `<div style="padding:4px 6px;height:100%;overflow:hidden;display:flex;flex-direction:column;gap:2px;border-left:3px solid ${borderColor};background:${bgColor};border-radius:0 4px 4px 0">
          <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
            <span style="font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px;background:${typeBg};color:${typeColor};letter-spacing:.4px;flex-shrink:0">${typeLabel}</span>
            ${startFmt ? `<span style="font-size:9px;color:#6B7280;flex-shrink:0">${startFmt}${endFmt ? ' – ' + endFmt : ''}</span>` : ''}
          </div>
          ${client ? `<div style="font-size:10px;color:#6B7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${client}</div>` : ''}
        </div>`
      }
    }
  },

  dateClick(info) {
    if (info.view.type === 'dayGridMonth') {
      calendarStore.selectedDate = info.dateStr
    } else {
      // timeGrid click — use clicked time slot
      const d = info.date
      const startH = d.getHours()
      const startM = d.getMinutes()
      const endH = (startH + 1) % 24
      eventStore.openCreateModal({
        date:      info.dateStr.split('T')[0],
        startTime: `${padZero(startH)}:${padZero(startM)}`,
        endTime:   `${padZero(endH)}:${padZero(startM)}`
      })
    }
  },

  select(info) {
    // Drag-select on timeGrid — use exact selected range
    eventStore.openCreateModal({
      date:      info.startStr.split('T')[0],
      startTime: timeFromDate(info.start),
      endTime:   timeFromDate(info.end)
    })
  },

  eventClick(info) {
    const event = eventStore.events.find(e => e.id === info.event.id)
    if (event) {
      eventStore.openDetailsModal(event)
    }
  }
}))

watch(() => calendarStore.currentView, (newView) => {
  const api = calendarRef.value?.getApi()
  if (api && api.view.type !== newView) {
    api.changeView(newView)
  }
})

watch(() => calendarStore.selectedDate, () => {
  nextTick(() => { applySelectedHighlight() })
})

watch(() => eventStore.filteredEvents, (events) => {
  nextTick(() => {
    const api = calendarRef.value?.getApi()
    if (!api) return
    api.removeAllEventSources()
    api.addEventSource(events)
  })
})

onMounted(() => {
  nextTick(() => {
    const api = calendarRef.value?.getApi()
    if (api) {
      emit('api-ready', api)
      api.addEventSource(eventStore.filteredEvents)
    }
    applySelectedHighlight()
  })
})

function getApi() {
  return calendarRef.value?.getApi()
}

defineExpose({ getApi })
</script>
