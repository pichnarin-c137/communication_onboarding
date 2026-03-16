import { createRouter, createWebHistory } from 'vue-router'
import { setupRouteGuards } from '@/core/router/guards.js'
import authRoutes from '@/modules/auth/routes.js'
import saleRoutes from '@/modules/sale/routes.js'
import trainerRoutes from '@/modules/trainer/routes.js'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  ...authRoutes,
  ...saleRoutes,
  ...trainerRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

setupRouteGuards(router)

export default router
