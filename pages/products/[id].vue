<script setup lang="ts">
import type { Product } from '~/types/product';

const route = useRoute();
const id = computed(() => (route.params.id as string) || '');

const {
  data: product,
  error,
  status,
} = await useFetch<Product>(() => `/api/products/${id.value}`, {
  key: () => `product-${id.value}`,
});

const { add: addToCart, getQuantity } = useCart();
const addQty = ref(1);

function addToCartSubmit() {
  if (!product.value?.id || product.value.stockQuantity < 1) return;
  const qty = Math.max(1, Math.floor(Number(addQty.value)) || 1);
  addToCart(product.value.id, Math.min(qty, product.value.stockQuantity));
  addQty.value = 1;
}

const inStock = computed(() => (product.value?.stockQuantity ?? 0) > 0);
const inCart = computed(() => getQuantity(product.value?.id ?? '') > 0);

useHead({
  title: product.value ? `${product.value.name} - My Shop` : 'Product Not Found - My Shop',
  meta: [
    {
      name: 'description',
      content: product.value?.description ?? 'Product details page.',
    },
  ],
});
</script>

<template>
  <div>
    <NuxtLink
      to="/products"
      class="text-sm text-gray-600 no-underline hover:text-gray-900 mb-4 inline-block"
    >
      ← Back to products
    </NuxtLink>
    <div v-if="error" class="text-red-600">
      <template v-if="error.status === 404">Product not found.</template>
      <template v-else>{{ error.message }}</template>
    </div>
    <div v-else-if="status === 'pending'" class="text-gray-500">Loading…</div>
    <template v-else-if="product">
      <h1 class="text-2xl font-semibold mb-2">{{ product.name }}</h1>
      <p v-if="product.description" class="text-gray-600 mb-4">{{ product.description }}</p>
      <p class="text-lg font-medium text-gray-900 mb-1">
        {{ (product.priceCents / 100).toFixed(2) }}
      </p>
      <p class="text-sm text-gray-500 mb-4">
        {{ product.stockQuantity > 0 ? `In stock (${product.stockQuantity})` : 'Out of stock' }}
      </p>
      <div v-if="inStock" class="flex flex-wrap items-center gap-3">
        <label class="text-sm text-gray-600" for="add-qty">Quantity</label>
        <input
          id="add-qty"
          v-model.number="addQty"
          type="number"
          min="1"
          :max="product.stockQuantity"
          class="w-20 px-2 py-2 text-sm border border-gray-300 rounded-md"
        />
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
          @click="addToCartSubmit"
        >
          Add to cart
        </button>
        <span v-if="inCart" class="text-sm text-gray-500">In cart</span>
      </div>
    </template>
  </div>
</template>
