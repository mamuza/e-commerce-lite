<script setup lang="ts">
const { user, loggedIn, logout } = useAuth();
const { totalItemCount } = useCart();
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
    <header
      class="sticky top-0 z-10 px-4 py-3 border-b border-gray-200 bg-white/95 backdrop-blur sm:px-5 sm:py-4"
    >
      <div class="flex items-center justify-between gap-3 w-full max-w-4xl mx-auto px-4 sm:px-5">
        <NuxtLink
          to="/"
          class="font-semibold text-gray-900 no-underline truncate min-w-0 hover:text-gray-600"
        >
          E-Commerce Lite
        </NuxtLink>
        <nav class="flex shrink-0 items-center gap-2 sm:gap-4">
          <NuxtLink
            to="/cart"
            class="px-3 py-2 text-sm font-medium text-gray-700 no-underline rounded-md hover:bg-gray-100 active:bg-gray-200 touch-manipulation flex items-center gap-1.5"
          >
            Cart
            <span
              v-if="totalItemCount > 0"
              class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-medium bg-gray-200 text-gray-800 rounded-full"
            >
              {{ totalItemCount }}
            </span>
          </NuxtLink>
          <template v-if="loggedIn">
            <NuxtLink
              v-if="user?.role === 'ADMIN'"
              to="/dashboard/orders"
              class="px-3 py-2 text-sm font-medium text-gray-700 no-underline rounded-md hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/orders"
              class="px-3 py-2 text-sm font-medium text-gray-700 no-underline rounded-md hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
            >
              Orders
            </NuxtLink>
            <span
              class="hidden text-sm text-gray-500 sm:inline truncate max-w-[8rem] sm:max-w-[12rem]"
              :title="user?.email"
            >
              {{ user?.email }}
            </span>
            <button
              type="button"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
              @click="logout"
            >
              Log out
            </button>
          </template>
          <NuxtLink
            v-else
            to="/login"
            class="px-3 py-2 text-sm font-medium text-gray-700 no-underline rounded-md hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
          >
            Log in
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="flex-1 w-full max-w-4xl mx-auto px-4 py-5 sm:px-5 sm:py-6">
      <slot />
    </main>
  </div>
</template>
