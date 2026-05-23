<template>
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <button
        v-if="rows.length"
        type="button"
        @click="exportCsv"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <ArrowDownTrayIcon class="w-3.5 h-3.5" />
        Export CSV
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading && !rows.length" class="p-5">
      <SkeletonLoader type="list" :count="5" />
    </div>

    <!-- Empty -->
    <div v-else-if="!rows.length" class="px-5 py-12 text-center">
      <p class="text-sm font-medium text-gray-900">{{ emptyTitle }}</p>
      <p class="text-xs text-gray-500 mt-1">{{ emptyDescription }}</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50/60">
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap',
                col.align === 'right' ? 'text-right' : 'text-left',
                col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : '',
              ]"
              @click="col.sortable && onSort(col.key)"
            >
              <span class="inline-flex items-center gap-1" :class="col.align === 'right' ? 'flex-row-reverse' : ''">
                {{ col.label }}
                <ChevronUpDownIcon
                  v-if="col.sortable && sort !== col.key"
                  class="w-3.5 h-3.5 text-gray-300"
                />
                <ChevronUpIcon
                  v-else-if="col.sortable && order === 'asc'"
                  class="w-3.5 h-3.5 text-primary"
                />
                <ChevronDownIcon
                  v-else-if="col.sortable"
                  class="w-3.5 h-3.5 text-primary"
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, ri) in rows"
            :key="rowKey(row, ri)"
            :class="[
              'border-b border-gray-50 last:border-0 transition-colors',
              clickable ? 'cursor-pointer hover:bg-gray-50' : '',
            ]"
            @click="clickable && $emit('row-click', row)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-3 whitespace-nowrap',
                col.align === 'right' ? 'text-right tabular-nums' : 'text-left',
              ]"
            >
              <!-- Name cell with avatar + rank -->
              <div v-if="col.type === 'name'" class="flex items-center gap-2.5">
                <span class="text-xs text-gray-400 w-4 tabular-nums">{{ ri + 1 + offset }}</span>
                <Avatar :name="String(row[col.key] || '')" :src="row.avatar_url || ''" size="sm" />
                <span class="font-medium text-gray-900 truncate max-w-[180px]">
                  {{ row[col.key] || '—' }}
                </span>
              </div>

              <!-- Sparkline cell -->
              <Sparkline
                v-else-if="col.type === 'sparkline'"
                :points="row[col.key] || []"
                :color="col.color || '#2563EB'"
              />

              <!-- Rating cell with star tint -->
              <span
                v-else-if="col.format === 'rating'"
                class="font-medium"
                :class="ratingClass(row[col.key])"
              >
                {{ formatCell(row[col.key], col.format) }}
              </span>

              <!-- Default value cell -->
              <span v-else :class="col.type === 'name' ? '' : 'text-gray-700'">
                {{ formatCell(row[col.key], col.format) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="meta && meta.last_page > 1"
      class="flex items-center justify-between px-5 py-3 border-t border-gray-100"
    >
      <p class="text-xs text-gray-500">
        {{ meta.from }}–{{ meta.to }} of {{ meta.total }}
      </p>
      <div class="flex gap-1">
        <button
          v-for="p in meta.last_page"
          :key="p"
          type="button"
          @click="$emit('page-change', p)"
          :class="[
            'w-7 h-7 text-xs rounded-lg transition-colors',
            p === meta.current_page
              ? 'bg-primary text-white font-medium'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
        >{{ p }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowDownTrayIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/vue/20/solid'
import Avatar from '@/modules/shared/components/Avatar.vue'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'
import Sparkline from './Sparkline.vue'
import { computed } from 'vue'
import { downloadCSV } from '@/modules/shared/composables/useCSVExport.js'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  // [{ key, label, type?: 'name'|'sparkline', format?: 'number'|'percent'|'rating'|'duration'|'text', sortable?, align?, color? }]
  columns: { type: Array, required: true },
  idKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  sort: { type: String, default: '' },
  order: { type: String, default: 'desc' },
  meta: { type: Object, default: null },
  clickable: { type: Boolean, default: false },
  emptyTitle: { type: String, default: 'No results' },
  emptyDescription: { type: String, default: 'Try widening the date range or clearing filters.' },
  exportFilename: { type: String, default: 'leaderboard.csv' },
})

const emit = defineEmits(['sort-change', 'row-click', 'page-change'])

const offset = computed(() =>
  props.meta ? ((props.meta.current_page || 1) - 1) * (props.meta.per_page || 0) : 0,
)

function rowKey(row, i) {
  return row[props.idKey] ?? i
}

function onSort(key) {
  const order = props.sort === key && props.order === 'desc' ? 'asc' : 'desc'
  emit('sort-change', { sort: key, order })
}

function formatCell(v, format) {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  switch (format) {
    case 'percent':
      return Number.isNaN(n) ? '—' : `${(n * 100).toFixed(1)}%`
    case 'rating':
      return Number.isNaN(n) ? '—' : n.toFixed(2)
    case 'duration':
      if (Number.isNaN(n)) return '—'
      if (n < 1) return `${Math.round(n * 60)}m`
      if (n < 48) return `${n.toFixed(1)}h`
      return `${(n / 24).toFixed(1)}d`
    case 'text':
      return String(v)
    case 'number':
    default:
      return Number.isNaN(n) ? String(v) : n.toLocaleString()
  }
}

function ratingClass(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return 'text-gray-400'
  if (n >= 4.5) return 'text-emerald-600'
  if (n >= 3.5) return 'text-amber-600'
  return 'text-rose-600'
}

function exportCsv() {
  const exportCols = props.columns.filter((c) => c.type !== 'sparkline')
  const header = exportCols.map((c) => c.label)
  const body = props.rows.map((row) =>
    exportCols.map((c) => {
      const raw = row[c.key]
      // Export raw numeric where sensible so the CSV is analysis-friendly.
      if (c.format === 'percent' && typeof raw === 'number') return raw
      return raw ?? ''
    }),
  )
  downloadCSV([header, ...body], props.exportFilename)
}
</script>
