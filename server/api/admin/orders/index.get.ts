import { prisma } from '~/server/utils/prisma'

/** GET /api/admin/orders — all orders (admin only). */
export default defineEventHandler(async () => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      totalCents: true,
      status: true,
      createdAt: true,
      user: { select: { email: true } },
      items: {
        select: {
          productId: true,
          quantity: true,
          priceCents: true,
        },
      },
    },
  })
  return orders.map((o) => ({
    id: o.id,
    userId: o.userId,
    userEmail: o.user.email,
    totalCents: o.totalCents,
    status: o.status,
    createdAt: o.createdAt,
    items: o.items,
  }))
})
