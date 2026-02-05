<script setup lang="ts">
/** Order detail from GET /api/orders/:id */
type OrderDetail = {
  id: string
  totalCents: number
  status: string
  createdAt: string
  items: Array<{ productId: string; quantity: number; priceCents: number }>
}

const route = useRoute()
const orderId = computed(() => route.params.id as string)

const { data: order, status, error } = await useFetch<OrderDetail>(
  () => (orderId.value ? `/api/orders/${orderId.value}` : null),
  {
    key: () => `order-${orderId.value}`,
    credentials: 'include',
  }
)

const { loggedIn, status: authStatus } = useAuth()

watchEffect(async () => {
  if (authStatus.value !== 'success') return
  if (!loggedIn.value) {
    await navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath), { replace: true })
  }
})

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}
</script>

<template>
  <div>
    <NuxtLink
      to="/orders"
      class="inline-block text-sm text-gray-600 hover:text-gray-900 mb-4"
    >
      ← Order history
    </NuxtLink>

    <template v-if="authStatus === 'pending' || (loggedIn && status === 'pending')">
      <p class="text-gray-500">Loading…</p>
    </template>
    <template v-else-if="!loggedIn">
      <p class="text-gray-600">
        <NuxtLink to="/login" class="font-medium text-gray-900 underline hover:no-underline">
          Log in
        </NuxtLink>
        to view this order.
      </p>
    </template>
    <template v-else-if="error || !order">
      <p class="text-gray-500">Order not found or you don’t have access to it.</p>
    </template>
    <template v-else>
      <h1 class="text-2xl font-semibold mb-4">Order {{ order.id.slice(-8) }}</h1>
      <p class="text-sm text-gray-500 mb-4">{{ formatDate(order.createdAt) }}</p>
      <p class="text-sm text-gray-600 mb-4 capitalize">Status: {{ order.status.toLowerCase() }}</p>

      <ul class="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden mb-4">
        <li
          v-for="(item, idx) in order.items"
          :key="idx"
          class="flex justify-between items-center gap-4 p-4 bg-white"
        >
          <div>
            <p class="text-sm text-gray-500">Product {{ item.productId.slice(-8) }}</p>
            <p class="font-medium text-gray-900">{{ item.quantity }} × {{ (item.priceCents / 100).toFixed(2) }}</p>
          </div>
          <p class="font-medium text-gray-900">
            {{ ((item.priceCents * item.quantity) / 100).toFixed(2) }}
          </p>
        </li>
      </ul>

      <p class="text-right font-medium text-gray-900">
        Total: {{ (order.totalCents / 100).toFixed(2) }}
      </p>
    </template>
  </div>
</template>
