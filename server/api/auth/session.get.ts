import { getSessionUser } from '~/server/utils/session'

/** Returns current user or null. Use for auth state (SSR + client). */
export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  return { user: user ?? null }
})
