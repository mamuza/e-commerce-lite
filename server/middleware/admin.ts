import { getSessionUser } from '~/server/utils/session';

/** Protect /api/admin/* — require authenticated session with role ADMIN. */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  if (!path.startsWith('/api/admin')) return;

  const user = await getSessionUser(event);
  if (!user) {
    throw createError({ status: 401, message: 'Unauthorized' });
  }
  if (user.role !== 'ADMIN') {
    throw createError({ status: 403, message: 'Forbidden' });
  }
  event.context.user = user;
});
