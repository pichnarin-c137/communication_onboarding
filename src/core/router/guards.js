import { useAuthStore } from '@/modules/auth/store/auth.store'

export function setupRouteGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const requiredRole = to.meta?.role

    if (!requiredRole) return next()

    // Restore session via HttpOnly cookie on page refresh
    if (!authStore.isAuthenticated) {
      await authStore.bootstrapSession()   // silent — never throws
    }

    if (!authStore.isAuthenticated) return next('/login')

    const userRole = authStore.user?.role
    // Admin can access all protected routes
    if (userRole === 'admin') return next()
    if (requiredRole === 'sale' && userRole === 'trainer') return next('/trainer')
    if (requiredRole === 'trainer' && userRole === 'sale') return next('/sales')

    next()
  })
}
