export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/views/LoginView.vue'),
    meta: { layout: 'none' }
  },
  {
    path: '/otp',
    name: 'OTP',
    component: () => import('@/modules/auth/views/OTPView.vue'),
    meta: { layout: 'none' }
  },
  {
    path: '/google/callback',
    name: 'GoogleCallback',
    component: () => import('@/modules/auth/views/GoogleCallbackView.vue'),
    meta: { layout: 'none' }
  },
  {
    path: '/feedback/:token',
    name: 'ClientFeedback',
    component: () => import('@/modules/shared/views/FeedbackView.vue'),
    meta: { layout: 'none' }
  }
]
