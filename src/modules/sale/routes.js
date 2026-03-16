export default [
  {
    path: '/sales',
    name: 'SalesDashboard',
    component: () => import('@/modules/sale/views/DashboardView.vue'),
    meta: { layout: 'sales', title: 'Dashboard', role: 'sale' }
  },
  {
    path: '/sales/appointments',
    name: 'AppointmentList',
    component: () => import('@/modules/sale/views/AppointmentListView.vue'),
    meta: { layout: 'sales', title: 'Appointments', role: 'sale' }
  },
  {
    path: '/sales/appointments/create',
    name: 'CreateAppointment',
    component: () => import('@/modules/sale/views/CreateAppointmentView.vue'),
    meta: { layout: 'sales', title: 'Create Appointment', role: 'sale' }
  },
  {
    path: '/sales/appointments/:id',
    name: 'AppointmentDetail',
    component: () => import('@/modules/sale/views/AppointmentDetailView.vue'),
    meta: { layout: 'sales', title: 'Appointment Detail', role: 'sale' }
  },
  {
    path: '/sales/onboarding',
    name: 'OnboardingList',
    component: () => import('@/modules/sale/views/OnboardingListView.vue'),
    meta: { layout: 'sales', title: 'Onboarding', role: 'sale' }
  },
  {
    path: '/sales/onboarding/:id',
    name: 'OnboardingDetail',
    component: () => import('@/modules/sale/views/OnboardingDetailView.vue'),
    meta: { layout: 'sales', title: 'Onboarding Detail', role: 'sale' }
  },
  {
    path: '/sales/calendar',
    name: 'SalesCalendar',
    component: () => import('@/modules/sale/views/CalendarView.vue'),
    meta: { layout: 'sales', title: 'Calendar', role: 'sale', fullWidth: true }
  },
  {
    path: '/sales/configurations/telegram-bot',
    name: 'SalesTelegramBot',
    component: () => import('@/modules/sale/views/TelegramBotView.vue'),
    meta: { layout: 'sales', title: 'Telegram Bot', role: 'sale' }
  },
  {
    path: '/sales/configurations/telegram-bot/:id',
    name: 'TelegramGroupDetail',
    component: () => import('@/modules/sale/views/TelegramGroupDetailView.vue'),
    meta: { layout: 'sales', title: 'Telegram Group', role: 'sale' }
  },
  {
    path: '/sales/configurations/notifications',
    name: 'SalesNotifications',
    component: () => import('@/modules/sale/views/NotificationView.vue'),
    meta: { layout: 'sales', title: 'Notifications', role: 'sale' }
  },
  {
    path: '/sales/report/appointments',
    name: 'AppointmentReport',
    component: () => import('@/modules/sale/views/AppointmentReportView.vue'),
    meta: { layout: 'sales', title: 'Appointment Reports', role: 'sale' }
  },
  {
    path: '/sales/profile',
    name: 'SalesProfile',
    component: () => import('@/modules/auth/views/ProfileView.vue'),
    meta: { layout: 'sales', title: 'Profile Settings', role: 'sale' }
  }
]
