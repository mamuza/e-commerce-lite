<script setup lang="ts">
import type { Product } from '~/types/product';

useHead({
  title: 'Products - My Shop',
  meta: [
    {
      name: 'description',
      content: 'Browse our selection of products available for purchase.',
    },
  ],
});

const page = ref(1);
const sortBy = ref<'default' | 'name_asc' | 'price_desc' | 'price_asc'>('default');
const searchQuery = ref('');

const { data, error, status } = await useFetch<{
  products: Product[];
  totalPages: number;
}>(() => `/api/products?page=${page.value}&sort=${sortBy.value}&q=${searchQuery.value}`, {
  key: `products-list-page-${page.value}-sort-${sortBy.value}-q-${searchQuery.value}`,
  watch: [page, sortBy, searchQuery],
});

const products = computed(() => data.value?.products ?? []);
const totalPages = computed(() => data.value?.totalPages ?? 1);

onMounted(() => console.log(document.cookie));
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Products</h1>
    <div v-if="products?.length" class="flex flex-wrap items-center justify-between my-4">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search products..."
        class="border border-gray-300 rounded px-3 py-2 text-sm mr-4"
      />
      <select v-model="sortBy" class="border border-gray-300 rounded px-3 py-2 text-sm">
        <option value="default">Default sorting</option>
        <option value="name_asc">Sort by name (A-Z)</option>
        <option value="price_asc">Sort by price (low to high)</option>
        <option value="price_desc">Sort by price (high to low)</option>
      </select>
    </div>
    <div v-if="error" class="text-red-600">
      {{ error.message }}
    </div>
    <div v-else-if="status === 'pending'" class="text-gray-500">Loading…</div>
    <ul v-else-if="products?.length" class="grid gap-4 sm:grid-cols-3">
      <li
        v-for="p in products"
        :key="p.id"
        class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
      >
        <ProductCard :product="p" :onClick="() => console.log('clicked')" />
      </li>
    </ul>
    <p v-else class="text-gray-500">
      No products yet. Run <code class="bg-gray-100 px-1 py-0.5 rounded">npm run db:seed</code> to
      add samples.
    </p>
    <div v-if="searchQuery && !products.length">
      <button
        @click="searchQuery = ''"
        class="ml-4 px-3 py-1 rounded border border-gray-300 bg-white text-sm"
      >
        Clear search
        <i
          ><strong>{{ searchQuery }}</strong></i
        >
      </button>
    </div>
    <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center space-x-2">
      <button
        :disabled="page === 1"
        @click="page--"
        class="px-3 py-1 rounded border border-gray-300 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span class="text-sm text-gray-700"> Page {{ page }} of {{ totalPages }} </span>
      <button
        :disabled="page === totalPages"
        @click="page++"
        class="px-3 py-1 rounded border border-gray-300 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
</template>
