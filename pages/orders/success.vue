<script setup lang="ts">
const route = useRoute()
const orderId = computed(() => (route.query.id as string) ?? '')
const totalCents = computed(() => {
  const t = route.query.total
  const n = typeof t === 'string' ? parseInt(t, 10) : NaN
  return Number.isNaN(n) ? 0 : n
})
const displayTotal = computed(() => (totalCents.value / 100).toFixed(2))
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Order confirmed</h1>
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-6 max-w-md">
      <p class="text-gray-800 font-medium mb-1">
        Thank you for your order.
      </p>
      <p v-if="orderId" class="text-sm text-gray-600 mb-2">
        Order ID: <code class="bg-white px-1.5 py-0.5 rounded border border-gray-200">{{ orderId }}</code>
      </p>
      <p v-if="totalCents > 0" class="text-sm text-gray-600">
        Total: {{ displayTotal }}
      </p>
    </div>
    <div class="mt-6 flex flex-wrap gap-3">
      <NuxtLink
        to="/products"
        class="inline-block px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
      >
        Continue shopping
      </NuxtLink>
      <NuxtLink
        to="/orders"
        class="inline-block px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        View order history
      </NuxtLink>
    </div>
  </div>
</template>
