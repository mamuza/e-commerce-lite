<script setup lang="ts">
import type { Product } from '~/types/product';

defineProps<{
  product: Product;
  onClick: () => void;
}>();
</script>

<template>
  <NuxtLink
    :to="`/products/${product.id}`"
    class="block no-underline text-inherit"
    @click="onClick"
  >
    <h2 class="font-medium text-gray-900 mb-1">{{ product.name }}</h2>
    <p v-if="product.description" class="text-sm text-gray-600 line-clamp-2 mb-2">
      {{ product.description }}
    </p>
    <p class="text-sm font-medium text-gray-900">
      {{ (product.priceCents / 100).toFixed(2) }}
      <span class="font-normal text-gray-500">each</span>
    </p>
    <p class="text-xs text-gray-500 mt-1">
      {{ product.stockQuantity > 0 ? `In stock (${product.stockQuantity})` : 'Out of stock' }}
    </p>
  </NuxtLink>
</template>
