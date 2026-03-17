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
  }
]
