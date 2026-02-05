<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
// await navigateTo('/dashboard/orders', { replace: true })
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">Dashboard</h1>
    <p class="text-gray-600 text-sm mb-6">Welcome to the admin dashboard. Use the links below to manage the store.</p>
  </div>
  <div class="grid grid-cols-3 gap-4">
    <NuxtLink to="/dashboard/orders">
      <div class="flex items-center justify-center h-12 w-full bg-gray-100 rounded-md hover:bg-gray-200">
        Orders
      </div>
    </NuxtLink>
    <NuxtLink to="/dashboard/products"><div class="flex items-center justify-center h-12 w-full bg-gray-100 rounded-md hover:bg-gray-200">
      Products
    </div></NuxtLink>
    <NuxtLink to="/dashboard/analytics">    <div class="flex items-center justify-center h-12 w-full bg-gray-100 rounded-md hover:bg-gray-200">
      Analytics
    </div></NuxtLink>
  </div>
</template>
