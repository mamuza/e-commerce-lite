<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

type Order = {
  id: string
  userId: string
  userEmail: string
  totalCents: number
  status: string
  createdAt: string
  items: Array<{ productId: string; quantity: number; priceCents: number }>
}

const STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'] as const

const { data: orders, refresh } = await useFetch<Order[]>('/api/admin/orders', {
  key: 'admin-orders',
  credentials: 'include',
})

const updatingId = ref<string | null>(null)
const errorMessage = ref('')

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

async function updateStatus(order: Order, newStatus: string) {
  if (order.status === newStatus) return
  updatingId.value = order.id
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: { status: newStatus },
      credentials: 'include',
    })
    await refresh()
  } catch (e: unknown) {
    errorMessage.value = e && typeof e === 'object' && 'data' in e
      ? String((e as { data?: { message?: string } }).data?.message ?? 'Failed to update')
      : 'Failed to update order status'
  } finally {
    updatingId.value = null
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">Orders</h1>
    <p class="text-gray-600 text-sm mb-6">Manage order status.</p>

    <p v-if="errorMessage" class="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
      {{ errorMessage }}
    </p>

    <template v-if="!orders?.length">
      <p class="text-gray-500">No orders yet.</p>
    </template>
    <template v-else>
      <div class="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order / Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="order in orders" :key="order.id" class="bg-white hover:bg-gray-50">
              <td class="px-4 py-3">
                <p class="font-medium text-gray-900">{{ order.id.slice(-8) }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(order.createdAt) }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ order.userEmail }}</td>
              <td class="px-4 py-3 text-right font-medium">{{ (order.totalCents / 100).toFixed(2) }}</td>
              <td class="px-4 py-3">
                <select
                  :value="order.status"
                  :disabled="updatingId === order.id"
                  class="block w-full max-w-[10rem] rounded border border-gray-300 py-1.5 pl-2 pr-6 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-60"
                  @change="updateStatus(order, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
