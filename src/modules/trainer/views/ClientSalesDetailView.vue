<template>
    <div class="space-y-5 mt-3">
        <div class="flex items-center gap-3">
            <button @click="router.back()"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                <ChevronLeftIcon class="w-5 h-5" />
            </button>
            <div class="min-w-0 flex-1">
                <h1 class="text-lg font-semibold text-gray-900 truncate">
                    {{ onboarding?.client?.company_name || 'Client Sales' }}
                </h1>
                <p class="text-xs text-gray-400 font-mono mt-0.5">{{ onboarding?.request_code || '—' }}</p>
            </div>
            <div class="text-right">
                <p class="text-xs text-gray-400 uppercase tracking-wider">Total Sales</p>
                <p class="text-lg font-semibold text-gray-900">{{ sales.length }}</p>
            </div>
        </div>

        <SkeletonLoader v-if="loading" type="cards" :count="3" />

        <template v-else-if="onboarding">
            <div class="bg-white border border-gray-200 rounded-xl p-5">
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <p class="text-xs uppercase tracking-wider text-gray-400">Salesperson</p>
                        <p class="text-sm font-semibold text-gray-900">
                            {{ latestSale?.createdBy ? `${latestSale.createdBy.first_name}
                            ${latestSale.createdBy.last_name}` : '—' }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-wider text-gray-400">Latest Order</p>
                        <p class="text-sm font-mono font-semibold text-primary">{{ latestSale?.sale_order_code || '—' }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-wider text-gray-400">Client</p>
                        <p class="text-sm font-semibold text-gray-900">{{ onboarding.client?.company_name || '—' }}</p>
                    </div>
                </div>
            </div>

            <div v-if="sales.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p class="text-sm font-semibold text-gray-700">No sales records found</p>
                <p class="text-xs text-gray-500 mt-1">No sale orders have been created for this client yet.</p>
            </div>

            <div v-else class="grid gap-4 lg:grid-cols-2">
                <article v-for="sale in sales" :key="sale.id"
                    class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-primary/30 transition-colors">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-xs uppercase tracking-wider text-gray-400">Sale Order</p>
                            <p class="font-mono text-sm font-semibold text-primary">{{ sale.sale_order_code || sale.id
                            }}</p>
                        </div>
                        <span v-if="sale.id === latestSale?.id"
                            class="text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                            Latest
                        </span>
                    </div>

                    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                            <p class="text-xs text-gray-400">Salesperson</p>
                            <p class="font-medium text-gray-900">
                                {{ sale.createdBy ? `${sale.createdBy.first_name} ${sale.createdBy.last_name}` : '—' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">Amount</p>
                            <p class="font-medium text-gray-900">{{ formatCurrency(sale.content?.amount ?? 0) }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">Acc Created At</p>
                            <p class="font-medium text-gray-900">{{ sale.content?.acc_created_at ?
                                formatDateTime(sale.content.acc_created_at) : '—' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">Acc Expired At</p>
                            <p class="font-medium text-gray-900">{{ sale.content?.acc_expired_at ?
                                formatDateTime(sale.content.acc_expired_at) : '—' }}</p>
                        </div>
                    </div>

                    <div class="mt-4 space-y-2">
                        <p class="text-xs text-gray-400 uppercase tracking-wider">Products</p>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="(product, index) in sale.content?.products || []" :key="`${sale.id}-${index}`"
                                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-700">
                                <span class="font-medium">{{ product.name }}</span>
                                <span class="text-gray-400">x{{ product.quantity }}</span>
                                <span class="text-gray-500">{{ formatCurrency(product.price) }}</span>
                            </span>
                        </div>
                    </div>

                    <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600">
                        <div>
                            <p class="text-gray-400">Price</p>
                            <p class="font-medium text-gray-900">{{ formatCurrency(sale.content?.price ?? 0) }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400">Quantity</p>
                            <p class="font-medium text-gray-900">{{ sale.content?.quantity ?? 0 }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400">Discount</p>
                            <p class="font-medium text-gray-900">{{ formatCurrency(sale.content?.discount_amount ?? 0)
                            }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400">VAT</p>
                            <p class="font-medium text-gray-900">{{ formatPercent(sale.content?.vat ?? 0) }}</p>
                        </div>
                    </div>

                    <div
                        class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>Created {{ formatDateTime(sale.created_at) }}</span>
                        <span class="font-medium text-gray-700">{{ sale.client?.company_name ||
                            onboarding.client?.company_name }}</span>
                    </div>
                </article>
            </div>
        </template>

        <div v-else-if="!loading" class="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p class="text-sm font-semibold text-gray-700">Client sales not found</p>
            <p class="text-xs text-gray-500 mt-1">This record may have been removed or does not exist.</p>
            <button @click="router.back()" class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Go Back
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { onboardingService } from '@/modules/shared/services/onboardingService.js'
import { useDateTime } from '@/modules/shared/composables/useDateTime.js'
import SkeletonLoader from '@/modules/shared/components/SkeletonLoader.vue'

const route = useRoute()
const router = useRouter()
const { formatDate, formatDateTimeFromISO } = useDateTime()

const onboarding = ref(null)
const loading = ref(true)

const sales = computed(() => onboarding.value?.sales || [])
const latestSale = computed(() => sales.value[0] || null)

function formatDateTime(val) {
    if (!val) return '—'
    try { return formatDateTimeFromISO(val) } catch { return formatDate(val) }
}

function formatCurrency(value) {
    const amount = Number(value || 0)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount)
}

function formatPercent(value) {
    const percent = Number(value || 0) * 100
    return `${percent.toFixed(percent % 1 === 0 ? 0 : 2)}%`
}

async function load() {
    loading.value = true
    try {
        const response = await onboardingService.getOnboardingSales(route.params.id)
        onboarding.value = response.data
    } catch {
        onboarding.value = null
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>
