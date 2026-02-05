import { prisma } from '~/server/utils/prisma';
import { OrderStatus } from '@prisma/client';

/** PATCH /api/admin/orders/:id — update order status (admin only). */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ status: 400, message: 'Missing order id' });
  }

  const body = await readBody<{ status?: string }>(event).catch(() => ({}));
  const status = body?.status;
  if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
    throw createError({
      status: 400,
      message: 'Invalid or missing status. Use: PENDING, PAID, SHIPPED, CANCELLED',
    });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });
  return order;
});
