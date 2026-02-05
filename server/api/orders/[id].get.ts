import { prisma } from '~/server/utils/prisma';

/**
 * GET /api/orders/:id — order detail only if it belongs to current user. Auth required.
 */
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ status: 401, message: 'Unauthorized' });
  }

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ status: 400, message: 'Bad Request' });
  }

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        select: {
          productId: true,
          quantity: true,
          priceCents: true,
        },
      },
    },
  });

  if (!order) {
    throw createError({ status: 404, message: 'Not Found' });
  }

  return {
    id: order.id,
    totalCents: order.totalCents,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items,
  };
});
