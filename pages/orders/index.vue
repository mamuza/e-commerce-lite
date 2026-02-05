<script setup lang="ts">
/** Order shape from GET /api/orders */
type Order = {
  id: string
  totalCents: number
  status: string
  createdAt: string
  items: Array<{ productId: string; quantity: number; priceCents: number }>
}

const { data: orders, status } = await useFetch<Order[]>('/api/orders', {
  key: 'orders-list',
  credentials: 'include',
})

const { loggedIn, status: authStatus } = useAuth()

// Redirect to login if not authenticated
watchEffect(async () => {
  if (authStatus.value !== 'success') return
  if (!loggedIn.value) {
    await navigateTo('/login?redirect=/orders', { replace: true })
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
    <h1 class="text-2xl font-semibold mb-4">Order history</h1>

    <template v-if="authStatus === 'pending' || (loggedIn && status === 'pending')">
      <p class="text-gray-500">Loading…</p>
    </template>
    <template v-else-if="!loggedIn">
      <p class="text-gray-600">
        <NuxtLink to="/login?redirect=/orders" class="font-medium text-gray-900 underline hover:no-underline">
          Log in
        </NuxtLink>
        to view your orders.
      </p>
    </template>
    <template v-else-if="!orders?.length">
      <p class="text-gray-500">You have no orders yet.</p>
      <NuxtLink
        to="/products"
        class="inline-block mt-3 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Browse products
      </NuxtLink>
    </template>
    <template v-else>
      <ul class="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        <li
          v-for="order in orders"
          :key="order.id"
          class="p-4 bg-white hover:bg-gray-50"
        >
          <NuxtLink
            :to="`/orders/${order.id}`"
            class="flex flex-wrap items-center justify-between gap-3 no-underline text-gray-900"
          >
            <div>
              <p class="font-medium">Order {{ order.id.slice(-8) }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium">{{ (order.totalCents / 100).toFixed(2) }}</p>
              <p class="text-xs text-gray-500 capitalize">{{ order.status.toLowerCase() }}</p>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </div>
</template>
