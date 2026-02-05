import { getSessionUser } from '~/server/utils/session';

/** Protect /api/orders/* — require authenticated session; return 401 otherwise. */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  if (!path.startsWith('/api/orders')) return;

  const user = await getSessionUser(event);
  if (!user) {
    throw createError({ status: 401, message: 'Unauthorized' });
  }
  event.context.user = user;
});
