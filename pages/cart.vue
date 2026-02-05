<script setup lang="ts">
import type { Product } from '~/types/product';

const { items, totalItemCount, setQuantity, remove, isEmpty } = useCart();

const cartIds = computed(() => items.value.map((i) => i.productId).filter(Boolean));
const idsQuery = computed(() => (cartIds.value.length ? cartIds.value.join(',') : null));

const { data: productsData, status: productsStatus } = await useFetch<{
  products: Product[];
  totalPages: number;
}>(() => (idsQuery.value ? `/api/products?ids=${idsQuery.value}` : null), {
  key: () => `cart-products-${idsQuery.value ?? 'empty'}`,
});

const productsFromServer = computed(() => productsData.value?.products ?? []);

const productMap = computed(() => {
  return (productsFromServer.value ?? [])
    .map((i) => {
      const cartItem = items.value.find((ci) => ci.productId === i.id);
      return {
        ...i,
        quantity: cartItem ? cartItem.quantity : 0,
      };
    })
    .filter((item) => item.quantity > 0);
});

const productsLoaded = computed(
  () => productsStatus.value === 'success' || (productsStatus.value === 'idle' && !idsQuery.value)
);

function onQuantityChange(productId: string, value: string) {
  const n = parseInt(value, 10);
  if (!Number.isNaN(n)) setQuantity(productId, Math.max(1, n));
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Cart</h1>
    <p v-if="isEmpty" class="text-gray-500">
      Your cart is empty.
      <NuxtLink to="/products" class="text-gray-700 underline hover:no-underline"
        >Browse products</NuxtLink
      >
    </p>
    <div v-else class="space-y-4">
      <ul class="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        <li
          v-for="item in productMap"
          :key="item.id"
          class="flex flex-wrap items-center gap-3 sm:gap-4 p-4 bg-white"
        >
          <template v-if="item.id">
            <div class="flex-1 min-w-0">
              <NuxtLink
                :to="`/products/${item.id}`"
                class="font-medium text-gray-900 hover:text-gray-600 no-underline"
              >
                {{ item.name }}
              </NuxtLink>
              <p class="text-sm text-gray-500 mt-0.5">
                {{ (item.priceCents / 100).toFixed(2) }} each
              </p>
            </div>
            <div class="flex items-center gap-2">
              <label class="sr-only" :for="`qty-${item.id}`">Quantity</label>
              <input
                :id="`qty-${item.id}`"
                type="number"
                min="1"
                :max="item.stockQuantity"
                :value="item.quantity"
                class="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-md text-center"
                @change="(e) => onQuantityChange(item.id, (e.target as HTMLInputElement).value)"
              />
              <button
                type="button"
                class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                @click="remove(item.id)"
              >
                Remove
              </button>
            </div>
          </template>
          <template v-else>
            <div class="flex-1 min-w-0">
              <span class="text-gray-500">{{
                productsLoaded ? 'Product unavailable' : 'Loading…'
              }}</span>
            </div>
            <button
              type="button"
              class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
              @click="remove(item.id)"
            >
              Remove
            </button>
          </template>
        </li>
      </ul>
      <p class="text-sm text-gray-500">
        {{ totalItemCount }} item{{ totalItemCount === 1 ? '' : 's' }} in cart.
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink
          to="/checkout"
          class="inline-block px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
        >
          Proceed to checkout
        </NuxtLink>
        <NuxtLink to="/products" class="inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Continue shopping
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
