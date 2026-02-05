import { invalidateSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  await invalidateSession(event)
  return { ok: true }
})
