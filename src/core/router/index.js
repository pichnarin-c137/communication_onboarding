import { createRouter, createWebHistory } from 'vue-router'
import { setupRouteGuards } from '@/core/router/guards.js'
import authRoutes from '@/modules/auth/routes.js'
import saleRoutes from '@/modules/sale/routes.js'
import trainerRoutes from '@/modules/trainer/routes.js'
import adminRoutes from '@/modules/admin/routes.js'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/modules/shared/views/LandingView.vue'),
    meta: { layout: 'none' }
  },
  ...authRoutes,
  ...saleRoutes,
  ...trainerRoutes,
  ...adminRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Guards are set up after Pinia is installed — see main.js
export function installGuards() {
  setupRouteGuards(router)
}

export default router
