<script setup lang="ts">
const { user, loggedIn, status: authStatus } = useAuth()

// Admin-only: redirect to home if not logged in or not admin
watchEffect(async () => {
  if (authStatus.value !== 'success') return
  if (!loggedIn.value || user.value?.role !== 'ADMIN') {
    await navigateTo('/', { replace: true })
  }
})

const nav = [
  { to: '/dashboard/orders', label: 'Orders' },
  { to: '/dashboard/products', label: 'Products' },
  { to: '/dashboard/analytics', label: 'Analytics' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
    <header class="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white sm:px-5 sm:py-4">
      <div class="flex items-center justify-between gap-3 w-full max-w-5xl mx-auto px-4 sm:px-5 ">
      <div class="flex items-center gap-4">
        <NuxtLink to="/dashboard" class="font-semibold text-gray-900 no-underline hover:text-gray-600">
          Dashboard
        </NuxtLink>
        <nav class="flex items-center gap-1">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="px-3 py-2 text-sm font-medium text-gray-600 no-underline rounded-md hover:bg-gray-100 hover:text-gray-900"
            active-class="bg-gray-200 text-gray-900"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
      <NuxtLink
        to="/"
        class="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Back to store
      </NuxtLink></div>
    </header>
    <main class="flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:px-5 sm:py-8">
      <slot v-if="user?.role === 'ADMIN'" />
      <div v-else class="py-12 text-center text-gray-500">
        Loading…
      </div>
    </main>
  </div>
</template>
