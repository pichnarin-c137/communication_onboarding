<template>
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div v-if="loading" class="p-8 text-center text-gray-400 text-sm">Loading...</div>

    <div v-else-if="!logs.length" class="p-8 text-center text-gray-400 text-sm">No activity logs found.</div>

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="bg-gray-50 border-b border-gray-200">
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
          <th v-if="showUser" class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
          <td class="px-4 py-3">
            <span :class="actionBadgeClass(log.action)" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
              {{ formatAction(log.action) }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-700 max-w-xs truncate">{{ log.description }}</td>
          <td v-if="showUser" class="px-4 py-3 text-gray-600">
            {{ log.user ? `${log.user.first_name || ''} ${log.user.last_name || ''}`.trim() || log.user.username : '—' }}
          </td>
          <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ log.ip_address || '—' }}</td>
          <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  logs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  showUser: { type: Boolean, default: true },
})

function formatAction(action) {
  if (!action) return '—'
  return action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())
}

function actionBadgeClass(action) {
  if (!action) return 'bg-gray-100 text-gray-600'
  const a = action.toUpperCase()
  if (a.includes('DELETE') || a.includes('HARD')) return 'bg-red-100 text-red-700'
  if (a.includes('SUSPEND') || a.includes('BLOCK')) return 'bg-orange-100 text-orange-700'
  if (a.includes('CREATE') || a.includes('RESTORE')) return 'bg-green-100 text-green-700'
  if (a.includes('UPDATE') || a.includes('PATCH') || a.includes('CHANGED')) return 'bg-blue-100 text-blue-700'
  if (a.includes('LOGIN') || a.includes('LOGOUT') || a.includes('PASSWORD')) return 'bg-purple-100 text-purple-700'
  return 'bg-gray-100 text-gray-600'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
