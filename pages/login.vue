<script setup lang="ts">
const route = useRoute();
const redirectTo = computed(() => {
  const r = route.query.redirect;
  return typeof r === 'string' && r.startsWith('/') ? r : '/';
});

const email = ref('');
const password = ref('');
const error = ref('');
const pending = ref(false);
const { loggedIn, refresh } = useAuth();

async function submit() {
  error.value = '';
  pending.value = true;
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
      credentials: 'include',
    });
    await refresh();
    await navigateTo(redirectTo.value);
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    error.value = err?.data?.message ?? err?.message ?? 'Login failed';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="max-w-xs mx-auto mt-8">
    <h1 class="text-2xl font-semibold mb-6">Log in</h1>
    <form @submit.prevent="submit">
      <div>
        <label for="email" class="block mb-1 font-medium">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="w-full px-3 py-2 mb-4 border border-gray-300 rounded box-border"
        />
      </div>
      <div>
        <label for="password" class="block mb-1 font-medium">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          class="w-full px-3 py-2 mb-4 border border-gray-300 rounded box-border"
        />
      </div>
      <p v-if="error" class="text-red-600 mb-4">{{ error }}</p>
      <button
        type="submit"
        :disabled="pending"
        class="px-4 py-2 bg-gray-800 text-white rounded border-0 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {{ pending ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
    <p class="mt-6 text-sm text-gray-500">
      No account? Use <code class="bg-gray-100 px-1 py-0.5 rounded">npm run db:seed</code>
      then log in with demo@example.com / demo12345
    </p>
  </div>
</template>
