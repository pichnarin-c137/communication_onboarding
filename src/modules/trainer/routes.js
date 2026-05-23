export default [
  {
    path: '/trainer',
    name: 'TrainerDashboard',
    component: () => import('@/modules/trainer/views/DashboardView.vue'),
    meta: { layout: 'trainer', title: 'Dashboard', role: 'trainer' }
  },
  {
    path: '/trainer/appointments',
    name: 'TrainerAppointmentList',
    component: () => import('@/modules/trainer/views/AppointmentListView.vue'),
    meta: { layout: 'trainer', title: 'My Appointments', role: 'trainer' }
  },
  {
    path: '/trainer/appointments/create',
    name: 'TrainerCreateAppointment',
    component: () => import('@/modules/sale/views/CreateAppointmentView.vue'),
    meta: { layout: 'trainer', title: 'Create Appointment', role: 'trainer' }
  },
  {
    path: '/trainer/appointments/:id',
    name: 'TrainerAppointmentDetail',
    component: () => import('@/modules/trainer/views/AppointmentDetailView.vue'),
    meta: { layout: 'trainer', title: 'Appointment Detail', role: 'trainer' } 
  },
  {
    path: '/trainer/appointments/:id/complete',
    name: 'CompleteAppointment',
    component: () => import('@/modules/trainer/views/CompleteAppointmentView.vue'),
    meta: { layout: 'trainer', title: 'Complete Appointment', role: 'trainer' }
  },
  {
    path: '/trainer/onboarding',
    name: 'TrainerOnboardingList',
    component: () => import('@/modules/trainer/views/OnboardingListView.vue'),
    meta: { layout: 'trainer', title: 'Onboarding', role: 'trainer' }
  },
  {
    path: '/trainer/onboarding/:id',
    name: 'TrainerOnboardingDetail',
    component: () => import('@/modules/trainer/views/OnboardingDetailView.vue'),
    meta: { layout: 'trainer', title: 'Onboarding Detail', role: 'trainer' }
  },
  {
    path: '/trainer/onboarding/:id/sales',
    name: 'TrainerOnboardingSalesDetail',
    component: () => import('@/modules/trainer/views/ClientSalesDetailView.vue'),
    meta: { layout: 'trainer', title: 'Client Sales', role: 'trainer' }
  },
  {
    path: '/trainer/lessons',
    name: 'TrainerLessons',
    component: () => import('@/modules/trainer/views/LessonsView.vue'),
    meta: { layout: 'trainer', title: 'Lessons Playlist', role: 'trainer' }
  },
  {
    path: '/trainer/analytics',
    name: 'TrainerAnalytics',
    component: () => import('@/modules/trainer/views/AnalyticsView.vue'),
    meta: { layout: 'trainer', title: 'My Scorecard', role: 'trainer' }
  },
  {
    path: '/trainer/calendar',
    name: 'TrainerCalendar',
    component: () => import('@/modules/trainer/views/CalendarView.vue'),
    meta: { layout: 'trainer', title: 'Calendar', role: 'trainer', fullWidth: true }
  },
  {
    path: '/trainer/profile',
    name: 'TrainerProfile',
    component: () => import('@/modules/auth/views/ProfileView.vue'),
    meta: { layout: 'trainer', title: 'Profile Settings', role: 'trainer' }
  },
  {
    path: '/trainer/notifications',
    name: 'TrainerNotifications',
    component: () => import('@/modules/trainer/views/NotificationView.vue'),
    meta: { layout: 'trainer', title: 'Notifications', role: 'trainer' }
  },
  {
    path: '/trainer/settings',
    name: 'TrainerSettings',
    component: () => import('@/modules/shared/views/SettingsView.vue'),
    meta: { layout: 'trainer', title: 'Settings', role: 'trainer' }
  }
]
