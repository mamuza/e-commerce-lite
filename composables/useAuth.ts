/** Session user shape returned by /api/auth/session */
export type SessionUser = { id: string; email: string; role: string }

/**
 * Auth state for SSR and client. Fetches current user from /api/auth/session
 * (cookie sent automatically). Use in layout/pages for login/logout UI.
 */
export function useAuth() {
  const { data, refresh, status } = useFetch<{ user: SessionUser | null }>('/api/auth/session', {
    key: 'auth-session',
    credentials: 'include',
  })

  const user = computed(() => data.value?.user ?? null)
  const loggedIn = computed(() => !!user.value)

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    await refresh()
    await navigateTo('/')
  }

  return { user, loggedIn, status, logout, refresh }
}
