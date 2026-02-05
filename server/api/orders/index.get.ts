import { prisma } from '~/server/utils/prisma';

/**
 * GET /api/orders — current user's orders only. Auth required via auth-orders middleware.
 */
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ status: 401, message: 'Unauthorized' });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      totalCents: true,
      status: true,
      createdAt: true,
      items: {
        select: {
          productId: true,
          quantity: true,
          priceCents: true,
        },
      },
    },
  });

  return orders;
});
