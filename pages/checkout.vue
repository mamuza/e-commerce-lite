<script setup lang="ts">
/** Product shape from GET /api/products (pricing from server only). */
type Product = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stockQuantity: number;
};

type CreateOrderResponse = {
  order: {
    id: string;
    totalCents: number;
    createdAt: string;
    items: Array<{ productId: string; quantity: number; priceCents: number }>;
  };
};

const { user, loggedIn, status: authStatus } = useAuth();
const { items, isEmpty, clear: clearCart } = useCart();

// Auth guard: redirect to login when auth is resolved and user is not logged in
watchEffect(async () => {
  if (authStatus.value !== 'success') return;
  if (!loggedIn.value) {
    await navigateTo('/login?redirect=/checkout', { replace: true });
  }
});

const cartIds = computed(() => items.value.map((i) => i.productId).filter(Boolean));
const idsQuery = computed(() => (cartIds.value.length ? cartIds.value.join(',') : null));

const { data: products } = await useFetch<Product[]>(
  () => (idsQuery.value ? `/api/products?ids=${idsQuery.value}` : null),
  { key: () => `checkout-products-${idsQuery.value ?? 'empty'}` }
);

const productMap = computed(() => {
  const map = new Map<string, Product>();
  for (const p of products.value ?? []) map.set(p.id, p);
  return map;
});

// Display total from server-fetched prices (for summary only; real total computed on server)
const displayTotalCents = computed(() => {
  let total = 0;
  for (const item of items.value) {
    const p = productMap.value.get(item.productId);
    if (p) total += p.priceCents * item.quantity;
  }
  return total;
});

const submitting = ref(false);
const errorMessage = ref<string | null>(null);

async function placeOrder() {
  if (isEmpty.value || submitting.value) return;
  errorMessage.value = null;
  submitting.value = true;
  try {
    const res = await $fetch<CreateOrderResponse>('/api/orders/create', {
      method: 'POST',
      credentials: 'include',
      body: { items: [...items.value] },
    });
    clearCart();
    await navigateTo({
      path: '/orders/success',
      query: { id: res.order.id, total: String(res.order.totalCents) },
    });
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    errorMessage.value =
      err?.data?.message ?? err?.message ?? 'Could not place order. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Checkout</h1>

    <template v-if="authStatus === 'pending'">
      <p class="text-gray-500">Loading…</p>
    </template>
    <template v-else-if="!loggedIn">
      <p class="text-gray-600">
        You must be logged in to checkout.
        <NuxtLink
          to="/login?redirect=/checkout"
          class="font-medium text-gray-900 underline hover:no-underline"
        >
          Log in
        </NuxtLink>
      </p>
    </template>
    <template v-else-if="isEmpty">
      <p class="text-gray-500">
        Your cart is empty.
        <NuxtLink to="/products" class="text-gray-700 underline hover:no-underline"
          >Browse products</NuxtLink
        >
      </p>
    </template>
    <template v-else>
      <div class="space-y-6">
        <section>
          <h2 class="text-lg font-medium text-gray-900 mb-2">Order summary</h2>
          <ul class="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            <li
              v-for="item in items"
              :key="item.productId"
              class="flex justify-between items-center gap-4 p-4 bg-white"
            >
              <template v-if="productMap.get(item.productId)">
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">
                    {{ productMap.get(item.productId)!.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ item.quantity }} ×
                    {{ (productMap.get(item.productId)!.priceCents / 100).toFixed(2) }}
                  </p>
                </div>
                <p class="text-sm font-medium text-gray-900 shrink-0">
                  {{
                    ((productMap.get(item.productId)!.priceCents * item.quantity) / 100).toFixed(2)
                  }}
                </p>
              </template>
              <template v-else>
                <span class="text-gray-500">Loading…</span>
              </template>
            </li>
          </ul>
          <p class="mt-2 text-right text-gray-700 font-medium">
            Total: {{ (displayTotalCents / 100).toFixed(2) }}
          </p>
          <p class="text-xs text-gray-500 mt-0.5">
            Final total is calculated on the server when you place the order.
          </p>
        </section>

        <p
          v-if="errorMessage"
          class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
        >
          {{ errorMessage }}
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none"
            :disabled="submitting"
            @click="placeOrder"
          >
            {{ submitting ? 'Placing order…' : 'Place order' }}
          </button>
          <NuxtLink
            to="/cart"
            class="inline-block px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to cart
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>
