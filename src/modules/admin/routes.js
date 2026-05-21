export default [
  {
    path: '/admin/users',
    name: 'AdminUserList',
    component: () => import('@/modules/admin/views/UserListView.vue'),
    meta: { layout: 'admin', title: 'User Management', role: 'admin' }
  },
  {
    path: '/admin/users/:id',
    name: 'AdminUserDetail',
    component: () => import('@/modules/admin/views/UserDetailView.vue'),
    meta: { layout: 'admin', title: 'User Detail', role: 'admin' }
  },
  {
    path: '/admin/activity-logs',
    name: 'AdminActivityLogs',
    component: () => import('@/modules/admin/views/ActivityLogView.vue'),
    meta: { layout: 'admin', title: 'Activity Logs', role: 'admin' }
  },
]
